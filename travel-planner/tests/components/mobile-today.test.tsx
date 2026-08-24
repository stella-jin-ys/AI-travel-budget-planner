import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MobileToday } from "@/features/trips/components/mobile-today";
import { buildSwitzerlandFamilyTrip } from "@/features/trips/fixtures/switzerland-family";

afterEach(cleanup);

describe("MobileToday", () => {
  it("prioritizes the next item, current warning, and group total", () => {
    render(
      <MobileToday
        plan={buildSwitzerlandFamilyTrip()}
        now={new Date("2026-08-24T08:00:00Z")}
      />,
    );

    expect(screen.getByRole("heading", { name: "Next" })).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Synthetic 10:00 Basel to Interlaken rail connection",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Directions" })).toHaveAttribute(
      "rel",
      "noreferrer",
    );
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByText("Group total")).toBeVisible();
    expect(screen.getByText(/CHF\s*1[’']?688\.50/)).toBeVisible();
  });
});
