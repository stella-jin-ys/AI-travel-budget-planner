"use client";

import Decimal from "decimal.js";
import { useState, type Dispatch } from "react";
import { formatMoney, money } from "../domain/money";
import { demoNow } from "../domain/readiness";
import type { PlanAlternative, PlanItem, PlanSection } from "../domain/trip";
import type {
  TripWorkspaceAction,
  TripWorkspaceState,
} from "../state/trip-reducer";
import { ErrataSlip } from "./errata-slip";
import { SourceBadge } from "./source-badge";

interface OptionRowProps {
  item: PlanItem;
  alternatives: PlanAlternative[];
  locked: boolean;
  onReplace: (alternativeId: string) => void;
  onToggleLock: () => void;
}

export function OptionRow({
  item,
  alternatives,
  locked,
  onReplace,
  onToggleLock,
}: OptionRowProps) {
  const [pending, setPending] = useState<PlanAlternative | null>(null);
  const selected = item.alternatives.find(
    (candidate) => candidate.id === item.selectedAlternativeId,
  );
  if (!selected) throw new Error(`Missing selected option for ${item.id}`);

  const replacements = alternatives.filter(
    (candidate) => candidate.id !== selected.id,
  );

  function toggleLock() {
    setPending(null);
    onToggleLock();
  }

  function commitReplacement() {
    if (!pending || locked) return;
    onReplace(pending.id);
    setPending(null);
  }

  return (
    <article className="option-row" aria-labelledby={`${item.id}-title`}>
      <header className="option-row__heading">
        <div>
          <h2 id={`${item.id}-title`}>{item.label}</h2>
          <p>{selected.label}</p>
        </div>
        <strong className="option-row__cost">
          {formatMoney(alternativeTotal(selected), "en-CH")}
        </strong>
      </header>

      <div className="option-row__source">
        <SourceBadge status={selected.evidence.status} />
        <span>{selected.evidence.supplierName}</span>
        {selected.evidence.sourceUrl ? (
          <a href={selected.evidence.sourceUrl} target="_blank" rel="noreferrer">
            Supplier source
          </a>
        ) : null}
      </div>

      <div className="option-row__controls">
        <button type="button" onClick={toggleLock} aria-pressed={locked}>
          {locked ? `Unlock ${item.label}` : `Lock ${item.label}`}
        </button>
        <button
          type="button"
          disabled={locked || replacements.length === 0}
          onClick={() => setPending(replacements[0] ?? null)}
        >
          Replace {item.label.toLowerCase()}
        </button>
      </div>

      {locked ? <p className="option-row__locked">{item.label} locked</p> : null}

      {pending ? (
        <div
          className="option-row__confirmation"
          role="dialog"
          aria-label={`Replace ${item.label}`}
        >
          <h3>Confirm replacement</h3>
          {replacements.length > 1 ? (
            <div className="option-row__alternatives" aria-label="Available alternatives">
              {replacements.map((candidate) => (
                <button
                  type="button"
                  key={candidate.id}
                  aria-pressed={pending.id === candidate.id}
                  onClick={() => setPending(candidate)}
                >
                  Preview {candidate.label.toLowerCase()}
                </button>
              ))}
            </div>
          ) : null}
          <p className="option-row__delta">{describeCostDelta(selected, pending)}</p>
          <p>{pending.label}</p>
          <SourceBadge status={pending.evidence.status} />
          <div className="option-row__controls">
            <button type="button" disabled={locked} onClick={commitReplacement}>
              Use {pending.label.toLowerCase()}
            </button>
            <button type="button" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function EditableItemList({
  state,
  dispatch,
  section,
}: {
  state: TripWorkspaceState;
  dispatch: Dispatch<TripWorkspaceAction>;
  section: PlanSection;
}) {
  const items = state.plan.items.filter((item) => item.section === section);

  return (
    <div className="planner-item-list">
      {items.map((item) => (
        <div className="planner-item" key={item.id}>
          <OptionRow
            item={item}
            alternatives={item.alternatives}
            locked={state.lockedItemIds.includes(item.id)}
            onReplace={(alternativeId) =>
              dispatch({ type: "replace-option", itemId: item.id, alternativeId })
            }
            onToggleLock={() => dispatch({ type: "toggle-lock", itemId: item.id })}
          />
          {state.readiness.issues
            .filter((issue) => issue.itemId === item.id)
            .map((issue, index) => (
              <ErrataSlip
                issue={issue}
                now={demoNow}
                key={`${issue.itemId}-${issue.status}-${index}`}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

function alternativeTotal(alternative: PlanAlternative) {
  const costs = Object.values(alternative.travelerCosts);
  const currency = costs[0]?.currency;
  if (!currency) throw new Error(`Missing traveler costs for ${alternative.id}`);

  return money(
    costs.reduce((sum, value) => sum.plus(value.amount), new Decimal(0)).toFixed(2),
    currency,
  );
}

function describeCostDelta(
  selected: PlanAlternative,
  pending: PlanAlternative,
): string {
  const selectedTotal = alternativeTotal(selected);
  const pendingTotal = alternativeTotal(pending);
  if (selectedTotal.currency !== pendingTotal.currency) {
    throw new Error("Cannot compare alternatives with mixed currencies");
  }

  const delta = new Decimal(pendingTotal.amount).minus(selectedTotal.amount);
  const verb = delta.lt(0) ? "Save" : "Add";
  return `${verb} ${selectedTotal.currency} ${delta.abs().toFixed(2)}`;
}
