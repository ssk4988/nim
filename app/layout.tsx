import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { SessionProvider } from "./session-provider";
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SnackbarProvider } from "@/components/snackbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nim Games",
  description: "Play Nim and other games online!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      {/* prevent auth refresh when switching windows for now since it causes websocket disconnect */}
      <SessionProvider refetchOnWindowFocus={false}>
        <body
          className={inter.className}
        >
          <ThemeProvider enableSystem={false}>
            <SnackbarProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                {children}
              </div>
            </SnackbarProvider>
          </ThemeProvider>
        </body>
      </SessionProvider>
    </html>
  );
}
