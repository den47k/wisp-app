import { z } from "zod";

export const ClientTypeSchema = z.enum(["desktop", "mobile", "web", "unknown"]);

export const DeviceSchema = z.object({
  id: z.string().uuid(),
  deviceName: z.string(),
  clientType: ClientTypeSchema,
  platform: z.string().nullable(),
  browser: z.string().nullable(),
  ipAddress: z.string().nullable(),
  lastSeenAt: z.string().datetime({ offset: true }).nullable(),
  lastSeenIp: z.string().nullable(),
  isCurrent: z.boolean(),
  createdAt: z.string().datetime({ offset: true }),
});

export const DeviceListResponseSchema = z.object({
  data: z.array(DeviceSchema),
});

export type Device = z.infer<typeof DeviceSchema>;
export type DeviceListResponse = z.infer<typeof DeviceListResponseSchema>;
