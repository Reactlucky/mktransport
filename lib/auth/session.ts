export const SESSION_COOKIE = "mk_session";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  username: string;
};

type SessionPayload = SessionUser & { exp: number };

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): Uint8Array {
  const padded =
    value.replaceAll("-", "+").replaceAll("_", "/") +
    "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string, usage: "sign" | "verify") {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");

  const payload: SessionPayload = {
    id: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const payloadPart = encodeBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const key = await hmacKey(secret, "sign");
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadPart)
  );
  return `${payloadPart}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function readSession(
  token: string | undefined
): Promise<SessionUser | null> {
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const separator = token.indexOf(".");
  if (separator <= 0) return null;
  const payloadPart = token.slice(0, separator);
  const signaturePart = token.slice(separator + 1);
  if (!signaturePart) return null;

  try {
    const key = await hmacKey(secret, "verify");
    const signatureBytes = decodeBase64Url(signaturePart);
    const signature = new Uint8Array(signatureBytes.byteLength);
    signature.set(signatureBytes);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(payloadPart)
    );
    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(payloadPart))
    ) as SessionPayload;

    if (
      typeof payload.id !== "string" ||
      typeof payload.username !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return { id: payload.id, username: payload.username };
  } catch {
    return null;
  }
}
