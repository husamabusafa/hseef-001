# HSAFA Agent Schemas for Slidev Markdown Editor

These are the Zod schemas to configure in your HSAFA Agent Studio panel for the Slidev assistant tools.

## Tool 1: Read All Slides

**Tool Name:** `readAllSlides`

**Description:** Returns the complete markdown content of all slides including frontmatter, slide content, and metadata.

**Schema:**
```typescript
z.object({})
```

**Returns:**
- `success`: boolean - Operation success status
- `markdown`: string - Complete markdown content
- `slideCount`: number - Total number of slides
- `lineCount`: number - Total number of lines
- `message`: string - Success message

**Example Usage:**
```
User: "Show me all the slides"
Agent: Uses readAllSlides() to retrieve the complete markdown
```

---

## Tool 2: Insert Text

**Tool Name:** `insertText`

**Description:** Inserts text at a specific line and character position. **All positions are 0-indexed** (lines and characters both start from 0).

**Schema:**
```typescript
z.object({
  line: z.number().describe('Line number (0-indexed)'),
  character: z.number().describe('Character position (0-indexed)'),
  text: z.string().describe('Text to insert')
}).describe('Insert text at a specific position. Lines and characters are 0-indexed.')
```

**Returns:**
- `success`: boolean - Operation success status
- `operation`: string - Always 'insert'
- `line`: number - Line where text was inserted
- `character`: number - Character position where text was inserted
- `previousLength`: number - Length before insert
- `newLength`: number - Length after insert
- `changeCount`: number - Number of characters added
- `message`: string - Success/error message
- `preview`: string - Preview of the updated markdown (first 150 chars)

**Example Usage:**
```json
{
  "line": 10,
  "character": 0,
  "text": "import { useState } from 'react';\n"
}
```

---

## Tool 3: Delete Text

**Tool Name:** `deleteText`

**Description:** Deletes text from a start position to an end position. Can delete within a single line or across multiple lines. **All positions are 0-indexed**.

**Schema:**
```typescript
z.object({
  startLine: z.number().describe('Start line number (0-indexed)'),
  startCharacter: z.number().describe('Start character position (0-indexed)'),
  endLine: z.number().describe('End line number (0-indexed)'),
  endCharacter: z.number().describe('End character position (0-indexed)')
}).describe('Delete text from start to end position. Lines and characters are 0-indexed.')
```

**Returns:**
- `success`: boolean - Operation success status
- `operation`: string - Always 'delete'
- `startLine`: number - Start line of deletion
- `startCharacter`: number - Start character position
- `endLine`: number - End line of deletion
- `endCharacter`: number - End character position
- `previousLength`: number - Length before deletion
- `newLength`: number - Length after deletion
- `changeCount`: number - Number of characters removed
- `message`: string - Success/error message
- `preview`: string - Preview of the updated markdown (first 150 chars)

**Example Usage:**
```json
{
  "startLine": 42,
  "startCharacter": 0,
  "endLine": 44,
  "endCharacter": 0
}
```

---

## Tool 4: Replace Text

**Tool Name:** `replaceText`

**Description:** Replaces text from a start position to an end position with new text. More efficient than delete + insert. **All positions are 0-indexed**.

**Schema:**
```typescript
z.object({
  startLine: z.number().describe('Start line number (0-indexed)'),
  startCharacter: z.number().describe('Start character position (0-indexed)'),
  endLine: z.number().describe('End line number (0-indexed)'),
  endCharacter: z.number().describe('End character position (0-indexed)'),
  replacement: z.string().describe('Text to replace with')
}).describe('Replace text from start to end position with new text. Lines and characters are 0-indexed.')
```

**Returns:**
- `success`: boolean - Operation success status
- `operation`: string - Always 'replace'
- `startLine`: number - Start line of replacement
- `startCharacter`: number - Start character position
- `endLine`: number - End line of replacement
- `endCharacter`: number - End character position
- `previousLength`: number - Length before replacement
- `newLength`: number - Length after replacement
- `changeCount`: number - Net characters changed
- `message`: string - Success/error message
- `preview`: string - Preview of the updated markdown (first 150 chars)

**Example Usage:**
```json
{
  "startLine": 46,
  "startCharacter": 0,
  "endLine": 64,
  "endCharacter": 0,
  "replacement": "export function Login() { /* ... */ }"
}
```

---

## Operation Examples

### 1. Insert at Beginning of Line
Insert "# " at the start of line 9 (0-indexed):
```json
{
  "line": 9,
  "character": 0,
  "text": "# "
}
```

### 2. Insert in Middle of Line
Insert " (updated)" at character 50 of line 14 (0-indexed):
```json
{
  "line": 14,
  "character": 50,
  "text": " (updated)"
}
```

### 3. Insert New Slide
Insert a new slide separator and content at line 19:
```json
{
  "line": 19,
  "character": 0,
  "text": "\n---\n\n## New Slide\n\nContent here\n"
}
```

### 4. Delete Single Line Content
Delete characters 5-20 on line 7 (0-indexed):
```json
{
  "startLine": 7,
  "startCharacter": 5,
  "endLine": 7,
  "endCharacter": 20
}
```

### 5. Delete Multiple Lines
Delete from line 9 to line 14 (0-indexed):
```json
{
  "startLine": 9,
  "startCharacter": 0,
  "endLine": 14,
  "endCharacter": 0
}
```

### 6. Replace Text on Single Line
Replace "Hello" with "Hi" at line 4 character 10-15 (0-indexed):
```json
{
  "startLine": 4,
  "startCharacter": 10,
  "endLine": 4,
  "endCharacter": 15,
  "replacement": "Hi"
}
```

### 7. Replace Multiple Lines
Replace lines 46-64 with a single line:
```json
{
  "startLine": 46,
  "startCharacter": 0,
  "endLine": 64,
  "endCharacter": 0,
  "replacement": "export function Login() { /* ... */ }"
}
```

---

## Example Agent Instructions

You can add these instructions to your HSAFA agent:

```
You are a helpful Slidev presentation assistant. You have access to four tools:

1. **readAllSlides**: Retrieve and view the current markdown content
2. **insertText**: Insert text at a specific position
3. **deleteText**: Delete text from start to end position
4. **replaceText**: Replace text from start to end with new content

Character-Level Editing:
- **All positions are 0-indexed** (lines and characters both start from 0)
- The first line is line 0, the first character is character 0
- Make one operation per tool call

Tools:
- **insertText**: Add text at a specific line and character position
- **deleteText**: Remove text by specifying start and end positions
- **replaceText**: Replace text from start to end (more efficient than delete + insert)

Slides are separated by "---" markers. When editing:
- To add content: Use insertText with line and character position
- To remove content: Use deleteText with start and end positions
- To modify content: Use replaceText with start, end, and replacement text
- Make multiple tool calls for multiple edits

Always read the slides first before making edits to understand the current structure.
Be precise with line and character positions. Remember: everything is 0-indexed!
```

---

## Markdown Structure

Slides follow this structure:

```markdown
---
theme: default
transition: slide-left
title: Presentation Title
---

# First Slide

Content here

---

## Second Slide

More content

---

...
```

- **Frontmatter**: Lines 0-6 (between first two `---`)
- **Slides**: Separated by `---` markers
- **Line numbers**: 0-indexed (starts at 0)
- **Character positions**: 0-indexed (starts at 0)

---

## Copy These to HSAFA Panel

### Tool 1: readAllSlides
```
z.object({})
```

### Tool 2: insertText
```
z.object({
  line: z.number(),
  character: z.number(),
  text: z.string()
})
```

### Tool 3: deleteText
```
z.object({
  startLine: z.number(),
  startCharacter: z.number(),
  endLine: z.number(),
  endCharacter: z.number()
})
```

### Tool 4: replaceText
```
z.object({
  startLine: z.number(),
  startCharacter: z.number(),
  endLine: z.number(),
  endCharacter: z.number(),
  replacement: z.string()
})
```
