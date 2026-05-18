import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Avatar, Icon } from "@chat/ui";
import type { ChatConversation } from "../../types";

interface ActionItem {
  kind: "action";
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
}

interface ConvoItem {
  kind: "convo";
  id: string;
  label: string;
  hint: string;
  conversation: ChatConversation;
}

type Item = ActionItem | ConvoItem;

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  onSelectConversation: (id: string) => void;
  onAction: (id: string) => void;
}

const ACTIONS: Omit<ActionItem, "kind">[] = [
  { id: "new", label: "New conversation", hint: "Start", icon: <Icon name="plus" size={14} /> },
  { id: "theme", label: "Toggle light / dark", hint: "Theme", icon: <Icon name="moon" size={14} /> },
  { id: "settings", label: "Open settings", hint: "Prefs", icon: <Icon name="settings" size={14} /> },
  { id: "archive", label: "View archived", hint: "Archive", icon: <Icon name="archive" size={14} /> },
];

export const CommandPalette = ({
  open,
  onClose,
  conversations,
  onSelectConversation,
  onAction,
}: CommandPaletteProps) => {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const convoItems: ConvoItem[] = conversations.map((c) => ({
    kind: "convo",
    id: `go:${c.id}`,
    label: c.name,
    hint: c.group ? "Group" : `@${c.username ?? ""}`,
    conversation: c,
  }));

  const actionItems: ActionItem[] = ACTIONS.map((a) => ({ ...a, kind: "action" }));

  const lower = q.toLowerCase();
  const all: Item[] = [...convoItems, ...actionItems].filter(
    (it) => !q || it.label.toLowerCase().includes(lower) || it.hint.toLowerCase().includes(lower),
  );

  const execute = (it: Item) => {
    if (it.kind === "convo") {
      onSelectConversation(it.conversation.id);
    } else {
      onAction(it.id);
    }
    onClose();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => (i + 1) % all.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => (i - 1 + all.length) % all.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (all[idx]) execute(all[idx]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  const filteredConvos = convoItems.filter(
    (it) => !q || it.label.toLowerCase().includes(lower),
  );
  const showConvoGroup = filteredConvos.length > 0;
  const showActionGroup = all.some((it) => it.kind === "action");

  return (
    <div className="wh-cmd-overlay" onClick={onClose}>
      <div className="wh-cmd" onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="wh-cmd-input">
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            placeholder="Search people, groups, or commands…"
          />
          <kbd>esc</kbd>
        </div>

        <div className="wh-cmd-list">
          {all.length === 0 && <div className="wh-cmd-empty">Nothing matches.</div>}

          {showConvoGroup && <div className="wh-cmd-group">Conversations</div>}

          {all.map((it, i) => {
            const isOn = i === idx;
            if (it.kind === "convo") {
              return (
                <div
                  key={it.id}
                  className={`wh-cmd-item${isOn ? " is-on" : ""}`}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => execute(it)}
                >
                  <Avatar
                    gradientIdx={it.conversation.avatarIdx}
                    size={22}
                    name={it.conversation.name}
                    group={it.conversation.group}
                  />
                  <span className="wh-cmd-lbl">{it.label}</span>
                  <span className="wh-cmd-hint">{it.hint}</span>
                </div>
              );
            }
            const prevIsConvo = i > 0 && all[i - 1]?.kind === "convo";
            return (
              <div key={it.id}>
                {prevIsConvo && showActionGroup && (
                  <div className="wh-cmd-group">Actions</div>
                )}
                <div
                  className={`wh-cmd-item${isOn ? " is-on" : ""}`}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => execute(it)}
                >
                  <span className="wh-cmd-ico">{it.icon}</span>
                  <span className="wh-cmd-lbl">{it.label}</span>
                  <span className="wh-cmd-hint">{it.hint}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="wh-cmd-foot">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};
