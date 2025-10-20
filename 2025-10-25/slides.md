---
theme: default
favicon: /favicon.ico
title: Inside Vitest - Test Framework Architecture Deep Dive
class: text-center
transition: slide-left
---

# Inside Vitest <logos-vitest />
## Test Framework Architecture Deep Dive

---
layout: two-cols
---

# About Me

- Hiroshi Ogawa <a href="https://github.com/hi-ogawa" target="_blank">@hi-ogawa <ri-github-fill /></a>
- [Vite](https://vite.dev/) <logos-vitejs /> and [Vitest](https://vitest.dev/) <logos-vitest /> core team member
- Open Source Developer at [VoidZero](https://voidzero.dev/) <img src="/voidzero-icon.svg" class="h-5 inline" />
- SSR meta-framework fanatic 
- [Vite RSC support `@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-rsc/README.md) <logos-react />

<!-- TODO: move "about me" after intro? -->
<!-- TODO: github avatar, voidzero logo -->

<!-- 
My first Vitest PR on Oct 30, 2023
https://github.com/vitest-dev/vitest/pull/4396
-->

::right::

<img src="/avatar.jpeg" class="w-60 mx-auto mt-10 rounded-full" />

---
layout: two-cols
layoutClass: gap-8
---

# What is Vitest?

Unit testing framework

```tsx {*|1,3,6,9,14-15,19-20}
// packages/vite/src/node/__tests__/scan.spec.ts
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { commentRE, } from '../optimizer/scan'

describe('optimizer-scan:script-test', () => {
  /*...*/

  test('component return value test', () => {
    scriptRE.lastIndex = 0
    const [, tsOpenTag, tsContent] = scriptRE.exec(
      `<script lang="ts">${scriptContent}</script>`,
    )!
    expect(tsOpenTag).toEqual('<script lang="ts">')
    expect(tsContent).toEqual(scriptContent)

    scriptRE.lastIndex = 0
    const [, openTag, content] = scriptRE.exec(...)!
    expect(openTag).toEqual('<script>')
    expect(content).toEqual(scriptContent)
```

::right::

<div style="--slidev-code-font-size: 8px; --slidev-code-line-height: 0px;">
<<< @/snippets/vite-unit-test.ansi
</div>

<!--
This is one unit test case from Vite.
https://github.com/vitejs/vite/blob/main/packages/vite/src/node/__tests__/scan.spec.ts.

You see hopefully familar Test API like `describe`, `test`, `expect`.
(jasmine, mocha, jest, playwright, deno, bun).
Output on the right is what you see when you run `vitest` command.
-->

---
layout: two-cols
---

# What is Vitest?

Features

- Jest-compatible API and feature set
  - `describe`, `test`, `expect`, ...
  - mocking, snapshot, coverage, ...
- ESM and TypeScript support out of the box
  - Vite builtin features available
  <!-- same transform pipeline -> import("xxx?raw"), import.meta.glob -->
- Extensible via Vite plugin ecosystem
  - React, Vue, Svelte, ...
- Runtime agnostics
  - Node.js, Browser Mode, Cloudflare Workers

::right::

<div class="h-8" />

```ts
// [add.test.ts]
import { test, expect } from "vitest"
import { add } from "./add"

test('add', () => {
  expect(add(1, 2)).toBe(3)
})
```

<div class="h-2" />

```ts
// [Hello.test.ts]
import { test, expect } from "vitest"
import { mount } from '@vue/test-utils'
import Hello from "./Hello.vue";

test('Hello', () => {
  const wrapper = mount(Hello, { attachTo: document.body })
  expect(wrapper.text()).toContain('Hello')
})
```

<!--
While there are certain Vite futures Vitest relies on,
there are other parts which is independent from Vite.
The talk will talk about such overall test framework feature implementation.
Vite and Vitest unique feature is expalined as it comes up.

Compared to others:
- Jest
  - fragmented transform configuration (babel)

https://github.com/vitest-dev/vitest-browser-vue 
https://vuejs.org/guide/scaling-up/testing.html#mounting-libraries 
-->

---
layout: two-cols
layoutClass: gap-4
---

# What is Vitest?

Runtime agnostic ⟶ Browser Mode

<div style="--slidev-code-font-size: 10px; --slidev-code-line-height: 0px;">

```ts
// [Hello.test.ts]
import { test, expect } from "vitest"
import { page } from "vitest/browser";
import { mount } from '@vue/test-utils'
import Hello from "./Hello.vue";

test('Hello', () => {
  mount(Hello, { attachTo: document.body })
  await expect.element(page.getByText('Hello')).toBeVisible()
})
```

```ts
// [vitest.config.ts]
import { defineConfig } from "vitest/config"
import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [vue()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  }
})
```

</div>

::right::

<div class="h-8" />

![alt text](/browser-mode-ui.png)

<!-- 
The same code from previous slide.
It now runs on browser, which provides a genuine runtime like how your application runs
instead of simulated jsdom/happy-dom environment on NodeJs.
 -->

---

# Overview

<!-- 
TODO: Reverse? package -> features? e.g.
@vitest/expect, @vitest/snapshot -> assertion API (`expect`, `toEqual`, `toMatchSnapshot`)
@vitest/runner -> managing test case hierarchy and execution (`describe`, `test`, timeout, retry)
vitest, tinypool, birpc -> test orchestration, reporter, etc.
vite, vite/module-runner -> Javascript runtime with custom transform
@vitest/mocker -> Module mocking `vi.mock("", () => {})`
@vitest/coverage-v8, @vitest/coverage-istanbul -> coverage collection and reporting
@vitest/browser
@vitest/spy

TODO: package dependency as hierarchy? e.g.
vitest -> @vitest/expect, @vitest/snapshot
       -> @vitest/runner
       -> @vitest/pretty-format
       -> vite

TODO: code, server-client, architecture here?

-->


- Test Lifecycle
  - Test runner orchestration
  - Collection tests
  - Executing tests
  - Reporting results
- Vitest monorepo packages (and Vite)
  - `vitest`
  - `vite` (`ViteDevServer`, `ModuleRunner`, `ModuleGraph`)
  - `@vitest/runner`
  - `@vitest/expect`, `@vitest/snapshot`, `@vitest/pretty-format`
  - `@vitest/mocker`, `@vitest/spy`
  - `@vitest/browser`

<!-- Vitest monorepo packages dependency tree? -->

<!--
We start from reviewing the basic steps and lifecycle of running tests.
We then explain and dig deeper about each step and each component.
Along the way, we see how Vitest utilizes Vite as a foundation of certain components.
And also we'll see large parts of Vitest are not actually tied to Vite, but general test framework implementation.
Even if you are not Vitest users but Jest, Playwright, etc. users, I believe you'll be benefit
from understanding the overall test framework internals.
-->

---

# Vitest Monorepo Packages Dependencies

<img src="/vitest-monorepo-packages.png" />

<!-- 
reference https://npmgraph.js.org/?q=vitest%40beta
-->

---
layout: two-cols
layoutClass: gap-8
---

# Test Lifecycle

Example test run

<!--
TODO: cli, config, sample test, output.
TODO: layout, ascii snippet.
-->

```ts 
// [add.test.ts]
import { test, expect, describe } from "vitest"
import { add } from "./add"

describe("add", () => {
  test('one plus two', () => {
    expect(add(1, 2)).toBe(3)
  })
  test('two plus three', () => {
    expect(add(2, 3)).toBe(5)
  })
})
```

<div class="h-2" />

```ts 
// [mul.test.ts]
import { expect, test } from "vitest"
import { mul } from "./mul"

test("mul", () => {
  expect(mul(2, 3)).toBe(6)
})
```

::right::

<div class="h-8" />

```sh
$ vitest
 DEV  v4.0.0-beta.18 /.../basic

 ✓ src/add.test.ts (1 test) 1ms
   ✓ add (1)
     ✓ one plus two 1ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  01:04:30
   Duration  165ms (transform 27ms, setup 0ms, collect 37ms, tests 1ms, environment 0ms, prepare 6ms)

 PASS  Waiting for file changes...
       press h to show help, press q to quit
```

---
hide: true
---

<!-- TODO: clicks, highlight -->
<!-- TODO: map each step with reporter duration (prepare, collect, tests) -->
<!-- TODO: map each step with incremental reporter output -->
<!-- TODO: this is kinda "visible" part. it doesn't include worker etc. -->

- Select test files to run (CLI arguments, Configuration, etc.)
  - `vitest src/add.test.ts src/dir/ --project=unit --shard=1/3`
  - `defineConfig({ test: { dir: ..., include: ..., exclude: ... }, projects: [...] })`
- Spawn isolated runtime from main process (`child_process`, `worker_threads`, browser)
  <!-- there is entry point for worker or browser mode index.html -->
  <!-- not test file itself is entry -->
- Execute test _files_ to collect Test cases
  - `test("foo", () => { ... })` 
    <!-- (TODO: highlight which part is executed. it's not "...") -->
  - `describe("foo", () => { ... })`
  <!-- At this point, we obtain the tree / forest structure of all suites, hooks, test cases. cf. verbose reporter tree output -->
  <!-- Some tests maybe be skipped via `test.only`,`test.skip`, `vitest -t`, so we resolve skip states here. -->
- Run Test cases
  - `test("foo", () => { ... })` ("..." is the part actually executed)
  - verify assertions e.g. `expect(...).toEqual(...)`
- Reporting (incremental and final summary)
  - Error reporting (error diff formatting, stacktrace with code frame, github actions annotation, ...)
  - Console log aggregation
  - Coverage reporting

---

# Test runner orchestration

Spawn runtimes and schedule / assign test files

![alt text](/test-runner-orchestration.png)

<!-- 
TODO:
mention Worker, browser mode orchestration
multiple projects case
 -->

---

# Execute test _files_ to collect test cases

<!-- packages: `vitest`, `vite/module-runner`, `@vitest/runner` -->

TODO: slides from "Test collection and execution (Task tree)"

---

# Execute test cases

<!-- packages: `@vitest/runner`, `@vitest/expect`, `@vitest/snapshot` -->

TODO: slides from "Test collection and execution (Task tree)" but move highlight

---

# Reporting (incremental)

TODO: `onCollected`, `onTaskUpdate`, `onConsoleLog`

---

# Reporting (final summary)

Error reporting (error diff formatting, stacktrace with code frame, github actions annotation, ...)
Coverage reporting

---

# Client-server architecture

Error reporting (error diff formatting, stacktrace with code frame, github actions annotation, ...)
Coverage reporting

---

# Bidirectional

TODO: `birpc`, `onCancel`

---

# `expect` API

packages: `@vitest/expect`, `@vitest/pretty-format`

<!-- TODO: jest icon, chai icon -->

- Jest's `expect` implemented as [Chai](https://www.chaijs.com) plugin system
  - `toBe`, `toEqual`, `expect.extend`, `expect.any` ...
  <!-- Including Jest's own extension system `expect.extend` (e.g. `expect.extend({ toBeFoo: ... })`) -->
  <!-- Port of Jest `toEqual` implementation, which in turn is from [Jasmine](https://jasmine.github.io/) -->
  <!-- TODO: License from Jest, Jasmine, Underscore -->

```ts
import { expect } from 'vitest'
expect("Vitest").to.be.a('string') // Chai API
expect({ name: 'Vitest' }).not.toEqual({ name: 'Jest' }) // Jest API
```

- Usable as standalone pure assertion library: `toEqual`, ...
- Some `expect` methods API are coupled to Vitest runner/runtime and implemented outside of `@vitest/expect` package
  - `expect.soft(...)` (accumulate errors within a test case)
  - `expect.poll(() => ...)`, `expect().resolves/rejects` (async assertion)
  <!-- Vitest can detect when assertion are not awaited (`.then` is called or not) at the end of test to provide a warning -->
  <!-- packages/vitest/src/integrations/chai/pol.ts  -->
  - `toMatchSnapshot` (snapshot testing)
  <!--  -->
  <!-- packages/vitest/src/integrations/snapshot/chai.ts -->

<!-- TODO: sample chai extension system (next slide?) -->
<!-- TODO: object formatting and error diff. @vitest/pretty-format, (next slide?) -->

---

# Snapshot testing

`@vitest/snapshot`, `@vitest/pretty-format`

- Test framework agnostic logic lives in `@vitest/snapshot` package
  <!-- Used by webdriverio, rstest -->
  - `SnapshotClient.setup/assert/finish` (lower level API for snapshot assertion and state management)
  <!-- e.g. finding where to update inline snapshot by parsing stacktrace with a hand coded regex -->
  - `SnapshotEnvironment.readSnapshotFile/saveSnapshotFile` (interface to decouple runtime)
  <!-- for example, this is implemented as RPC which works across Node.js and Browser -->
- Some logic is coupled to Vitest's test runner
  - `SnapshotClient.assert` as chai plugin `toMatchSnapshot`, `toMatchInlineSnapshot` 
  <!-- packages/vitest/src/integrations/snapshot/chai.ts -->
  - Coordinate `SnapshotClient` within test lifecycle, e.g.
    <!-- packages/vitest/src/runtime/runners/test.ts -->
    - `VitestRunner.onBeforeRunSuite` -> `SnapshotClient.setup`
    - `VitestRunner.onAfterRunSuite` -> `SnapshotClient.finish`
    <!-- also on each test retry, the previous snapshot failure needs to be reset -->
    <!-- saving snapshot files needs to be done after all `toMatchInlineSnapshot` inside one test file are finished -->
- Printing logic is implemented in `@vitest/pretty-format` package
  - Customizable via `expect.addSnapshotSerializer`

```ts
import { expect } from 'vitest'
expect({ name: 'Vitest' }).toMatchInlineSnapshot()
```

<!--
TODO: sample snapshot inline / file
-->

---

# Test collection and execution (Task tree)

<!-- TODO: improve layout. improve clicks -->
<!-- TODO: do we need? move after "Test runner" slides? -->
<!-- packages/runner/src/collect.ts -->
<!-- packages/runner/src/run.ts -->
<!-- interfaces packages/runner/src/types/tasks.ts -->

<!-- TODO: 
On server / reporter side entities? explain in next "client server architecture" slide? 
  onCollected(files: File[]): send task tree to server
  onTaskUpdate(pack: { id, result }[], ...): send test results incrementally in batch
-->

```ts {*|2,3,6|4|7|*} 
// [add.test.ts]
describe("add", () => {
  test('first', () => { 
    expect(add(1, 2)).toBe(3)
  })
  test('second', () => {
    expect(add(2, 2)).toBe(5)
  })
})
```

<!-- Corresponding tree structure on test runner side after collection: -->

Test runner task tree:

```txt {1,2,3,5|*}
File(id: add.test.ts)
  Suite(name: add)
    Test(name: first, id: ...)
      result { status: 'passed' }
    Test(name: second, id: ...)
      result { status: 'failed', errors: [Error('Expected 5 to be 4')] }
```

<!-- TODO: fnMap not needed. just move it to task tree above for conciseness -->

```ts {1|*}
const fnMap = new WeakMap<Test, Function>(); // global map in `@vitest/runner`
fnMap.set(firstTest,  () => expect(add(1, 2)).toBe(3))
fnMap.set(secondTest, () => expect(add(2, 2)).toBe(5))
```

---

# Test runner and Client-server architecture

<!-- 
So far, we've talked by assuming "executing test files" is somehow done 
(including typescript, vue, or any files), but how does it actually work?
Here we explain powered by Vite dev server.
-->

TODO: diagram

- right: ViteDevServer, Test orchestraion pool, reporting
- left: browsers, child process forks, worker threads. `import("./add.test.ts")`
- left-to-right: `fetchModule` (module-runner), http request (browser)
- right-to-left: transpiled js (vite plugin pipeline)
- left-to-right: test result to reporter


---

# Test runner

packages: `@vitest/runner`, `vitest`

<!-- TODO: explain browser mode before server module runner? -->

- `interface VitestRunner` is an abstraction for:
  - `importFile`: how to process test files (entry points)
  <!-- As mentioned befor in Client-server architecture. 
    Test file execution starts by importing test files on "client" side. -->
  - `onBefore/AfterRunSuite`, `onBefore/AfterRunTask`: callback for test execution lifecycle
  <!-- it was just mentioned for snapshot testing state coordination -->
- `class VitestTestRunner implements VitestRunner` (Node.js)
  <!-- packages/vitest/src/runtime/runners/test.ts -->
  - `importFile` is implemented based on `ModuleRunner.import` of `vite/module-runner`
- `class BrowserVitestRunner implements VitestRunner` (Browser mode)
  - `importFile` is implemented as raw dynamic import `await import(/* @vite-ignore */ importpath)`
  <!-- packages/browser/src/client/tester/runner.ts -->
- As an advanced API, you can even inherit the base class to implement custom runner.
  <!-- https://vitest.dev/advanced/runner.html#runner-api -->
  <!-- test/cli/fixtures/custom-runner/test-runner.ts -->
  <!-- don't know main use case though? -->

```ts
// [custom-runner.ts]
import { VitestTestRunner } from 'vitest/runners'
class CustomTestRunner extends VitestTestRunner { ... }

// [vite.config.ts]
export default defineConfig({
  test: {
    runner: './custom-runner.ts'
  }
})
```

---

# Vite Module Runner

- Previously `vite-node` and Vite `ssrLoadModule`
- Request `fetchModule(id)` to Vite development server
  <!-- Just like browser directly requests javascript files to the server -->
  <!-- TODO: elaborate more? -->
- `class VitestModuleRunner extends ModuleRunner {...}`
- "Vite module runner transform" rewrites original `import` and `export` code into special functions,
  so that they can be intercepted and Vite/Vitest has a full control over module evaluation.
  - `import { add } from "/add.js"` <br /> -> `const __vite_ssr_import_0__ = await __vite_ssr_import__("/add.js")`
  - `export function add(...) { ... }` -> `__vite_ssr_exportName__("add", ...)`
  <!-- VITE_NODE_DEBUG_DUMP=true vitest -->
  <!-- VITEST_DEBUG_DUMP=.vitest-dump vitest -->
  <!-- since Vite 4 beta https://github.com/vitest-dev/vitest/pull/8711 -->

<!-- TODO: before / after code snippet -->

```js
// [.vitest-dump/root/-src-add-test-ts]
const __vite_ssr_import_0__ = await __vite_ssr_import__("/@fs/home/hiroshi/code/personal/talks/2025-10-25/node_modules/.pnpm/vitest@4.0.0-beta.18_@types+debug@4.1.12_@types+node@22.18.11_jiti@2.6.1_tsx@4.20.6_yaml@2.8.1/node_modules/vitest/dist/index.js", {"importedNames":["test","expect","describe"]});
const __vite_ssr_import_1__ = await __vite_ssr_import__("/src/add.ts", {"importedNames":["add"]});


(0,__vite_ssr_import_0__.describe)((0,__vite_ssr_import_1__.add), () => {
  (0,__vite_ssr_import_0__.test)("one plus two", () => {
    (0,__vite_ssr_import_0__.expect)((0,__vite_ssr_import_1__.add)(1, 2)).toBe(3);
  });
})
```

<!--
TODO: elabrate more
__vite_ssr_import__ -> fetchModule -> runInlineModule
-->
---

# Module mocking

<!-- put browser mode aside -->
<!-- compare "mocking" and "spying" -->
<!-- @vitest/mocker and @vitest/spy -->

- module mocking
  - `vi.mock` hoisting transform
  - works based on module runner import interception mechanism
  <!-- TODO: explain runtime mechanism? split slides?
    - `vi.mock` registers mocking metadata to `VitestModuleRunner.mocker` states
    - later when `VitestModuleRunner.import(id)` matches the mocked module, it returns the mocked object instead of the original module.
  -->
- explicit mocking with factory `vi.mock("./add.js", () => ({ add: vi.fn(() => 42) }))`
- automocking `vi.mock("./add.js")`
  - "automocking" algorithm
  <!-- import original module and deeply replace all exports with spies -->
  <!-- TODO: visualize { add: vi.fn() } -->
  <!-- https://vitest.dev/guide/mocking.html#automocking-algorithm -->

```ts
import { add } from "./add.js"

vi.mock("./add.js", () => ({ add: vi.fn(() => 42) }))

test("add", () => {
  expect(add(1, 2)).toBe(42)
})
```

```ts
__vite_ssr_import_0__.vi.mock("./add.js", () => ({
  add: __vite_ssr_import_0__.vi.fn(() => 42)
}));
const __vi_import_0__ = await __vite_ssr_dynamic_import__("/src/add.ts");

(0,__vite_ssr_import_0__.test)("add", () => {
  (0,__vite_ssr_import_0__.expect)(__vi_import_0__.add(1, 2)).not.toBe(3);
})
```

---

# Test orchestration

<!--
So far, we've looked into how each test file are executed, which is "client" side logic.
Now, let's look into how tests are orchestrated, which is "server" side logic.
-->

- Multi project support (e.g. `{ projects: ["./packages/*"] }`)
  <!-- - each project gets a separate `ViteDevServer` instance -->
- Sharding
  - Parallelization to multiple machines
- Worker pool and Scheduling (`tinypool`)
  - Pool type / Isolation 
    - Node.js -> `child_process`, `worker_threads`
    - Browser mode -> Iframe
  - Parallelization to utilize multiple CPUs
- Reporter
  - built-in reporters
  - custom reporter API
  - merging sharded results
- Watch mode
  - efficient test-rerun by the same mechanism of Vite HMR
    - file watcher
    - module graph API
    - re-transform only changed files

---

# What is isolation?

<!-- TODO: memory is fuzzy. verify current implementation. -->

- by default, each file is executed with its own `globalThis`
  - not only `globalThis`, but each runner side module graph are re-evaluated.
- `child_process` vs `worker_threads` trade-offs
  <!-- - stability
  - startup performance -->
- `isolate: false` to opt-out from isolation
  - by reusing existing child process / worker thread, it can save time to spawn each one for each test file.
  - also run multiple test files through single module runner instance, thus it avoids evaluating same modules multiple times.
  - it still allows parallelization by splitting multiple test files into multiple pools.

```ts
export default defineConfig({
  test: {
    pool: 'threads', // default is 'forks'
    isolate: false, // default is true
  },
})
```

TODO: example?

<!-- ---

# Test scheduling

TODO: test scheduling for browser mode? orchestrator + tester iframe? maybe skip since it's complicated.

TODO

- start fresh worker depending on isolation level -->

---

# Client-Server Communication

- birpc (runtime agnostic bidirectional rpc library)
- `child_process`: IPC (inter process communication)
- `worker_threads:` MessageChannel?
- Browser mode -> Websocket, BroadcastChannel
<!-- - UI mode?  -->

---

# Reporter API

TODO

<!-- ---

# Coverage

TODO -->

---

# Watch mode

TODO

---

# Summary

TODO: Back to initial lifecycles story to summarize?

---

# Thank you!

<!-- TODO

Thanks to the sponsors https://github.com/sponsors/vitest-dev#sponsors
and team and contributors https://github.com/vitest-dev/vitest/ -->
