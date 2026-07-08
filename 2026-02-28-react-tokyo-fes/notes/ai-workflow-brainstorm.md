# AI/LLM-Assisted Poster Building Workflow

Brainstorm on effective workflows for AI-assisted visual content creation.

## The Core Problem

| Phase                   | AI Leverage | Why                                       |
| ----------------------- | ----------- | ----------------------------------------- |
| Content/text (markdown) | High        | AI reads/writes text natively             |
| Visual/spatial (Slides) | Near zero   | AI can't see, can't act, hard to describe |

The moment you go text → visual, you lose AI as a collaborator.

## What AI is Good At

- Generating/editing text, code, structured content
- Reasoning about structure and flow
- Suggesting alternatives
- Following patterns
- Reviewing against criteria (if it can "see")

## What AI Cannot Do (Today)

- See your layout
- Understand "this box feels too big"
- Directly move elements in GUI
- Judge visual balance from description

## First-Principles Workflow Ideas

### 1. Maximize text phase duration

Stay in markdown/text as long as possible:

- Full content draft
- Code examples finalized
- ASCII diagrams for layout
- Even pseudo-specs for visual structure

Only move to Slides when content is ~90% locked.

### 2. Create AI-readable intermediate artifacts

Things AI can reason about that approximate visuals:

- ASCII box diagrams
- Mermaid/PlantUML for flow diagrams
- Structured specs: "Section A: 40% width, contains X, Y, Z"
- SVG code (AI can generate/edit this)

### 3. Use text→visual tools where possible

- **Mermaid** → diagram images
- **Slidev** → markdown to slides (limited for poster)
- **HTML/CSS prototype** → AI can iterate, screenshot to check
- **Excalidraw** → has some text-based format

### 4. Screenshot feedback loop

Once in Slides:

- Screenshot → share with AI → get feedback
- AI can critique but not act
- You become the "hands"

### 5. Modular assembly

- Generate pieces in AI-friendly format (SVG diagrams, code block images)
- Final assembly in Slides is just positioning
- Minimize creative decisions in the "blind" phase

## Hypothetical Ideal Workflow

```
[1. Content Draft]     ← AI heavy (markdown, iterate fast)
        ↓
[2. Structure Spec]    ← AI helps (ASCII layout, section sizes)
        ↓
[3. Component Gen]     ← AI generates (diagrams as Mermaid/SVG, code screenshots)
        ↓
[4. Assembly]          ← Human only (Slides, positioning)
        ↓
[5. Review]            ← AI helps (screenshot → critique → human fixes)
```

## Observations from This Project

- Starting with `draft-v2.md` was effective for content iteration
- ASCII diagrams in markdown helped communicate structure
- Gap: jumped from markdown directly to Slides, skipping structure spec phase
- In Slides: AI assistance limited to answering "how do I do X" questions

## Future Improvements to Try

- Before Slides: write explicit layout spec (section dimensions, positioning, connections)
- Generate more components as images/SVG before assembly
- Use screenshot → AI feedback loop more actively during visual phase
- Consider Figma or tools with better text-based interchange formats
