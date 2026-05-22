import { useMemo, useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({ value, onChange, hasError, autoFocus }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => {
    const arr = (value ?? "").split("");
    return Array.from({ length: 6 }, (_, i) => arr[i] ?? "");
  }, [value]);

  const focus = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(5, i))];
    el?.focus();
    el?.select();
  };

  const setAt = (i: number, d: string) => {
    const next = [...digits];
    next[i] = d;
    onChange(next.join(""));
  };

  const fillFrom = (i: number, chars: string) => {
    const next = [...digits];
    let k = 0;
    for (; k < chars.length && i + k < 6; k++) {
      next[i + k] = chars[k]!;
    }
    onChange(next.join(""));
    focus(Math.min(i + k, 5));
  };

  const handleChange = (i: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setAt(i, "");
      return;
    }
    if (cleaned.length === 1) {
      setAt(i, cleaned);
      if (i < 5) focus(i + 1);
      return;
    }
    fillFrom(i, cleaned);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        setAt(i, "");
      } else if (i > 0) {
        setAt(i - 1, "");
        focus(i - 1);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      focus(i - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight" && i < 5) {
      focus(i + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    fillFrom(i, text);
  };

  return (
    <div className={"wh-otp-grid" + (hasError ? " is-err" : "")}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="wh-otp-box"
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
