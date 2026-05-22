import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ResetPasswordRequestSchema, type ResetPasswordRequest } from "@chat/domain";
import { ApiValidationError } from "@chat/api-client";
import { Button, Icon } from "@chat/ui";
import { api } from "@/lib/api";
import { AuthShell } from "./components/AuthShell";
import { PasswordField } from "./components/PasswordField";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(ResetPasswordRequestSchema),
    defaultValues: { token, email, password: "", password_confirmation: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => api.auth.resetPassword(data),
    onSuccess: () => navigate("/login?reset=1", { replace: true }),
    onError: (e: unknown) => {
      if (e instanceof ApiValidationError) {
        for (const [field, msgs] of Object.entries(e.errors)) {
          setError(field as keyof ResetPasswordRequest, { message: msgs[0] ?? "Invalid" });
        }
        return;
      }
      const msg = e instanceof Error ? e.message : "Reset failed";
      setError("root", { message: msg });
    },
  });

  if (!token || !email) {
    return (
      <AuthShell footerLabel="Reset password">
        <h2 className="wh-onb-h wh-onb-h--sm">Reset link is invalid</h2>
        <p className="wh-onb-tag wh-onb-tag--sm">
          This reset link is missing required parameters.
        </p>
        <Link to="/forgot-password" className="wh-btn wh-btn--primary wh-onb-cta">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell footerLabel="Reset password">
      <h2 className="wh-onb-h wh-onb-h--sm">Set a new password</h2>
      <p className="wh-onb-tag wh-onb-tag--sm">
        Resetting password for <strong>{email}</strong>.
      </p>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        style={{ width: "100%", display: "flex", flexDirection: "column" }}
        noValidate
      >
        <input type="hidden" {...register("token")} />
        <input type="hidden" {...register("email")} />

        <PasswordField
          registration={register("password")}
          error={errors.password}
          placeholder="New password"
          autoComplete="new-password"
          autoFocus
        />

        <PasswordField
          registration={register("password_confirmation")}
          error={errors.password_confirmation}
          placeholder="Confirm new password"
          autoComplete="new-password"
        />

        {errors.root && (
          <div className="wh-err" style={{ marginTop: 8 }}>
            {errors.root.message}
          </div>
        )}

        <Button type="submit" disabled={mutation.isPending} className="wh-onb-cta">
          {mutation.isPending ? (
            "Resetting…"
          ) : (
            <>
              Reset password <Icon name="check" size={15} />
            </>
          )}
        </Button>
      </form>

      <Link to="/login" className="wh-back-link">
        Back to sign in
      </Link>
    </AuthShell>
  );
};
