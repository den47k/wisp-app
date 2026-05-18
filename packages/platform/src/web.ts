import type { Storage } from "./storage";

export const webStorage: Storage = {
  get(key) {
    return globalThis.localStorage?.getItem(key) ?? null;
  },
  set(key, value) {
    globalThis.localStorage?.setItem(key, value);
  },
  remove(key) {
    globalThis.localStorage?.removeItem(key);
  },
};
