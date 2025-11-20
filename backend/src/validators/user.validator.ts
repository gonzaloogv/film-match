import { z } from 'zod';

export const updateUserSchema = z.object({
  username: z.string().min(3, 'username must be at least 3 characters').max(50, 'username must be at most 50 characters').optional(),
  nickname: z.string().min(1, 'nickname must not be empty').max(50, 'nickname must be at most 50 characters').optional(),
  bio: z.string().max(500, 'bio must be at most 500 characters').optional().nullable(),
  profilePicture: z.string().optional().nullable(),
  // Accept empty strings or valid URLs, transform empty to null
  twitterUrl: z.union([
    z.string().url('twitterUrl must be a valid URL'),
    z.literal('').transform(() => null),
    z.null()
  ]).optional(),
  instagramUrl: z.union([
    z.string().url('instagramUrl must be a valid URL'),
    z.literal('').transform(() => null),
    z.null()
  ]).optional(),
});

export const categorySlugSchema = z.object({
  slug: z.string().min(1, 'slug must not be empty')
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type CategorySlugParams = z.infer<typeof categorySlugSchema>;