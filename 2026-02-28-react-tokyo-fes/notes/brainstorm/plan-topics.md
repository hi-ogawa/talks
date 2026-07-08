# Topic Ideas and Research

Topic-specific considerations for the React Tokyo Fes 2026 poster session.

## Topic Ideas

### Top Candidate: "use cache" Deep Dive

**Angle**: Framework-agnostic mechanism - understanding core React RSC APIs

**Why this topic**:

- Educational gap: many devs assume "use cache" is Next.js-specific
- Unique perspective: implemented for Vite, proving it's framework-agnostic
- Technical depth: concrete React APIs with real implementation examples
- Practical value: understanding portable RSC primitives

**Sections**:

- Core React APIs: renderToReadableStream, createFromReadableStream, encodeReply, decodeReply, createTemporaryReferenceSet
- Connection to familiar concepts: how these APIs relate to client components and server functions
- Vite implementation demo: `vite-plugin-react-use-cache` for `@vitejs/plugin-rsc`
- Framework-agnostic mechanism (minimize Next.js-specific discussion)

### Alternative: PPR (Partial Prerendering)

- Very new/cutting-edge topic
- Combines SSG concepts
- Good visual potential
- **Challenge**: Need to learn Next.js implementation deeply

### Alternative: RSC Ecosystem Beyond Next.js

- Showcase multiple implementations: Next.js, Vite plugin, Waku
- Compare features/trade-offs
- Position yourself as ecosystem contributor

## Context & Resources

**Your background**:

- Author/maintainer of `@vitejs/plugin-rsc`
- Waku team member
- Contributed to vite-plugin-react-use-cache (understand the core implementation well)
- VoidZero Inc. OSS developer
- Not a Next.js heavy user (prefer not to emphasize Next.js)

**What you know**:

- Core React RSC APIs and how they work
- Framework-agnostic "use cache" implementation
- How serialization/deserialization APIs enable caching
- Connection to client component and server function primitives

**What to focus on**:

- Concrete React API usage (renderToReadableStream, encodeReply, etc.)
- How temporary references enable donut pattern
- Framework-agnostic mechanism
- Vite implementation as demo/proof (not pedagogically central)

**References**:

- https://github.com/jacob-ebey/vite-plugin-react-use-cache/ (your work)
- https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc
- https://github.com/wakujs/waku

## Research Path (if pursuing "use cache")

Starting point: You already understand the Vite implementation well

1. Document concrete React APIs used:
   - renderToReadableStream / createFromReadableStream (RSC serialization)
   - encodeReply / decodeReply (server function arguments, cache keys)
   - createTemporaryReferenceSet (donut pattern for static shell + dynamic children)
2. Map how these APIs relate to familiar concepts:
   - Client component serialization/deserialization
   - Server function argument encoding
   - Two worlds (client and server) bundler maps
3. Create visual diagrams showing:
   - Framework-agnostic mechanism flow
   - How React APIs enable "use cache"
   - Connection to client components and server functions
4. Prepare code examples from vite-plugin-react-use-cache
5. Minimize framework-specific discussion (focus on React core)

## Layout Options for "use cache" Topic

**API-focused Layout** (recommended):

- Top: Hook - "use cache" appears Next.js-only, but it's framework-agnostic
- Main sections: Three core API categories with visual diagrams
  - RSC serialization (renderToReadableStream/createFromReadableStream)
  - Server function encoding (encodeReply/decodeReply)
  - Temporary references (createTemporaryReferenceSet for donut pattern)
- Bottom: Vite demo implementation, connection to client components/server functions

**Flow-based Layout**:

- Left: Problem statement (framework-agnostic claim)
- Center: React API flow diagram with code snippets
- Right: Vite implementation proof + key takeaways

## Presentation Approach

- Technical peer-to-peer depth (not beginner tutorial)
- Focus on concrete React APIs and how they work
- Emphasize framework-agnostic nature (minimal Next.js discussion)
- Connect to familiar RSC concepts (client components, server functions)
- Vite implementation as branding/proof, not pedagogical tool
- Use 30-minute sessions for deeper API discussions
- Present in Japanese
