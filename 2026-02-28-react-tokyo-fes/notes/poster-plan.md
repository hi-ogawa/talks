# "use cache" Poster Session Plan

Plan for React Tokyo Fes 2026 poster session on framework-agnostic "use cache" implementation.

## Core Concept

**Title**: フレームワーク非依存な"use cache"の仕組みとViteでの実装

**Angle**: Show that "use cache" is built on framework-agnostic React RSC APIs, not Next.js-specific features. Use Vite implementation as proof.

**Key Message**: The core "use cache" mechanism comes from React primitives - same APIs used for client components and server functions.

## Why This Topic

- **Educational gap**: Most devs assume "use cache" is Next.js-only
- **Unique proof**: Implemented for Vite (`vite-plugin-react-use-cache` for `@vitejs/plugin-rsc`)
- **Technical depth**: Concrete React APIs with real implementation
- **Practical value**: Understanding portable RSC primitives
- **Personal strength**: Built it, understand implementation deeply

## Content Focus

### Core React APIs (Main Focus)

Three categories of APIs to cover:

1. **RSC Serialization**
   - `renderToReadableStream` / `createFromReadableStream`
   - Converting client/server references in "two worlds" (client and server)
   - Different bundler maps for client vs server deserialization

2. **Server Function Encoding**
   - `encodeReply` / `decodeReply`
   - Encoding/decoding server function arguments
   - Used to create cache keys for "use cache" function/component arguments

3. **Temporary References**
   - `createTemporaryReferenceSet`
   - Enables donut pattern: static shell (`use cache` component) + dynamic children
   - How temporary references work

### Connection to Familiar Concepts

Show how these APIs relate to what RSC developers already know:

- Client component serialization/deserialization
- Server function argument encoding
- Two worlds concept

### Vite Implementation

- Demo using `vite-plugin-react-use-cache` for `@vitejs/plugin-rsc`
- Shows framework-agnostic nature
- Vite is branding/positioning (you're VoidZero OSS dev, `@vitejs/plugin-rsc` author)
- Transform is minimal focus - mainly about React API usage

### What to Minimize

- Next.js-specific features (fetch caching, revalidation)
- Framework comparison details
- Transform/build tooling details
- You're not a Next.js heavy user - don't emphasize it

## Poster Layout Ideas

### Option 1: API-Focused (Recommended)

```
┌─────────────────────────────────────────────┐
│ Title: フレームワーク非依存な"use cache"の  │
│        仕組みとViteでの実装                 │
│ Hook: Appears Next.js-only, but it's React │
├─────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │   RSC    │ │  Server  │ │Temporary │    │
│ │Serialize │ │ Function │ │Reference │    │
│ │          │ │ Encoding │ │          │    │
│ │ render/  │ │ encode/  │ │ create   │    │
│ │ create   │ │ decode   │ │TempRef   │    │
│ │From      │ │Reply     │ │Set       │    │
│ │Stream    │ │          │ │          │    │
│ │          │ │          │ │          │    │
│ │[diagram] │ │[diagram] │ │[diagram] │    │
│ └──────────┘ └──────────┘ └──────────┘    │
├─────────────────────────────────────────────┤
│ Connection to client components/server fns  │
│ Vite demo implementation                    │
│ QR codes: repo, demo                        │
└─────────────────────────────────────────────┘
```

### Option 2: Flow-Based

```
┌──────────────┬─────────────────┬──────────────┐
│ Problem      │ React API Flow  │ Vite Proof   │
│              │                 │              │
│ "use cache"  │ [Flow diagram   │ vite-plugin- │
│ appears      │  showing how    │ react-use-   │
│ Next.js-only │  APIs work]     │ cache        │
│              │                 │              │
│ But it's     │ Code snippets   │ Demo running │
│ framework-   │ for each API    │              │
│ agnostic!    │                 │              │
└──────────────┴─────────────────┴──────────────┘
```

## Visual Elements to Create

- **Flow diagrams**: How each API category works
- **Two worlds diagram**: Client vs server bundler maps
- **Donut pattern**: Static shell + dynamic children visual
- **Code snippets**: Real usage from vite-plugin-react-use-cache
- **Connection map**: How APIs relate to client components/server functions
- **QR codes**: Link to repo, implementation

## Presentation Approach

- **Technical depth**: Peer-to-peer, not beginner tutorial
- **Focus**: Concrete React APIs and mechanics
- **Tone**: Showing how it works, not comparing frameworks
- **30-min sessions**: Dive deeper into specific API details
- **Language**: Japanese
- **Demo**: Laptop with Vite implementation running

## Research/Prep Tasks

1. **Document API usage** from vite-plugin-react-use-cache
   - How each API is called
   - What parameters/options matter
   - How they connect together

2. **Create visual diagrams**
   - RSC serialization flow
   - Two worlds bundler map concept
   - Temporary reference mechanism
   - Overall architecture

3. **Map to familiar concepts**
   - Show parallel with client component handling
   - Show parallel with server function encoding
   - Make explicit connections

4. **Prepare code examples**
   - Clean, syntax-highlighted snippets
   - 5-10 lines max per example
   - Actual code from implementation

5. **Test demo**
   - Vite implementation running smoothly
   - Side-by-side comparison if useful
   - Offline-capable

## References

- Your notes: `notes/brainstorm/use-cache.md`
- https://github.com/vitejs/vite-plugin-react
  - https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-rsc/examples/basic/src/framework/use-cache-runtime.tsx
  - `~/code/others/vite-plugin-react/packages/plugin-rsc`
- https://github.com/jacob-ebey/vite-plugin-react-use-cache
  - `~/code/others/vite-plugin-react-use-cache`
- https://github.com/gaearon/rscexplorer/
  - https://rscexplorer.dev
  - visualization of RSC stream (renderToReadableStream) and action payload (encodeReply)
- demo Vite RSC app
	- visualize `encodeReply`
	- visualize `renderToReadableStream`
