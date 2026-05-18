import { Avatar, Icon } from "@chat/ui";
import { useAuthStore } from "@/stores/auth";
import type { ChatConversation } from "../../types";
import { ConversationListItem } from "./ConversationListItem";

interface SidebarProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  query: string;
  onOpenCommand: () => void;
  onOpenSettings: () => void;
}

const matches = (c: ChatConversation, q: string) => {
  if (!q) return true;
  const ql = q.toLowerCase();
  return c.name.toLowerCase().includes(ql) || c.last.toLowerCase().includes(ql);
};

export const Sidebar = ({
  conversations,
  activeId,
  onSelect,
  query,
  onOpenCommand,
  onOpenSettings,
}: SidebarProps) => {
  const user = useAuthStore((s) => s.user);
  const pinned = conversations.filter((c) => c.pinned && matches(c, query));
  const recent = conversations.filter((c) => !c.pinned && matches(c, query));

  return (
    <aside className="wh-sidebar">
      <div className="wh-sb-top">
        <div className="wh-sb-brand">
          <span>Wisp</span>
        </div>
      </div>

      <button type="button" className="wh-search" onClick={onOpenCommand}>
        <Icon name="search" size={14} />
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>

      <div className="wh-sb-scroll">
        {pinned.length > 0 && (
          <>
            <div className="wh-sb-section">
              <Icon name="pin" size={11} /> Pinned
            </div>
            {pinned.map((c) => (
              <ConversationListItem
                key={c.id}
                conversation={c}
                active={c.id === activeId}
                onSelect={() => onSelect(c.id)}
              />
            ))}
          </>
        )}
        <div className="wh-sb-section">Recent</div>
        {recent.map((c) => (
          <ConversationListItem
            key={c.id}
            conversation={c}
            active={c.id === activeId}
            onSelect={() => onSelect(c.id)}
          />
        ))}
      </div>

      <button type="button" className="wh-me" onClick={onOpenSettings}>
        <Avatar name={user?.name ?? "You"} seed={user?.id} size={32} online />
        <div className="wh-me-body">
          <div className="wh-me-name">{user?.name ?? "You"}</div>
          <div className="wh-me-status">@{user?.tag ?? "guest"}</div>
        </div>
        <span className="wh-icon-btn" aria-hidden="true">
          <Icon name="settings" size={16} />
        </span>
      </button>
    </aside>
  );
};
