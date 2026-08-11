import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, CalendarDays, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BigButton, LoadingBlock, Notice } from "@/components/ui-kit";
import { ApiError, getBookings, type Booking } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Amigo" },
      {
        name: "description",
        content: "See all your Amigo bookings with helper, area, date, time and status.",
      },
      { property: "og:title", content: "My Bookings — Amigo" },
      { property: "og:description", content: "All your Amigo bookings in one simple list." },
    ],
  }),
  component: BookingsPage,
});

function formatWhen(value?: string) {
  if (!value) return { date: "Date to be confirmed", time: "" };
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return { date: value, time: "" };
  return {
    date: dt.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }),
    time: dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  };
}

function StatusBadge({ status }: { status?: string }) {
  const value = (status || "pending").toLowerCase();
  const label = value.charAt(0).toUpperCase() + value.slice(1);
  const tone =
    value === "confirmed"
      ? "bg-primary text-primary-foreground"
      : value === "cancelled"
        ? "bg-destructive/15 text-destructive"
        : "bg-accent text-accent-foreground";
  return (
    <span className={`shrink-0 rounded-full px-4 py-2 text-base font-bold ${tone}`}>{label}</span>
  );
}

function providerName(b: Booking) {
  if (typeof b.provider === "string") return b.provider;
  return b.provider_name || b.provider?.name || "Your helper";
}

function providerArea(b: Booking) {
  return b.area || b.location || b.neighborhood_zone || "Your area";
}

function BookingsPage() {
  const navigate = useNavigate();
  const { ready, isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Your session has ended. Please log in again.");
        setTimeout(() => navigate({ to: "/auth", search: { mode: "login" } }), 1200);
      } else {
        setError(err instanceof ApiError ? err.message : "We could not load your bookings.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) {
      navigate({ to: "/auth", search: { mode: "login" }, replace: true });
      return;
    }
    void load();
  }, [ready, isLoggedIn, navigate, load]);

  return (
    <AppShell title="My Bookings" subtitle="Everything you have booked with Amigo.">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl border-2 border-border bg-card px-5 text-base font-bold hover:bg-secondary"
        >
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
          Refresh
        </button>
      </div>

      <Notice message={error} />

      {loading ? (
        <LoadingBlock label="Getting your bookings…" />
      ) : bookings.length === 0 && !error ? (
        <div className="amigo-surface space-y-4 p-6 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
          <p className="text-xl font-bold">No bookings yet</p>
          <p className="text-base text-muted-foreground">
            When you book a helper, it will appear here so you can check the details any time.
          </p>
          <BigButton onClick={() => navigate({ to: "/home" })}>Ask Amigo for help</BigButton>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b, i) => {
            const when = formatWhen(b.booking_time);
            return (
            <li key={String(b.id ?? b.booking_id ?? i)} className="amigo-surface p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-extrabold">{providerName(b)}</h2>
                    <p className="text-base font-semibold text-primary">
                      {b.category || b.service_type || "Local service"}
                    </p>
                  </div>
                  <StatusBadge {...(b.status !== undefined ? { status: b.status } : {})} />
                </div>
                <p className="mt-2 flex items-center gap-2 text-base text-muted-foreground">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  {providerArea(b)}
                </p>
                <p className="mt-1 flex items-center gap-2 text-base">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  {when.date}
                  {when.time ? ` at ${when.time}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
