"use client";

import { useAuth } from "./AuthProvider";
import LoginScreen from "./LoginScreen";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Gates the app behind authentication:
 * - while the session is being restored -> a loading shell,
 * - signed out (or Supabase not configured) -> the magic-link login screen,
 * - signed in -> the app.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const { t } = useI18n();

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="animate-pulse text-sm text-[#8a7a90]">
          {t("auth.loading")}
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
