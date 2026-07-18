import { ReactNode, ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface NoTranslateProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: ElementType;
}

export function NoTranslate({ children, className, as: Component = "span", ...props }: NoTranslateProps) {
  return (
    <Component
      {...props}
      translate="no"
      className={cn("notranslate", className)}
    >
      {children}
    </Component>
  );
}
