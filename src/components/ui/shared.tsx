import { cn } from "@/lib/utils";

// ── Badge ────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "success" | "warning" | "danger" | "outline";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-brand-stone text-brand-charcoal",
        variant === "gold" && "bg-brand-gold/10 text-brand-gold-dark",
        variant === "success" && "bg-emerald-50 text-emerald-700",
        variant === "warning" && "bg-amber-50 text-amber-700",
        variant === "danger" && "bg-red-50 text-red-700",
        variant === "outline" &&
          "bg-transparent border border-brand-charcoal/20 text-brand-charcoal",
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Section Label ────────────────────────────────────

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold",
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Section Heading ──────────────────────────────────

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  children,
  className,
  as: Component = "h2",
}: SectionHeadingProps) {
  return (
    <Component
      className={cn(
        "text-3xl md:text-4xl lg:text-[2.75rem] font-semibold leading-[1.15] tracking-tight text-brand-black text-balance",
        className
      )}
    >
      {children}
    </Component>
  );
}

// ── Divider ──────────────────────────────────────────

interface DividerProps {
  variant?: "default" | "gold";
  className?: string;
}

export function Divider({ variant = "default", className }: DividerProps) {
  return (
    <hr
      className={cn(
        "border-0 h-px",
        variant === "default" && "bg-brand-charcoal/10",
        variant === "gold" && "bg-brand-gold",
        className
      )}
    />
  );
}

// ── Skeleton ─────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-brand-stone rounded",
        className
      )}
    />
  );
}

// ── Breadcrumb ───────────────────────────────────────

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm text-brand-muted", className)}
    >
      <ol className="flex items-center gap-1.5" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-1.5"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <span className="text-brand-charcoal/20">/</span>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-brand-charcoal transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </a>
            ) : (
              <span className="text-brand-charcoal" itemProp="name">
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
