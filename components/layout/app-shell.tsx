"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus } from "lucide-react";
import { Sidebar } from "./sidebar";
import { MobileBottomNav } from "./mobile-nav";
import { OfflineBanner } from "@/components/providers/offline-banner";
import { Button } from "@/components/ui/button";
import { TruckIcon } from "@/components/icons/transport";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const showAddTrip =
    !pathname.startsWith("/dashboard/trips/new") &&
    !pathname.includes("/edit");

  return (
    <div className="flex min-h-dvh bg-background">
      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:shrink-0">
        <Sidebar collapsed={collapsed} />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur lg:h-16 lg:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden size-10 lg:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu className="size-5" /> : <X className="size-5" />}
          </Button>

          <div className="flex items-center gap-2 lg:hidden">
            <TruckIcon className="size-5 text-primary" />
            <span className="font-display text-sm font-semibold">
              MK Transport
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {showAddTrip && (
              <Link
                href="/dashboard/trips/new"
                className="hidden h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover sm:inline-flex"
              >
                <Plus className="size-4" />
                Add Trip
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:px-6 md:pb-8 lg:px-8">
          {children}
        </main>
      </div>

      <MobileBottomNav onMore={() => setSidebarOpen(true)} />
    </div>
  );
}
