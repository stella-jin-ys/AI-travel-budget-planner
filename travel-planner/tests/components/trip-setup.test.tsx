import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TripSetup } from "@/features/trips/components/trip-setup";

afterEach(cleanup);

describe("TripSetup", () => {
  it("offers both trip starting modes and requires a known destination", async () => {
    const user = userEvent.setup();
    render(<TripSetup onSubmit={() => undefined} />);

    expect(screen.getByRole("radio", { name: "I know where" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Inspire me" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Build my travel plan" })).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    expect(screen.getByRole("button", { name: "Build my travel plan" })).toBeDisabled();

    await user.type(
      screen.getByRole("textbox", { name: "Destination" }),
      "Bernese Oberland",
    );
    expect(screen.getByRole("button", { name: "Build my travel plan" })).toBeEnabled();
  });

  it("submits every known-destination field as a complete trip brief", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(
      screen.getByRole("textbox", { name: "Destination" }),
      "Bernese Oberland",
    );
    await user.clear(screen.getByRole("textbox", { name: "Interests" }));
    await user.type(
      screen.getByRole("textbox", { name: "Interests" }),
      "mountains, family rail",
    );
    await user.clear(screen.getByRole("textbox", { name: "Budget in CHF" }));
    await user.type(screen.getByRole("textbox", { name: "Budget in CHF" }), "1350.00");
    await user.clear(screen.getByRole("spinbutton", { name: "Number of travellers" }));
    await user.type(screen.getByRole("spinbutton", { name: "Number of travellers" }), "3");
    await user.type(screen.getByRole("textbox", { name: "Purpose or activities" }), "mountain walks");
    await user.selectOptions(screen.getByRole("combobox", { name: "Accommodation type" }), "hostel");
    await user.click(screen.getByRole("button", { name: "Build my travel plan" }));

    expect(onSubmit).toHaveBeenCalledWith({
      mode: "known-destination",
      origin: "Basel",
      destination: "Bernese Oberland",
      startDate: "2026-09-10",
      endDate: "2026-09-13",
      travelers: [
        {
          id: "adult-1",
          name: "Adult",
          age: 35,
          eligibility: ["adult"],
        },
        {
          id: "child-1",
          name: "Child",
          age: 10,
          eligibility: ["child", "family"],
        },
        {
          id: "adult-3",
          name: "Traveller 3",
          age: 35,
          eligibility: ["adult"],
        },
      ],
      interests: ["mountains", "family rail"],
      purpose: "mountain walks",
      accommodationType: "hostel",
      strictBudget: { amount: "1350.00", currency: "CHF" },
      fixtureId: "switzerland-family",
    });
  });

  it("explains an invalid strict budget before submission", async () => {
    const user = userEvent.setup();
    render(<TripSetup onSubmit={() => undefined} />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(
      screen.getByRole("textbox", { name: "Destination" }),
      "Bernese Oberland",
    );
    await user.clear(screen.getByRole("textbox", { name: "Budget in CHF" }));

    expect(screen.getByText("Enter a valid CHF budget or turn off Strict budget.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Build my travel plan" })).toBeDisabled();
  });

  it("describes inspire-me as a synthetic recommendation with its exact reason", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "Inspire me" }));

    expect(screen.queryByRole("textbox", { name: "Destination" })).not.toBeInTheDocument();
    expect(screen.getByText("Synthetic recommendation")).toBeVisible();
    expect(screen.getByText("family rail travel and mountain activities")).toBeVisible();
    expect(screen.getByText("Guided demo — no live AI call")).toBeVisible();
    expect(screen.getByRole("button", { name: "Build my travel plan" })).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.click(screen.getByRole("button", { name: "Build my travel plan" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "inspire-me",
        origin: "Basel",
        destination: undefined,
        fixtureId: "switzerland-family",
      }),
    );
  });
});
