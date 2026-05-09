import { Speckle } from "../src/index.js";
import { renderAccount } from "../src/cli/format.js";

const TOKEN = process.env.SPECKLE_TOKEN;
if (!TOKEN) {
  console.error("SPECKLE_TOKEN missing");
  process.exit(1);
}

const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";
const sk = new Speckle({ server: SERVER, token: TOKEN });

async function main() {
  const account = await sk.account.get;
  console.log(renderAccount(account, SERVER));
  await sk.dispose();
}

main().catch((err) => {
  console.error("✗ account-info failed:", err);
  void sk.dispose();
  process.exit(1);
});
