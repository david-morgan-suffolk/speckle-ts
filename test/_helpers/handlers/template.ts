import type { GraphQLHandler, GraphQLRequestBody } from "../graphql.js";
import { gqlError } from "../graphql.js";

interface CreateModelInput {
  name: string;
}

interface CreateInsightInput {
  name: string;
}

export interface TemplateRouterOptions {
  workspaceId?: string;
  workspaceFails?: boolean;
  modelFailsAt?: string;
  insightFailsAt?: string;
}

export interface TemplateRouter {
  handlers: Record<string, GraphQLHandler>;
}

export function templateRouter(opts: TemplateRouterOptions = {}): TemplateRouter {
  let projectCounter = 0;
  let modelCounter = 0;
  let insightCounter = 0;
  let automationCounter = 0;

  const wsId = opts.workspaceId ?? "ws_1";

  const handlers: Record<string, GraphQLHandler> = {
    Workspace: () => {
      if (opts.workspaceFails) return gqlError({ message: "not found" });
      return {
        workspace: {
          id: wsId,
          name: "Acme",
          slug: "acme",
          description: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          readOnly: false,
        },
      };
    },

    CreateWorkspaceProject: () => {
      projectCounter += 1;
      return {
        workspaceMutations: {
          projects: {
            create: {
              id: `proj_${projectCounter}`,
              name: "n",
              visibility: "WORKSPACE",
              workspaceId: wsId,
            },
          },
        },
      };
    },

    CreateModel: (req: GraphQLRequestBody) => {
      modelCounter += 1;
      const input = req.variables["input"] as CreateModelInput;
      if (opts.modelFailsAt && input.name === opts.modelFailsAt) {
        return gqlError({ message: `model ${input.name} fails` });
      }
      return {
        modelMutations: {
          create: { id: `model_${modelCounter}`, name: input.name },
        },
      };
    },

    CreateInsight: (req: GraphQLRequestBody) => {
      insightCounter += 1;
      const input = req.variables["input"] as CreateInsightInput;
      if (opts.insightFailsAt && input.name === opts.insightFailsAt) {
        return gqlError({ message: `insight ${input.name} fails` });
      }
      return {
        insightMutations: {
          create: {
            id: `ins_${insightCounter}`,
            name: input.name,
            type: "x",
            version: 1,
            projectId: "proj_1",
            modelIds: [],
          },
        },
      };
    },

    CreateInsightFromTemplate: () => {
      insightCounter += 1;
      return {
        insightMutations: {
          createFromTemplate: {
            id: `ins_${insightCounter}`,
            name: "from-tpl",
            type: "x",
            version: 1,
            templateVersion: 1,
            projectId: "proj_1",
            modelIds: [],
          },
        },
      };
    },

    CreateAutomation: (req: GraphQLRequestBody) => {
      automationCounter += 1;
      const input = req.variables["input"] as { name: string };
      return {
        projectMutations: {
          automationMutations: {
            create: { id: `auto_${automationCounter}`, name: input.name },
          },
        },
      };
    },
  };

  return { handlers };
}
