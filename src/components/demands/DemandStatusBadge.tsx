import React from "react";
import { cn } from "@/lib/utils";
import type { DemandStatusBadge } from "@/types/content";

interface DemandStatusBadgeProps {
  status: DemandStatusBadge;
  className?: string;
}

export function DemandStatusBadgeComponent({
  status,
  className,
}: DemandStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
        {
          "bg-green-100 text-green-800": status === "Open",
          "bg-yellow-100 text-yellow-800": status === "Closing Soon",
          "bg-red-100 text-red-800": status === "Closed",
          "bg-blue-100 text-blue-800": status === "Upcoming",
        },
        className
      )}
    >
      {status}
    </span>
  );
}
