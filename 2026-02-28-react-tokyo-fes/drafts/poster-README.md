# Poster Draft Instructions

## Current State

- Draft is in **English** (easier to iterate on content)
- Translation to Japanese will be the final step
- Note: Japanese text may require layout adjustments (font size, line breaks)

## Viewing the Draft

1. Open `poster-draft.html` in your browser
2. It's sized for A0 (841mm × 1189mm) portrait

## Printing to PDF

### Chrome/Edge
1. Open the HTML file
2. Press `Cmd/Ctrl + P`
3. Settings:
   - Destination: Save as PDF
   - Paper size: A0 or Custom (841 x 1189 mm)
   - Margins: None
   - Scale: 100%
4. Save

### Firefox
1. Open the HTML file
2. Press `Cmd/Ctrl + P`
3. Settings:
   - Custom paper size: 841mm × 1189mm
   - Margins: None
4. Save

## Editing

The HTML file is fully editable:
- Change colors in the `<style>` section
- Modify text content in the `<body>`
- Add images: `<img src="diagram.png" style="width: 100%;">`
- Adjust font sizes (currently optimized for 2m viewing distance)

## Current Structure

```
┌─────────────────────────────────────┐
│  Title + Subtitle + Author          │
├─────────────────────────────────────┤
│  Hook (問題提起)                     │
├───────────┬───────────┬─────────────┤
│  Column 1 │ Column 2  │  Column 3   │
│  Problem  │ Approach  │  Results    │
│  + React  │ + Diagram │  + Next.js  │
│  basics   │           │  + Vite impl│
├───────────┴───────────┴─────────────┤
│  Key Takeaways + QR Code            │
└─────────────────────────────────────┘
```

## Next Steps

1. Replace placeholder text with actual content
2. Add real diagrams (can use Mermaid, Excalidraw, or any image)
3. Generate QR code linking to your repo
4. Test print on smaller size first (A4 scaled down)
5. Print final A0 at print shop

## Tool Alternatives

If HTML isn't working for you:
- **PowerPoint**: Custom size → 84.1cm × 118.9cm
- **Figma**: Frame size → 8410 × 11890 px (at 10px/mm)
- **Canva**: Search "A0 poster template"
