import { useState, useEffect, useRef } from 'react'
import { HsafaProvider, HsafaChat, ContentContainer } from '@hsafa/ui-sdk'
import { z } from 'zod'

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

// ==================== ZOD SCHEMAS FOR HSAFA TOOLS ====================

/**
 * Schema for reading all slides - no parameters needed
 */
export const ReadSlidesSchema = z.object({})

/**
 * Schema for inserting text
 */
export const InsertTextSchema = z.object({
  line: z.number().describe('Line number (0-indexed)'),
  character: z.number().describe('Character position (0-indexed)'),
  text: z.string().describe('Text to insert')
}).describe('Insert text at a specific position. Lines and characters are 0-indexed.')

/**
 * Schema for deleting text
 */
export const DeleteTextSchema = z.object({
  startLine: z.number().describe('Start line number (0-indexed)'),
  startCharacter: z.number().describe('Start character position (0-indexed)'),
  endLine: z.number().describe('End line number (0-indexed)'),
  endCharacter: z.number().describe('End character position (0-indexed)')
}).describe('Delete text from start to end position. Lines and characters are 0-indexed.')

/**
 * Schema for replacing text
 */
export const ReplaceTextSchema = z.object({
  startLine: z.number().describe('Start line number (0-indexed)'),
  startCharacter: z.number().describe('Start character position (0-indexed)'),
  endLine: z.number().describe('End line number (0-indexed)'),
  endCharacter: z.number().describe('End character position (0-indexed)'),
  replacement: z.string().describe('Text to replace with')
}).describe('Replace text from start to end position with new text. Lines and characters are 0-indexed.')

export default function App() {
  const [md, setMd] = useState(DEFAULT_MD)
  const mdRef = useRef(DEFAULT_MD) // Track latest markdown state for rapid tool calls
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState<null | boolean>(null)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(1)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    mdRef.current = md
  }, [md])

  // ==================== HSAFA TOOLS ====================
  
  /**
   * Tool 1: Read all slides - returns the complete markdown
   */
  const readAllSlides = async () => {
    // Use ref to get the LATEST markdown state
    const currentMd = mdRef.current
    return {
      success: true,
      markdown: currentMd,
      slideCount: currentMd.split('---').length - 1,
      lineCount: currentMd.split('\n').length,
      message: 'Successfully retrieved all slides markdown'
    }
  }

  /**
   * Tool 2: Insert text at a specific position
   */
  const insertText = async (params: z.infer<typeof InsertTextSchema>) => {
    try {
      const currentMd = mdRef.current
      const previousLength = currentMd.length
      let lines = currentMd.split('\n')
      
      const lineIndex = params.line
      
      // Ensure line exists
      while (lineIndex >= lines.length) {
        lines.push('')
      }
      
      const currentLine = lines[lineIndex] || ''
      const charIndex = Math.min(params.character, currentLine.length)
      lines[lineIndex] = currentLine.slice(0, charIndex) + params.text + currentLine.slice(charIndex)
      
      const newMd = lines.join('\n')
      const newLength = newMd.length
      const resultPreview = newMd.substring(0, 150) + (newMd.length > 150 ? '...' : '')
      
      // Update both state and ref
      mdRef.current = newMd
      setMd(newMd)
      
      return {
        success: true,
        operation: 'insert',
        line: params.line,
        character: params.character,
        previousLength,
        newLength,
        changeCount: Math.abs(newLength - previousLength),
        message: `Successfully inserted text at line ${params.line}:${params.character}`,
        preview: resultPreview
      }
      
    } catch (error) {
      return {
        success: false,
        operation: 'insert',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to insert text'
      }
    }
  }

  /**
   * Tool 3: Delete text from start to end position
   */
  const deleteText = async (params: z.infer<typeof DeleteTextSchema>) => {
    try {
      const currentMd = mdRef.current
      const previousLength = currentMd.length
      let lines = currentMd.split('\n')
      
      const startLineIndex = params.startLine
      const endLineIndex = params.endLine
      
      if (startLineIndex >= lines.length || endLineIndex >= lines.length) {
        throw new Error(`Line range ${startLineIndex}-${endLineIndex} out of bounds`)
      }
      
      if (startLineIndex === endLineIndex) {
        // Delete within same line
        const line = lines[startLineIndex] || ''
        const startChar = Math.min(params.startCharacter, line.length)
        const endChar = Math.min(params.endCharacter, line.length)
        lines[startLineIndex] = line.slice(0, startChar) + line.slice(endChar)
      } else {
        // Delete across multiple lines
        const startLine = lines[startLineIndex] || ''
        const endLine = lines[endLineIndex] || ''
        const startChar = Math.min(params.startCharacter, startLine.length)
        const endChar = Math.min(params.endCharacter, endLine.length)
        
        lines[startLineIndex] = startLine.slice(0, startChar) + endLine.slice(endChar)
        lines.splice(startLineIndex + 1, endLineIndex - startLineIndex)
      }
      
      const newMd = lines.join('\n')
      const newLength = newMd.length
      const resultPreview = newMd.substring(0, 150) + (newMd.length > 150 ? '...' : '')
      
      // Update both state and ref
      mdRef.current = newMd
      setMd(newMd)
      
      return {
        success: true,
        operation: 'delete',
        startLine: params.startLine,
        startCharacter: params.startCharacter,
        endLine: params.endLine,
        endCharacter: params.endCharacter,
        previousLength,
        newLength,
        changeCount: Math.abs(newLength - previousLength),
        message: `Successfully deleted text from line ${params.startLine}:${params.startCharacter} to ${params.endLine}:${params.endCharacter}`,
        preview: resultPreview
      }
      
    } catch (error) {
      return {
        success: false,
        operation: 'delete',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to delete text'
      }
    }
  }

  /**
   * Tool 4: Replace text from start to end position
   */
  const replaceText = async (params: z.infer<typeof ReplaceTextSchema>) => {
    try {
      const currentMd = mdRef.current
      const previousLength = currentMd.length
      let lines = currentMd.split('\n')
      
      const startLineIndex = params.startLine
      const endLineIndex = params.endLine
      
      if (startLineIndex >= lines.length || endLineIndex >= lines.length) {
        throw new Error(`Line range ${startLineIndex}-${endLineIndex} out of bounds`)
      }
      
      if (startLineIndex === endLineIndex) {
        // Replace within same line
        const line = lines[startLineIndex] || ''
        const startChar = Math.min(params.startCharacter, line.length)
        const endChar = Math.min(params.endCharacter, line.length)
        lines[startLineIndex] = line.slice(0, startChar) + params.replacement + line.slice(endChar)
      } else {
        // Replace across multiple lines
        const startLine = lines[startLineIndex] || ''
        const endLine = lines[endLineIndex] || ''
        const startChar = Math.min(params.startCharacter, startLine.length)
        const endChar = Math.min(params.endCharacter, endLine.length)
        
        lines[startLineIndex] = startLine.slice(0, startChar) + params.replacement + endLine.slice(endChar)
        lines.splice(startLineIndex + 1, endLineIndex - startLineIndex)
      }
      
      const newMd = lines.join('\n')
      const newLength = newMd.length
      const resultPreview = newMd.substring(0, 150) + (newMd.length > 150 ? '...' : '')
      
      // Update both state and ref
      mdRef.current = newMd
      setMd(newMd)
      
      return {
        success: true,
        operation: 'replace',
        startLine: params.startLine,
        startCharacter: params.startCharacter,
        endLine: params.endLine,
        endCharacter: params.endCharacter,
        previousLength,
        newLength,
        changeCount: Math.abs(newLength - previousLength),
        message: `Successfully replaced text from line ${params.startLine}:${params.startCharacter} to ${params.endLine}:${params.endCharacter}`,
        preview: resultPreview
      }
      
    } catch (error) {
      return {
        success: false,
        operation: 'replace',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to replace text'
      }
    }
  }

  // HSAFA Tools configuration
  const hsafaTools = {
    readAllSlides,
    insertText: {
      tool: insertText,
      executeEachToken: true
    },
    deleteText: {
      tool: deleteText,
      executeEachToken: false
    },
    replaceText: {
      tool: replaceText,
      executeEachToken: false
    }
  }

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
    <HsafaProvider baseUrl="http://localhost:3900">
      <ContentContainer>
      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: 'calc(100vh - 34px)' }}>
      {/* Header */}
      <div
        style={{
          padding: 12,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          borderBottom: '1px solid #1a1a1a',
          backgroundColor: '#121212',
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f0' }}>
          Markdown → Slidev
        </h1>
        
        {/* Auto-update toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginLeft: 'auto', color: '#f0f0f0' }}>
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
            backgroundColor: busy ? '#1a1a1a' : '#007aff',
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
        <span style={{ fontSize: 14, minWidth: 100, color: '#f0f0f0' }}>
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
          backgroundColor: '#0a0a0a',
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
            border: '1px solid #1a1a1a',
            borderRadius: 8,
            resize: 'none',
            backgroundColor: '#121212',
            color: '#f0f0f0',
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
            border: '1px solid #1a1a1a',
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#121212',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* Navigation controls */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: 8,
              backgroundColor: '#121212',
              borderBottom: '1px solid #1a1a1a',
              alignItems: 'center',
            }}
          >
            <button
              onClick={goToPreviousSlide}
              disabled={currentSlide === 1}
              style={{
                padding: '6px 12px',
                backgroundColor: currentSlide === 1 ? '#1a1a1a' : '#007aff',
                color: currentSlide === 1 ? '#555' : 'white',
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
              <span style={{ fontSize: 14, color: '#f0f0f0' }}>Slide:</span>
              <input
                type="number"
                min="1"
                value={currentSlide}
                onChange={(e) => goToSlide(parseInt(e.target.value) || 1)}
                style={{
                  width: 60,
                  padding: '4px 8px',
                  border: '1px solid #1a1a1a',
                  borderRadius: 4,
                  fontSize: 14,
                  backgroundColor: '#121212',
                  color: '#f0f0f0',
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
</ContentContainer>
    {/* HSAFA AI Chat Assistant */}
    <HsafaChat
      agentId="cmgzhozc90007qgnmgdvrvsk8"
      theme="dark"
      title="Slidev AI Assistant"
      placeholder="Ask me to edit your slides..."
      HsafaTools={hsafaTools}
      defaultOpen={false}
      width={450}
      floatingButtonPosition={{ bottom: '20px', right: '20px' }}
    />
  </HsafaProvider>
  )
}
