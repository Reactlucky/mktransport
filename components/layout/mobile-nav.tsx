"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CustomerIcon, DashboardIcon, RouteIcon } from "@/components/icons/transport";
import { Menu, Plus } from "lucide-react";

const bottomItems = [
  { href: "/dashboard", label: "Home", icon: DashboardIcon, exact: true },
  { href: "/dashboard/trips", label: "Trips", icon: RouteIcon },
  { href: "/dashboard/trips/new", label: "Add", icon: Plus, primary: true },
  { href: "/dashboard/customers", label: "Customers", icon: CustomerIcon },
  { href: "#more", label: "More", icon: Menu, more: true },
];

export function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 rounded-[28px] border border-border bg-sidebar pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-floating)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile primary"
    >
      <ul className="grid grid-cols-5 items-end">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : !item.more && !item.primary && pathname.startsWith(item.href);

          if (item.more) {
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={onMore}
                  className="flex w-full flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors duration-200 active:scale-95"
                >
                  <Icon className="size-5" />
                  More
                </button>
              </li>
            );
          }

          if (item.primary) {
            return (
              <li key={item.label} className="relative flex justify-center">
                <Link
                  href={item.href}
                  className="-mt-5 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-[0_10px_24px_rgba(37,99,235,0.35)] transition duration-200 active:scale-95"
                  aria-label="Add Trip"
                >
                  <Plus className="size-7" strokeWidth={2.25} />
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition duration-200 active:scale-95",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
