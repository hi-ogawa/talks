---
# theme: default
# # background: https://source.unsplash.com/collection/94734566/1920x1080
# class: text-center
# highlighter: shiki
# lineNumbers: false
# info: |
#   ## Inside Vitest: Test Framework Architecture Deep Dive
  
#   This talk explores what makes Vitest architecturally unique, including how it leverages Vite's broad framework ecosystem and plugin capabilities, its runtime agnostic architecture that enables running the same tests across Node.js, browsers, and edge environments, and the implementation of core testing features like mocking, coverage, and parallel execution systems.
  
#   Vue Fes Japan 2025
# drawings:
#   persist: false
# transition: slide-left
# title: Inside Vitest - Test Framework Architecture Deep Dive
# mdc: true

# highlighter: shiki
# css: unocss
# colorSchema: dark
# transition: fade-out
# mdc: true
# layout: center
# glowSeed: 4
# lang: en
# title: Inside Vitest - Test Framework Architecture Deep Dive

# theme: seriph
theme: default
# colorSchema: light
# colorSchema: dark
favicon: /favicon.ico
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# background: https://cover.sli.dev
# background: /cover.png
# backgroundSize: cover
# some information about your slides (markdown enabled)
title: Inside Vitest - Test Framework Architecture Deep Dive
class: text-center
# https://sli.dev/features/drawing
# drawings:
#   persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/features/mdc
# mdc: true
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
  - `vitest src/add.test.ts src/dir/ --project xxx`
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
  - Error reporting (Error diff formatting, stacktrace with code frame, github annotation, ...)
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

- `class VitestTestRunner implements VitestRunner`

---

# Assertion Features

<v-clicks>

## Pure Assertion
- Expect API compatible with Jest/Chai
- Rich matchers and custom matchers

```ts
import { expect, test } from 'vitest'

test('assertion examples', () => {
  expect(2 + 2).toBe(4)
  expect({ name: 'Vitest' }).toEqual({ name: 'Vitest' })
  expect([1, 2, 3]).toContain(2)
  expect(() => { throw new Error('fail') }).toThrow('fail')
})
```

## Integrated with Test Runtime
- Automatic test isolation
- Built-in snapshot testing

## Diffing Errors
- Beautiful error diffs
- Source code context in errors

</v-clicks>

---

# Runtime Features

<v-clicks>

- 📊 **Coverage** - Built-in coverage with c8/istanbul
- 🎭 **Mocking** - Module mocking and spies

```ts
import { vi, test, expect } from 'vitest'

// Mock modules
vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ name: 'Test User' }))
}))

// Spy on functions
const mockFn = vi.fn()
mockFn('hello')
expect(mockFn).toHaveBeenCalledWith('hello')
```

- ⏱️ **Timeout & Retry** - Configurable timeouts and retries
- 🔧 **Fixture** - Setup and teardown helpers
- 📍 **Error Stack Trace** - Clean and helpful stack traces
- 📝 **Console Logging Interception** - Capture console output

</v-clicks>

---

# Framework Features

<v-clicks>

## Orchestration
- **Parallelization** - Run tests in parallel for speed
- **Isolation** - Each test file runs in isolation

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads', // or 'forks' for better isolation
    poolOptions: {
      threads: { singleThread: false },
      forks: { singleFork: false }
    }
  }
})
```

## Reporter
- Multiple built-in reporters
- Custom reporter support

## Watch Mode
- Intelligent file watching
- Re-run only affected tests

</v-clicks>

---

# Additional Framework Features

<v-clicks>

- 🏃 **Benchmark Mode** - Performance testing
- 📝 **Typecheck Mode** - Type-level testing with tsd

</v-clicks>

---
layout: center
class: text-center
---

# Vite-Specific Techniques

How Vitest leverages Vite's power

---

# Transform Pipeline

<v-clicks>

- Reuses Vite's transform pipeline
- All Vite plugins work with Vitest
- TypeScript, JSX, Vue, Svelte - all supported out of the box
- Custom transformations via plugins

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()], // Vite plugins work seamlessly
  test: {
    environment: 'jsdom'
  }
})
```

</v-clicks>

---

# Module Graph

<v-clicks>

- Vite maintains a module dependency graph
- Enables intelligent test re-running
- Only re-run tests affected by changes
- Powers watch mode efficiency

</v-clicks>

---

# Module Runner

<v-clicks>

- Vite Module Runner → Vitest Node Runtime
- Direct evolution from vite-node
- Executes modules in Node.js with Vite transforms
- Recent collaboration between Vite and Vitest teams
- See: https://github.com/vitejs/vite/pull/20916

</v-clicks>

---

# Browser Mode

<v-clicks>

- Vite Client → Browser Mode
- Run tests directly in real browsers
- Test browser-specific APIs
- Integration with Playwright, WebdriverIO
- True environment fidelity

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright'
    }
  }
})
```

</v-clicks>

---
layout: center
class: text-center
---

# Why Isolation?

Understanding the architecture decision

---

# Benefits of Isolation

<v-clicks>

## Unlocks Key Features
- **Runtime Logs** - Capture console output per test
- **Parallelization** - Safe concurrent execution
- **Clean State** - No cross-test pollution

## Stability
- Worker vs Fork trade-offs
- Predictable test behavior
- Better error handling

</v-clicks>

---
layout: center
class: text-center
---

# Ecosystem Features

Beyond core testing

---

# Framework Integrations

<v-clicks>

- 🖼️ **Vue** - @vue/test-utils integration
- ⚛️ **React** - React Testing Library support
- 📊 **Svelte** - Svelte Testing Library
- 🎨 **Solid** - Solid Testing Library
- And more...

</v-clicks>

---

# Environment Integrations

<v-clicks>

- 🌐 **Browser Mode** - Playwright, WebdriverIO, Puppeteer
- ☁️ **Cloudflare Workers** - Edge runtime testing
- 📚 **Storybook** - Component testing integration
- 🔧 **Custom Environments** - Extensible environment API

</v-clicks>

---
layout: center
class: text-center
---

# Comparison to Other Frameworks

How Vitest fits in the ecosystem

---

# Vitest vs Jest

<v-clicks>

## Advantages
- ⚡️ Faster (Vite's speed)
- 🔋 Native ESM support
- 🔌 Vite plugin ecosystem
- 🌐 Multiple runtime targets

## Compatibility
- Jest-compatible API
- Easy migration path

</v-clicks>

---

# Vitest vs Mocha

<v-clicks>

## More Features Out of the Box
- Built-in assertion library
- Mocking capabilities
- Coverage integration
- Modern defaults

## Similar Philosophy
- Flexible and extensible
- Plugin-based architecture

</v-clicks>

---

# Runtime Built-ins

<v-clicks>

## Node.js
- `node:test` - Native test runner

## Deno
- Built-in test runner

## Bun
- `bun test` - Fast native testing

**Vitest complements these with:**
- Framework integration
- Vite plugin ecosystem
- Cross-runtime compatibility

</v-clicks>

---
layout: center
class: text-center
---

# Architecture Deep Dive

Core Components

---

# Core Components

<v-clicks>

1. **Vite Runtime & Plugin Mechanism**
   - Vite Module Runner → Vitest Node Runtime
   - Vite Client → Browser Mode

2. **Test Runner / Assertion** (Runtime Side)
   - Test execution engine
   - Assertion library

3. **Test Orchestration** (Server Side)
   - File discovery and scheduling
   - Worker pool management

4. **Reporter**
   - Output formatting
   - Results aggregation

</v-clicks>

---
layout: center
class: text-center
---

# Best Practices & Optimization

What you can learn from understanding internals

---

# Performance Tips

<v-clicks>

- ⚡️ Use `--pool=threads` or `--pool=forks` based on needs
- 📊 Leverage watch mode for fast iteration
- 🎯 Write focused, isolated tests
- 🔧 Configure coverage strategically
- 📦 Use Vite plugins for transformations

</v-clicks>

---

# Testing Patterns

<v-clicks>

- 🧪 Prefer unit tests for speed
- 🌐 Use browser mode when testing DOM APIs
- 🎭 Mock external dependencies
- 📸 Use snapshots judiciously
- 🔁 Write deterministic tests

</v-clicks>

---
layout: center
class: text-center
---

# Key Takeaways

---

# Summary

<v-clicks>

1. **Vitest leverages Vite's ecosystem** - plugins, transforms, module graph
2. **Runtime agnostic architecture** - Node, Browser, Edge
3. **Isolation enables powerful features** - parallelization, logging, stability
4. **Modern testing experience** - fast, feature-rich, compatible
5. **Understand internals → Better tests** - performance, patterns, optimization

</v-clicks>

---
layout: center
class: text-center
---

# Thank You! 🙏

## Questions?

<div class="pt-12">

**Resources:**
- https://vitest.dev
- https://vitejs.dev
- https://vuefes.jp/2025

</div>

---
layout: center
class: text-center
---

# References

---

# Reference Talks

<v-clicks>

### Ryan Carniato
**"Reactivity: There and Back Again"** - ViteConf 2022

### Jake Archibald
**"In The Loop"** - JSConf.Asia 2018

### Rich Harris
**"Rethinking Reactivity"** - You Gotta Love Frontend 2019

### Christoph Nakazawa
**"Jest Architecture"** - ReactiveConf 2018

</v-clicks>

---
layout: end
class: text-center
---

# 🎉 End
