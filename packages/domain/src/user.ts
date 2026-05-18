import { z } from "zod";

export const AvatarSchema = z
  .object({
    path: z.string().nullish(),
    url: z.string().nullish(),
  })
  .nullish();

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tag: z.string(),
  avatar: AvatarSchema,
});

export const AuthenticatedUserSchema = UserSchema.extend({
  email: z.string().email(),
  isEmailVerified: z.boolean(),
});

export type Avatar = z.infer<typeof AvatarSchema>;
export type User = z.infer<typeof UserSchema>;
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
