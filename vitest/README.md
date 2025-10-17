# Inside Vitest: Test Framework Architecture Deep Dive

Vue Fes Japan 2025 - https://vuefes.jp/2025

## About

This talk explores what makes Vitest architecturally unique, including how it leverages Vite's broad framework ecosystem and plugin capabilities, its runtime agnostic architecture that enables running the same tests across Node.js, browsers, and edge environments, and the implementation of core testing features like mocking, coverage, and parallel execution systems.

## Setup

Install dependencies:

```bash
npm install
```

## Usage

### Development Mode

Start the slides in development mode with hot reload:

```bash
npm run dev
```

Then open http://localhost:3030 in your browser.

### Build

Build the slides for production:

```bash
npm run build
```

The built files will be in the `dist` folder.

### Export

Export slides to PDF:

```bash
npm run export
```

## Resources

- [Slidev Documentation](https://sli.dev/)
- [Vitest Documentation](https://vitest.dev)
- [Vite Documentation](https://vitejs.dev)

## Notes

Additional planning and reference materials:
- `plan.md` - Talk structure and timeline
- `note.md` - Research notes and misc topics
- `references.md` - Reference talks and resources
- `title.md` - Talk title and description
