# ChordWheel

**File:** `components/chord-wheel/chord-wheel.js`  
**Purpose:** Interactive circular chord interface for playing chord progressions with visual organisation by harmonic relationships.

## Overview
The ChordWheel component provides an intuitive circular interface for playing chords, featuring major chords on the outer ring and minor chords on an inner ring. The component supports multiple progression modes including the circle of fifths, diatonic progressions, and other harmonic patterns. It uses the same interface pattern as the HandPan component for consistency.

## Inputs

### Attributes
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `key` | string | "C" | Musical key of the chord wheel (C, C#, D, D#, E, F, F#, G, G#, A, A#, B) |
| `scale` | string | "major" | Scale type (major, minor) |
| `size` | string | "medium" | Visual size (small, medium, large) |
| `mode` | string | "circle-of-fifths" | Chord progression mode (circle-of-fifths, diatonic, chromatic, jazz-ii-v-i, blues) |

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `set-key` | `{key, scale}` | Changes the chord wheel's key and scale |
| `set-mode` | `{mode}` | Changes the chord progression mode |
| `mute` | - | Mutes all audio output |
| `unmute` | - | Unmutes audio output |

### Touch/Mouse Input
- **Primary tap/click**: Triggers chord playback
- **Long press**: Sustains chord (optional feature)
- **Multi-touch**: Supports multiple simultaneous chords
- **Keyboard shortcuts**: Number keys 1-12 for chord selection

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `chord-played` | `{chord, notes, duration, index}` | Dispatched when a chord is played |
| `key-changed` | `{key, scale, chords}` | Dispatched when key/scale changes |
| `mode-changed` | `{mode, chords}` | Dispatched when progression mode changes |

### Audio Output
- **Tone.js PolySynth**: Chord playback with rich harmonic content
- **Chord triggering**: Full chord playback with natural decay
- **Polyphonic support**: Multiple simultaneous chord voicings

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `synth` | Tone.PolySynth | Custom chord synth | Audio synthesiser for chord playback |
| `currentKey` | string | "C" | Current musical key |
| `currentScale` | string | "major" | Current scale type |
| `currentMode` | string | "circle-of-fifths" | Current progression mode |
| `chords` | Array | [] | Array of available chords for current key/mode |
| `isMuted` | boolean | false | Audio mute state |
| `chordButtons` | Array | [] | Array of chord button elements |

## Expected Behaviour

### Visual Display
- **Circular layout**: Chord wheel displayed as concentric circles
- **Outer ring**: Major chords (larger buttons)
- **Inner ring**: Minor chords (smaller buttons)
- **Visual feedback**: Chord buttons respond to touch with ripple effects
- **Key indicator**: Shows current key and mode in the centre
- **Responsive design**: Scales appropriately for different screen sizes

### Touch Interaction
- **Tap to play**: Single tap triggers chord playback with debouncing
- **Visual feedback**: Pulse animations and ripple effects on touch
- **Multi-touch**: Supports multiple simultaneous touches with tracking
- **Touch areas**: Clear, accessible touch targets for each chord
- **No positioning shifts**: Chord buttons stay perfectly centered during interaction

### Audio Characteristics
- **Rich chord timbre**: Multiple oscillators for harmonic richness
- **Natural decay**: Long release for authentic chord decay
- **Reverb effect**: Spatial reverb for depth and resonance
- **Debounced triggering**: Prevents rapid chord conflicts
- **Error handling**: Graceful handling of audio timing issues

### Chord Progression Modes

#### Circle of Fifths Mode
- **Layout**: Chords arranged in perfect fifths (C-G-D-A-E-B-F#-C#-G#-D#-A#-F)
- **Major chords**: Outer ring in circle of fifths order
- **Minor chords**: Inner ring in parallel minor keys
- **Harmonic logic**: Follows traditional harmonic relationships

#### Diatonic Mode
- **Layout**: Chords from the current key's diatonic scale
- **Major chords**: I, IV, V chords (outer ring)
- **Minor chords**: ii, iii, vi chords (inner ring)
- **Harmonic logic**: Stays within the current key signature

#### Chromatic Mode
- **Layout**: All 12 chromatic chords in semitone order
- **Major chords**: All major chords (C, C#, D, D#, etc.)
- **Minor chords**: All minor chords (Cm, C#m, Dm, D#m, etc.)
- **Harmonic logic**: Complete chromatic access

#### Jazz II-V-I Mode
- **Layout**: Common jazz progression patterns
- **Major chords**: I, IV chords (outer ring)
- **Minor chords**: ii, iii, vi chords (inner ring)
- **Seventh chords**: Optional extensions for jazz voicings
- **Harmonic logic**: Jazz harmony principles

#### Blues Mode
- **Layout**: Blues progression patterns
- **Major chords**: I, IV, V chords (outer ring)
- **Minor chords**: Blues minor variations (inner ring)
- **Seventh chords**: Dominant seventh chords emphasised
- **Harmonic logic**: Blues harmony with characteristic progressions

## Chord Wheel Layout

### Circle of Fifths Layout (Default)
```
        C
    G       F
  D           Bb
A               Eb
  E           Ab
    B       Db
        F#
```

### Major Chord Ring (Outer)
- **Position**: Outer circumference
- **Size**: Larger buttons (60px diameter)
- **Colour**: Warmer tones (oranges, yellows, reds)
- **Chords**: Major triads and extensions

### Minor Chord Ring (Inner)
- **Position**: Inner circumference
- **Size**: Smaller buttons (45px diameter)
- **Colour**: Cooler tones (blues, purples, greens)
- **Chords**: Minor triads and extensions

### Centre Area
- **Key indicator**: Shows current key and mode
- **Mode selector**: Quick access to progression modes
- **Audio status**: Visual feedback for audio state

## Chord Data Structure

### Chord Object
```javascript
{
  name: "C",                    // Chord name (string)
  notes: ["C4", "E4", "G4"],    // Array of note names
  type: "major",                // Chord type (major, minor, diminished, augmented)
  root: "C",                    // Root note
  quality: "major",             // Chord quality
  extensions: [],               // Optional extensions (7th, 9th, etc.)
  duration: 1,                  // Duration in beats (number)
  delay: 0,                     // Delay before play (number)
  startPosition: 0              // Position in timeline (number)
}
```

### Mode Configuration
```javascript
{
  name: "circle-of-fifths",
  displayName: "Circle of Fifths",
  description: "Chords arranged in perfect fifths",
  majorChords: ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"],
  minorChords: ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m", "Fm", "Cm", "Gm", "Dm"],
  layout: "circular",
  harmonicLogic: "perfect-fifths"
}
```

## Key Methods

### `render()`
Generates the chord wheel HTML with chord buttons and applies styling.

### `createChordButtons()`
Creates the circular chord button elements based on current key/mode.

### `playChord(chord, duration)`
Plays a specific chord with rich harmonic content and natural decay.

### `handleTouch(event)`
Processes touch events and triggers appropriate chord playback.

### `changeKey(key, scale)`
Changes the chord wheel's key and scale, updating available chords.

### `changeMode(mode)`
Changes the chord progression mode, updating chord layout and available chords.

### `createChordSynth()`
Creates a custom Tone.js PolySynth with chord-specific timbre using multiple oscillators and effects.

### `generateChordsForMode(key, scale, mode)`
Generates the appropriate chord set based on the current key, scale, and mode.

## Integration Patterns

### With Actions
```javascript
// Actions can trigger key changes
chordWheel.addEventListener('key-changed', (event) => {
  const { key, scale, chords } = event.detail;
  // Update other components or state
});

// Actions can trigger mode changes
chordWheel.addEventListener('mode-changed', (event) => {
  const { mode, chords } = event.detail;
  // Update other components or state
});
```

### With Tone.js
```javascript
// Custom chord synthesiser with rich harmonics
this.synth = new Tone.PolySynth({
  oscillator: {
    type: "triangle"  // Warm, rich sound
  },
  envelope: {
    attack: 0.02,     // Slightly longer attack for chords
    decay: 0.3,       // Medium decay
    sustain: 0.4,     // Higher sustain for chord body
    release: 3.0      // Long release for natural decay
  }
}).toDestination();

// Add spatial reverb for depth
this.reverb = new Tone.Reverb({
  decay: 2.0,
  wet: 0.4
}).toDestination();

// Connect synth to reverb
this.synth.connect(this.reverb);
```

### Event Flow
1. User taps chord button
2. ChordWheel plays chord via Tone.js PolySynth
3. Visual feedback shows on chord button
4. `chord-played` event dispatched
5. Chord decays naturally

## Styling

### CSS Classes
- `.chord-wheel`: Main chord wheel container
- `.chord-button`: Individual chord button styling
- `.chord-button.major`: Major chord button styling
- `.chord-button.minor`: Minor chord button styling
- `.chord-button.active`: Active/playing state
- `.key-indicator`: Centre key display
- `.mode-selector`: Mode selection interface
- `.ripple`: Touch ripple effect

### Visual Design
- **Circular layout**: Chord wheel shape with concentric rings
- **Metallic appearance**: Subtle metallic finish similar to HandPan
- **Chord button indicators**: Clear visual separation between major/minor
- **Responsive scaling**: Adapts to container size
- **Smooth animations**: Fluid transitions and effects
- **Colour coding**: Different colours for different chord types

## Testing Requirements

### Core Functionality
- All chord buttons render correctly
- Touch events trigger chord playback
- Key changes update chord layout
- Mode changes update chord progression
- Audio synthesis works properly

### Audio Integration
```javascript
test('should play chord when button is tapped', () => {
  const chordWheel = document.createElement('chord-wheel');
  document.body.appendChild(chordWheel);
  
  // Mock Tone.js
  const mockSynth = { triggerAttackRelease: jest.fn() };
  chordWheel.synth = mockSynth;
  
  // Tap first chord button
  const firstButton = chordWheel.shadowRoot.querySelector('.chord-button');
  fireEvent.touchStart(firstButton);
  
  expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
});
```

### Touch Interaction
```javascript
test('should support multi-touch', () => {
  const chordWheel = document.createElement('chord-wheel');
  document.body.appendChild(chordWheel);
  
  // Simulate multiple touches
  const buttons = chordWheel.shadowRoot.querySelectorAll('.chord-button');
  fireEvent.touchStart(buttons[0]);
  fireEvent.touchStart(buttons[1]);
  
  // Check that both chords are playing
  const activeButtons = chordWheel.shadowRoot.querySelectorAll('.chord-button.active');
  expect(activeButtons.length).toBe(2);
});
```

### Mode Changes
- Mode changes update chord layout correctly
- Chord progressions follow harmonic logic
- Visual indicators update appropriately
- Events are dispatched correctly

## Performance Considerations

### Audio Performance
- Efficient Tone.js PolySynth integration
- Minimal audio latency
- Proper chord triggering and release
- Memory management for synthesiser

### Touch Performance
- Responsive touch handling
- Efficient multi-touch processing
- Smooth visual feedback
- Minimal DOM manipulation

### Visual Performance
- Smooth animations and transitions
- Efficient rendering of chord buttons
- Responsive scaling
- Optimised CSS animations

## Future Enhancements

### Planned Features
- **Chord inversions**: Different voicings of the same chord
- **Custom progressions**: User-defined chord sequences
- **Recording**: Record chord wheel performances
- **Effects**: Reverb, delay, and other effects
- **MIDI support**: MIDI input/output
- **Chord analysis**: Real-time chord recognition
- **Voice leading**: Smooth voice leading between chords

### UI Improvements
- **Chord labels**: Show chord names on buttons
- **Progression indicators**: Visual guides for common progressions
- **Accessibility**: Screen reader support
- **Theming**: Customisable appearance
- **Mobile optimisation**: Enhanced mobile experience
- **Gesture support**: Swipe gestures for mode changes

### Advanced Modes

#### Modal Progressions
- **Dorian Mode**: i-ii-III-IV-v-vi°-VII progression
- **Mixolydian Mode**: I-ii-iii°-IV-v-vi-VII progression
- **Lydian Mode**: I-II-iii-#iv°-V-vi-vii progression
- **Phrygian Mode**: i-II-III-iv-v°-VI-vii progression
- **Locrian Mode**: i°-II-iii-iv-V-VI-vii progression

#### Jazz Extensions
- **Seventh Chords**: Major 7, Minor 7, Dominant 7, Minor 7b5
- **Ninth Chords**: Major 9, Minor 9, Dominant 9
- **Eleventh Chords**: Major 11, Minor 11, Dominant 11
- **Thirteenth Chords**: Major 13, Minor 13, Dominant 13
- **Altered Chords**: 7#5, 7b5, 7#9, 7b9, 7#11, 7b13

#### Slash Chords
- **Bass note variations**: C/E, Dm/F, G/B, Am/C
- **Inversions**: Root position, first inversion, second inversion
- **Bass line patterns**: Walking bass lines, pedal tones

#### Chord Substitutions
- **Tritone substitutions**: Dominant 7th chord substitutions
- **Relative minor/major**: Parallel key substitutions
- **Secondary dominants**: V of V, V of vi, etc.
- **Diminished substitutions**: Diminished chord patterns

#### Rhythmic Patterns
- **Common progressions**: I-V-vi-IV, ii-V-I, vi-IV-I-V
- **Blues progressions**: I-I-I-I-IV-IV-I-I-V-IV-I-V
- **Jazz progressions**: ii-V-I, iii-vi-ii-V, I-vi-ii-V
- **Pop progressions**: I-V-vi-IV, vi-IV-I-V, I-vi-IV-V

### Additional Pleasing Chord Combinations

#### Neo-Soul Progressions
- **Extended harmonies**: 9th, 11th, 13th chords
- **Modal interchange**: Borrowing chords from parallel modes
- **Smooth voice leading**: Minimal movement between chord tones
- **Rhythmic displacement**: Syncopated chord changes

#### Ambient/Atmospheric Progressions
- **Suspended chords**: Sus2, Sus4, Sus9
- **Open voicings**: Spread chord voicings
- **Pedal tones**: Sustained bass notes
- **Modal progressions**: Dorian, Lydian, Mixolydian

#### Folk/Acoustic Progressions
- **Open tunings**: Guitar-inspired chord voicings
- **Capo positions**: Transposed chord shapes
- **Fingerpicking patterns**: Arpeggiated chord progressions
- **Modal folk**: Mixolydian and Dorian progressions

#### Electronic/Dance Progressions
- **Minor progressions**: Dark, atmospheric chord sequences
- **Pentatonic harmony**: Simplified chord progressions
- **Ostinato patterns**: Repeated chord sequences
- **Modal progressions**: Aeolian, Phrygian progressions

## Related Components
- **HandPan**: Similar circular interface pattern
- **ChordPalette**: Traditional chord selection
- **PianoRoll**: Could record chord wheel performances
- **GigsoKeyboard**: Alternative chord interface
- **TransportControls**: Could control chord wheel playback

## Technical Notes

### Chord Timbre
The chord synthesiser should replicate rich harmonic content:
- **Oscillator type**: Triangle or sine wave base
- **Envelope**: Medium attack, medium decay, high sustain, long release
- **Effects**: Spatial reverb and subtle delay for depth
- **Harmonics**: Rich harmonic content for full chord sound

### Touch Handling
- **Touch events**: `touchstart`, `touchend`, `touchmove`
- **Mouse fallback**: Click events for desktop
- **Multi-touch**: Support for multiple simultaneous touches
- **Touch areas**: Adequate size for reliable interaction

### Audio Optimisation
- **Sample rate**: 44.1kHz minimum
- **Latency**: < 50ms response time
- **Polyphony**: Support for 12+ simultaneous chord voicings
- **Memory**: Efficient synthesiser management

### Harmonic Theory Integration
- **Circle of fifths**: Proper harmonic relationships
- **Diatonic harmony**: Key-appropriate chord progressions
- **Voice leading**: Smooth transitions between chords
- **Chord substitutions**: Common harmonic substitutions

## Implementation Guide

### File Structure
```
components/chord-wheel/
├── __tests__/
│   ├── chord-wheel.test.js
│   ├── chord-wheel-integration.test.js
│   └── chord-wheel-audio.test.js
├── chord-wheel.js
├── chord-wheel.css
└── README.md
```

### Component Registration
```javascript
// In main.js or component registration file
import ChordWheel from './components/chord-wheel/chord-wheel.js';
customElements.define('chord-wheel', ChordWheel);
```

### Usage Examples
```html
<!-- Basic usage -->
<chord-wheel></chord-wheel>

<!-- With custom settings -->
<chord-wheel 
  key="G" 
  scale="major" 
  size="large" 
  mode="diatonic">
</chord-wheel>
```

### JavaScript API
```javascript
// Get chord wheel component
const chordWheel = document.querySelector('chord-wheel');

// Change key and scale
chordWheel.setAttribute('key', 'F');
chordWheel.setAttribute('scale', 'minor');

// Change progression mode
chordWheel.setAttribute('mode', 'jazz-ii-v-i');

// Listen for chord events
chordWheel.addEventListener('chord-played', (event) => {
  const { chord, notes, duration } = event.detail;
  console.log('Chord played:', chord, 'Notes:', notes);
});

// Listen for key changes
chordWheel.addEventListener('key-changed', (event) => {
  const { key, scale, chords } = event.detail;
  console.log('Key changed to:', key, scale);
});
```

### Integration with Existing Components
```javascript
// Integration with PianoRoll
chordWheel.addEventListener('chord-played', (event) => {
  const pianoRoll = document.querySelector('piano-roll');
  pianoRoll.dispatchEvent(new CustomEvent('add-chord', {
    detail: event.detail
  }));
});

// Integration with HandPan
chordWheel.addEventListener('key-changed', (event) => {
  const handPan = document.querySelector('hand-pan');
  handPan.dispatchEvent(new CustomEvent('set-key', {
    detail: { key: event.detail.key, scale: event.detail.scale }
  }));
});

// Integration with state management
chordWheel.addEventListener('chord-played', (event) => {
  // Update current chord in state
  state.setCurrentChord(event.detail);
});
```

### Chord Generation Logic
```javascript
// Circle of Fifths chord generation
generateCircleOfFifthsChords(key, scale) {
  const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
  const startIndex = circleOfFifths.indexOf(key);
  
  const majorChords = [];
  const minorChords = [];
  
  for (let i = 0; i < 12; i++) {
    const chordKey = circleOfFifths[(startIndex + i) % 12];
    majorChords.push(this.createChord(chordKey, 'major'));
    minorChords.push(this.createChord(chordKey, 'minor'));
  }
  
  return { majorChords, minorChords };
}

// Diatonic chord generation
generateDiatonicChords(key, scale) {
  const scaleNotes = this.getScaleNotes(key, scale);
  const majorChords = [];
  const minorChords = [];
  
  // Generate chords based on scale degrees
  scaleNotes.forEach((note, index) => {
    const chordType = this.getDiatonicChordType(index, scale);
    if (chordType === 'major') {
      majorChords.push(this.createChord(note, 'major'));
    } else {
      minorChords.push(this.createChord(note, 'minor'));
    }
  });
  
  return { majorChords, minorChords };
}
```

### Audio Synthesis Configuration
```javascript
createChordSynth() {
  this.synth = new Tone.PolySynth({
    oscillator: {
      type: "triangle"  // Warm, rich sound
    },
    envelope: {
      attack: 0.02,     // Slightly longer attack for chords
      decay: 0.3,       // Medium decay
      sustain: 0.4,     // Higher sustain for chord body
      release: 3.0      // Long release for natural decay
    }
  });

  // Add spatial reverb for depth
  this.reverb = new Tone.Reverb({
    decay: 2.0,
    wet: 0.4
  });

  // Add subtle delay for richness
  this.delay = new Tone.PingPongDelay({
    delayTime: 0.25,
    feedback: 0.2,
    wet: 0.3
  });

  // Connect effects chain
  this.synth.connect(this.delay);
  this.delay.connect(this.reverb);
  this.reverb.toDestination();
}
```

### Testing Strategy
```javascript
// Test chord generation
describe('Chord Generation', () => {
  test('should generate correct circle of fifths chords', () => {
    const chordWheel = new ChordWheel();
    const chords = chordWheel.generateCircleOfFifthsChords('C', 'major');
    
    expect(chords.majorChords[0].name).toBe('C');
    expect(chords.majorChords[1].name).toBe('G');
    expect(chords.majorChords[2].name).toBe('D');
  });
  
  test('should generate correct diatonic chords', () => {
    const chordWheel = new ChordWheel();
    const chords = chordWheel.generateDiatonicChords('C', 'major');
    
    expect(chords.majorChords).toContainEqual(
      expect.objectContaining({ name: 'C' })
    );
    expect(chords.majorChords).toContainEqual(
      expect.objectContaining({ name: 'F' })
    );
    expect(chords.majorChords).toContainEqual(
      expect.objectContaining({ name: 'G' })
    );
  });
});

// Test audio integration
describe('Audio Integration', () => {
  test('should play chord when button is tapped', async () => {
    const chordWheel = document.createElement('chord-wheel');
    document.body.appendChild(chordWheel);
    
    // Mock Tone.js
    const mockSynth = { triggerAttackRelease: jest.fn() };
    chordWheel.synth = mockSynth;
    
    // Tap first chord button
    const firstButton = chordWheel.shadowRoot.querySelector('.chord-button');
    fireEvent.touchStart(firstButton);
    
    expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
  });
});
```

### Performance Optimisation
```javascript
// Debounced chord playback
playChord(chord, duration) {
  const now = Date.now();
  if (now - this.lastPlayTime < this.minChordInterval) {
    return;
  }
  this.lastPlayTime = now;
  
  // Play chord with proper timing
  this.synth.triggerAttackRelease(chord.notes, duration);
}

// Efficient chord generation caching
generateChordsForMode(key, scale, mode) {
  const cacheKey = `${key}-${scale}-${mode}`;
  if (this.chordCache && this.chordCache[cacheKey]) {
    return this.chordCache[cacheKey];
  }
  
  const chords = this.createChordsForMode(key, scale, mode);
  this.chordCache = this.chordCache || {};
  this.chordCache[cacheKey] = chords;
  
  return chords;
}
```