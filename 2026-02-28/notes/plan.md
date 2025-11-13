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

## Tooling Decision

### Chosen: HTML/CSS ✅
- **Why**: Comfortable with web tech, version controllable, easy iteration
- **Workflow**: Edit HTML/CSS → browser print → PDF (A0 size)
- **Resources**:
  - [academic-poster-template](https://github.com/cpitclaudel/academic-poster-template) - Modern, accessible
  - [SciPosterHTML](https://github.com/martinlicht/SciPosterHTML) - Minimal, flexbox-based
- **Pros**: Git-friendly, no special software, precise control over layout
- **Cons**: Need to handle print CSS carefully
- **Current draft**: `drafts/poster-draft.html`

### Alternative Options Considered

**Slidev** ❌ (Not ideal for posters)
- Possible with custom canvas size in config:
  ```ts
  export default {
    canvasWidth: 841,
    aspectRatio: 1189/841, // A0 portrait
  }
  ```
- Issue: Optimized for slides, not posters
- Better use: Separate slide deck to accompany poster

**PowerPoint/Keynote/Google Slides** (Common approach)
- Custom size: 84.1cm × 118.9cm
- Easy for beginners, harder to version control
- Good templates available

**Figma/Canva** (Design-focused)
- Good for design-heavy posters
- Collaborative editing
- Export to PDF for printing
- Frame size in Figma: 8410 × 11890 px (at 10px/mm)

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
