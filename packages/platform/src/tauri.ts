import type { Storage } from "./storage";

export const tauriStorage: Storage = {
  get() {
    throw new Error("tauriStorage not implemented");
  },
  set() {
    throw new Error("tauriStorage not implemented");
  },
  remove() {
    throw new Error("tauriStorage not implemented");
  },
};
