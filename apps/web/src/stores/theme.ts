import { create } from 'zustand';
import { storage } from '@/lib/storage';

export type Theme = 'light' | 'dark';

const KEY = 'wisp.theme';

const readTheme = (): Theme => {
  const raw = storage.get(KEY);
  return raw === 'light' || raw === 'dark' ? raw : 'dark';
};

const applyTheme = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
};

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const initial = readTheme();
applyTheme(initial);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,
  setTheme: (theme) => {
    void storage.set(KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}));
