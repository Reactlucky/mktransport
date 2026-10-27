"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CustomerIcon, DashboardIcon, RouteIcon } from "@/components/icons/transport";
import { Menu, Plus } from "lucide-react";

const bottomItems = [
  { href: "/dashboard", label: "Home", icon: DashboardIcon, exact: true },
  { href: "/dashboard/trips", label: "Trips", icon: RouteIcon },
  { href: "/dashboard/trips/new", label: "Add", icon: Plus },
  { href: "/dashboard/customers", label: "Customers", icon: CustomerIcon },
  { href: "#more", label: "More", icon: Menu, more: true },
];

export function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();

  return (
    <div className="dock dock-md z-40 border-t border-base-300 bg-base-100 lg:hidden">
      {bottomItems.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : !item.more && pathname.startsWith(item.href);

        if (item.more) {
          return (
            <button key={item.label} type="button" onClick={onMore}>
              <Icon className="size-5" />
              <span className="dock-label">More</span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(active && "dock-active")}
            aria-label={item.label === "Add" ? "Add trip" : undefined}
          >
            <Icon className="size-5" />
            <span className="dock-label">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
