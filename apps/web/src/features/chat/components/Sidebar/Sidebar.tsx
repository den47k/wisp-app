import { Avatar, Icon } from "@chat/ui";
import type { Conversation } from "@chat/domain";
import { useAuthStore } from "@/stores/auth";
import { ConversationListItem } from "./ConversationListItem";
import { SidebarSkeleton, SidebarSearchSkeleton, SidebarMeSkeleton } from "./SidebarSkeletons";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (c: Conversation) => void;
  query: string;
  onOpenCommand: () => void;
  onOpenSettings: () => void;
  isLoading?: boolean;
}

const matches = (c: Conversation, q: string) => {
  if (!q) return true;
  const ql = q.toLowerCase();
  const title = (c.title ?? "").toLowerCase();
  const last = (c.lastMessage?.content ?? "").toLowerCase();
  return title.includes(ql) || last.includes(ql);
};

export const Sidebar = ({
  conversations,
  activeId,
  onSelect,
  query,
  onOpenCommand,
  onOpenSettings,
  isLoading,
}: SidebarProps) => {
  const user = useAuthStore((s) => s.user);
  const filtered = conversations.filter((c) => matches(c, query));
  const showEmpty = !isLoading && filtered.length === 0;

  return (
    <aside className="wh-sidebar">
      <div className="wh-sb-top">
        <div className="wh-sb-brand">
          <span>Wisp</span>
        </div>
      </div>

      {isLoading ? (
        <SidebarSearchSkeleton />
      ) : (
        <button type="button" className="wh-search" onClick={onOpenCommand}>
          <Icon name="search" size={14} />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>
      )}

      {isLoading ? (
        <SidebarSkeleton />
      ) : showEmpty ? (
        <div className="wh-sb-scroll">
          <div className="wh-sb-empty-state">
            <button type="button" className="wh-sb-empty-cta" onClick={onOpenCommand}>
              <Icon name="plus" size={14} />
              <span>Start first chat</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="wh-sb-scroll">
          <div className="wh-sb-section">Recent</div>
          {filtered.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={c}
              active={c.id === activeId}
              onSelect={() => onSelect(c)}
            />
          ))}
        </div>
      )}

      {isLoading ? (
        <SidebarMeSkeleton />
      ) : (
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
      )}
    </aside>
  );
};
