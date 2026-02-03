import type { KeyValue } from "@/components/KeyValueEditor";
import { colors } from "@/theme";
import type { AuthType } from "./types";

export function buildUrl(
  baseUrl: string,
  params: KeyValue[],
  apiKeyQuery?: { name: string; value: string }
): string {
  const search = new URLSearchParams();
  params
    .filter((p) => p.key.trim())
    .forEach(({ key, value }) => search.append(key, value));
  if (apiKeyQuery?.name && apiKeyQuery?.value) {
    search.append(apiKeyQuery.name, apiKeyQuery.value);
  }
  const qs = search.toString();
  const sep = baseUrl.includes("?") ? "&" : "?";
  return qs ? `${baseUrl}${sep}${qs}` : baseUrl;
}

export function buildHeaders(
  rows: KeyValue[],
  auth: {
    type: AuthType;
    bearer?: string;
    apiKey?: { name: string; value: string; location: "header" | "query" };
  }
): Record<string, string> {
  const out: Record<string, string> = {};
  rows
    .filter((r) => r.key.trim())
    .forEach(({ key, value }) => {
      out[key.trim()] = value;
    });
  if (auth.type === "bearer" && auth.bearer?.trim()) {
    out["Authorization"] = `Bearer ${auth.bearer.trim()}`;
  }
  if (
    auth.type === "apiKey" &&
    auth.apiKey?.location === "header" &&
    auth.apiKey?.name &&
    auth.apiKey?.value
  ) {
    out[auth.apiKey.name.trim()] = auth.apiKey.value;
  }
  return out;
}

export function statusColor(status: number): string {
  if (status >= 200 && status < 300) return colors.success;
  if (status >= 300 && status < 400) return colors.warning;
  if (status >= 400) return colors.danger;
  return colors.muted;
}
