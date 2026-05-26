import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon, IconButton, cn } from "@chat/ui";

interface ComposerProps {
  placeholder: string;
  onSend: (text: string) => void;
  disabled?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  submitLabel?: string;
  onCancel?: () => void;
}

export const Composer = ({
  placeholder,
  onSend,
  disabled = false,
  value,
  onChange,
  submitLabel,
  onCancel,
}: ComposerProps) => {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState("");
  const draft = controlled ? value : internal;
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(140, ta.scrollHeight)}px`;
  }, [draft]);

  const setDraft = (next: string) => {
    if (controlled) onChange?.(next);
    else setInternal(next);
  };

  const submit = () => {
    const t = draft.trim();
    if (!t || disabled) return;
    onSend(t);
    if (!controlled) setInternal("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape" && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  const ready = draft.trim().length > 0 && !disabled;
  const label = submitLabel ?? "Send";

  return (
    <div className="wh-composer-wrap">
      <div className="wh-composer">
        <IconButton icon="paperclip" label="Attach" size={16} />
        <textarea
          ref={ref}
          rows={1}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          disabled={disabled}
        />
        <IconButton icon="smile" label="Emoji" size={16} />
        {onCancel && (
          <button
            type="button"
            className="wh-composer-cancel"
            onClick={onCancel}
            title="Cancel"
            aria-label="Cancel"
          >
            <Icon name="x" size={16} />
          </button>
        )}
        <button
          type="button"
          className={cn("wh-send", ready && "is-ready")}
          onClick={submit}
          disabled={!ready}
          title={label}
          aria-label={label}
        >
          <Icon name="send" size={16} />
        </button>
      </div>
      <div className="wh-composer-hint">
        <Icon name="lock" size={11} /> Messages are end-to-end encrypted
      </div>
    </div>
  );
};
