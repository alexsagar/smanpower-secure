import { Skeleton } from "@/components/ui/shared";

export function PublicPageSkeleton() {
  return (
    <section className="pt-32 pb-20" role="status" aria-live="polite" aria-busy="true" aria-label="Loading page">
      <div className="container-wide px-6 lg:px-12">
        <div className="mb-16 max-w-3xl">
          <Skeleton className="mb-6 h-3 w-28 bg-brand-gold/30 motion-reduce:animate-none" />
          <Skeleton className="mb-4 h-12 w-full max-w-2xl motion-reduce:animate-none" />
          <Skeleton className="h-12 w-2/3 motion-reduce:animate-none" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-64 motion-reduce:animate-none" />
          <Skeleton className="h-64 motion-reduce:animate-none" />
          <Skeleton className="h-64 motion-reduce:animate-none" />
        </div>
      </div>
    </section>
  );
}

export function AdminPageSkeleton() {
  return (
    <section className="space-y-8" role="status" aria-live="polite" aria-busy="true" aria-label="Loading admin page">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24 bg-brand-gold/30 motion-reduce:animate-none" />
          <Skeleton className="h-9 w-64 motion-reduce:animate-none" />
        </div>
        <Skeleton className="h-10 w-36 motion-reduce:animate-none" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-28 motion-reduce:animate-none" />
        <Skeleton className="h-28 motion-reduce:animate-none" />
        <Skeleton className="h-28 motion-reduce:animate-none" />
      </div>
      <Skeleton className="h-[420px] motion-reduce:animate-none" />
    </section>
  );
}

export function IndeterminateProgress({ label = "Working" }: { label?: string }) {
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-label={label}>
      <div className="h-1 overflow-hidden bg-brand-charcoal/10">
        <div className="h-full w-1/3 bg-brand-gold motion-safe:animate-[loading-line_1.1s_ease-in-out_infinite] motion-reduce:w-full" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
