import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === "primary" &&
            "bg-brand-black text-white hover:bg-brand-charcoal",
          variant === "secondary" &&
            "bg-brand-stone text-brand-charcoal hover:bg-brand-off-white",
          variant === "outline" &&
            "border border-brand-charcoal/20 bg-transparent text-brand-charcoal hover:bg-brand-stone",
          variant === "ghost" &&
            "bg-transparent text-brand-charcoal hover:bg-brand-stone",
          variant === "gold" &&
            "bg-brand-gold text-brand-black hover:bg-brand-gold-dark hover:text-white",
          // Sizes
          size === "sm" && "h-9 px-4 text-sm",
          size === "md" && "h-11 px-6 text-sm",
          size === "lg" && "h-13 px-8 text-base",
          // Full width
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
