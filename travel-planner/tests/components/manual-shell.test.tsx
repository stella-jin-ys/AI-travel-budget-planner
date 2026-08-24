import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ManualShell } from "@/features/trips/components/manual-shell";
import { SectionTabs } from "@/features/trips/components/section-tabs";
import { SourceBadge } from "@/features/trips/components/source-badge";
import { createWorkspace } from "@/features/trips/state/trip-reducer";
import { makeTripPlan } from "../support/make-trip-plan";

afterEach(cleanup);

describe("SectionTabs", () => {
  it("names the tab list and exposes the selected section", () => {
    render(<SectionTabs active="travel" onChange={() => undefined} />);

    expect(screen.getByRole("tablist", { name: "Trip sections" })).toBeVisible();
    expect(screen.getByRole("tablist", { name: "Trip sections" })).not.toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    expect(screen.getByRole("tab", { name: "Travel" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("reports a selected section when its tab is activated", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SectionTabs active="overview" onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: "Budget" }));

    expect(onChange).toHaveBeenCalledWith("budget");
  });

  it("moves focus and selection through tabs with arrow keys", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SectionTabs active="overview" onChange={onChange} />);

    const overview = screen.getByRole("tab", { name: "Overview" });
    const travel = screen.getByRole("tab", { name: "Travel" });
    overview.focus();
    await user.keyboard("{ArrowDown}");

    expect(travel).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith("travel");
  });
});

describe("ManualShell", () => {
  it("labels the workspace regions and reports budget readiness in text", () => {
    const state = createWorkspace(makeTripPlan());
    render(
      <ManualShell
        state={state}
        chat={<p>Conversation</p>}
        leaf={<h1>Trip overview</h1>}
        onSectionChange={() => undefined}
      />,
    );

    expect(screen.getByRole("main", { name: "Trip planning workspace" })).toBeVisible();
    expect(screen.getByRole("complementary", { name: "Trip conversation" })).toBeVisible();
    expect(screen.getByRole("tabpanel", { name: "Overview" })).toBeVisible();
    const status = within(screen.getByLabelText("Trip status"));
    expect(status.getByText("Group total")).toBeVisible();
    expect(status.getByText("Per person")).toBeVisible();
    expect(status.getByText("Draft")).toBeVisible();
    expect(status.getByText("Checks")).toBeVisible();
    expect(status.getByText("Warnings")).toBeVisible();
  });

  it("counts selected evidence checks and every unresolved issue", () => {
    const state = createWorkspace(makeTripPlan());
    const blockingIssue = {
      ...state.readiness.issues[0],
      severity: "blocking" as const,
    };
    render(
      <ManualShell
        state={{
          ...state,
          readiness: { state: "draft", issues: [blockingIssue] },
        }}
        chat={<p>Conversation</p>}
        leaf={<h1>Trip overview</h1>}
        onSectionChange={() => undefined}
      />,
    );

    const status = within(screen.getByLabelText("Trip status"));
    expect(within(status.getByText("Checks").closest("dl")!).getByText("7")).toBeVisible();
    expect(within(status.getByText("Warnings").closest("dl")!).getByText("1")).toBeVisible();
  });

  it("preserves exact decimal money with Swiss grouping and two fraction digits", () => {
    const state = createWorkspace(makeTripPlan());
    render(
      <ManualShell
        state={{
          ...state,
          budget: {
            ...state.budget,
            total: { amount: "9007199254740993.10", currency: "CHF" },
            perPerson: { amount: "0.10", currency: "CHF" },
          },
        }}
        chat={<p>Conversation</p>}
        leaf={<h1>Trip overview</h1>}
        onSectionChange={() => undefined}
      />,
    );

    const status = screen.getByLabelText("Trip status");
    expect(
      within(status).getByText("Group total").closest("dl")?.querySelector("dd")
        ?.textContent,
    ).toBe("CHF\u00a09'007'199'254'740'993.10");
    expect(
      within(status).getByText("Per person").closest("dl")?.querySelector("dd")
        ?.textContent,
    ).toBe("CHF\u00a00.10");
  });

  it("mounts a panel target for every tab control", () => {
    const state = createWorkspace(makeTripPlan());
    render(
      <ManualShell
        state={state}
        chat={<p>Conversation</p>}
        leaf={<h1>Trip overview</h1>}
        onSectionChange={() => undefined}
      />,
    );

    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels).toHaveLength(7);
    for (const tab of screen.getAllByRole("tab")) {
      expect(document.getElementById(tab.getAttribute("aria-controls")!)).toBeInTheDocument();
    }
    expect(panels.filter((panel) => panel.hasAttribute("hidden"))).toHaveLength(6);
  });
});

describe("SourceBadge", () => {
  it.each([
    ["live", "Live source"],
    ["recent", "Recent estimate"],
    ["typical", "Typical estimate"],
    ["stale", "Stale source"],
    ["conflicting", "Conflicting sources"],
    ["unavailable", "Source unavailable"],
    ["failed", "Source failed"],
  ] as const)("names the %s source status", (status, label) => {
    render(<SourceBadge status={status} />);

    expect(screen.getByText(label)).toBeVisible();
  });
});
