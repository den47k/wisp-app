import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  LoginRequestSchema,
  isLoginSuccess,
  type LoginRequest,
  type LoginSuccess,
} from "@chat/domain";
import { ApiError } from "@chat/api-client";
import { Button, Icon } from "@chat/ui";
import { api } from "@/lib/api";
import { deviceName } from "../../utils";
import { PasswordField } from "../PasswordField";
import { OAuthButtons } from "../OAuthButtons";

interface CredentialsStepProps {
  flash: string | null;
  oauthError: string | null;
  onLoggedIn: (res: LoginSuccess) => void;
  onChallenge: (challengeToken: string) => void;
  onInactive: (status: "pending_email" | "pending_profile") => void;
}

export const CredentialsStep = ({
  flash,
  oauthError,
  onLoggedIn,
  onChallenge,
  onInactive,
}: CredentialsStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { device_name: deviceName() },
  });

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => api.auth.login(data),
    onSuccess: (res) => {
      if (isLoginSuccess(res)) {
        onLoggedIn(res);
      } else {
        onChallenge(res.challenge_token);
      }
    },
    onError: (e: unknown) => {
      if (e instanceof ApiError && e.status === 403) {
        const data = e.data as { status?: string } | null;
        if (data?.status === "pending_email" || data?.status === "pending_profile") {
          onInactive(data.status);
          return;
        }
      }
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      setError("root", { message: msg });
    },
  });

  return (
    <>
      <h2 className="wh-onb-h wh-onb-h--sm">Welcome back</h2>
      <p className="wh-onb-tag wh-onb-tag--sm">Sign in to Wisp.</p>

      {flash && (
        <div
          className="wh-hint"
          style={{ marginBottom: 12, color: "oklch(0.55 0.17 150)" }}
        >
          {flash}
        </div>
      )}
      {oauthError && (
        <div className="wh-err" style={{ marginBottom: 12 }}>
          Sign-in with provider was cancelled or failed.
        </div>
      )}

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

        <PasswordField
          registration={register("password")}
          error={errors.password}
          placeholder="Password"
          autoComplete="current-password"
        />

        <input type="hidden" {...register("device_name")} />

        <div className="wh-form-row">
          <Link to="/forgot-password" className="wh-link-soft">
            Forgot password?
          </Link>
        </div>

        {errors.root && (
          <div className="wh-err" style={{ marginTop: 8 }}>
            {errors.root.message}
          </div>
        )}

        <Button type="submit" disabled={mutation.isPending} className="wh-onb-cta">
          {mutation.isPending ? (
            "Signing in…"
          ) : (
            <>
              Sign in <Icon name="arrow" size={15} />
            </>
          )}
        </Button>
      </form>

      <div className="wh-divider">or</div>

      <OAuthButtons onError={(msg) => setError("root", { message: msg })} />

      <p style={{ marginTop: 18, fontSize: 13, color: "var(--wh-text-dim)" }}>
        No account?{" "}
        <Link to="/register" className="wh-link-soft" style={{ textDecoration: "underline" }}>
          Create one
        </Link>
      </p>
    </>
  );
};
