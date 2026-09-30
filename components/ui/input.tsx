import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-[14px] border border-input bg-muted/80 px-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
