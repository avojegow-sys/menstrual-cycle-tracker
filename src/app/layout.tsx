import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthGate from "@/components/auth/AuthGate";

export const metadata: Metadata = {
  title: "Cycle Tracker",
  description: "A private, offline-first menstrual cycle tracker.",
  manifest: "/manifest.json",
  applicationName: "Cycle Tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cycle",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#E8A0BF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* iOS PWA hints (Next metadata covers most, these are explicit) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="font-sans">
        <I18nProvider>
          <AuthProvider>
            <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
              <div className="safe-top flex justify-end px-4 pt-4">
                <LanguageSwitcher />
              </div>
              <AuthGate>
                <main className="flex flex-1 flex-col px-4 pb-28 pt-3">
                  <div className="flex-1">{children}</div>
                  <Footer className="pt-8" />
                </main>
                <BottomNav />
              </AuthGate>
            </div>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
