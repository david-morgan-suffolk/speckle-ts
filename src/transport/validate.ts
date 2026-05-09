import { z, type ZodType } from "zod";
import { SpeckleValidationError } from "@/transport/errors.js";

export function parseOrThrow<T>(source: string, schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new SpeckleValidationError(source, result.error);
  return result.data;
}

export function assertExists<T>(value: T | null | undefined, source: string, id?: string): T {
  if (value !== null && value !== undefined) return value;
  const message = id ? `${source} not found: ${id}` : `${source} not found`;
  throw new SpeckleValidationError(
    source,
    new z.ZodError([
      {
        code: "custom",
        path: [],
        message,
        input: value,
      },
    ]),
  );
}
