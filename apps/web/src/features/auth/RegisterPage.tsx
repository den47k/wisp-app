import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router";
import {
  RegisterStartRequestSchema,
  RegisterVerifyEmailRequestSchema,
  RegisterProfileRequestSchema,
  type RegisterStartRequest,
  type RegisterVerifyEmailRequest,
  type RegisterProfileRequest,
} from "@chat/domain";
import { AVATAR_GRADIENTS, Icon } from "@chat/ui";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const TOTAL_STEPS = 4;

const deviceName = () =>
  typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 128) : "web";

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "·";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState(0);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);

  return (
    <div className="wh-onb-wrap">
      <div className="wh-onb-glow" aria-hidden="true" />
      <div className="wh-onb-track">
        <div
          className="wh-onb-track-fill"
          style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
        />
      </div>

      <main className="wh-onb-stage" key={step}>
        {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
        {step === 1 && (
          <StepAuth
            onBack={() => setStep(0)}
            onDone={(token, e) => {
              setRegistrationToken(token);
              setEmail(e);
              setStep(2);
            }}
          />
        )}
        {step === 2 && registrationToken && (
          <StepVerify
            email={email}
            token={registrationToken}
            onBack={() => setStep(1)}
            onDone={() => setStep(3)}
          />
        )}
        {step === 3 && registrationToken && (
          <StepProfile
            token={registrationToken}
            avatarIdx={avatarIdx}
            setAvatarIdx={setAvatarIdx}
            onBack={() => setStep(2)}
            onDone={(token, user) => {
              setSession(token, user);
              navigate("/", { replace: true });
            }}
          />
        )}
      </main>

      <footer className="wh-onb-foot">
        <span>
          {step + 1} / {TOTAL_STEPS}
        </span>
      </footer>
    </div>
  );
};

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <>
      <h1 className="wh-onb-h">Wisp</h1>
      <p className="wh-onb-tag">A quiet place for the people you love.</p>
      <button type="button" className="wh-btn wh-btn--primary wh-onb-cta" onClick={onNext}>
        Get started <Icon name="arrow" size={15} />
      </button>
      <p style={{ marginTop: 16, fontSize: 13, color: "var(--wh-text-dim)" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--wh-text-soft)", textDecoration: "underline" }}>
          Sign in
        </Link>
      </p>
    </>
  );
}

function StepAuth({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (token: string, email: string) => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterStartRequest>({
    resolver: zodResolver(RegisterStartRequestSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterStartRequest) => api.auth.registerStart(data),
    onSuccess: (res) => onDone(res.registration_token, res.email),
    onError: (e: Error) => setError("root", { message: e.message }),
  });

  return (
    <>
      <h2 className="wh-onb-h wh-onb-h--sm">Create your account</h2>
      <p className="wh-onb-tag wh-onb-tag--sm">Use your email and a strong password.</p>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        style={{ width: "100%", display: "flex", flexDirection: "column" }}
        noValidate
      >
        <div className="wh-field">
          <div className={"wh-input-wrap" + (errors.email ? " is-err" : "")}>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              autoFocus
              {...register("email")}
            />
          </div>
          {errors.email && <div className="wh-err">{errors.email.message}</div>}
        </div>

        <div className="wh-field">
          <div className={"wh-input-wrap" + (errors.password ? " is-err" : "")}>
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Password"
              {...register("password")}
            />
            <button
              type="button"
              className="wh-input-aff"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              <Icon name={showPw ? "eyeOff" : "eye"} size={14} />
            </button>
          </div>
          {errors.password && <div className="wh-err">{errors.password.message}</div>}
        </div>

        <div className="wh-field">
          <div className={"wh-input-wrap" + (errors.password_confirmation ? " is-err" : "")}>
            <input
              type={showPw2 ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm password"
              {...register("password_confirmation")}
            />
            <button
              type="button"
              className="wh-input-aff"
              onClick={() => setShowPw2((v) => !v)}
              aria-label={showPw2 ? "Hide password" : "Show password"}
            >
              <Icon name={showPw2 ? "eyeOff" : "eye"} size={14} />
            </button>
          </div>
          {errors.password_confirmation && (
            <div className="wh-err">{errors.password_confirmation.message}</div>
          )}
        </div>

        {errors.root && (
          <div className="wh-err" style={{ marginTop: 8 }}>
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="wh-btn wh-btn--primary wh-onb-cta"
        >
          {mutation.isPending ? (
            "Sending…"
          ) : (
            <>
              Continue <Icon name="arrow" size={15} />
            </>
          )}
        </button>
      </form>
      <button type="button" className="wh-back-link" onClick={onBack}>
        Back
      </button>
    </>
  );
}

function StepVerify({
  email,
  token,
  onBack,
  onDone,
}: {
  email: string;
  token: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const [resentAt, setResentAt] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterVerifyEmailRequest>({
    resolver: zodResolver(RegisterVerifyEmailRequestSchema),
    defaultValues: { otp: "" },
  });

  const verify = useMutation({
    mutationFn: (data: RegisterVerifyEmailRequest) => api.auth.registerVerifyEmail(data, token),
    onSuccess: () => onDone(),
    onError: (e: Error) => setError("otp", { message: e.message }),
  });

  const resend = useMutation({
    mutationFn: () => api.auth.registerResendOtp(token),
    onSuccess: () => setResentAt(Date.now()),
    onError: (e: Error) => setError("root", { message: e.message }),
  });

  return (
    <>
      <h2 className="wh-onb-h wh-onb-h--sm">Check your email</h2>
      <p className="wh-onb-tag wh-onb-tag--sm">
        Enter the 6-digit code we sent to <strong>{email}</strong>.
      </p>

      <form
        onSubmit={handleSubmit((d) => verify.mutate(d))}
        style={{ width: "100%", display: "flex", flexDirection: "column" }}
        noValidate
      >
        <div className="wh-field">
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <OtpInput
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  if (v.length === 6) {
                    handleSubmit((d) => verify.mutate(d))();
                  }
                }}
                hasError={!!errors.otp}
                autoFocus
              />
            )}
          />
          {errors.otp && <div className="wh-err">{errors.otp.message}</div>}
        </div>

        {errors.root && (
          <div className="wh-err" style={{ marginTop: 8 }}>
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={verify.isPending}
          className="wh-btn wh-btn--primary wh-onb-cta"
        >
          {verify.isPending ? (
            "Verifying…"
          ) : (
            <>
              Verify <Icon name="check" size={15} />
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        className="wh-back-link"
        onClick={() => resend.mutate()}
        disabled={resend.isPending}
      >
        {resend.isPending
          ? "Sending…"
          : resentAt
            ? "Code resent. Resend again?"
            : "Didn't get it? Resend code"}
      </button>
      <button type="button" className="wh-back-link" onClick={onBack}>
        Back
      </button>
    </>
  );
}

function StepProfile({
  token,
  avatarIdx,
  setAvatarIdx,
  onBack,
  onDone,
}: {
  token: string;
  avatarIdx: number;
  setAvatarIdx: (i: number) => void;
  onBack: () => void;
  onDone: (token: string, user: import("@chat/domain").LoginSuccess["user"]) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm<RegisterProfileRequest>({
    resolver: zodResolver(RegisterProfileRequestSchema),
    defaultValues: { name: "", tag: "", device_name: deviceName() },
  });

  const name = watch("name") ?? "";
  const tag = watch("tag") ?? "";
  const [suggestionsTried, setSuggestionsTried] = useState(false);

  const submit = useMutation({
    mutationFn: (data: RegisterProfileRequest) => api.auth.registerProfile(data, token),
    onSuccess: (res) => onDone(res.token, res.user),
    onError: (e: Error) => setError("root", { message: e.message }),
  });

  const suggest = useMutation({
    mutationFn: () => api.auth.suggestTag(token),
    onSuccess: (res) => {
      if (!tag && res.suggestions.length > 0) {
        setValue("tag", res.suggestions[0]!, { shouldValidate: false });
      }
    },
  });

  useEffect(() => {
    if (!suggestionsTried && name.trim().length >= 2 && !tag) {
      setSuggestionsTried(true);
      suggest.mutate();
    }
  }, [name, tag, suggestionsTried, suggest]);

  const initials = useMemo(() => initialsOf(name), [name]);
  const gradient = AVATAR_GRADIENTS[avatarIdx] ?? AVATAR_GRADIENTS[0]!;

  return (
    <>
      <h2 className="wh-onb-h wh-onb-h--sm">Make it yours</h2>
      <p className="wh-onb-tag wh-onb-tag--sm">This is how friends will see you.</p>

      <div className="wh-onb-av-stack">
        <div
          className="wh-avatar wh-avatar--onb"
          style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
        >
          {initials}
        </div>
        <div className="wh-avatar-picker wh-avatar-picker--onb">
          {AVATAR_GRADIENTS.map((g, i) => (
            <button
              key={i}
              type="button"
              className={"wh-avatar-swatch" + (i === avatarIdx ? " is-on" : "")}
              style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}
              onClick={() => setAvatarIdx(i)}
              aria-label={`Avatar ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit((d) => submit.mutate(d))}
        style={{ width: "100%", display: "flex", flexDirection: "column" }}
        noValidate
      >
        <div className="wh-field">
          <div className={"wh-input-wrap" + (errors.name ? " is-err" : "")}>
            <input
              type="text"
              autoComplete="name"
              placeholder="Your name"
              autoFocus
              {...register("name")}
            />
          </div>
          {errors.name && <div className="wh-err">{errors.name.message}</div>}
        </div>

        <div className="wh-field">
          <div className={"wh-input-wrap" + (errors.tag ? " is-err" : "")}>
            <span className="wh-input-prefix">@</span>
            <input
              type="text"
              autoComplete="username"
              placeholder="username"
              maxLength={32}
              {...register("tag")}
            />
          </div>
          {errors.tag && <div className="wh-err">{errors.tag.message}</div>}
        </div>

        <input type="hidden" {...register("device_name")} />

        {errors.root && (
          <div className="wh-err" style={{ marginTop: 8 }}>
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={submit.isPending}
          className="wh-btn wh-btn--primary wh-onb-cta"
        >
          {submit.isPending ? (
            "Finishing…"
          ) : (
            <>
              Enter Whisp <Icon name="arrow" size={15} />
            </>
          )}
        </button>
      </form>
      <button type="button" className="wh-back-link" onClick={onBack}>
        Back
      </button>
    </>
  );
}

function OtpInput({
  value,
  onChange,
  hasError,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => {
    const arr = (value ?? "").split("");
    return Array.from({ length: 6 }, (_, i) => arr[i] ?? "");
  }, [value]);

  const focus = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(5, i))];
    el?.focus();
    el?.select();
  };

  const setAt = (i: number, d: string) => {
    const next = [...digits];
    next[i] = d;
    onChange(next.join(""));
  };

  const fillFrom = (i: number, chars: string) => {
    const next = [...digits];
    let k = 0;
    for (; k < chars.length && i + k < 6; k++) {
      next[i + k] = chars[k]!;
    }
    onChange(next.join(""));
    focus(Math.min(i + k, 5));
  };

  const handleChange = (i: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setAt(i, "");
      return;
    }
    if (cleaned.length === 1) {
      setAt(i, cleaned);
      if (i < 5) focus(i + 1);
      return;
    }
    fillFrom(i, cleaned);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        setAt(i, "");
      } else if (i > 0) {
        setAt(i - 1, "");
        focus(i - 1);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      focus(i - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight" && i < 5) {
      focus(i + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    fillFrom(i, text);
  };

  return (
    <div className={"wh-otp-grid" + (hasError ? " is-err" : "")}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="wh-otp-box"
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
