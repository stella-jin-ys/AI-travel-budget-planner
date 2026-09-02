"use client";

import { useEffect, useRef, useState } from "react";
import { money } from "../domain/money";
import type { Traveler, TripBrief } from "../domain/trip";

type TravelProfile = "solo" | "students" | "family" | "ski-group";
type CalendarSelection = "start" | "end";

const profileDefaults: Record<TravelProfile, { adults: number; childAges: number[] }> = {
  solo: { adults: 1, childAges: [] },
  students: { adults: 2, childAges: [] },
  family: { adults: 1, childAges: [10] },
  "ski-group": { adults: 4, childAges: [] },
};

function describeTravelers(adults: number, childAges: number[]) {
  const adultLabel = `${adults} adult${adults === 1 ? "" : "s"}`;
  if (childAges.length === 0) return adultLabel;
  const childLabel = `${childAges.length} child${childAges.length === 1 ? "" : "ren"}`;
  const ageLabel = `${childAges.length === 1 ? "age" : "ages"} ${childAges.join(", ")}`;
  return `${adultLabel}, ${childLabel} · ${ageLabel}`;
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toIsoDate(next);
}

function calendarDays(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year, monthNumber - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, monthNumber - 1, 1 - offset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { iso: toIsoDate(date), day: date.getDate(), inMonth: date.getMonth() === monthNumber - 1 };
  });
}

export function TripSetup({
  onSubmit,
  busy = false,
  error,
}: {
  onSubmit: (brief: TripBrief) => void;
  busy?: boolean;
  error?: string;
}) {
  const mode: TripBrief["mode"] = "known-destination";
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(() => toIsoDate(new Date()));
  const [endDate, setEndDate] = useState(() => addDays(new Date(), 3));
  const [datesOpen, setDatesOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => toIsoDate(new Date()).slice(0, 7));
  const [calendarSelection, setCalendarSelection] = useState<CalendarSelection>("start");
  const [adultCount, setAdultCount] = useState(1);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [purpose, setPurpose] = useState("");
  const [purposeChoice, setPurposeChoice] = useState("");
  const [budget, setBudget] = useState("");
  const budgetMode: NonNullable<TripBrief["budgetMode"]> = "total";
  const [spendingPreference, setSpendingPreference] = useState<NonNullable<TripBrief["spendingPreference"]>>("balanced");
  const [stayRecommendation, setStayRecommendation] = useState(true);
  const [accommodationType, setAccommodationType] = useState<NonNullable<TripBrief["accommodationType"]>>("hotel");
  const [transitTolerance, setTransitTolerance] = useState<NonNullable<TripBrief["transitTolerance"]>>("flexible");
  const [transitTime, setTransitTime] = useState("10");
  const [strict, setStrict] = useState(true);
  const [currency, setCurrency] = useState("SEK");
  const [travelProfile, setTravelProfile] = useState<TravelProfile>("solo");
  const dateRangeRef = useRef<HTMLFieldSetElement>(null);
  const dateTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!datesOpen) return;

    dateTriggerRef.current?.scrollIntoView?.({ block: "center" });

    function closeOnOutsideClick(event: PointerEvent) {
      if (!dateRangeRef.current?.contains(event.target as Node)) setDatesOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setDatesOpen(false);
      dateTriggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [datesOpen]);

  const budgetValid =
    !budget.trim() || /^\d+(?:\.\d{1,2})?$/.test(budget.trim());
  const datesValid = Boolean(startDate && endDate && endDate >= startDate);
  const routeReady = Boolean(origin.trim() && datesValid && (destination.trim() || purpose.trim()));
  const travelersValid =
    adultCount >= 1 && childAges.every((age) => age >= 0 && age <= 17);
  const ready =
    routeReady &&
    travelersValid &&
    budgetValid;

  const purposePresets = ["Summer escape", "Ski weekend", "City culture", "Slow & scenic", "Other"];
  const transitPresets = [
    { value: "5", label: "Up to 5 hours", tolerance: "direct" as const },
    { value: "10", label: "Over 5 hours", tolerance: "flexible" as const },
    { value: "20", label: "Over 10 hours", tolerance: "overnight" as const },
    { value: "24", label: "Over 20 hours", tolerance: "overnight" as const },
  ];
  const accommodationPresets = [
    { value: "hotel", label: "Hotel" },
    { value: "hostel", label: "Hostel" },
    { value: "apartment", label: "Apartment" },
    { value: "camping", label: "Camping" },
  ] as const;
  const missingEssentials = [
    !origin.trim() ? "origin" : undefined,
    !destination.trim() && !purpose.trim() ? "a destination or interests" : undefined,
  ].filter(Boolean);
  const calendarMonthLabel = new Date(`${calendarMonth}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const days = calendarDays(calendarMonth);
  function shiftCalendarMonth(offset: number) {
    const [year, month] = calendarMonth.split("-").map(Number);
    const next = new Date(year, month - 1 + offset, 1);
    setCalendarMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
  }

  function selectCalendarDate(date: string) {
    if (calendarSelection === "start") {
      setStartDate(date);
      setEndDate("");
      setCalendarSelection("end");
      return;
    }
    setEndDate(date);
    if (date >= startDate) setDatesOpen(false);
  }
  function chooseProfile(profile: TravelProfile) {
    const defaults = profileDefaults[profile];
    setTravelProfile(profile);
    setAdultCount(defaults.adults);
    setChildAges(defaults.childAges);
  }

  function updateChildAge(index: number, age: number) {
    setChildAges((current) =>
      current.map((value, childIndex) => childIndex === index ? age : value),
    );
  }

  function toggleChild(hasChild: boolean) {
    setChildAges(hasChild ? [childAges[0] ?? 10] : []);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy) return;

    onSubmit({
      mode,
      origin: origin.trim(),
      destination: destination.trim() || undefined,
      startDate,
      endDate,
      travelers: [
        ...Array.from({ length: adultCount }, (_, index) => ({
          id: `adult-${index + 1}`,
          name: travelProfile === "students" ? `Student ${index + 1}` : index === 0 ? "Adult" : `Traveller ${index + 1}`,
          age: travelProfile === "students" ? 21 : 35,
          eligibility: (travelProfile === "students" ? ["adult", "student"] : ["adult"]) as Traveler["eligibility"],
        })),
        ...childAges.map((age, index) => ({
          id: `child-${index + 1}`,
          name: childAges.length === 1 ? "Child" : `Child ${index + 1}`,
          age,
          eligibility: ["child", "family"] as Traveler["eligibility"],
        })),
      ],
      interests: purpose
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      currency,
      purpose: purpose.trim() || undefined,
      budget: budget.trim() ? money(budget.trim(), currency) : undefined,
      budgetMode,
      spendingPreference,
      transitTolerance,
      accommodationType: stayRecommendation ? undefined : accommodationType,
      strictBudget:
        strict && budget.trim() ? money(budget.trim(), currency) : undefined,
    });
  }

  return (
    <main className="setup-shell" aria-labelledby="setup-title">
      <form className="trip-setup" onSubmit={submit}>
        <nav className="setup-local-nav" aria-label="Primary navigation">
          <a href="#planner" className="setup-local-brand">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.75c.72 5.48 3.77 8.53 9.25 9.25-5.48.72-8.53 3.77-9.25 9.25C11.28 15.77 8.23 12.72 2.75 12 8.23 11.28 11.28 8.23 12 2.75Z" /></svg>
            <span>AI Travel Budget Manager</span>
          </a>
          <a href="#planner">Planner</a>
        </nav>

        <section className="trip-setup__hero" id="planner">
          <header className="trip-setup__header">
            <h1 id="setup-title"><span>Plan your best trip.</span>{" "}<em>Stay within budget.</em></h1>
            <p>
              One clear itinerary for transport, stays, activities, food, and the
              choices that still need checking.
            </p>
          </header>
          <p className="trip-setup__hero-note">Profiles are starting points. Adjust the group to match your trip.</p>
          <fieldset className="trip-setup__profiles trip-setup__profiles--hero">
            <legend>Who is travelling?</legend>
            <div className="profile-options">
              {(["solo", "students", "family", "ski-group"] as const).map((profile) => (
                <label key={profile} className={travelProfile === profile ? "is-active" : ""}>
                  <input type="radio" name="travel-profile" value={profile} checked={travelProfile === profile} onChange={() => chooseProfile(profile)} />
                  <span>{profile === "ski-group" ? "Ski group" : profile[0].toUpperCase() + profile.slice(1)}</span>
                </label>
              ))}
            </div>
            <label className="child-toggle"><input type="checkbox" checked={childAges.length > 0} onChange={(event) => toggleChild(event.target.checked)} /><span>Travelling with a child?</span></label>
            {childAges.length > 0 ? <label className="child-age"><span>Child age</span><input type="number" min="0" max="17" value={childAges[0]} onChange={(event) => updateChildAge(0, Number(event.target.value))} /></label> : null}
            <p className="traveler-summary">{describeTravelers(adultCount, childAges)}</p>
          </fieldset>
          <section className="trip-setup__planning-summary" aria-label="Planning preferences">
            <label className="trip-setup__stay-note">
              <input type="checkbox" role="switch" aria-label="Stay recommendation" checked={stayRecommendation} onChange={(event) => setStayRecommendation(event.target.checked)} />
              <span><strong>Stay recommendation</strong><small>{stayRecommendation ? "Optimized for your budget" : "Choose an accommodation type"}</small></span>
            </label>
            {!stayRecommendation ? <div className="choice-chips trip-setup__accommodation-options" role="group" aria-label="Accommodation options">
              {accommodationPresets.map((preset) => <button type="button" key={preset.value} aria-pressed={accommodationType === preset.value} onClick={() => setAccommodationType(preset.value)} className={accommodationType === preset.value ? "is-active" : ""}>{preset.label}</button>)}
            </div> : null}
            <label className="strict-budget strict-budget--summary">
              <input type="checkbox" role="switch" aria-label="Maximum budget" aria-describedby="budget-mode-help" checked={strict} onChange={(event) => setStrict(event.target.checked)} />
              <span><strong>Maximum budget</strong><small id="budget-mode-help">{strict ? "The plan must stay at or below this amount." : "The planner will use this as a flexible target."}</small></span>
            </label>
          </section>
        </section>

        <div className="trip-setup__fields">
          <header className="trip-setup__card-header">
            <p className="trip-setup__progress"><span>Step 1 of 2</span><span>Destination</span></p>
            <h2>Where are you going?</h2>
            <p className="trip-setup__card-copy">Start with where you’re leaving from, then add a destination or tell us what you’re in the mood for.</p>
          </header>
          <label>
                <span>Origin</span>
                <input value={origin} onChange={(event) => setOrigin(event.target.value)} autoComplete="address-level2" placeholder="City, airport, or station" required />
              </label>
          <label className="trip-setup__destination-field">
                <span>Destination <small>(optional)</small></span>
                <input aria-label="Destination" value={destination} onChange={(event) => setDestination(event.target.value)} autoComplete="off" placeholder="A city or a random destination" aria-describedby="destination-help" />
                <small id="destination-help" className="trip-setup__field-help">Leave blank to discover a destination from your interests.</small>
              </label>
          <fieldset className="trip-setup__date-range" ref={dateRangeRef}>
                <legend>Travel dates</legend>
                <button type="button" ref={dateTriggerRef} className="date-range-trigger" aria-expanded={datesOpen} aria-controls="date-range-panel" onClick={() => {
                  if (datesOpen) {
                    setDatesOpen(false);
                    return;
                  }
                  setCalendarMonth(startDate.slice(0, 7));
                  setCalendarSelection("start");
                  setDatesOpen(true);
                }}>
                  <span>{startDate} <b aria-hidden="true">→</b> {endDate}</span><small>Choose start and end</small>
                </button>
                {datesOpen ? <div id="date-range-panel" className="date-range-panel" role="group" aria-label="Select travel dates">
                  <div className="date-range-panel__header">
                    <button type="button" aria-label="Previous month" onClick={() => shiftCalendarMonth(-1)}>‹</button>
                    <strong>{calendarMonthLabel}</strong>
                    <button type="button" aria-label="Next month" onClick={() => shiftCalendarMonth(1)}>›</button>
                  </div>
                  <p className="date-range-panel__prompt">Select {calendarSelection === "start" ? "a start date" : "an end date"}</p>
                  <div className="date-range-calendar" role="grid" aria-label={calendarMonthLabel}>
                    {(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const).map((day) => <span key={day} role="columnheader">{day}</span>)}
                    {days.map((day) => <button type="button" role="gridcell" key={day.iso} aria-label={day.iso} aria-selected={day.iso === startDate || day.iso === endDate} className={[day.inMonth ? "" : "is-outside", day.iso === startDate || day.iso === endDate ? "is-selected" : "", startDate && endDate && day.iso > startDate && day.iso < endDate ? "is-in-range" : ""].filter(Boolean).join(" ")} onClick={() => selectCalendarDate(day.iso)}>{day.day}</button>)}
                  </div>
                  <button type="button" className="date-range-done" disabled={!datesValid} onClick={() => setDatesOpen(false)}>Done</button>
                </div> : null}
                {!datesValid ? <small className="trip-setup__field-error" id="date-error">Choose an end date on or after the start date.</small> : null}
              </fieldset>
          <label className="trip-setup__purpose">
                <span>Trip purpose and interests</span>
                <div className="choice-chips" aria-label="Purpose presets">
                  {purposePresets.map((preset) => <button type="button" key={preset} aria-label={preset} aria-pressed={purposeChoice === preset} onClick={() => { setPurposeChoice(preset); if (preset !== "Other") setPurpose(preset); }} className={purposeChoice === preset ? "is-active" : ""}>{preset}</button>)}
                </div>
                {purposeChoice === "Other" ? <input value={purpose} aria-label="Trip purpose and interests" onChange={(event) => setPurpose(event.target.value)} placeholder="Tell us what you want to do" /> : null}
              </label>
          <div className="trip-setup__budget-currency">
          <label className="trip-setup__budget">
                <span>Budget</span>
                <input inputMode="decimal" aria-label="Budget" value={budget} onChange={(event) => setBudget(event.target.value)} aria-invalid={!budgetValid} aria-describedby={!budgetValid ? "budget-error" : "budget-mode-help"} />
                {!budgetValid ? <small className="trip-setup__field-error" id="budget-error">Enter a valid {currency} budget or leave the budget blank.</small> : null}
              </label>
          <label className="trip-setup__currency">
                <span>Currency</span>
                <select aria-label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>
                  <option value="CHF">CHF · Swiss franc</option>
                  <option value="EUR">EUR · Euro</option>
                  <option value="GBP">GBP · Pound sterling</option>
                  <option value="SEK">SEK · Swedish krona</option>
                </select>
              </label>
          </div>
          <label className="trip-setup__spending-preference">
                <span>Spend more on</span>
                <select aria-label="Spend more on" value={spendingPreference} onChange={(event) => setSpendingPreference(event.target.value as NonNullable<TripBrief["spendingPreference"]>)}>
                  <option value="balanced">Keep it balanced</option>
                  <option value="activities">Activities</option>
                  <option value="stays">Stays</option>
                  <option value="food">Food</option>
                </select>
              </label>
          <fieldset className="trip-setup__transit-tolerance">
                <legend>Travel time</legend>
                <div className="option-cards option-cards--transit" aria-label="Transit time options">
                  {transitPresets.map((preset) => <button type="button" key={preset.value} aria-pressed={transitTime === preset.value} onClick={() => { setTransitTime(preset.value); setTransitTolerance(preset.tolerance); }} className={transitTime === preset.value ? "is-active" : ""}>{preset.label}</button>)}
                </div>
                <select className="transit-select-compat" aria-label="Transit flexibility" value={transitTolerance} onChange={(event) => setTransitTolerance(event.target.value as NonNullable<TripBrief["transitTolerance"]>)}>
                  <option value="direct">Prefer the fastest route</option>
                  <option value="flexible">Open to longer routes to save</option>
                  <option value="overnight">Open to overnight buses</option>
                </select>
              </fieldset>
          <div className="trip-setup__controls trip-setup__controls--final">
                <p className={routeReady ? "trip-setup__status is-ready" : "trip-setup__status"} aria-live="polite">
                  {routeReady ? "Ready to find your best-fit trip." : `Add ${missingEssentials.join(" and ")} to plan your trip.`}
                </p>
                <p className="trip-setup__demo-note">AI estimates are clearly marked; verify supplier details before booking.</p>
                <button type="submit" disabled={!ready || busy}>{busy ? "Preparing your plan…" : "Plan my trip"}</button>
              </div>
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
