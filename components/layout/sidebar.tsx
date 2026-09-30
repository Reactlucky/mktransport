"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
import {
  CustomerIcon,
  DashboardIcon,
  DriverIcon,
  ReportIcon,
  RouteIcon,
  TruckIcon,
} from "@/components/icons/transport";
import { ClipboardCheck, Settings, Wallet } from "lucide-react";

const groups = [
  {
    label: "Operate",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: DashboardIcon, exact: true },
      { href: "/dashboard/trips", label: "Trips", icon: RouteIcon },
      { href: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck },
    ],
  },
  {
    label: "Fleet",
    items: [
      { href: "/dashboard/trucks", label: "Trucks", icon: TruckIcon },
      { href: "/dashboard/drivers", label: "Drivers", icon: DriverIcon },
      { href: "/dashboard/customers", label: "Customers", icon: CustomerIcon },
    ],
  },
  {
    label: "Books",
    items: [
      { href: "/dashboard/salary", label: "Salaries", icon: Wallet },
      { href: "/dashboard/reports", label: "Reports", icon: ReportIcon },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const navItems = groups.flatMap((group) => group.items);

export function Sidebar({
  collapsed,
  onNavigate,
  floating = false,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  floating?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col text-sidebar-foreground",
        floating
          ? "rounded-[28px] border border-border bg-sidebar shadow-[var(--shadow-floating)] backdrop-blur-xl"
          : "bg-sidebar backdrop-blur-xl",
        "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        collapsed ? "w-[76px]" : "w-[248px]"
      )}
    >
      <div className={cn("flex h-16 items-center px-4", collapsed && "justify-center px-2")}>
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <BrandMark />
          {!collapsed && (
            <span className="font-display text-base font-semibold tracking-tight">
              MK Transport
            </span>
          )}
        </Link>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Main">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
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
                      "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition duration-200",
                      collapsed && "justify-center px-2",
                      active
                        ? "bg-sidebar-active text-accent-foreground"
                        : "text-sidebar-muted hover:bg-white/40 hover:text-sidebar-foreground dark:hover:bg-white/5"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="size-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
