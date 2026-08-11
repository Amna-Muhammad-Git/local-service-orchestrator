import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { BigButton, Field, Notice, inputClass } from "@/components/ui-kit";
import { loginUser, registerUser, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Mode = "login" | "register";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode } => ({
    mode: search["mode"] === "login" ? "login" : "register",
  }),
  head: () => ({
    meta: [
      { title: "Log in or create your Amigo account" },
      {
        name: "description",
        content: "Create a free Amigo account or log in to book trusted local helpers near you.",
      },
      { property: "og:title", content: "Log in or create your Amigo account" },
      {
        property: "og:description",
        content: "Create a free Amigo account or log in to book trusted local helpers.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { signIn, isLoggedIn, ready } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  useEffect(() => {
    if (ready && isLoggedIn) navigate({ to: "/home", replace: true });
  }, [ready, isLoggedIn, navigate]);

  function validate() {
    const next: Record<string, string> = {};
    if (isRegister && name.trim().length < 2) next["name"] = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next["email"] = "Please enter a valid email, like name@example.com.";
    if (password.length < 8) next["password"] = "Your password needs at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setInfo("");
    if (!validate()) return;

    setLoading(true);
    try {
      if (isRegister) {
        await registerUser({ name: name.trim(), email: email.trim(), password });
      }
      const res = await loginUser({ email: email.trim(), password });
      signIn(res.access_token, { name: name.trim() || undefined, email: email.trim() });
      navigate({ to: "/home", replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-5 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Back
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold">
          {isRegister ? "Create your Amigo account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {isRegister
            ? "It only takes a moment. Then you can ask for any help you need."
            : "Log in to ask for help and see your bookings."}
        </p>

        <form onSubmit={handleSubmit} className="amigo-surface mt-6 space-y-6 p-6" noValidate>
          {isRegister ? (
            <Field id="name" label="Your name" error={errors["name"]}>
              <input
                id="name"
                name="name"
                autoComplete="name"
                className={inputClass}
                placeholder="Amna Muhammad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors["name"])}
              />
            </Field>
          ) : null}

          <Field id="email" label="Email address" error={errors["email"]}>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className={inputClass}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors["email"])}
            />
          </Field>

          <Field
            id="password"
            label="Password"
            hint="At least 8 characters."
            error={errors["password"]}
          >
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                className={`${inputClass} pr-16`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(errors["password"])}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
              >
                {showPassword ? (
                  <EyeOff className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Eye className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </Field>

          <Notice message={formError} />
          {info ? <Notice message={info} tone="info" /> : null}

          <BigButton type="submit" loading={loading}>
            {loading
              ? "Connecting to Amigo…"
              : isRegister
                ? "Create account"
                : "Log in"}
          </BigButton>
        </form>

        <p className="mt-6 text-center text-lg">
          {isRegister ? "Already have an account?" : "New to Amigo?"}{" "}
          <Link
            to="/auth"
            search={{ mode: isRegister ? "login" : "register" }}
            onClick={() => {
              setErrors({});
              setFormError("");
              setInfo("");
            }}
            className="font-bold text-primary underline underline-offset-4"
          >
            {isRegister ? "Log in here" : "Create one here"}
          </Link>
        </p>
      </div>
    </div>
  );
}
