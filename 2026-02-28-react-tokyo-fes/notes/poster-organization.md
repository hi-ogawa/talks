# Poster Organization Strategy

> **A0 is portrait**: 84.1cm wide × 118.9cm tall (ratio ~0.7:1, taller than wide)

## Reading Flow Patterns

### Column-first (vertical flow)

```
┌─────┬─────┬─────┐
│  1  │  3  │  5  │
│     │     │     │
│  2  │  4  │  6  │
│     │     │     │
└─────┴─────┴─────┘
  ↓     ↓     ↓
```

- **Academic standard** — readers expect this at conferences
- Clean grid, predictable structure
- Works well for linear narratives
- Harder to span content across columns

### Row-first (horizontal flow)

```
┌─────────┬─────────┐
│   1.1   │   1.2   │  →
├───┬─────┴────┬────┤
│2.1│   2.2    │2.3 │  →
├───┴──────────┴────┤
│         3         │
└───────────────────┘
```

- Intuitive like reading a page
- Flexible chunk sizes per row
- Can look chaotic if column widths vary
- Better for grouped/parallel content

## When to Use Which

| Content Type               | Recommended Flow            |
| -------------------------- | --------------------------- |
| Linear narrative (A→B→C→D) | Column-first                |
| Comparison (X vs Y vs Z)   | Row-first or side-by-side   |
| Independent sections       | Either works                |
| Heavy code/diagrams        | Column-first (fixed widths) |

## Visual Hierarchy Tips

1. **Number sections visibly** — Large ①②③ or "1." "2." headers
2. **Title banner spans full width** — Anchors the poster
3. **Use arrows/flow lines** if deviating from standard column flow
4. **Keep columns equal width** for column-first layout
5. **Color-code sections** subtly if needed (background tints)

## Common Structures (Portrait A0)

### 3-Column Academic (most common)

```
┌───────────────────────────┐
│      TITLE / AUTHORS      │
├────────┬────────┬─────────┤
│ Intro  │Methods │ Results │
│        │        │         │
│        │        │         │
│ Back-  │ Key    │ Discuss │
│ ground │ Point  │         │
│        │        │         │
│        │        │ Concl.  │
│        │        │         │
└────────┴────────┴─────────┘
  Col 1    Col 2    Col 3
   ↓        ↓        ↓
```

### 2-Column with Header

```
┌───────────────────────────┐
│       TITLE / HOOK        │
├─────────────┬─────────────┤
│             │             │
│  Problem /  │  Solution / │
│  Setup      │  Results    │
│             │             │
│             │             │
│             │             │
│             │             │
├─────────────┴─────────────┤
│       SUMMARY / CTA       │
└───────────────────────────┘
```

### Mixed (for complex stories)

```
┌───────────────────────────┐
│          TITLE            │
├─────────┬─────────────────┤
│         │                 │
│ 1.Setup │  2. Main        │
│         │     Content     │
│         │    (diagrams)   │
├─────────┼────────┬────────┤
│         │        │        │
│ 3.Detail│4.Detail│5.Summ. │
│         │        │        │
└─────────┴────────┴────────┘
```

## Sizing Guidelines (A0: 84cm × 119cm)

| Element         | Recommended Size           |
| --------------- | -------------------------- |
| Title           | 72-96pt (~2.5-3.5cm tall)  |
| Section headers | 36-48pt                    |
| Body text       | 24-32pt (readable from 1m) |
| Margins         | 3-5cm                      |
| Column gap      | 2-3cm                      |

## Content Density Rule of Thumb

- **Too sparse**: Reader finishes in < 2 min, feels empty
- **Too dense**: Wall of text, reader skips sections
- **Sweet spot**: 800-1200 words + visuals, ~5 min read

## Drafting Workflow

1. **Content first** (markdown) — finalize what to say
2. **Rough layout** (HTML/paper sketch) — test if content fits
3. **Visual design** (Figma/Slides/LaTeX) — polish for print

---

## The #BetterPoster Approach (Mike Morrison, 2019)

A viral redesign that challenges traditional academic posters.

### Core Idea

Put your **main finding in huge text, center stage**, in plain language readable in 3 seconds.

### Layout Structure (Portrait A0: 84cm × 119cm)

```
┌───────────────────────────┐
│          TITLE            │
├───────────────────────────┤
│                           │
│                           │
│       MAIN FINDING        │
│                           │
│    "We found that X       │
│     causes Y"             │
│                           │
│        [QR Code]          │
│                           │
│         ~60%              │
├─────────────┬─────────────┤
│   SILENT    │    AMMO     │
│  PRESENTER  │    BAR      │
│             │             │
│  • Intro    │  • Key data │
│  • Methods  │  • Graphs   │
│  • Results  │  • Stats    │
│             │             │
│    ~20%     │    ~20%     │
└─────────────┴─────────────┘
```

**Three components:**

1. **Main Finding** (top/center): The punchline in huge plain language + QR code
2. **Silent Presenter** (bottom-left): Minimal intro/methods/results for detail seekers
3. **Ammo Bar** (bottom-right): Supporting data/figures for conversation

### Why It Works

- Traditional posters: ~3-6 posters/hour engagement
- #BetterPoster: Main message readable in seconds while walking by
- Sparks conversation rather than replacing it

### Criticism

- Too minimal for some fields
- Doesn't work well for exploratory/multi-finding research
- MIT created "#EvenBetterPoster" templates as middle ground

---

## Example Posters & References

### Templates & Downloads

| Resource                | Link                                                           | Notes                             |
| ----------------------- | -------------------------------------------------------------- | --------------------------------- |
| #BetterPoster templates | https://osf.io/ef53g/                                          | Original Morrison templates (PPT) |
| MIT #EvenBetterPoster   | https://github.com/MIT-EECS-Comm-Lab                           | PPT & Illustrator                 |
| LaTeX BetterPoster      | https://github.com/rafaelbailo/betterposter-latex-template     | For LaTeX users                   |
| PosterPresentations.com | https://www.posterpresentations.com/free-poster-templates.html | Traditional templates             |

### Before/After Examples

- **UNC Chapel Hill**: https://guides.lib.unc.edu/posters/design/examples
  - 4 before/after pairs showing content, layout, and graphics fixes
  - Includes evaluation worksheets

### Real Poster Examples (Galleries)

**Zen Faulkes' Better Poster Gallery** — https://sites.google.com/view/postergallery
Curated collection of creative/award-winning posters:

| Poster                                  | Field        | Notes                                    |
| --------------------------------------- | ------------ | ---------------------------------------- |
| Mantis Minimalism (James O'Hanlon)      | Ecology      | "Best poster ever" — extreme minimalism  |
| Hand Drawn (Rachel Byrne, 2017)         | Parasitology | Winner, European Mustelid Colloquium     |
| Landscape in Portrait (Dolezal, 2019)   | Ecology      | Best poster, EcoEvoEnto                  |
| Introducing the Web (Berners-Lee, 1991) | CS           | Historic — the WWW announcement          |
| Dead Salmon (Bennett, 2009)             | Neuroscience | Ig Nobel winner, famous methods critique |
| My Cat (Sarah Knowles, 2019)            | Health       | Best poster, HSR conference              |

**Yale Poster Gallery** — https://guides.library.yale.edu/academic-poster-resources/poster-gallery
Medical/social science examples with direct image links.

**Dartmouth Wetterhahn Symposium** — https://digitalcommons.dartmouth.edu/wetterhahnsymposium/
Undergraduate science research posters (browsable archive).

**OSU Materials Science Gallery** — https://mse.osu.edu/degrees/research-poster-gallery
Graduate research posters by department.

**Supercomputing SC24 Posters** — https://sc24.supercomputing.org/proceedings/poster/
HPC/CS student posters (computational focus).

**Craft of Scientific Posters** — https://www.craftofscientificposters.com/examples.html
Examples from Michael Alley's poster design approach.

### Design Guides

- **Colin Purrington** (classic reference): https://colinpurrington.com/tips/poster-design/
  - Comprehensive tips, good/bad examples
  - Key advice: 45-65 characters per line, 500-1000 words total

- **MIT EECS CommKit**: https://mitcommlab.mit.edu/eecs/commkit/poster/
  - CS/engineering specific advice
  - "A strong figure is worth more than a 36×36 page of text"
  - Develop a 20-second pitch

- **Zen Faulkes' Better Posters Blog**: https://betterposters.blogspot.com/
  - Years of poster critiques and advice
  - Book: "Better Posters: Plan, Design and Present an Academic Poster"

### Video

- **Mike Morrison's viral video** (1M+ views): Search "How to create a better research poster in less time"
  - 20-min explanation of the #BetterPoster approach

---

## For Technical/Code-Heavy Posters

Since your poster has code blocks and diagrams:

1. **Use monospace fonts** for code (Fira Code, JetBrains Mono)
2. **Syntax highlighting** helps but keep it subtle (avoid dark themes on print)
3. **Diagrams > code** when possible — code is hard to read at poster scale
4. **QR code to live demo** or repo is valuable
5. **Consider landscape code blocks** — they fit better in columns
