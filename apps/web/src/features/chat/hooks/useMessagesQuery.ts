import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useMessagesStore } from "@/stores/messages";

export const useMessagesQuery = (conversationId: string | null | undefined) => {
  const setMessages = useMessagesStore((s) => s.setMessages);
  const setStatus = useMessagesStore((s) => s.setStatus);

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => api.conversations.listMessages(conversationId as string),
    enabled: !!conversationId,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!conversationId) return;
    if (query.isPending) {
      setStatus(conversationId, "loading");
      return;
    }
    if (query.isError) {
      setStatus(conversationId, "error");
      return;
    }
    if (query.data) {
      setMessages(conversationId, query.data.items, query.data.nextCursor);
    }
  }, [conversationId, query.isPending, query.isError, query.data, setMessages, setStatus]);

  return query;
};
