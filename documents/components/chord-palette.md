# ChordPalette

**File:** `components/chord-palette/chord-palette.js`  
**Purpose:** Pre-defined chord library for quick chord selection.

## Overview
The ChordPalette component provides a grid of pre-defined chord buttons that users can click to quickly add chords to the piano roll. It includes common chords used in popular music.

## Inputs

### Static Data
- **Pre-defined Chords**: Built-in library of 11 common chords
- **No external inputs**: Component is self-contained

### Chord Library
```javascript
const chords = [
  { name: "C", notes: ["C4", "E4", "G4"] },
  { name: "Cm", notes: ["C4", "D#4", "G4"] },
  { name: "Dm", notes: ["D4", "F4", "A4"] },
  { name: "Em", notes: ["E4", "G4", "B4", "B5", "E5"] },
  { name: "F", notes: ["F4", "A4", "C5"] },
  { name: "G", notes: ["G4", "B4", "D5"] },
  { name: "Am", notes: ["A4", "C5", "E5"] },
  { name: "Am7", notes: ["A4", "C5", "E5", "G5", "G4"] },
  { name: "Asus2", notes: ["A4", "B4", "E5"] },
  { name: "B", notes: ["B4", "D#5", "F#5"] },
  { name: "Bm", notes: ["B4", "D5", "F#5"] }
];
```

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `add-chord` | `{chord}` | Dispatched when a chord button is clicked |

### Chord Object Structure
```javascript
{
  name: "C",           // Chord name from button
  notes: ["C4", "E4", "G4"], // Pre-defined notes
  duration: 1,         // Default duration (1 beat)
  delay: 0            // Default delay (0 beats)
}
```

## Expected Behaviour

### Visual Display
- Displays grid of chord buttons in a flex layout
- Each button shows the chord name (e.g., "C", "Am", "G")
- Buttons have hover effects for visual feedback
- Responsive grid that wraps to multiple rows

### User Interaction
- **Click**: Clicking any chord button dispatches `add-chord` event
- **Hover**: Visual feedback when hovering over buttons
- **Selection**: No persistent selection state (buttons reset after click)

### Data Processing
- Automatically adds default `duration: 1` and `delay: 0` to chord objects
- Preserves original chord name and notes from library
- Creates complete chord object ready for piano roll

## Key Methods

### `createChordButtons()`
Generates HTML for all chord buttons from the chord library.

### `addChord(event)`
Handles chord button clicks and dispatches `add-chord` event.

## Integration Patterns

### With PianoRoll
```javascript
// ChordPalette dispatches add-chord event
document.body.addEventListener('add-chord', (event) => {
  const chord = event.detail;
  // PianoRoll receives and adds the chord
  dispatchComponentEvent('piano-roll', 'add-chord', chord);
});
```

### Event Flow
1. User clicks chord button
2. ChordPalette dispatches `add-chord` event
3. Main app receives event and forwards to PianoRoll
4. PianoRoll adds chord to timeline

## Styling

### CSS Classes
- `.palette`: Container for chord buttons
- `.chord-button`: Individual chord button styling
- Hover effects for interactive feedback

### Visual Design
- Light grey background (`#f9f9f9`)
- Button styling with borders and rounded corners
- Consistent spacing and typography
- Responsive grid layout

### Note Color System
The chord palette implements the application's note color system:

#### Color Mapping
- **C chords**: Red (`#E1453E`)
- **D chords**: Orange (`#F17947`)
- **E chords**: Yellow (`#FAB15C`)
- **F chords**: Green (`#60B05B`)
- **G chords**: Blue (`#5394C7`)
- **A chords**: Indigo (`#4b0082`)
- **B chords**: Violet (`#8F00FF`)

#### Sharp/Flat Variations
- **Sharp notes**: Base color with lightening effect (`box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5)`)
- **Flat notes**: Base color with darkening effect (`box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3)`)

#### Minor Chord Styling
- **Minor chords**: Base note color with reduced opacity (0.8) and dark text shadow
- **Grid positioning**: Minor chords positioned below their major counterparts

## Testing Requirements

### Core Functionality
- All chord buttons render correctly
- Click events dispatch proper data
- Default duration and delay are added
- Chord data structure is correct

### Event Handling
```javascript
test('should dispatch add-chord event with correct data', () => {
  const palette = document.createElement('chord-palette');
  const mockHandler = jest.fn();
  
  document.body.addEventListener('add-chord', mockHandler);
  
  // Click first chord button
  const firstButton = palette.shadowRoot.querySelector('.chord-button');
  firstButton.click();
  
  expect(mockHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      detail: expect.objectContaining({
        name: 'C',
        notes: ['C4', 'E4', 'G4'],
        duration: 1,
        delay: 0
      })
    })
  );
});
```

### Visual Tests
- Button grid layout
- Hover effects
- Responsive design
- Typography consistency

## Performance Considerations

### Rendering
- Static chord library (no dynamic loading)
- Efficient button generation
- Minimal DOM manipulation

### Event Handling
- Simple click handlers
- No complex state management
- Lightweight event dispatching

## Future Enhancements

### Planned Features
- **Custom chord library**: User-defined chords
- **Chord categories**: Group by key, difficulty, etc.
- **Search/filter**: Find specific chords
- **Favourites**: User's preferred chords
- **Chord variations**: Different voicings of same chord

### UI Improvements
- **Chord preview**: Show notes on hover
- **Keyboard shortcuts**: Quick chord selection
- **Drag and drop**: Drag chords directly to piano roll
- **Visual indicators**: Show chord difficulty or popularity

## Related Components
- **PianoRoll**: Receives chords from palette
- **AddChord**: Alternative way to create custom chords
- **ChordDiagram**: Could show preview of selected chord 