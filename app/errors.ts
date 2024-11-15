type ErrorName = "ERROR" | "PG_ERROR" | "AUTH_ERROR";

// Our custom error class. Use this to pinpoint what kind of error is being returned
// from our server actions.
export class AppError extends Error {
  name: ErrorName;
  message: string;
  code: string;
  status: number;

  constructor(
    name: ErrorName,
    message: string,
    code: string = "UNKNOWN_CODE",
    status: number = 500,
  ) {
    super(message);
    this.name = name;
    this.message = message;
    this.code = code;
    this.status = status;
  }

  toPlainObject() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
    };
  }
}
