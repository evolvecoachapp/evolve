import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, login as loginRequest, registerUser as registerRequest } from "../api/auth";
import type { UserCreate, UserPublic } from "../types/api";
import { clearTokens, getTokens, saveTokens } from "./secureStorage";

interface AuthContextValue {
  /** True only while the initial "do we already have a session?" check is running. */
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  user: UserPublic | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Owns all mobile auth state: bootstrapping an existing session from
 * secure storage on launch, login/register/logout, and the current user.
 * Screens and route guards consume this exclusively via `useAuth()` — no
 * screen talks to `src/api/auth.ts` or `secureStorage.ts` directly.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<UserPublic | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const tokens = await getTokens();
      if (!tokens) {
        if (isMounted) {
          setUser(null);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        await clearTokens();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginRequest(email, password);
    await saveTokens({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }, []);

  const register = useCallback(
    async (data: UserCreate) => {
      await registerRequest(data);
      await login(data.email, data.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isBootstrapping,
      isAuthenticated: user !== null,
      user,
      login,
      register,
      logout,
    }),
    [isBootstrapping, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
