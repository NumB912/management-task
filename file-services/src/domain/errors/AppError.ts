export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BusinessError extends AppError{
  constructor(error:string){
    super("BUSSINESS_ERROR",error,409);
  }
}

export class ValidationError extends AppError {
  constructor(errors: string[]) {
    super("VALIDATION_ERROR", errors.join(", "), 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super("NOT_FOUND", `${resource}`, 404);
  }
}