import type { CodegenConfig } from "@graphql-codegen/cli";

const SCHEMA = process.env.SPECKLE_SERVER
  ? `${process.env.SPECKLE_SERVER.replace(/\/$/, "")}/graphql`
  : "https://app.speckle.systems/graphql";

const config: CodegenConfig = {
  schema: SCHEMA,
  documents: ["src/operations/**/*.graphql"],
  generates: {
    "src/generated/schema.graphql": {
      plugins: ["schema-ast"],
    },
    "src/generated/introspection.json": {
      plugins: ["introspection"],
      config: { minify: true },
    },
    "src/generated/sdk.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-graphql-request"],
      config: {
        useTypeImports: true,
        skipTypename: false,
        avoidOptionals: { field: true },
        rawRequest: false,
        documentMode: "string",
        scalars: {
          DateTime: "string",
          JSONObject: "Record<string, unknown>",
          BigInt: "string",
          EmailAddress: "string",
        },
      },
    },
  },
  config: {
    namingConvention: {
      typeNames: "keep",
      enumValues: "keep",
    },
  },
  hooks: {
    afterAllFileWrite: ["echo 'codegen complete'"],
  },
};

export default config;
