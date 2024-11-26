type ErrorName =
  | "DB_ERROR"
  | "AUTH_ERROR"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

export interface PlainAppError {
  error: {
    name: ErrorName;
    message: string;
    code: string;
    status: number;
    details: string;
    hint: Record<string, any>;
  };
}

export interface AppErrorOptions {
  name: ErrorName;
  message: string;
  code?: string;
  status?: number;
  details?: string;
  hint?: Record<string, any>;
}

// Our custom error class. Use this to pinpoint what kind of error is being returned
// from our server actions.
export class AppError extends Error {
  name: ErrorName;
  message: string;
  code: string;
  status: number;
  details: string;
  hint: {};

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = options.name;
    this.message = options.message;
    this.code = options.code || "UNKNOWN_CODE";
    this.status = options.status || 500;
    this.details = options.details || "";
    this.hint = options.hint || {};
  }

  toPlainObject(): PlainAppError {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        status: this.status,
        details: this.details,
        hint: this.hint,
      },
    };
  }
}
