import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ 
  variable: "--font-plus-jakarta", 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
  title: "Reach.ai — AI Instagram & Meta Analytics Platform",
  description: "Multi-tenant AI-powered Instagram & Meta analytics, insights, and automated growth recommendations.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Reach.ai",
  },
};

import AuthProvider from "@/components/SessionProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} font-sans h-full antialiased`} style={{ colorScheme: "light" }}>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--txt)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
