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
