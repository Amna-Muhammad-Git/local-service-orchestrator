import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, MessageCircle, MapPin, CalendarCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amigo — Find trusted local help near you" },
      {
        name: "description",
        content:
          "Amigo helps you find trusted plumbers, electricians, tutors and other local helpers. Ask in English, Urdu or Roman Urdu.",
      },
      { property: "og:title", content: "Amigo — Find trusted local help near you" },
      {
        property: "og:description",
        content: "Tell Amigo what help you need and choose a trusted nearby helper in minutes.",
      },
    ],
  }),
  component: Welcome,
});

const steps = [
  { icon: MessageCircle, text: "Tell Amigo what help you need" },
  { icon: MapPin, text: "Choose a nearby helper you like" },
  { icon: CalendarCheck, text: "Pick a time and confirm" },
];

function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-12">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-accent">
            <HeartHandshake className="h-10 w-10 text-primary" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight">Amigo</h1>
          <p className="mt-4 text-xl leading-relaxed text-muted-foreground">
            Your friendly local helper finder. Just say what you need — a plumber, an electrician, a
            tutor — and Amigo will find trusted people near you.
          </p>
          <p className="mt-3 text-lg font-semibold text-primary">
            You can write in English, اردو, or Roman Urdu.
          </p>
        </div>

        <ul className="amigo-surface space-y-4 p-6">
          {steps.map(({ icon: Icon, text }, i) => (
            <li key={text} className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold">
                {i + 1}. {text}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="inline-flex min-h-[64px] w-full items-center justify-center rounded-2xl bg-primary px-6 text-xl font-bold text-primary-foreground shadow-soft transition hover:brightness-110"
          >
            Get Started
          </Link>
          <Link
            to="/auth"
            search={{ mode: "login" }}
            className="inline-flex min-h-[60px] w-full items-center justify-center rounded-2xl border-2 border-primary bg-card px-6 text-lg font-bold text-primary transition hover:bg-muted"
          >
            I already have an account — Log in
          </Link>
          <Link
            to="/guide"
            className="inline-flex min-h-[56px] w-full items-center justify-center rounded-2xl px-6 text-lg font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            How Amigo Works
          </Link>
        </div>
      </div>
    </div>
  );
}
