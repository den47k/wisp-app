import { z } from "zod";

export const AvatarSchema = z
  .object({
    original: z.string(),
    medium: z.string(),
    small: z.string(),
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
  twoFactorEnabled: z.boolean(),
});

export const SearchUsersResponseSchema = z.object({
  data: z.array(UserSchema),
});

export type Avatar = z.infer<typeof AvatarSchema>;
export type User = z.infer<typeof UserSchema>;
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
export type SearchUsersResponse = z.infer<typeof SearchUsersResponseSchema>;
