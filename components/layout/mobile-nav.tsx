"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CustomerIcon,
  RouteIcon,
  TruckIcon,
} from "@/components/icons/transport";
import { Menu, Plus } from "lucide-react";

const bottomItems = [
  { href: "/dashboard/trips", label: "Trips", icon: RouteIcon },
  { href: "/dashboard/trucks", label: "Trucks", icon: TruckIcon },
  { href: "/dashboard/trips/new", label: "Add", icon: Plus, primary: true },
  { href: "/dashboard/customers", label: "Customers", icon: CustomerIcon },
  { href: "#more", label: "More", icon: Menu, more: true },
];

export function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile primary"
    >
      <ul className="grid grid-cols-5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active =
            !item.more &&
            !item.primary &&
            pathname.startsWith(item.href);

          if (item.more) {
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={onMore}
                  className="flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground"
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
                  className="-mt-4 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
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
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
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
