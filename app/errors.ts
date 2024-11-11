type ErrorName = "GEN_ERROR" | "SUPA_ERROR" | "AUTH_ERROR";

export class AppError extends Error {
  name: ErrorName;
  message: string;
  code: string;

  constructor(name: ErrorName, message: string, code: string = "UNKNOWN_CODE") {
    super(message);
    this.name = name;
    this.message = message;
    this.code = code;
  }
}
