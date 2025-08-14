# GigsoKeyboard

**File:** `components/gigso-keyboard/gigso-keyboard.js`  
**Purpose:** Interactive piano keyboard for note playback and visual feedback.

## Overview
The GigsoKeyboard component provides a visual piano keyboard interface that users can interact with via mouse clicks or keyboard input. It integrates with Tone.js for audio synthesis and provides visual feedback when chords are played.

## Inputs

### Attributes
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `octaves` | number | 4 | Number of octaves to display |
| `size` | string | 'medium' | Keyboard size ('small', 'medium', 'large') |

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `highlight-notes` | `{notes, duration}` | Highlights specific notes on the keyboard |

### Keyboard Input
| Key | Note | Description |
|-----|------|-------------|
| A | C | White key |
| W | C# | Black key |
| S | D | White key |
| E | D# | Black key |
| D | E | White key |
| F | F | White key |
| T | F# | Black key |
| G | G | White key |
| Y | G# | Black key |
| H | A | White key |
| U | A# | Black key |
| J | B | White key |
| +/- | - | Increase/decrease octave |
| _/= | - | Decrease/increase octave |

## Outputs

### Audio Playback
- **Tone.js Synthesiser**: Polyphonic synthesiser for note playback
- **Note triggering**: Individual note playback via `synth.triggerAttackRelease()`

### Visual Feedback
- **Key highlighting**: Active keys are visually highlighted
- **Note duration**: Highlight duration matches note playback
- **Octave display**: Visual representation of current octave

### Events Emitted
| Event | Data | Description |
|-------|------|-------------|
| `octave-change` | `{octave}` | Emitted when octave changes |
| `key-press` | `{note}` | Emitted when a note is played |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `synth` | Tone.Synth | new Tone.Synth() | Audio synthesiser |
| `keyMap` | Object | {...} | Keyboard key to note mapping |
| `keysPerOctave` | Array | ['C', 'C#', ...] | Note names per octave |
| `currentOctave` | number | 3 | Current octave for keyboard input |
| `playingNotes` | Set | new Set() | Set of currently playing notes |

## Expected Behaviour

### Visual Display
- Displays piano keyboard with white and black keys
- White keys are wider than black keys
- Black keys are positioned between appropriate white keys
- Responsive layout that scales with container

### Mouse Interaction
- **Click to play**: Click any key to play the corresponding note
- **Visual feedback**: Clicked keys show immediate visual response
- **Note duration**: Default 8th note duration for clicked notes

### Keyboard Interaction
- **Note keys**: Press A-J, W-U to play corresponding notes
- **Octave control**: Use +/- or _/= to change octave
- **Key down/up**: Visual feedback matches key press/release
- **Polyphonic**: Multiple keys can be pressed simultaneously

### Audio Integration
- **Tone.js**: Uses Tone.Synth for audio synthesis
- **Note format**: Converts to proper note format (e.g., "C4", "F#3")
- **Duration**: Configurable note duration
- **Polyphony**: Supports multiple simultaneous notes

### Highlight System
- **Chord highlighting**: Highlights notes when chords are played
- **Duration matching**: Highlight duration matches chord duration
- **Visual feedback**: Clear indication of which notes are playing
- **Auto-clear**: Highlights automatically clear after duration

## Key Methods

### `render()`
Generates the keyboard HTML and applies styling.

### `generateKeys(octaves)`
Creates HTML for the specified number of octaves.

### `playNote(index, useOctave)`
Plays a note at the specified index and octave.

### `handleKeyDown(event)`
Handles keyboard input for note playback and octave changes.

### `handleKeyUp(event)`
Handles keyboard release for visual feedback.

### `highlightNotes(played)`
Highlights specific notes for a given duration.

### `setOctave(octave)`
Sets the current octave for keyboard input and emits an `octave-change` event.

### `setSize(size)`
Sets the keyboard size attribute ('small', 'medium', 'large').

### `updateSize()`
Updates the keyboard size styling based on the size attribute.

### `playScale()`
Plays a C major scale with a 0.5-second delay between notes.

### `stopAll()`
Stops all currently playing notes and clears visual highlights.

## Integration Patterns

### With Actions
```javascript
// Actions dispatches highlight-notes event
keyboard.addEventListener('highlight-notes', (event) => {
  const { notes, duration } = event.detail;
  keyboard.highlightNotes({ notes, duration });
});
```

### With Tone.js
```javascript
// Direct integration with Tone.js
this.synth = new Tone.Synth().toDestination();
this.synth.triggerAttackRelease(note, '8n');
```

### Event Flow
1. User clicks key or presses keyboard
2. GigsoKeyboard plays note via Tone.js
3. Actions dispatches highlight-notes event
4. GigsoKeyboard highlights corresponding keys
5. Highlights clear after note duration

### Demo Integration
```javascript
// Demo controls integration
const keyboard = document.getElementById('demo-component');

// Octave control
keyboard.setOctave(5);

// Size control
keyboard.setSize('large');

// Scale playback
keyboard.playScale();

// Stop all notes
keyboard.stopAll();

// Event listening
keyboard.addEventListener('octave-change', (e) => {
    console.log('Octave changed to:', e.detail.octave);
});

keyboard.addEventListener('key-press', (e) => {
    console.log('Note played:', e.detail.note);
});
```

## Styling

### CSS Classes
- `.keyboard`: Main keyboard container
- `.key`: Individual key styling
- `.white`: White key styling
- `.black`: Black key styling
- `.active`: Active/highlighted key state

### Visual Design
- Realistic piano key proportions
- White keys with rounded tops
- Black keys positioned between white keys
- Smooth transitions for state changes
- Responsive scaling

## Testing Requirements

### Core Functionality
- All keys render correctly
- Mouse clicks trigger note playback
- Keyboard input works for all mapped keys
- Octave changes function properly

### Audio Integration
```javascript
test('should play note when key is clicked', () => {
  const keyboard = document.createElement('gigso-keyboard');
  document.body.appendChild(keyboard);
  
  // Mock Tone.js
  const mockSynth = { triggerAttackRelease: jest.fn() };
  keyboard.synth = mockSynth;
  
  // Click first key
  const firstKey = keyboard.shadowRoot.querySelector('.key');
  firstKey.click();
  
  expect(mockSynth.triggerAttackRelease).toHaveBeenCalledWith('C2', '8n');
});
```

### Visual Feedback
```javascript
test('should highlight notes when event received', () => {
  const keyboard = document.createElement('gigso-keyboard');
  document.body.appendChild(keyboard);
  
  // Dispatch highlight event
  keyboard.dispatchEvent(new CustomEvent('highlight-notes', {
    detail: { notes: ['C4', 'E4', 'G4'], duration: 1 }
  }));
  
  // Check that keys are highlighted
  const keys = keyboard.shadowRoot.querySelectorAll('.key');
  const highlightedKeys = Array.from(keys).filter(key => 
    key.classList.contains('active')
  );
  
  expect(highlightedKeys.length).toBeGreaterThan(0);
});
```

### Keyboard Input
- All mapped keys respond correctly
- Octave changes work with +/- keys
- Visual feedback matches key press/release
- Multiple simultaneous key presses

### New Methods
```javascript
test('should set octave using setOctave method', () => {
  const keyboard = document.createElement('gigso-keyboard');
  document.body.appendChild(keyboard);
  
  keyboard.setOctave(5);
  expect(keyboard.currentOctave).toBe(5);
});

test('should set size using setSize method', () => {
  const keyboard = document.createElement('gigso-keyboard');
  document.body.appendChild(keyboard);
  
  keyboard.setSize('large');
  expect(keyboard.getAttribute('size')).toBe('large');
});

test('should play scale using playScale method', async () => {
  const keyboard = document.createElement('gigso-keyboard');
  document.body.appendChild(keyboard);
  const playNoteSpy = jest.spyOn(keyboard, 'playNote');
  
  keyboard.playScale();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  expect(playNoteSpy).toHaveBeenCalled();
});

test('should stop all notes using stopAll method', () => {
  const keyboard = document.createElement('gigso-keyboard');
  document.body.appendChild(keyboard);
  const stopAllSpy = jest.spyOn(keyboard.synth, 'triggerRelease');
  
  keyboard.stopAll();
  expect(stopAllSpy).toHaveBeenCalled();
});
```

## Performance Considerations

### Audio Performance
- Efficient Tone.js integration
- Minimal audio latency
- Proper note triggering
- Memory management for synthesiser

### Visual Performance
- Smooth key animations
- Efficient highlight system
- Responsive keyboard scaling
- Minimal DOM manipulation

### Input Handling
- Efficient keyboard event processing
- Proper event listener management
- Responsive mouse interaction
- Polyphonic input support

## Future Enhancements

### Planned Features
- **Velocity sensitivity**: Respond to key press velocity
- **Sustain pedal**: Add sustain functionality
- **Different sounds**: Multiple synthesiser types
- **Recording**: Record keyboard input
- **MIDI support**: MIDI input/output

### UI Improvements
- **Key labels**: Show note names on keys
- **Octave indicators**: Visual octave markers
- **Touch support**: Mobile touch interaction
- **Accessibility**: Screen reader support
- **Theming**: Customisable keyboard appearance

## Related Components
- **Actions**: Receives highlight events from keyboard
- **PianoRoll**: Could integrate with keyboard input
- **CurrentChord**: Could show notes being played 