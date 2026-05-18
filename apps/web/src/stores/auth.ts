import { create } from "zustand";
import type { AuthenticatedUser } from "@chat/domain";
import { storage, STORAGE_KEYS } from "@/lib/storage";

interface AuthState {
  token: string | null;
  user: AuthenticatedUser | null;
  setSession: (token: string, user: AuthenticatedUser) => void;
  setUser: (user: AuthenticatedUser) => void;
  clear: () => void;
}

const readUser = (): AuthenticatedUser | null => {
  const raw = storage.get(STORAGE_KEYS.user);
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as AuthenticatedUser;
  } catch {
    return null;
  }
};

const readToken = (): string | null => {
  const raw = storage.get(STORAGE_KEYS.token);
  return typeof raw === "string" ? raw : null;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: readToken(),
  user: readUser(),
  setSession: (token, user) => {
    void storage.set(STORAGE_KEYS.token, token);
    void storage.set(STORAGE_KEYS.user, JSON.stringify(user));
    set({ token, user });
  },
  setUser: (user) => {
    void storage.set(STORAGE_KEYS.user, JSON.stringify(user));
    set({ user });
  },
  clear: () => {
    void storage.remove(STORAGE_KEYS.token);
    void storage.remove(STORAGE_KEYS.user);
    set({ token: null, user: null });
  },
}));

export const getAuthToken = () => useAuthStore.getState().token;
