# React Tokyo Fes 2026 - Poster Session Plan

General poster preparation plan. See [plan-topics.md](./plan-topics.md) for topic-specific considerations.

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

## Timeline & Time Estimates

**Proposal deadline**: 11/18 (title & abstract only)
**Fes date**: 2026 (exact date TBD)
**Total active work time**: ~30-40 hours spread over months

### Before Proposal (by 11/18)

- **Choose final topic**: 1-2 hours
- **Write title & abstract**: 2-3 hours (iterate on wording, translate to Japanese)

### Research Phase (ongoing, casual pace)

- **Deep dive into Next.js implementation**: 5-10 hours spread over days/weeks
  - Reading Next.js source code
  - Testing differences
  - Taking notes on findings

### Content Creation (1-2 months before fes)

- **Create visual diagrams/flow charts**: 4-6 hours
  - Architecture diagrams
  - Flow comparisons
  - Code visualization
- **Write content sections (English draft)**: 4-6 hours
  - Problem, approach, results sections
  - Code examples with explanations
- **Design layout**: 3-5 hours
  - Choose final tool (HTML/CSS, Figma, PowerPoint, etc.)
  - Create actual poster design
  - Adjusting typography, spacing, colors
  - Multiple iteration rounds

### Translation & Polish (1-2 months before fes)

- **Translate to Japanese**: 3-4 hours
  - Content translation
  - Font size/layout adjustments for Japanese text
  - Review for natural Japanese phrasing
- **Review from 2m distance**: 1 hour
  - Print preview or actual-size viewing
  - Readability checks
  - Iterate on font sizes

### Technical Prep (1-2 months before fes)

- **Prepare laptop demo and materials**: 3-5 hours
  - Set up side-by-side comparison
  - Code comments and explanations
  - Test offline functionality

### Final Steps (2-3 weeks before fes)

- **Print test**: 2-3 hours (+ waiting time)
  - Print at smaller scale first (A3/A4)
  - Check colors, readability
  - Fix any issues
  - Final A0 print
- **Submit poster**: 30 minutes

### Suggested Approach

**This week (by 11/18)**:

- Commit to "use cache" topic
- Write compelling title & abstract
- Submit proposal

**Next 2-4 weeks** (casual pace):

- Deep dive into Next.js implementation
- Document findings as you go

**1-2 months before fes**:

- Create diagrams and content
- Build laptop demo
- Design poster layout
- Translate to Japanese

**2-3 weeks before fes**:

- Print test
- Final adjustments
- Submit final poster

## Poster Design Principles

### Understanding Physical Size

A0 (841mm × 1189mm) is **very large** - important to keep in mind during design:

**Size references**:

- Width: ~84cm = about 4× A4 sheets side by side
- Height: ~119cm = roughly 6× A4 sheets stacked
- Area: 16× larger than A4 paper
- HP 2309p monitor (~510mm wide) shows only ~60% of poster width

**Tips to visualize actual size**:

- Mark out 84cm × 119cm on wall/floor with tape
- Print preview at 100% (not "Fit to page")
- Print scaled mockup on A3 (exactly half the size of A0)
- Temporarily view HTML at actual size: `width: 841mm` in browser, then zoom out
- Remember: A3 = 1/2 scale, A4 = 1/4 scale of A0

**Design implications**:

- Elements that look large on screen may be tiny on actual poster
- Test readability from 1-2 meters away
- Don't be afraid to use "huge" font sizes - they'll be appropriate in print

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

## Tooling Decision

### Current: HTML/CSS (for prototyping/visualization)

- **Purpose**: Rough visualization and layout testing
- **Why**: Quick iteration, version control, easy to experiment
- **Current draft**: `drafts/poster-draft.html` (prototype only)
- **Note**: Final tool decision to be made later when creating actual poster

### Options for Final Poster

**HTML/CSS**

- **Pros**: Git-friendly, no special software, precise control over layout
- **Cons**: Need to handle print CSS carefully, less visual/intuitive
- **Workflow**: Edit HTML/CSS → browser print → PDF (A0 size)
- **Resources**:
  - [academic-poster-template](https://github.com/cpitclaudel/academic-poster-template) - Modern, accessible
  - [SciPosterHTML](https://github.com/martinlicht/SciPosterHTML) - Minimal, flexbox-based

**Slidev** ❌ (Not ideal for posters)

- Possible with custom canvas size in config:
  ```ts
  export default {
    canvasWidth: 841,
    aspectRatio: 1189 / 841, // A0 portrait
  };
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
