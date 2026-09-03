import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getDeploymentConfig } from "@/lib/deployment-config";

const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
  scripts: { build: string };
};

describe("deployment config", () => {
  it("keeps the server deployment dynamic for AI and Supabase routes", () => {
    expect(getDeploymentConfig(false)).toEqual({ output: undefined, basePath: "" });
  });

  it("retains the GitHub Pages static export when explicitly building Pages", () => {
    expect(getDeploymentConfig(true)).toEqual({ output: "export", basePath: "/AI-budget-travel-planner" });
  });

  it("uses the Webpack build required by the Cloudflare worker adapter", () => {
    expect(packageJson.scripts.build).toBe("next build --webpack");
  });
});
