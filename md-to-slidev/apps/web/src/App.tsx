import React, { useState } from 'react'

const DEFAULT_MD = `---
theme: default
transition: slide-left
title: Live from React
---

# Welcome

This deck is powered by **Slidev**, updated from a React textarea.

---

## Code Sample

\`\`\`ts
const greet = (name: string) => \`Hi \${name}!\`
console.log(greet('Slidev'))
\`\`\`

---

## Two-column layout

Content here with standard Markdown features:

- Lists
- **Bold** and *italic*
- [Links](https://sli.dev)
- Tables

---

## Next steps

- Try another theme (e.g., \`theme: seriph\`)
- Add components
- Export later with \`slidev export\`

---

# 🎉 Start Editing!

Type your Markdown in the left panel and click **Update Slides** to see changes.
`

export default function App() {
  const [md, setMd] = useState(DEFAULT_MD)
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState<null | boolean>(null)

  const updateSlides = async () => {
    setBusy(true)
    setOk(null)
    try {
      const resp = await fetch('http://localhost:4001/set-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: md,
      })
      const data = await resp.json()
      setOk(Boolean(data.ok))
    } catch (error) {
      console.error('Failed to update slides:', error)
      setOk(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100vh' }}>
      {/* Header */}
      <div
        style={{
          padding: 12,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          backgroundColor: '#fafafa',
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 600, marginRight: 'auto' }}>
          Markdown → Slidev
        </h1>
        <button
          onClick={updateSlides}
          disabled={busy}
          style={{
            padding: '8px 16px',
            backgroundColor: busy ? '#ccc' : '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {busy ? 'Updating…' : 'Update Slides'}
        </button>
        <span style={{ fontSize: 14 }}>
          {ok === true ? '✅ Updated' : ok === false ? '❌ Failed' : ''}
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 1fr) 2fr',
          gap: 12,
          padding: 12,
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* Markdown editor */}
        <textarea
          style={{
            width: '100%',
            height: 'calc(100vh - 72px)',
            padding: 12,
            fontSize: 14,
            lineHeight: 1.5,
            border: '1px solid #ddd',
            borderRadius: 8,
            resize: 'none',
            backgroundColor: 'white',
          }}
          value={md}
          onChange={(e) => setMd(e.target.value)}
          spellCheck={false}
          placeholder="Type your Markdown here..."
        />

        {/* Slidev iframe */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* Slidev dev server runs on :3030 by default */}
          <iframe
            title="Slidev Preview"
            src="http://localhost:3030"
            style={{
              width: '100%',
              height: 'calc(100vh - 72px)',
              border: '0',
            }}
          />
        </div>
      </div>
    </div>
  )
}
