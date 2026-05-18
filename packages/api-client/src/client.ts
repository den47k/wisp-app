import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { ZodSchema } from "zod";
import { ApiResponseShapeError, toApiError } from "./errors";

export interface ApiClientOptions {
  baseURL: string;
  getToken: () => string | null;
  onUnauthorized?: () => void;
}

export type ApiClient = AxiosInstance;

export const createApiClient = ({
  baseURL,
  getToken,
  onUnauthorized,
}: ApiClientOptions): ApiClient => {
  const instance = axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    withCredentials: false,
  });

  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (r) => r,
    (error) => {
      if (error?.response?.status === 401) {
        onUnauthorized?.();
      }
      return Promise.reject(toApiError(error));
    },
  );

  return instance;
};

export const parseResponse = <T>(endpoint: string, schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiResponseShapeError(endpoint, result.error);
  }
  return result.data;
};

export const request = async <T>(
  client: ApiClient,
  endpoint: string,
  schema: ZodSchema<T>,
  config: AxiosRequestConfig,
): Promise<T> => {
  const res = await client.request({ url: endpoint, ...config });
  return parseResponse(endpoint, schema, res.data);
};
