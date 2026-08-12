import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchAdminMe, loginAdmin, logoutAdmin } from "../api/auth";
import { clearTokens, getAccessToken } from "./tokenStore";
import { AdminApiError, type AdminSession } from "../types/admin";

type AuthStatus = "booting" | "anonymous" | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  admin: AdminSession | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    getAccessToken() ? "booting" : "anonymous",
  );
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();
    if (!token) {
      setStatus("anonymous");
      return;
    }
    fetchAdminMe()
      .then((session) => {
        if (cancelled) {
          return;
        }
        setAdmin(session);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        clearTokens();
        setAdmin(null);
        setStatus("anonymous");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const session = await loginAdmin(email, password);
      setAdmin(session);
      setStatus("authenticated");
    } catch (caught) {
      const message =
        caught instanceof AdminApiError
          ? caught.message
          : "Unable to sign in. Please try again.";
      setError(message);
      setAdmin(null);
      setStatus("anonymous");
      throw caught;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    clearTokens();
    setAdmin(null);
    setStatus("anonymous");
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ status, admin, error, login, logout }),
    [status, admin, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
