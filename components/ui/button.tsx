import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { WheelLoader } from "./wheel-loader";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(37,99,235,0.34)]",
  secondary:
    "bg-muted text-foreground hover:bg-accent",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  danger:
    "bg-danger-muted text-danger hover:bg-danger/15",
  outline:
    "border border-border bg-card text-foreground shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-muted",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
  icon: "size-11 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[14px] font-medium transition duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-lift",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <WheelLoader
            className="size-5 shrink-0"
            tone={variant === "primary" ? "light" : "brand"}
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
