import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix = "") {
  const id = crypto.randomBytes(8).toString("hex");
  return prefix ? `${prefix}_${id}` : id;
}

export function signPayload(secret: string, body: string): string {
  return `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;
}

export function getLocalizedField(
  obj: Record<string, unknown>,
  fieldBase: string,
  locale: string
): string {
  const localeKey = `${fieldBase}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`;
  return (obj[localeKey] as string) || (obj[fieldBase] as string) || "";
}

export function formatExpiresAt(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
