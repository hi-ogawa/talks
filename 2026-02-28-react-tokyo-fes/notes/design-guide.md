# Poster & Presentation Design Guide

## Quick Cheat Sheet

| Principle       | Rule of Thumb                                        |
| --------------- | ---------------------------------------------------- |
| **Text**        | 20% text, 40% figures, 40% whitespace                |
| **Colors**      | 2-3 max; high contrast for readability               |
| **Fonts**       | 1-2 fonts; sans-serif for distance                   |
| **Hierarchy**   | Bigger = more important; bold for emphasis           |
| **Readability** | Key info visible from 3m / 10ft                      |
| **Squint test** | If hierarchy disappears when squinting, fix contrast |

## Visual Hierarchy

- **Size**: Bigger = more important. Viewer's eye drawn to larger elements first.
- **Color**: Use bold/bright for key points, muted for secondary info. One accent color on mostly black/white/gray is effective.
- **Typography**: Larger/bolder for top-level info. Stick to 1-2 fonts max.
- **Whitespace**: Increases comprehension by ~20%. Don't pack elements tight.

## Color Guidelines

- Stick to 2-3 colors for consistency
- Light background + dark text (or inverse) for contrast
- Avoid red/green for meaning (colorblind accessibility)
- Contrast ratio: 4.5:1 for body text, 3:1 for titles

## Arrow Types

Three semantic arrow types with distinct visual treatments:

### 1. Data Flow (environment-to-environment)

```
[ Client ] ═══════════▶ [ Server ]
```

- **Thick solid line** (3-4px)
- **Filled arrow head**
- Color: neutral (black/dark gray)
- Meaning: "data moves from here to there"

### 2. Transform Flow (API pipeline)

```
data1 ───renderToReadableStream───▷ data2 ───createFromReadableStream───▷ data3
```

- **Medium solid line** (2px)
- **Open/hollow arrow head**
- **Label on the line** (function name, smaller font)
- Color: subtle gray or environment color
- Meaning: "this function transforms A into B"

### 3. Annotation Pointer (data ↔ code reference)

```
                    ┌───────────────┐
<div>{0.8033}</div> ┊               │
        ╰ ─ ─ ─ ─ ─ ┊─▸ reactNode   │
                    └───────────────┘
```

- **Dashed/dotted line** (1-2px)
- **Small arrow head** or dot terminus
- Color: muted (light gray) or accent
- Meaning: "this visual represents this variable"

### Arrow Summary

| Arrow Type | Line Style | Weight        | Head        | Color      |
| ---------- | ---------- | ------------- | ----------- | ---------- |
| Data flow  | Solid      | Thick (3-4px) | Filled      | Black/dark |
| Transform  | Solid      | Medium (2px)  | Open/hollow | Gray       |
| Annotation | Dashed     | Thin (1-2px)  | Small/dot   | Light gray |

**In Google Slides:**

- `Insert → Line → Arrow`
- `Format Options → Line dash` for dashed
- `Line weight` dropdown for thickness
- `Line start/end` dropdown for head style

---

## Code Block Design (for tech posters)

### Environment Badges

Use corner pill/badge to indicate environment:

```
┌─────────────────────────────┐
│ [Server]      code here...  │
│                             │
└─────────────────────────────┘
```

Suggested color scheme:

| Environment  | Color         |
| ------------ | ------------- |
| Server       | Blue/Purple   |
| Client (CSR) | Green         |
| Client (SSR) | Orange/Yellow |

### Code Block Tips

- Limit to 5-8 lines per block
- Use monospace font (16-20pt for A0)
- Syntax highlighting via screenshot (VS Code, carbon.now.sh) or manual coloring
- Color-code environments consistently across all blocks

## Google Slides Tips

### Keyboard Shortcuts

| Action                   | Shortcut     |
| ------------------------ | ------------ |
| Duplicate                | Ctrl+D       |
| Duplicate while dragging | Ctrl+drag    |
| Group                    | Ctrl+G       |
| Ungroup                  | Ctrl+Shift+G |
| Copy formatting          | Ctrl+Alt+C   |
| Paste formatting         | Ctrl+Alt+V   |
| Bring forward            | Ctrl+Up      |
| Send backward            | Ctrl+Down    |

### Working with Images

- **Round corners**: Select image → Crop dropdown → Shapes → Rounded rectangle
- Adjust roundness: double-click to enter crop mode, drag yellow diamond
- Pasted images always land in center (no cursor-position paste)

### Creating Badges/Pills

1. Insert → Shape → Rounded rectangle
2. Set fill color, minimal or no border
3. Add text inside, center-aligned
4. Group with code block
5. Ctrl+drag to duplicate for other environments

## Authoritative Resources

### Academic Poster Design

- [Yale - Academic Poster Resources](https://guides.library.yale.edu/academic-poster-resources)
- [NYU - How to Create a Research Poster](https://guides.nyu.edu/posters)
- [UChicago - Building a Research Poster](https://guides.lib.uchicago.edu/c.php?g=1438839&p=10687346)
- [UC Davis - Poster Design Principles (PDF)](https://urc.ucdavis.edu/sites/g/files/dgvnsk3561/files/inline-files/General%20Poster%20Design%20Principles%20-%20Handout.pdf)

### Visual Hierarchy & Color Theory

- [BrightCarbon - Visual Hierarchy Tips](https://www.brightcarbon.com/blog/visual-hierarchy-tips/)
- [SlideModel - Color Theory for Presentations](https://slidemodel.com/color-theory-for-presentations/)
- [Purdue OWL - Color Theory](https://owl.purdue.edu/owl/general_writing/visual_rhetoric/color_theory_presentation.html)
- [IxDF - What is Visual Hierarchy?](https://www.interaction-design.org/literature/topics/visual-hierarchy)
