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

# About Me

<!-- TODO: move "about me" after intro? -->
<!-- TODO: github avatar, voidzero logo -->

- <a href="https://github.com/hi-ogawa" target="_blank">@hi-ogawa <ri-github-fill /></a>
- Open Source Developer at [VoidZero](https://voidzero.dev/)
- [Vite](https://vite.dev/) <logos-vitejs /> and [Vitest](https://vitest.dev/) <logos-vitest /> core team member
- SSR meta-framework fanatic
- [Vite RSC support `@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-rsc/README.md) <logos-react />

---
layout: two-cols
---

# What is Vitest?

```tsx {3,6,9,14-15,19-20}
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

<!-- TODO: use ascii snippet? -->

![alt text](/intro-output.png)

<!-- 
This is one unit test case from Vite.
https://github.com/vitejs/vite/blob/main/packages/vite/src/node/__tests__/scan.spec.ts.

You see hopefully familar Test API like `describe`, `test`, `expect`.
Output on the right is what you see when you run `vitest` command.
-->

---

# What is Vitest?

<!-- TODO: code on the right -->
<!-- TODO: more icon -->

- Jest-compatible API
  - `describe`, `test`, `expect`, ...
- ESM and TypeScript support out of the box
  - Vite builtin features
- Extensible via Vite plugin ecosystem
  - Vue, React, Svelte, ...
- Runtime agnostics
  - Node.js, Browser, Cloudflare Workers

```ts 
// [add.test.ts]
import { test, expect, describe } from "vitest"
import { add } from "./add"

describe(add, () => {
  test('one plus two', () => {
    expect(add(1, 2)).toBe(3)
  })
})
```

<!-- TODO: morph the code into jsdom vue-->

<!-- ```ts 
// [hello.test.ts]
import { test, expect, describe } from "vitest"
import Hello from './Hello.vue'

test('Hello component', () => {
  expect(add(1, 2)).toBe(3)
})
``` -->

<!-- TODO: morph the code into browser mode vue -->

<!-- ```ts 
// [hello.test.ts]
import { test, expect, describe } from "vitest"
import Hello from './Hello.vue'

test('Hello component', () => {
  expect(add(1, 2)).toBe(3)
})
``` -->

<!-- 

I would say Vitest is useful its own even if not on Vite projects.
But, obviously for Vite projects, 

The talk will about general test framework feature implementation.
Vite and Vitest unique feature is expalined as it comes up.

 -->

---

# Talk Overview

<!-- 
TODO: Reverse? package -> features? e.g.
@vitest/expect, @vitest/snapshot -> assertion API (`expect`, `toEqual`, `toMatchSnapshot`)
@vitest/runner -> managing test case hierarchy and execution (`describe`, `test`, timeout, retry)
vitest, tinypool, birpc -> test orchestration, reporter, etc.
vite, vite/module-runner -> Javascript runtime with custom transform
@vitest/mocker -> Module mocking `vi.mock("", () => {})`
@vitest/coverage-v8, @vitest/coverage-istanbul -> coverage collection and reporting
@vitest/browser

TODO: package dependency as hierarchy? e.g.
vitest -> @vitest/expect, @vitest/snapshot
       -> @vitest/runner
       -> @vitest/pretty-format
       -> vite

TODO: code, server-client, architecture here?

-->


- Lifecycle of running tests
- Explain bits and pieces of Vitest as Test framework
  - Assertion libraries: [`@vitest/expect`](https://github.com/vitest-dev/vitest/tree/main/packages/expect), [`@vitest/snapshot`](https://github.com/vitest-dev/vitest/tree/main/packages/snapshot)
    <!-- TODO: reference on license verbatim from Jasmine, Jest -->
  - Test runner: `@vitest/runner`
  - Javscript Runtime: `vite-node`, `vite/module-runner`
  - Test orchestraion: `vitest`, `vite`, `tinypool`, `birpc`

<!--
We start from reviewing the basic steps and lifecycle of running tests.
We then explain and dig deeper about each step and each component.
Along the way, we see how Vitest utilizes Vite as a foundation of certain components.
And also we'll see large parts of Vitest are not actually tied to Vite, but general test framework implementation.
Even if you are not Vitest users but Jest, Playwright, etc. users, I believe you'll be benefit
from understanding the overall test framework internals.
-->

<!-- ---

# Why Testing?

TODO: probably can skip assuming it's obvious. -->

---
layout: two-cols
layoutClass: gap-8
---

# Lifecycle of running tests

<!--
TODO: cli, config, sample test, output.
TODO: layout, ascii snippet.
-->

```ts 
// [add.test.ts]
import { test, expect, describe } from "vitest"
import { add } from "./add"

describe(add, () => {
  test('one plus two', () => {
    expect(add(1, 2)).toBe(3)
  })
})
```

::right::

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

# Lifecycle of running tests

<!-- TODO: clicks, highlight -->
<!-- TODO: map each step with reporter duration -->
<!-- TODO: map each step with incremental reporter output -->
<!-- TODO: this is kinda "visible" part. it doesn't include worker etc. -->

- Select test files to run (CLI arguments, Configuration, etc.)
  - `vitest src/add.test.ts src/dir/ --project=unit --shard=1/3`
  - `defineConfig({ test: { dir: ..., include: ..., exclude: ... }, projects: [...] })`
- Run test files to collect Test cases
  - `test("foo", () => { ... })` 
    <!-- (TODO: highlight which part is executed. it's not "...") -->
  - `describe("foo", () => { ... })`
  <!-- At this point, we obtain the tree / forest structure of all suites, hooks, test cases. cf. verbose reporter tree output -->
  <!-- Some tests maybe be skipped via `test.only`,`test.skip`, `vitest -t`, so we resolve skip states here. -->
- Running Test cases
  - `test("foo", () => { ... })` ("..." is the part actually executed)
  - verify assertions e.g. `expect(...).toEqual(...)`
- Reporting (incremental and final summary)
  - Error reporting (error diff formatting, stacktrace with code frame, github actions annotation, ...)
  - Console log aggregation
  - Coverage reporting

---

# Client-Server architecture and test runtime

TODO: diagram

- right: ViteDevServer, Test orchestraion pool, reporting
- left: browsers, child process forks, worker threads. `import("./add.test.ts")`
- left-to-right: `fetchModule` (module-runner), http request (browser)
- right-to-left: transpiled js (vite plugin pipeline)
- left-to-right: test result to reporter

---

# Test framework features

TODO: back to "Talk Overview" slide? what to elaborate here?
TODO: Should we change the order "top to bottom"? (i.e. from orchestration to individual assertions)

- Assertions
- Test runner
- Tets runtime
- Test orchestration

---

# `expect` API (`@vitest/expect`)

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

- Test framework agnostic logic lives in `@vitest/snapshot` package
  <!-- Used by webdriverio, rstest -->
  - `SnapshotClient.setup/assert/finish` (lower level API for snapshot assertion and state management)
  <!-- e.g. finding where to update inline snapshot by parsing stacktrace with a hand coded regex -->
  - `SnapshotEnvironment.readSnapshotFile/saveSnapshotFile` (interface to decouple runtime)
  <!-- for example, this is implemented as RPC which works across Node.js and Browser -->
- Some logic is coupled to Vitest system
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

<!-- TODO: sample snapshot inline / file -->

---

# Test runner

TODO

- `interface VitestRunner` abstracts ...
- `class VitestTestRunner implements VitestRunner` (Node.js)
- `class BrowserVitestRunner implements VitestRunner` (Browser mode)

---

# Test runner (Node.js)

TODO: based on `vite/module-runner`

---

# Test runner (Browser mode)

TODO: Vite SPA analogy

---

# Mocking

TODO

---

# Test orchestration

- Workspace support
- Sharding
- Scheduling test file execution (`tinypool`)
  - Isolation (`child_process`, `worker_threads`, `iframe`)
  - Parallelization to utilize multiple CPUs
- Reporter
  - built-in reporters
  - custom reporter API
- Watch mode
  - efficient test-rerun by the same mechanism of Vite HMR
    - file watcher
    - module graph API
    - re-transform only changed files

---

# What is isolation?

- `child_process` vs `worker_threads` trade-offs
  - stability
  - startup performance

---

# Test scheduling

TODO

- start fresh worker depending on isolation level

---

# Client-Server Communication

TODO: birpc (runtime agnostic)

- child_process: IPC
- worker_threads: MessageChannel
- browser mode -> Websocket, BroadcastChannel

--- 

# Reporter API

TODO

--- 

# Coverage

TODO

--- 

# Watch mode

TODO

---

# Summary

TODO: Back to initial lifecycles story?

---

# Thank you!

TODO
