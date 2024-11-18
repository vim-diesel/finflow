import { PlainAppError } from "./AppError";

export function isPlainAppError(obj: any): obj is PlainAppError {
  return (
    obj &&
    typeof obj === "object" &&
    "error" in obj &&
    typeof obj.error === "object" &&
    "name" in obj.error &&
    "message" in obj.error &&
    "code" in obj.error &&
    "status" in obj.error
  );
}
