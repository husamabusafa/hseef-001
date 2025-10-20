# Setup Instructions

## Quick Start

Follow these steps to get the Markdown-to-Slidev app running:

### 1. Install root dependencies

```bash
cd /Users/Husam/Dev/hseef-001/md-to-slidev
npm install
```

### 2. Install Slidev deck dependencies

```bash
cd apps/deck
npm install
cd ../..
```

### 3. Install React web app dependencies

```bash
cd apps/web
npm install
cd ../..
```

### 4. Install API server dependencies

```bash
cd server
npm install
cd ../..
```

### 5. Run everything

From the root directory:

```bash
npm run dev
```

This will start all three services in parallel:
- **Slidev deck**: http://localhost:3030
- **React web app**: http://localhost:5173
- **API server**: http://localhost:4001

### 6. Open the app

Visit http://localhost:5173 in your browser to see the React app with the embedded Slidev presentation.

## How to Use

1. Type or paste Markdown in the textarea on the left
2. Click the "Update Slides" button
3. The API writes to `apps/deck/slides.md`
4. Slidev hot-reloads automatically
5. The iframe on the right updates instantly

## Markdown Format

- Use `---` to separate slides
- Add frontmatter at the top for configuration:

```yaml
---
theme: default
transition: slide-left
title: My Presentation
---
```

- All standard Markdown syntax is supported
- Code blocks with syntax highlighting work
- Lists, tables, bold, italic, links, etc.

## Available Themes

Try these themes in your frontmatter:
- `default`
- `seriph`
- `apple-basic`
- `bricks`
- `shibainu`

## Exporting

To export your presentation to PDF:

```bash
cd apps/deck
npm run export
```

## Troubleshooting

- **Port conflicts**: If ports are in use, stop other services or modify ports in the code
- **CORS errors**: The API server has CORS enabled for local development
- **Slidev not loading**: Ensure `npm install` was run in `apps/deck`
- **React app blank**: Check browser console for errors

## Production Build

To build for production:

```bash
# Build Slidev
cd apps/deck
npm run build

# Build React app
cd ../web
npm run build
```

The built files will be in respective `dist/` directories.
