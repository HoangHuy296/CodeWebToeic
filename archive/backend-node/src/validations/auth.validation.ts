import { z } from 'zod';

const emailSchema = z.email('Email khÃ´ng há»£p lá»‡').transform((value) => value.toLowerCase().trim());
const passwordSchema = z
  .string()
  .min(8, 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 8 kÃ½ tá»±')
  .max(72, 'Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 72 kÃ½ tá»±');

const avatarValueSchema = z
  .string()
  .refine(
    (value) => value === '' || z.url().safeParse(value).success || value.startsWith('data:image/'),
    'Avatar URL khÃ´ng há»£p lá»‡',
  );

export const registerSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Há» tÃªn pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±').max(120, 'Há» tÃªn quÃ¡ dÃ i'),
    email: emailSchema,
    password: passwordSchema,
    phone: z.string().min(8, 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡').max(20, 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡').optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Máº­t kháº©u lÃ  báº¯t buá»™c'),
  }),
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token lÃ  báº¯t buá»™c'),
  }),
};

export const logoutSchema = refreshTokenSchema;

export const updateProfileSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Há» tÃªn pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±').max(120, 'Há» tÃªn quÃ¡ dÃ i').optional(),
    avatarUrl: avatarValueSchema.optional(),
    bio: z.string().max(1000, 'Bio quÃ¡ dÃ i').optional(),
  }),
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Máº­t kháº©u hiá»‡n táº¡i lÃ  báº¯t buá»™c'),
    newPassword: passwordSchema,
  }),
};

export const requestEmailChangeSchema = {
  body: z.object({
    newEmail: emailSchema,
  }),
};

export const confirmEmailChangeSchema = {
  body: z.object({
    newEmail: emailSchema,
    verificationCode: z.string().length(6, 'MÃ£ xÃ¡c nháº­n email pháº£i gá»“m 6 kÃ½ tá»±'),
  }),
};

export const requestPhoneChangeSchema = {
  body: z.object({
    newPhone: z.string().min(8, 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡').max(20, 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡'),
  }),
};

export const confirmPhoneChangeSchema = {
  body: z.object({
    newPhone: z.string().min(8, 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡').max(20, 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡'),
    otpCode: z.string().length(6, 'MÃ£ OTP pháº£i gá»“m 6 chá»¯ sá»‘'),
  }),
};

export type RegisterInput = z.infer<typeof registerSchema.body>;
export type LoginInput = z.infer<typeof loginSchema.body>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema.body>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema.body>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema.body>;
export type RequestEmailChangeInput = z.infer<typeof requestEmailChangeSchema.body>;
export type ConfirmEmailChangeInput = z.infer<typeof confirmEmailChangeSchema.body>;
export type RequestPhoneChangeInput = z.infer<typeof requestPhoneChangeSchema.body>;
export type ConfirmPhoneChangeInput = z.infer<typeof confirmPhoneChangeSchema.body>;
