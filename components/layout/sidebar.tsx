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
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  floating?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-neutral-content/10 bg-neutral text-neutral-content",
        "transition-[width] duration-200 ease-out",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      <div className={cn("flex items-center px-3 py-3", collapsed && "justify-center px-2")}>
        <Link href="/dashboard" className="flex w-full items-center justify-center" onClick={onNavigate}>
          <BrandMark className="h-auto w-full" />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label="Main">
        {groups.map((group) => (
          <ul key={group.label} className="menu menu-md w-full px-0">
            {!collapsed && <li className="menu-title text-neutral-content/55">{group.label}</li>}
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(collapsed && "justify-center", active && "menu-active")}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="size-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </nav>
    </aside>
  );
}
