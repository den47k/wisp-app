import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useConversationsStore } from "@/stores/conversations";

export const useConversationsQuery = () => {
  const setAll = useConversationsStore((s) => s.setAll);
  const setStatus = useConversationsStore((s) => s.setStatus);

  const query = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.conversations.list(),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (query.isPending) {
      setStatus("loading");
      return;
    }
    if (query.isError) {
      setStatus("error", query.error instanceof Error ? query.error.message : "Unknown error");
      return;
    }
    if (query.data) {
      setAll(query.data.items, query.data.nextCursor);
    }
  }, [query.isPending, query.isError, query.error, query.data, setAll, setStatus]);

  return query;
};
