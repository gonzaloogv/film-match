import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Middleware factory para validar request data con Zod
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);

      // Reemplazar data original con data validada y transformada
      req[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: messages
        });
        return;
      }

      next(error);
    }
  };
}