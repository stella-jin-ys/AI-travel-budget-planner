import { createClient } from "@supabase/supabase-js";
import type { TripBrief, TripPlan } from "@/features/trips/domain/trip";

export async function persistTripPlan(brief: TripBrief, plan: TripPlan): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return false;

  try {
    const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await supabase.from("trip_plans").insert({ brief, plan, created_at: new Date().toISOString() });
    if (error) {
      console.error("Supabase trip persistence failed", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Supabase trip persistence failed", error);
    return false;
  }
}
