import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Star, MapPin, MessageCircleQuestion, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BigButton } from "@/components/ui-kit";
import { providerArea, providerCategory, providerDescription, type Provider } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { requestStore, type StoredRequest } from "@/lib/request-store";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Helpers near you — Amigo" },
      {
        name: "description",
        content: "See trusted local helpers matched to your request, sorted by rating.",
      },
      { property: "og:title", content: "Helpers near you — Amigo" },
      {
        property: "og:description",
        content: "Trusted local helpers matched to your request, sorted by rating.",
      },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const { ready, isLoggedIn } = useAuth();
  const [stored, setStored] = useState<StoredRequest | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (ready && !isLoggedIn) navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }, [ready, isLoggedIn, navigate]);

  useEffect(() => {
    setStored(requestStore.load());
    setLoaded(true);
  }, []);

  const result = stored?.result;

  const providers = useMemo(() => {
    const list = result?.providers ?? result?.results ?? [];
    return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [result]);

  const clarification =
    result?.clarification ||
    result?.clarification_message ||
    (result?.needs_clarification || result?.status === "needs_clarification" ? "" : undefined);

  function choose(provider: Provider) {
    requestStore.saveProvider(provider);
    navigate({ to: "/booking" });
  }

  const summaryBits = [
    result?.service_type || result?.category || result?.intent?.category,
    result?.location || result?.area || result?.intent?.neighborhood_zone,
    result?.date || result?.intent?.requested_date,
    result?.time || result?.intent?.requested_time,
  ].filter(Boolean) as string[];

  return (
    <AppShell title="Helpers near you" subtitle="Pick the person you like best.">
      <Link
        to="/home"
        className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Ask something else
      </Link>

      {!loaded ? null : !stored ? (
        <div className="amigo-surface mt-6 space-y-4 p-6 text-center">
          <p className="text-lg font-semibold">You have not asked for help yet.</p>
          <BigButton onClick={() => navigate({ to: "/home" })}>Ask Amigo for help</BigButton>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          <section className="rounded-2xl bg-secondary p-5">
            <h2 className="text-lg font-bold">You asked for</h2>
            <p className="mt-1 text-lg">“{stored.message}”</p>
            {summaryBits.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {summaryBits.map((bit) => (
                  <li
                    key={bit}
                    className="rounded-full bg-card px-4 py-2 text-base font-semibold text-foreground"
                  >
                    {bit}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {clarification !== undefined ? (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-accent bg-accent/40 p-5">
              <MessageCircleQuestion
                className="mt-1 h-6 w-6 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="text-lg font-bold">Amigo needs a little more detail</p>
                <p className="mt-1 text-base">
                  {clarification ||
                    "Please tell Amigo what service you need and which area you are in — for example: “I need a plumber in Gulshan tomorrow at 3 PM”."}
                </p>
                <Link
                  to="/home"
                  className="mt-3 inline-block text-base font-bold text-primary underline underline-offset-4"
                >
                  Try again with more detail
                </Link>
              </div>
            </div>
          ) : null}

          {providers.length === 0 ? (
            <div className="amigo-surface space-y-4 p-6 text-center">
              <p className="text-xl font-bold">No helpers found yet</p>
              <p className="text-base text-muted-foreground">
                Amigo could not find anyone for this request. Try a nearby area, or describe the
                help in a different way.
              </p>
              <BigButton variant="outline" onClick={() => navigate({ to: "/home" })}>
                Ask again
              </BigButton>
            </div>
          ) : (
            <ul className="space-y-4">
              {providers.map((p) => (
                <li key={String(p.id)} className="amigo-surface p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-extrabold">{p.name}</h3>
                      <p className="text-base font-semibold text-primary">{providerCategory(p)}</p>
                    </div>
                    {typeof p.rating === "number" ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-3 py-2 text-base font-bold">
                        <Star className="h-5 w-5 fill-current text-primary" aria-hidden="true" />
                        {p.rating.toFixed(1)}
                        <span className="sr-only">out of 5 stars</span>
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-base text-muted-foreground">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                    {providerArea(p)}
                  </p>
                  <p className="mt-2 text-base">{providerDescription(p)}</p>
                  <div className="mt-4">
                    <BigButton onClick={() => choose(p)}>Choose {p.name}</BigButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AppShell>
  );
}
