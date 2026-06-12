import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider, Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dirtchat — Private AI workspace for every model",
    template: "%s · Dirtchat",
  },
  description:
    "Connect your own providers, switch models, and keep conversations organized in one focused AI workspace.",
  applicationName: "Dirtchat",
  authors: [{ name: "Dirtchat" }],
  keywords: [
    "Dirtchat",
    "AI chat",
    "multi-model",
    "LLM router",
    "BYOK",
    "AI workspace",
    "ChatGPT alternative",
  ],
  openGraph: {
    title: "Dirtchat — Private AI workspace for every model",
    description:
      "Connect your own providers, switch models, and keep conversations organized in one focused AI workspace.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dirtchat",
    description:
      "Connect your own providers, switch models, and keep conversations organized in one focused AI workspace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
