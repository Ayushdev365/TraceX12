const UA = "VASPTrace/1.0 (SIH26182 investigative MVP)";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Public explorer fetch with one retry on 429/503. Does not retry 4xx validation errors. */
export async function fetchExplorerJson(url: string, timeoutMs = 8000): Promise<unknown> {
  let last: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { Accept: "application/json", "User-Agent": UA },
      });
      if (res.status === 429 || res.status === 503) {
        last = new Error(`HTTP ${res.status}`);
        await sleep(400 * 2 ** attempt);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      last = err instanceof Error ? err : new Error("fetch failed");
      const msg = last.message;
      if (msg.includes("HTTP 4") && !msg.includes("HTTP 429")) throw last;
    } finally {
      clearTimeout(timer);
    }
  }
  throw last ?? new Error("fetch failed");
}
