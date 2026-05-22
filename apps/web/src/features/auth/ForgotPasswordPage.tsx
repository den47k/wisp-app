import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import { ForgotPasswordRequestSchema, type ForgotPasswordRequest } from "@chat/domain";
import { Button, Icon } from "@chat/ui";
import { api } from "@/lib/api";
import { AuthShell } from "./components/AuthShell";

export const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(ForgotPasswordRequestSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => api.auth.forgotPassword(data),
    onSuccess: () => setSent(true),
    onError: (e: Error) => setError("root", { message: e.message }),
  });

  return (
    <AuthShell footerLabel="Reset password">
      <h2 className="wh-onb-h wh-onb-h--sm">Forgot password</h2>
      <p className="wh-onb-tag wh-onb-tag--sm">
        {sent
          ? "If an account exists for that email, a reset link is on its way."
          : "Enter your email and we'll send you a reset link."}
      </p>

      {!sent ? (
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

          {errors.root && (
            <div className="wh-err" style={{ marginTop: 8 }}>
              {errors.root.message}
            </div>
          )}

          <Button type="submit" disabled={mutation.isPending} className="wh-onb-cta">
            {mutation.isPending ? (
              "Sending…"
            ) : (
              <>
                Send reset link <Icon name="arrow" size={15} />
              </>
            )}
          </Button>
        </form>
      ) : (
        <Link to="/login" className="wh-btn wh-btn--primary wh-onb-cta">
          Back to sign in
        </Link>
      )}

      <Link to="/login" className="wh-back-link">
        Back
      </Link>
    </AuthShell>
  );
};
