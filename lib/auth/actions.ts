"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";
import {
  SESSION_COOKIE,
  createSessionToken,
  readSession,
  sessionCookieOptions,
  type SessionUser,
} from "@/lib/auth/session";

type LoginRow = { id: string; username: string };

export async function login(input: {
  username: string;
  password: string;
}): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a username and password." };
  }

  if (!process.env.AUTH_SECRET) {
    return {
      error: "Sign-in is not configured. Add AUTH_SECRET to the environment.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("login_user", {
    p_username: parsed.data.username,
    p_password: parsed.data.password,
  });

  if (error) {
    const missingFunction =
      error.code === "PGRST202" ||
      error.message.toLowerCase().includes("login_user");
    if (missingFunction) {
      return {
        error:
          "User login is not set up yet. Run supabase/migrations/002_users.sql in the Supabase SQL editor.",
      };
    }
    return { error: "Unable to sign in. Please try again." };
  }

  const rows = (Array.isArray(data) ? data : data ? [data] : []) as LoginRow[];
  const user = rows[0];
  if (!user?.id || !user.username) {
    return { error: "Invalid username or password. Please try again." };
  }

  const token = await createSessionToken({
    id: user.id,
    username: user.username,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
  return {};
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return readSession(cookieStore.get(SESSION_COOKIE)?.value);
}
