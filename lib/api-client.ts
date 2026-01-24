import { apiConfig } from "./config";

type FetchOptions = RequestInit & { token?: string };

export async function fetchJson<TResponse>(
  path: string,
  options: FetchOptions = {}
): Promise<TResponse> {
  const { token, headers, ...rest } = options;
  const res = await fetch(resolveUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-ID": apiConfig.tenantId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const message = await safeErrorMessage(res);
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as TResponse;
  }

  return (await res.json()) as TResponse;
}

function resolveUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${apiConfig.baseUrl}${path}`;
}

async function safeErrorMessage(res: Response) {
  try {
    const data = await res.json();
    if (data?.message) return data.message;
    return JSON.stringify(data);
  } catch {
    return res.statusText;
  }
}
