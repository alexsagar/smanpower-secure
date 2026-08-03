import Image from "next/image";
import { ReactNode } from "react";

interface AdminAuthShellProps {
  title: string;
  description?: string | ReactNode;
  children: ReactNode;
  footerContent?: ReactNode;
  icon?: ReactNode;
}

export function AdminAuthShell({
  title,
  description,
  children,
  footerContent,
  icon,
}: AdminAuthShellProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-off-white px-4 py-12 font-sans">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-brand-charcoal/10 p-8 sm:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-none">
          {/* Header Area */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-6">
              {icon ? (
                icon
              ) : (
                <Image
                  src="/images/SSIS.webp"
                  alt="Seven Seas Intercontinental"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              )}
            </div>
            
            <h1 className="text-2xl font-semibold text-brand-charcoal mb-2">
              {title}
            </h1>
            {description && (
              <div className="text-brand-muted text-sm">{description}</div>
            )}
          </div>

          {/* Form / Content Area */}
          {children}
        </div>

        {/* Footer Area */}
        {footerContent && (
          <div className="mt-6 text-center">
            {footerContent}
          </div>
        )}

        {/* Copyright */}
        <div className="mt-12 text-center text-xs text-brand-muted">
          &copy; {currentYear} Seven Seas Intercontinental. All rights reserved.
        </div>
      </div>
    </div>
  );
}
