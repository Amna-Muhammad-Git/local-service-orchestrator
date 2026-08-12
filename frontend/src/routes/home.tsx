import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BigButton, Notice, LoadingBlock } from "@/components/ui-kit";
import { ApiError, createServiceRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { requestStore } from "@/lib/request-store";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Ask for help — Amigo" },
      {
        name: "description",
        content:
          "Tell Amigo what help you need in English, Urdu or Roman Urdu and see trusted helpers near you.",
      },
      { property: "og:title", content: "Ask for help — Amigo" },
      {
        property: "og:description",
        content: "Describe what you need and Amigo finds trusted local helpers.",
      },
    ],
  }),
  component: HomePage,
});

const examples = [
  "I need an electrician in Johar tomorrow at 2 PM",
  "Mujhe Gulshan mein plumber chahiye",
  "Johar mein AC repair karwana hai",
];

const quickServices = ["Plumber", "Electrician", "AC repair", "Tutor", "Carpenter", "Cleaner"];

function HomePage() {
  const navigate = useNavigate();
  const { ready, isLoggedIn } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && !isLoggedIn) navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }, [ready, isLoggedIn, navigate]);

  async function handleFindHelp() {
    setError("");
    if (message.trim().length < 3) {
      setError("Please tell Amigo what help you need, for example: “I need a plumber in Gulshan”.");
      return;
    }
    setLoading(true);
    try {
      const result = await createServiceRequest(message.trim());
      requestStore.save({ message: message.trim(), result });
      navigate({ to: "/results" });
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

  return (
    <AppShell title="What help do you need?" subtitle="Write it in your own words.">
      {loading ? (
        <LoadingBlock label="Amigo is looking for helpers near you…" />
      ) : (
        <div className="space-y-6">
          <div className="amigo-surface p-5">
            <label htmlFor="request" className="block text-xl font-bold">
              Tell Amigo what you need
            </label>
            <p className="mt-1 text-base text-muted-foreground">
              You can write in English, اردو, or Roman Urdu — whichever is easiest for you.
            </p>
            <textarea
              id="request"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="For example: I need an electrician in Johar tomorrow at 2 PM"
              className="mt-4 w-full rounded-2xl border-2 border-input bg-background px-4 py-4 text-lg leading-relaxed"
            />
          </div>

          <section aria-labelledby="quick-help">
            <h2 id="quick-help" className="text-lg font-bold">
              Common services — tap one to add it
            </h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {quickServices.map((service) => (
                <li key={service}>
                  <button
                    type="button"
                    onClick={() =>
                      setMessage((m) =>
                        m.trim() ? `${m.trim()} ${service}` : `I need a ${service.toLowerCase()} `,
                      )
                    }
                    className="min-h-[52px] rounded-2xl border-2 border-border bg-card px-5 text-lg font-semibold transition hover:bg-secondary"
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="examples" className="rounded-2xl bg-secondary p-5">
            <h2 id="examples" className="text-lg font-bold">
              Examples you can copy
            </h2>
            <ul className="mt-3 space-y-2">
              {examples.map((ex) => (
                <li key={ex}>
                  <button
                    type="button"
                    onClick={() => setMessage(ex)}
                    className="w-full rounded-xl bg-card px-4 py-3 text-left text-base font-medium hover:brightness-105"
                  >
                    “{ex}”
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <Notice message={error} />

          <BigButton onClick={handleFindHelp}>
            <Search className="h-6 w-6" aria-hidden="true" />
            Find Help
          </BigButton>
        </div>
      )}
    </AppShell>
  );
}
