import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BigButton, Field, Notice, inputClass } from "@/components/ui-kit";
import {
  ApiError,
  bookProvider,
  providerArea,
  providerCategory,
  type Provider,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { requestStore, type StoredRequest } from "@/lib/request-store";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Confirm your booking — Amigo" },
      {
        name: "description",
        content: "Choose a date and time and confirm your booking with your local helper.",
      },
      { property: "og:title", content: "Confirm your booking — Amigo" },
      {
        property: "og:description",
        content: "Pick a date and time and confirm your Amigo booking.",
      },
    ],
  }),
  component: BookingPage,
});

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readableDateTime(date: string, time: string) {
  if (!date || !time) return "";
  const dt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

function BookingPage() {
  const navigate = useNavigate();
  const { ready, isLoggedIn } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [stored, setStored] = useState<StoredRequest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("14:00");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (ready && !isLoggedIn) navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }, [ready, isLoggedIn, navigate]);

  useEffect(() => {
    const s = requestStore.load();
    setStored(s);
    setProvider(requestStore.loadProvider());
    if (s?.result?.date) setDate(s.result.date);
    if (s?.result?.time && /^\d{2}:\d{2}/.test(s.result.time)) setTime(s.result.time.slice(0, 5));
    setLoaded(true);
  }, []);

  const requestId = stored?.result?.id ?? stored?.result?.request_id;
  const readable = readableDateTime(date, time);

  async function confirm() {
    setError("");
    setFieldError("");
    if (!date || !time) {
      setFieldError("Please choose both a date and a time.");
      return;
    }
    if (!provider || requestId === undefined) {
      setError("We lost your request details. Please ask Amigo for help again.");
      return;
    }
    setLoading(true);
    try {
      await bookProvider(requestId, {
        provider_id: provider.id,
        booking_time: `${date}T${time}:00`,
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Your session has ended. Please log in again.");
        setTimeout(() => navigate({ to: "/auth", search: { mode: "login" } }), 1200);
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AppShell title="Booking sent" subtitle="Nice work!">
        <div className="amigo-surface space-y-4 p-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden="true" />
          <p className="text-xl font-bold">Your request has been sent to {provider?.name}.</p>
          <p className="text-base text-muted-foreground">
            It is <strong>Pending</strong> for now. Your helper will confirm it soon — you can check
            the status any time in My Bookings.
          </p>
          <BigButton onClick={() => navigate({ to: "/bookings" })}>See My Bookings</BigButton>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Choose a time" subtitle="Then confirm your booking.">
      <Link
        to="/results"
        className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Back to helpers
      </Link>

      {!loaded ? null : !provider ? (
        <div className="amigo-surface mt-6 space-y-4 p-6 text-center">
          <p className="text-lg font-semibold">Please choose a helper first.</p>
          <BigButton onClick={() => navigate({ to: "/home" })}>Ask Amigo for help</BigButton>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          <section className="amigo-surface p-5">
            <p className="text-base font-semibold text-muted-foreground">Your chosen helper</p>
            <h2 className="mt-1 text-2xl font-extrabold">{provider.name}</h2>
            <p className="text-base font-semibold text-primary">{providerCategory(provider)}</p>
            <p className="text-base text-muted-foreground">{providerArea(provider)}</p>
            {typeof provider.rating === "number" ? (
              <p className="mt-2 flex items-center gap-1 text-base font-bold">
                <Star className="h-5 w-5 fill-current text-primary" aria-hidden="true" />
                {provider.rating.toFixed(1)}
              </p>
            ) : null}
          </section>

          <div className="amigo-surface space-y-5 p-5">
            <Field id="date" label="Which day?">
              <input
                id="date"
                type="date"
                min={todayISO()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id="time" label="What time?">
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
              />
            </Field>
            {fieldError ? <Notice message={fieldError} /> : null}
          </div>

          <section className="rounded-2xl bg-secondary p-5">
            <h2 className="text-lg font-bold">Please check before you confirm</h2>
            <dl className="mt-3 space-y-2 text-base">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Helper</dt>
                <dd className="font-semibold">{provider.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Service</dt>
                <dd className="font-semibold">{providerCategory(provider)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Area</dt>
                <dd className="font-semibold">{providerArea(provider)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">When</dt>
                <dd className="font-semibold">{readable || "Please pick a date and time"}</dd>
              </div>
            </dl>
          </section>

          <p className="text-base text-muted-foreground">
            Your booking will start as <strong>Pending</strong> until your helper accepts it.
          </p>

          <Notice message={error} />

          <BigButton onClick={confirm} loading={loading}>
            {loading ? "Sending your booking…" : "Confirm Booking"}
          </BigButton>
        </div>
      )}
    </AppShell>
  );
}
