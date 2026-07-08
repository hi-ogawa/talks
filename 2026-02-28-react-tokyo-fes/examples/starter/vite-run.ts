import assert from "node:assert";
import { createServer, isRunnableDevEnvironment } from "vite";

async function main() {
  const [input, ...args] = process.argv.slice(2);
  if (!input) {
    console.error("Usage: vite-run <module-path> [args...]");
    process.exitCode = 1;
    return;
  }

  const server = await createServer({});
  const environment = server.environments.rsc;
  assert(isRunnableDevEnvironment(environment));
  const mod = await environment.runner.import(input);
  await mod.main(args);
  await server.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
