# Topic Ideas and Research

Topic-specific considerations for the React Tokyo Fes 2026 poster session.

## Topic Ideas

### Top Candidate: "use cache" Deep Dive
**Angle**: "Is 'use cache' a React feature?" - Understanding the boundaries

**Why this topic**:
- Educational gap: many devs don't understand where React ends and Next.js begins
- Unique perspective: implemented outside Next.js (Vite plugin)
- Relatable approach: documenting a learning journey rather than expert explanation
- Practical value: helps Next.js users understand internals

**Sections**:
- What React provides: cache boundaries, serialization hooks
- What Next.js adds: fetch caching, revalidation strategies
- Implementation in Vite (reference: jacob-ebey's plugin)
- Side-by-side code comparison

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
- Waku contributor
- Helped create/contributed to vite-plugin-react-use-cache (understand the core implementation well)
- Not a Next.js heavy user (gap: Next.js-specific features)

**What you know**:
- Core "use cache" implementation in Vite
- React primitives and how they work
- Portable parts of the implementation

**What to research**:
- Next.js-specific additions/differences
- How Next.js wraps or extends the core primitives
- DX features and tooling Next.js provides on top

**References**:
- https://github.com/jacob-ebey/vite-plugin-react-use-cache/ (your work)
- https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc
- https://github.com/wakujs/waku

## Research Path (if pursuing "use cache")

Starting point: You already understand the Vite implementation well

1. Document what you already know (Vite/portable implementation)
2. Research Next.js-specific implementation:
   - How Next.js uses the same React primitives
   - What additional features Next.js adds (fetch integration, revalidation, etc.)
   - DX/tooling differences
3. Create comparison showing:
   - What's React (core primitives)
   - What's portable (works in any framework)
   - What's Next.js-specific
4. Build visual diagrams showing the architecture layers
5. Prepare side-by-side code examples

## Layout Options for "use cache" Topic

**Comparison Layout** (recommended):
- Split down middle: React primitives vs Next.js additions
- Visual flow diagram in center
- Code examples at bottom

**3-Column Layout**:
- Left: Problem + Background
- Middle: React implementation
- Right: Next.js + Vite comparison

## Presentation Approach

- Frame as "learning journey" rather than expert explanation
- Focus on what's portable vs framework-specific
- Make it relatable to audience who wonder the same things
- Use 30-minute sessions for deeper technical discussions
- Speaker is Japanese, will present in Japanese
