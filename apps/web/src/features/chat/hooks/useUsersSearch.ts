import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 200;

export const useUsersSearch = (rawQuery: string) => {
  const [debounced, setDebounced] = useState(rawQuery);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [rawQuery]);

  const trimmed = debounced.trim();
  const enabled = trimmed.length >= MIN_QUERY;

  return useQuery({
    queryKey: ["users", "search", trimmed],
    queryFn: () => api.users.search(trimmed),
    enabled,
    staleTime: 1000 * 30,
  });
};
