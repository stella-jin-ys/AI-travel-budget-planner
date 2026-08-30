"use client";

import type { ReactNode } from "react";
import type { PlanSection } from "../domain/trip";
import type { TripWorkspaceState } from "../state/trip-reducer";
import { formatMoney } from "../domain/money";
import { StatusRail } from "./status-rail";
import { sections, SectionTabs } from "./section-tabs";

export function ManualShell(props: {
  state: TripWorkspaceState;
  chat: ReactNode;
  leaf: ReactNode;
  mobileToday?: ReactNode;
  onSectionChange: (section: PlanSection) => void;
  onBack?: () => void;
}) {
  return (
    <main className="manual-shell" aria-label="Trip planning workspace">
      <header className="mobile-workspace-header" aria-label="Mobile trip summary">
        <div className="mobile-workspace-header__brand"><b aria-hidden="true">✦</b><strong>AI Travel Budget Manager</strong></div>
        <div className="mobile-workspace-header__meta"><button type="button" onClick={props.onBack}>Back</button><span><small>Total cost</small><strong>{formatMoney(props.state.budget.total, "en-CH")}</strong></span></div>
      </header>
      <header className="prism-top" aria-label="Planner identity">
        <div className="prism-brand"><b aria-hidden="true">✦</b><strong>AI TRAVEL BUDGET PLANNER</strong></div>
        <span>EUROPE / {props.state.plan.currency}</span>
        <span className="demo-tag"><i aria-hidden="true" /> AI PLAN</span>
      </header>
      <StatusRail
        budget={props.state.budget}
        readiness={props.state.readiness}
        plan={props.state.plan}
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
      <div className="legacy-section-tabs">
        <SectionTabs active={props.state.activeSection} onChange={props.onSectionChange} />
      </div>
    </main>
  );
}
