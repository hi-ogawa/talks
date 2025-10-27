## meta plan

- find useful talks
  - general good talks
  - deep dive style
  - vite, vitest specific talks
- draft in english
- prepare visuals
- (translate to japanese) (maybe slides can be english, but talk in Japanese)
- measure talk time
- iterate

## Draft

- (intro)
  - about me
  - about vite
  - about vitest
- (vitest background story)
  - reference documentary?
  - jest
- test framework overview
  - lifecycle
    - input (test files, configuration)
    - test collection
      - find files
      - execute top level code
    - test execution
      - execute actual functions
    - reporting (incremental, final)
    - (cf. performance)
  - if you think about this flow, there's no appearance of Vite in particular.
    i.e. basic test framework can be considered "bundler" (vite) agnostic.
    even works for non vite users (zero config.)
  - (then emphasis on Vite.)
    - good default of Vite (builtin typescript support, esm support)
    - plugin system
    - watch mode
- features overview
  - assertion
  - runtime
  - framework
- vite specific techniques
- performance tips
  - https://vitest.dev/guide/improving-performance.html
- (ecosystem features)
- (comparison to other test frameworks)
- (vscode extension)
- examples from https://github.com/vitest-dev/vitest-ecosystem-ci/

### assertion feature

- pure assertion
  - `expect`, `assert`
- assertion integrated with test runtime
  - snapshot
  - `expect.soft`
- error message
  - diffing
  - stack trace

### runner feature

- coverage
- mocking
- timeout, retry
- fixture
- error stack trace
- console logging interception

### framework feature

- orchestration
  - parallelization
  - isolation
  - worker pooling
  - rpc
- workspace support
- reporter
- watch mode
- coverage
- mocking
- (benchmark)
- (typecheck mode)

#### Isolation types

- folks
  - https://nodejs.org/docs/v22.20.0/api/child_process.html#child_processforkmodulepath-args-options
- threads
  - https://nodejs.org/docs/v22.20.0/api/worker_threads.html#worker_threadsworkerfilename-options
- vm modules
  - https://nodejs.org/docs/v22.20.0/api/vm.html#vmworkerthreads

### vite specific techniques

- configuration
  - resuing vite.config.ts
- transform pipeline
- module graph
- module runner
- browser mode

### Comparison

- Jasmine, Mocha, Jest
- Deno, Bun
- Node `node:test`

### Notes

- VITE_NODE_DEBUG_DUMP
- DEBUG=vite-node

### Notable PRs

- vite-node as module runner on Vite
- migrate from vite-node to module runner on Vitest 
