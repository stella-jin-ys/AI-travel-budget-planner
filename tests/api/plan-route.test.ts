import { afterEach, describe, expect, it, vi } from "vitest";
import { maxDuration, POST } from "@/app/api/plan/route";

const supabaseInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: vi.fn(() => ({ insert: supabaseInsert })) })),
}));

function tripRequest() {
  return new Request("http://localhost/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin: "Lund",
      destination: "France",
      startDate: "2027-02-20",
      endDate: "2027-02-27",
      travelers: [{ id: "adult-1", name: "Adult", age: 35, eligibility: ["adult"] }],
      interests: ["activities"],
      currency: "SEK",
    }),
  });
}

function groundedPlan() {
  return {
    title: "Lund to Paris travel plan",
    currency: "SEK",
    items: [{
      id: "train",
      section: "travel",
      label: "Lund to Paris rail journey",
      required: true,
      selectedAlternativeId: "sncf",
      connectionFeasible: true,
      alternatives: [{
        id: "sncf",
        label: "Train via Copenhagen and Hamburg",
        category: "transport",
        travelerCosts: { "adult-1": { amount: "2450.00", currency: "SEK" } },
        covered: false,
        optional: false,
        evidence: {
          status: "recent",
          supplierName: "SNCF Connect",
          checkedAt: "2026-09-02T10:00:00.000Z",
          sourceUrl: "https://www.sncf-connect.com/",
          reason: "Search-grounded indicative fare",
          synthetic: false,
        },
        details: [
          { label: "Departure", value: "Lund Central 07:15" },
          { label: "Arrival", value: "Paris Gare du Nord 21:05" },
        ],
        links: [{ label: "Book with SNCF Connect", url: "https://www.sncf-connect.com/" }],
      }],
    }],
    days: [{
      id: "day-1",
      date: "2027-02-20",
      title: "Travel to Paris",
      items: [
        { id: "depart", planItemId: "train", label: "Depart Lund Central", startsAt: "2027-02-20T07:15", endsAt: "2027-02-20T07:30" },
        { id: "arrive", planItemId: "train", label: "Arrive Paris Gare du Nord", startsAt: "2027-02-20T21:05", endsAt: "2027-02-20T21:20" },
      ],
    }],
    completeSections: ["overview", "travel", "stay", "days", "food", "budget"],
    contingencyRate: "0.10",
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.AI_PROVIDER;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  supabaseInsert.mockReset();
  supabaseInsert.mockResolvedValue({ error: null });
});

describe("POST /api/plan", () => {
  it("allows enough time for a free-model response on Vercel", () => {
    expect(maxDuration).toBe(300);
  });

  it("makes one Gemini request without falling back to another provider", async () => {
    process.env.GEMINI_API_KEY = "gemini-test-key";
    process.env.OPENROUTER_API_KEY = "openrouter-test-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: { message: "Provider unavailable" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(tripRequest());

    expect(response.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
  });

  it("makes one OpenRouter request when Gemini is not configured", async () => {
    process.env.OPENROUTER_API_KEY = "openrouter-test-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "Provider rate limit reached" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(tripRequest());
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "AI model is overloaded. Try again later." });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(requestBody.model).toBe("openai/gpt-oss-20b:free");
    expect(requestBody.max_tokens).toBe(4500);
  });

  it("uses configured OpenRouter as the single provider when Gemini is also configured", async () => {
    process.env.AI_PROVIDER = "openrouter";
    process.env.GEMINI_API_KEY = "gemini-test-key";
    process.env.OPENROUTER_API_KEY = "openrouter-test-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "Provider rate limit reached" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await POST(tripRequest());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://openrouter.ai/api/v1/chat/completions");
  });

  it("grounds one Gemini request and preserves validated details without exposing the raw response", async () => {
    process.env.GEMINI_API_KEY = "gemini-test-key";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        model: "gemini-3.7-flash",
        steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(groundedPlan()) }] }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(tripRequest());
    const result = await response.json();
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requestBody.model).toBe("gemini-3.7-flash");
    expect(requestBody.tools).toEqual([{ type: "google_search" }]);
    expect(requestBody.response_format.mime_type).toBe("application/json");
    expect(result.plan.items[0].alternatives[0]).toEqual(expect.objectContaining({
      details: [{ label: "Departure", value: "Lund Central 07:15" }, { label: "Arrival", value: "Paris Gare du Nord 21:05" }],
      links: [{ label: "Book with SNCF Connect", url: "https://www.sncf-connect.com/" }],
    }));
    expect(result).not.toHaveProperty("raw");
  });

  it("returns a valid AI plan when configured persistence fails", async () => {
    process.env.GEMINI_API_KEY = "gemini-test-key";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
    supabaseInsert.mockResolvedValueOnce({ error: { message: "database unavailable" } });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        model: "gemini-3.7-flash",
        steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(groundedPlan()) }] }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(tripRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({
      plan: expect.objectContaining({ title: "Lund to Paris travel plan" }),
      saved: false,
    }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns a valid AI plan when Supabase persistence is not configured", async () => {
    process.env.GEMINI_API_KEY = "gemini-test-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        model: "gemini-3.7-flash",
        steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(groundedPlan()) }] }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(tripRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({
      plan: expect.objectContaining({ title: "Lund to Paris travel plan" }),
      saved: false,
    }));
  });

  it("identifies the missing trip fields before calling an AI provider", async () => {
    process.env.GEMINI_API_KEY = "gemini-test-key";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(new Request("http://localhost/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Please complete the trip brief: origin, start date, end date, and travelers.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
