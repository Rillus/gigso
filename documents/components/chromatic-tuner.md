# Chromatic Tuner Component Specification

## Overview
The Chromatic Tuner component provides precise instrument tuning functionality with real-time frequency detection and visual feedback. It features a professional tuner interface with needle display, frequency readout, and support for multiple instruments.

## Component Details

**File:** `components/chromatic-tuner/chromatic-tuner.js`  
**Tag Name:** `<chromatic-tuner>`  
**Extends:** `BaseComponent`  
**Demo:** `chromatic-tuner-demo.html`

## Purpose
Provides accurate chromatic tuning for musical instruments with real-time audio analysis, visual feedback, and support for multiple instrument types including guitar, ukulele, mandolin, and more.

## Inputs

### Events
- **`frequency-detected`** (global): Receives frequency data from frequency monitor
- **`volume-detected`** (global): Receives volume level data for threshold detection
- **`instrument-selected`** (global): Receives instrument selection changes

### Properties
- **`currentInstrument`**: Currently selected instrument (guitar, ukulele, mandolin)
- **`volumeThreshold`**: Minimum RMS volume to activate tuner (default: 0.01)
- **`referenceFrequency`**: Reference frequency for tuning (default: 440 Hz)

## Outputs

### Visual Display
- **Frequency Display**: Shows current detected frequency in Hz
- **Note Display**: Shows closest note name
- **Instrument Display**: Shows current instrument type
- **Needle Display**: Visual needle indicating tuning accuracy (-50 to +50 cents)
- **Tuning Ticks**: Scale markings for visual reference

### Events
- **`pitch-detected`**: Dispatched when a pitch is detected
- **`in-tune`**: Dispatched when note is within tuning tolerance
- **`out-of-tune`**: Dispatched when note needs adjustment

## Expected Behaviour

### Audio Processing
- Listens for frequency detection events from global frequency monitor
- Processes audio input with volume threshold filtering
- Calculates closest note and cents deviation from target frequency
- Updates visual display in real-time

### Visual Feedback
- **Needle Position**: Maps cents deviation to needle angle (-50 to +50 degrees)
- **Frequency Display**: Shows rounded frequency value or "-- Hz" when no signal
- **Note Display**: Shows note name or "--" when no signal
- **Volume Threshold**: Shows "Too Quiet" when signal is below threshold

### Instrument Support
- **Guitar**: 6-string standard tuning (E2, A2, D3, G3, B3, E4)
- **Ukulele**: 4-string standard tuning (G4, C4, E4, A4)
- **Mandolin**: 4-string standard tuning (G3, D4, A4, E5)
- **Extensible**: Easy to add new instruments via INSTRUMENT_RANGES

## Technical Implementation

### Audio Analysis
```javascript
// Cents calculation for tuning accuracy
getCents(frequency, targetFrequency) {
  return 1200 * Math.log2(frequency / targetFrequency);
}

// Volume threshold filtering
if (this.currentVolume < this.volumeThreshold) {
  // Signal too weak - reset display
  this.setNeedleAngle(-50);
  this.showQuietMessage();
  return;
}
```

### Visual Rendering
```javascript
// Needle angle calculation
const angle = Math.max(-50, Math.min(50, cents));
this.setNeedleAngle(angle);

// Dynamic tick rendering
renderTicks() {
  // Creates 21 tick marks from -50 to +50 cents
  // Major ticks every 25 cents, minor ticks every 12.5 cents
}
```

## Styling

### Visual Design
- **Tuner Face**: Semi-circular gradient background (green to dark green)
- **Needle**: Red gradient needle with smooth rotation animation
- **Ticks**: Black tick marks with labels for cents values
- **Text**: Bold, high-contrast text with text shadows
- **Responsive**: Adapts to different container sizes

### CSS Features
- **Shadow DOM**: Isolated styles prevent conflicts
- **Smooth Animations**: Cubic-bezier transitions for needle movement
- **Professional Appearance**: Metallic finish with realistic shadows
- **Accessibility**: High contrast text and clear visual indicators

## API Methods

### Public Methods
```javascript
// Set instrument type
setInstrument(instrumentName) {
  this.currentInstrument = instrumentName;
  this.updateInstrumentDisplay();
  this.renderTicks();
}

// Set reference frequency
setReferenceFrequency(frequency) {
  this.referenceFrequency = frequency;
}

// Set sensitivity threshold
setSensitivity(level) {
  this.volumeThreshold = this.getSensitivityValue(level);
}

// Start tuning mode
startTuning() {
  // Enable audio processing
}

// Stop tuning mode
stopTuning() {
  // Disable audio processing
}
```

### Event Handlers
```javascript
// Handle frequency detection
handleFrequencyDetected(event) {
  const { frequency, note, cents } = event.detail;
  // Process and display frequency data
}

// Handle instrument selection
handleInstrumentSelected(event) {
  const instrument = event.detail.toLowerCase();
  // Update instrument and re-render ticks
}

// Handle volume detection
handleVolumeDetected(event) {
  this.currentVolume = event.detail.rms;
}
```

## Integration

### With Frequency Monitor
- Receives real-time frequency data
- Processes audio analysis results
- Responds to volume level changes

### With Instrument Selector
- Updates tuner configuration based on instrument selection
- Re-renders tick marks for new instrument
- Adjusts target frequencies automatically

### With Other Components
- Can be integrated into any music application
- Works standalone or as part of larger system
- Maintains state independently

## Performance Considerations

### Audio Processing
- **Efficient Calculations**: Optimized frequency analysis
- **Threshold Filtering**: Reduces unnecessary processing
- **Smooth Updates**: 60fps visual updates with requestAnimationFrame

### Memory Management
- **Event Listener Cleanup**: Proper cleanup in disconnectedCallback
- **DOM Optimization**: Minimal DOM manipulation
- **Garbage Collection**: Efficient object lifecycle management

## Accessibility

### Visual Accessibility
- **High Contrast**: Clear visual indicators
- **Large Text**: Readable frequency and note displays
- **Clear Labels**: Descriptive text for all elements

### Keyboard Navigation
- **Focus Management**: Proper focus handling
- **Keyboard Events**: Support for keyboard interaction
- **Screen Reader**: Semantic HTML structure

## Testing

### Test Coverage
- **Frequency Detection**: Various frequency inputs
- **Instrument Switching**: All supported instruments
- **Volume Thresholds**: Different sensitivity levels
- **Visual Updates**: Needle position accuracy
- **Event Handling**: All event types and edge cases

### Test Scenarios
```javascript
// Test frequency detection
test('detects correct frequency', () => {
  // Simulate frequency detection event
  // Verify correct note and cents calculation
});

// Test instrument switching
test('switches instruments correctly', () => {
  // Change instrument
  // Verify tick marks update
  // Verify target frequencies change
});

// Test volume threshold
test('handles low volume correctly', () => {
  // Simulate low volume
  // Verify "Too Quiet" message
  // Verify needle resets
});
```

## Future Enhancements

### Planned Features
- **Microphone Input**: Direct audio input support
- **Custom Instruments**: User-defined instrument configurations
- **Tuning Modes**: Different tuning systems (equal temperament, just intonation)
- **Calibration**: User-adjustable reference frequency
- **Recording**: Save tuning sessions and history

### Performance Improvements
- **Web Audio API**: Direct audio processing
- **Web Workers**: Background frequency analysis
- **GPU Acceleration**: Hardware-accelerated visual effects

## Usage Examples

### Basic Usage
```html
<chromatic-tuner></chromatic-tuner>
```

### With Configuration
```html
<chromatic-tuner 
  instrument="guitar" 
  reference="440" 
  sensitivity="high">
</chromatic-tuner>
```

### JavaScript Integration
```javascript
const tuner = document.querySelector('chromatic-tuner');

// Listen for tuning events
tuner.addEventListener('pitch-detected', (e) => {
  console.log('Pitch:', e.detail.note, e.detail.frequency);
});

tuner.addEventListener('in-tune', (e) => {
  console.log('In tune:', e.detail.note);
});

// Configure tuner
tuner.setInstrument('ukulele');
tuner.setSensitivity('medium');
tuner.startTuning();
```

## Dependencies

### External Dependencies
- **BaseComponent**: Base class for Web Component functionality
- **Frequency Monitor**: Global frequency detection system
- **Audio Context**: Web Audio API for audio processing

### Browser Requirements
- **Web Audio API**: For audio analysis
- **Custom Elements**: For Web Component support
- **Shadow DOM**: For style encapsulation
- **ES6 Modules**: For module system

## Browser Support
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

---

*This specification provides comprehensive documentation for the Chromatic Tuner component, including technical details, usage examples, and integration patterns. The component demonstrates advanced Web Component capabilities with real-time audio processing and professional visual design.*
