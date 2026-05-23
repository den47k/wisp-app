import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import type { LoginSuccess, OAuthCallbackResult } from "@chat/domain";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { deviceName, type Provider } from "./utils";
import { AuthShell } from "./components/AuthShell";
import { OAuthCallbackLinkForm } from "./components/OAuthCallbackLinkForm";
import { TwoFactorStep } from "./components/Login/TwoFactorStep";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "link_required"; linkToken: string }
  | { kind: "2fa"; challengeToken: string };

const isProvider = (p: string | undefined): p is Provider => p === "google" || p === "github";

export const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const params = useParams<{ provider: string }>();
  const [search] = useSearchParams();

  const provider = params.provider;
  const code = search.get("code") ?? undefined;
  const state = search.get("state") ?? undefined;
  const errorParam = search.get("error");

  const [view, setView] = useState<State>({ kind: "loading" });
  const firedRef = useRef(false);

  const onLoggedIn = (res: LoginSuccess) => {
    setSession(res.token, res.user);
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (firedRef.current) return;
    if (!isProvider(provider)) {
      setView({ kind: "error", message: "Unknown provider." });
      return;
    }
    if (errorParam) {
      navigate("/login?oauth_error=denied", { replace: true });
      return;
    }
    if (!code || !state) {
      setView({ kind: "error", message: "Missing OAuth parameters." });
      return;
    }
    firedRef.current = true;

    api.auth
      .oauthCallback(provider, { code, state, device_name: deviceName() })
      .then((res: OAuthCallbackResult) => {
        if (res.kind === "logged_in") {
          setSession(res.token, res.user);
          navigate("/", { replace: true });
        } else if (res.kind === "link_required") {
          setView({ kind: "link_required", linkToken: res.link_token });
        } else if (res.kind === "2fa") {
          setView({ kind: "2fa", challengeToken: res.challenge_token });
        } else {
          navigate("/register", {
            state: { resume: res.kind, registration_token: res.registration_token },
            replace: true,
          });
        }
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "OAuth failed";
        setView({ kind: "error", message: msg });
      });
  }, [provider, code, state, errorParam, navigate, setSession]);

  return (
    <AuthShell footerLabel={view.kind === "2fa" ? "Verify" : "OAuth"} stageKey={view.kind}>
      {view.kind === "loading" && (
        <>
          <h2 className="wh-onb-h wh-onb-h--sm">Signing you in…</h2>
          <p className="wh-onb-tag wh-onb-tag--sm">One moment.</p>
        </>
      )}

      {view.kind === "error" && (
        <>
          <h2 className="wh-onb-h wh-onb-h--sm">Something went wrong</h2>
          <p className="wh-onb-tag wh-onb-tag--sm">{view.message}</p>
          <Link to="/login" className="wh-btn wh-btn--primary wh-onb-cta">
            Back to sign in
          </Link>
        </>
      )}

      {view.kind === "link_required" && isProvider(provider) && (
        <OAuthCallbackLinkForm
          provider={provider}
          linkToken={view.linkToken}
          onResult={(res) => {
            if (res.kind === "logged_in") {
              onLoggedIn(res);
            } else if (res.kind === "2fa") {
              setView({ kind: "2fa", challengeToken: res.challenge_token });
            } else {
              navigate("/register", {
                state: { resume: res.kind, registration_token: res.registration_token },
                replace: true,
              });
            }
          }}
        />
      )}

      {view.kind === "2fa" && (
        <TwoFactorStep
          challengeToken={view.challengeToken}
          onLoggedIn={onLoggedIn}
          onBack={() => navigate("/login", { replace: true })}
        />
      )}
    </AuthShell>
  );
};
