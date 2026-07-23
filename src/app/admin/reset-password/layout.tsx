import { manrope } from "@/lib/fonts";
import "@/app/globals.css";

export default function ResetPasswordLayout({
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
