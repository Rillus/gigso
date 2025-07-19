# ChordDiagram

**File:** `components/chord-diagram/chord-diagram.js`  
**Purpose:** Visual representation of chord fingerings.

## Overview
The ChordDiagram component displays a visual fretboard diagram showing where to place fingers for a specific chord. It supports different instruments and provides a clear visual reference for chord fingerings.

## Inputs

### Attributes
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `chord` | string | undefined | Chord name to display |
| `instrument` | string | 'ukulele' | Instrument type for fingering |

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `set-chord` | `string|null` | Sets the chord to display |

### Chord Library Integration
- **Imports**: `chord-library.js` for chord data
- **Instrument support**: Currently supports ukulele
- **Position data**: Fret positions for each string

## Outputs

### Visual Display
- **Fretboard diagram**: Grid showing strings and frets
- **Finger positions**: Highlighted frets showing where to place fingers
- **Chord name**: Visual representation of the selected chord
- **Instrument-specific**: Layout matches the selected instrument

## Expected Behaviour

### Visual Display
- Displays 4x5 grid representing fretboard
- Shows 4 strings (vertical) and 5 frets (horizontal)
- Highlights active frets for the selected chord
- Clear visual distinction between active and inactive frets

### Chord Rendering
- **Active frets**: Highlighted with visual indicator
- **Inactive frets**: Normal background colour
- **String layout**: Vertical strings, horizontal frets
- **Position accuracy**: Correct fret positions for each chord

### Instrument Support
- **Ukulele**: 4-string layout (primary support)
- **Extensible**: Framework for additional instruments
- **Position mapping**: Correct finger positions per instrument
- **Visual consistency**: Consistent styling across instruments

### Update Behaviour
- **Immediate updates**: Changes when chord attribute changes
- **Event-driven**: Updates when `set-chord` event received
- **Null handling**: Clears display when chord is null
- **Error handling**: Graceful handling of missing chord data

## Key Methods

### `createFretboard()`
Generates the basic fretboard HTML structure.

### `renderChord(chord)`
Renders the finger positions for a specific chord:
- Clears previous highlights
- Validates chord exists in library
- Maps finger positions to fretboard
- Highlights active frets

### `attributeChangedCallback(name, oldValue, newValue)`
Handles attribute changes:
- Updates chord display when chord attribute changes
- Updates instrument when instrument attribute changes

## Integration Patterns

### With Actions
```javascript
// Actions dispatches set-chord event when playing chords
chordDiagram.addEventListener('set-chord', (event) => {
  const chordName = event.detail;
  chordDiagram.renderChord(chordName);
});
```

### With Chord Library
```javascript
// Imports chord data from library
import chordLibrary from '../../chord-library.js';

// Accesses chord positions
const chordData = chordLibrary.chords[chordName];
const positions = chordData[instrument].positions;
```

### Event Flow
1. Chord is selected or played
2. `set-chord` event is dispatched
3. ChordDiagram receives event and updates display
4. Fretboard shows finger positions for the chord

## Styling

### CSS Classes
- `.chord-diagram`: Main container
- `.string`: Individual string styling
- `.fret`: Individual fret styling
- `.fret.active`: Active fret highlighting

### Visual Design
- **Grid layout**: CSS Grid for fretboard structure
- **String styling**: Circular string indicators
- **Fret styling**: Realistic fret appearance with gradients
- **Active highlighting**: Clear visual indication of finger positions

### Fretboard Styling
```css
.chord-diagram {
    display: grid;
    grid-template-columns: repeat(4, 20%);
    grid-template-rows: repeat(5, 25px);
    gap: 0;
    max-width: 80px;
}
```

## Testing Requirements

### Core Functionality
- Fretboard renders correctly
- Chord positions display accurately
- Attribute changes trigger updates
- Event handling works properly

### Chord Rendering
```javascript
test('should render chord positions correctly', () => {
  const chordDiagram = document.createElement('chord-diagram');
  document.body.appendChild(chordDiagram);
  
  // Set chord attribute
  chordDiagram.setAttribute('chord', 'C');
  
  // Check that frets are highlighted
  const activeFrets = chordDiagram.shadowRoot.querySelectorAll('.fret.active');
  expect(activeFrets.length).toBeGreaterThan(0);
});
```

### Event Handling
```javascript
test('should update when set-chord event received', () => {
  const chordDiagram = document.createElement('chord-diagram');
  document.body.appendChild(chordDiagram);
  
  // Dispatch set-chord event
  chordDiagram.dispatchEvent(new CustomEvent('set-chord', {
    detail: 'Am'
  }));
  
  // Check that display updated
  const activeFrets = chordDiagram.shadowRoot.querySelectorAll('.fret.active');
  expect(activeFrets.length).toBeGreaterThan(0);
});
```

### Error Handling
- Missing chord data
- Invalid instrument types
- Null chord values
- Malformed position data

## Performance Considerations

### Rendering Performance
- Efficient grid generation
- Minimal DOM manipulation
- Lightweight highlighting system
- Optimised attribute change handling

### Memory Management
- Efficient chord library access
- Proper event listener management
- Minimal object creation
- Clean component lifecycle

## Future Enhancements

### Planned Features
- **Multiple instruments**: Guitar, bass, mandolin support
- **Chord variations**: Different voicings of same chord
- **Interactive diagrams**: Click to play individual notes
- **Animation**: Smooth transitions between chords
- **Custom tunings**: Support for alternative tunings

### UI Improvements
- **Larger diagrams**: More detailed fretboard display
- **Colour coding**: Different colours for different fingers
- **Finger numbering**: Show which finger to use
- **Accessibility**: Screen reader support
- **Responsive design**: Mobile-friendly diagrams

## Related Components
- **Actions**: Dispatches set-chord events
- **PianoRoll**: Shows diagrams within chord boxes
- **CurrentChord**: Could show diagram for current chord
- **ChordPalette**: Could show preview diagrams 