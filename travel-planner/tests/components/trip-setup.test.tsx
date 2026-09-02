import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TripSetup } from "@/features/trips/components/trip-setup";

afterEach(cleanup);

describe("TripSetup", () => {
  function initialDateRange() {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 3);
    const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { start: format(start), end: format(end) };
  }

  it("starts with empty user-entered values and one accessible date trigger", () => {
    render(<TripSetup onSubmit={() => undefined} />);

    expect(screen.getAllByText("Destination").length).toBeGreaterThan(0);
    expect(screen.getByText("Step 1 of 2")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Origin" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Destination" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Budget" })).toHaveValue("");
    expect(screen.getAllByRole("button", { name: /Choose start and end/ })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Plan my trip" })).toBeDisabled();
  });

  it("keeps the launch brief on one route and traveller step", async () => {
    const user = userEvent.setup();
    render(<TripSetup onSubmit={() => undefined} />);

    expect(screen.getAllByText("Destination").length).toBeGreaterThan(0);
    expect(screen.getByRole("radio", { name: "Solo" })).toBeChecked();
    expect(screen.queryByRole("spinbutton", { name: "Child 1 age" })).not.toBeInTheDocument();
    expect(screen.getByText("Optimized for your budget")).toBeVisible();
    expect(screen.getByRole("switch", { name: "Stay recommendation" })).toBeChecked();
    expect(screen.queryByRole("group", { name: "Accommodation options" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Currency" })).toHaveValue("SEK");
    expect(screen.queryByRole("textbox", { name: "Trip purpose and interests" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Other" }));
    expect(screen.getByRole("textbox", { name: "Trip purpose and interests" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Bernese Oberland");
    expect(screen.getByRole("button", { name: "Plan my trip" })).toBeEnabled();
  });

  it("submits the budget in the selected currency", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Paris");
    await user.type(screen.getByRole("textbox", { name: "Budget" }), "1200");
    await user.selectOptions(screen.getByRole("combobox", { name: "Currency" }), "EUR");
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: "EUR",
        budget: { amount: "1200.00", currency: "EUR" },
        strictBudget: { amount: "1200.00", currency: "EUR" },
      }),
    );
  });

  it("reveals accommodation choices when stay recommendation is disabled", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    await user.click(screen.getByRole("switch", { name: "Stay recommendation" }));
    expect(screen.getByRole("group", { name: "Accommodation options" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Hostel" }));
    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Stockholm");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Paris");
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ accommodationType: "hostel" }));
  });

  it("captures spending preference and transit tolerance with a total budget", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Stockholm");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Paris");
    await user.selectOptions(screen.getByRole("combobox", { name: "Spend more on" }), "activities");
    await user.selectOptions(screen.getByRole("combobox", { name: "Transit flexibility" }), "overnight");
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      budgetMode: "total",
      spendingPreference: "activities",
      transitTolerance: "overnight",
    }));
  });

  it("keeps an entered budget as a soft target when the maximum is off", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Paris");
    await user.type(screen.getByRole("textbox", { name: "Budget" }), "1200");
    await user.click(screen.getByRole("switch", { name: "Maximum budget" }));
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        budget: { amount: "1200.00", currency: "SEK" },
        strictBudget: undefined,
      }),
    );
  });

  it("prevents planning when the end date is before the start date", async () => {
    const user = userEvent.setup();
    render(<TripSetup onSubmit={() => undefined} />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Paris");
    const { start, end } = initialDateRange();
    const dateTrigger = screen.getByRole("button", { name: new RegExp(`${start}.*${end}`) });
    expect(dateTrigger).toHaveAttribute("aria-expanded", "false");
    await user.click(dateTrigger);
    expect(dateTrigger).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("gridcell", { name: start }));
    const priorDate = new Date(`${start}T00:00:00`);
    priorDate.setDate(priorDate.getDate() - 1);
    const priorDateIso = `${priorDate.getFullYear()}-${String(priorDate.getMonth() + 1).padStart(2, "0")}-${String(priorDate.getDate()).padStart(2, "0")}`;
    await user.click(screen.getByRole("gridcell", { name: priorDateIso }));

    expect(screen.getByText("Choose an end date on or after the start date.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Plan my trip" })).toBeDisabled();

    await user.keyboard("{Escape}");
    expect(dateTrigger).toHaveAttribute("aria-expanded", "false");
    await user.click(dateTrigger);
    await user.click(screen.getByRole("textbox", { name: "Origin" }));
    expect(dateTrigger).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the calendar trigger visible when the dropdown opens", async () => {
    const scrollIntoView = vi.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollIntoView;
    const user = userEvent.setup();
    render(<TripSetup onSubmit={() => undefined} />);

    const { start, end } = initialDateRange();
    await user.click(screen.getByRole("button", { name: new RegExp(`${start}.*${end}`) }));

    expect(scrollIntoView).toHaveBeenCalledWith({ block: "center" });
    Element.prototype.scrollIntoView = original;
  });

  it("offers traveller profiles and accepts an interest-led destination search", async () => {
    const user = userEvent.setup();
    render(<TripSetup onSubmit={() => undefined} />);

    expect(screen.getByRole("radio", { name: "Solo" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Solo" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Plan my trip" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Where are you going?" })).toBeVisible();

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    expect(screen.getByRole("button", { name: "Plan my trip" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Other" }));
    await user.type(screen.getByRole("textbox", { name: "Trip purpose and interests" }), "ski in the Alps");
    expect(screen.getByRole("button", { name: "Plan my trip" })).toBeEnabled();
  });

  it("submits an interest-led brief without a destination", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Stockholm");
    await user.click(screen.getByRole("button", { name: "Other" }));
    await user.type(screen.getByRole("textbox", { name: "Trip purpose and interests" }), "ski in the Alps");
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      origin: "Stockholm",
      destination: undefined,
      interests: ["ski in the Alps"],
    }));
  });

  it("submits every known-destination field as a complete trip brief", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "Family" }));
    await user.click(screen.getByRole("button", { name: "Other" }));
    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(
      screen.getByRole("textbox", { name: "Destination" }),
      "Bernese Oberland",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Trip purpose and interests" }),
      "mountain walks, mountains, family rail",
    );
    await user.clear(screen.getByRole("textbox", { name: "Budget" }));
    await user.type(screen.getByRole("textbox", { name: "Budget" }), "1350.00");
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(onSubmit).toHaveBeenCalledWith({
      mode: "known-destination",
      origin: "Basel",
      destination: "Bernese Oberland",
      startDate: initialDateRange().start,
      endDate: initialDateRange().end,
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
      ],
      interests: ["mountain walks", "mountains", "family rail"],
      currency: "SEK",
      purpose: "mountain walks, mountains, family rail",
      budget: { amount: "1350.00", currency: "SEK" },
      budgetMode: "total",
      spendingPreference: "balanced",
      transitTolerance: "flexible",
      strictBudget: { amount: "1350.00", currency: "SEK" },
    });
  });

  it("explains an invalid entered budget before submission", async () => {
    const user = userEvent.setup();
    render(<TripSetup onSubmit={() => undefined} />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(
      screen.getByRole("textbox", { name: "Destination" }),
      "Bernese Oberland",
    );
    await user.click(screen.getByRole("radio", { name: "Family" }));
    await user.clear(screen.getByRole("textbox", { name: "Budget" }));
    await user.type(screen.getByRole("textbox", { name: "Budget" }), "12.345");

    expect(screen.getByText("Enter a valid SEK budget or leave the budget blank.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Plan my trip" })).toBeDisabled();
  });

  it("reveals the child age only when the child toggle is checked", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    const toggle = screen.getByRole("checkbox", { name: "Travelling with a child?" });
    expect(toggle).not.toBeChecked();
    expect(screen.queryByRole("spinbutton", { name: "Child age" })).not.toBeInTheDocument();
    await user.click(toggle);
    expect(screen.getByRole("spinbutton", { name: "Child age" })).toHaveValue(10);
    await user.click(toggle);
    expect(screen.queryByRole("spinbutton", { name: "Child age" })).not.toBeInTheDocument();
  });

  it("shows purpose selection and a clear demo status on the launch brief", async () => {
    const user = userEvent.setup();
    render(<TripSetup onSubmit={() => undefined} />);

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Paris");
    await user.click(screen.getByRole("button", { name: "Summer escape" }));
    expect(screen.getByRole("button", { name: "Summer escape" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Ski weekend" })).toHaveAttribute("aria-pressed", "false");

    expect(screen.queryByRole("region", { name: "Trip route summary" })).not.toBeInTheDocument();
    expect(screen.getByText("AI estimates are clearly marked; verify supplier details before booking.")).toBeVisible();
  });

  it("keeps the launch proof currency-neutral", () => {
    render(<TripSetup onSubmit={() => undefined} />);

    expect(screen.queryByRole("region", { name: "See the whole trip before you book." })).not.toBeInTheDocument();
  });

  it("adapts the traveler fields for a solo trip", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TripSetup onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "Solo" }));
    expect(screen.queryByRole("spinbutton", { name: "Child 1 age" })).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Origin" }), "Basel");
    await user.type(screen.getByRole("textbox", { name: "Destination" }), "Zermatt");
    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "known-destination",
        origin: "Basel",
        destination: "Zermatt",
        travelers: [expect.objectContaining({ name: "Adult", age: 35 })],
      }),
    );
  });
});
