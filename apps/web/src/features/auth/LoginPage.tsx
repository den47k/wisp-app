import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { LoginSuccess } from "@chat/domain";
import { useAuthStore } from "@/stores/auth";
import { AuthShell } from "./components/AuthShell";
import { CredentialsStep } from "./components/Login/CredentialsStep";
import { TwoFactorStep } from "./components/Login/TwoFactorStep";

type Step = "creds" | "2fa";

export const LoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<Step>("creds");
  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  const onLoggedIn = (res: LoginSuccess) => {
    setSession(res.token, res.user);
    navigate("/", { replace: true });
  };

  const oauthError = searchParams.get("oauth_error");
  const resetFlash = searchParams.get("reset") === "1";

  return (
    <AuthShell footerLabel={step === "creds" ? "Sign in" : "Verify"} stageKey={step}>
      {step === "creds" && (
        <CredentialsStep
          flash={resetFlash ? "Password reset. Sign in with your new password." : null}
          oauthError={oauthError}
          onLoggedIn={onLoggedIn}
          onChallenge={(token) => {
            setChallengeToken(token);
            setStep("2fa");
          }}
          onInactive={(status) => {
            navigate("/register", { state: { resume: status } });
          }}
        />
      )}
      {step === "2fa" && challengeToken && (
        <TwoFactorStep
          challengeToken={challengeToken}
          onLoggedIn={onLoggedIn}
          onBack={() => {
            setChallengeToken(null);
            setStep("creds");
          }}
        />
      )}
    </AuthShell>
  );
};
