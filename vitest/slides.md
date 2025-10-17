---
theme: default
background: https://source.unsplash.com/collection/94734566/1920x1080
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## Inside Vitest: Test Framework Architecture Deep Dive
  
  This talk explores what makes Vitest architecturally unique, including how it leverages Vite's broad framework ecosystem and plugin capabilities, its runtime agnostic architecture that enables running the same tests across Node.js, browsers, and edge environments, and the implementation of core testing features like mocking, coverage, and parallel execution systems.
  
  Vue Fes Japan 2025
drawings:
  persist: false
transition: slide-left
title: Inside Vitest - Test Framework Architecture Deep Dive
mdc: true
---

# Inside Vitest
## Test Framework Architecture Deep Dive

Vue Fes Japan 2025

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

---
layout: two-cols
---

# About Me

<div class="pr-4">

- Software Engineer
- Contributing to Vite and Vitest ecosystems
- Passionate about testing and developer tools

</div>

::right::

# Talk Overview

<div class="pl-4">

- Vitest Architecture
- Vite Integration
- Runtime Features
- Ecosystem & Comparisons

</div>

---

# What is Vitest?

<v-clicks>

- ⚡️ **Fast** - Powered by Vite
- 🧪 **Modern** - Native ESM, TypeScript support
- 🔧 **Compatible** - Jest-compatible API
- 🌐 **Universal** - Node, Browser, Edge runtime support
- 🔌 **Extensible** - Vite plugin ecosystem

```ts
// sum.test.ts
import { describe, it, expect } from 'vitest'
import { sum } from './sum'

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })
})
```

</v-clicks>

---

# What is Vite?

<v-clicks>

- 🚀 **Next Generation Frontend Tooling**
- ⚡️ Instant Server Start with native ESM
- 🔥 Lightning Fast HMR (Hot Module Replacement)
- 🔌 Rich Plugin Interface
- 📦 Optimized Production Builds with Rollup
- 🌍 Framework Agnostic - React, Vue, Svelte, etc.

</v-clicks>

---
layout: center
class: text-center
---

# Features Overview

Three Core Categories

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
