const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.115:8002";

async function apiRequest(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (error) {
    throw new Error("Amigo could not reach the server. Check that the API is running and the device is on the same network.");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof body.detail === "string" ? body.detail : body.detail?.message;
    throw new Error(detail || `Request failed with status ${response.status}`);
  }
  return body;
}

export function registerUser({ name, email, password }) {
  return apiRequest("/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
}

export function loginUser({ email, password }) {
  return apiRequest("/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function createServiceRequest(message, token) {
  return apiRequest("/service-requests", { method: "POST", body: JSON.stringify({ message }) }, token);
}

export function bookServiceRequest(requestId, providerId, bookingTime, token) {
  return apiRequest(`/service-requests/${requestId}/book`, {
    method: "POST",
    body: JSON.stringify({ provider_id: providerId, booking_time: bookingTime }),
  }, token);
}

export function getBookings(token) {
  return apiRequest("/bookings", {}, token);
}

export { API_BASE_URL };
