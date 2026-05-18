import { createRealtimeClient, type RealtimeClient } from "@chat/realtime";
import { env } from "@/env";
import { api } from "@/lib/api";

let client: RealtimeClient | null = null;

export const getRealtimeClient = (): RealtimeClient => {
  if (client) return client;
  client = createRealtimeClient({
    wsUrl: env.wsUrl,
    getConnectionToken: async () => (await api.realtime.token()).token,
    getSubscriptionToken: async (channel) => (await api.realtime.subscribe(channel)).token,
  });
  return client;
};

export const resetRealtimeClient = () => {
  client?.disconnect();
  client = null;
};
