import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const runDir = resolve(__dirname, "..");
const readmePath = resolve(runDir, "README.md");

const snapshots = [
  {
    id: "demo-1-1",
    displayCommand: "pnpm -C examples/run -s vite-run src/demo-rsc.tsx",
    command: ["pnpm", "-s", "vite-run", "src/demo-rsc.tsx"],
  },
  {
    id: "demo-1-2-simple",
    displayCommand:
      "pnpm -C examples/run -s vite-run src/demo-server-function-arguments.tsx simple",
    command: ["pnpm", "-s", "vite-run", "src/demo-server-function-arguments.tsx", "simple"],
  },
  {
    id: "demo-1-2-form",
    displayCommand: "pnpm -C examples/run -s vite-run src/demo-server-function-arguments.tsx form",
    command: ["pnpm", "-s", "vite-run", "src/demo-server-function-arguments.tsx", "form"],
  },
  {
    id: "demo-2-1",
    displayCommand: "pnpm -C examples/run -s vite-run src/demo-use-cache.tsx",
    command: ["pnpm", "-s", "vite-run", "src/demo-use-cache.tsx"],
  },
];

function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function normalizeOutput(text) {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

function runSnapshot(command) {
  const [bin, ...args] = command;
  const result = spawnSync(bin, args, {
    cwd: runDir,
    encoding: "utf8",
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const combined = `${stdout}${stderr}`;

  if (result.status !== 0) {
    throw new Error(`Command failed (${command.join(" ")}):\n${combined}`);
  }

  return normalizeOutput(stripAnsi(combined));
}

function renderBlock(displayCommand, output) {
  return ["```sh", `$ ${displayCommand}`, output, "```"].join("\n");
}

let readme = readFileSync(readmePath, "utf8");

for (const snapshot of snapshots) {
  const output = runSnapshot(snapshot.command);
  const block = renderBlock(snapshot.displayCommand, output);
  const start = `<!-- demo:${snapshot.id}:start -->`;
  const end = `<!-- demo:${snapshot.id}:end -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(readme)) {
    throw new Error(`Missing marker block for ${snapshot.id}`);
  }
  readme = readme.replace(pattern, () => `${start}\n${block}\n${end}`);
}

writeFileSync(readmePath, readme);
console.log("Updated README demo output snapshots.");
