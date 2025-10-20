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
  - Test orchestration
  - Collecting tests
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

```ts 
// [add.test.ts]
import { test, expect, describe } from "vitest"
import { add } from "./add"

describe("add", () => {
  test('first', () => {
    expect(add(1, 2)).toBe(3)
  })
  test('second', () => {
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

<div style="--slidev-code-font-size: 8px; --slidev-code-line-height: 0px;">
<<< @/snippets/lifecycle.ansi
</div>

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

# Finding test files to run

package: `vitest`

- CLI arguments (file pattern, overrides, etc.)

```sh
vitest src/add.test.ts src/dir/
vitest --project=unit #
vitest --shard=1/3 # parallelize across multiple machines
```

<div class="h-4" />

- Configuration

```ts
export default defineConfig({
  test: {
    dir: ...,
    include: ...,
    exclude: ...,
  },
  projects: [
    ...
  ]
})
```

<!-- 
First Vitest needs to search for test files.
Config file is optional.
it's mostly globing.
 -->

---

# Test runner orchestration

packages: `vitest`, `tinypool`

- Spawn isolated runtime from main process and assign test files
- The default is `pool: "forks"`

```ts
import { fork } from "node:child_process"
```

<Transform :scale="0.7" origin="top center">
<img src="/test-runner-orchestration.png" />
</Transform>

<!-- 
This is the default mode `pool: "forks"`.
The unit of isolation is by test fie.
Allow cpu based parallelization.
there is a wrapper entrypoint file. the test file itself is not executed directly).
multiple projects case.
Not spawning new process for each test file, but limited based on available cpu.
-->

---

# Test runner orchestration

- `pool: "threads"`

```js
import { Worker } from 'node:worker_threads'
```

<Transform :scale="0.8" origin="top center">
<img src="/test-runner-orchestration-threads.png" />
</Transform>

---

# Test runner orchestration

packages: `@vitest/browser-playwright`, `@vitest/browser-webdriverio`

- Browser Mode

<Transform :scale="0.9" origin="top center">
<img src="/test-runner-orchestration-browser-mode.png" />
</Transform>

---

# Test runner orchestration

- No isolation (`vitest --no-isolate` or `isolate: false`)

<Transform :scale="0.9" origin="top center">
<img src="/test-runner-orchestration-no-isolate.png" />
</Transform>

---

# About isolation and pool

- `pool: "forks"`, `"threads"`, `"vmThreads"`
  - `forks` as default for stability
- `isolate: false` to opt-out from isolation
  - Reusing existing child process / worker thread can save time to spawn for each test file.
    Runtime's module graph is also reused, so it avoids evaluating same modules multiple times when shared by multiple test files.
  - This mode still allows splitting multiple test files into multiple pools for parallelization to benefit multiple CPUs.
- Docs [Improving Performance](https://vitest.dev/guide/improving-performance.html)

<div class="h-4" />

```ts
export default defineConfig({
  test: {
    pool: 'threads', // default is 'forks'
    isolate: false, // default is true
  },
})
```

<!-- 
Initially `threads` was the default.
However, we continued to receive issue of worker threads, which often resolved by switching to `forks`.
process.chdir is available only with child_process.
While `isolate: false` is considered faster, test files execution order can affect each other and non deterministic behavior can manifest.
Test execution is always isolated from main process.
 -->

---
layout: two-cols
layoutClass: gap-4
---

# Isolation example

```ts
// [add.test.ts]
import { test } from "vitest"
import { shared } from "./shared"

test("add", ...)
```

```ts
// [mul.test.ts]
import { test } from "vitest"
import { shared } from "./shared"

test("mul", ...)
```

```ts
// [shared.ts]
console.log("[shared.ts evaluated]")
export const shared = "shared";
```

::right::

![alt text](/isolation-example.png)

<!-- 
This also shows a trade off of `isolate: false`
where it doesn't execut `add.test.ts` and `mul.test.ts` in parallel.
 -->

---

# Collecting tests

- Execute <span v-mark.red="">test files</span> to collect <span v-mark.red="">test cases</span>
- Main process only knows about test files.
- Let test runner discover test cases as it executes each test file.

---

# Creating `Task` tree

package: `@vitest/runner`

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

<div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">

<div v-click="1">

<div class="mt-10" />

```ts {0|1|1,2|1,2,3|1,2,6|*}{at:2}
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

</div>

<div v-click="1">

```ts
type Task = File | Suite | Test
```

```js {0|1|1,2|1,2,3,4,5|1,2,6,7,8|*}{at:2}
File(id: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) }
      result: undefined
    Test(name: second)
      fn: () => { expect(add(2, 2)).toBe(5) }
      result: undefined
```

</div></div>

<div class="mt-4" />

<div v-click="7">

```ansi
...
[2m Test Files [22m [1m[32m2 passed[39m[22m[90m (2)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 16:51:13
[2m   Duration [22m 130ms[2m (transform 33ms, setup 0ms, collect 46ms, tests 3ms, environment 0ms, prepare 7ms)[22m
                                               ^^^^^^^^^^^^^ 👈
```

</div>

</div>

<!-- 
Regardless of isolation mode, inside each worker test files are executed sequentially.
Here we follow collecting test cases in `add.test.ts`.

`describe`, `test` also corresdponging `Task` types are implemented in `@vitest/runner` package.

As the right, corresponding tree structure on test runner side after collection.

While this is not the part test functions are executed,
this is often the slow part since any top level import statements are executed 
and thus entire module graph is evaluated during this phase.
 -->

---

# Executing `Test`

packages: `@vitest/runner`, `@vitest/expect`, `@vitest/snapshot`, `@vitest/pretty-format`

<v-clicks>

````md magic-move
```js
File(id: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) }
      result: undefined
    Test(name: second)
      fn: () => { expect(add(2, 2)).toBe(5) }
      result: undefined
```

```js
File(id: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) }
      result: { status: 'passed' }
    Test(name: second)
      fn: () => { expect(add(2, 2)).toBe(5) }
      result: undefined
```

```js
File(id: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) }
      result: { status: 'passed' }
    Test(name: second)
      fn: () => { expect(add(2, 2)).toBe(5) }
      result: { status: 'failed', errors: [Error('Expected 5 to be 4', diff="...")] }
```
````

<div class="mt-4">

```ansi
...
[2m Test Files [22m [1m[32m2 passed[39m[22m[90m (2)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 16:51:13
[2m   Duration [22m 130ms[2m (transform 33ms, setup 0ms, collect 46ms, tests 3ms, environment 0ms, prepare 7ms)[22m
                                                            ^^^^^^^^^^^ 👈
```

</div>

</v-clicks>

<!-- 
Here, finally we execut each tests and see the results.
By default, they are sequentially executed. 
@vitest/runner provides `describe/test.current` to allow multiple asynchronous tests in parallel.

In the reporter duration, "test XXXms" shows the duration and as you can see for this trivial tests,
it's a way faster than collecting phase.
 -->

---

# Reporting results

- `onCollected(files: File[])` notify collected `Task` tree
- `onTaskUpdate(pack: { id, result }[], ...)` notify test status incrementally in batch
- `onConsoleLog(log: ConsoleLog)` notify captured console logs during test run

<Transform :scale="0.7" origin="top center">

![alt text](/reporting-results.png)

</Transform>

<!-- 
So far, we just followed what's happening on test runner side,
but actually, main process is aware of the all those activities and reports the progress to users.
As said previously, main process only knows about test files.
Here, we review how main process get notified about test collection and execution progress from test runner side.
 -->

---

# Reporter API

TODO: ansi snippet output
TODO: API interface?
Error reporting (error diff formatting, stacktrace with code frame)

<!-- 
After test runner has finished Task results are all available on main process.
Vitest has a reporter API to customize how those results are displayed or processed.

While raw data is in `File/Suite/Test` based tree structure,
Vitest normalizes them into more convenient form for reporter implementation.

 -->

---

# Example: Github Action Reporter

TODO: screenshots

---

# Where is Vite?

<v-click>

```ansi
...
[2m Test Files [22m [1m[32m2 passed[39m[22m[90m (2)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 16:51:13
[2m   Duration [22m 130ms[2m (transform 33ms, setup 0ms, collect 46ms, tests 3ms, environment 0ms, prepare 7ms)[22m
                    ^^^^^^^^^^^^^^ 👈
```

</v-click>

<!-- 
So, it looks like we've followed entire test lifecycle from test file selection, orchestration, collection, execution, and reporting.
but, how and when did Vitest actually utilitize Vite?
-->

---

# Test runner and Javascript runtime

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

<!-- 
So far, we've talked by assuming "executing test files" is somehow done 
(including typescript, vue, or any files), but how does it actually work?
Here we explain powered by Vite dev server.
-->

---

# Client-server architecture


TODO: diagram

- right: ViteDevServer, Test orchestraion pool, reporting
- left: browsers, child process forks, worker threads. `import("./add.test.ts")`
- left-to-right: `fetchModule` (module-runner), http request (browser)
- right-to-left: transpiled js (vite plugin pipeline)
- left-to-right: test result to reporter

---

# Vite Module Runner

- `vite-node` (< Vitest 4)
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
hide: true
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
hide: true
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
hide: true
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
hide: true
---

# Client-Server Communication

- birpc (runtime agnostic bidirectional rpc library)
- `child_process`: IPC (inter process communication)
- `worker_threads:` MessageChannel?
- Browser mode -> Websocket, BroadcastChannel
<!-- - UI mode?  -->

---
hide: true
---

# Reporter API

TODO

---
hide: true
---

# Coverage

TODO

---
hide: true
---

# Watch mode

- `vitest`: watch mode is default like development server
- Efficient test-rerun: similar mechanism to Vite HMR
  - File watcher API: `ViteDevServer.watch.on("change", ...)`
  - Module graph API: `ModuleGraph.invalidateModule(...)`
  - Re-transform only changed files
  - Test worker and runner side module graph is evaluated from scratch

<div class="h-4" />

```ansi
[2m Test Files [22m [1m[32m2 passed[39m[22m[90m (2)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 16:51:13
[2m   Duration [22m 130ms[2m (transform 33ms, setup 0ms, collect 46ms, tests 3ms, environment 0ms, prepare 7ms)[22m
                    ^^^^^^^^^^^^^^ 👈
[1m[42m PASS [49m[22m [32mWaiting for file changes...[39m
```

<!--
Vite server's module graph keeps previously transformed results.
It only invalidates changed files.
-->

---

# Summary

- Test Lifecycle
  - Test orchestration
  - Collecting tests
  - Executing tests
  - Reporting results
- Vitest monorepo packages (and Vite)
  - `vitest`
  - `vite` (`ViteDevServer`, `ModuleRunner`, `ModuleGraph`)
  - `@vitest/runner`
  - `@vitest/expect`, `@vitest/snapshot`, `@vitest/pretty-format`
  - `@vitest/mocker`, `@vitest/spy`
  - `@vitest/browser`

<!-- 
same as overview
 -->

---

# Thank you!

- Sponsors: [Github](https://github.com/sponsors/vitest-dev#sponsors), [Open Collective](https://opencollective.com/vitest)
- Team and Contributors [vitest-dev/vitest](https://github.com/vitest-dev/vitest/)
