import { afterEach, describe, expect, it, vi } from "vitest";
import type { TripBrief } from "@/features/trips/domain/trip";
import { AITripProvider } from "@/features/trips/providers/ai-provider";

const brief = {} as TripBrief;

describe("AI trip provider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports an unavailable endpoint when the host returns an HTML page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("<html><head><title>Not found</title></head></html>", {
        status: 404,
        headers: { "content-type": "text/html" },
      }),
    ));

    await expect(new AITripProvider().search(brief)).rejects.toThrow(
      "The AI planner endpoint is unavailable on this deployment.",
    );
  });

  it("reports an unavailable endpoint when a static host rejects the API without a content type", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("<html><body>405 Not Allowed</body></html>", { status: 405 }),
    ));

    await expect(new AITripProvider().search(brief)).rejects.toThrow(
      "The AI planner endpoint is unavailable on this deployment.",
    );
  });
});
