"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Footer from "@/components/Footer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { signInWithEmail, signInWithGoogle, configured } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError(t("auth.invalidEmail"));
      return;
    }
    setPhase("sending");
    try {
      await signInWithEmail(value);
      setPhase("sent");
    } catch {
      setPhase("idle");
      setError(t("auth.sendError"));
    }
  };

  const onGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError(t("auth.sendError"));
    }
  };

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl2 bg-gradient-soft shadow-card">
          <Drop />
        </div>

        {phase === "sent" ? (
          <div className="rounded-xl2 border border-white/70 bg-white/80 p-6 text-center shadow-card backdrop-blur-sm">
            <p className="text-base font-semibold text-[#5b4a61]">
              {t("auth.checkEmail")}
            </p>
            <p className="mt-2 text-sm text-[#8a7a90]">
              {t("auth.checkEmailHint")}
            </p>
            <p className="mt-3 break-all text-sm font-medium text-accent">
              {email.trim()}
            </p>
            <button
              onClick={() => {
                setPhase("idle");
                setError(null);
              }}
              className="mt-4 text-sm font-medium text-accent/80 underline-offset-2 hover:underline"
            >
              {t("auth.useDifferentEmail")}
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-xl2 border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur-sm"
          >
            <h1 className="text-xl font-bold text-[#5b4a61]">
              {t("auth.title")}
            </h1>
            <p className="mt-1 text-sm text-[#8a7a90]">{t("auth.subtitle")}</p>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={!configured}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-primary/30 bg-white py-3 text-sm font-semibold text-[#5b4a61] shadow-sm transition-opacity active:opacity-80 disabled:opacity-50 hover:bg-gray-50"
            >
              <GoogleIcon />
              {t("auth.signInWithGoogle") ?? "Войти через Google"}
            </button>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-primary/20" />
              <span className="text-xs text-[#bcacc2]">
                {t("auth.orEmail") ?? "или по email"}
              </span>
              <div className="h-px flex-1 bg-primary/20" />
            </div>

            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="go"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              disabled={!configured || phase === "sending"}
              className="w-full rounded-2xl border border-primary/30 bg-canvas px-4 py-3 text-[#5b4a61] outline-none transition-colors placeholder:text-[#bcacc2] focus:border-accent disabled:opacity-50"
            />

            {error && (
              <p className="mt-2 text-sm text-[#c06a93]">{error}</p>
            )}
            {!configured && (
              <p className="mt-2 text-sm text-[#c06a93]">
                {t("auth.notConfigured")}
              </p>
            )}

            <button
              type="submit"
              disabled={!configured || phase === "sending"}
              className="mt-4 w-full rounded-2xl bg-gradient-soft py-3 text-sm font-semibold text-white shadow-soft transition-opacity active:opacity-90 disabled:opacity-50"
            >
              {phase === "sending" ? t("auth.sending") : t("auth.sendLink")}
            </button>

            <p className="mt-3 text-center text-[11px] text-[#b0a0b6]">
              {t("auth.noPassword")}
            </p>
          </form>
        )}
      </div>

      <Footer className="absolute inset-x-0 bottom-5" />
    </div>
  );
}

function Drop() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c3 4 6 7 6 10.5A6 6 0 0 1 6 13.5C6 10 9 7 12 3Z"
        fill="white"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
