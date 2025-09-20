# Mobile Ukulele

**File:** `components/mobile-ukulele/mobile-ukulele.js`  
**Purpose:** Interactive mobile ukulele instrument designed for landscape mobile phone play with fret buttons and strum area.

## Overview
The Mobile Ukulele component provides a touch-optimised ukulele interface designed specifically for mobile phones in landscape orientation. It features a fretboard with pressable fret buttons and a strum area where users can strum individual strings or play chords. The component uses ukulele tuning (G-C-E-A) and supports multi-touch for chord playing.

## Inputs

### Attributes
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `tuning` | string | "standard" | Ukulele tuning (standard, low-g, baritone) |
| `size` | string | "mobile" | Interface size (mobile, tablet, desktop) |
| `frets` | number | 6 | Number of frets to display |
| `show-notes` | boolean | false | Whether to show note names on frets |

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `set-tuning` | `{tuning}` | Changes the ukulele tuning |
| `mute` | - | Mutes all audio output |
| `unmute` | - | Unmutes audio output |
| `highlight-chord` | `{chord, frets}` | Highlights a chord on the fretboard |

### Touch/Mouse Input
- **Fret buttons**: Press to hold down frets (like pressing strings)
- **String strum area**: Tap or swipe to strum individual strings
- **Swipe detection**: Smooth swiping through strings with movement threshold
- **Multi-touch**: Support for multiple simultaneous touches for chords
- **Long press**: Sustains held frets while strumming

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `note-played` | `{note, string, fret, frequency}` | Dispatched when a note is played |
| `chord-played` | `{chord, notes, frets}` | Dispatched when a chord is played |
| `tuning-changed` | `{tuning, strings}` | Dispatched when tuning changes |
| `fret-pressed` | `{string, fret, note}` | Dispatched when a fret is pressed |
| `fret-released` | `{string, fret, note}` | Dispatched when a fret is released |

### Audio Output
- **Tone.js Synthesiser**: Ukulele-specific timbre with string resonance
- **String simulation**: Individual string synthesis with realistic ukulele sound
- **Chord support**: Polyphonic chord playback
- **Strumming patterns**: Realistic strumming with timing variations

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `synth` | Tone.PolySynth | Custom ukulele synth | Audio synthesiser with ukulele timbre |
| `tuning` | string | "standard" | Current ukulele tuning |
| `strings` | Array | ["G4", "C4", "E4", "A4"] | Open string notes for current tuning |
| `frets` | number | 12 | Number of frets displayed |
| `pressedFrets` | Map | new Map() | Currently pressed frets by string |
| `isMuted` | boolean | false | Audio mute state |
| `fretButtons` | Array | [] | Array of fret button elements |
| `strumArea` | Element | null | Strum area element |

## Expected Behaviour

### Visual Display
- **Landscape orientation**: Optimised for mobile phones in landscape mode
- **Fretboard layout**: Horizontal fretboard with fret buttons arranged vertically
- **String indicators**: Four horizontal lines representing ukulele strings
- **Fret buttons**: Small circular buttons positioned at fret intersections
- **Strum area**: Large touch area to the right of the fretboard for strumming
- **Visual feedback**: Pressed frets and active strings show visual indication
- **Responsive design**: Scales appropriately for different screen sizes

### Touch Interaction
- **Fret pressing**: Tap fret buttons to press down frets (like holding strings)
- **String strumming**: Tap or swipe in strum area to play held frets
- **Swipe functionality**: Smooth swiping through strings with 10px movement threshold
- **String detection**: Automatic detection of which string is being swiped over
- **Multi-touch**: Support multiple simultaneous touches for chord playing
- **Chord + Swipe**: Hold chord frets while swiping strum area for complex playing
- **Touch separation**: Distinguishes between fret touches and strum touches
- **Touch areas**: Clear, accessible touch targets for all interactive elements
- **Visual feedback**: Immediate visual response to touch interactions
- **Sustain**: Hold frets while strumming to sustain notes

### Audio Characteristics
- **Physical Model Synthesis**: Uses Karplus-Strong algorithm for realistic string resonance
- **Noise-based Plucking**: White noise source simulates string pluck excitation
- **Feedback Delay**: Creates natural string resonance through delay feedback loop
- **String Dampening**: Low-pass filter models natural string dampening
- **Ukulele Timbre**: Bright, plucky sound characteristic of ukulele
- **Natural Decay**: Realistic string decay and resonance patterns
- **Chord Support**: Polyphonic playback for multiple simultaneous notes
- **Strumming Patterns**: Realistic strumming with slight timing variations
- **Multi-touch Audio**: Proper handling of simultaneous note playback

### Tuning Support
- **Standard tuning**: G4-C4-E4-A4 (most common ukulele tuning)
- **Low-G tuning**: G3-C4-E4-A4 (lower G string)
- **Baritone tuning**: D3-G3-B3-E4 (baritone ukulele)
- **Custom tunings**: Support for user-defined tunings

## Ukulele Fretboard Layout

### Standard Tuning (G-C-E-A)
```
String 4 (G): G4  G#4  A4   A#4  B4   C5   C#5  D5   D#5  E5   F5   F#5
String 3 (C): C4   C#4  D4   D#4  E4   F4   F#4  G4   G#4  A4   A#4  B4
String 2 (E): E4   F4   F#4  G4   G#4  A4   A#4  B4   C5   C#5  D5   D#5
String 1 (A): A4   A#4  B4   C5   C#5  D5   D#5  E5   F5   F#5  G5   G#5
Fret:         0    1    2    3    4    5    6    7    8    9    10   11
```

### Low-G Tuning (G3-C4-E4-A4)
```
String 4 (G): G3   G#3  A3   A#3  B3   C4   C#4  D4   D#4  E4   F4   F#4
String 3 (C): C4   C#4  D4   D#4  E4   F4   F#4  G4   G#4  A4   A#4  B4
String 2 (E): E4   F4   F#4  G4   G#4  A4   A#4  B4   C5   C#5  D5   D#5
String 1 (A): A4   A#4  B4   C5   C#5  D5   D#5  E5   F5   F#5  G5   G#5
Fret:         0    1    2    3    4    5    6    7    8    9    10   11
```

### Baritone Tuning (D3-G3-B3-E4)
```
String 4 (D): D3   D#3  E3   F3   F#3  G3   G#3  A3   A#3  B3   C4   C#4
String 3 (G): G3   G#3  A3   A#3  B3   C4   C#4  D4   D#4  E4   F4   F#4
String 2 (B): B3   C4   C#4  D4   D#4  E4   F4   F#4  G4   G#4  A4   A#4
String 1 (E): E4   F4   F#4  G4   G#4  A4   A#4  B4   C5   C#5  D5   D#5
Fret:         0    1    2    3    4    5    6    7    8    9    10   11
```

## Key Methods

### `render()`
Generates the ukulele HTML with fretboard and strum area, applies styling.

### `createFretboard()`
Creates the fretboard HTML with fret buttons positioned at string/fret intersections.

### `createStrumArea()`
Creates the strum area HTML with touch zones for each string.

### `playNote(string, fret, duration)`
Plays a specific note on a specific string and fret.

### `playChord(frets, duration)`
Plays a chord using the specified fret positions.

### `handleFretPress(event, string, fret)`
Processes fret button press events and updates visual state.

### `handleFretRelease(event, string, fret)`
Processes fret button release events and updates visual state.

### `handleStrum(event, string)`
Processes strum area touch events and plays held frets.

### `changeTuning(tuning)`
Changes the ukulele tuning and updates string notes.

### `createUkuleleSynth()`
Creates a physically modelled ukulele synthesiser using Karplus-Strong algorithm with noise source and feedback delay.

### `createPhysicalModelSynth()`
Creates the physical model components: noise source, feedback delay, low-pass filter, and reverb for realistic string synthesis.

### `pluckString(note)`
Triggers a string pluck by setting the delay time based on the note frequency and briefly activating the noise source.

### `calculateNote(string, fret)`
Calculates the note name for a given string and fret position.

### `highlightChord(chord, frets)`
Highlights a chord on the fretboard for visual reference.

## Integration Patterns

### With Actions
```javascript
// Actions can trigger chord highlighting
ukulele.addEventListener('chord-played', (event) => {
  const { chord, notes, frets } = event.detail;
  // Update other components or state
});
```

### With Tone.js Physical Model
```javascript
// Create physically modelled ukulele synthesis using Karplus-Strong algorithm
this.noise = new Tone.Noise("white").start();

// Create feedback delay loop for string resonance
this.feedbackDelay = new Tone.FeedbackDelay("8n", 0.5);

// Create filter to model string dampening
this.filter = new Tone.Filter(2000, "lowpass");

// Create subtle reverb for string resonance
this.reverb = new Tone.Reverb({
  decay: 0.8,
  wet: 0.15
});

// Connect components: noise → filter → feedbackDelay → reverb
this.noise.connect(this.filter);
this.filter.connect(this.feedbackDelay);
this.feedbackDelay.connect(this.reverb);
this.reverb.toDestination();

// The feedback loop creates string resonance
this.feedbackDelay.connect(this.filter);

// Function to pluck a string
pluckString(note) {
  const frequency = this.noteToFrequency(note);
  const delayTime = 1 / frequency; // Delay time = 1/frequency for pitch
  this.feedbackDelay.delayTime.value = delayTime;
  
  // Trigger pluck by briefly turning on noise
  this.noise.volume.value = -10;
  this.noise.volume.rampTo(-Infinity, 0.01);
}
```

### Event Flow
1. User presses fret buttons (holds down frets)
2. User taps strum area or uses chord buttons
3. Mobile Ukulele calculates note frequencies
4. Physical model triggers string pluck via noise source
5. Feedback delay creates string resonance at calculated pitch
6. Low-pass filter applies natural string dampening
7. Reverb adds spatial dimension to the sound
8. Visual feedback shows on fretboard
9. `note-played` or `chord-played` event dispatched
10. Notes decay naturally through the physical model

## Styling

### CSS Classes
- `.mobile-ukulele`: Main ukulele container
- `.fretboard`: Fretboard container
- `.string`: Individual string styling
- `.fret-button`: Fret button styling
- `.fret-button.pressed`: Pressed fret state
- `.strum-area`: Strum area container
- `.strum-zone`: Individual string strum zones
- `.strum-zone.active`: Active strum zone state

### Visual Design
- **Mobile-first**: Optimised for landscape mobile phones
- **Fretboard layout**: Horizontal layout with vertical fret buttons
- **String indicators**: Clear visual representation of four strings
- **Touch-friendly**: Large enough touch targets for mobile use
- **Visual feedback**: Clear indication of pressed frets and active strumming
- **Responsive scaling**: Adapts to different screen sizes

## Testing Requirements

### Core Functionality
- All fret buttons render correctly
- Touch events trigger note playback
- Tuning changes update string notes
- Multi-touch support works properly

### Audio Integration
```javascript
test('should play note when fret is pressed and strummed', () => {
  const ukulele = document.createElement('mobile-ukulele');
  document.body.appendChild(ukulele);
  
  // Mock Tone.js
  const mockSynth = { triggerAttackRelease: jest.fn() };
  ukulele.synth = mockSynth;
  
  // Press fret and strum
  const fretButton = ukulele.shadowRoot.querySelector('.fret-button[data-string="1"][data-fret="0"]');
  const strumZone = ukulele.shadowRoot.querySelector('.strum-zone[data-string="1"]');
  
  fireEvent.touchStart(fretButton);
  fireEvent.touchStart(strumZone);
  
  expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
});
```

### Multi-touch Support
```javascript
test('should support multi-touch for chords', () => {
  const ukulele = document.createElement('mobile-ukulele');
  document.body.appendChild(ukulele);
  
  // Simulate multiple fret presses
  const fretButtons = ukulele.shadowRoot.querySelectorAll('.fret-button');
  fireEvent.touchStart(fretButtons[0]); // String 1, Fret 0
  fireEvent.touchStart(fretButtons[4]); // String 2, Fret 0
  fireEvent.touchStart(fretButtons[8]); // String 3, Fret 0
  fireEvent.touchStart(fretButtons[12]); // String 4, Fret 0
  
  // Strum all strings
  const strumArea = ukulele.shadowRoot.querySelector('.strum-area');
  fireEvent.touchStart(strumArea);
  
  // Check that chord was played
  const pressedFrets = ukulele.pressedFrets;
  expect(pressedFrets.size).toBe(4);
});
```

### Tuning Changes
- Tuning changes update string notes correctly
- Fret calculations work for different tunings
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
- Efficient rendering of fretboard
- Responsive scaling
- Optimised CSS animations

## Future Enhancements

### Planned Features
- **Strumming patterns**: Pre-defined strumming patterns
- **Chord library**: Built-in chord library with fingerings
- **Recording**: Record ukulele performances
- **Effects**: Reverb, delay, and other effects
- **MIDI support**: MIDI input/output
- **Capo support**: Virtual capo functionality

### UI Improvements
- **Note labels**: Show note names on frets
- **Chord diagrams**: Visual chord fingerings
- **Tuning indicators**: Visual tuning guides
- **Accessibility**: Screen reader support
- **Theming**: Customisable appearance
- **Desktop support**: Enhanced desktop experience

## Related Components
- **Actions**: Could integrate with ukulele events
- **PianoRoll**: Could record ukulele performances
- **ChordDiagram**: Could show ukulele chord fingerings
- **TransportControls**: Could control ukulele playback

## Technical Notes

### Physical Model Synthesis
The ukulele uses physically modelled synthesis to replicate the characteristic sound:
- **Algorithm**: Karplus-Strong string synthesis
- **Excitation**: White noise source simulates string pluck
- **Resonance**: Feedback delay loop creates string vibration
- **Dampening**: Low-pass filter models natural string dampening
- **Spatial**: Subtle reverb for acoustic space
- **Timbre**: Bright, plucky sound characteristic of ukulele
- **Decay**: Natural string decay through physical modelling

### Touch Handling
- **Touch events**: `touchstart`, `touchend`, `touchmove`
- **Mouse fallback**: Click events for desktop
- **Multi-touch**: Support for multiple simultaneous touches
- **Touch areas**: Adequate size for reliable mobile interaction

### Mobile Optimisation
- **Landscape orientation**: Designed for mobile phones in landscape
- **Touch targets**: Large enough for finger interaction
- **Responsive layout**: Adapts to different screen sizes
- **Performance**: Optimised for mobile devices

### Audio Optimisation
- **Sample rate**: 44.1kHz minimum
- **Latency**: < 50ms response time
- **Polyphony**: Support for 4+ simultaneous notes (chords)
- **Memory**: Efficient synthesiser management

## Common Chord Fingerings

### Basic Chords (Standard Tuning)
- **C Major**: 0-0-0-3 (Open strings + 3rd fret on A string)
- **G Major**: 0-2-3-2 (2nd fret on C, 3rd fret on E, 2nd fret on A)
- **F Major**: 2-0-1-0 (2nd fret on G, open C, 1st fret on E, open A)
- **Am**: 2-0-0-0 (2nd fret on G, open strings)
- **Dm**: 2-2-1-0 (2nd fret on G and C, 1st fret on E, open A)

### Barre Chords
- **F Major (barre)**: 2-2-2-0 (2nd fret barre on G, C, E strings)
- **B Major**: 4-4-4-2 (4th fret barre on G, C, E, 2nd fret on A)

## Mobile-Specific Considerations

### Landscape Orientation
- **Fretboard width**: Should span most of the screen width
- **Strum area**: Positioned to the right of the fretboard
- **Touch zones**: Optimised for thumb and finger reach
- **Visual hierarchy**: Clear separation between fretboard and strum area

### Touch Interaction
- **Fret pressing**: Tap to press, tap again to release
- **Strumming**: Tap or swipe in strum area
- **Swipe detection**: 10px movement threshold for swipe activation
- **String tracking**: Prevents duplicate triggers during swipe
- **Multi-touch**: Support for chord playing with multiple fingers
- **Visual feedback**: Immediate response to all touch interactions

### Performance
- **Smooth scrolling**: If fretboard extends beyond screen
- **Touch responsiveness**: Immediate response to touch events
- **Audio latency**: Minimal delay between touch and sound
- **Battery efficiency**: Optimised for mobile devices
