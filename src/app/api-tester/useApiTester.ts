import { fetchRequest } from "@/lib/fetchRequest";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { buildHeaders, buildUrl } from "./requestUtils";
import { initialRequest, initialUi, type Request, type Ui } from "./types";
import { useCollectionContext } from "@/app/context/CollectionContext";

export type FetchResult = Awaited<ReturnType<typeof fetchRequest>>;

function resolveUrl(pathOrUrl: string, baseUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!baseUrl) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${base}${path}`;
}

export function useApiTester() {
  const { currentBaseUrl, currentCollectionId } = useCollectionContext();
  const [request, setRequest] = useState<Request>(initialRequest);
  const [ui, setUi] = useState<Ui>(initialUi);
  const [response, setResponse] = useState<FetchResult | null>(null);

  const updateRequest = <K extends keyof Request>(key: K, value: Request[K]) =>
    setRequest((r) => ({ ...r, [key]: value }));
  const updateUi = <K extends keyof Ui>(key: K, value: Ui[K]) =>
    setUi((u) => ({ ...u, [key]: value }));

  const apiKeyQuery =
    request.authType === "apiKey" &&
    request.apiKeyLocation === "query" &&
    request.apiKeyName.trim() &&
    request.apiKeyValue
      ? { name: request.apiKeyName.trim(), value: request.apiKeyValue }
      : undefined;

  const handleSend = async () => {
    updateUi("loading", true);
    setResponse(null);
    try {
      const base = currentCollectionId != null ? currentBaseUrl : "";
      const fullUrl = resolveUrl(request.url, base);
      const finalUrl = buildUrl(fullUrl, request.params, apiKeyQuery);
      const headerRows = request.headers
        .filter((h) => h.key.trim())
        .map((h) => ({ key: h.key.trim(), value: h.value }));
      const auth =
        request.authType === "bearer"
          ? { type: "bearer" as const, bearer: request.bearerToken }
          : request.authType === "apiKey"
          ? {
              type: "apiKey" as const,
              apiKey: {
                name: request.apiKeyName,
                value: request.apiKeyValue,
                location: request.apiKeyLocation,
              },
            }
          : { type: "none" as const };
      const headerRecord = buildHeaders(headerRows, auth);

      let body: string | undefined;
      if (request.method !== "GET") {
        if (request.bodyType === "json") {
          body = request.bodyJson;
          if (!headerRecord["Content-Type"])
            headerRecord["Content-Type"] = "application/json";
        } else if (request.bodyType === "raw") {
          body = request.bodyRaw;
        } else {
          const formParams = new URLSearchParams();
          request.bodyForm
            .filter((f) => f.key.trim())
            .forEach(({ key, value }) => formParams.append(key, value));
          body = formParams.toString();
          if (!headerRecord["Content-Type"])
            headerRecord["Content-Type"] = "application/x-www-form-urlencoded";
        }
      }

      const result = await fetchRequest(
        request.method,
        finalUrl,
        headerRecord,
        body
      );
      setResponse(result);
    } finally {
      updateUi("loading", false);
    }
  };

  const copyResponse = async () => {
    if (response?.bodyText) await Clipboard.setStringAsync(response.bodyText);
  };

  let parsedJson: unknown = null;
  let isJson = false;
  if (response?.bodyText?.trim()) {
    try {
      parsedJson = JSON.parse(response.bodyText);
      isJson = true;
    } catch {
      // ignore
    }
  }

  const loadRequestData = (r: Request) => setRequest(r);

  return {
    request,
    ui,
    response,
    updateRequest,
    updateUi,
    handleSend,
    copyResponse,
    parsedJson,
    isJson,
    loadRequestData,
  };
}
