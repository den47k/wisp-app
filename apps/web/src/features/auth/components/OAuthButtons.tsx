import { useState } from "react";
import { oauthBegin, type Provider } from "../utils";

interface OAuthButtonsProps {
  onError: (message: string) => void;
}

export const OAuthButtons = ({ onError }: OAuthButtonsProps) => {
  const [busy, setBusy] = useState<Provider | null>(null);

  const handle = async (provider: Provider) => {
    setBusy(provider);
    try {
      await oauthBegin(provider);
    } catch (e) {
      setBusy(null);
      onError(e instanceof Error ? e.message : "OAuth failed");
    }
  };

  return (
    <div className="wh-oauth-row">
      <button
        type="button"
        className="wh-oa-btn"
        onClick={() => handle("google")}
        disabled={busy !== null}
      >
        <GoogleMark />
        {busy === "google" ? "Redirecting…" : "Google"}
      </button>
      <button
        type="button"
        className="wh-oa-btn"
        onClick={() => handle("github")}
        disabled={busy !== null}
      >
        <GitHubMark />
        {busy === "github" ? "Redirecting…" : "GitHub"}
      </button>
    </div>
  );
};

const GoogleMark = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8a12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.4-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3A12 12 0 0 1 12.7 28l-6.6 5C9.5 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C40 35 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"
    />
  </svg>
);

const GitHubMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.6 11.6 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" />
  </svg>
);
