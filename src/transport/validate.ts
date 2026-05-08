import type { ZodType } from "zod";
import { SpeckleValidationError } from "@/transport/errors.js";

export function parseOrThrow<T>(source: string, schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new SpeckleValidationError(source, result.error);
  return result.data;
}
