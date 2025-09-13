# Speaker Notes Formatting Guide

## How to Add Line Breaks and Formatting to Your Speaker Notes

You can format your speaker notes in `presentation-data.json` using HTML tags. Here are the different options:

### 1. Simple Line Breaks
Use `<br>` for single line breaks and `<br><br>` for paragraph breaks:

```json
"opening": "First point.<br>Second point.<br><br>New paragraph with more space."
```

### 2. Bullet Points
Use HTML entities and line breaks:

```json
"keyPoints": "Main points to cover:<br>• First bullet point<br>• Second bullet point<br>• Third bullet point"
```

### 3. Numbered Lists
Use numbers with line breaks:

```json
"focus": "Step-by-step process:<br>1. First step<br>2. Second step<br>3. Third step"
```

### 4. Emphasis and Highlighting
Use `<strong>` for bold text:

```json
"emphasize": "Important point: <strong>This is critical</strong><br>Don't forget to mention this!"
```

### 5. Multiple Paragraphs
Use `<br><br>` for paragraph spacing:

```json
"analogy": "Think of Web Components like building blocks.<br><br>Each block is self-contained but works with others to create something bigger."
```

### 6. Complex Formatting
Combine multiple elements:

```json
"interaction": "Ask the audience:<br>• 'How many of you use React?'<br>• 'What about Vue or Angular?'<br><br><strong>Then reveal:</strong> We're not using any of these!"
```

## Available Speaker Notes Fields

You can add formatting to any of these fields:
- `opening` - Opening hook for the slide
- `focus` - Main focus points
- `keyPoints` - Key points to cover
- `keyPoint` - Single key point
- `emphasize` - What to emphasize
- `analogy` - Analogies to use
- `question` - Questions to ask
- `example` - Examples to give
- `interaction` - Audience interaction
- `fallback` - Fallback plans
- `closing` - Closing remarks
- `futureVision` - Future vision
- `timing` - Timing information
- `highlight` - Things to highlight

## Testing Your Formatting

1. Save your changes to `presentation-data.json`
2. Open the presentation: `http://localhost:8000/presentation.html`
3. Open speaker notes: Press `Ctrl+0` (or `Cmd+0` on Mac)
4. Navigate between slides to see your formatted notes

## HTML Tags You Can Use

- `<br>` - Line break
- `<strong>` - Bold text
- `<em>` - Italic text
- `<u>` - Underlined text
- `&bull;` - Bullet point (•)
- `&mdash;` - Em dash (—)
- `&nbsp;` - Non-breaking space

## Example: Complete Slide with Formatted Notes

```json
{
  "id": "example-slide",
  "title": "Example Slide",
  "speakerNotes": {
    "opening": "Welcome to this slide!<br><br>Today we'll cover three main topics.",
    "focus": "Key areas to discuss:<br>• First topic<br>• Second topic<br>• Third topic",
    "keyPoints": "Important points:<br>1. This is critical<br>2. This is also important<br>3. Don't forget this!",
    "emphasize": "<strong>Remember:</strong> This is the most important point<br><br>Make sure everyone understands this.",
    "interaction": "Ask the audience:<br>• 'Who has used this before?'<br>• 'Any questions so far?'",
    "timing": "Spend about 2-3 minutes on this slide<br>Allow time for questions"
  }
}
```

This will display in the speaker notes window with proper formatting, line breaks, and emphasis!
