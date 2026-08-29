import "server-only";
import { config } from "@/lib/config";

function hasApiFootballErrors(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const errors = (value as Record<string, unknown>).errors;

  if (!errors) {
    return false;
  }

  if (Array.isArray(errors)) {
    return errors.length > 0;
  }

  if (typeof errors === "object") {
    return Object.keys(errors as Record<string, unknown>).length > 0;
  }

  if (typeof errors === "string") {
    return errors.trim().length > 0;
  }

  return Boolean(errors);
}

function formatApiFootballErrors(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "Unknown API-Football error";
  }

  const errors = (value as Record<string, unknown>).errors;

  if (typeof errors === "string") {
    return errors;
  }

  try {
    return JSON.stringify(errors);
  } catch {
    return "Unknown API-Football error";
  }
}

export async function apiFootballFetch<T>(
  path: string,
  params?: Record<string, string | number>,
  revalidate = 60
): Promise<T> {
  const url = new URL(`${config.apiFootballBaseUrl}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": config.apiFootballKey,
    },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data: unknown = await res.json();

  if (hasApiFootballErrors(data)) {
    throw new Error(
      `API-Football error: ${formatApiFootballErrors(data)}`
    );
  }

  return data as T;
}
