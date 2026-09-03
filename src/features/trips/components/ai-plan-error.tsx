import { AppNav, type AppNavProps } from "./app-nav";

export function AIPlanError({ message, onRetry, onEditBrief, navigation }: { message: string; onRetry: () => void; onEditBrief: () => void; navigation?: AppNavProps }) {
  return (
    <main className="ai-plan-error" aria-label="AI travel plan unavailable">
      <div className="ai-plan-error__backdrop" aria-hidden="true" />
      <AppNav {...navigation} context="AI plan" />
      <section className="ai-plan-error__panel" role="alert">
        <h1>{message}</h1>
        <p>Your trip brief is saved. Retry when the planner is available to continue.</p>
        <div className="ai-plan-error__actions">
          <button type="button" className="ai-plan-error__retry" onClick={onRetry}>Retry travel plan</button>
          <button type="button" className="ai-plan-error__edit" onClick={onEditBrief}>Edit brief</button>
        </div>
      </section>
    </main>
  );
}
