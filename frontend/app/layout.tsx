import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { PublicShell } from "@/components/layout/public-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Safar.pk | Discover Pakistan",
  description: "Discover unforgettable journeys across Pakistan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <PublicShell>{children}</PublicShell>
        </AuthProvider>
      </body>
    </html>
  );
}
