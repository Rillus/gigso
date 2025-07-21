# Fretboard UI Component - Technical Specification

## Table of Contents
1. [Introduction](#introduction)
2. [Core Functionality](#core-functionality)
3. [Technical Requirements](#technical-requirements)
4. [Phased Development Plan](#phased-development-plan)
5. [Data Structures](#data-structures)
6. [User Experience & Interactions](#user-experience--interactions)
7. [Component Architecture](#component-architecture)
8. [Implementation Details](#implementation-details)
9. [Accessibility](#accessibility)
10. [Testing Strategy](#testing-strategy)
11. [Performance Considerations](#performance-considerations)
12. [Future Considerations](#future-considerations)

---

## Introduction

The Fretboard UI component is a comprehensive visual representation system for string instruments, designed to display chord shapes, scale patterns, and note positions on a guitar, ukulele, or mandolin fretboard. This component integrates seamlessly with the existing Songstructor application architecture, extending the current chord diagram functionality to provide a full fretboard visualization experience.

### Primary Goals
- Provide an accurate visual representation of string instrument fretboards
- Enable interactive chord and scale visualization
- Support multiple instrument types with dynamic switching
- Maintain consistency with existing component architecture
- Ensure responsive design across all device types

---

## Core Functionality

### Phase 1 - MVP (Chord Display)

#### Instrument Representation
- **Fretboard Layout**: Horizontal orientation with strings running left-to-right and frets top-to-bottom
- **String Count**: Initially 6 strings for guitar, with support for 4-string ukulele and 8-string mandolin
- **Fret Range**: Minimum 12 frets, expandable to 24 frets based on viewport and user preference
- **Visual Elements**:
  - Nut representation at the leftmost edge
  - Bridge indicator (visual reference point)
  - Standard fret markers at positions 3, 5, 7, 9, 12, 15, 17, 19, 21, 24
  - Double dot marker at 12th fret
  - String gauges visually represented by line thickness

#### Chord Display System
- **Input Methods**:
  - Direct chord name input (e.g., "C", "Am", "G7", "Cmaj7")
  - Chord selector dropdown integrated with existing chord library
  - Support for chord variations and inversions
- **Visual Indicators**:
  - Finger positions marked with colored dots (configurable colors)
  - Fret numbers displayed within finger position markers
  - Open string indicators (○ symbol above nut)
  - Muted string indicators (× symbol above nut)
  - Root note highlighting with distinct visual treatment

#### Chord Library Integration
- Extend existing `chordLibrary.js` with comprehensive chord definitions
- Support for major, minor, 7th, maj7, min7, sus2, sus4, diminished, augmented chords
- Barre chord representations with visual barre indicators
- Alternative fingering options for the same chord

---

## Technical Requirements

### Technology Stack Integration
- **Framework**: Vanilla JavaScript ES6+ modules (consistent with existing codebase)
- **Component Base**: Extend `BaseComponent` class for Shadow DOM encapsulation
- **Styling**: CSS3 with custom properties for theming
- **State Management**: Integration with existing `State` system
- **Audio Integration**: Compatible with Tone.js for potential audio playback features
- **Testing**: Jest framework for unit and integration tests

### Browser Compatibility
- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile Support**: iOS 14+, Android Chrome 88+
- **Progressive Enhancement**: Graceful degradation for older browsers

### Performance Requirements
- **Initial Load**: Component initialization under 100ms
- **Chord Switching**: Visual updates under 16ms (60fps)
- **Memory Usage**: Maximum 10MB for component and associated data
- **Responsive Rendering**: Smooth scaling across viewport sizes

### Responsive Design Specifications
- **Desktop**: Full fretboard with all 24 frets visible
- **Tablet**: Scalable fretboard with horizontal scrolling for extended range
- **Mobile**: Optimized layout with touch-friendly interaction areas
- **Minimum Viewport**: 320px width compatibility

---

## Phased Development Plan

### Phase 1: MVP - Chord Display (Weeks 1-3)

**Week 1: Foundation**
- Component structure setup extending BaseComponent
- Basic fretboard SVG rendering system
- String and fret layout algorithms
- Responsive grid system implementation

**Week 2: Chord Integration**
- Chord library data structure expansion
- Finger position rendering system
- Open/muted string indicators
- Integration with existing chord selection mechanisms

**Week 3: Polish & Testing**
- Visual refinements and theming
- Unit test suite implementation
- Cross-device testing and optimization
- Documentation and code review

**Deliverables:**
- Functional fretboard component with chord display
- Integration with existing chord library
- Responsive design implementation
- Test suite with 80%+ coverage

### Phase 2: Scale & Key Visualization (Weeks 4-6)

**Week 4: Scale Data Structure**
- Scale pattern definitions (major, minor, pentatonic, blues, modes)
- Key signature handling and transposition logic
- Note-to-fretboard position mapping algorithms

**Week 5: Visual Implementation**
- Scale pattern highlighting system
- Root note emphasis and color coding
- Key selection interface components
- Multiple scale pattern overlay support

**Week 6: Advanced Features**
- Scale degree numbering display
- Interval highlighting (3rds, 5ths, 7ths)
- Scale practice mode with progressive note revelation

**Deliverables:**
- Complete scale visualization system
- Key selection and transposition features
- Enhanced visual feedback systems
- Extended test coverage

### Phase 3: Multi-Instrument Support (Weeks 7-9)

**Week 7: Instrument Abstraction**
- Instrument configuration system
- Dynamic tuning and string count handling
- Instrument-specific chord adaptations

**Week 8: Ukulele & Mandolin Implementation**
- 4-string ukulele layout and chord library
- 8-string mandolin (4 double courses) implementation
- Instrument switching interface

**Week 9: Cross-Instrument Features**
- Chord transposition between instruments
- Instrument-specific scale patterns
- Performance optimization for multiple instrument support

**Deliverables:**
- Multi-instrument architecture
- Complete ukulele and mandolin support
- Instrument switching functionality
- Comprehensive test suite across all instruments

---

## Data Structures

### Instrument Configuration
```javascript
const instrumentConfig = {
  guitar: {
    strings: 6,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'], // Low to high
    fretCount: 24,
    stringSpacing: 20, // px
    fretSpacing: 30,   // px
    markers: [3, 5, 7, 9, 12, 15, 17, 19, 21, 24],
    doubleMarkers: [12, 24],
    stringGauges: [0.046, 0.036, 0.026, 0.017, 0.013, 0.010]
  },
  ukulele: {
    strings: 4,
    tuning: ['G', 'C', 'E', 'A'],
    fretCount: 15,
    stringSpacing: 25,
    fretSpacing: 35,
    markers: [3, 5, 7, 10, 12, 15],
    doubleMarkers: [12],
    stringGauges: [0.032, 0.024, 0.028, 0.021]
  },
  mandolin: {
    strings: 8,
    courses: 4, // Double strings
    tuning: ['G', 'D', 'A', 'E'], // Course tuning
    fretCount: 20,
    stringSpacing: 12,
    fretSpacing: 25,
    markers: [3, 5, 7, 9, 12, 15, 17, 19],
    doubleMarkers: [12],
    stringGauges: [0.011, 0.011, 0.016, 0.016, 0.026, 0.026, 0.040, 0.040]
  }
};
```

### Enhanced Chord Structure
```javascript
const extendedChordLibrary = {
  'C': {
    guitar: {
      variations: [
        {
          name: 'Open C',
          positions: [null, 3, 2, 0, 1, 0],
          fingering: [null, 3, 2, null, 1, null],
          difficulty: 'beginner',
          barre: null
        },
        {
          name: 'C Barre (8th fret)',
          positions: [8, 10, 10, 9, 8, 8],
          fingering: [1, 3, 4, 2, 1, 1],
          difficulty: 'intermediate',
          barre: { fret: 8, fromString: 1, toString: 6 }
        }
      ]
    },
    ukulele: {
      variations: [
        {
          name: 'Open C',
          positions: [0, 0, 0, 3],
          fingering: [null, null, null, 3],
          difficulty: 'beginner'
        }
      ]
    }
  }
};
```

### Scale Pattern Structure
```javascript
const scalePatterns = {
  major: {
    intervals: [0, 2, 4, 5, 7, 9, 11], // Semitones from root
    degrees: ['1', '2', '3', '4', '5', '6', '7'],
    name: 'Major Scale'
  },
  naturalMinor: {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    name: 'Natural Minor Scale'
  },
  pentatonicMajor: {
    intervals: [0, 2, 4, 7, 9],
    degrees: ['1', '2', '3', '5', '6'],
    name: 'Major Pentatonic Scale'
  }
};
```

### Note Position Mapping
```javascript
const notePositions = {
  generatePositions: (instrument, note, octaveRange = 1) => {
    // Algorithm to calculate all positions of a given note
    // across the fretboard for the specified instrument
    return positions; // Array of {string, fret, octave} objects
  },
  
  getScalePositions: (instrument, rootNote, scaleType) => {
    // Generate all positions for notes in the specified scale
    return scalePositions;
  }
};
```

---

## User Experience & Interactions

### Visual Design Principles
- **Clarity**: Unambiguous representation of finger positions and note names
- **Consistency**: Uniform visual language across all instrument types
- **Accessibility**: High contrast ratios and scalable text
- **Responsiveness**: Adaptive layout maintaining usability across devices

### Interaction Patterns

#### Primary Interactions
1. **Chord Selection**
   - Dropdown selector with chord name autocomplete
   - Direct text input with validation
   - Visual chord picker interface

2. **Key/Scale Selection**
   - Key signature dropdown (C, G, D, A, E, B, F#, Db, Ab, Eb, Bb, F)
   - Mode selector (Ionian, Dorian, Phrygian, etc.)
   - Scale type selector (Major, Minor, Pentatonic, Blues)

3. **Instrument Switching**
   - Instrument toggle buttons
   - Smooth transition animations
   - Maintained state across instrument changes

#### Secondary Interactions
1. **Fretboard Navigation**
   - Horizontal scroll for extended fret range
   - Zoom controls for detailed viewing
   - Fret range selector (1-12, 13-24, etc.)

2. **Customization Options**
   - Color theme selection
   - Marker style preferences
   - Note name display toggle (Letter names, Scale degrees, Intervals)

### Feedback Mechanisms
- **Visual Feedback**: Highlighted hover states, smooth transitions
- **Audio Feedback**: Optional note playback on position click (Tone.js integration)
- **Haptic Feedback**: Subtle vibration on mobile devices for touch interactions

---

## Component Architecture

### File Structure
```
components/fretboard/
├── fretboard.js                 # Main component class
├── fretboard-renderer.js        # SVG rendering engine
├── fretboard-calculator.js      # Position calculation utilities
├── fretboard-themes.js          # Visual theme definitions
├── __tests__/
│   ├── fretboard.test.js
│   ├── renderer.test.js
│   └── calculator.test.js
└── styles/
    ├── fretboard-base.css
    ├── fretboard-themes.css
    └── fretboard-responsive.css
```

### Component Interface
```javascript
export default class Fretboard extends BaseComponent {
  constructor(options = {}) {
    // Initialize with instrument, theme, and display options
  }

  // Public API Methods
  displayChord(chordName, variation = 0) {}
  displayScale(rootNote, scaleType, key = 'C') {}
  setInstrument(instrumentType) {}
  setTheme(themeName) {}
  setFretRange(startFret, endFret) {}
  
  // Event Methods
  onNoteClick(callback) {}
  onChordChange(callback) {}
  onScaleChange(callback) {}
}
```

### Integration Points
- **State Management**: Subscribe to global chord and key changes
- **Chord Library**: Extend existing chord data structures
- **Audio System**: Optional integration with Tone.js for sound generation
- **Theme System**: Coordinate with application-wide theming

---

## Implementation Details

### SVG Rendering System
The fretboard will be rendered using SVG for scalability and precision:

```javascript
class FretboardRenderer {
  constructor(container, instrument, options) {
    this.svg = this.createSVG();
    this.instrument = instrument;
    this.options = { ...defaultOptions, ...options };
  }

  render() {
    this.renderStrings();
    this.renderFrets();
    this.renderMarkers();
    this.renderNut();
  }

  renderFingerPositions(positions) {
    // Dynamic finger position rendering
  }

  renderScalePattern(notes) {
    // Scale highlighting system
  }
}
```

### Responsive Calculations
```javascript
class ResponsiveCalculator {
  static calculateDimensions(viewport, instrument) {
    const baseWidth = viewport.width * 0.9;
    const fretWidth = baseWidth / instrument.fretCount;
    const stringHeight = Math.min(40, viewport.height / 8);
    
    return {
      fretWidth: Math.max(20, fretWidth),
      stringHeight,
      totalWidth: baseWidth,
      totalHeight: stringHeight * instrument.strings
    };
  }
}
```

### Performance Optimizations
- **Virtual Rendering**: Only render visible frets in viewport
- **Canvas Fallback**: Optional canvas rendering for complex visualizations
- **Debounced Updates**: Throttle rapid chord/scale changes
- **Lazy Loading**: Progressive enhancement of advanced features

---

## Accessibility

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for all text and markers
- **Focus Management**: Keyboard navigation support
- **Screen Reader Support**: Comprehensive ARIA labeling
- **Motor Accessibility**: Large touch targets (minimum 44px)

### ARIA Implementation
```html
<div role="application" 
     aria-label="Guitar Fretboard Visualization"
     aria-describedby="fretboard-instructions">
  
  <div role="grid" aria-label="Fretboard strings and frets">
    <div role="row" aria-label="String 1 - High E">
      <div role="gridcell" 
           aria-label="Fret 1, String 1"
           aria-pressed="false"
           tabindex="0">
      </div>
    </div>
  </div>
</div>
```

### Keyboard Navigation
- **Tab Navigation**: Sequential focus through fret positions
- **Arrow Keys**: Navigate between strings and frets
- **Space/Enter**: Activate position selection
- **Escape**: Clear current selection

### Screen Reader Support
- Descriptive labels for all fretboard positions
- Chord name and fingering announcements
- Scale pattern descriptions
- Instrument change notifications

---

## Testing Strategy

### Unit Tests
```javascript
// Example test structure
describe('Fretboard Component', () => {
  describe('Chord Display', () => {
    test('should render C major chord correctly', () => {
      const fretboard = new Fretboard({ instrument: 'guitar' });
      fretboard.displayChord('C');
      
      expect(fretboard.getFingerPositions()).toEqual([
        { string: 1, fret: 3 },
        { string: 2, fret: 2 },
        { string: 4, fret: 1 }
      ]);
    });
  });

  describe('Scale Visualization', () => {
    test('should highlight C major scale positions', () => {
      const fretboard = new Fretboard({ instrument: 'guitar' });
      fretboard.displayScale('C', 'major');
      
      const positions = fretboard.getScalePositions();
      expect(positions.length).toBeGreaterThan(20);
    });
  });
});
```

### Integration Tests
- Component integration with existing chord library
- State management synchronization
- Event handling and propagation
- Theme switching functionality

### Visual Regression Tests
- Screenshot comparison testing for chord layouts
- Cross-browser rendering consistency
- Responsive layout verification
- Theme variation validation

### Performance Tests
- Rendering speed benchmarks
- Memory usage monitoring
- Interaction responsiveness measurement
- Mobile device performance validation

---

## Performance Considerations

### Rendering Optimization
- **Efficient DOM Updates**: Minimize reflows and repaints
- **SVG Optimization**: Reuse elements and minimize path complexity
- **Animation Performance**: Use CSS transforms and opacity for smooth transitions
- **Memory Management**: Proper cleanup of event listeners and references

### Data Management
- **Lazy Loading**: Load chord variations and scales on demand
- **Caching Strategy**: Cache calculated positions and rendered elements
- **Compression**: Minimize chord library data size
- **Indexing**: Efficient lookups for chord and scale data

### Mobile Optimization
- **Touch Optimization**: Appropriate touch target sizes
- **Gesture Support**: Pinch-to-zoom and pan gestures
- **Battery Efficiency**: Minimize continuous animations
- **Network Efficiency**: Optimize asset loading

---

## Future Considerations

### Phase 4+ Features
- **Interactive Learning Mode**: Progressive chord and scale tutorials
- **Custom Tunings**: Support for alternate guitar tunings
- **MIDI Integration**: Connect with MIDI controllers and devices
- **Audio Recording**: Capture and playback fretboard interactions
- **Social Features**: Share chord progressions and scale patterns

### Advanced Instruments
- **Bass Guitar**: 4-string and 5-string bass support
- **Banjo**: 4-string and 5-string banjo layouts
- **Extended Range**: 7-string and 8-string guitar support
- **Pedal Steel**: Specialized layout for pedal steel guitar

### Technology Evolution
- **Web Audio API**: Advanced audio synthesis capabilities
- **WebGL**: Hardware-accelerated 3D fretboard rendering
- **Progressive Web App**: Offline functionality and native app features
- **Voice Control**: Voice-activated chord and scale selection

### Integration Opportunities
- **Music Theory Engine**: Automatic chord progression suggestions
- **Practice Tools**: Metronome integration and practice tracking
- **Export Capabilities**: Generate tablature and chord charts
- **Collaboration Features**: Real-time multi-user fretboard sessions

---

## Conclusion

The Fretboard UI component represents a comprehensive solution for string instrument visualization within the Songstructor ecosystem. By following this phased development approach, we ensure a robust, accessible, and performant component that enhances the user experience while maintaining consistency with the existing codebase architecture.

The modular design allows for future expansion and customization while the thorough testing strategy ensures reliability across all supported platforms and devices. This specification provides a clear roadmap for implementation while leaving room for innovation and feature enhancement in future development cycles.