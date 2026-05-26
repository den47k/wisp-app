import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { useConversationsStore, selectAll, selectByIdentifier } from "@/stores/conversations";
import { api } from "@/lib/api";
import { getRealtimeClient, resetRealtimeClient } from "@/lib/realtime";
import { userChannel } from "@chat/domain";
import type { Conversation, User } from "@chat/domain";
import { Button } from "@chat/ui";
import { Aurora } from "./components/Aurora";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { CommandPalette } from "./components/CommandPalette/CommandPalette";
import { useCommandPalette } from "./components/CommandPalette/useCommandPalette";
import { SettingsPanel } from "./components/Settings/SettingsPanel";
import { useConversationsQuery } from "./hooks/useConversationsQuery";
import { useMessagesStore } from "@/stores/messages";
import { handleRealtimeEvent } from "./realtime/dispatcher";

export const ChatShell = () => {
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clear);
  const clearConversations = useConversationsStore((s) => s.clear);
  const clearMessages = useMessagesStore((s) => s.clear);
  const setEphemeral = useConversationsStore((s) => s.setEphemeral);
  const byTag = useConversationsStore((s) => s.byTag);
  const byId = useConversationsStore((s) => s.byId);
  const { toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identifier } = useParams<{ identifier: string }>();

  const conversations = useConversationsStore(selectAll);
  const active = useConversationsStore(selectByIdentifier(identifier));
  const conversationsQuery = useConversationsQuery();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();

  const logout = useMutation({
    mutationFn: () => api.auth.logout(),
    onSettled: () => {
      resetRealtimeClient();
      queryClient.clear();
      clearConversations();
      clearMessages();
      clearUser();
    },
  });

  const createPrivate = useMutation({
    mutationFn: (userId: string) => api.conversations.createPrivate(userId, false),
    onSuccess: (conversation) => {
      const existing = byId[conversation.id];
      if (existing) {
        const seg = existing.userTag ?? existing.id;
        navigate(`/${encodeURIComponent(seg)}`);
        return;
      }
      setEphemeral(conversation);
      const seg = conversation.userTag ?? conversation.id;
      navigate(`/${encodeURIComponent(seg)}`);
    },
  });

  useEffect(() => {
    if (!user) return;
    const rt = getRealtimeClient();
    rt.connect();
    const unsub = rt.subscribe(userChannel(user.id), {
      onPublication: (data) => handleRealtimeEvent(data, { currentUserId: user.id }),
    });
    return () => {
      unsub();
    };
  }, [user]);

  const goToConversation = (c: Conversation) => {
    const seg = c.userTag ?? c.id;
    navigate(`/${encodeURIComponent(seg)}`);
  };

  const onSelectUser = (u: User) => {
    const existingConvoId = byTag[u.tag];
    if (existingConvoId) {
      navigate(`/${encodeURIComponent(u.tag)}`);
      return;
    }
    createPrivate.mutate(u.id);
  };

  const handleAction = (id: string) => {
    if (id === "theme") toggleTheme();
    if (id === "settings") setSettingsOpen(true);
    if (id === "signout") setConfirmLogout(true);
  };

  const doLogout = () => {
    setConfirmLogout(false);
    logout.mutate();
  };

  return (
    <>
      <div className="wh-app">
        <Aurora />
        <Sidebar
          conversations={conversations}
          activeId={active?.id ?? null}
          onSelect={goToConversation}
          query=""
          isLoading={conversationsQuery.isPending}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenCommand={() => setCmdOpen(true)}
        />
        <Outlet />
      </div>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        conversations={conversations}
        onSelectConversation={goToConversation}
        onSelectUser={onSelectUser}
        onAction={handleAction}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSignOut={() => setConfirmLogout(true)}
      />

      {confirmLogout && (
        <div className="wh-confirm-overlay" onClick={() => setConfirmLogout(false)}>
          <div className="wh-confirm" onClick={(e) => e.stopPropagation()}>
            <h3 className="wh-confirm-h">Sign out?</h3>
            <p className="wh-confirm-desc">
              You'll need to sign in again to access your conversations.
            </p>
            <div className="wh-confirm-actions">
              <Button variant="ghost" onClick={() => setConfirmLogout(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={doLogout} disabled={logout.isPending}>
                {logout.isPending ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
