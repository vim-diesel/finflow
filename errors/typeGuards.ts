import { PlainAppError } from "./AppError";

export function isPlainAppError(obj: any): obj is PlainAppError {
  return (
    obj &&
    typeof obj === "object" &&
    "error" in obj &&
    typeof obj.error === "object" &&
    "name" in obj.error &&
    typeof obj.error.name === "string" &&
    "message" in obj.error &&
    typeof obj.error.message === "string" &&
    "code" in obj.error &&
    typeof obj.error.code === "string" &&
    "status" in obj.error &&
    typeof obj.error.status === "number" &&
    "details" in obj.error &&
    typeof obj.error.details === "string" &&
    "hint" in obj.error &&
    typeof obj.error.hint === "object"
  );
}
