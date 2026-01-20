# Action Plan: Poster Submission

Deadline: **2026-01-26** (6 days from Jan 20)

## Deliverables

- [ ] Poster (Google Slides)
- [ ] High-res images for poster
- [ ] Profile icon (high-res, 10cm circle)

## Phase 1: Content Prep (Jan 20-22)

- [ ] Review `vite-plugin-react-use-cache` implementation
- [ ] Extract key code snippets for each API:
  - [ ] `renderToReadableStream` / `createFromReadableStream`
  - [ ] `encodeReply` / `decodeReply`
  - [ ] `createTemporaryReferenceSet`
- [ ] Draft text content for each section

## Phase 2: Visuals (Jan 22-24)

- [ ] Create diagrams:
  - [ ] RSC serialization flow
  - [ ] Two worlds (client/server bundler maps)
  - [ ] Donut pattern (static shell + dynamic children)
- [ ] Prepare code snippet images (syntax highlighted)

## Phase 3: Poster Assembly (Jan 24-25)

- [ ] Copy template to own Google Slides
- [ ] Layout three API columns
- [ ] Add title, hook, diagrams
- [ ] Add profile section (name, bio)
- [ ] Review and polish

## Phase 4: Submit (Jan 25-26)

- [ ] Export high-res images from poster
- [ ] Prepare profile icon
- [ ] Upload to Drive:
  - `ポスター提出用/`
  - `ポスター用画像提出用/`
  - `プロフィール画像提出用/`

## Poster Structure (Option 1: API-Focused)

```
┌─────────────────────────────────────────────────┐
│ Title: フレームワーク非依存な"use cache"の       │
│        仕組みとViteでの実装                      │
│ Hook: Next.jsの機能に見えて、実はReactの機能     │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │   RSC    │ │  Server  │ │Temporary │         │
│ │Serialize │ │ Function │ │Reference │         │
│ │          │ │ Encoding │ │          │         │
│ │ render/  │ │ encode/  │ │ create   │         │
│ │ create   │ │ decode   │ │TempRef   │         │
│ │From      │ │Reply     │ │Set       │         │
│ │Stream    │ │          │ │          │         │
│ │[diagram] │ │[diagram] │ │[diagram] │         │
│ │[code]    │ │[code]    │ │[code]    │         │
│ └──────────┘ └──────────┘ └──────────┘         │
├─────────────────────────────────────────────────┤
│ Vite implementation: vite-plugin-react-use-cache│
│ QR: repo link                                   │
├───────────────────┬─────────────────────────────┤
│ Profile           │                             │
│ [icon] 小川浩志   │                             │
│ bio               │                             │
└───────────────────┴─────────────────────────────┘
```

## Resources

- Template: https://docs.google.com/presentation/d/12KWNYf9Mp0mtgc0oTRsNVnpUkWw0kSU97eWCZgQD4YE/
- Submit: https://drive.google.com/drive/folders/1jKkk87P61rTnkU8fG4iXxRVGT7YhoAre
- Code: https://github.com/anthropics/vite-plugin-react-use-cache
- Detailed content plan: `plan-use-cache.md`
