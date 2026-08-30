"use client";
import Decimal from "decimal.js";
import { useState, type Dispatch } from "react";
import { formatMoney, money } from "../domain/money";
import { demoNow } from "../domain/readiness";
import type { CostCategory } from "../domain/trip";
import type { TripWorkspaceAction, TripWorkspaceState } from "../state/trip-reducer";
import { ErrataSlip } from "./errata-slip";
import { OptionRow } from "./option-row";

const cards = [
  { id: "overview", label: "Overview", description: "Whole trip at a glance", categories: [] },
  { id: "transport", label: "Transportation", description: "Door to destination", categories: ["transport"] },
  { id: "stay", label: "Stay", description: "Nights and room", categories: ["stay"] },
  { id: "food", label: "Food", description: "Meals and groceries", categories: ["food"] },
  { id: "activities", label: "Activities", description: "Attractions and passes", categories: ["activities"] },
  { id: "local-transit", label: "Local transport", description: "Getting around", categories: ["local-transit"] },
  { id: "itinerary", label: "Itinerary", description: "Day by day", categories: [] },
] as const;
type CardId = (typeof cards)[number]["id"];

function totalFor(state: TripWorkspaceState, categories: readonly CostCategory[]) {
  const values = state.plan.items.flatMap((item) => {
    const option = item.alternatives.find((candidate) => candidate.id === item.selectedAlternativeId);
    return option && categories.includes(option.category) ? Object.values(option.travelerCosts) : [];
  });
  return values.length ? money(values.reduce((sum, value) => sum.plus(value.amount), new Decimal(0)).toFixed(2), values[0].currency) : null;
}

function CardDetails({ card, state, dispatch }: { card: (typeof cards)[number]; state: TripWorkspaceState; dispatch: Dispatch<TripWorkspaceAction> }) {
  if (card.id === "overview") return <div className="overview-card__details"><p>Review the ledger below, then choose a category card to inspect sources, freshness, warnings, and supplier links.</p></div>;
  if (card.id === "itinerary") return <div className="overview-card__details overview-card__itinerary">{state.plan.days.map((day) => <div key={day.id}><b>{day.date}</b>{day.items.map((entry) => <span key={entry.id}><br />{entry.startsAt.slice(11, 16)} {entry.label}</span>)}</div>)}</div>;
  const detailItems = state.plan.items.filter((item) => item.alternatives.some((option) => option.id === item.selectedAlternativeId && (option.category === card.id || item.section === card.id)));
  return <div className="overview-card__details"><p className="overview-details__source">Supplier source: {state.plan.items.flatMap((item) => item.alternatives.map((option) => option.evidence.supplierName)).filter(Boolean).join(", ")}</p>{detailItems.length ? detailItems.map((item) => <div className="overview-detail-item" key={item.id}><OptionRow item={item} alternatives={item.alternatives} locked={state.lockedItemIds.includes(item.id)} onReplace={(alternativeId) => dispatch({ type: "replace-option", itemId: item.id, alternativeId })} onToggleLock={() => dispatch({ type: "toggle-lock", itemId: item.id })} />{state.readiness.issues.filter((issue) => issue.itemId === item.id).map((issue, index) => <ErrataSlip issue={issue} now={demoNow} key={`${issue.itemId}-${issue.status}-${index}`} />)}</div>) : <p>No selected items in this section yet.</p>}{state.readiness.issues.length > 0 ? <div className="overview-card-warning"><strong>Checks to review</strong>{state.readiness.issues.map((issue, index) => <ErrataSlip issue={issue} now={demoNow} key={`${issue.itemId}-${issue.status}-${index}`} />)}</div> : null}</div>;
}

function CardGrid({ state, selectedCard, onSelect, dispatch }: { state: TripWorkspaceState; selectedCard: CardId | null; onSelect: (card: CardId) => void; dispatch: Dispatch<TripWorkspaceAction> }) {
  return <section className="overview-card-grid" aria-label="Plan sections">{cards.map((card) => { const total = card.id === "overview" ? totalFor(state, ["transport", "stay", "food", "activities", "local-transit"]) : card.id === "itinerary" ? null : totalFor(state, card.categories); const stayItem = state.plan.items.find((item) => item.id === "family-room"); const supplier = card.id === "stay" ? stayItem?.alternatives[0]?.evidence.supplierName : null; const selected = selectedCard === card.id; return <article className={`overview-card${selected ? " is-selected" : ""}`} key={card.id}><button type="button" aria-label={card.label} className="overview-card__trigger" aria-expanded={selected} onClick={() => onSelect(card.id)}><span className="overview-card__label">{card.label}</span><small>{card.description}{supplier ? ` · ${supplier}` : ""}</small><strong>{total ? formatMoney(total, "en-CH") : card.id === "itinerary" ? `${state.plan.days.length} days` : "Included"}</strong><span className="overview-card__hint">{selected ? "Hide details" : "View details"}</span></button>{selected ? <CardDetails card={card} state={state} dispatch={dispatch} /> : null}</article>; })}</section>;
}

function LedgerSummary({ state }: { state: TripWorkspaceState }) {
  return <div className="prism-table"><div className="prism-row head"><span>LINE ITEM</span><span>SOURCE</span><span>AMOUNT</span></div>{state.plan.items.filter((item) => item.selectedAlternativeId).map((item) => { const option = item.alternatives.find((candidate) => candidate.id === item.selectedAlternativeId); if (!option) return null; const total = totalFor({ ...state, plan: { ...state.plan, items: [item] } }, [option.category]); return <div className="prism-row" key={item.id}><span>{item.label}</span><small>{option.evidence.status} estimate</small><strong>{total ? formatMoney(total, "en-CH") : "—"}</strong></div>; })}</div>;
}

export function OverviewLeaf({ state, dispatch }: { state: TripWorkspaceState; dispatch: Dispatch<TripWorkspaceAction> }) {
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null);
  const activeCard = cards.find((card) => card.id === selectedCard);
  const toggleCard = (card: CardId) => setSelectedCard((current) => current === card ? null : card);
  if (!activeCard) {
    return <div className="workspace-leaf">
      <div className="prism-heading"><div><small className="eyebrow">ACTIVE LEDGER</small><h1>Overview</h1></div><small>LAST CHECKED 24 AUG 2026 · 14:32</small></div>
      <div className="prism-hero"><div><small className="eyebrow">THE SHORT VERSION</small><h2 className="prism-plan-title">{state.plan.title}</h2><p className="prism-tagline"><em>kept under the line.</em></p><p>Route, stay, activities, and food are combined into one explainable plan. Choose a card to inspect its recommendations, cost, and source status.</p></div></div>
      <CardGrid state={state} selectedCard={selectedCard} onSelect={toggleCard} dispatch={dispatch} />
      <LedgerSummary state={state} />
      <p className="overview-card-grid__hint">Select a card above to see its details and any checks.</p>
    </div>;
  }
  return <div className="workspace-leaf">
    <div className="prism-heading"><div><small className="eyebrow">ACTIVE LEDGER</small><h1>Overview</h1></div><small>LAST CHECKED 24 AUG 2026 · 14:32</small></div>
    <div className="prism-hero"><div><small className="eyebrow">THE SHORT VERSION</small><h2 className="prism-plan-title">{state.plan.title}</h2><p className="prism-tagline"><em>kept under the line.</em></p><p>Choose another card to compare the rest of the plan.</p></div></div>
    <CardGrid state={state} selectedCard={selectedCard} onSelect={toggleCard} dispatch={dispatch} />
    <div className="prism-table"><div className="prism-row head"><span>LINE ITEM</span><span>SOURCE</span><span>AMOUNT</span></div>{state.plan.items.filter((item) => item.selectedAlternativeId).map((item) => { const option = item.alternatives.find((candidate) => candidate.id === item.selectedAlternativeId); if (!option) return null; const total = totalFor({ ...state, plan: { ...state.plan, items: [item] } }, [option.category]); return <div className="prism-row" key={item.id}><span>{item.label}</span><small>{option.evidence.status} estimate</small><strong>{total ? formatMoney(total, "en-CH") : "—"}</strong></div>; })}</div>
  </div>;
}
