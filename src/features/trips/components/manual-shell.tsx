"use client";

import type { ReactNode } from "react";
import type { TripWorkspaceState } from "../state/trip-reducer";

export function ManualShell(props: {
  state: TripWorkspaceState;
  chat: ReactNode;
  leaf: ReactNode;
  onBack?: () => void;
}) {
  return (
    <main className="manual-shell" aria-label="Spendwise AI trip workspace">
      <header className="mobile-workspace-header" aria-label="Mobile trip summary">
        <div className="mobile-workspace-header__meta"><button type="button" onClick={props.onBack}>Edit brief</button></div>
      </header>
      <aside className="chat-margin" aria-label="Trip conversation">
        {props.chat}
      </aside>
      <section className="active-leaf" aria-label="Trip plan">
        {props.leaf}
      </section>
    </main>
  );
}
