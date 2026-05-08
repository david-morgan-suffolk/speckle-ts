import { Speckle } from "../src/index.js";

const TOKEN = process.env.SPECKLE_TOKEN;
if (!TOKEN) {
  console.error("SPECKLE_TOKEN missing");
  process.exit(1);
}

const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";

const sk = new Speckle({ server: SERVER, token: TOKEN });

function step(name: string) {
  console.log(`→ ${name}`);
}

async function main() {
  step("serverInfo");
  const info = await sk.http.request<{ serverInfo: { name: string; version: string | null; canonicalUrl: string } }>(
    /* GraphQL */ `
      query ServerInfo {
        serverInfo {
          name
          version
          canonicalUrl
        }
      }
    `,
  );
  console.log(`  server: ${info.serverInfo.name} (${info.serverInfo.version ?? "unknown"})`);

  step("activeUser");
  const me = await sk.activeUser.get;
  console.log(`  user: ${me.name} (${me.id})`);

  step("active user projects");
  const projects = await sk.http.request<{
    activeUser: { projects: { totalCount: number; items: Array<{ id: string; name: string }> } } | null;
  }>(/* GraphQL */ `
    query MyProjects {
      activeUser {
        projects(limit: 5) {
          totalCount
          items {
            id
            name
          }
        }
      }
    }
  `);
  const items = projects.activeUser?.projects.items ?? [];
  console.log(`  count: ${projects.activeUser?.projects.totalCount ?? 0}`);
  for (const p of items) console.log(`   - ${p.name} ${p.id}`);

  const first = items[0];
  if (first) {
    step(`project.get(${first.id})`);
    const proj = sk.project(first.id);
    const data = await proj.get;
    console.log(`  fetched: ${data.name} visibility=${data.visibility}`);

    step("project.refresh (cache-bust)");
    const before = proj.get;
    await proj.refresh();
    const after = proj.get;
    console.log(`  refresh produced new promise: ${before !== after}`);

    step(`subscribe project.onVersionsUpdate(${first.id}) for 4s`);
    let events = 0;
    const unsub = proj.onVersionsUpdate(
      () => {
        events += 1;
      },
      (err) => console.error("  sub error:", err),
    );
    await new Promise((r) => setTimeout(r, 4000));
    unsub();
    console.log(`  events received: ${events} (zero is fine — connection just needs to open without error)`);
  } else {
    console.log("  (no projects on this account; skipping project + subscription steps)");
  }

  await sk.dispose();
  console.log("✓ live smoke OK");
}

main().catch((err) => {
  console.error("✗ live smoke failed:", err);
  process.exit(1);
});
