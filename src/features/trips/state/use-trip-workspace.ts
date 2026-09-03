"use client";

import { useReducer } from "react";
import type { TripPlan } from "../domain/trip";
import { createWorkspace, tripReducer } from "./trip-reducer";

export function useTripWorkspace(initialPlan: TripPlan) {
  const [state, dispatch] = useReducer(tripReducer, initialPlan, createWorkspace);

  return { state, dispatch };
}
