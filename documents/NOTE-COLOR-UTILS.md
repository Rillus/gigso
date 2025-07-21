# Note Color Utilities

**File:** `helpers/noteColorUtils.js`  
**Purpose:** Shared utilities for applying the note color system across components.

## Overview
The Note Color Utilities module provides a consistent interface for applying the application's note color scheme to any component. It handles color mapping, sharp/flat variations, and provides both JavaScript and CSS-based solutions.

## Core Functions

### `getBaseNote(note)`
Extracts the base note letter from any note string.

```javascript
import { getBaseNote } from './helpers/noteColorUtils.js';

getBaseNote('C4');      // Returns 'C'
getBaseNote('F#');      // Returns 'F'
getBaseNote('Bb3');     // Returns 'B'
getBaseNote('invalid'); // Returns 'C' (fallback)
```

### `isSharp(note)`, `isFlat(note)`, `isNatural(note)`
Check note type for proper styling.

```javascript
import { isSharp, isFlat, isNatural } from './helpers/noteColorUtils.js';

isSharp('F#');   // true
isFlat('Bb');    // true
isNatural('C');  // true
```

### `getNoteColor(note)`
Get the computed CSS color value for a note.

```javascript
import { getNoteColor } from './helpers/noteColorUtils.js';

getNoteColor('C');  // Returns '#E1453E' (red)
getNoteColor('G');  // Returns '#5394C7' (blue)
```

## Primary Styling Function

### `applyNoteColor(element, note, options)`
Apply complete note color styling to an HTML element.

```javascript
import { applyNoteColor } from './helpers/noteColorUtils.js';

const button = document.createElement('button');
button.textContent = 'C';

// Basic application
applyNoteColor(button, 'C');

// With options
applyNoteColor(button, 'F#', {
    useBackground: true,           // Apply color as background
    useTextColor: false,           // Don't apply as text color
    applySharpFlatStyling: true,   // Apply sharp/flat effects
    customOpacity: null            // No custom opacity
});
```

#### Options Object
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useBackground` | boolean | `true` | Apply color as background |
| `useTextColor` | boolean | `false` | Apply color as text color |
| `applySharpFlatStyling` | boolean | `true` | Add sharp/flat visual effects |
| `customOpacity` | number | `null` | Override default opacity |

## Specialized Functions

### `applyMinorNoteColor(element, note, options)`
Apply styling specifically for minor chord variations.

```javascript
import { applyMinorNoteColor } from './helpers/noteColorUtils.js';

const minorChordButton = document.createElement('button');
minorChordButton.textContent = 'Am';

applyMinorNoteColor(minorChordButton, 'A');
// Applies: base color + reduced opacity + dark text shadow
```

### `removeNoteColor(element)`
Clean up all note color styling from an element.

```javascript
import { removeNoteColor } from './helpers/noteColorUtils.js';

removeNoteColor(button);
// Removes: background, color, opacity, box-shadow, text-shadow, classes
```

## Batch Operations

### `applyNoteColorsToElements(elementNoteMap, options)`
Apply colors to multiple elements at once.

```javascript
import { applyNoteColorsToElements } from './helpers/noteColorUtils.js';

const mappings = [
    { element: button1, note: 'C' },
    { element: button2, note: 'D' },
    { element: button3, note: 'E' }
];

applyNoteColorsToElements(mappings, {
    useBackground: true,
    applySharpFlatStyling: true
});
```

### `getNoteColorMapping(notes)`
Get color information for an array of notes.

```javascript
import { getNoteColorMapping } from './helpers/noteColorUtils.js';

const notes = ['C', 'F#', 'Bb'];
const mapping = getNoteColorMapping(notes);

// Returns:
[
    {
        note: 'C',
        color: '#E1453E',
        baseNote: 'C',
        isSharp: false,
        isFlat: false,
        isNatural: true
    },
    // ... more note objects
]
```

## CSS Generation

### `generateNoteColorCSS(selector)`
Generate CSS rules for note colors.

```javascript
import { generateNoteColorCSS } from './helpers/noteColorUtils.js';

const css = generateNoteColorCSS('.my-note-button');
// Returns CSS string with color rules for all notes
```

### `getNoteClasses(note)`
Get appropriate CSS class names for a note.

```javascript
import { getNoteClasses } from './helpers/noteColorUtils.js';

getNoteClasses('F#');  // Returns ['note-f', 'note-sharp']
getNoteClasses('Bb');  // Returns ['note-b', 'note-flat']
getNoteClasses('C');   // Returns ['note-c', 'note-natural']
```

## UI Components

### `createNoteColorLegend(notes, container)`
Create a visual legend showing note colors.

```javascript
import { createNoteColorLegend } from './helpers/noteColorUtils.js';

const legendContainer = document.getElementById('legend');
const scaleNotes = ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'];

createNoteColorLegend(scaleNotes, legendContainer);
// Creates a legend with colored dots and note names
```

## Component Integration Examples

### Hand Pan Tone Fields
```javascript
// In hand-pan.js
import { applyNoteColor } from '../../helpers/noteColorUtils.js';

applyNoteColors() {
    this.toneFields.forEach((field, index) => {
        const note = this.sortedNotes[index];
        if (note && field) {
            const noteWithoutOctave = note.replace(/\d+$/, '');
            
            applyNoteColor(field, noteWithoutOctave, {
                useBackground: true,
                useTextColor: false,
                applySharpFlatStyling: true
            });
            
            // Maintain component-specific styling
            field.style.color = '#fff';
            field.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
        }
    });
}
```

### Key Selection Buttons
```javascript
// In hand-pan-wrapper.js
import { applyNoteColor } from '../../helpers/noteColorUtils.js';

applyKeyColors() {
    const keyBtns = this.shadowRoot.querySelectorAll('.key-btn');
    keyBtns.forEach(btn => {
        const key = btn.dataset.key;
        if (key) {
            applyNoteColor(btn, key, {
                useBackground: true,
                useTextColor: false,
                applySharpFlatStyling: true
            });
            
            // Ensure visibility
            btn.style.color = '#fff';
            btn.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
            btn.style.fontWeight = 'bold';
        }
    });
}
```

### Chord Palette (CSS-based)
```css
/* Using CSS custom properties approach */
.chord-button[data-chord-name*="C"] {
    background: var(--colour-C);
}

.chord-button[data-chord-name*="#"] {
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
}

.chord-button[data-chord-name*="b"] {
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}
```

## Performance Considerations

### Batch Operations
Use batch functions when applying colors to multiple elements:

```javascript
// ✅ Good: Batch operation
applyNoteColorsToElements(elementNoteMap);

// ❌ Avoid: Individual operations in loop
elements.forEach(el => applyNoteColor(el, el.dataset.note));
```

### CSS vs JavaScript
- **CSS**: Use for static layouts and known note sets
- **JavaScript**: Use for dynamic content and complex logic

### Caching
The utilities automatically cache computed CSS values for performance.

## Error Handling

All functions include fallback behavior:
- Invalid notes default to 'C' (red)
- Missing elements are safely ignored
- CSS property errors return fallback gray color

## Browser Compatibility

- **Modern browsers**: Full functionality
- **Legacy browsers**: Graceful degradation with fallback colors
- **No CSS custom properties**: Falls back to hardcoded colors

## Testing

```javascript
// Test color application
import { applyNoteColor, getNoteColor } from './helpers/noteColorUtils.js';

describe('Note Color Utils', () => {
    test('applies correct color for C note', () => {
        const element = document.createElement('div');
        applyNoteColor(element, 'C');
        
        expect(element.style.background).toContain('--colour-C');
        expect(element.classList.contains('note-c')).toBe(true);
    });
    
    test('handles sharp notes correctly', () => {
        const element = document.createElement('div');
        applyNoteColor(element, 'F#');
        
        expect(element.classList.contains('note-sharp')).toBe(true);
        expect(element.style.boxShadow).toContain('rgba(255, 255, 255, 0.5)');
    });
});
```