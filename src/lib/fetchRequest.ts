const DEFAULT_TIMEOUT_MS = 30000;

export interface FetchResult {
  status: number;
  headers: Record<string, string>;
  bodyText: string;
  responseTime: number;
  error?: string;
}

export async function fetchRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: string
): Promise<FetchResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: method !== "GET" && body ? body : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;
    const bodyText = await res.text();
    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      resHeaders[k] = v;
    });
    return { status: res.status, headers: resHeaders, bodyText, responseTime };
  } catch (err) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: 0,
      headers: {},
      bodyText: "",
      responseTime,
      error: message,
    };
  }
}
