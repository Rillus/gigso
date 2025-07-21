# Fretboard Component

The Fretboard component is a comprehensive visual representation system for string instruments, designed to display chord shapes, scale patterns, and note positions on guitar, ukulele, and mandolin fretboards.

## Overview

This component integrates seamlessly with the existing Songstructor application architecture, extending the current chord diagram functionality to provide a full fretboard visualization experience.

## Features

- **Multi-instrument Support**: Guitar (6-string), Ukulele (4-string), and Mandolin (8-string/4-course)
- **Chord Visualization**: Display chord shapes with finger positions and fret numbers
- **Scale Patterns**: Show scale patterns with root note highlighting
- **Interactive**: Clickable fret positions with note feedback
- **Responsive Design**: Adapts to different screen sizes and devices
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Real-time Updates**: Responds to global state changes for chords and instruments

## Usage

### Basic Setup

```javascript
import Fretboard from './components/fretboard/fretboard.js';

// Create fretboard element
const fretboard = new Fretboard({
  instrument: 'guitar',
  fretRange: { start: 0, end: 12 },
  theme: 'default'
});

// Add to DOM
document.body.appendChild(fretboard);
```

### HTML Usage

```html
<!-- Basic fretboard -->
<fretboard-component></fretboard-component>

<!-- With attributes -->
<fretboard-component 
  instrument="ukulele" 
  chord="C" 
  scale-root="C" 
  scale-type="major">
</fretboard-component>
```

### Displaying Chords

```javascript
// Display a C major chord
fretboard.displayChord('C');

// Display specific chord variation
fretboard.displayChord('C', 1);

// Clear chord display
fretboard.displayChord(null);
```

### Displaying Scales

```javascript
// Display C major scale
fretboard.displayScale('C', 'major');

// Display A minor pentatonic scale
fretboard.displayScale('A', 'pentatonicMinor');

// Display with key context
fretboard.displayScale('D', 'major', 'D');
```

### Changing Instruments

```javascript
// Switch to ukulele
fretboard.setInstrument('ukulele');

// Switch to mandolin
fretboard.setInstrument('mandolin');
```

### Event Handling

```javascript
// Listen for note clicks
fretboard.onNoteClick((event) => {
  const { string, fret, note } = event.detail;
  console.log(`Clicked: String ${string}, Fret ${fret}, Note ${note}`);
});

// Listen for chord changes
fretboard.onChordChange((event) => {
  console.log('Chord changed:', event.detail);
});

// Listen for scale changes
fretboard.onScaleChange((event) => {
  console.log('Scale changed:', event.detail);
});
```

## API Reference

### Constructor Options

```javascript
const options = {
  instrument: 'guitar',        // 'guitar', 'ukulele', 'mandolin'
  fretRange: {                 // Visible fret range
    start: 0,
    end: 12
  },
  theme: 'default',            // Theme name
  showNoteNames: true,         // Show note names on scale markers
  showFretNumbers: true        // Show fret numbers below frets
};
```

### Public Methods

#### `displayChord(chordName, variation = 0)`
Display a chord on the fretboard.

- `chordName` (string): Name of the chord (e.g., 'C', 'Am', 'G7')
- `variation` (number): Chord variation index (default: 0)

#### `displayScale(rootNote, scaleType, key = 'C')`
Display a scale pattern on the fretboard.

- `rootNote` (string): Root note of the scale
- `scaleType` (string): Scale type ('major', 'naturalMinor', 'pentatonicMajor', etc.)
- `key` (string): Key context (default: 'C')

#### `setInstrument(instrumentType)`
Change the instrument type.

- `instrumentType` (string): 'guitar', 'ukulele', or 'mandolin'

#### `setFretRange(startFret, endFret)`
Set the visible fret range.

- `startFret` (number): Starting fret number
- `endFret` (number): Ending fret number

#### `setTheme(themeName)`
Change the visual theme.

- `themeName` (string): Theme name

#### `clearDisplay()`
Clear all chord and scale displays.

#### `onNoteClick(callback)`
Register callback for note click events.

- `callback` (function): Event handler function

#### `onChordChange(callback)`
Register callback for chord change events.

- `callback` (function): Event handler function

#### `onScaleChange(callback)`
Register callback for scale change events.

- `callback` (function): Event handler function

### Observed Attributes

- `instrument`: Changes the instrument type
- `chord`: Displays the specified chord
- `scale-root`: Sets the scale root note
- `scale-type`: Sets the scale type

### Custom Events

#### `note-clicked`
Fired when a fret position is clicked.

```javascript
event.detail = {
  string: 0,      // String index (0-based)
  fret: 3,        // Fret number
  note: 'G'       // Note name
}
```

#### `chord-changed`
Fired when the displayed chord changes.

#### `scale-changed`
Fired when the displayed scale changes.

## Integration with Existing Architecture

### State Management

The fretboard component integrates with the global state system:

```javascript
import State from '../../state/state.js';

// Responds to instrument changes
State.setInstrument('ukulele');

// Responds to chord changes
State.setCurrentChord('Am');
```

### Chord Library Integration

Uses the existing chord library structure:

```javascript
import chordLibrary from '../../chord-library.js';

// Automatically uses chord definitions from the library
fretboard.displayChord('C'); // Uses chordLibrary.chords['C']
```

### Event System

Follows the existing event handling patterns:

```javascript
// Listen for global events
this.addEventListener('set-chord', (event) => {
  this.displayChord(event.detail);
});

this.addEventListener('set-instrument', (event) => {
  this.setInstrument(event.detail);
});
```

## Supported Instruments

### Guitar (6-string)
- Tuning: E-A-D-G-B-E (low to high)
- Fret range: 0-24
- Standard fret markers at positions 3, 5, 7, 9, 12, 15, 17, 19, 21, 24

### Ukulele (4-string)
- Tuning: G-C-E-A
- Fret range: 0-15
- Fret markers at positions 3, 5, 7, 10, 12, 15

### Mandolin (8-string/4-course)
- Tuning: G-D-A-E (each course doubled)
- Fret range: 0-20
- Fret markers at positions 3, 5, 7, 9, 12, 15, 17, 19

## Supported Scales

- **major**: Major scale (Ionian mode)
- **naturalMinor**: Natural minor scale (Aeolian mode)
- **pentatonicMajor**: Major pentatonic scale
- **pentatonicMinor**: Minor pentatonic scale
- **blues**: Blues scale
- **dorian**: Dorian mode
- **mixolydian**: Mixolydian mode

## Responsive Design

The component adapts to different screen sizes:

- **Desktop**: Full fretboard with all features visible
- **Tablet**: Scalable layout with horizontal scrolling
- **Mobile**: Optimized for touch interaction with adjusted sizing

## Accessibility Features

- **Keyboard Navigation**: Tab through fret positions, arrow key navigation
- **Screen Reader Support**: Comprehensive ARIA labeling and descriptions
- **High Contrast**: Supports high contrast color schemes
- **Reduced Motion**: Respects prefers-reduced-motion setting
- **Focus Management**: Clear focus indicators and logical tab order

## Theming

The component supports theming through CSS custom properties:

```css
:root {
  --fretboard-bg: #f8f9fa;
  --fretboard-border: #dee2e6;
  --string-color: #B8860B;
  --fret-color: #C0C0C0;
  --chord-color: #FF6B6B;
  --scale-color: #4ECDC4;
  --root-note-color: #26D0CE;
}
```

## Performance Considerations

- **Virtual Rendering**: Only renders visible fret range
- **Efficient Updates**: Minimal DOM manipulation for chord/scale changes
- **Memory Management**: Proper cleanup of event listeners
- **Responsive Calculations**: Optimized dimension calculations

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS 14+, Android Chrome 88+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Development

### Running Tests

```bash
npm test -- components/fretboard/__tests__/fretboard.test.js
```

### Building

The component is built with vanilla JavaScript and requires no build step for basic usage.

### Contributing

When contributing to the fretboard component:

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure accessibility compliance
5. Test across different devices and browsers

## Examples

### Basic Chord Display

```html
<!DOCTYPE html>
<html>
<head>
  <title>Fretboard Example</title>
</head>
<body>
  <fretboard-component chord="C" instrument="guitar"></fretboard-component>
  
  <script type="module">
    import './components/fretboard/fretboard.js';
  </script>
</body>
</html>
```

### Interactive Scale Explorer

```javascript
import Fretboard from './components/fretboard/fretboard.js';

const fretboard = new Fretboard();
document.body.appendChild(fretboard);

// Create scale selector
const scaleSelect = document.createElement('select');
const scales = ['major', 'naturalMinor', 'pentatonicMajor', 'blues'];
scales.forEach(scale => {
  const option = document.createElement('option');
  option.value = scale;
  option.textContent = scale;
  scaleSelect.appendChild(option);
});

scaleSelect.addEventListener('change', (e) => {
  fretboard.displayScale('C', e.target.value);
});

document.body.appendChild(scaleSelect);
```

### Chord Progression Display

```javascript
const chords = ['C', 'Am', 'F', 'G'];
let currentChord = 0;

function nextChord() {
  fretboard.displayChord(chords[currentChord]);
  currentChord = (currentChord + 1) % chords.length;
}

// Auto-advance every 2 seconds
setInterval(nextChord, 2000);
nextChord(); // Start immediately
```

## Troubleshooting

### Common Issues

**Chord not displaying**: Check that the chord exists in the chord library for the current instrument.

**Scale positions incorrect**: Verify that the scale type is supported and the root note is valid.

**Responsive issues**: Ensure the container has proper dimensions and the component can calculate its size.

**Event handling problems**: Make sure event listeners are properly registered and the component is in the DOM.

### Debug Mode

Enable debug logging:

```javascript
const fretboard = new Fretboard({ debug: true });
```

This will log component state changes and method calls to the console.