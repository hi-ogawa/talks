# React Tokyo Fes 2026 - Poster Session Plan

Notes from brainstorming discussion.

## Event Details

- **Format**: A0 poster (841mm × 1189mm)
- **Presentation**: 3× 30-minute discussion sessions with attendees
- **Setup**: Poster displayed throughout the event
- **Language**: Draft in English (easier to iterate), translate to Japanese as final step

## Next Steps

- [ ] Choose final topic
- [ ] Deep dive into implementation details
- [ ] Create visual diagrams/flow charts
- [ ] Write content sections (English draft)
- [ ] Prepare laptop demo and materials
- [ ] Design layout (use design tool or code)
- [ ] Review from 2m distance
- [ ] Translate to Japanese (may require font size/layout adjustments)
- [ ] Print test
- [ ] Submit proposal

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
- Not a Next.js heavy user (opportunity to learn!)

**References**:
- https://github.com/jacob-ebey/vite-plugin-react-use-cache/
- https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc
- https://github.com/wakujs/waku

## Poster Design Principles

### Layout Structure (A0 Portrait)
```
┌─────────────────────────────────┐
│  TITLE (72-96pt)                │
│  Author & Context               │
├─────────────────────────────────┤
│  Abstract/Hook (2-3 sentences)  │
├─────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │Col 1 │ │Col 2 │ │Col 3 │     │
│ │      │ │      │ │      │     │
│ └──────┘ └──────┘ └──────┘     │
├─────────────────────────────────┤
│  Key Takeaways                  │
│  QR codes, links, contact       │
└─────────────────────────────────┘
```

### Content Balance
- ~40% text, ~60% visuals
- Section types: Problem → Approach → Results → Conclusion

### Visual Elements
- **Diagrams**: Architecture, flow, relationships (most important)
- **Code snippets**: 5-10 lines max, syntax highlighted
- **Before/After comparisons**: Side-by-side
- **Charts**: Performance, bundle size data
- **QR codes**: Link to repo, live demo, detailed docs

### Typography
- Title: 72-96pt
- Headers: 48-60pt
- Body: 24-32pt (readable from 1-2m distance)
- Code: 18-24pt monospace

### Color Strategy
- 2-3 main colors max
- High contrast
- Color-code related concepts

### Layout Options for "use cache" Topic

**Comparison Layout** (recommended):
- Split down middle: React primitives vs Next.js additions
- Visual flow diagram in center
- Code examples at bottom

**3-Column Layout**:
- Left: Problem + Background
- Middle: React implementation
- Right: Next.js + Vite comparison

## Research Path (if pursuing "use cache")

1. Study jacob-ebey's vite-plugin-react-use-cache (clearest reference)
2. Identify React primitives (react/cache, serialization)
3. Document Next.js approach (high-level only)
4. Build minimal example in Vite setup
5. Create visual diagrams showing the flow

## Materials to Prepare (Beyond Poster)

### Laptop Demo
- Live running example of key concept
- Side-by-side comparison (Next.js vs Vite)
- Code ready in VS Code with comments
- Backup: video recording

### Digital Resources
- QR codes → GitHub repo, deployed demo, documentation
- One-page handout (A4) with key takeaways
- Optional: slide deck for deeper dives

### Technical Assets
- Well-organized code repo with README
- Runnable examples (`npm install && npm dev`)
- Architecture diagrams (digital, zoomable)
- Performance metrics if relevant

### Day-of Materials
- Business cards / digital contact
- Water bottle (3×30min talking!)
- Phone charger
- Tested offline demo

## Notes

- Frame as "learning journey" rather than expert explanation
- Focus on what's portable vs framework-specific
- Make it relatable to audience who wonder the same things
- Use 30-minute sessions for deeper technical discussions
- Speaker is Japanese, will present in Japanese
