"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ApiError, apiRequest, type ApiRequestOptions } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { AuthUser, MeData } from "@/types/auth";

type AuthState = {
  status: "loading" | "guest" | "unavailable" | "customer" | "admin";
  token: string | null;
  user: AuthUser | null;
};
type AuthContextValue = AuthState & {
  signIn: (token: string, user: AuthUser) => void;
  signOut: () => void;
  authRequest: <T>(
    path: string,
    options?: Omit<ApiRequestOptions, "token">,
  ) => Promise<T>;
  cartCount: number | undefined;
  setCartCount: (count: number) => void;
};
const storageKey = "safar.accessToken";
const initialState: AuthState = { status: "loading", token: null, user: null };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [cartCount, setCartCount] = useState<number | undefined>();
  const signOut = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState({ status: "guest", token: null, user: null });
    setCartCount(undefined);
  }, []);
  const signIn = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem(storageKey, token);
    setCartCount(undefined);
    setState({
      status: user.role === "ADMIN" ? "admin" : "customer",
      token,
      user,
    });
  }, []);
  const authRequest = useCallback(
    async <T,>(
      path: string,
      options: Omit<ApiRequestOptions, "token"> = {},
    ): Promise<T> => {
      if (!state.token) throw new ApiError("Authentication required.", 401);
      try {
        return await apiRequest<T>(path, { ...options, token: state.token });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) signOut();
        throw error;
      }
    },
    [state.token, signOut],
  );

  useEffect(() => {
    const token = localStorage.getItem(storageKey);
    let active = true;
    if (!token) {
      queueMicrotask(() => {
        if (active) setState({ status: "guest", token: null, user: null });
      });
      return () => {
        active = false;
      };
    }
    apiRequest<ApiResponse<MeData>>("/auth/me", { token, cache: "no-store" })
      .then((response) => {
        if (!active) return;
        const identity = response.data?.data;
        if (
          !identity ||
          typeof identity.sub !== "string" ||
          typeof identity.email !== "string" ||
          !["ADMIN", "CUSTOMER"].includes(identity.role)
        ) {
          signOut();
          return;
        }
        setState({
          status: identity.role === "ADMIN" ? "admin" : "customer",
          token,
          user: {
            id: identity.sub,
            email: identity.email,
            role: identity.role,
          },
        });
      })
      .catch((error) => {
        if (!active) return;
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        )
          signOut();
        else setState({ status: "unavailable", token: null, user: null });
      });
    return () => {
      active = false;
    };
  }, [signOut]);

  useEffect(() => {
    if (state.status !== "customer" || !state.token) return;
    let active = true;
    apiRequest<ApiResponse<{ item: unknown | null }>>("/cart", {
      token: state.token,
      cache: "no-store",
    })
      .then((response) => {
        if (active) setCartCount(response.data.item ? 1 : 0);
      })
      .catch((error) => {
        if (active && error instanceof ApiError && error.status === 401)
          signOut();
      });
    return () => {
      active = false;
    };
  }, [state.status, state.token, signOut]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        authRequest,
        cartCount,
        setCartCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider is missing");
  return context;
}
