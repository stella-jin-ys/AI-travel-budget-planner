import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OptionRow } from "@/features/trips/components/option-row";
import type { PlanAlternative, PlanItem } from "@/features/trips/domain/trip";

afterEach(cleanup);

const selected: PlanAlternative = {
  id: "stay-standard",
  label: "Standard stay",
  category: "stay",
  travelerCosts: {
    adult: { amount: "300.00", currency: "CHF" },
    child: { amount: "120.00", currency: "CHF" },
  },
  covered: false,
  optional: false,
  evidence: {
    status: "recent",
    supplierName: "Synthetic standard stay",
    checkedAt: "2026-08-24T10:00:00Z",
    synthetic: true,
  },
};

const budget: PlanAlternative = {
  ...selected,
  id: "stay-budget",
  label: "Budget stay",
  travelerCosts: {
    adult: { amount: "210.00", currency: "CHF" },
    child: { amount: "90.00", currency: "CHF" },
  },
};

const item: PlanItem = {
  id: "accommodation",
  section: "stay",
  label: "Accommodation",
  required: true,
  selectedAlternativeId: selected.id,
  alternatives: [selected, budget],
};

describe("OptionRow", () => {
  it("previews budget impact before committing a replacement", async () => {
    const user = userEvent.setup();
    const onReplace = vi.fn();
    render(
      <OptionRow
        item={item}
        alternatives={[budget]}
        locked={false}
        onReplace={onReplace}
        onToggleLock={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Replace accommodation" }));

    expect(screen.getByRole("dialog", { name: "Replace Accommodation" })).toBeVisible();
    expect(screen.getByText("Save CHF 120.00")).toBeVisible();
    expect(onReplace).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Use budget stay" }));

    expect(onReplace).toHaveBeenCalledOnce();
    expect(onReplace).toHaveBeenCalledWith("stay-budget");
  });

  it("does not expose replacement confirmation while locked", () => {
    render(
      <OptionRow
        item={item}
        alternatives={[budget]}
        locked
        onReplace={vi.fn()}
        onToggleLock={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Replace accommodation" })).toBeDisabled();
    expect(screen.getByText("Accommodation locked")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
