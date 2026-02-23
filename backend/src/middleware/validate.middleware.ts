import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory for validating request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate ('body', 'query', or 'params')
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);

      // Replace the original data with the validated/transformed data
      req[target] = validatedData;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors,
        });
      }

      // Re-throw if it's not a Zod error
      throw error;
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/**
 * Validate request URL parameters
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
