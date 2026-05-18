import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leading?: ReactNode;
  inputPrefix?: ReactNode;
  trailing?: ReactNode;
  wrapClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leading, inputPrefix, trailing, className, wrapClassName, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="wh-field">
        {label && (
          <label htmlFor={inputId} className="wh-label">
            {label}
          </label>
        )}
        <div className={cn("wh-input-wrap", error && "is-err", wrapClassName)}>
          {leading}
          {inputPrefix && <span className="wh-input-prefix">{inputPrefix}</span>}
          <input ref={ref} id={inputId} className={className} {...rest} />
          {trailing}
        </div>
        {error && <span className="wh-err">{error}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
