import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(bodyParser.text({ type: '*/*', limit: '2mb' }))

// Path to your Slidev entry file
const slidevPath = path.resolve(__dirname, '../apps/deck/slides.md')

// Simple input guard
function normalize(md: string): string {
  // Ensure at least one slide to prevent empty file edge cases
  return md?.trim() ? md : '# Empty deck\n\nType some **Markdown**.'
}

app.post('/set-markdown', async (req, res) => {
  try {
    const md = normalize(req.body || '')
    await fs.promises.writeFile(slidevPath, md, 'utf8')
    // Slidev dev server watches slides.md and will hot-reload automatically
    console.log('✅ Updated slides.md')
    res.json({ ok: true })
  } catch (e: any) {
    console.error('❌ Failed to write slides.md:', e.message)
    res.status(500).json({ ok: false, error: e?.message || 'write failed' })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, slidevPath })
})

const port = 4001
app.listen(port, () => {
  console.log(`🚀 API listening on http://localhost:${port}`)
  console.log(`📝 Writing to: ${slidevPath}`)
})
