- https://vuefes.jp/2025/
- https://esa-pages.io/p/sharing/6906/posts/1600/e44620bf00ec24add494.html
- brainstorming
  - https://claude.ai/chat/06fad6ed-d90d-49e6-9aef-5c9221fd91b7
  - https://deepwiki.com/vitest-dev/vitest
- research items
  - core components
    - Vite runtime and plugin mechanism
      - Vite module runner -> Vitest node runtime
      - Vite client -> browser mode
    - test runner / assertion (runtime side)
    - test orchestration (server side)
    - reporter
  - ecosystem features
    - framework plugins
    - browser mode integrations
    - cloudflare workers
    - storybook
  - comparison to other test frameworks
    - mocha, jest
    - node, deno, bun (builtin)

---



Misc topic
- Vite / Vitest collaboration
  - vite-node -> module runner
  - https://github.com/vitejs/vite/pull/20916

- Why isolation
  - certain features unlocked by isolation
    - runtime log.
    - parallization.
  - stability
    - worker vs fork
