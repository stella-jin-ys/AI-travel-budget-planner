"use client";

import type { ReactNode } from "react";
import type { PlanSection } from "../domain/trip";
import type { TripWorkspaceState } from "../state/trip-reducer";
import { sections, SectionTabs } from "./section-tabs";
import { StatusRail } from "./status-rail";

export function ManualShell(props: {
  state: TripWorkspaceState;
  chat: ReactNode;
  leaf: ReactNode;
  mobileToday?: ReactNode;
  onSectionChange: (section: PlanSection) => void;
}) {
  const checkedCount = props.state.plan.items.filter((item) =>
    item.alternatives.find(
      (alternative) =>
        alternative.id === item.selectedAlternativeId &&
        Boolean(alternative.evidence.checkedAt),
    ),
  ).length;

  return (
    <main className="manual-shell" aria-label="Trip planning workspace">
      <StatusRail
        budget={props.state.budget}
        readiness={props.state.readiness}
        checkedCount={checkedCount}
      />
      {props.mobileToday ? (
        <div className="mobile-today-slot">{props.mobileToday}</div>
      ) : null}
      <aside className="chat-margin" aria-label="Trip conversation">
        {props.chat}
      </aside>
      {sections.map((section) => {
        const active = section.id === props.state.activeSection;
        return (
          <section
            className="active-leaf"
            id={`panel-${section.id}`}
            key={section.id}
            role="tabpanel"
            aria-labelledby={`tab-${section.id}`}
            hidden={!active}
          >
            {active ? props.leaf : null}
          </section>
        );
      })}
      <SectionTabs
        active={props.state.activeSection}
        onChange={props.onSectionChange}
      />
    </main>
  );
}
