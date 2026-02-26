import assert from "node:assert";
import { createServer, isRunnableDevEnvironment } from "vite";
import rsc from "@vitejs/plugin-rsc";

async function main() {
  const [input, ...args] = process.argv.slice(2);
  if (!input) {
    console.error("Usage: vite-run <module-path> [args...]");
    process.exitCode = 1;
    return;
  }

  const server = await createServer({
    plugins: [
      rsc({
        serverHandler: false,
      }),
    ],
  });
  const environment = server.environments.rsc;
  assert(isRunnableDevEnvironment(environment));
  const mod = await environment.runner.import(input);
  if ("main" in mod) {
    await mod.main(args);
  }
  await server.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
