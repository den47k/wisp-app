import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  OAuthConfirmLinkRequestSchema,
  type OAuthConfirmLinkRequest,
  type OAuthConfirmLinkResult,
} from "@chat/domain";
import { Button, Icon } from "@chat/ui";
import { api } from "@/lib/api";
import { deviceName, type Provider } from "../utils";
import { PasswordField } from "./PasswordField";

interface OAuthCallbackLinkFormProps {
  provider: Provider;
  linkToken: string;
  onResult: (res: OAuthConfirmLinkResult) => void;
}

export const OAuthCallbackLinkForm = ({
  provider,
  linkToken,
  onResult,
}: OAuthCallbackLinkFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<OAuthConfirmLinkRequest>({
    resolver: zodResolver(OAuthConfirmLinkRequestSchema),
    defaultValues: { password: "", device_name: deviceName() },
  });

  const mutation = useMutation({
    mutationFn: (data: OAuthConfirmLinkRequest) =>
      api.auth.oauthConfirmLink(provider, data, linkToken),
    onSuccess: (res) => onResult(res),
    onError: (e: Error) => setError("root", { message: e.message }),
  });

  const label = provider === "google" ? "Google" : "GitHub";

  return (
    <>
      <h2 className="wh-onb-h wh-onb-h--sm">Link your {label} account</h2>
      <p className="wh-onb-tag wh-onb-tag--sm">
        An account with this email already exists. Enter your password to link {label}.
      </p>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        style={{ width: "100%", display: "flex", flexDirection: "column" }}
        noValidate
      >
        <PasswordField
          registration={register("password")}
          error={errors.password}
          placeholder="Password"
          autoComplete="current-password"
          autoFocus
        />

        <input type="hidden" {...register("device_name")} />

        {errors.root && (
          <div className="wh-err" style={{ marginTop: 8 }}>
            {errors.root.message}
          </div>
        )}

        <Button type="submit" disabled={mutation.isPending} className="wh-onb-cta">
          {mutation.isPending ? (
            "Linking…"
          ) : (
            <>
              Link {label} <Icon name="check" size={15} />
            </>
          )}
        </Button>
      </form>

      <Link to="/login" className="wh-back-link">
        Cancel
      </Link>
    </>
  );
};
