// Thin Zod wrapper so routes can validate body/params/query before hitting controllers and services.
import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

type ValidationSchema = Partial<{
  body: ZodTypeAny;
  params: ZodTypeAny;
  query: ZodTypeAny;
}>;

export function validate(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params) as Request['params'];
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query) as Request['query'];
      }

      next();
    } catch (error: unknown) {
      next(error instanceof ZodError ? error : new Error('Validation failed'));
    }
  };
}
