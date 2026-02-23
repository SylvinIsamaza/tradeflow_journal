import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AppProvider } from "../AppContext";
import { DayDetailsProvider } from "./DayDetailsContext";
import LayoutWrapper from "./LayoutWrapper";
import TopLoaderProvider from "../TopLoaderProvider";
import QueryProvider from "@/lib/providers/QueryProvider";
import AuthTimeoutProvider from "@/lib/providers/AuthTimeoutProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeFlow Journal",
  description: "Trading journal and analytics platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
        <QueryProvider>
          <AuthTimeoutProvider>
            <TopLoaderProvider />
            <AppProvider>
              <DayDetailsProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
              </DayDetailsProvider>
            </AppProvider>
          </AuthTimeoutProvider>
        </QueryProvider>
  
  );
}
