"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout as signOut } from "@/lib/auth/actions";
import { PageHeader } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";

export function SettingsPageClient() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((user) => {
      if (!cancelled) setUsername(user?.username ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await signOut();
      toast("Signed out", "success");
      router.replace("/login");
      router.refresh();
    } catch {
      toast("Unable to sign out. Please try again.", "error");
    } finally {
      setLoggingOut(false);
    }
  }

  const currentTheme = theme ?? "system";

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Settings" description="Appearance and account." />

      <Card className="mb-4">
        <CardContent className="space-y-4 py-5">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select
              id="theme"
              value={currentTheme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Active: {resolvedTheme ?? "—"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant={currentTheme === "light" ? "primary" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="size-4" />
                Light
              </Button>
              <Button
                type="button"
                variant={currentTheme === "dark" ? "primary" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="size-4" />
                Dark
              </Button>
              <Button
                type="button"
                variant={currentTheme === "system" ? "primary" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                <Monitor className="size-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 py-5">
          <div>
            <p className="text-sm font-medium">Account</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {username ? `Signed in as ${username}` : "Signed in"}
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            loading={loggingOut}
            onClick={logout}
          >
            <LogOut className="size-4" />
            {loggingOut ? "Signing out..." : "Sign out"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
