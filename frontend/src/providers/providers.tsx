"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, createContext, useContext, useEffect, useCallback } from "react";
import type { User } from "@/types";
import { authApi } from "@/lib/api";
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";

// ==========================================
// Auth Context
// ==========================================
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: "google" | "github") => Promise<void>;
  logout: () => Promise<void> | void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      if (auth && auth.currentUser) {
        const response = await authApi.sync();
        setUser(response.data);
      } else {
        const response = await authApi.me();
        setUser(response.data);
      }
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      refreshUser();
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem("access_token", token);
          const response = await authApi.sync();
          setUser(response.data);
        } catch (error: any) {
          console.error("Error syncing Firebase user to PostgreSQL:", error?.detail || error?.message || JSON.stringify(error));
          setUser(null);

        } finally {
          setIsLoading(false);
        }
      } else {
        const legacyToken = localStorage.getItem("access_token");
        if (legacyToken) {
          try {
            const response = await authApi.me();
            setUser(response.data);
          } catch {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    if (auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("access_token", token);
        const response = await authApi.sync();
        setUser(response.data);
        return;
      } catch (error) {
        console.warn("Firebase sign in failed, falling back to backend auth API:", error);
      }
    }
    const response = await authApi.login({ email, password });
    const { access_token, refresh_token, user: userData } = response.data;
    localStorage.setItem("access_token", access_token);
    if (refresh_token) {
      localStorage.setItem("refresh_token", refresh_token);
    }
    setUser(userData);
  };

  const register = async (fullName: string, email: string, password: string) => {
    if (auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        const token = await userCredential.user.getIdToken(true);
        localStorage.setItem("access_token", token);
        const response = await authApi.sync();
        setUser(response.data);
        return;
      } catch (error) {
        console.warn("Firebase sign up failed, falling back to backend auth API:", error);
      }
    }
    const response = await authApi.register({
      full_name: fullName,
      email,
      password,
    });
    const { access_token, refresh_token, user: userData } = response.data;
    localStorage.setItem("access_token", access_token);
    if (refresh_token) {
      localStorage.setItem("refresh_token", refresh_token);
    }
    setUser(userData);
  };

  const loginWithProvider = async (providerName: "google" | "github") => {
    if (!auth) throw new Error("Firebase auth is not initialized");
    const provider = providerName === "google" ? googleProvider : githubProvider;
    const userCredential = await signInWithPopup(auth, provider);
    const token = await userCredential.user.getIdToken();
    localStorage.setItem("access_token", token);
    const response = await authApi.sync();
    setUser(response.data);
  };

  const logout = async () => {
    if (auth && auth.currentUser) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Error during Firebase sign out:", e);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithProvider,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// Combined Providers
// ==========================================
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
