import { createApiClient, createEndpoints } from "@chat/api-client";
import { env } from "@/env";
import { getAuthToken, useAuthStore } from "@/stores/auth";

export const apiClient = createApiClient({
  baseURL: env.apiUrl,
  getToken: getAuthToken,
  onUnauthorized: () => {
    useAuthStore.getState().clear();
  },
});

export const api = createEndpoints(apiClient);
