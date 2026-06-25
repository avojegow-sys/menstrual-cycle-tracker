"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Footer from "@/components/Footer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { signInWithEmail, configured } = useAuth();
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

            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="go"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              disabled={!configured || phase === "sending"}
              className="mt-4 w-full rounded-2xl border border-primary/30 bg-canvas px-4 py-3 text-[#5b4a61] outline-none transition-colors placeholder:text-[#bcacc2] focus:border-accent disabled:opacity-50"
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
