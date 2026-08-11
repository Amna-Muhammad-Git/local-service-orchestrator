import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, MapPin, CalendarCheck, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "How Amigo Works — simple guide" },
      {
        name: "description",
        content:
          "A simple three step guide to using Amigo, with examples in English, Urdu and Roman Urdu.",
      },
      { property: "og:title", content: "How Amigo Works — simple guide" },
      {
        property: "og:description",
        content: "Three easy steps to find and book a trusted local helper with Amigo.",
      },
    ],
  }),
  component: GuidePage,
});

const steps = [
  {
    icon: MessageCircle,
    title: "1. Tell Amigo what help you need",
    body: "Write it just like you would say it to a friend. No special words needed.",
  },
  {
    icon: MapPin,
    title: "2. Choose a nearby provider",
    body: "Amigo shows helpers close to you, with the best rated ones at the top.",
  },
  {
    icon: CalendarCheck,
    title: "3. Select a time and confirm",
    body: "Pick a day and time that suits you, then press Confirm Booking. That's it!",
  },
];

const examples = [
  { label: "English", text: "I need an electrician in Johar tomorrow at 2 PM" },
  { label: "اردو", text: "مجھے گلشن میں پلمبر چاہیے" },
  { label: "Roman Urdu", text: "Johar mein AC repair karwana hai" },
];

function GuidePage() {
  return (
    <AppShell title="How Amigo Works" subtitle="Three easy steps.">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Back to start
      </Link>

      <div className="mt-4 space-y-6">
        <ol className="space-y-4">
          {steps.map(({ icon: Icon, title, body }) => (
            <li key={title} className="amigo-surface flex items-start gap-4 p-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold">{title}</h2>
                <p className="mt-1 text-base text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className="rounded-2xl bg-secondary p-5">
          <h2 className="text-xl font-extrabold">You can write in any of these</h2>
          <ul className="mt-3 space-y-3">
            {examples.map((ex) => (
              <li key={ex.label} className="rounded-2xl bg-card p-4">
                <p className="text-base font-bold text-primary">{ex.label}</p>
                <p className="mt-1 text-lg">“{ex.text}”</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="amigo-surface p-5">
          <h2 className="text-xl font-extrabold">Good to know</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-base">
            <li>Every booking starts as “Pending” until your helper accepts it.</li>
            <li>You can see all your bookings any time in My Bookings.</li>
            <li>If Amigo needs more detail, just add the area or the time and ask again.</li>
          </ul>
        </section>

        <Link
          to="/home"
          className="inline-flex min-h-[60px] w-full items-center justify-center rounded-2xl bg-primary px-6 text-lg font-bold text-primary-foreground shadow-soft hover:brightness-110"
        >
          Start asking for help
        </Link>
      </div>
    </AppShell>
  );
}
