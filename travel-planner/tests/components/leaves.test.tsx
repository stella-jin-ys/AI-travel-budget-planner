import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ChecksLeaf } from "@/features/trips/components/checks-leaf";
import { TripWorkspace } from "@/features/trips/components/trip-workspace";
import { buildSwitzerlandFamilyTrip } from "@/features/trips/fixtures/switzerland-family";

afterEach(cleanup);

describe("planning leaves", () => {
  it("renders content for every declared planner leaf", async () => {
    const user = userEvent.setup();
    render(<TripWorkspace initialPlan={buildSwitzerlandFamilyTrip()} />);

    for (const name of ["Overview", "Travel", "Stay", "Days", "Food", "Budget", "Checks"]) {
      await user.click(screen.getByRole("tab", { name }));
      expect(screen.getByRole("heading", { name, level: 1 })).toBeVisible();
    }
  });

  it("groups plan checks under their source status", () => {
    render(<ChecksLeaf plan={buildSwitzerlandFamilyTrip()} />);

    const recent = screen.getByRole("region", { name: "Recently checked" });
    const typical = screen.getByRole("region", { name: "Typical estimates" });
    const stale = screen.getByRole("region", { name: "Stale" });

    expect(within(recent).getByText("Synthetic: Family accommodation")).toBeVisible();
    expect(within(typical).getByText("Synthetic: Meals")).toBeVisible();
    expect(within(stale).getByText("No checks in this group.")).toBeVisible();
  });
});
