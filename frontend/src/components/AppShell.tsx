import { Link, useRouterState } from "@tanstack/react-router";
import { Home, CalendarCheck, HelpCircle, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/bookings", label: "My Bookings", icon: CalendarCheck },
  { to: "/guide", label: "User Guide", icon: HelpCircle },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isLoggedIn, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={signOut}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-base font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Log out</span>
              <span className="sr-only sm:hidden">Log out</span>
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-6">{children}</main>

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 border-t border-border bg-card"
      >
        <ul className="mx-auto flex max-w-3xl">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[68px] flex-col items-center justify-center gap-1 px-2 py-2 text-sm font-semibold transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span className="text-center leading-tight">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
