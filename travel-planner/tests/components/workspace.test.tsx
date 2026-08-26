import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import Home from "@/app/page";
import { TripWorkspace } from "@/features/trips/components/trip-workspace";
import { buildSwitzerlandFamilyTrip } from "@/features/trips/fixtures/switzerland-family";

afterEach(cleanup);

describe("TripWorkspace", () => {
  it("keeps total, readiness, and every manual tab visible", () => {
    render(<TripWorkspace initialPlan={buildSwitzerlandFamilyTrip()} />);

    const status = within(screen.getByRole("banner", { name: "Trip status" }));
    expect(status.getByText("Group total")).toBeVisible();
    expect(status.getByText(/Review needed/i)).toBeVisible();
    for (const tab of [
      "Overview",
      "Travel",
      "Stay",
      "Days",
      "Food",
      "Budget",
      "Checks",
    ]) {
      expect(screen.getByRole("tab", { name: tab })).toBeVisible();
    }
  });

  it("changes the active manual leaf through workspace state", async () => {
    const user = userEvent.setup();
    render(<TripWorkspace initialPlan={buildSwitzerlandFamilyTrip()} />);

    await user.click(screen.getByRole("tab", { name: "Travel" }));

    expect(screen.getByRole("tab", { name: "Travel" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("heading", { name: "Travel" })).toBeVisible();
  });
});

describe("trip route", () => {
  it("opens the supported known-destination fixture and keeps its synthetic notice", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(
      screen.getByRole("textbox", { name: "Destination" }),
      "Bernese Oberland",
    );
    await user.click(screen.getByRole("button", { name: "Build sample plan" }));

    expect(await screen.findByRole("main", { name: "Trip planning workspace" })).toBeVisible();
    expect(screen.getByText("Synthetic demonstration data")).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Budget" }));
    expect(screen.getByText("Synthetic demonstration data")).toBeVisible();
  });

  it("uses the submitted origin when opening an inspire-me plan", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("radio", { name: "Inspire me" }));
    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.click(screen.getByRole("button", { name: "Build sample plan" }));

    expect(await screen.findByRole("heading", { name: "Recommended travel plan" })).toBeVisible();
    expect(screen.getByText("Synthetic demonstration data")).toBeVisible();
  });

  it("accepts a user-entered known destination", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Stockholm");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Paris");
    await user.click(screen.getByRole("button", { name: "Build sample plan" }));

    expect(await screen.findByRole("heading", { name: "Stockholm to Paris travel plan" })).toBeVisible();
  });
});
