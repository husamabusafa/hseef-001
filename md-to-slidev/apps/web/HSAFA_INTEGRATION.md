# HSAFA AI Assistant Integration - Complete Guide

## ✅ What's Been Integrated

Your Slidev markdown editor now includes HSAFA AI chat assistant with four powerful tools that allow the AI agent to read and edit your slides with character-level precision.

## 🚀 Quick Start

1. **Start your HSAFA API server** (if you have one configured)
2. **Update the agent ID** in `App.tsx`:
   ```typescript
   agentId="your-agent-id-here"  // Replace with your actual agent ID
   ```

3. **Configure tools in HSAFA Agent Studio Panel** using the schemas from `HSAFA_SCHEMAS.md`

## 🛠️ Tools Available

### 1. `readAllSlides`
Returns the complete markdown content with metadata.

**Zod Schema for HSAFA Panel:**
```typescript
z.object({})
```

### 2. `insertText`
Inserts text at a specific line and character position.

**Zod Schema for HSAFA Panel:**
```typescript
z.object({
  line: z.number(),
  character: z.number(),
  text: z.string()
})
```

### 3. `deleteText`
Deletes text from a start position to an end position.

**Zod Schema for HSAFA Panel:**
```typescript
z.object({
  startLine: z.number(),
  startCharacter: z.number(),
  endLine: z.number(),
  endCharacter: z.number()
})
```

### 4. `replaceText`
Replaces text from a start position to an end position with new text.

**Zod Schema for HSAFA Panel:**
```typescript
z.object({
  startLine: z.number(),
  startCharacter: z.number(),
  endLine: z.number(),
  endCharacter: z.number(),
  replacement: z.string()
})
```

**Note:** All positions are 0-indexed (lines and characters both start from 0).

## 📝 How It Works

1. **Agent reads slides**: Uses `readAllSlides()` to view current markdown
2. **Agent makes edits**: Uses `insertText()`, `deleteText()`, or `replaceText()` tools
3. **One operation per call**: Each tool call makes one edit
4. **UI updates automatically**: Changes reflect immediately in the editor and preview

## 🎯 Example Agent Interactions

**User:** "Add a new slide about React hooks at the end"
```
Agent → readAllSlides() to see current content and count lines
Agent → insertText({
  line: 49,
  character: 0,
  text: '\n---\n\n## React Hooks\n\n- useState\n- useEffect\n- Custom Hooks\n'
})
```

**User:** "Change 'Welcome' to 'Hello' on line 11"
```
Agent → readAllSlides() to see line 11 content (0-indexed, so line 10)
Agent → replaceText({
  startLine: 10,
  startCharacter: 0,
  endLine: 10,
  endCharacter: 7,
  replacement: 'Hello'
})
```

**User:** "Delete slide 3"
```
Agent → readAllSlides() to find line numbers of slide 3
Agent → deleteText({
  startLine: 14,
  startCharacter: 0,
  endLine: 24,
  endCharacter: 0
})
```

## 🎨 Chat UI Features

- **Floating button** in bottom-right corner
- **Dark theme** for better contrast
- **450px width** chat panel
- **Collapsible** - opens on demand
- **Real-time updates** to markdown as agent edits

## ⚙️ Configuration

The chat component in `App.tsx`:
```typescript
<HsafaChat
  agentId="slidev-assistant"           // Your agent ID
  theme="dark"                         // Theme: 'dark' | 'light'
  title="Slidev AI Assistant"          // Chat header title
  placeholder="Ask me to edit your slides..."
  HsafaTools={hsafaTools}              // Tools object
  defaultOpen={false}                  // Start collapsed
  width={450}                          // Chat panel width
  floatingButtonPosition={{ bottom: '20px', right: '20px' }}
/>
```

The tools object configuration:
```typescript
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
```

## 📋 Agent Instructions Template

Copy this to your HSAFA agent instructions:

```
You are a Slidev presentation assistant with access to character-level markdown editing tools.

Tools:
- readAllSlides(): View the current markdown content
- insertText(line, character, text): Insert text at specific position
- deleteText(startLine, startCharacter, endLine, endCharacter): Delete text range
- replaceText(startLine, startCharacter, endLine, endCharacter, replacement): Replace text range

Position System:
- All positions are 0-indexed (lines and characters both start from 0)
- The first line is line 0, the first character is character 0
- Each tool call makes one edit

Slide Structure:
- Frontmatter: YAML between first two "---" markers
- Slides: Separated by "---" on its own line

Best Practices:
1. Always read slides first before editing to understand positions
2. Count line and character positions carefully (remember: 0-indexed!)
3. To add content: Use insertText tool
4. To remove content: Use deleteText tool
5. To update content: Use replaceText tool (more efficient than delete+insert)
6. For multi-line inserts: Include \n in your text string
7. Make multiple tool calls for multiple edits

Be helpful, precise, and always maintain valid markdown structure.
```

## 🔧 Troubleshooting

### Chat doesn't appear
- Check that `baseUrl` in HsafaProvider points to your HSAFA API server
- Verify agent ID is correct

### Tools not working
- Ensure tools are configured in HSAFA Agent Studio with exact schemas
- Check browser console for errors

### API connection issues
- Update `baseUrl` in HsafaProvider if your API is on different URL
- Default is `"http://localhost:3900"`

## 📚 File Structure

```
apps/web/src/
├── App.tsx                    # Main app with HSAFA integration
├── HSAFA_SCHEMAS.md          # Detailed schemas for HSAFA panel
└── HSAFA_INTEGRATION.md      # This file
```

## 🎉 Features

✅ **Read full markdown** with metadata  
✅ **Character-level precision** - edit at exact positions (0-indexed)  
✅ **Three editing tools** - insertText, deleteText, and replaceText  
✅ **One operation per call** - simple and predictable  
✅ **Multi-line support** - edit across multiple lines  
✅ **Streaming support** - insertText works with token-by-token execution  
✅ **Real-time preview** - changes appear instantly  
✅ **Auto-update** - debounced updates to Slidev  
✅ **Clean UI** - floating chat button, collapsible panel  
✅ **Type-safe** - Full TypeScript with Zod validation  

---

**Next Steps:**
1. Configure your HSAFA agent with the four tools (readAllSlides, insertText, deleteText, replaceText)
2. Test with simple commands like "show me the slides"
3. Try editing operations like "add a conclusion slide" or "change the title on line 11"
4. For updates, use replaceText (more efficient than delete+insert)
5. Remember: all positions are 0-indexed (first line is 0, first character is 0)

Enjoy your AI-powered presentation editor with character-level precision! 🚀
