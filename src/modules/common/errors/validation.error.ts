import { ValidationError as NestValidationError } from '@nestjs/common';

export class ValidationError extends Error {
  constructor(
    public readonly error: NestValidationError[],
    public readonly message: string = 'Validation failed',
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
