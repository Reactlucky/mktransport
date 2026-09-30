import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full appearance-none rounded-[14px] border border-input bg-muted/80 bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-3 pr-10 text-base text-foreground focus-visible:border-primary focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235c6573' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      }}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";
