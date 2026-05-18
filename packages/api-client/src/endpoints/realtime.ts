import {
  RealtimeTokenResponseSchema,
  RealtimeSubscribeResponseSchema,
  type RealtimeTokenResponse,
  type RealtimeSubscribeResponse,
} from "@chat/domain";
import { request, type ApiClient } from "../client";

export const realtimeEndpoints = (client: ApiClient) => ({
  token: (): Promise<RealtimeTokenResponse> =>
    request(client, "/realtime/token", RealtimeTokenResponseSchema, { method: "POST" }),

  subscribe: (channel: string): Promise<RealtimeSubscribeResponse> =>
    request(client, "/realtime/subscribe", RealtimeSubscribeResponseSchema, {
      method: "POST",
      data: { channel },
    }),
});
