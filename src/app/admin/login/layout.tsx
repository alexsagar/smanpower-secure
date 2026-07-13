import type { Metadata } from "next";
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
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full bg-brand-off-white flex items-center justify-center font-sans">
        {children}
      </body>
    </html>
  );
}
