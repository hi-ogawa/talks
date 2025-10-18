# Talk Script

## Slide 1: Title - Inside Vitest

"Hello everyone! Welcome to Vue Fes Japan 2025. Today I'm excited to share with you a deep dive into Vitest's architecture - how it works under the hood and what makes it unique as a modern test framework."

**[Pause, click to next slide]**

---

## Slide 2: About Me & Talk Overview

"Let me briefly introduce myself. I'm a software engineer who's been contributing to the Vite and Vitest ecosystems. I'm passionate about developer tools and testing frameworks, and I've spent a lot of time exploring how these tools work internally."

**[Point to right side]**

"In today's talk, we'll explore four main areas: Vitest's architecture, how it integrates with Vite, the runtime features it provides, and how it compares to other solutions in the ecosystem."

---

## Slide 3: What is Vitest?

"For those new to Vitest, let me give you a quick overview of what makes it special."

**[Click through each point]**

"It's **fast** - powered by Vite's lightning-fast build pipeline. It's **modern** - with native ESM support and first-class TypeScript integration. It has a **compatible** API with Jest, making migration easier. It's **universal** - you can run the same tests in Node, browsers, and edge environments. And it's **extensible** - it can use any Vite plugin."

---

## Slide 4: What is Vite?

"Before we dive deeper, let me quickly explain Vite for anyone who might not be familiar."

**[Click through]**

"Vite is a next-generation frontend build tool that provides instant server start with native ESM, lightning-fast HMR, a rich plugin interface, optimized production builds with Rollup, and it's framework agnostic - working with React, Vue, Svelte, and more."

"This foundation is crucial because Vitest leverages all of these capabilities for testing."

---

## Slide 5: Features Overview

"Now let's look at Vitest's features. We'll organize them into three core categories."

---

## Slide 6: Assertion Features

"First, **assertion features**."

**[Click for Pure Assertion]**

"Vitest provides a pure assertion API that's compatible with Jest and Chai, with rich matchers and support for custom matchers."

**[Click for Integrated with Runtime]**

"But it's not just about assertions - they're deeply integrated with the test runtime, providing automatic test isolation and built-in snapshot testing."

**[Click for Diffing Errors]**

"When tests fail, you get beautiful error diffs with source code context, making debugging much easier."

---

## Slide 7: Runtime Features

"Second, **runtime features** - the capabilities that execute during test runs."

**[Click through each feature]**

"Built-in **coverage** with c8 or istanbul. Powerful **mocking** for modules and functions. Configurable **timeouts and retries** for flaky tests. **Fixture** support for setup and teardown. Clean **error stack traces** that actually help you debug. And **console logging interception** to capture output from your tests."

---

## Slide 8: Framework Features - Orchestration

"Third, **framework features** - how Vitest manages and runs your tests."

**[Click for Orchestration]**

"The orchestration layer handles **parallelization** - running tests in parallel for speed - and **isolation** - ensuring each test file runs in isolation for reliability."

**[Click for Reporter]**

"There are multiple built-in reporters, and you can create custom ones."

**[Click for Watch Mode]**

"Watch mode intelligently watches files and re-runs only affected tests."

---

## Slide 9: Additional Framework Features

**[Click through]**

"There's also benchmark mode for performance testing and typecheck mode for type-level testing with tsd."

---

## Slide 10: Vite-Specific Techniques

"Now let's explore how Vitest leverages Vite's power - this is where things get really interesting."

---

## Slide 11: Transform Pipeline

**[Click through]**

"Vitest reuses Vite's transform pipeline. This means all Vite plugins work with Vitest automatically. TypeScript, JSX, Vue, Svelte - all supported out of the box. Any custom transformations you've set up via plugins just work."

---

## Slide 12: Module Graph

**[Click through]**

"Vite maintains a module dependency graph - a map of which modules depend on which others. Vitest uses this to enable intelligent test re-running. When you change a file, it only re-runs tests that are affected by that change. This is what powers watch mode's efficiency."

---

## Slide 13: Module Runner

**[Click through]**

"The Vite Module Runner is what powers Vitest's Node runtime. It's a direct evolution from vite-node, executing modules in Node.js with Vite transforms applied. This is a recent collaboration between the Vite and Vitest teams - you can check out the PR for details."

---

## Slide 14: Browser Mode

**[Click through]**

"The Vite Client powers Vitest's browser mode. This lets you run tests directly in real browsers, test browser-specific APIs, and integrate with tools like Playwright and WebdriverIO for true environment fidelity."

---

## Slide 15: Why Isolation?

"Let's take a moment to understand why Vitest runs each test file in isolation. This is a key architectural decision."

---

## Slide 16: Benefits of Isolation

**[Click for Unlocks Key Features]**

"Isolation unlocks several key features: You can capture runtime logs per test file. You can safely run tests in parallel. And there's no cross-test pollution - each test starts with a clean state."

**[Click for Stability]**

"It also provides stability benefits. There are trade-offs between worker threads and forked processes, but isolation gives you predictable test behavior and better error handling."

---

## Slide 17: Ecosystem Features

"Beyond core testing, Vitest has a rich ecosystem."

---

## Slide 18: Framework Integrations

**[Click through]**

"Vue with @vue/test-utils. React Testing Library. Svelte Testing Library. Solid Testing Library. And more - basically any framework you're using likely has great Vitest support."

---

## Slide 19: Environment Integrations

**[Click through]**

"Browser mode with Playwright, WebdriverIO, or Puppeteer. Cloudflare Workers for edge runtime testing. Storybook for component testing integration. And a custom environments API if you need something specific."

---

## Slide 20: Comparison to Other Frameworks

"Let's see how Vitest fits into the broader testing ecosystem."

---

## Slide 21: Vitest vs Jest

**[Click for Advantages]**

"Compared to Jest, Vitest is faster thanks to Vite's speed, has native ESM support, leverages the Vite plugin ecosystem, and supports multiple runtime targets."

**[Click for Compatibility]**

"But importantly, it maintains a Jest-compatible API, providing an easy migration path."

---

## Slide 22: Vitest vs Mocha

**[Click for More Features]**

"Compared to Mocha, Vitest provides more features out of the box - built-in assertions, mocking, coverage integration, and modern defaults."

**[Click for Similar Philosophy]**

"But both share a similar philosophy of being flexible, extensible, and plugin-based."

---

## Slide 23: Runtime Built-ins

**[Click through]**

"There are also runtime built-ins to consider: Node.js has node:test, Deno has its built-in test runner, and Bun has bun test which is very fast."

"Vitest complements these with framework integration, the Vite plugin ecosystem, and cross-runtime compatibility."

---

## Slide 24: Architecture Deep Dive - Core Components

"Now let's look at the core components that make up Vitest's architecture."

---

## Slide 25: Core Components Detail

**[Click through each]**

"First, the **Vite Runtime & Plugin Mechanism** - where Vite Module Runner becomes Vitest Node Runtime, and Vite Client becomes Browser Mode."

"Second, the **Test Runner and Assertion** on the runtime side - the actual test execution engine and assertion library."

"Third, **Test Orchestration** on the server side - handling file discovery, scheduling, and worker pool management."

"And fourth, the **Reporter** - formatting output and aggregating results."

---

## Slide 26: Best Practices & Optimization

"Understanding these internals helps you write better tests. Let me share some practical tips."

---

## Slide 27: Performance Tips

**[Click through]**

"Choose between thread pools and forked processes based on your needs. Leverage watch mode for fast iteration. Write focused, isolated tests. Configure coverage strategically - don't over-test. And use Vite plugins for any transformations you need."

---

## Slide 28: Testing Patterns

**[Click through]**

"Prefer unit tests for speed. Use browser mode when you actually need to test DOM APIs. Mock external dependencies. Use snapshots judiciously - they're powerful but can become brittle. And always write deterministic tests - no random data or time dependencies."

---

## Slide 29: Key Takeaways

"Let me summarize the key points."

---

## Slide 30: Summary

**[Click through each]**

"First: Vitest leverages Vite's entire ecosystem - plugins, transforms, and the module graph."

"Second: Its runtime agnostic architecture works across Node, Browser, and Edge environments."

"Third: Isolation enables powerful features like parallelization, per-test logging, and stability."

"Fourth: It provides a modern testing experience that's both fast and feature-rich while maintaining compatibility."

"And fifth: Understanding these internals helps you write better tests with better performance and patterns."

---

## Slide 31: Thank You

"Thank you all for your attention! I hope this deep dive into Vitest's architecture was helpful. I'm happy to take questions now."

**[Pause for questions]**

"Here are some resources if you want to learn more - the Vitest documentation, Vite documentation, and the Vue Fes Japan 2025 website."

---

## Notes for Speaker

### Pacing
- Speak clearly and not too fast
- Pause after each major point
- Allow clicks/animations to complete before continuing
- Watch the time - aim for natural pacing without rushing

### Engagement
- Make eye contact with audience
- Use hand gestures to emphasize key points
- Show enthusiasm about the technology
- Be ready to skip or expand sections based on time

### Technical Level
- Assume audience has basic testing knowledge
- Don't assume deep Vite knowledge - explain when needed
- Balance theory with practical insights
- Use concrete examples when possible

### Backup Plans
- If running short on time: Skip or shorten Best Practices section
- If running long: Speed through comparison slides
- If technical difficulties: Have static version of slides ready
- Questions during talk: Brief answers, defer detailed ones to Q&A
