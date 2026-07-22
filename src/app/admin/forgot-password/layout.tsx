import { inter } from "@/lib/fonts";
import "@/app/globals.css";

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-full bg-brand-off-white font-sans">
        {children}
      </body>
    </html>
  );
}
