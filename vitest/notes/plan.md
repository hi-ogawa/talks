## meta plan

- find useful talks
  - general good talks
  - deep dive style
  - vite, vitest specific talks
- draft in english
- prepare visuals
- translate to japanese
- measure talk time
- iterate

## timeline (30 min)

- intro
  - about me
  - about vite
  - about vitest
- features overview
  - assertion
  - runtime
  - framework
- vite related techniques
- ecosystem features
- comparison to other test frameworks

### assertion feature

- pure assertion
  - `expect`, `assert`
- assertion integrated with test runtime
  - snapshot
  - `expect.soft`
- error message
  - diffing
  - stack trace

### runtime feature

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
- reporter
- watch mode
- (benchmark)
- (typecheck mode)

### vite specific techniques

- configuration
  - resuing vite.config.ts
- transform pipeline
- module graph
- module runner
- browser mode
