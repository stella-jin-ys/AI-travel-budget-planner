"use client";

import { useState, type FormEvent } from "react";

type AuthMode = "sign-in" | "sign-up";

export function AuthDialog({ open, onClose, onAuthenticate }: {
  open: boolean;
  onClose: () => void;
  onAuthenticate: (email: string) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAuthenticate(email.trim());
    setEmail("");
    setMode("sign-in");
  }

  function close() {
    setEmail("");
    setMode("sign-in");
    onClose();
  }

  const signingUp = mode === "sign-up";

  return (
    <div className="auth-modal" role="presentation" onClick={close}>
      <section className="auth-modal__card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="auth-modal__close" aria-label="Close authentication dialog" onClick={close}>Close</button>
        <div className="auth-modal__tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={!signingUp} onClick={() => setMode("sign-in")}>Sign in</button>
          <button type="button" role="tab" aria-selected={signingUp} onClick={() => setMode("sign-up")}>Sign up</button>
        </div>
        <h2 id="auth-modal-title">{signingUp ? "Create your Spendwise account" : "Sign in to Spendwise Trip"}</h2>
        <p>{signingUp ? "Create a demo account to start planning." : "Sign in to open your trip planning pages."}</p>
        <form className="auth-form" onSubmit={submit}>
          {signingUp ? <label><span>Full name</span><input name="name" autoComplete="name" required /></label> : null}
          <label><span>Email</span><input type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label><span>Password</span><input type="password" name="password" autoComplete={signingUp ? "new-password" : "current-password"} minLength={6} required /></label>
          <button type="submit" className="auth-modal__primary">{signingUp ? "Create account" : "Sign in"}</button>
        </form>
        <p className="auth-modal__demo-note">Demo access only. No account data is stored.</p>
      </section>
    </div>
  );
}
