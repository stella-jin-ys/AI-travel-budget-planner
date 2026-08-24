import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ErrataSlip } from "@/features/trips/components/errata-slip";
import type { PlanIssue } from "@/features/trips/domain/readiness";

afterEach(cleanup);

const staleTransportIssue: PlanIssue = {
  itemId: "stockholm-zurich-train",
  severity: "warning",
  status: "stale",
  message: "Stale estimate",
  impact: "The fare may increase before booking",
  checkedAt: "2026-08-20T10:00:00Z",
  supplierName: "Rail supplier",
  sourceUrl: "https://example.com/rail",
};

describe("ErrataSlip", () => {
  it("shows uncertainty without relying on color", () => {
    render(
      <ErrataSlip
        issue={staleTransportIssue}
        now={new Date("2026-08-24T10:00:00Z")}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Stale estimate");
    expect(screen.getByText("Stale source")).toBeVisible();
    expect(screen.getByText(staleTransportIssue.impact)).toBeVisible();
    expect(screen.getByText("Checked 4 days ago")).toBeVisible();
    expect(screen.getByRole("link", { name: "Check with supplier" })).toHaveAttribute(
      "href",
      staleTransportIssue.sourceUrl,
    );
  });

  it("keeps supplier identity visible when no supplier link is available", () => {
    render(
      <ErrataSlip
        issue={{ ...staleTransportIssue, sourceUrl: undefined }}
        now={new Date("2026-08-24T10:00:00Z")}
      />,
    );

    expect(screen.getByText("Rail supplier")).toBeVisible();
    expect(screen.queryByRole("link", { name: "Check with supplier" })).not.toBeInTheDocument();
  });
});
