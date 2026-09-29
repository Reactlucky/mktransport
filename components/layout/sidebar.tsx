"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CustomerIcon,
  DashboardIcon,
  DriverIcon,
  ReportIcon,
  RouteIcon,
  TruckIcon,
} from "@/components/icons/transport";
import { Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon, exact: true },
  { href: "/dashboard/trips", label: "Trips", icon: RouteIcon },
  { href: "/dashboard/trucks", label: "Trucks", icon: TruckIcon },
  { href: "/dashboard/customers", label: "Customers", icon: CustomerIcon },
  { href: "/dashboard/drivers", label: "Drivers", icon: DriverIcon },
  { href: "/dashboard/reports", label: "Reports", icon: ReportIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/10 px-4",
          collapsed && "justify-center px-2"
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          onClick={onNavigate}
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-active">
            <TruckIcon className="size-5 text-white" />
          </span>
          {!collapsed && (
            <span className="font-display text-base font-semibold tracking-tight">
              MK Transport
            </span>
          )}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                active
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { navItems };
