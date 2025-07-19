# CurrentChord

**File:** `components/current-chord/current-chord.js`  
**Purpose:** Displays the currently selected or playing chord.

## Overview
The CurrentChord component provides a simple display that shows the name of the currently active chord. It receives updates via events and provides real-time visual feedback during playback.

## Inputs

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `set-chord` | `string|null` | Sets the chord name to display |

### Event Data
- **Chord name**: String representing the chord (e.g., "C", "Am", "G7")
- **Null value**: Clears the display and shows "Chord: None"

## Outputs

### Visual Display
- **Chord name**: Shows "Chord: [chord name]" when a chord is active
- **Default state**: Shows "Chord: None" when no chord is selected
- **Real-time updates**: Updates immediately when chord changes

## Expected Behaviour

### Display States
- **Active chord**: Shows "Chord: [chord name]" in bold text
- **No chord**: Shows "Chord: None" in normal text
- **Real-time updates**: Changes immediately when `set-chord` event is received

### Visual Design
- **Bold text**: Chord name is displayed in bold for emphasis
- **Border**: Container has a black border for visual definition
- **Padding**: Internal spacing for readability
- **Font size**: 20px for clear visibility

### Update Behaviour
- **Immediate response**: Updates display as soon as event is received
- **No animation**: Simple text replacement without transitions
- **Persistent display**: Shows current chord until changed
- **Clear indication**: Obvious visual difference between active and inactive states

## Key Methods

### `setChord(chord)`
Updates the chord display:
- Sets the chord name in the display element
- Handles null values by showing "Chord: None"
- Updates the visual state immediately

## Integration Patterns

### With Actions
```javascript
// Actions dispatches set-chord event when playing chords
currentChord.addEventListener('set-chord', (event) => {
  const chordName = event.detail;
  currentChord.setChord(chordName);
});
```

### Event Flow
1. Chord is played (via PianoRoll or other component)
2. Actions dispatches `set-chord` event with chord name
3. CurrentChord receives event and updates display
4. Display shows current chord name in bold

### With PianoRoll
```javascript
// PianoRoll could also update current chord during playback
pianoRoll.addEventListener('play-chord', (event) => {
  const { chord } = event.detail;
  dispatchComponentEvent('current-chord', 'set-chord', chord.name);
});
```

## Styling

### CSS Classes
- `.chord-display`: Main display container

### Visual Design
- **Font**: 20px, bold for chord names
- **Border**: 1px solid black border
- **Padding**: 10px internal spacing
- **Margin**: 10px external spacing
- **Background**: Transparent (inherits from parent)

## Testing Requirements

### Core Functionality
- Displays chord name correctly when set
- Shows "Chord: None" when chord is null
- Updates immediately when event is received
- Handles various chord name formats

### Event Handling
```javascript
test('should update display when set-chord event received', () => {
  const currentChord = document.createElement('current-chord');
  document.body.appendChild(currentChord);
  
  // Dispatch set-chord event
  currentChord.dispatchEvent(new CustomEvent('set-chord', {
    detail: 'C Major'
  }));
  
  // Check display updated
  const display = currentChord.shadowRoot.querySelector('.chord-display');
  expect(display.textContent).toBe('Chord: C Major');
});
```

### Null Handling
```javascript
test('should show "Chord: None" when chord is null', () => {
  const currentChord = document.createElement('current-chord');
  document.body.appendChild(currentChord);
  
  // Dispatch null chord
  currentChord.dispatchEvent(new CustomEvent('set-chord', {
    detail: null
  }));
  
  // Check display shows none
  const display = currentChord.shadowRoot.querySelector('.chord-display');
  expect(display.textContent).toBe('Chord: None');
});
```

### Visual Tests
- Bold text for chord names
- Border and padding display
- Responsive text sizing
- Clear visual hierarchy

## Performance Considerations

### Update Performance
- Minimal DOM manipulation
- Simple text replacement
- No complex animations
- Lightweight event handling

### Memory Management
- Simple component with minimal state
- No event listener cleanup needed
- Efficient text updates
- No memory leaks

## Future Enhancements

### Planned Features
- **Chord details**: Show additional chord information
- **Chord history**: Display recent chords
- **Chord timing**: Show how long chord has been active
- **Chord statistics**: Show chord usage frequency

### UI Improvements
- **Animations**: Smooth transitions between chords
- **Colour coding**: Different colours for different chord types
- **Chord diagrams**: Show visual chord representation
- **Accessibility**: Screen reader support
- **Responsive design**: Better mobile display

## Related Components
- **Actions**: Dispatches set-chord events
- **PianoRoll**: Could update current chord during playback
- **ChordDiagram**: Could show visual representation of current chord
- **GigsoKeyboard**: Could highlight current chord notes 