# Poster Plan

Deadline: **2026-01-26**

## Deliverables

- [ ] Poster (Google Slides)
- [ ] High-res images for poster
- [ ] Profile icon (high-res, 10cm circle)

## Working Documents

| Document             | Purpose                            | Status                           |
| -------------------- | ---------------------------------- | -------------------------------- |
| `draft-v2.md`        | Main poster content flow           | **Active** - Stage 1 in progress |
| `workflow.md`        | Google Slides workflow & tips      | Reference                        |
| `react-internal.md`  | React RSC API research notes       | Reference                        |
| `diagrams.md`        | Mermaid diagram candidates         | Reference                        |
| `poster-proposal.md` | Original proposal (title/abstract) | Reference                        |
| `draft.md`           | Original draft (superseded by v2)  | Archive                          |
| `poster-plan.md`     | Old brainstorm material            | Archive                          |

## Demo Code

- `examples/starter/src/demo.tsx` - demo1-4 showing RSC/cache flows
- `examples/starter/src/use-cache-runtime.tsx` - Reference implementation

Run demos:

```bash
NODE_ENV=production pnpm -C examples/starter vite-run src/demo.tsx demo4
```

## Key Research Findings (see `react-internal.md`)

- `renderToReadableStream` / `createFromReadableStream` share `$` marker conventions with `encodeReply` / `decodeReply`
- Serialization functions are **duplicated** (not shared) between packages
- `$T` marker creates "holes" for dynamic content via `temporaryReferences` WeakMap
- Server-side placeholder is an opaque Proxy that throws on access

## Approach

**Key principle**: Start fresh. Old drafts (`poster-plan.md`, `brainstorm/`) are raw material only — not fixed structure or flow.

### Stage 1: Narrative Flow ✅ In Progress

Build content as a single markdown document (`draft-v2.md`):

- Each section = one logical chunk
- Focus on flow and story, not layout
- Easy to reorder and iterate

**Poster Layout** (decided):

- **Left side (smaller)**: PART 1 - RSC Basics
  - 1.1 RSC Rendering Flow
  - 1.2 Server Action Flow (encodeReply/decodeReply)
  - 1.3 React package structure note
- **Right side (larger)**: PART 2 - `use cache` Application
  - 2.1 First Twist: Round-trip within RSC environment
  - 2.2 Second Twist: $T marker
  - 2.3 Punch line: use cache = APIs stitched together
  - 2.4 Full round-trip diagram (5 steps)
  - Takeaway table

**Key message**: `use cache` isn't magic — it's four RSC APIs working together.

### Stage 2: Content + Visuals

Once flow is solid:

- Write actual text for each chunk
- Create diagrams where needed (see `diagrams.md` for mermaid candidates)
- Extract code snippets from demo code
- Separate **Code** blocks from **Data transformation** visuals

**Diagrams needed**:

- [ ] Basic RSC flow (diagrams.md "basic flow")
- [ ] RSC environment self-loop (diagrams.md)
- [ ] $T marker transformation
- [ ] Full 5-step round-trip (merged from 2.4 + Visual Summary)

### Stage 3: Condense to Poster

Map section to poster layout:

- Adjust for A0 density (less text, bigger visuals)
- Use Google Slides template
- Rewrite in Japanese here?

### Stage 4: Polish + Submit

- Review from distance
- Add profile section
- Export images, upload to Drive

### Stage 5: Follow up

- Deploy playable demo

# Poster Submission Details

## Deadline

- **2026-01-26** (Monday)

## Template

- https://docs.google.com/presentation/d/12KWNYf9Mp0mtgc0oTRsNVnpUkWw0kSU97eWCZgQD4YE/

## Submission Method

Submit to the shared Google Drive: https://drive.google.com/drive/folders/1jKkk87P61rTnkU8fG4iXxRVGT7YhoAre

1. **Poster (Google Slides)** → `ポスター提出用/`
2. **Images used in poster** → `ポスター用画像提出用/`
3. **Profile icon** → `プロフィール画像提出用/`

## Format & Process

- Final poster size: **A0**
- Google Slides submission is for layout/content confirmation only
- Organizers will create final Illustrator data for printing

## Profile Section (Template Page 3)

- Name & bio: Include in the Google Slides
- Icon image: Submit separately (high-res preferred, printed as 10cm circle)

## Font Size Guidelines

- 48pt ≈ 3cm height (titles)
- 24pt ≈ 1cm height (body text)
- 16pt minimum (readable from distance)
- Gothic/sans-serif recommended for visibility

## Content Capacity Estimate

A0 = 84.1cm × 118.9cm

Rough layout:

- Title/header: ~10-15cm
- Main content: ~85cm (3 columns × ~25cm wide)
- Profile/footer: ~15cm

Estimate for technical poster:

- **Slides**: 4-6 logical chunks → condense to 3 columns
- **Code blocks**: 3-4 total (5-8 lines each, 16-20pt mono)
- **Diagrams**: 2-3 (each ~15-20cm tall)
- **Text**: Bullet points, minimal prose

Compared to common monitors:

┌─────────────┬──────────────────┬─────────────────────────────────┐
│ Monitor │ Approximate Size │ A0 Comparison │
├─────────────┼──────────────────┼─────────────────────────────────┤
│ 24" monitor │ ~53cm × 30cm │ A0 is ~1.6× wider, ~4× taller │
├─────────────┼──────────────────┼─────────────────────────────────┤
│ 27" monitor │ ~60cm × 34cm │ A0 is ~1.4× wider, ~3.5× taller │
├─────────────┼──────────────────┼─────────────────────────────────┤
│ 32" monitor │ ~71cm × 40cm │ A0 is ~1.2× wider, ~3× taller │
└─────────────┴──────────────────┴─────────────────────────────────┘
