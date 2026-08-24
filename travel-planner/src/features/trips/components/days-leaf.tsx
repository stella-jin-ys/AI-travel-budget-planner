import type { Dispatch } from "react";
import type {
  TripWorkspaceAction,
  TripWorkspaceState,
} from "../state/trip-reducer";
import { EditableItemList } from "./option-row";

export function DaysLeaf({
  state,
  dispatch,
}: {
  state: TripWorkspaceState;
  dispatch: Dispatch<TripWorkspaceAction>;
}) {
  return (
    <div className="workspace-leaf">
      <h1>Days</h1>
      <p className="leaf-intro">
        Review synthetic timings alongside walking, transit, meal, and rest gaps.
      </p>
      <div className="day-list">
        {state.plan.days.map((day) => (
          <section key={day.id} aria-labelledby={`${day.id}-heading`}>
            <header>
              <h2 id={`${day.id}-heading`}>{day.title}</h2>
              <time dateTime={day.date}>{day.date}</time>
            </header>
            <ol>
              {day.items.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>
                      <time dateTime={item.startsAt}>{localTime(item.startsAt)}</time>
                      {"–"}
                      <time dateTime={item.endsAt}>{localTime(item.endsAt)}</time>
                    </p>
                  </div>
                  {item.directionsUrl ? (
                    <a href={item.directionsUrl} target="_blank" rel="noreferrer">
                      Directions
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <EditableItemList state={state} dispatch={dispatch} section="days" />
    </div>
  );
}

function localTime(value: string) {
  return value.slice(11, 16);
}
