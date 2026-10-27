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
  primary: "btn-primary",
  secondary: "btn-ghost",
  ghost: "btn-ghost",
  danger: "btn-soft btn-error",
  outline: "btn-outline",
};

const sizes: Record<Size, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
  icon: "btn-square",
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
        className={cn("btn", variants[variant], sizes[size], className)}
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
