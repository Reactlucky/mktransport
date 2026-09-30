"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Search, Settings, Sun, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { MobileBottomNav } from "./mobile-nav";
import { CommandSearch } from "./command-search";
import { Button } from "@/components/ui/button";
import { markThemeManual } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const MENU_MS = 240;

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/trips": "Trips",
  "/dashboard/trips/new": "Add Trip",
  "/dashboard/trucks": "Trucks",
  "/dashboard/customers": "Customers",
  "/dashboard/drivers": "Drivers",
  "/dashboard/attendance": "Attendance",
  "/dashboard/salary": "Salaries",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

function pageTitle(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.includes("/trips/") && pathname.endsWith("/edit")) return "Edit Trip";
  if (pathname.startsWith("/dashboard/trucks/")) return "Truck";
  if (pathname.startsWith("/dashboard/customers/")) return "Customer";
  if (pathname.startsWith("/dashboard/drivers/")) return "Driver";
  return "MK Transport";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState<"closed" | "open" | "closing">("closed");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (menu !== "closing") return;
    const id = window.setTimeout(() => setMenu("closed"), MENU_MS);
    return () => window.clearTimeout(id);
  }, [menu]);

  function openMenu() {
    setMenu("open");
  }

  function closeMenu() {
    setMenu((current) => (current === "open" ? "closing" : current));
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-dvh">
      <div className="sticky top-0 hidden h-dvh shrink-0 p-3 lg:block">
        <Sidebar collapsed={collapsed} floating />
      </div>

      {menu !== "closed" && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className={cn(
              "menu-overlay absolute inset-0 bg-[#070b14]/40 backdrop-blur-sm",
              menu === "closing" && "menu-overlay-out"
            )}
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div
            className={cn(
              "menu-drawer absolute inset-y-3 left-3 z-10",
              menu === "closing" && "menu-drawer-out"
            )}
          >
            <Sidebar onNavigate={closeMenu} floating />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/70 bg-background/70 px-3 backdrop-blur-xl sm:px-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={openMenu}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu className="size-5" /> : <X className="size-5" />}
          </Button>
          <h1 className="min-w-0 flex-1 truncate font-display text-lg font-semibold tracking-tight">
            {pageTitle(pathname)}
          </h1>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-10 items-center gap-2 rounded-full border border-border bg-card/70 px-3 text-sm text-muted-foreground shadow-[var(--shadow-soft)] sm:inline-flex"
          >
            <Search className="size-4" />
            Search
            <kbd className="rounded-md bg-muted px-1.5 py-0.5 text-[11px]">⌘K</kbd>
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => {
              markThemeManual();
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </Button>
          <Link
            href="/dashboard/settings"
            className="inline-flex size-11 items-center justify-center rounded-[14px] text-foreground hover:bg-muted"
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </Link>
        </header>
        <main className="flex-1 px-3 py-5 pb-28 sm:px-5 lg:pb-8">{children}</main>
      </div>

      <MobileBottomNav onMore={openMenu} />
      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
