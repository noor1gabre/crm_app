import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Coil CRM — Sales Intelligence Platform",
  description: "Professional CRM with real-time pipeline management, built on RDS PostgreSQL",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="page-content">
            <TopBar />
            <main className="page-body">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
