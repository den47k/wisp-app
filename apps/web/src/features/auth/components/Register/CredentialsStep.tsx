import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { RegisterStartRequestSchema, type RegisterStartRequest } from "@chat/domain";
import { Button, Icon } from "@chat/ui";
import { api } from "@/lib/api";
import { PasswordField } from "../PasswordField";

interface CredentialsStepProps {
  onBack: () => void;
  onDone: (token: string, email: string) => void;
}

export const CredentialsStep = ({ onBack, onDone }: CredentialsStepProps) => {
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

        <PasswordField
          registration={register("password")}
          error={errors.password}
          placeholder="Password"
          autoComplete="new-password"
        />

        <PasswordField
          registration={register("password_confirmation")}
          error={errors.password_confirmation}
          placeholder="Confirm password"
          autoComplete="new-password"
        />

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
              Continue <Icon name="arrow" size={15} />
            </>
          )}
        </Button>
      </form>
      <button type="button" className="wh-back-link" onClick={onBack}>
        Back
      </button>
    </>
  );
};
