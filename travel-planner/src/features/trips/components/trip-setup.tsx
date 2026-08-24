"use client";

import { useState } from "react";
import { money } from "../domain/money";
import type { TripBrief } from "../domain/trip";
import { switzerlandFamilyBrief } from "../fixtures/switzerland-family";

export function TripSetup({
  onSubmit,
  busy = false,
  error,
}: {
  onSubmit: (brief: TripBrief) => void;
  busy?: boolean;
  error?: string;
}) {
  const [mode, setMode] =
    useState<TripBrief["mode"]>("known-destination");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("2026-09-10");
  const [endDate, setEndDate] = useState("2026-09-13");
  const [childAge, setChildAge] = useState(10);
  const [interests, setInterests] = useState("mountains, family rail");
  const [budget, setBudget] = useState("1200.00");
  const [strict, setStrict] = useState(true);

  const strictBudgetValid =
    !strict || /^\d+(?:\.\d{1,2})?$/.test(budget.trim());
  const ready =
    Boolean(origin.trim() && startDate && endDate) &&
    (mode === "inspire-me" || Boolean(destination.trim())) &&
    strictBudgetValid;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy) return;

    onSubmit({
      ...switzerlandFamilyBrief,
      mode,
      origin: origin.trim(),
      destination:
        mode === "known-destination" ? destination.trim() : undefined,
      startDate,
      endDate,
      travelers: [
        {
          id: "adult-1",
          name: "Adult",
          age: 35,
          eligibility: ["adult", "family"],
        },
        {
          id: "child-1",
          name: "Child",
          age: childAge,
          eligibility: ["child", "family"],
        },
      ],
      interests: interests
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      strictBudget:
        strict && budget.trim() ? money(budget.trim(), "CHF") : undefined,
    });
  }

  return (
    <main className="setup-shell" aria-labelledby="setup-title">
      <form className="trip-setup" onSubmit={submit}>
        <header className="trip-setup__header">
          <h1 id="setup-title">Build the family trip manual</h1>
          <p>
            Set the brief, then open a deterministic Switzerland sample you
            can inspect section by section.
          </p>
        </header>

        <fieldset className="trip-setup__modes">
          <legend>How should we start?</legend>
          <label>
            <input
              type="radio"
              name="trip-mode"
              aria-label="I know where"
              checked={mode === "known-destination"}
              onChange={() => setMode("known-destination")}
            />
            <span>
              <strong>I know where</strong>
              <small>Use the supported Basel to Bernese Oberland sample.</small>
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="trip-mode"
              aria-label="Inspire me"
              checked={mode === "inspire-me"}
              onChange={() => setMode("inspire-me")}
            />
            <span>
              <strong>Inspire me</strong>
              <small>See the deterministic recommendation for this demo.</small>
            </span>
          </label>
        </fieldset>

        {mode === "inspire-me" ? (
          <section
            className="trip-setup__recommendation"
            aria-label="Synthetic recommendation"
          >
            <h2>Synthetic recommendation</h2>
            <p>Bernese Oberland, Switzerland</p>
            <dl>
              <dt>Reason</dt>
              <dd>family rail travel and mountain activities</dd>
            </dl>
          </section>
        ) : null}

        <div className="trip-setup__fields">
          <label>
            <span>Origin</span>
            <input
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              autoComplete="address-level2"
              required
            />
          </label>
          {mode === "known-destination" ? (
            <label>
              <span>Destination</span>
              <input
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                autoComplete="off"
                required
              />
            </label>
          ) : null}
          <label>
            <span>Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </label>
          <label>
            <span>End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Child age</span>
            <input
              type="number"
              min="0"
              max="17"
              value={childAge}
              onChange={(event) => setChildAge(Number(event.target.value))}
            />
          </label>
          <label>
            <span>Interests</span>
            <input
              value={interests}
              onChange={(event) => setInterests(event.target.value)}
            />
          </label>
          <label>
            <span>Budget in CHF</span>
            <input
              inputMode="decimal"
              aria-label="Budget in CHF"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              aria-invalid={!strictBudgetValid}
              aria-describedby={!strictBudgetValid ? "budget-error" : undefined}
            />
            {!strictBudgetValid ? (
              <small className="trip-setup__field-error" id="budget-error">
                Enter a valid CHF budget or turn off Strict budget.
              </small>
            ) : null}
          </label>
        </div>

        <div className="trip-setup__controls">
          <p>Guided demo — no live AI call</p>
          <label className="strict-budget">
            <input
              type="checkbox"
              role="switch"
              checked={strict}
              onChange={(event) => setStrict(event.target.checked)}
            />
            Strict budget
          </label>
          <button type="submit" disabled={!ready || busy}>
            {busy ? "Building sample plan…" : "Build sample plan"}
          </button>
        </div>

        {error ? (
          <p className="trip-setup__error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}
