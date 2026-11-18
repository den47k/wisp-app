import { z } from "zod";

export const ClientTypeSchema = z.enum(["desktop", "mobile", "web", "unknown"]);

export const DeviceSchema = z.object({
  id: z.string().uuid(),
  device_name: z.string(),
  client_type: ClientTypeSchema,
  platform: z.string().nullable(),
  browser: z.string().nullable(),
  ip_address: z.string().nullable(),
  last_seen_at: z.string().datetime().nullable(),
  last_seen_ip: z.string().nullable(),
  trusted_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});

export const DeviceListResponseSchema = z.object({
  data: z.array(DeviceSchema),
});

export type Device = z.infer<typeof DeviceSchema>;
export type DeviceListResponse = z.infer<typeof DeviceListResponseSchema>;
