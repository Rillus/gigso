# PianoRoll

**File:** `components/piano-roll/piano-roll.js`  
**Purpose:** Visual timeline interface for arranging and playing chord progressions.

## Overview
The PianoRoll component provides a drag-and-drop timeline interface where users can arrange chords, adjust their duration, and control playback. It's the central component for music composition in Gigso.

## Inputs

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `add-chord` | `{chord}` | Adds a chord to the timeline |
| `play` | - | Starts playback |
| `stop` | - | Stops playback and resets |
| `pause` | - | Pauses playback |
| `next-chord` | - | Moves to next chord |
| `previous-chord` | - | Moves to previous chord |
| `load-song` | `{song}` | Loads a complete song |

### Chord Object Structure
```javascript
{
  name: "C",           // Chord name (string)
  notes: ["C4", "E4", "G4"], // Array of note names
  duration: 1,         // Duration in beats (number)
  delay: 0,           // Delay before play (number)
  startPosition: 0    // Position in timeline (number, auto-calculated)
}
```

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `play-chord` | `{chord, duration}` | Dispatched when a chord should be played |
| `isReady` | - | Dispatched when component is fully initialised |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `chordWidth` | number | 100 | Width of one beat in pixels |
| `chords` | Array | [] | Array of chord objects |
| `isPlaying` | boolean | false | Playback status |
| `currentPosition` | number | 0 | Current playback position |
| `endPosition` | number | 400 | End of timeline position |
| `chordPlaying` | number | null | Index of currently playing chord |

## Expected Behaviour

### Visual Display
- Displays chords as draggable boxes on a horizontal timeline
- Each chord box shows the chord name and includes a chord diagram
- Visual playhead (red line) shows current playback position
- Timeline scrolls horizontally during playback

### Drag & Drop Functionality
- **Repositioning**: Click and drag chord boxes to change their position
- **Resizing**: Drag resize handle (right edge) to change chord duration
- **Removal**: Click 'x' button to remove chords from timeline

### Playback Control
- **Play**: Starts playback from current position
- **Stop**: Stops playback and resets to beginning
- **Pause**: Pauses playback at current position
- **Loop**: Integrates with global loop state for continuous playback

### Timeline Navigation
- **Next/Previous**: Keyboard shortcuts (Arrow keys) for chord navigation
- **Auto-scroll**: Timeline automatically scrolls during playback
- **Position tracking**: Maintains accurate position for loop playback

## Key Methods

### `addChord(chord)`
Adds a chord to the timeline and re-renders.

### `loadSong(song)`
Replaces current chords with song data and re-renders.

### `renderChords()`
Re-renders all chord boxes with current data.

### `play()`
Initiates playback sequence.

### `stop()`
Stops playback and resets position.

### `pause()`
Pauses playback without resetting position.

### `scrollReel()`
Handles timeline scrolling and chord triggering during playback.

## Integration Patterns

### With ChordPalette
```javascript
// ChordPalette dispatches add-chord event
pianoRoll.addEventListener('add-chord', (event) => {
  const chord = event.detail;
  pianoRoll.addChord(chord);
});
```

### With Transport Controls
```javascript
// Transport controls dispatch play/stop/pause events
pianoRoll.addEventListener('play', () => pianoRoll.play());
pianoRoll.addEventListener('stop', () => pianoRoll.stop());
pianoRoll.addEventListener('pause', () => pianoRoll.pause());
```

### With Actions
```javascript
// PianoRoll dispatches play-chord events
pianoRoll.addEventListener('play-chord', (event) => {
  const { chord, duration } = event.detail;
  Actions.playChord({ chord, duration });
});
```

## State Integration

### Global State Dependencies
- `loopActive()`: Controls loop playback behaviour
- `isPlaying()`: Synchronises with global playback state

### State Updates
- Updates `currentPosition` during playback
- Tracks `chordPlaying` index for chord progression
- Maintains `chords` array for song data

## Testing Requirements

### Core Functionality
- Chord addition and removal
- Drag and drop repositioning
- Duration resizing
- Playback start/stop/pause
- Timeline scrolling

### Event Handling
- Receives and processes all input events
- Dispatches correct output events
- Handles edge cases (empty timeline, invalid data)

### Visual Updates
- Chord box rendering
- Playhead positioning
- Timeline scrolling animation
- Chord diagram integration

### Integration Tests
```javascript
test('should add chord from palette', () => {
  const pianoRoll = document.createElement('piano-roll');
  const chord = { name: 'C', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
  
  pianoRoll.dispatchEvent(new CustomEvent('add-chord', { detail: chord }));
  
  expect(pianoRoll.chords).toHaveLength(1);
  expect(pianoRoll.chords[0].name).toBe('C');
});
```

## Performance Considerations

### Rendering Performance
- Efficient chord box creation and updates
- Minimal DOM manipulation during playback
- Smooth scrolling animation (60fps)

### Memory Management
- Proper cleanup of event listeners
- Efficient chord data structures
- Minimal object creation during playback

### Audio Synchronisation
- Accurate timing for chord playback
- Low latency between visual and audio events
- Proper integration with Tone.js

## Future Enhancements

### Planned Features
- **Zoom controls**: Adjust timeline scale
- **Snap to grid**: Align chords to beat divisions
- **Multiple tracks**: Support for different instrument tracks
- **Undo/Redo**: History management for chord changes
- **Export/Import**: Save and load chord arrangements

### UI Improvements
- **Visual feedback**: Better drag and drop indicators
- **Keyboard shortcuts**: More navigation options
- **Touch support**: Mobile-friendly interactions
- **Accessibility**: Screen reader support

## Related Components
- **ChordPalette**: Provides chords to add
- **TransportControls**: Controls playback
- **Actions**: Handles audio playback
- **ChordDiagram**: Displays within chord boxes 