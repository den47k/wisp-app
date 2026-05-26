import { SearchUsersResponseSchema, type User } from "@chat/domain";
import { request, type ApiClient } from "../client";

export const userEndpoints = (client: ApiClient) => ({
  search: async (query: string): Promise<User[]> => {
    const res = await request(client, "/users/search", SearchUsersResponseSchema, {
      method: "GET",
      params: { query },
    });
    return res.data;
  },
});
