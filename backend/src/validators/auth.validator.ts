import { z } from 'zod';

/**
 * Auth Validators
 * Validation schemas for authentication endpoints
 */

// Password validation schema (mínimo 8 caracteres)
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres');

// Email validation schema
const emailSchema = z
  .string()
  .email('El email debe ser válido')
  .toLowerCase();

/**
 * Schema para registro (Sign Up)
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema para login (Sign In)
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validar entrada de registro
 */
export const validateRegisterInput = (data: unknown) => {
  try {
    return {
      success: true,
      data: registerSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Error de validación desconocido' }],
    };
  }
};

/**
 * Validar entrada de login
 */
export const validateLoginInput = (data: unknown) => {
  try {
    return {
      success: true,
      data: loginSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Error de validación desconocido' }],
    };
  }
};

/**
 * Validar contraseña (para cambios de contraseña futuros)
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
