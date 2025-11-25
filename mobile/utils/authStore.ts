import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import axios from "axios";

const isWeb = Platform.OS === "web";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

type User = {
  id: string;
  email: string;
  user_metadata?: {
    display_name?: string;
  };
};

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  session: Session | null;
  shouldCreateAccount: boolean;
  hasCompletedOnboarding: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (value: boolean) => void;
};

let refreshTokenTimeout: NodeJS.Timeout | null = null;

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      session: null,
      shouldCreateAccount: false,
      hasCompletedOnboarding: false,
      isVip: false,
      _hasHydrated: false,

      signIn: async (email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/sign-in`, {
            email,
            password,
          });

          const { user, session } = response.data;

          set({
            isLoggedIn: true,
            user,
            session,
          });

          const expiresIn = session.expires_at * 1000 - Date.now() - 60000;
          if (expiresIn > 0) {
            refreshTokenTimeout = setTimeout(() => {
              get().refreshToken();
            }, expiresIn);
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.detail || "Sign-in failed");
        }
      },

      signUp: async (email: string, password: string, displayName?: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/sign-up`, {
            email,
            password,
            display_name: displayName,
          });

          const { user, session } = response.data;

          set({
            isLoggedIn: true,
            user,
            session,
          });

          // Schedule token refresh
          if (session) {
            const expiresIn = session.expires_at * 1000 - Date.now() - 60000;
            if (expiresIn > 0) {
              refreshTokenTimeout = setTimeout(() => {
                get().refreshToken();
              }, expiresIn);
            }
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.detail || "Sign-up failed");
        }
      },

      signOut: async () => {
        const { session } = get();

        if (refreshTokenTimeout) {
          clearTimeout(refreshTokenTimeout);
          refreshTokenTimeout = null;
        }

        try {
          if (session) {
            await axios.post(`${API_URL}/auth/sign-out`, {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            });
          }
        } catch (error) {
          console.error("Sign-out error:", error);
        } finally {
          set({
            isLoggedIn: false,
            user: null,
            session: null,
            isVip: false,
          });
        }
      },

      refreshToken: async () => {
        const { session } = get();

        if (!session) return;

        try {
          const response = await axios.get(`${API_URL}/auth/refresh-token`, {
            headers: {
              Authorization: `Bearer ${session.refresh_token}`,
            },
          });

          const newSession: Session = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expires_at: response.data.expires_at,
          };

          set({ session: newSession });

          // Schedule next refresh
          const expiresIn = newSession.expires_at * 1000 - Date.now() - 60000;
          if (expiresIn > 0) {
            refreshTokenTimeout = setTimeout(() => {
              get().refreshToken();
            }, expiresIn);
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          await get().signOut();
        }
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      resetOnboarding: () => {
        set({ hasCompletedOnboarding: false });
      },

      setHasHydrated: (value: boolean) => {
        set({ _hasHydrated: value });
      },
    }),
    {
      name: "auth-store",
      storage: isWeb
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
            setItem: (key: string, value: string) =>
              SecureStore.setItemAsync(key, value),
            getItem: (key: string) => SecureStore.getItemAsync(key),
            removeItem: (key: string) => SecureStore.deleteItemAsync(key),
          })),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);

          if (state?.session) {
            const expiresIn =
              state.session.expires_at * 1000 - Date.now() - 60000;
            if (expiresIn > 0) {
              refreshTokenTimeout = setTimeout(() => {
                state.refreshToken();
              }, expiresIn);
            } else {
              state.refreshToken();
            }
          }
        };
      },
    },
  ),
);
