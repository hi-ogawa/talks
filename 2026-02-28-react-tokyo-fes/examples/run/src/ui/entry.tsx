import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
// @ts-ignore
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/themes/prism.css";
import demoRscSource from "../demo-rsc.tsx?raw";
import demoServerFunctionArgumentsSource from "../demo-server-function-arguments.tsx?raw";
import demoUseCacheSource from "../demo-use-cache.tsx?raw";
import "./styles.css";

// @ts-ignore
import * as demo from "../../dist/rsc/index.js";

type DemoOption = {
  id: string;
  label: string;
  source: string;
  key: "demoRsc" | "demoServerFunctionArguments" | "demoUseCache";
  args: string[];
};

const demos: DemoOption[] = [
  {
    id: "demo-rsc",
    label: "Demo 1.1 - demo-rsc",
    source: demoRscSource,
    key: "demoRsc",
    args: [],
  },
  {
    id: "demo-server-function-arguments-simple",
    label: "Demo 1.2 - server-function-arguments (simple)",
    source: demoServerFunctionArgumentsSource,
    key: "demoServerFunctionArguments",
    args: ["simple"],
  },
  {
    id: "demo-server-function-arguments-form",
    label: "Demo 1.2 - server-function-arguments (form)",
    source: demoServerFunctionArgumentsSource,
    key: "demoServerFunctionArguments",
    args: ["form"],
  },
  {
    id: "demo-use-cache",
    label: "Demo 2.1 - demo-use-cache",
    source: demoUseCacheSource,
    key: "demoUseCache",
    args: [],
  },
];

function formatValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return String(value);
  }
  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === "bigint") {
        return `${val.toString()}n`;
      }
      if (typeof val === "function") {
        return `[Function ${val.name || "anonymous"}]`;
      }
      if (typeof val === "symbol") {
        return String(val);
      }
      return val;
    },
    2,
  );
}

async function runDemo(selectedDemo: DemoOption) {
  const lines: string[] = [];
  const consoleLog = console.log;

  console.log = (...args: unknown[]) => {
    consoleLog(...args);
    lines.push(args.map((arg) => formatValue(arg)).join(" "));
  };

  try {
    const mod = (demo as any)[selectedDemo.key];
    if (!mod || typeof mod.main !== "function") {
      throw new Error(`Missing demo export: ${selectedDemo.key}`);
    }
    await mod.main(selectedDemo.args);
  } finally {
    console.log = consoleLog;
  }

  return lines.join("\n");
}

function App() {
  const [selectedId, setSelectedId] = useState(demos[0].id);
  const [logText, setLogText] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const selectedDemo = useMemo(() => {
    const demo = demos.find((item) => item.id === selectedId);
    if (!demo) {
      throw new Error(`Unknown demo: ${selectedId}`);
    }
    return demo;
  }, [selectedId]);

  const highlightedCode = useMemo(() => {
    try {
      return Prism.highlight(selectedDemo.source, Prism.languages.tsx, "tsx");
    } catch {
      return selectedDemo.source
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
    }
  }, [selectedDemo.source]);

  return (
    <div className="app">
      <header className="header">
        <label htmlFor="demo-select">Example</label>
        <select
          id="demo-select"
          className="select"
          value={selectedId}
          onChange={(event) => {
            setSelectedId(event.target.value);
            setLogText("");
          }}
        >
          {demos.map((demo) => (
            <option key={demo.id} value={demo.id}>
              {demo.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={isRunning}
          onClick={async () => {
            setIsRunning(true);
            setLogText("");
            try {
              const output = await runDemo(selectedDemo);
              setLogText(output);
            } catch (error) {
              setLogText(String(error));
            } finally {
              setIsRunning(false);
            }
          }}
        >
          {isRunning ? "Running..." : "Run"}
        </button>
      </header>
      <main className="panes">
        <section className="pane pane-left">
          <pre>
            <code className="language-tsx" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </pre>
        </section>
        <section className="pane">
          <pre>{logText}</pre>
        </section>
      </main>
    </div>
  );
}

const rootElement = document.querySelector<HTMLDivElement>("#app");
if (!rootElement) {
  throw new Error("#app not found");
}

createRoot(rootElement).render(<App />);
