import type { Metadata } from "next";
import { manrope } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Admin Login | Seven Seas Intercontinental",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${manrope.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-full bg-brand-off-white font-sans">
        {children}
      </body>
    </html>
  );
}
