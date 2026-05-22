import { useState } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Icon } from "@chat/ui";

interface PasswordFieldProps {
  registration: UseFormRegisterReturn;
  error?: FieldError;
  placeholder: string;
  autoComplete: "current-password" | "new-password";
  autoFocus?: boolean;
}

export const PasswordField = ({
  registration,
  error,
  placeholder,
  autoComplete,
  autoFocus,
}: PasswordFieldProps) => {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="wh-field">
      <div className={"wh-input-wrap" + (error ? " is-err" : "")}>
        <input
          type={showPw ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          autoFocus={autoFocus}
          {...registration}
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
      {error && <div className="wh-err">{error.message}</div>}
    </div>
  );
};
