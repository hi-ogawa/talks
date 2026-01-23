# Poster Workflow & Authoring Tips

## Getting Started with Google Slides

1. **Open the template**:
   - https://docs.google.com/presentation/d/12KWNYf9Mp0mtgc0oTRsNVnpUkWw0kSU97eWCZgQD4YE/
   - File → Make a copy

2. **Verify slide size** (should be A0):
   - File → Page setup → Custom: 84.1 × 118.9 cm

## Rough Sectioning Workflow

**Don't start with details.** Start with placeholder boxes:

1. **Insert → Shape → Rectangle** for each section
2. Label them: "1.1 RSC Flow", "2.1 First Twist", etc.
3. Drag to arrange layout (left/right split)
4. Resize until proportions feel right
5. Color boxes differently for Part 1 vs Part 2

```
┌──────────────────────────────────────────────┐
│              Title / Header                  │
├─────────────────┬────────────────────────────┤
│   [Box 1.1]     │      [Box 2.1]             │
│                 │                            │
│   [Box 1.2]     │      [Box 2.2]             │
│                 │                            │
│   [Box 1.3]     │      [Box 2.3]             │
│                 ├────────────────────────────┤
│                 │      [Box 2.4]             │
│                 ├────────────────────────────┤
│                 │   [Takeaway] [Vite]        │
├─────────────────┴────────────────────────────┤
│              Profile / Footer                │
└──────────────────────────────────────────────┘
```

## Keyboard Shortcuts

| Action             | Shortcut      |
| ------------------ | ------------- |
| Duplicate          | Ctrl+D        |
| Group              | Ctrl+G        |
| Ungroup            | Ctrl+Shift+G  |
| Copy formatting    | Ctrl+Alt+C    |
| Paste formatting   | Ctrl+Alt+V    |
| Bring forward      | Ctrl+↑        |
| Send backward      | Ctrl+↓        |
| Zoom in/out        | Ctrl + scroll |
| Actual size (100%) | Ctrl+Alt+0    |
| Fit to window      | Ctrl+Alt+1    |

### Alt+Key Menu Access (Linux/Windows)

Access menu items directly with `Alt + underlined letter`:

| Action           | Shortcut   |
| ---------------- | ---------- |
| **Insert menu**  | `Alt+I`    |
| → Text box       | `Alt+I, T` |
| → Image          | `Alt+I, I` |
| → Shape          | `Alt+I, S` |
| → Line           | `Alt+I, N` |
| → Table          | `Alt+I, B` |
| → Chart          | `Alt+I, H` |
| **Format menu**  | `Alt+O`    |
| → Align          | `Alt+O, A` |
| **Arrange menu** | `Alt+A`    |
| → Align          | `Alt+A, A` |
| → Distribute     | `Alt+A, D` |

**Tip**: After `Alt+I, S` (Insert Shape), use arrow keys to navigate shape categories, then Enter to select.

## Selecting Multiple Elements

### Box/Marquee Selection

1. Click on empty slide background (ensure nothing is selected)
2. Click and drag to draw a selection rectangle
3. All objects **fully contained** within the rectangle get selected

**Other methods:**
- **Shift + Click** — Add/remove individual items to selection
- **Ctrl + A** — Select all objects on slide (ensure you're not focused in a text box)

### Locking Template Elements (for Marquee Selection)

If the template has a frame/border that interferes with marquee selection, move it to the Master Slide:

1. **Copy the frame** from your current slide
2. Go to **Slide → Edit Theme** (opens Master editor)
3. Select the layout your slide uses
4. **Paste the frame** there and position it
5. **Delete the frame** from the regular slide
6. Close the Master editor

Now the frame is "baked in" — visible but not selectable. Marquee selection works freely.

**Alternative (for image frames):** Slide → Change background → Choose image

Sources:
- [How to lock content to avoid moving/deleting - SlidesMania](https://slidesmania.com/how-to-add-content-on-the-master-to-avoid-moving-or-deleting-it-by-mistake-in-google-slides/)
- [How to Select Multiple Objects - Bricks](https://www.thebricks.com/resources/how-to-select-multiple-objects-in-google-slides)

## Alignment & Layout

- **Guides**: View → Guides → Show guides (drag from rulers to create)
- **Snap to grid**: View → Snap to → Grid
- **Align multiple objects**: Select all → Arrange → Align → (Left/Center/Right/Top/Middle/Bottom)
- **Distribute evenly**: Select 3+ objects → Arrange → Distribute → (Horizontally/Vertically)

## Section Box Pattern

Google Slides has no container/nesting concept. Use this manual pattern:

```
┌─────────────────────────────┐
│ [Rectangle - background]    │  ← Shape with fill color
│                             │
│   [Text box - header]       │  ← Layered on top
│   [Text box - body]         │
│   [Image - diagram]         │
│                             │
└─────────────────────────────┘
```

**Workflow:**

1. `Alt+I, S` → Insert rectangle → set fill color, optional border
2. `Alt+I, T` → Insert text boxes on top
3. Insert images/diagrams as needed
4. If content goes behind rectangle: select it → `Ctrl+↑` (bring forward)
5. Align elements: select multiple → `Alt+A, A` → choose alignment
6. When layout is final: select all → `Ctrl+G` to group

**Layer order** (bottom to top):

- Background rectangle
- Text boxes
- Images/diagrams
- Arrows/connectors (if any)

**Tip**: Keep elements ungrouped while iterating. Group only when section layout is finalized.

## A0 Size Reality Check

A0 is **huge** (84.1 × 118.9 cm ≈ 33 × 47 inches):

| Zoom | What you see          |
| ---- | --------------------- |
| 100% | Small portion only    |
| 50%  | Half the poster       |
| 25%  | Whole poster overview |

**Tip**: Work at 50% for details, zoom to 25% often to check overall balance.

## Font Size Guidelines (from plan.md)

| Use              | Size  | Approx Height |
| ---------------- | ----- | ------------- |
| Titles           | 48pt+ | ~3cm          |
| Section headers  | 36pt  | ~2cm          |
| Body text        | 24pt  | ~1cm          |
| Minimum readable | 16pt  | ~0.5cm        |

- Use **Gothic/sans-serif** for visibility
- **Monospace** for code (16-20pt)

## Content Tips

### Code Blocks

- Keep short: 5-8 lines max per block
- Use syntax highlighting (screenshot from VS Code or carbon.now.sh)
- Or use monospace font + manual coloring in Slides

### Diagrams

- Create in draw.io, Excalidraw, or Mermaid → export as PNG/SVG
- Mermaid: Use https://mermaid.live/ to render and export
- Size: ~15-20cm tall each

### Text

- Bullet points over prose
- Bold key terms
- Minimal text, maximum visuals

## Iteration Workflow

1. **Layout pass**: Boxes only, no content
2. **Content pass**: Add text, rough diagrams
3. **Visual pass**: Polish diagrams, consistent styling
4. **Review pass**: Zoom out, check from distance
5. **Export**: File → Download → PDF or PNG

## Exporting Images for Submission

Per plan.md, submit to:

- `ポスター提出用/` — Google Slides file
- `ポスター用画像提出用/` — High-res images used
- `プロフィール画像提出用/` — Profile icon (10cm circle)

For high-res image export:

- File → Download → PNG (current slide)
- Or use screenshot tool at high zoom

## Tools

- **Mermaid live editor**: https://mermaid.live/
- **Carbon (code screenshots)**: https://carbon.now.sh/
- **Excalidraw (diagrams)**: https://excalidraw.com/
- **draw.io**: https://app.diagrams.net/
