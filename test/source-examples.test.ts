import { expect, test } from "bun:test";
import sourceExamples from "./source-examples.json";

test("source examples manifest keeps live send target separate", () => {
  expect(sourceExamples.sources).toHaveLength(3);
  expect(sourceExamples.target.projectId).toBeTruthy();
  expect(sourceExamples.target.modelId).toBeTruthy();
  for (const source of sourceExamples.sources) {
    expect(source.projectId).toBeTruthy();
    expect(source.modelId).toBeTruthy();
    expect(source).not.toEqual(sourceExamples.target);
  }
});
