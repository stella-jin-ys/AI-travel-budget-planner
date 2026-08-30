import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import Home from "@/app/page";
import { TripWorkspace } from "@/features/trips/components/trip-workspace";
import { buildSwitzerlandFamilyTrip } from "@/features/trips/fixtures/switzerland-family";

afterEach(cleanup);

describe("TripWorkspace", () => {
  it("expands each overview card in place without a separate itinerary region", async () => {
    const user = userEvent.setup();
    render(<TripWorkspace initialPlan={buildSwitzerlandFamilyTrip()} />);

    const details = [
      ["Overview", "Review the ledger below"],
      ["Transportation", "Supplier source:"],
      ["Stay", "Supplier source:"],
      ["Food", "Supplier source:"],
      ["Activities", "Supplier source:"],
      ["Local transport", "Supplier source:"],
      ["Itinerary", "2026-09-10"],
    ] as const;

    for (const [label, detail] of details) {
      const trigger = screen.getByRole("button", { name: label });
      const card = trigger.closest("article");
      expect(card).not.toBeNull();
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      await user.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(within(card!).getByText(detail, { exact: false })).toBeVisible();
    }

    expect(screen.queryByRole("region", { name: "Itinerary details" })).not.toBeInTheDocument();
  });

  it("keeps total, readiness, and every manual tab visible", () => {
    render(<TripWorkspace initialPlan={buildSwitzerlandFamilyTrip()} />);

    const status = within(screen.getByRole("banner", { name: "Trip status" }));
    expect(status.getByText("Total cost")).toBeVisible();
    expect(status.getByText(/mountain railways/)).toBeVisible();
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
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(await screen.findByRole("main", { name: "Trip planning workspace" })).toBeVisible();
    expect(screen.getByText("Synthetic demonstration data")).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Budget" }));
    expect(screen.getByText("Synthetic demonstration data")).toBeVisible();
  });

  it("returns to the editable brief from the generated plan", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Interlaken");
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    await user.click(await screen.findByRole("button", { name: "EDIT BRIEF ↗" }));
    expect(screen.getByRole("heading", { name: "Plan your best trip. Stay within budget." })).toBeVisible();
  });

  it("accepts a user-entered known destination", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Stockholm");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Paris");
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(await screen.findByRole("heading", { name: "Stockholm to Paris travel plan" })).toBeVisible();
  });
});
