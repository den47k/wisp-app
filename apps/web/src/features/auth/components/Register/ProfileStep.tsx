import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  RegisterProfileRequestSchema,
  type LoginSuccess,
  type RegisterProfileRequest,
} from "@chat/domain";
import { AVATAR_GRADIENTS, Button, Icon } from "@chat/ui";
import { api } from "@/lib/api";
import { deviceName } from "../../utils";

interface ProfileStepProps {
  token: string;
  avatarIdx: number;
  setAvatarIdx: (i: number) => void;
  onDone: (token: string, user: LoginSuccess["user"]) => void;
}

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "·";

export const ProfileStep = ({
  token,
  avatarIdx,
  setAvatarIdx,
  onDone,
}: ProfileStepProps) => {
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

        <Button type="submit" disabled={submit.isPending} className="wh-onb-cta">
          {submit.isPending ? (
            "Finishing…"
          ) : (
            <>
              Enter Whisp <Icon name="arrow" size={15} />
            </>
          )}
        </Button>
      </form>
    </>
  );
};
