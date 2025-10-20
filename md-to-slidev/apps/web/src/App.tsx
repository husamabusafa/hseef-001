import { useState, useEffect, useRef } from 'react'

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

Type your Markdown in the left panel and watch it update **automatically** in real-time!
`

export default function App() {
  const [md, setMd] = useState(DEFAULT_MD)
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState<null | boolean>(null)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(1)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const updateSlides = async (markdown: string) => {
    setBusy(true)
    setOk(null)
    try {
      const resp = await fetch('http://localhost:4001/set-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: markdown,
      })
      const data = await resp.json()
      setOk(Boolean(data.ok))
      
      // Clear success message after 2 seconds
      setTimeout(() => setOk(null), 2000)
    } catch (error) {
      console.error('Failed to update slides:', error)
      setOk(false)
    } finally {
      setBusy(false)
    }
  }

  // Debounced auto-update effect
  useEffect(() => {
    if (!autoUpdate) return

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for 300ms after user stops typing (near-instant)
    debounceTimerRef.current = setTimeout(() => {
      updateSlides(md)
    }, 50)

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [md, autoUpdate])

  const handleManualUpdate = () => {
    updateSlides(md)
  }

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => Math.max(1, prev - 1))
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => prev + 1)
  }

  const goToSlide = (slideNum: number) => {
    setCurrentSlide(Math.max(1, slideNum))
  }

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in textarea or input
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return
      }
      
      if (e.key === 'ArrowLeft') {
        goToPreviousSlide()
      } else if (e.key === 'ArrowRight') {
        goToNextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>
          Markdown → Slidev
        </h1>
        
        {/* Auto-update toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={autoUpdate}
            onChange={(e) => setAutoUpdate(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Auto-update {autoUpdate && '(1.5s delay)'}</span>
        </label>

        <button
          onClick={handleManualUpdate}
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
          {busy ? 'Updating…' : 'Update Now'}
        </button>
        <span style={{ fontSize: 14, minWidth: 100 }}>
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

        {/* Slidev iframe with navigation */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #ddd',
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* Navigation controls */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: 8,
              backgroundColor: '#fafafa',
              borderBottom: '1px solid #eee',
              alignItems: 'center',
            }}
          >
            <button
              onClick={goToPreviousSlide}
              disabled={currentSlide === 1}
              style={{
                padding: '6px 12px',
                backgroundColor: currentSlide === 1 ? '#e0e0e0' : '#007aff',
                color: currentSlide === 1 ? '#999' : 'white',
                border: 'none',
                borderRadius: 4,
                cursor: currentSlide === 1 ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              ← Previous
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>Slide:</span>
              <input
                type="number"
                min="1"
                value={currentSlide}
                onChange={(e) => goToSlide(parseInt(e.target.value) || 1)}
                style={{
                  width: 60,
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 14,
                }}
              />
            </div>

            <button
              onClick={goToNextSlide}
              style={{
                padding: '6px 12px',
                backgroundColor: '#007aff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Next →
            </button>
          </div>

          {/* Slidev dev server runs on :3030 by default */}
          <iframe
            key={currentSlide}
            title="Slidev Preview"
            src={`http://localhost:3030/${currentSlide}`}
            style={{
              width: '100%',
              height: 'calc(100vh - 128px)',
              border: '0',
            }}
          />
        </div>
      </div>
    </div>
  )
}
