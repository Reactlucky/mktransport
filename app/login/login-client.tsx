"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth/actions";
import { loginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand-mark";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    const parsed = loginSchema.safeParse({ username, password });
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
      const result = await login(parsed.data);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      const nextPath =
        redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/dashboard";
      router.replace(nextPath);
      router.refresh();
    } catch {
      setFormError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <Link href="/" className="mb-8 flex w-full max-w-sm flex-col items-center px-2 text-center">
          <BrandMark className="h-auto w-full max-w-xs" />
          <span className="mt-2 max-w-xs text-sm text-base-content/70">
            The office book for trucks, trips, and rent.
          </span>
        </Link>

        <div className="card card-border w-full max-w-md bg-base-100 shadow-none">
          <div className="card-body">
          <h1 className="font-display text-3xl font-medium">Sign in</h1>
          <p className="text-sm text-base-content/70">
            Use the username from the office.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-danger">{errors.username}</p>
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
                className="alert alert-soft alert-error text-sm"
                role="alert"
              >
                {formError}
              </div>
            )}

            <Button type="submit" className="btn-block" loading={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          </div>
        </div>
      </main>
      <footer className="px-6 pb-8 text-center text-sm text-muted-foreground">
        <p>Transport management for a small fleet.</p>
        <p className="mt-1">Record the day&apos;s trips without the notebook.</p>
      </footer>
    </div>
  );
}
