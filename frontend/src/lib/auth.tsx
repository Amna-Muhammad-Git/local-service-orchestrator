import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { tokenStore, type AmigoUser } from "./api";

type AuthValue = {
  token: string | null;
  user: AmigoUser | null;
  ready: boolean;
  isLoggedIn: boolean;
  signIn: (token: string, user?: AmigoUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AmigoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(tokenStore.get());
    setUser(tokenStore.getUser());
    setReady(true);
  }, []);

  const signIn = useCallback((newToken: string, newUser?: AmigoUser) => {
    tokenStore.set(newToken);
    if (newUser) tokenStore.setUser(newUser);
    setToken(newToken);
    if (newUser) setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, ready, isLoggedIn: Boolean(token), signIn, signOut }),
    [token, user, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
