import { api } from "@/lib/api";

export type Provider = "google" | "github";

export const deviceName = (): string =>
  typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 128) : "web";

export const oauthBegin = async (provider: Provider): Promise<void> => {
  const { url } = await api.auth.oauthRedirect(provider);
  window.location.assign(url);
};
