import assert from "node:assert";
import { createServer, isRunnableDevEnvironment } from "vite";

async function main() {
  const server = await createServer({});
  const environment = server.environments.rsc;
  assert(isRunnableDevEnvironment(environment));
  const mod = await environment.runner.import("./src/demo.tsx");
  await mod.main();
  await server.close();
}

main();
