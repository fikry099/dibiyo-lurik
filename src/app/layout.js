// app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProgressBar from "@/app/components/ProgressBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dibyo Lurik - Internal",
  description: "Sistem Manajemen Internal Dibyo Lurik",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ProgressBar />
        {children}</body>
    </html>
  );
}