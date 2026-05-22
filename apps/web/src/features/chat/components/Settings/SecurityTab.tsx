import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  TwoFactorDisableRequestSchema,
  type TwoFactorDisableRequest,
  type TwoFactorEnableResponse,
} from "@chat/domain";
import { Button, Icon, LinkButton } from "@chat/ui";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { QrImage } from "./QrImage";

type Phase = "off" | "setup" | "recovery" | "on";
type PwAction = "disable" | "regenerate";

export const SecurityTab = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const enabled = !!user?.twoFactorEnabled;

  const [phase, setPhase] = useState<Phase>(enabled ? "on" : "off");
  const [enrollment, setEnrollment] = useState<TwoFactorEnableResponse | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [pwAction, setPwAction] = useState<PwAction | null>(null);

  useEffect(() => {
    if (!enabled && phase === "on") setPhase("off");
    if (enabled && phase === "off") setPhase("on");
  }, [enabled]);

  const enable = useMutation({
    mutationFn: () => api.auth.twoFactorEnable(),
    onSuccess: (res) => {
      setEnrollment(res);
      setPhase("setup");
    },
  });

  const startSetup = () => {
    setPwAction(null);
    enable.mutate();
  };

  const onConfirmed = (recovery: string[]) => {
    if (user) setUser({ ...user, twoFactorEnabled: true });
    setEnrollment(null);
    setCodes(recovery);
    setPhase("recovery");
  };

  return (
    <div className="wh-tfa">
      <div className="wh-settings-h-row">
        <h3 className="wh-settings-h">Two-factor authentication</h3>
        {phase === "on" && (
          <span className="wh-badge-ok">
            <Icon name="shieldCheck" size={11} /> On
          </span>
        )}
      </div>

      {phase === "off" && (
        <>
          <p className="wh-tfa-lede">
            Add a second step to sign in. We'll ask for a one-time code from your authenticator app
            whenever you log in from a new device.
          </p>
          <button className="wh-tfa-cta" onClick={startSetup} disabled={enable.isPending}>
            <span className="wh-tfa-cta-icon">
              <Icon name="shield" size={20} />
            </span>
            <span className="wh-tfa-cta-body">
              <span className="wh-tfa-cta-ttl">
                {enable.isPending ? "Starting…" : "Set up two-factor authentication"}
              </span>
              <span className="wh-tfa-cta-sub">
                Takes about a minute. You'll need an authenticator app.
              </span>
            </span>
            <span className="wh-tfa-cta-arrow">
              <Icon name="arrow" size={16} />
            </span>
          </button>
          {enable.error && (
            <div className="wh-err wh-tfa-err">
              {enable.error instanceof Error ? enable.error.message : "Could not start setup."}
            </div>
          )}
        </>
      )}

      {phase === "setup" && enrollment && (
        <SetupPhase
          enrollment={enrollment}
          accountLabel={user?.email ?? ""}
          onConfirmed={onConfirmed}
          onCancel={() => setPhase(enabled ? "on" : "off")}
        />
      )}

      {phase === "recovery" && (
        <RecoveryPhase
          codes={codes}
          accountLabel={user?.email ?? ""}
          onFinish={() => setPhase("on")}
        />
      )}

      {phase === "on" && (
        <>
          <p className="wh-tfa-lede">
            Your account is protected by two-factor authentication. You'll be asked for a one-time
            code when signing in from a new device.
          </p>

          {pwAction ? (
            <PasswordConfirm
              action={pwAction}
              onCancel={() => setPwAction(null)}
              onDisabled={() => {
                if (user) setUser({ ...user, twoFactorEnabled: false });
                setPwAction(null);
                setPhase("off");
              }}
              onRegenerated={(recovery) => {
                setPwAction(null);
                setCodes(recovery);
                setPhase("recovery");
              }}
            />
          ) : (
            <>
              {/*<div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">Authenticator app</div>
                  <div className="wh-settings-desc">
                    Linked · scan a new QR to replace your current device.
                  </div>
                </div>
                <LinkButton
                  onClick={startSetup}
                  disabled={enable.isPending}
                >
                  Replace
                </LinkButton>
              </div>*/}
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">Recovery codes</div>
                  <div className="wh-settings-desc">
                    Generate a fresh set — this invalidates your old codes.
                  </div>
                </div>
                <LinkButton onClick={() => setPwAction("regenerate")}>Regenerate</LinkButton>
              </div>
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl wh-settings-lbl--danger">Turn off 2FA</div>
                  <div className="wh-settings-desc">
                    Your account will be protected by your password only.
                  </div>
                </div>
                <LinkButton tone="danger" onClick={() => setPwAction("disable")}>
                  Turn off
                </LinkButton>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const SetupPhase = ({
  enrollment,
  accountLabel,
  onConfirmed,
  onCancel,
}: {
  enrollment: TwoFactorEnableResponse;
  accountLabel: string;
  onConfirmed: (codes: string[]) => void;
  onCancel: () => void;
}) => {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const confirm = useMutation({
    mutationFn: (otp: string) => api.auth.twoFactorConfirm({ otp }),
    onSuccess: (res) => onConfirmed(res.recovery_codes),
    onError: (e: Error) => setErr(e.message),
  });

  const submit = () => {
    if (code.length < 6) {
      setErr("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setErr(null);
    confirm.mutate(code);
  };

  return (
    <div className="wh-tfa-setup">
      <div className="wh-tfa-scan">
        <div className="wh-tfa-qr">
          <QrImage value={enrollment.qr_uri} size={124} />
        </div>
        <div className="wh-tfa-scan-info">
          <div className="wh-tfa-scan-ttl">Scan with your authenticator app</div>
          <div className="wh-tfa-scan-sub">
            Open your authenticator and tap <b>+</b> to add an account, then point the camera at the
            code.
          </div>
          <div className="wh-tfa-scan-meta">
            <span>{accountLabel && <span>{accountLabel}</span>}</span>
            <span className="wh-tfa-dot" />
            <span>TOTP</span>
            <span className="wh-tfa-dot" />
            <span>30s</span>
          </div>
        </div>
        <div className="wh-tfa-manual-strip">
          <div className="wh-tfa-manual-lbl">Or enter the secret manually</div>
          <ManualCode secret={enrollment.secret} />
        </div>
      </div>

      <div className="wh-tfa-verify-row">
        <div className="wh-tfa-verify-lbl">Verification code</div>
        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v);
            if (err) setErr(null);
            if (v.length === 6 && !confirm.isPending) confirm.mutate(v);
          }}
          hasError={!!err}
          autoFocus
        />
        {err && <div className="wh-err wh-tfa-err">{err}</div>}
      </div>

      <div className="wh-tfa-actions">
        <Button variant="ghost" size="auto" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="auto"
          onClick={submit}
          disabled={code.length < 6 || confirm.isPending}
          trailing={<Icon name="arrow" size={14} />}
        >
          {confirm.isPending ? "Verifying…" : "Verify & continue"}
        </Button>
      </div>
    </div>
  );
};

const RecoveryPhase = ({
  codes,
  accountLabel,
  onFinish,
}: {
  codes: string[];
  accountLabel: string;
  onFinish: () => void;
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="wh-tfa-recovery">
      <p className="wh-tfa-lede wh-tfa-lede--ok">
        <Icon name="shieldCheck" size={14} />
        <span>
          <strong>Authenticator linked.</strong> Save these recovery codes — each works once if you
          lose access to your app. We won't show them again.
        </span>
      </p>
      <RecoveryCodes codes={codes} accountLabel={accountLabel} />
      <div className="wh-tfa-finish-row">
        <label className="wh-tfa-ack">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <span>I've saved my recovery codes somewhere safe</span>
        </label>
        <Button
          variant="primary"
          size="auto"
          disabled={!acknowledged}
          onClick={onFinish}
          leading={<Icon name="check" size={14} />}
        >
          Finish
        </Button>
      </div>
    </div>
  );
};

const RecoveryCodes = ({ codes, accountLabel }: { codes: string[]; accountLabel: string }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const asText = () =>
    `Wisp — Recovery Codes\n` +
    (accountLabel ? `Account: ${accountLabel}\n` : "") +
    `Generated: ${new Date().toLocaleString()}\n\n` +
    `Keep these safe. Each can be used once to recover access if you lose your authenticator.\n\n` +
    codes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
    "\n";

  const onCopy = async () => {
    try {
      await navigator.clipboard?.writeText(codes.join("\n"));
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const onDownload = () => {
    const blob = new Blob([asText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wisp-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1800);
  };

  return (
    <div className="wh-tfa-rec-grid">
      {codes.map((c, i) => (
        <div key={c} className="wh-tfa-rec-cell">
          <span className="wh-tfa-rec-n">{String(i + 1).padStart(2, "0")}</span>
          <span className="wh-tfa-rec-code">{c}</span>
        </div>
      ))}
      <div className="wh-tfa-rec-actions">
        <button className="wh-tfa-rec-action" onClick={onCopy} title="Copy all codes">
          {copied ? (
            <>
              <Icon name="check" size={13} /> Copied
            </>
          ) : (
            <>
              <Icon name="copy" size={13} /> Copy
            </>
          )}
        </button>
        <button className="wh-tfa-rec-action" onClick={onDownload} title="Download as .txt">
          {downloaded ? (
            <>
              <Icon name="check" size={13} /> Saved
            </>
          ) : (
            <>
              <Icon name="download" size={13} /> Download
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ManualCode = ({ secret }: { secret: string }) => {
  const [copied, setCopied] = useState(false);
  const formatted = secret.match(/.{1,4}/g)?.join(" ") ?? secret;

  return (
    <button
      type="button"
      className="wh-tfa-secret"
      title="Copy secret"
      onClick={async () => {
        try {
          await navigator.clipboard?.writeText(secret);
        } catch {
          return;
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      <span className="wh-tfa-secret-code">{formatted}</span>
      <span className={"wh-tfa-secret-copy" + (copied ? " is-on" : "")}>
        {copied ? (
          <>
            <Icon name="check" size={12} /> Copied
          </>
        ) : (
          <>
            <Icon name="copy" size={12} /> Copy
          </>
        )}
      </span>
    </button>
  );
};

const PasswordConfirm = ({
  action,
  onCancel,
  onDisabled,
  onRegenerated,
}: {
  action: PwAction;
  onCancel: () => void;
  onDisabled: () => void;
  onRegenerated: (codes: string[]) => void;
}) => {
  const isDisable = action === "disable";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TwoFactorDisableRequest>({
    resolver: zodResolver(TwoFactorDisableRequestSchema),
    defaultValues: { password: "" },
  });

  const mutation = useMutation<
    { message: string } | { recovery_codes: string[] },
    Error,
    TwoFactorDisableRequest
  >({
    mutationFn: (body) =>
      isDisable ? api.auth.twoFactorDisable(body) : api.auth.twoFactorRecoveryCodes(body),
    onSuccess: (res) => {
      if (isDisable) onDisabled();
      else onRegenerated((res as { recovery_codes: string[] }).recovery_codes);
    },
    onError: (e) => setError("password", { message: e.message }),
  });

  return (
    <form className="wh-tfa-confirm" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
      <div className="wh-tfa-confirm-ttl">
        {isDisable ? "Turn off two-factor authentication" : "Regenerate recovery codes"}
      </div>
      <div className="wh-tfa-confirm-desc">
        {isDisable
          ? "Enter your password to disable 2FA. You can re-enable it any time."
          : "Enter your password to generate a new set of recovery codes. Your old codes stop working."}
      </div>
      <PasswordField
        registration={register("password")}
        error={errors.password}
        placeholder="Password"
        autoComplete="current-password"
        autoFocus
      />
      <div className="wh-tfa-actions">
        <Button variant="ghost" size="auto" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant={isDisable ? "danger" : "primary"}
          size="auto"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Working…" : isDisable ? "Turn off" : "Generate new codes"}
        </Button>
      </div>
    </form>
  );
};
