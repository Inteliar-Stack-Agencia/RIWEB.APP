import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { signIn as apiSignIn, signOut as apiSignOut } from "../lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = "riweb_admin_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.access_token && s?.user) {
          setToken(s.access_token);
          setUser(s.user);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const session = await apiSignIn(email, password);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setToken(session.access_token);
    setUser(session.user);
  };

  const logout = async () => {
    if (token) {
      try { await apiSignOut(token); } catch { /* ignore network errors on logout */ }
    }
    localStorage.removeItem(SESSION_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
