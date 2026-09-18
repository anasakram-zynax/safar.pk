export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  if (!path.startsWith("/")) throw new Error("API path must start with /");

  const { token, body, headers: inputHeaders, ...init } = options;
  const headers = new Headers(inputHeaders);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const isJsonBody =
    body !== null &&
    body !== undefined &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer);
  if (isJsonBody && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    body: isJsonBody
      ? JSON.stringify(body)
      : (body as BodyInit | null | undefined),
  });
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new ApiError(
        "The server returned an invalid JSON response",
        response.status,
      );
    }
  }
  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }
  return payload as T;
}
