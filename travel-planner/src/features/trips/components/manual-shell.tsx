"use client";

import type { ReactNode } from "react";
import type { PlanSection } from "../domain/trip";
import type { TripWorkspaceState } from "../state/trip-reducer";
import { SectionTabs } from "./section-tabs";
import { StatusRail } from "./status-rail";

export function ManualShell(props: {
  state: TripWorkspaceState;
  chat: ReactNode;
  leaf: ReactNode;
  onSectionChange: (section: PlanSection) => void;
}) {
  return (
    <main className="manual-shell" aria-label="Trip planning workspace">
      <StatusRail budget={props.state.budget} readiness={props.state.readiness} />
      <aside className="chat-margin" aria-label="Trip conversation">
        {props.chat}
      </aside>
      <section
        className="active-leaf"
        id={`panel-${props.state.activeSection}`}
        role="tabpanel"
        aria-labelledby={`tab-${props.state.activeSection}`}
      >
        {props.leaf}
      </section>
      <SectionTabs
        active={props.state.activeSection}
        onChange={props.onSectionChange}
      />
    </main>
  );
}
