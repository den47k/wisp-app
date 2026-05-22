import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  TwoFactorVerifyRequestSchema,
  type LoginSuccess,
  type TwoFactorVerifyRequest,
} from "@chat/domain";
import { Button, Icon } from "@chat/ui";
import { api } from "@/lib/api";
import { deviceName } from "../../utils";
import { OtpInput } from "../OtpInput";

interface TwoFactorStepProps {
  challengeToken: string;
  onLoggedIn: (res: LoginSuccess) => void;
  onBack: () => void;
}

export const TwoFactorStep = ({ challengeToken, onLoggedIn, onBack }: TwoFactorStepProps) => {
  const [useRecovery, setUseRecovery] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<TwoFactorVerifyRequest>({
    resolver: zodResolver(TwoFactorVerifyRequestSchema),
    defaultValues: { code: "", recovery_code: "", device_name: deviceName() },
  });

  const verify = useMutation({
    mutationFn: (data: TwoFactorVerifyRequest) => {
      const body: TwoFactorVerifyRequest = {
        ...data,
        code: useRecovery ? "" : data.code,
        recovery_code: useRecovery ? data.recovery_code : "",
      };
      return api.auth.twoFactorVerify(body, challengeToken);
    },
    onSuccess: (res) => onLoggedIn(res),
    onError: (e: Error) => setError("root", { message: e.message }),
  });

  return (
    <>
      <h2 className="wh-onb-h wh-onb-h--sm">Two-factor authentication</h2>
      <p className="wh-onb-tag wh-onb-tag--sm">
        {useRecovery
          ? "Enter one of your recovery codes."
          : "Enter the 6-digit code from your authenticator app."}
      </p>

      <form
        onSubmit={handleSubmit((d) => verify.mutate(d))}
        style={{ width: "100%", display: "flex", flexDirection: "column" }}
        noValidate
      >
        {!useRecovery ? (
          <div className="wh-field">
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <OtpInput
                  value={field.value ?? ""}
                  onChange={(v) => {
                    field.onChange(v);
                    if (v.length === 6 && !verify.isPending) {
                      handleSubmit((d) => verify.mutate(d))();
                    }
                  }}
                  hasError={!!errors.code}
                  autoFocus
                />
              )}
            />
            {errors.code && <div className="wh-err">{errors.code.message}</div>}
          </div>
        ) : (
          <div className="wh-field">
            <div className={"wh-input-wrap" + (errors.recovery_code ? " is-err" : "")}>
              <input
                type="text"
                autoComplete="one-time-code"
                placeholder="XXXXX-XXXXX"
                autoFocus
                {...register("recovery_code")}
              />
            </div>
            {errors.recovery_code && (
              <div className="wh-err">{errors.recovery_code.message}</div>
            )}
          </div>
        )}

        <input type="hidden" {...register("device_name")} />

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
        onClick={() => {
          setUseRecovery((v) => !v);
          setValue("code", "");
          setValue("recovery_code", "");
        }}
      >
        {useRecovery ? "Use authenticator code" : "Use a recovery code"}
      </button>
      <button type="button" className="wh-back-link" onClick={onBack}>
        Back
      </button>
    </>
  );
};
