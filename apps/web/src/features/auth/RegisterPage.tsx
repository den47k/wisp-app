import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuthStore } from "@/stores/auth";
import { AuthShell } from "./components/AuthShell";
import { WelcomeStep } from "./components/Register/WelcomeStep";
import { CredentialsStep } from "./components/Register/CredentialsStep";
import { VerifyStep } from "./components/Register/VerifyStep";
import { ProfileStep } from "./components/Register/ProfileStep";

const TOTAL_STEPS = 4;

type RegisterResumeState = {
  resume?: "pending_email" | "pending_profile";
  registration_token?: string;
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const resumeState = (location.state ?? null) as RegisterResumeState | null;

  const [step, setStep] = useState(() =>
    resumeState?.registration_token ? (resumeState.resume === "pending_profile" ? 3 : 2) : 0,
  );
  const [registrationToken, setRegistrationToken] = useState<string | null>(
    resumeState?.registration_token ?? null,
  );
  const [email, setEmail] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);

  return (
    <AuthShell
      footerLabel={`${step + 1} / ${TOTAL_STEPS}`}
      progress={{ current: step, total: TOTAL_STEPS }}
      stageKey={step}
    >
      {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <CredentialsStep
          onBack={() => setStep(0)}
          onDone={(token, e) => {
            setRegistrationToken(token);
            setEmail(e);
            setStep(2);
          }}
        />
      )}
      {step === 2 && registrationToken && (
        <VerifyStep
          email={email}
          token={registrationToken}
          onBack={() => setStep(1)}
          onDone={() => setStep(3)}
        />
      )}
      {step === 3 && registrationToken && (
        <ProfileStep
          token={registrationToken}
          avatarIdx={avatarIdx}
          setAvatarIdx={setAvatarIdx}
          onDone={(token, user) => {
            setSession(token, user);
            navigate("/", { replace: true });
          }}
        />
      )}
    </AuthShell>
  );
};
