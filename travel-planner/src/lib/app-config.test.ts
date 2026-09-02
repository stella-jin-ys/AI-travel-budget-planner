import { describe, expect, it } from "vitest";
import { appConfig } from "./app-config";

describe("appConfig", () => {
  it("labels the first release and its data honestly", () => {
    expect(appConfig).toEqual({
      name: "AI Travel Budget Planner",
      market: "Europe-first",
      dataMode: "ai",
    });
  });
});
