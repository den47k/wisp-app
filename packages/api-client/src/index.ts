export { createApiClient, type ApiClient, type ApiClientOptions } from "./client";
export { ApiError, ApiValidationError, ApiResponseShapeError } from "./errors";
export { authEndpoints } from "./endpoints/auth";
export { conversationEndpoints } from "./endpoints/conversations";
export { realtimeEndpoints } from "./endpoints/realtime";

import type { ApiClient } from "./client";
import { authEndpoints } from "./endpoints/auth";
import { conversationEndpoints } from "./endpoints/conversations";
import { realtimeEndpoints } from "./endpoints/realtime";

export const createEndpoints = (client: ApiClient) => ({
  auth: authEndpoints(client),
  conversations: conversationEndpoints(client),
  realtime: realtimeEndpoints(client),
});

export type Endpoints = ReturnType<typeof createEndpoints>;
