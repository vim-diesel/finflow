type ErrorName =
  | "ERROR"
  | "PG_ERROR"
  | "AUTH_ERROR"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

export type PlainAppError = ReturnType<AppError["toPlainObject"]>;

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

  toPlainObject(): {
    error: { name: ErrorName; message: string; code: string; status: number };
  } {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        status: this.status,
      },
    };
  }
}

// type guard
export function isPlainAppError(obj: any): obj is PlainAppError {
  return obj && typeof obj === "object" && "name" in obj && "message" in obj;
}
