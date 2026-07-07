import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";
import { getCatalog } from "@/lib/content";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/app-shell";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Client Onboarding Playbook";

export const metadata: Metadata = {
  title: {
    default: `${appName} — BuildVision`,
    template: `%s · ${appName}`,
  },
  description:
    "Internal, interactive playbook that guides Customer Success & Operations through onboarding a new BuildVision client — from signed contract to go-live.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const catalog = getCatalog();

  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers catalog={catalog}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
