import { Centrifuge, type SubscriptionEvents } from "centrifuge";

export interface RealtimeClientOptions {
  wsUrl: string;
  getConnectionToken: () => Promise<string>;
  getSubscriptionToken: (channel: string) => Promise<string>;
}

export interface RealtimeClient {
  connect: () => void;
  disconnect: () => void;
  subscribe: <T = unknown>(
    channel: string,
    handlers: { onPublication?: (data: T) => void } & Partial<SubscriptionEvents>,
  ) => () => void;
  raw: Centrifuge;
}

export const createRealtimeClient = ({
  wsUrl,
  getConnectionToken,
  getSubscriptionToken,
}: RealtimeClientOptions): RealtimeClient => {
  const centrifuge = new Centrifuge(wsUrl, {
    getToken: async () => getConnectionToken(),
  });

  return {
    connect: () => centrifuge.connect(),
    disconnect: () => centrifuge.disconnect(),
    subscribe(channel, handlers) {
      const sub =
        centrifuge.getSubscription(channel) ??
        centrifuge.newSubscription(channel, {
          getToken: async () => getSubscriptionToken(channel),
        });

      const { onPublication, ...rest } = handlers;
      if (onPublication) {
        sub.on("publication", (ctx) => onPublication(ctx.data as never));
      }
      for (const [event, handler] of Object.entries(rest)) {
        if (handler) sub.on(event as keyof SubscriptionEvents, handler as never);
      }
      sub.subscribe();

      return () => {
        sub.unsubscribe();
        sub.removeAllListeners();
        centrifuge.removeSubscription(sub);
      };
    },
    raw: centrifuge,
  };
};
