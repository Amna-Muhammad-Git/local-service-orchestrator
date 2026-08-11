const env = import.meta.env as Record<string, string | undefined>;

export const API_URL = (
  env["VITE_API_URL"] ||
  env["EXPO_PUBLIC_API_URL"] ||
  "http://localhost:8002"
).replace(/\/$/, "");

const TOKEN_KEY = "amigo.token";
const USER_KEY = "amigo.user";

export type AmigoUser = { name?: string | undefined; email?: string | undefined };

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
  getUser(): AmigoUser | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AmigoUser;
    } catch {
      return null;
    }
  },
  setUser(user: AmigoUser) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function friendlyMessage(status: number, detail?: unknown): string {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length && typeof detail[0]?.msg === "string") {
    return detail[0].msg as string;
  }
  if (status === 401) return "Your session has ended. Please log in again.";
  if (status === 400 || status === 422) return "Some details look incorrect. Please check and try again.";
  if (status === 404) return "We could not find what you were looking for.";
  if (status >= 500) return "Amigo's helper service is having trouble right now. Please try again in a moment.";
  return "Something went wrong. Please try again.";
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = false } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = tokenStore.get();
    if (!token) throw new ApiError("Please log in to continue.", 401);
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? null : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "We could not reach Amigo right now. Please check your internet connection and try again.",
      0,
    );
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401) tokenStore.clear();
    const detail = (data as { detail?: unknown } | null)?.detail ?? data;
    throw new ApiError(friendlyMessage(response.status, detail), response.status);
  }

  return data as T;
}

/* ---------- Types ---------- */

export type Provider = {
  id: number | string;
  provider_id?: number | string;
  name: string;
  category?: string;
  service_type?: string;
  area?: string;
  location?: string;
  neighborhood?: string;
  neighborhood_zone?: string;
  rating?: number;
  description?: string;
  bio?: string;
};

export type ServiceRequestResult = {
  id?: number | string;
  request_id?: number | string;
  status?: "ready" | "needs_clarification" | "failed" | "booked" | string;
  intent?: {
    category?: string | null;
    neighborhood_zone?: string | null;
    requested_date?: string | null;
    requested_time?: string | null;
    language?: string;
  };
  service_type?: string;
  category?: string;
  location?: string;
  area?: string;
  date?: string;
  time?: string;
  message?: string;
  clarification?: string;
  clarification_message?: string;
  needs_clarification?: boolean;
  providers?: Provider[];
  results?: Provider[];
};

export type Booking = {
  id?: number | string;
  booking_id?: number | string;
  provider_name?: string;
  provider?: { name?: string; category?: string; area?: string } | string;
  category?: string;
  service_type?: string;
  area?: string;
  location?: string;
  neighborhood_zone?: string;
  booking_time?: string;
  status?: string;
};

/* ---------- Endpoints ---------- */

export const registerUser = (payload: { name: string; email: string; password: string }) =>
  apiFetch<unknown>("/register", { method: "POST", body: payload });

export const loginUser = (payload: { email: string; password: string }) =>
  apiFetch<{ access_token: string; token_type?: string }>("/login", {
    method: "POST",
    body: payload,
  });

export async function createServiceRequest(message: string): Promise<ServiceRequestResult> {
  const response = await apiFetch<{
    request_id: number;
    status: string;
    intent?: ServiceRequestResult["intent"];
    providers?: Array<{
      provider_id: number;
      name: string;
      category: string;
      neighborhood_zone: string;
      rating: number;
      rank?: number;
    }>;
    trace?: unknown[];
  }>("/service-requests", {
    method: "POST",
    body: { message },
    auth: true,
  });

  return {
    ...response,
    id: response.request_id,
    request_id: response.request_id,
    providers: (response.providers || []).map((provider) => ({
      id: provider.provider_id,
      provider_id: provider.provider_id,
      name: provider.name,
      category: provider.category,
      area: provider.neighborhood_zone,
      neighborhood_zone: provider.neighborhood_zone,
      rating: provider.rating,
      description: `Local ${provider.category} service in ${provider.neighborhood_zone}.`,
    })),
  };
}

export const bookProvider = (
  requestId: string | number,
  payload: { provider_id: number | string; booking_time: string },
) =>
  apiFetch<unknown>(`/service-requests/${requestId}/book`, {
    method: "POST",
    body: payload,
    auth: true,
  });

export const getBookings = () => apiFetch<Booking[]>("/bookings", { auth: true });

/* ---------- Helpers ---------- */

export function providerArea(p: Provider) {
  return p.area || p.neighborhood || p.neighborhood_zone || p.location || "Nearby";
}

export function providerCategory(p: Provider) {
  return p.category || p.service_type || "Local service";
}

export function providerDescription(p: Provider) {
  return p.description || p.bio || "A trusted local helper in your area.";
}
