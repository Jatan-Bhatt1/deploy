import Constants from "expo-constants";

function getLanIpFromExpo(): string | null {
  try {
    // Expo Go: hostUri like 192.168.1.23:19000 or 192.168.1.23:8081
    // @ts-ignore
    const hostUri: string | undefined = (Constants as any)?.expoGoConfig?.hostUri || (Constants as any)?.debuggerHost;
    if (!hostUri) return null;
    const host = hostUri.split("@").pop() || hostUri; // handles formats with user@host
    const ip = host.split(":")[0];
    if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return ip;
    return null;
  } catch {
    return null;
  }
}

export function resolveApiBase(): string {
  const envBase = process.env.EXPO_PUBLIC_API_BASE;
  if (envBase && envBase.startsWith("http")) return envBase.replace(/\/$/, "");

  const ip = getLanIpFromExpo();
  if (ip) return `http://${ip}:5000`;

  // Last resort (works on iOS simulator and web, not on real devices)
  return "http://localhost:5000";
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 10000, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // @ts-ignore
    return await fetch(input, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function postJson<T>(path: string, body: unknown, extraHeaders: Record<string, string> = {}): Promise<Response> {
  const base = resolveApiBase();
  try {
    return await fetchWithTimeout(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...extraHeaders },
      body: JSON.stringify(body),
      timeoutMs: 12000,
    });
  } catch (e) {
    const msg = `Network error reaching ${base}${path}. Configure EXPO_PUBLIC_API_BASE or ensure device can reach the server.`;
    // Re-throw with more context so callers can display
    throw new Error(msg);
  }
}

export async function getJson(path: string, extraHeaders: Record<string, string> = {}): Promise<Response> {
  const base = resolveApiBase();
  try {
    return await fetchWithTimeout(`${base}${path}`, {
      method: "GET",
      headers: { ...extraHeaders },
      timeoutMs: 12000,
    });
  } catch (e) {
    throw new Error(`Network error reaching ${base}${path}.`);
  }
}


