import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import demoRscSource from "../demo-rsc.tsx?raw";
import demoServerFunctionArgumentsSource from "../demo-server-function-arguments.tsx?raw";
import demoUseCacheSource from "../demo-use-cache.tsx?raw";
import "./styles.css";

type DemoOption = {
  id: string;
  label: string;
  source: string;
  mockLog: string;
};

const demos: DemoOption[] = [
  {
    id: "demo-rsc",
    label: "Demo 1.1 - demo-rsc",
    source: demoRscSource,
    mockLog: [
      "[mock] Step 1/3 reactNode = ...",
      "[mock] Step 2/3 rscStream = ...",
      "[mock] Step 3/3 reactNode = ...",
    ].join("\n"),
  },
  {
    id: "demo-server-function-arguments-simple",
    label: "Demo 1.2 - server-function-arguments (simple)",
    source: demoServerFunctionArgumentsSource,
    mockLog: [
      "[mock] Step 1/3 args = [{ greet: 'hi' }]",
      '[mock] Step 2/3 body = [{"greet":"hi"}]',
      "[mock] Step 3/3 args = [{ greet: 'hi' }]",
    ].join("\n"),
  },
  {
    id: "demo-use-cache",
    label: "Demo 2.1 - demo-use-cache",
    source: demoUseCacheSource,
    mockLog: [
      "[mock] Run #1",
      "[mock] Step 1/5 args = ... encodedArgs = ...",
      "[mock] Step 2/5 decodedArgs = ...",
      "[mock] Step 3/5 result = ...",
      "[mock] Step 4/5 stream = ...",
      "[mock] Step 5/5 finalResult = ...",
    ].join("\n"),
  },
];

function App() {
  const [selectedId, setSelectedId] = useState(demos[0].id);
  const [logText, setLogText] = useState("");

  const selectedDemo = useMemo(() => {
    const demo = demos.find((item) => item.id === selectedId);
    if (!demo) {
      throw new Error(`Unknown demo: ${selectedId}`);
    }
    return demo;
  }, [selectedId]);

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
          onClick={() => {
            const now = new Date().toISOString();
            setLogText(`${selectedDemo.mockLog}\n\n[mock] ran at ${now}`);
          }}
        >
          Run
        </button>
      </header>
      <main className="panes">
        <section className="pane pane-left">
          <pre>{selectedDemo.source}</pre>
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
