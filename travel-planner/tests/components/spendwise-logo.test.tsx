import { describe, expect, it } from "vitest";
import { spendwiseLogoSrc } from "@/features/trips/components/spendwise-logo";

describe("Spendwise logo asset", () => {
  it("keeps the asset under the deployed base path", () => {
    expect(spendwiseLogoSrc("/AI-travel-budget-planner")).toBe(
      "/AI-travel-budget-planner/spendwise-butterfly-logo-icon-transparent.png",
    );
  });

  it("uses the root asset path for the server deployment", () => {
    expect(spendwiseLogoSrc("")).toBe("/spendwise-butterfly-logo-icon-transparent.png");
  });
});
