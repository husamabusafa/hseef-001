# Markdown to Slidev

A live Markdown editor that renders presentations using Slidev in real-time.

## Architecture

- **apps/deck**: Slidev presentation (runs on :3030)
- **apps/web**: React + Vite UI with editor (runs on :5173)
- **server**: Express API that writes to slides.md (runs on :4001)

## Setup

```bash
npm install
cd apps/deck && npm install && cd ../..
cd apps/web && npm install && cd ../..
cd server && npm install && cd ../..
```

## Run

```bash
npm run dev
```

Then open http://localhost:5173 to see the React app with the embedded Slidev iframe.

## How it works

1. Type Markdown in the React textarea
2. Click "Update Slides"
3. API writes to `apps/deck/slides.md`
4. Slidev dev server hot-reloads
5. iframe updates instantly

## Features

- Live Markdown editing
- Real Slidev presentations
- Hot reload on changes
- Standard Slidev themes & transitions
- Frontmatter support
