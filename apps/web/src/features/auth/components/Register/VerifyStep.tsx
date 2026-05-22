import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  RegisterVerifyEmailRequestSchema,
  type RegisterVerifyEmailRequest,
} from "@chat/domain";
import { Button, Icon } from "@chat/ui";
import { api } from "@/lib/api";
import { OtpInput } from "../OtpInput";

interface VerifyStepProps {
  email: string;
  token: string;
  onBack: () => void;
  onDone: () => void;
}

export const VerifyStep = ({ email, token, onBack, onDone }: VerifyStepProps) => {
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
        {email ? (
          <>
            Enter the 6-digit code we sent to <strong>{email}</strong>.
          </>
        ) : (
          <>Enter the 6-digit code from your inbox.</>
        )}
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

        <Button type="submit" disabled={verify.isPending} className="wh-onb-cta">
          {verify.isPending ? (
            "Verifying…"
          ) : (
            <>
              Verify <Icon name="check" size={15} />
            </>
          )}
        </Button>
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
};
