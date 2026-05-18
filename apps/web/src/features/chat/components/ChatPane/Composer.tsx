import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon, IconButton, cn } from "@chat/ui";

interface ComposerProps {
  placeholder: string;
  onSend: (text: string) => void;
}

export const Composer = ({ placeholder, onSend }: ComposerProps) => {
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(140, ta.scrollHeight)}px`;
  }, [draft]);

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const ready = draft.trim().length > 0;

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
        />
        <IconButton icon="smile" label="Emoji" size={16} />
        <button
          type="button"
          className={cn("wh-send", ready && "is-ready")}
          onClick={submit}
          disabled={!ready}
          title="Send"
          aria-label="Send"
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
