import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Avatar, Icon } from "@chat/ui";
import type { Conversation, User } from "@chat/domain";
import { useUsersSearch } from "../../hooks/useUsersSearch";

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
  conversation: Conversation;
}

interface UserItem {
  kind: "user";
  id: string;
  label: string;
  hint: string;
  user: User;
}

type Item = ActionItem | ConvoItem | UserItem;

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (c: Conversation) => void;
  onSelectUser: (u: User) => void;
  onAction: (id: string) => void;
}

const ACTIONS: Omit<ActionItem, "kind">[] = [
  { id: "theme", label: "Toggle light / dark", hint: "Theme", icon: <Icon name="moon" size={14} /> },
  { id: "settings", label: "Open settings", hint: "Prefs", icon: <Icon name="settings" size={14} /> },
  { id: "archive", label: "View archived", hint: "Archive", icon: <Icon name="archive" size={14} /> },
  { id: "signout", label: "Sign out", hint: "Account", icon: <Icon name="logout" size={14} /> },
];

export const CommandPalette = ({
  open,
  onClose,
  conversations,
  onSelectConversation,
  onSelectUser,
  onAction,
}: CommandPaletteProps) => {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const kbdNav = useRef(false);

  const usersQuery = useUsersSearch(q);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
    setIdx(0);
  }, [q, open]);

  useEffect(() => {
    if (!kbdNav.current) return;
    kbdNav.current = false;
    const el = listRef.current?.querySelector<HTMLElement>(".wh-cmd-item.is-on");
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [idx]);

  const lower = q.toLowerCase();

  const convoItems: ConvoItem[] = conversations
    .filter((c) => !q || (c.title ?? "").toLowerCase().includes(lower))
    .map((c) => ({
      kind: "convo",
      id: `convo:${c.id}`,
      label: c.title ?? "Untitled",
      hint: c.type === "group" ? "Group" : c.userTag ? `@${c.userTag}` : "",
      conversation: c,
    }));

  const convoTagsInList = new Set(
    conversations.map((c) => c.userTag).filter((t): t is string => !!t),
  );
  const userItems: UserItem[] = (usersQuery.data ?? [])
    .filter((u) => !convoTagsInList.has(u.tag))
    .map((u) => ({
      kind: "user",
      id: `user:${u.id}`,
      label: u.name,
      hint: `@${u.tag}`,
      user: u,
    }));

  const actionItems: ActionItem[] = ACTIONS.filter(
    (a) => !q || a.label.toLowerCase().includes(lower) || a.hint.toLowerCase().includes(lower),
  ).map((a) => ({ ...a, kind: "action" }));

  const all: Item[] = [...convoItems, ...userItems, ...actionItems];

  const execute = (it: Item) => {
    if (it.kind === "convo") onSelectConversation(it.conversation);
    else if (it.kind === "user") onSelectUser(it.user);
    else onAction(it.id);
    onClose();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      kbdNav.current = true;
      setIdx((i) => (all.length === 0 ? 0 : (i + 1) % all.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      kbdNav.current = true;
      setIdx((i) => (all.length === 0 ? 0 : (i - 1 + all.length) % all.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (all[idx]) execute(all[idx]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  const userSearchActive = q.trim().length >= 2;
  const showConvoGroup = convoItems.length > 0;
  const showUserGroup = userSearchActive && (usersQuery.isFetching || userItems.length > 0);
  const showActionGroup = actionItems.length > 0;

  return (
    <div className="wh-cmd-overlay" onClick={onClose}>
      <div className="wh-cmd" onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="wh-cmd-input">
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people, groups, or commands…"
          />
          <kbd>esc</kbd>
        </div>

        <div className="wh-cmd-list" ref={listRef}>
          {all.length === 0 && !usersQuery.isFetching && (
            <div className="wh-cmd-empty">Nothing matches.</div>
          )}

          {showConvoGroup && <div className="wh-cmd-group">Conversations</div>}
          {convoItems.map((it) => {
            const i = all.indexOf(it);
            const isOn = i === idx;
            return (
              <div
                key={it.id}
                className={`wh-cmd-item${isOn ? " is-on" : ""}`}
                onMouseEnter={() => setIdx(i)}
                onClick={() => execute(it)}
              >
                <Avatar
                  size={22}
                  name={it.label}
                  seed={it.conversation.id}
                  group={it.conversation.type === "group"}
                />
                <span className="wh-cmd-lbl">{it.label}</span>
                <span className="wh-cmd-hint">{it.hint}</span>
              </div>
            );
          })}

          {showUserGroup && <div className="wh-cmd-group">People</div>}
          {showUserGroup && usersQuery.isFetching && userItems.length === 0 && (
            <div className="wh-cmd-empty">Searching…</div>
          )}
          {userItems.map((it) => {
            const i = all.indexOf(it);
            const isOn = i === idx;
            return (
              <div
                key={it.id}
                className={`wh-cmd-item${isOn ? " is-on" : ""}`}
                onMouseEnter={() => setIdx(i)}
                onClick={() => execute(it)}
              >
                <Avatar size={22} name={it.label} seed={it.user.id} />
                <span className="wh-cmd-lbl">{it.label}</span>
                <span className="wh-cmd-hint">{it.hint}</span>
              </div>
            );
          })}

          {showActionGroup && <div className="wh-cmd-group">Actions</div>}
          {actionItems.map((it) => {
            const i = all.indexOf(it);
            const isOn = i === idx;
            return (
              <div
                key={it.id}
                className={`wh-cmd-item${isOn ? " is-on" : ""}`}
                onMouseEnter={() => setIdx(i)}
                onClick={() => execute(it)}
              >
                <span className="wh-cmd-ico">{it.icon}</span>
                <span className="wh-cmd-lbl">{it.label}</span>
                <span className="wh-cmd-hint">{it.hint}</span>
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
