import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      // Attempt to validate the incoming data against the schema
      return this.schema.parse(value);
    } catch (error) {
      // Handle validation errors thrown by Zod
      if (error instanceof ZodError) {
        throw new UnprocessableEntityException({
          message: 'Validation Error',
          errors: this.formatZodError(error),
        });
      }
      // Rethrow other errors
      throw error;
    }
  }

  private formatZodError(error: ZodError): any[] {
    return error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }
}
