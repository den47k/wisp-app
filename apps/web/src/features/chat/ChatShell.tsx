import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { api } from "@/lib/api";
import { getRealtimeClient, resetRealtimeClient } from "@/lib/realtime";
import { userChannel } from "@chat/domain";
import { Button } from "@chat/ui";
import { MOCK_CONVERSATIONS, MOCK_THREADS } from "./mocks";
import type { ChatConversation, ChatMessage } from "./types";
import { Aurora } from "./components/Aurora";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { ChatPane } from "./components/ChatPane/ChatPane";
import { CommandPalette } from "./components/CommandPalette/CommandPalette";
import { useCommandPalette } from "./components/CommandPalette/useCommandPalette";
import { SettingsPanel } from "./components/Settings/SettingsPanel";

export const ChatShell = () => {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const { toggle: toggleTheme } = useThemeStore();

  const [conversations, setConversations] = useState<ChatConversation[]>(MOCK_CONVERSATIONS);
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>(MOCK_THREADS);
  const [activeId, setActiveId] = useState<string>(MOCK_CONVERSATIONS[0]!.id);
  const [typing, setTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();

  const logout = useMutation({
    mutationFn: () => api.auth.logout(),
    onSettled: () => {
      resetRealtimeClient();
      clear();
    },
  });

  useEffect(() => {
    if (!user) return;
    const rt = getRealtimeClient();
    rt.connect();
    const unsub = rt.subscribe(userChannel(user.id), {
      onPublication: (data) => console.log("[user channel]", data),
    });
    return () => {
      unsub();
    };
  }, [user]);

  const active = (conversations.find((c) => c.id === activeId) ?? conversations[0])!;
  const messages = threads[activeId] ?? [];

  const handleSend = (text: string) => {
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      from: "me",
      at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
    };
    setThreads((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), msg],
    }));
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, last: text, lastAt: "now", unread: 0 } : c)),
    );

    setTyping(true);
    const delay = 1200 + Math.random() * 1000;
    setTimeout(() => {
      setTyping(false);
      const reply: ChatMessage = {
        id: `m${Date.now()}`,
        from: "them",
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: "👍",
      };
      setThreads((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] ?? []), reply],
      }));
    }, delay);
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
          activeId={activeId}
          onSelect={setActiveId}
          query=""
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenCommand={() => setCmdOpen(true)}
        />
        <ChatPane conversation={active} messages={messages} typing={typing} onSend={handleSend} />
      </div>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        conversations={conversations}
        onSelectConversation={(id) => {
          setActiveId(id);
        }}
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
