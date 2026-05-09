import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import { Speckle } from "@/client.js";
import { getSdk } from "@/generated/sdk.js";
import { loadCredentials } from "@/cli/auth.js";
import type { BuildSpeckleOptions } from "@/cli/client.js";

interface ProjectRow {
  id: string;
  name: string;
  visibility: string;
  role: string | null;
  updatedAt: string;
}

interface ModelRow {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

interface VersionRow {
  id: string;
  message: string | null;
  authorName: string | null;
  createdAt: string;
}

type Pane = "projects" | "models" | "versions";

export function App(props: BuildSpeckleOptions): React.ReactNode {
  const [error, setError] = useState<string | null>(null);
  const [pane, setPane] = useState<Pane>("projects");
  const [accountName, setAccountName] = useState<string>("...");
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [models, setModels] = useState<ModelRow[]>([]);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [projIdx, setProjIdx] = useState(0);
  const [modelIdx, setModelIdx] = useState(0);
  const [versionIdx, setVersionIdx] = useState(0);
  const [speckle, setSpeckle] = useState<Speckle | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const creds = props.token
          ? {
              server: props.server ?? "https://app.speckle.systems",
              token: props.token,
            }
          : loadCredentials(props.profile);
        const sk = new Speckle({ server: creds.server, token: creds.token });
        if (!active) {
          await sk.dispose();
          return;
        }
        setSpeckle(sk);
        const account = await sk.account.get;
        if (!active) return;
        setAccountName(`${account.name}${account.role ? ` (${account.role})` : ""}`);
        const sdk = getSdk(sk.http);
        const data = await sdk.SearchProjects({ limit: 50 });
        if (!active) return;
        setProjects(data.activeUser?.projects.items ?? []);
      } catch (err) {
        if (active) setError((err as Error).message);
      }
    })();
    return () => {
      active = false;
    };
  }, [props.profile, props.server, props.token]);

  const loadModels = useCallback(
    async (projectId: string) => {
      if (!speckle) return;
      try {
        const sdk = getSdk(speckle.http);
        const data = await sdk.GetProjectModels({ projectId, limit: 50 });
        setModels(data.project.models.items);
        setModelIdx(0);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [speckle],
  );

  const loadVersions = useCallback(
    async (projectId: string, modelId: string) => {
      if (!speckle) return;
      try {
        const sdk = getSdk(speckle.http);
        const data = await sdk.GetModelVersions({ projectId, modelId, limit: 50 });
        setVersions(
          data.project.model.versions.items.map((v) => ({
            id: v.id,
            message: v.message,
            authorName: v.authorUser?.name ?? null,
            createdAt: v.createdAt,
          })),
        );
        setVersionIdx(0);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [speckle],
  );

  useKeyboard(async (key) => {
    if (key.name === "q" || key.name === "escape") {
      if (pane === "projects" || key.name === "q") {
        if (speckle) await speckle.dispose();
        process.exit(0);
      } else if (pane === "models") {
        setPane("projects");
      } else if (pane === "versions") {
        setPane("models");
      }
      return;
    }
    if (key.name === "up" || key.name === "k") {
      if (pane === "projects") setProjIdx((i) => Math.max(0, i - 1));
      else if (pane === "models") setModelIdx((i) => Math.max(0, i - 1));
      else if (pane === "versions") setVersionIdx((i) => Math.max(0, i - 1));
      return;
    }
    if (key.name === "down" || key.name === "j") {
      if (pane === "projects") setProjIdx((i) => Math.min(projects.length - 1, i + 1));
      else if (pane === "models") setModelIdx((i) => Math.min(models.length - 1, i + 1));
      else if (pane === "versions")
        setVersionIdx((i) => Math.min(versions.length - 1, i + 1));
      return;
    }
    if (key.name === "return" || key.name === "enter") {
      if (pane === "projects" && projects[projIdx]) {
        await loadModels(projects[projIdx].id);
        setPane("models");
      } else if (pane === "models" && projects[projIdx] && models[modelIdx]) {
        await loadVersions(projects[projIdx].id, models[modelIdx].id);
        setPane("versions");
      }
    }
  });

  if (error) {
    return (
      <box border padding={1}>
        <text>error: {error}</text>
        <text>(press q to quit)</text>
      </box>
    );
  }

  const header = `speckle — ${accountName}    [↑/↓ select  ⏎ drill   esc back  q quit]`;
  let body: React.ReactNode;
  if (pane === "projects") {
    body = (
      <box border padding={1} flexDirection="column">
        <text>Projects ({projects.length})</text>
        {projects.map((p, i) => (
          <text key={p.id}>
            {i === projIdx ? "▶ " : "  "}
            {p.name}  ·  {p.visibility}  ·  {p.role ?? "-"}  ·  {p.id}
          </text>
        ))}
      </box>
    );
  } else if (pane === "models") {
    body = (
      <box border padding={1} flexDirection="column">
        <text>Models ({models.length}) — {projects[projIdx]?.name ?? ""}</text>
        {models.map((m, i) => (
          <text key={m.id}>
            {i === modelIdx ? "▶ " : "  "}
            {m.name}  ·  {m.id}
          </text>
        ))}
      </box>
    );
  } else {
    body = (
      <box border padding={1} flexDirection="column">
        <text>
          Versions ({versions.length}) — {projects[projIdx]?.name ?? ""} / {models[modelIdx]?.name ?? ""}
        </text>
        {versions.map((v, i) => (
          <text key={v.id}>
            {i === versionIdx ? "▶ " : "  "}
            {v.id.slice(0, 8)}  ·  {v.message ?? "(no message)"}  ·  {v.authorName ?? "-"}  ·  {v.createdAt}
          </text>
        ))}
      </box>
    );
  }

  return (
    <box flexDirection="column">
      <text>{header}</text>
      {body}
    </box>
  );
}
