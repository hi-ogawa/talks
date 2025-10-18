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
colorSchema: dark
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# background: https://cover.sli.dev
# background: ./assets/cover.png
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

TODO: video or image of example test run, vite or vue?

---

# About Me

TODO: github avatar, voidzero logo

- <a href="https://github.com/hi-ogawa" target="_blank">@hi-ogawa <ri-github-fill /></a>
- Developer at [VoidZero](https://voidzero.dev/)
- Vite and Vitest core team member
- [`@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-rsc/README.md)

---

# Talk Overview

TODO

- Test Framework architecture
  - Assertion feature
  - Test runtime feature
  - ...
- Vite techniques
<!-- - Runtime Features -->
<!-- - Ecosystem & Comparisons -->

---

# Why Testing?

TODO: skip assuming obvious?

---

# Lifecycle of running tests

<!--
TODO: cli, config, sample test, output.
TODO: layout, ascii snippet.
-->

<Transform :scale="0.95" origin="center">

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

```sh
$ vitest
 DEV  v4.0.0-beta.18 /home/hiroshi/code/personal/talks/2025-10-25/examples/basic

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

</Transform>

---

# Lifecycle of running tests (2)

<!-- TODO: clicks, highlight -->
<!-- TODO: map each step with incremental reporter output -->
<!-- TODO: this is kinda "visible" part. it doesn't include worker etc. -->

- Select test files to run (CLI arguments, Configuration, etc.)
  - `vitest src/.test.ts src/another-dir/ --project xxx`
  - `defineConfig({ test: { dir: ..., include: ..., exclude: ... } })`
- Run test files to collect Test cases / hooks
  - `test("foo", () => { ... })` 
    <!-- (TODO: highlight which part is executed. it's not "...") -->
  - `beforeAll(() => { ... })`
  - `describe("foo", () => { ... })`
  <!-- At this point, we know the tree structure of all suites, hooks, test cases -->
- Running Test cases / hooks
  - `beforeAll(() => { ... })`
  - `test("foo", () => { ... })` ("..." is the part actually executed)
  - verify `expect(...)`
- Reporting (incremental and final summary)

<!-- ---

# What is Vitest?

- ⚡️ **Fast** - Powered by Vite
- 🧪 **Modern** - Native ESM, TypeScript support
- 🔧 **Compatible** - Jest-compatible API
- 🌐 **Universal** - Node, Browser, Edge runtime support
- 🔌 **Extensible** - Vite plugin ecosystem -->

<!-- 
Default feature set is essentially same like Vite.
- ESM
- Typescript

And like you do in your Vite app, it can be extended via Vite plugins.
- React
- Vue
- Svelte
- etc...
-->

<!-- ---

# What is Vite?

<v-clicks>

- 🚀 **Next Generation Frontend Tooling**
- ⚡️ Instant Server Start with native ESM
- 🔥 Lightning Fast HMR (Hot Module Replacement)
- 🔌 Rich Plugin Interface
- 📦 Optimized Production Builds with Rollup
- 🌍 Framework Agnostic - React, Vue, Svelte, etc.

</v-clicks> -->

---

# Features Overview

Three Core Categories

- Assertion features
- Test runtime features
- Test framework features

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
