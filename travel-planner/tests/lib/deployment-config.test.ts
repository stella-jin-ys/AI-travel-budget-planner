import { describe, expect, it } from "vitest";
import { getDeploymentConfig } from "@/lib/deployment-config";

describe("deployment config", () => {
  it("keeps the server deployment dynamic for AI and Supabase routes", () => {
    expect(getDeploymentConfig(false)).toEqual({ output: undefined, basePath: "" });
  });

  it("retains the GitHub Pages static export when explicitly building Pages", () => {
    expect(getDeploymentConfig(true)).toEqual({ output: "export", basePath: "/AI-travel-budget-planner" });
  });
});
