# HandPan

**File:** `components/hand-pan/hand-pan.js`  
**Purpose:** Interactive hand pan (hang drum) instrument for touch-screen play with soothing synthesized tones.

## Overview
The HandPan component provides an interactive hand pan instrument interface designed primarily for touch-screen interaction. It features a circular layout with multiple tone fields that produce soothing, resonant sounds when tapped. The component uses Tone.js for high-quality audio synthesis with hand pan-specific timbres.

## Inputs

### Attributes
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `key` | string | "D" | Musical key of the hand pan (D, F, G) |
| `scale` | string | "minor" | Scale type (minor, major) |
| `size` | string | "medium" | Visual size (small, medium, large) |

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `set-key` | `{key, scale}` | Changes the hand pan's key and scale |
| `mute` | - | Mutes all audio output |
| `unmute` | - | Unmutes audio output |

### Touch/Mouse Input
- **Primary tap/click**: Triggers note playback
- **Long press**: Sustains note (optional feature)
- **Multi-touch**: Supports multiple simultaneous notes

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `note-played` | `{note, frequency, duration}` | Dispatched when a note is played |
| `key-changed` | `{key, scale, notes}` | Dispatched when key/scale changes |

### Audio Output
- **Tone.js Synthesiser**: Hand pan-specific timbre with resonance
- **Note triggering**: Individual note playback with natural decay
- **Polyphonic support**: Multiple simultaneous notes

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `synth` | Tone.Synth | Custom hand pan synth | Audio synthesiser with hand pan timbre |
| `currentKey` | string | "D" | Current musical key |
| `currentScale` | string | "minor" | Current scale type |
| `notes` | Array | [] | Array of available notes for current key/scale |
| `isMuted` | boolean | false | Audio mute state |
| `toneFields` | Array | [] | Array of tone field elements |

## Expected Behaviour

### Visual Display
- **Circular layout**: Hand pan displayed as a circle with tone fields arranged around the perimeter
- **Tone fields**: 8-9 circular areas representing different notes
- **Visual feedback**: Tone fields respond to touch with ripple effects
- **Key indicator**: Shows current key and scale in the centre
- **Responsive design**: Scales appropriately for different screen sizes

### Touch Interaction
- **Tap to play**: Single tap triggers note playback with debouncing
- **Visual feedback**: Pulse animations and ripple effects on touch
- **Multi-touch**: Supports multiple simultaneous touches with tracking
- **Touch areas**: Clear, accessible touch targets for each tone field
- **No positioning shifts**: Tone fields stay perfectly centered during interaction

### Audio Characteristics
- **Hand pan timbre**: Triangle oscillator for warm, metallic, resonant sound
- **Natural decay**: Long release (2.5s) for authentic hand pan decay
- **Reverb effect**: 1.5s decay with 30% wet mix for resonance
- **Debounced triggering**: Prevents rapid note conflicts
- **Error handling**: Graceful handling of audio timing issues

### Key and Scale Support
- **Supported keys**: D, F, G (most popular hand pan keys)
- **Scale types**: Minor, major
- **Note arrangement**: 8 notes arranged in logical hand pan order
- **Key changes**: Smooth transition between different keys with proper note layouts

## Hand Pan Note Layout

### D Minor (Most Common)
```
        D4
    A3      A4
  F3          F4
    D3      D4
        A3
```

### F Major
```
        F4
    C4      C5
  A3          A4
    F3      F4
        C4
```

### G Minor
```
        G4
    D4      D5
  Bb3         Bb4
    G3      G4
        D4
```

## Key Methods

### `render()`
Generates the hand pan HTML with tone fields and applies styling.

### `createToneFields()`
Creates the circular tone field elements based on current key/scale.

### `playNote(note, duration)`
Plays a specific note with hand pan timbre and natural decay.

### `handleTouch(event)`
Processes touch events and triggers appropriate note playback.

### `changeKey(key, scale)`
Changes the hand pan's key and scale, updating available notes.

### `createHandPanSynth()`
Creates a custom Tone.js synthesiser with hand pan-specific timbre using triangle oscillator and reverb.

### `playNote(note, duration)`
Plays a specific note with debouncing to prevent timing conflicts.

### `handleMouseInteraction(event, index)` / `handleTouchStart(event, index)`
Processes mouse and touch events with proper visual feedback and event tracking.

## Integration Patterns

### With Actions
```javascript
// Actions can trigger key changes
handPan.addEventListener('key-changed', (event) => {
  const { key, scale, notes } = event.detail;
  // Update other components or state
});
```

### With Tone.js
```javascript
// Custom hand pan synthesiser with reverb
this.synth = new Tone.Synth({
  oscillator: {
    type: "triangle"  // Warm, metallic sound
  },
  envelope: {
    attack: 0.01,     // Quick attack
    decay: 0.2,       // Medium decay
    sustain: 0.3,     // Low sustain
    release: 2.5      // Long release for natural decay
  }
}).toDestination();

// Add subtle reverb for resonance
this.reverb = new Tone.Reverb({
  decay: 1.5,
  wet: 0.3
}).toDestination();

// Connect synth to reverb
this.synth.connect(this.reverb);
```

### Event Flow
1. User taps tone field
2. HandPan plays note via Tone.js
3. Visual feedback shows on tone field
4. `note-played` event dispatched
5. Note decays naturally

## Styling

### CSS Classes
- `.hand-pan`: Main hand pan container
- `.tone-field`: Individual tone field styling
- `.tone-field.active`: Active/playing state
- `.key-indicator`: Centre key display
- `.ripple`: Touch ripple effect

### Visual Design
- **Circular layout**: Hand pan shape with tone fields
- **Metallic appearance**: Subtle metallic finish
- **Tone field indicators**: Clear visual separation
- **Responsive scaling**: Adapts to container size
- **Smooth animations**: Fluid transitions and effects

## Testing Requirements

### Core Functionality
- All tone fields render correctly
- Touch events trigger note playback
- Key changes update note layout
- Audio synthesis works properly

### Audio Integration
```javascript
test('should play note when tone field is tapped', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  // Mock Tone.js
  const mockSynth = { triggerAttackRelease: jest.fn() };
  handPan.synth = mockSynth;
  
  // Tap first tone field
  const firstField = handPan.shadowRoot.querySelector('.tone-field');
  fireEvent.touchStart(firstField);
  
  expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
});
```

### Touch Interaction
```javascript
test('should support multi-touch', () => {
  const handPan = document.createElement('hand-pan');
  document.body.appendChild(handPan);
  
  // Simulate multiple touches
  const fields = handPan.shadowRoot.querySelectorAll('.tone-field');
  fireEvent.touchStart(fields[0]);
  fireEvent.touchStart(fields[1]);
  
  // Check that both notes are playing
  const activeFields = handPan.shadowRoot.querySelectorAll('.tone-field.active');
  expect(activeFields.length).toBe(2);
});
```

### Key Changes
- Key changes update note layout correctly
- Scale changes affect available notes
- Visual indicators update appropriately
- Events are dispatched correctly

## Performance Considerations

### Audio Performance
- Efficient Tone.js integration
- Minimal audio latency
- Proper note triggering and release
- Memory management for synthesiser

### Touch Performance
- Responsive touch handling
- Efficient multi-touch processing
- Smooth visual feedback
- Minimal DOM manipulation

### Visual Performance
- Smooth animations and transitions
- Efficient rendering of tone fields
- Responsive scaling
- Optimised CSS animations

## Future Enhancements

### Planned Features
- **Pressure sensitivity**: Respond to touch pressure
- **Custom tunings**: User-defined note arrangements
- **Recording**: Record hand pan performances
- **Effects**: Reverb, delay, and other effects
- **MIDI support**: MIDI input/output

### UI Improvements
- **Note labels**: Show note names on tone fields
- **Tuning indicators**: Visual tuning guides
- **Accessibility**: Screen reader support
- **Theming**: Customisable appearance
- **Mobile optimisation**: Enhanced mobile experience

## Related Components
- **Actions**: Could integrate with hand pan events
- **PianoRoll**: Could record hand pan performances
- **GigsoKeyboard**: Alternative keyboard interface
- **TransportControls**: Could control hand pan playback

## Technical Notes

### Hand Pan Timbre
The hand pan synthesiser should replicate the characteristic sound:
- **Oscillator type**: Triangle or sine wave base
- **Envelope**: Long attack, medium decay, low sustain, long release
- **Effects**: Subtle reverb and delay for resonance
- **Harmonics**: Rich harmonic content

### Touch Handling
- **Touch events**: `touchstart`, `touchend`, `touchmove`
- **Mouse fallback**: Click events for desktop
- **Multi-touch**: Support for multiple simultaneous touches
- **Touch areas**: Adequate size for reliable interaction

### Audio Optimisation
- **Sample rate**: 44.1kHz minimum
- **Latency**: < 50ms response time
- **Polyphony**: Support for 8+ simultaneous notes
- **Memory**: Efficient synthesiser management 