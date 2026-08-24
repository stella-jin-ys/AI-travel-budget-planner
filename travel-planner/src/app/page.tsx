"use client";

import { useState } from "react";
import { TripSetup } from "@/features/trips/components/trip-setup";
import { TripWorkspace } from "@/features/trips/components/trip-workspace";
import type { TripBrief, TripPlan } from "@/features/trips/domain/trip";
import { SyntheticTripProvider } from "@/features/trips/providers/synthetic-provider";

export default function Home() {
  const [plan, setPlan] = useState<TripPlan>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function buildPlan(brief: TripBrief) {
    setError(undefined);

    const supportedKnownTrip =
      brief.mode !== "known-destination" ||
      (brief.origin.toLocaleLowerCase() === "basel" &&
        brief.destination?.toLocaleLowerCase() === "bernese oberland");

    if (!supportedKnownTrip) {
      setError(
        "This synthetic demo supports only the Basel to Bernese Oberland family sample.",
      );
      return;
    }

    setBusy(true);
    try {
      const result = await new SyntheticTripProvider().search(brief);
      setPlan(result.plan);
    } catch {
      setError(
        "The synthetic sample could not be opened. Check the brief and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!plan) {
    return <TripSetup onSubmit={buildPlan} busy={busy} error={error} />;
  }

  return (
    <div className="workspace-page">
    <header aria-label="Synthetic data notice">
      <p className="synthetic-notice">Synthetic demonstration data</p>
    </header>
      <TripWorkspace initialPlan={plan} />
    </div>
  );
}
