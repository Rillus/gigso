# Component Specifications

## Overview
This document provides detailed specifications for each component in the Gigso application, including inputs, outputs, expected behaviour, and integration patterns.

**Note:** Individual component specifications are now available in the `documents/components/` directory. See [Component Documentation Index](./components/README.md) for a complete list.

## Quick Reference
- **BaseComponent**: [base-component.md](./components/base-component.md)
- **PianoRoll**: [piano-roll.md](./components/piano-roll.md)
- **ChordPalette**: [chord-palette.md](./components/chord-palette.md)
- **TransportControls**: [transport-controls.md](./components/transport-controls.md)
- **All Components**: [Component Index](./components/README.md)

---

## Base Component Architecture

### `BaseComponent` (`components/base-component.js`)

**Purpose**: Abstract base class for all Web Components providing common functionality.

**Inputs**:
- `template` (string): HTML template for the component
- `styles` (string): CSS styles for the component
- `isolatedStyles` (boolean, default: true): Whether to use Shadow DOM

**Outputs**:
- Web Component instance with Shadow DOM encapsulation

**Methods**:
- `addEventListeners(eventListeners)`: Adds event listeners to component elements
- `dispatchComponentEvent(selector, eventName, eventDetails)`: Dispatches custom events

**Expected Behaviour**:
- Creates isolated Shadow DOM when `isolatedStyles` is true
- Provides consistent event handling across all components
- Enables cross-component communication via custom events

---

## Core Music Components

### `PianoRoll` (`components/piano-roll/piano-roll.js`)

**Purpose**: Visual timeline interface for arranging and playing chord progressions.

**Inputs**:
- **Events**:
  - `add-chord`: Adds a chord to the timeline
  - `play`: Starts playback
  - `stop`: Stops playback
  - `pause`: Pauses playback
  - `next-chord`: Moves to next chord
  - `previous-chord`: Moves to previous chord
  - `load-song`: Loads a complete song

**Outputs**:
- **Events**:
  - `play-chord`: Dispatched when a chord should be played
  - `isReady`: Dispatched when component is fully initialised

**Data Structure**:
```javascript
// Chord object
{
  name: "C",
  notes: ["C4", "E4", "G4"],
  duration: 1,
  delay: 0,
  startPosition: 0
}
```

**Expected Behaviour**:
- Displays chords as draggable boxes on a timeline
- Supports drag-and-drop reordering of chords
- Allows resizing chord duration via resize handles
- Provides visual playhead during playback
- Supports loop playback when enabled
- Automatically scrolls timeline during playback
- Displays chord diagrams within each chord box

**Key Features**:
- **Drag & Drop**: Click and drag chords to reposition
- **Resize**: Drag resize handle to change chord duration
- **Remove**: Click 'x' button to remove chords
- **Visual Feedback**: Playhead shows current playback position
- **Loop Support**: Integrates with global loop state

---

### `ChordPalette` (`components/chord-palette/chord-palette.js`)

**Purpose**: Pre-defined chord library for quick chord selection.

**Inputs**:
- None (static chord library)

**Outputs**:
- **Events**:
  - `add-chord`: Dispatched when a chord is selected

**Expected Behaviour**:
- Displays grid of pre-defined chord buttons
- Clicking a chord dispatches `add-chord` event with chord data
- Provides visual feedback on hover
- Automatically adds default duration (1 beat) and delay (0) to chords

**Pre-defined Chords**:
- C, Cm, Dm, Em, F, G, Am, Am7, Asus2, B, Bm

---

### `AddChord` (`components/add-chord/add-chord.js`)

**Purpose**: Form interface for creating custom chords.

**Inputs**:
- **Form Fields**:
  - Chord Name (text)
  - Notes (comma-separated)
  - Duration (number, beats)
  - Delay (number, beats)

**Outputs**:
- **Events**:
  - `add-chord`: Dispatched when form is submitted with valid data

**Expected Behaviour**:
- Validates all form fields before submission
- Converts notes string to array
- Clears form after successful submission
- Shows alert for invalid input
- Automatically formats chord object with all required properties

**Validation Rules**:
- Chord name must not be empty
- At least one note must be provided
- Duration must be greater than 0

---

### `GigsoKeyboard` (`components/gigso-keyboard/gigso-keyboard.js`)

**Purpose**: Interactive piano keyboard for note playback and visual feedback.

**Inputs**:
- **Attributes**:
  - `octaves` (number): Number of octaves to display (default: 4)
- **Events**:
  - `highlight-notes`: Highlights specific notes on the keyboard

**Outputs**:
- Audio playback via Tone.js synthesiser

**Expected Behaviour**:
- Displays piano keyboard with white and black keys
- Supports keyboard input (A-L for white keys, W-U for black keys)
- Provides visual feedback for pressed keys
- Highlights notes when chords are played
- Supports octave changes via +/- keys
- Click keys to play individual notes
- Integrates with Tone.js for audio synthesis

**Keyboard Mapping**:
- White keys: A, S, D, F, G, H, J
- Black keys: W, E, T, Y, U
- Octave control: +/-, _/=

---

### `HandPan` (`components/hand-pan/hand-pan.js`)

**Purpose**: Interactive hand pan (hang drum) instrument for touch-screen play with soothing synthesized tones.

**Inputs**:
- **Attributes**:
  - `key` (string): Musical key of the hand pan (D, F, G)
  - `scale` (string): Scale type (minor, major)
  - `size` (string): Visual size (small, medium, large)
- **Events**:
  - `set-key`: Changes the hand pan's key and scale
  - `mute`: Mutes all audio output
  - `unmute`: Unmutes audio output

**Outputs**:
- **Events**:
  - `note-played`: Dispatched when a note is played
  - `key-changed`: Dispatched when key/scale changes
- Audio playback via custom Tone.js hand pan synthesiser

**Expected Behaviour**:
- Displays circular hand pan layout with 8 tone fields
- Supports touch and mouse interaction with debouncing
- Provides visual feedback with pulse animations and ripple effects
- Supports multi-touch for simultaneous notes
- Uses triangle oscillator with reverb for authentic hand pan timbre
- Supports key changes (D minor, F major, G minor) with proper note layouts
- Responsive design for different screen sizes
- Proper audio context management with error handling

**Audio Features**:
- Triangle oscillator for warm, metallic sound
- Envelope: quick attack (0.01s), medium decay (0.2s), low sustain (0.3), long release (2.5s)
- Reverb effect with 1.5s decay and 30% wet mix
- Debounced note triggering to prevent timing conflicts

**Visual Features**:
- Circular layout with 8 tone fields positioned around the perimeter
- Pulse animation on note activation
- Ripple effect on touch/click
- Smooth transitions and hover effects
- No positioning shifts during interaction

---

### `HandPanWrapper` (`components/hand-pan-wrapper/hand-pan-wrapper.js`)

**Purpose**: Complete drop-in wrapper component that combines HandPan with audio management, key selection, size controls, and event logging.

**Inputs**:
- **Attributes**:
  - `key` (string): Initial musical key (D, F, G)
  - `scale` (string): Initial scale type (minor, major)
  - `size` (string): Initial size (small, medium, large)
  - `audio-enabled` (boolean): Whether audio should be enabled by default
- **User Interactions**:
  - Audio toggle button click
  - Key/scale dropdown selections
  - Size button selections
  - Clear log button click

**Outputs**:
- **Events**:
  - `audio-enabled`: Dispatched when audio context is started
  - `audio-disabled`: Dispatched when audio is disabled
  - All HandPan events (note-played, key-changed) are logged internally
- **UI Controls**: Complete interface for managing HandPan settings

**Expected Behaviour**:
- Provides one-click audio context initialization from user interaction
- Offers intuitive controls for key, scale, and size selection
- Displays real-time event logging with timestamps
- Handles all audio context management automatically
- Provides visual feedback for all control states
- Responsive design that works on all devices
- Complete drop-in solution requiring no additional setup

**Features**:
- **Audio Management**: Dynamic Tone.js loading and audio context initialization
- **Key Selection**: Dropdown controls for key (D, F, G) and scale (major, minor)
- **Size Controls**: Button-based selection for small, medium, large sizes
- **Event Logging**: Real-time capture and display of all HandPan events
- **Modern UI**: Dark theme with gradient backgrounds and smooth animations
- **JavaScript API**: Public methods for programmatic control

**Public Methods**:
- `enableAudio()`: Enables audio context
- `disableAudio()`: Disables audio context
- `setKey(key, scale)`: Changes HandPan key and scale
- `setSize(size)`: Changes HandPan size
- `getHandPan()`: Returns underlying HandPan component

**Usage Examples**:
```html
<!-- Basic usage -->
<hand-pan-wrapper></hand-pan-wrapper>

<!-- With custom settings -->
<hand-pan-wrapper key="F" scale="major" size="large" audio-enabled="true">
</hand-pan-wrapper>
```

```javascript
// JavaScript API
const wrapper = document.getElementById('myHandPan');
wrapper.enableAudio();
wrapper.setKey('G', 'minor');
wrapper.setSize('large');
```

**Hand Pan Layout**:
- 8-9 tone fields arranged in circular pattern
- Common keys: D minor (most popular), F major, G minor
- Natural hand pan note arrangements

---

### `CurrentChord` (`components/current-chord/current-chord.js`)

**Purpose**: Displays the currently selected or playing chord.

**Inputs**:
- **Events**:
  - `set-chord`: Sets the chord name to display

**Outputs**:
- Visual display of current chord name

**Expected Behaviour**:
- Updates display when chord changes
- Shows "Chord: None" when no chord is selected
- Provides clear visual indication of current chord
- Updates in real-time during playback

---

### `ChordDiagram` (`components/chord-diagram/chord-diagram.js`)

**Purpose**: Visual representation of chord fingerings.

**Inputs**:
- **Attributes**:
  - `chord`: Chord name to display
  - `instrument`: Instrument type (default: 'ukulele')
- **Events**:
  - `set-chord`: Sets the chord to display

**Outputs**:
- Visual chord diagram showing finger positions

**Expected Behaviour**:
- Displays fretboard diagram for selected chord
- Shows finger positions as highlighted frets
- Supports different instruments (currently ukulele)
- Updates automatically when chord changes
- Provides visual reference for chord fingerings

---

## Transport Controls

### `TransportControls` (`components/transport-controls/transport-controls.js`)

**Purpose**: Container component for playback control buttons.

**Inputs**:
- None (container component)

**Outputs**:
- Rendered transport control buttons

**Expected Behaviour**:
- Contains PlayButton, StopButton, and LoopButton
- Provides consistent styling and layout
- Groups transport controls in a single interface
- Maintains button spacing and visual consistency

---

### `PlayButton` (`components/play-button/play-button.js`)

**Purpose**: Initiates playback of the current song.

**Inputs**:
- **Events**:
  - `activate`: Activates the button (adds 'active' class)
  - `deactivate`: Deactivates the button (removes 'active' class)

**Outputs**:
- **Events**:
  - `play-clicked`: Dispatched when button is clicked

**Expected Behaviour**:
- Displays play triangle symbol (▶)
- Dispatches `play-clicked` event on click
- Updates visual state based on activate/deactivate events
- Integrates with global playback state

---

### `StopButton` (`components/stop-button/stop-button.js`)

**Purpose**: Stops playback and resets to beginning.

**Inputs**:
- **Events**:
  - `activate`: Activates the button briefly
  - `deactivate`: Deactivates the button

**Outputs**:
- **Events**:
  - `stop-clicked`: Dispatched when button is clicked

**Expected Behaviour**:
- Displays stop square symbol (■)
- Dispatches `stop-clicked` event on click
- Automatically deactivates after 300ms when activated
- Integrates with global playback state

---

### `LoopButton` (`components/loop-button/loop-button.js`)

**Purpose**: Toggles loop playback mode.

**Inputs**:
- **Events**:
  - `activate`: Activates loop mode (adds 'active' class)
  - `deactivate`: Deactivates loop mode (removes 'active' class)

**Outputs**:
- **Events**:
  - `loop-clicked`: Dispatched when button is clicked

**Expected Behaviour**:
- Displays loop symbol (↻)
- Dispatches `loop-clicked` event on click
- Updates visual state based on activate/deactivate events
- Integrates with global loop state

---

## Song Management

### `RecordCollection` (`components/record-collection/record-collection.js`)

**Purpose**: Displays and loads songs from the song library.

**Inputs**:
- **Song Library**: Imports songs from `song-library.js`

**Outputs**:
- **Events**:
  - `load-song`: Dispatched when a song is selected

**Expected Behaviour**:
- Displays grid of song buttons
- Loads songs from the song library
- Dispatches `load-song` event with selected song data
- Provides visual feedback on hover
- Integrates with PianoRoll for song loading

---

## Interface Components

### `GigsoMenu` (`components/gigso-menu/gigso-menu.js`)

**Purpose**: Toggle interface for showing/hiding components.

**Inputs**:
- None (static menu items)

**Outputs**:
- Toggle functionality for specified components

**Expected Behaviour**:
- Displays toggle buttons for:
  - Current Chord Display
  - Keyboard
  - Add Chord Form
- Toggles component visibility on/off
- Updates button state (isOn/isOff classes)
- Provides visual feedback for component state

**Toggle Targets**:
- `current-chord-display`
- `gigso-keyboard`
- `add-chord-form`

---

## Event Communication Patterns

### Component-to-Component Events
```javascript
// Dispatch event
this.dispatchEvent(new CustomEvent('event-name', { 
  detail: data,
  bubbles: true,
  composed: true 
}));

// Listen for event
this.addEventListener('event-name', (event) => {
  const data = event.detail;
  // Handle event
});
```

### Global Event Handling
```javascript
// Listen for global events
document.body.addEventListener('event-name', (event) => {
  // Handle global event
});

// Dispatch global event
document.body.dispatchEvent(new CustomEvent('event-name', { 
  detail: data 
}));
```

---

## State Integration

### Global State Properties
- `isPlaying`: Boolean - playback status
- `loopActive`: Boolean - loop mode status
- `currentChord`: Object - currently selected chord
- `song`: Object - current song data

### State Access Pattern
```javascript
import State from '../../state/state.js';
const { isPlaying, setIsPlaying } = State;

// Get state
const playing = isPlaying();

// Set state
setIsPlaying(true);
```

---

## Testing Requirements

### Component Testing Pattern
```javascript
// Test file: __tests__/component-name.test.js
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup component
  });

  test('should handle input correctly', () => {
    // Test input handling
  });

  test('should dispatch correct events', () => {
    // Test event dispatching
  });

  test('should update visual state', () => {
    // Test visual updates
  });
});
```

### Test Coverage Requirements
- Input validation and handling
- Event dispatching and listening
- Visual state updates
- Integration with other components
- Error handling and edge cases

---

## Performance Considerations

### Audio Performance
- Chord playback latency < 50ms
- Support for 8+ simultaneous notes
- Efficient Tone.js integration

### UI Performance
- Smooth animations (60fps)
- Responsive drag-and-drop
- Efficient re-rendering
- Minimal DOM manipulation

### Memory Management
- Proper event listener cleanup
- Efficient chord data structures
- Minimal object creation during playback

---

## Future Enhancements

### Planned Component Features
- **Metronome Component**: Visual and audio metronome
- **Effects Panel**: Audio effects controls
- **Score Display**: Musical notation view
- **Recording Component**: Audio recording interface
- **Settings Panel**: User preferences and configuration

### Component Improvements
- **Responsive Design**: Mobile-friendly layouts
- **Accessibility**: Screen reader support
- **Keyboard Navigation**: Full keyboard control
- **Touch Support**: Mobile touch interactions
- **Theme Support**: Customisable visual themes 