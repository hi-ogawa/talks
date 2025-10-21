# Talk Script - Inside Vitest Architecture Deep Dive

**Total Duration: 30 minutes**

---

## Introduction (3 minutes) - 0:00-3:00

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

### Slide 3-5: What is Vitest?
*1:30-3:00*

**[Slide 3 - Basic Example]**

"For those new to Vitest - here's what a typical test looks like. It's a unit testing framework with familiar APIs like describe, test, and expect."

**[Click through code highlights]**

**[Slide 4 - Features]**

"Key features: Jest-compatible API, ESM and TypeScript support out of the box, extensible via Vite plugins, and runtime agnostic - running on Node.js, browsers, even Cloudflare Workers."

**[Slide 5 - Browser Mode]**

"Here's the same test running in browser mode - genuine browser runtime instead of jsdom simulation."

---

## Overview & Approach (2 minutes) - 3:00-5:00

### Slide 6: Overview
*3:00-4:00*

"This talk follows the **test lifecycle** to explore Vitest's architecture: orchestration, collection, execution, and reporting."

**[Pause]**

"Along the way, we'll see which parts are general test framework implementation, how Vite powers the runtime, and how the monorepo packages divide responsibilities."

---

### Slide 7: Vitest Monorepo Packages Dependencies
*4:00-5:00*

"Here's the dependency graph of Vitest's monorepo packages. We'll explore these as we follow the test lifecycle."

**[Let diagram settle, don't go into detail]**

---

## Test Lifecycle (12 minutes) - 5:00-17:00

### Slide 8: Test Lifecycle - Example
*5:00-6:00*

"Let's start with a simple example - two test files: add.test.ts and mul.test.ts. Watch what happens when we run vitest."

**[Show output on right side]**

"We'll break down each step of this process."

---

### Slide 9: Finding test files to run
*6:00-7:00*

"First, Vitest needs to find test files - through CLI arguments or configuration. This is mostly globbing."

**[Click through examples]**

---

### Slide 10-13: Test runner orchestration
*7:00-10:00*

**[Slide 10 - Forks]**

"Next is orchestration. By default, Vitest uses `pool: 'forks'` - spawning isolated child processes for test files. This allows CPU-based parallelization."

**[Point to diagram]**

**[Slide 11 - Threads]**

"Alternative is `pool: 'threads'` using worker threads."

**[Slide 12 - Browser Mode]**

"Browser mode uses Playwright or WebdriverIO to orchestrate tests in real browsers."

**[Slide 13 - No Isolate]**

"You can also opt out of isolation with `isolate: false` for faster execution, though with tradeoffs."

---

### Slide 14-15: About isolation and pool
*10:00-11:30*

"Why isolation? `forks` is default for stability. With `isolate: false`, you reuse processes but tests can affect each other. There's always a tradeoff between speed and reliability."

**[Show isolation example diagram]**

"This example shows how shared modules are evaluated once vs multiple times."

---

### Slide 16-17: Collecting tests
*11:30-13:00*

"Once files are assigned to workers, we **collect** test cases by executing the test files."

**[Slide 17 - Creating Task tree]**

"As we execute, we build a Task tree - File contains Suites, which contain Tests."

**[Click through the synchronized animations showing code and tree structure]**

"This collection phase is often the slow part since all top-level imports are evaluated."

---

### Slide 18: Executing Test
*13:00-14:30*

"After collection, we execute each test function and capture results."

**[Click through magic-move animation showing status changes]**

"Test execution is usually much faster than collection for simple tests."

---

### Slide 19-22: Reporting results
*14:30-17:00*

**[Slide 19 - Architecture diagram]**

"Main process gets notified through events: onCollected, onTaskUpdate, onConsoleLog."

**[Slide 20 - Reporter API]**

"Vitest provides a Reporter API with normalized TestModule structure."

**[Slide 21-22 - Examples]**

"Default reporter shows this nice terminal output. GitHub Actions reporter integrates with CI annotations."

---

## Vite Integration (8 minutes) - 17:00-25:00

### Slide 23: Where is Vite?
*17:00-17:30*

"So where does Vite come in? Look at the duration - 'transform 33ms'."

**[Click to reveal]**

"Vite powers the module transformation."

---

### Slide 24: Test runner and Vite environment API
*17:30-18:30*

"This is the client-server architecture. Node tests work like Vite SSR apps. Browser mode works like Vite client apps."

**[Point to diagram showing bidirectional communication]**

---

### Slide 25: SSR / Client environment
*18:30-20:00*

"Here's a concrete example - Vue SFC transform. Same component, but client environment produces render functions, while SSR environment produces server-side render functions."

**[Point to the differences in transform output]**

"Vite handles all this through its environment API."

---

### Slide 26: vite-node → Vite environment API
*20:00-20:45*

"Historically, this was achieved with vite-node. Vitest 4 migrated to Vite's official environment API - a great collaboration between the teams."

---

### Slide 27: Test runner
*20:45-21:30*

"@vitest/runner defines the VitestRunner interface with importFile and lifecycle callbacks."

**[Show right side]**

"Vite module runner implements this for Node. Browser mode implements it with native import."

---

### Slide 28: Vite Module Runner
*21:30-23:00*

"Module runner rewrites import and export into runtime functions like `__vite_ssr_import__`."

**[Show transformation example]**

"You can see this yourself with VITE_NODE_DEBUG_DUMP=true."

---

### Slide 29-30: Module mocking
*23:00-25:00*

**[Slide 29]**

"Module mocking: auto-mocking replaces exports with spies, manual-mocking provides custom implementation."

**[Slide 30]**

"Vitest transforms vi.mock calls to the top, before imports, so mocking state is registered first."

**[Point to transformation showing vi.mock being hoisted]**

---

## Wrap-up (5 minutes) - 25:00-30:00

### Slide 31: Key Takeaways
*25:00-27:00*

**[Click through each takeaway]**

"Let me summarize the key architectural insights:"

"First: Test lifecycle drives the architecture - understanding orchestration, collection, execution, and reporting is fundamental."

"Second: Client-server architecture enables runtime-agnostic execution across Node.js, browsers, and other environments."

"Third: Vite as foundation - the module runner and transform pipeline power the test runtime, similar to SSR."

---

### Closing
*27:00-30:00*

"Thank you for your attention! I hope this deep dive into Vitest's internals was helpful for understanding how modern test frameworks work."

**[Pause]**

"I'm happy to take questions now."

---

## Speaker Notes

### Pacing Guidelines
- **Total: 30 minutes** with ~5 min for Q&A
- Speak clearly, not too fast
- Allow animations to complete
- Watch audience engagement - adjust depth as needed
- Keep introduction and overview tight (5 min total)
- Core technical content (test lifecycle + Vite integration): 20 minutes
- Leave time for wrap-up and transition to Q&A

### Time Markers (Check Points)
- 5 min: Should be finishing Overview
- 10 min: Should be in middle of Orchestration/Isolation
- 17 min: Should be starting "Where is Vite?"
- 25 min: Should be at Key Takeaways
- 27 min: Open for questions

### Flexibility
- **If running short**: Expand on examples, show more code details
- **If running long**: Skip or compress isolation example, compress comparison examples
- **Technical difficulties**: Have static slides ready, skip animations

### Engagement
- Make eye contact with audience
- Use hand gestures to emphasize architecture concepts
- Show enthusiasm about the collaboration between Vite/Vitest teams
- Balance technical depth with accessibility

### Technical Level
- Assume basic testing knowledge (describe, test, expect)
- Don't assume deep Vite knowledge - explain concepts as you go
- Focus on architecture patterns applicable to other test frameworks
- Use concrete examples from the actual Vitest codebase

### Key Emphasis Points
- Test lifecycle as organizing principle
- Client-server architecture for runtime flexibility
- Vite's role vs framework-agnostic parts
- How this knowledge helps write better tests
