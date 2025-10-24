# Talk Script - Inside Vitest Architecture Deep Dive

**Total Duration: 33 minutes (with Q&A)**
**Total Slides: 45 slides**

## Slide Structure
- Introduction: Slides 1-6 (Title, About, What is Vitest x3, Vitest 4)
- Overview: Slides 7-9 (Overview, Packages, Example)
- Test Lifecycle: Slides 10-32 (with 4 marker slides)
  - Orchestration: Slides 10-17 (marker + 7 slides)
  - Collection: Slides 18-21 (marker + 3 slides)
  - Execution: Slides 22-26 (marker + 4 slides)
  - Reporting: Slides 27-32 (marker + 5 slides)
- Vite Integration: Slides 33-44 (Where is Vite + 11 slides including coverage)
- Wrap-up: Slide 45 (Key Takeaways)

---

## Introduction (4 minutes) - 0:00-4:00

### Slide 1: Title
*0:00-0:30*

"Hello everyone! Today we're diving deep into Vitest's architecture - understanding how it works internally and what makes it a powerful modern test framework."

**[Pause, click to next slide]**

---

### Slide 2: About Me
*0:30-1:30*

"Quick introduction - I'm Hiroshi Ogawa, part of the Vite and Vitest core teams, and I work at VoidZero as an open source developer. I'm passionate about SSR meta-frameworks and have been contributing to the Vite ecosystem, including work on Vite RSC support."

**[Point to avatar on right]**

---

### Slides 3-5: What is Vitest?
*1:30-3:30*

**[Slide 3 - Basic Example]**

"For those new to Vitest - here's what a typical test looks like. It's a testing framework with familiar APIs like describe, test, and expect. On the right you can see the output when you run the vitest command."

**[Click through code highlights]**

**[Slide 4 - Features]**

"Key features include: Jest-compatible API and feature set, ESM and TypeScript support out of the box, extensibility via Vite plugins for React, Vue, Svelte, and importantly - runtime agnostic design supporting Node.js, Browser Mode, and even Cloudflare Workers. It also provides advanced programmatic APIs that enable powerful customizations across the ecosystem."

**[Slide 5 - Browser Mode]**

"Here's Browser Mode - the same test code now running in a real browser environment with Playwright, providing genuine browser runtime instead of jsdom simulation."

---

### Slide 6: Vitest 4 Release
*3:30-4:00*

"Great timing - Vitest 4 was just released on October 23rd! It includes stable browser mode with visual regression testing and tracing, plus a complete pool system rewrite. Check out the announcement blog and Vladimir's ViteConf talk for details."

---

## Overview & Setup (3 minutes) - 4:00-7:00

### Slide 7: Overview
*4:00-5:00*

"This talk follows the **test lifecycle** to explore Vitest's architecture: orchestration, collection, execution, and reporting."

**[Pause]**

"Along the way, we'll explore which parts are general test framework implementation, how Vite powers the test runtime with ModuleRunner and Browser mode, and how each package divides responsibilities - vitest, @vitest/runner, @vitest/browser, @vitest/expect, and others."

---

### Slide 8: Vitest Monorepo Packages Dependencies
*5:00-6:00*

"Here's the dependency graph of Vitest's monorepo packages. The main vitest package handles CLI entry, test orchestration, and reporters. @vitest/runner manages describe/suite and test execution. @vitest/expect, snapshot, and spy are standalone libraries that can even be used independently."

**[Point to diagram]**

---

### Slide 9: Test Lifecycle - Example
*6:00-7:00*

"Let's start with a concrete example - two test files: add.test.ts with nested describe and tests, and mul.test.ts with a single test. Watch what happens when we run vitest."

**[Show output on right side]**

"We'll break down each step of this process."

---

### Slide 10: Test Lifecycle - Orchestration Marker
*7:00-7:15*

"Now let's dive into the first phase: Orchestration."

**[Simple marker slide showing progress through lifecycle]**

---

## Test Lifecycle - Orchestration (6 minutes) - 7:15-13:15

### Slide 11: Test Orchestration Overview
*7:15-8:15*

"The first phase is orchestration - finding test files to run."

**[Click through configuration and CLI examples]**

"Vitest uses configuration with include/exclude patterns and projects. CLI arguments can override these - you can pass glob patterns, filter projects, or even shard tests across multiple machines for CI parallelization."

**[Show final output showing pool.runTests]**

---

### Slides 12-14: Pool Architectures
*8:15-11:15*

**[Slide 12 - Forks]**

"Once test files are identified, we need to orchestrate their execution. By default, Vitest uses `pool: 'forks'` - spawning isolated child processes using Node's child_process.fork. Each process handles multiple test files but provides strong isolation. This allows CPU-based parallelization."

**[Point to diagram showing main process and worker processes]**

**[Slide 13 - Threads]**

"Alternative is `pool: 'threads'` using worker threads - more lightweight than child processes, but with some limitations around native modules and process.chdir. Check the Common Errors documentation for compatibility notes."

**[Slide 14 - Browser Mode]**

"Browser mode takes a different approach - using Playwright or WebdriverIO to launch real browser contexts and run tests there via WebSocket communication."

---

### Slide 15: No Isolation Mode
*11:15-12:15*

"You can also opt out of isolation with `isolate: false`. This reuses the same process/worker for multiple test files, saving spawn time and reusing the module graph. However, test execution order can affect results, so there's a tradeoff between speed and determinism."

---

### Slides 16-17: About Isolation
*12:15-13:15*

**[Slide 16 - Explanation]**

"Let me clarify the tradeoffs. Forks is the default because it's most stable and closest to production. The isolate: false mode can be faster since you reuse processes and modules, but test files can affect each other. Tests still run isolated from the main process though. See the 'Improving Performance' docs for guidance."

**[Slide 17 - Example]**

"Here's a concrete example showing the difference. With isolation, shared.ts is evaluated twice - once per test file. Without isolation, it's evaluated once and reused, but notice the tests run sequentially instead of in parallel."

---

### Slide 18: Test Lifecycle - Collection Marker
*13:15-13:30*

"Now we move to the collection phase."

**[Simple marker slide showing progress through lifecycle]**

---

## Test Lifecycle - Collection (4 minutes) - 13:30-17:30

### Slide 19: Collection Phase
*13:30-14:30*

"Now we move to collection. The main process only knows about test files. To discover test cases, we execute the test files."

**[Show vitest list --json output]**

"Running `vitest list` shows the discovered test cases with their names and file paths."

---

### Slide 20: Creating Task Tree
*14:30-16:30*

"As we execute the test file, we build a Task tree. @vitest/runner provides the types: Task can be File, Suite, or Test."

**[Click through synchronized animations]**

"As describe() is called, we create a Suite. Each test() call creates a Test with the function to execute. Initially all results are undefined."

**[Click to final point]**

"This collection phase often takes significant time since all top-level import statements execute and the entire module graph gets evaluated. See 'collect 46ms' in the duration."

---

### Slide 21: Filtering Tasks
*16:30-17:30*

"After collection, filtering happens on the test runner side with describe.skip/only, test.skip/only, or -t flag. Important note: since filtering happens after collection, test file execution can't be skipped. And since each file runs independently, .only in one file doesn't affect other files."

**[Show examples]**

---

### Slide 22: Test Lifecycle - Execution Marker
*17:30-17:45*

"Now let's move to execution."

**[Simple marker slide showing progress through lifecycle]**

---

## Test Lifecycle - Execution (4 minutes) - 17:45-21:45

### Slide 23: Executing Tests
*17:45-19:15*

"Finally we execute each Test function and record results."

**[Click through magic-move animations showing execution]**

"We execute the first test function, record the result as 'passed'. Then the second test, which fails with an error and diff. Notice 'tests 3ms' in the duration - for simple tests, execution is much faster than collection."

---

### Slide 24: Test API
*19:15-20:15*

"@vitest/runner provides comprehensive APIs to control test execution: beforeAll/afterEach hooks, describe.concurrent for parallel execution, retry and timeout options, and test.for for parameterized tests."

**[Show both code and Task tree representation]**

"All of this gets captured in the Task tree structure with hooks arrays and configuration."

---

### Slide 25: expect API
*20:15-21:15*

"The expect API is implemented in @vitest/expect as a Chai plugin system, providing Jest-compatible matchers like toEqual alongside Chai's API. It's usable as a standalone library."

**[Show error formatting example]**

"Error formatting happens via post-processing on the test runner - raw assertion errors get transformed into nice diffs using @vitest/pretty-format."

---

### Slide 26: Test Runner Aware Assertions
*21:15-21:45*

"Some APIs are coupled to Vitest's test runner. For example, expect.soft accumulates multiple assertion errors instead of stopping at the first failure - both errors surface at the end of the test."

---

### Slide 27: Test Lifecycle - Reporting Marker
*21:45-22:00*

"Finally, let's look at reporting."

**[Simple marker slide showing progress through lifecycle]**

---

## Test Lifecycle - Reporting (3 minutes) - 22:00-25:00

### Slide 28: Reporting Architecture
*22:00-23:00*

"Now for reporting - how does the main process know what's happening in test runners? Through events: onCollected sends the Task tree, onTaskUpdate sends test results incrementally in batches, and onConsoleLog sends captured console output."

**[Point to diagram]**

---

### Slide 29: Runtime Communication
*23:00-23:45*

"This communication uses birpc - a protocol-agnostic typed two-way RPC library. For child processes it uses process.send, for worker threads it uses parentPort.postMessage, and for browser mode it uses WebSocket. This bidirectional communication also enables sending events from main to test runner, like gracefully aborting on Control+C."

---

### Slides 30-32: Reporter API & Examples
*23:45-25:00*

**[Slide 30 - API]**

"Vitest provides a Reporter API with normalized TestModule structure instead of raw Task trees. You can extend BaseReporter to customize how results are displayed."

**[Slide 31 - Default Reporter]**

"Here's the default reporter output we've been seeing."

**[Slide 32 - GitHub Actions Reporter]**

"And here's the GitHub Actions reporter integrating with CI annotations."

---

## Vite Integration (8 minutes) - 25:00-33:00

### Slide 33: Where is Vite?
*25:00-25:30*

"We've followed the entire test lifecycle - but where does Vite come in?"

**[Click to reveal]**

"Look at the duration breakdown - 'transform 33ms'. That's Vite."

---

### Slide 34: Test Runner and Vite Environment API
*25:30-26:15*

"Here's the client-server architecture. Node tests work like Vite SSR applications - the test runner is the client requesting module transformations from the Vite dev server. Browser mode works like Vite client applications with the browser as the client."

---

### Slide 35: SSR / Client Environment Example
*26:15-27:00*

"Concrete example: Vue SFC transform. The same Vue component gets different transformations - client environment produces render functions for the browser, SSR environment produces server-side render functions. Vite handles this through its environment API."

---

### Slide 36: vite-node → Vite Environment API
*27:00-27:30*

"Historically this used vite-node - ViteNodeRunner on test runner side, ViteNodeServer on main process. Vitest 4 migrated to Vite's official environment API, a great collaboration between the teams."

---

### Slide 37: Test Runner Interface
*27:30-28:00*

"@vitest/runner defines the VitestRunner interface with importFile and lifecycle callbacks. Vite module runner implements this for Node using ModuleRunner. Browser mode implements it with native browser import."

---

### Slide 38: Vite Module Runner
*28:00-28:45*

"Module runner transforms import/export into runtime functions - __vite_ssr_import__, __vite_ssr_exportName__, etc. You can see this yourself by running VITE_NODE_DEBUG_DUMP=true vitest or VITEST_DEBUG_DUMP for Vitest 4."

**[Show transformation example]**

---

### Slides 39-40: Module Mocking
*28:45-29:30*

**[Slide 39 - Basics]**

"Module mocking in @vitest/mocker: auto-mocking with vi.mock('./add.js') deeply replaces exports with spies. Manual mocking with a factory function provides custom implementation."

**[Slide 40 - Implementation]**

"Vitest transforms vi.mock calls to the top before imports, so mocking state is registered first. Then __vite_ssr_dynamic_import__ is intercepted by Vitest to implement the mocking."

---

### Slides 41-44: Coverage
*29:30-32:00*

**[Slide 41 - Example]**

"As another example of how Vitest features are powered by Vite, let's look at coverage. Here's a simple test and the coverage report it generates."

**[Show test and coverage image]**

**[Slide 42 - Overview]**

"Vitest offers two official coverage providers: v8 using V8 engine's built-in tracking, and istanbul using custom transforms to inject coverage counters. Both use Istanbul ecosystem tooling for aggregation and reporting. Check out Ari Perkkiö's ViteConf talk for getting started with coverage."

**[Show configuration examples]**

**[Slide 43 - Istanbul Implementation]**

"Istanbul works by transforming code to inject coverage counters. Every function call and branch is tracked. Pro: works on any JavaScript runtime. Con: transform overhead affects test execution speed."

**[Click through highlights showing the transform]**

**[Slide 44 - V8 Implementation]**

"V8 provider uses runtime-native coverage data with no custom transform needed. However, post-processing requires accurate source maps through the entire Vite transform pipeline. The V8 inspector API provides raw coverage data, which is then converted to Istanbul format for reporting."

---

## Wrap-up (1 minute) - 32:00-33:00

### Slide 45: Key Takeaways
*32:00-33:00*

"Let me summarize the key architectural insights:"

"First: Test lifecycle drives the architecture - understanding orchestration, collection, execution, and reporting is fundamental to test framework design."

"Second: Client-server architecture enables runtime-agnostic execution across Node.js, browsers, and other environments through the test runner communicating with the main process."

"Third: Vite as foundation - the test runtime leverages the same transform pipeline and module runner as Vite's client and SSR applications."

**[Pause]**

"Thank you for your attention! I'm happy to take questions."

---

## Speaker Notes

### Pacing Guidelines
- **Total: 33 minutes** with Q&A at the end
- Speak clearly and deliberately, not too fast
- Allow animations to complete before continuing
- Watch audience engagement - adjust depth as needed
- Keep introduction tight (4 min)
- Core content is orchestration through reporting (21 min total)
  - Orchestration (6 min)
  - Collection (4 min)
  - Execution (4 min)
  - Reporting (3 min)
  - Includes 4 marker slides (15 sec each)
- Vite integration (8 min including coverage)
- Wrap-up (1 min)
- Remaining time for Q&A

### Time Markers (Check Points)
- 4 min: Should be finishing Overview
- 7 min: Should be at Test Orchestration Overview (slide 11)
- 13 min: Should be around About Isolation slides (slides 16-17)
- 17:30 min: Should be at Filtering Tasks or Execution marker (slides 21-22)
- 22 min: Should be starting Reporting (slide 28)
- 25 min: Should be at "Where is Vite?" (slide 33)
- 29:30 min: Should be starting Coverage (slide 41)
- 32 min: Should be at Key Takeaways (slide 45)
- 33 min: Open for questions

### Flexibility
- **If running short**: Expand on coverage examples, dive deeper into Task tree structure, explain birpc in more detail, elaborate on module mocking details
- **If running long**: Compress isolation examples, move faster through reporter examples, compress coverage section (show overview but skip Istanbul/V8 details)
- **Technical difficulties**: Have static slides ready, skip animations, use prepared examples
- **Coverage section is flexible**: Can be expanded (2.5 min) or compressed (1 min) depending on time

### Engagement
- Make eye contact with audience
- Use hand gestures to emphasize architecture concepts (client-server, lifecycle flow)
- Show enthusiasm about Vite/Vitest collaboration and Vitest 4 release
- Balance technical depth with accessibility
- Point to specific parts of diagrams and code

### Technical Level
- Assume basic testing knowledge (describe, test, expect)
- Don't assume deep Vite knowledge - explain concepts as you go
- Focus on architecture patterns applicable to other frameworks
- Use concrete examples from actual Vitest codebase
- Explain abbreviations (RPC, SSR, etc.) when first mentioned

### Key Emphasis Points
- Test lifecycle as the organizing principle for understanding the architecture
- Client-server architecture as the key to runtime flexibility
- Separation of concerns: which parts are framework-agnostic vs. Vite-specific
- How understanding this architecture helps write better tests and debug issues
- The collaboration between Vite and Vitest teams (vite-node → environment API)

### Potential Questions to Prepare For
- How does Vitest compare to Jest performance-wise?
- Can I use Vitest without Vite?
- How does watch mode work?
- What about coverage implementation details?
- How do I debug failing tests?
- Best practices for large test suites?
