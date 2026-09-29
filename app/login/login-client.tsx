"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TruckIcon } from "@/components/icons/transport";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? "form");
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) {
        setFormError("Invalid email or password. Please try again.");
        return;
      }
      router.replace(redirect);
      router.refresh();
    } catch {
      setFormError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-14 items-center px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TruckIcon className="size-4" />
          </span>
          <span className="font-display text-sm font-semibold">
            MK Transport
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your transport management dashboard.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password}</p>
              )}
            </div>

            {formError && (
              <div
                className="rounded-md border border-danger/30 bg-danger-muted px-3 py-2 text-sm text-danger"
                role="alert"
              >
                {formError}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
