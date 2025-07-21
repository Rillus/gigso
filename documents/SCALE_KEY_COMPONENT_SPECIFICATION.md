# Scale/Key Component - Technical Specification

## Table of Contents
1. [Introduction](#introduction)
2. [Core Functionality](#core-functionality)
3. [API Specification](#api-specification)
4. [Data Structures](#data-structures)
5. [Component Architecture](#component-architecture)
6. [Integration Patterns](#integration-patterns)
7. [Implementation Details](#implementation-details)
8. [Usage Examples](#usage-examples)
9. [Testing Strategy](#testing-strategy)
10. [Future Considerations](#future-considerations)

---

## Introduction

The Scale/Key Component is a reusable musical utility system designed to provide consistent scale and key selection functionality across multiple musical instruments and components in the Songstructor application. This component serves as a central hub for musical theory calculations, note generation, and key/scale management.

### Primary Goals
- Provide a unified API for scale and key operations across all musical components
- Ensure consistency in musical theory calculations and note generation
- Support multiple instrument types with appropriate scale adaptations
- Maintain integration with existing state management and component architecture
- Enable extensibility for future musical theory features

### Target Components
- **HandPan Component**: Scale-based note generation and key changes
- **Fretboard Component**: Scale visualization and chord-scale relationships
- **Chord Components**: Scale-aware chord suggestions and progressions
- **Piano/Keyboard Components**: Scale highlighting and key signatures
- **Future Instruments**: Expandable architecture for new musical instruments

---

## Core Functionality

### Musical Theory Engine
- **Scale Generation**: Generate notes for any key and scale type combination
- **Key Transposition**: Convert scales and notes between different keys
- **Interval Calculations**: Calculate musical intervals and relationships
- **Mode Support**: Generate and work with musical modes (Ionian, Dorian, etc.)
- **Chord-Scale Relationships**: Determine compatible chords for given scales

### Scale Types Supported
- **Major Scales**: Natural major, major modes
- **Minor Scales**: Natural minor, harmonic minor, melodic minor
- **Pentatonic Scales**: Major pentatonic, minor pentatonic
- **Blues Scales**: Traditional blues scale patterns
- **Exotic Scales**: World music scales (Phrygian dominant, etc.)
- **Custom Scales**: User-defined scale patterns

### Key Management
- **Chromatic Key Support**: All 12 chromatic keys (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- **Enharmonic Equivalents**: Handle both sharp and flat notations
- **Key Signatures**: Traditional key signature support
- **Relative Keys**: Major/minor relative key relationships

---

## API Specification

### Core Classes

#### `ScaleKey` - Main Component Class
```javascript
class ScaleKey {
    constructor(options = {}) {}
    
    // Scale Generation
    generateScale(key, scaleType, options = {}) {}
    getScaleNotes(key, scaleType, octave = 4) {}
    getScalePattern(scaleType) {}
    
    // Key Operations
    transposeKey(fromKey, toKey, notes) {}
    getRelativeKey(key, scaleType) {}
    getKeySignature(key, scaleType) {}
    
    // Validation
    isValidKey(key) {}
    isValidScale(scaleType) {}
    validateKeyScale(key, scaleType) {}
    
    // Utility Methods
    getNoteFrequency(note) {}
    getIntervalFromRoot(rootNote, targetNote) {}
    getChordSuggestions(key, scaleType) {}
    
    // Events
    addEventListener(event, callback) {}
    removeEventListener(event, callback) {}
    dispatchEvent(eventName, detail) {}
}
```

#### `ScalePattern` - Scale Definition Class
```javascript
class ScalePattern {
    constructor(name, intervals, degrees, metadata = {}) {}
    
    // Properties
    getName() {}
    getIntervals() {}
    getDegrees() {}
    getMetadata() {}
    
    // Generation
    generateNotes(rootKey, octave = 4) {}
    getNotesInRange(rootKey, startOctave, endOctave) {}
    
    // Validation
    isValid() {}
    hasInterval(interval) {}
}
```

#### `KeySignature` - Key Signature Management
```javascript
class KeySignature {
    constructor(key, scaleType = 'major') {}
    
    // Properties
    getSharps() {}
    getFlats() {}
    getAccidentals() {}
    getKeyCenter() {}
    
    // Methods
    getNotesWithAccidentals() {}
    isEnharmonicEquivalent(otherKeySignature) {}
    getCircleOfFifthsPosition() {}
}
```

### Event System
```javascript
// Events dispatched by ScaleKey component
const SCALE_KEY_EVENTS = {
    SCALE_CHANGED: 'scale-changed',
    KEY_CHANGED: 'key-changed',
    SCALE_GENERATED: 'scale-generated',
    TRANSPOSITION_COMPLETE: 'transposition-complete',
    VALIDATION_ERROR: 'validation-error'
};

// Event detail structures
{
    // scale-changed event
    detail: {
        key: 'D',
        scaleType: 'minor',
        notes: ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'],
        timestamp: Date.now()
    }
}
```

---

## Data Structures

### Scale Pattern Definitions
```javascript
const SCALE_PATTERNS = {
    // Major scale family
    major: {
        name: 'Major Scale',
        intervals: [0, 2, 4, 5, 7, 9, 11],
        degrees: ['1', '2', '3', '4', '5', '6', '7'],
        modes: ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'],
        category: 'diatonic',
        description: 'Natural major scale with whole and half step pattern'
    },
    
    // Minor scale family
    naturalMinor: {
        name: 'Natural Minor Scale',
        intervals: [0, 2, 3, 5, 7, 8, 10],
        degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
        relativeToMajor: true,
        category: 'diatonic',
        description: 'Natural minor scale (Aeolian mode)'
    },
    
    harmonicMinor: {
        name: 'Harmonic Minor Scale',
        intervals: [0, 2, 3, 5, 7, 8, 11],
        degrees: ['1', '2', 'b3', '4', '5', 'b6', '7'],
        category: 'minor',
        description: 'Minor scale with raised 7th degree'
    },
    
    melodicMinor: {
        name: 'Melodic Minor Scale',
        intervals: [0, 2, 3, 5, 7, 9, 11],
        degrees: ['1', '2', 'b3', '4', '5', '6', '7'],
        category: 'minor',
        description: 'Minor scale with raised 6th and 7th degrees'
    },
    
    // Pentatonic scales
    majorPentatonic: {
        name: 'Major Pentatonic Scale',
        intervals: [0, 2, 4, 7, 9],
        degrees: ['1', '2', '3', '5', '6'],
        category: 'pentatonic',
        description: 'Five-note scale derived from major scale'
    },
    
    minorPentatonic: {
        name: 'Minor Pentatonic Scale',
        intervals: [0, 3, 5, 7, 10],
        degrees: ['1', 'b3', '4', '5', 'b7'],
        category: 'pentatonic',
        description: 'Five-note scale derived from minor scale'
    },
    
    // Blues scales
    blues: {
        name: 'Blues Scale',
        intervals: [0, 3, 5, 6, 7, 10],
        degrees: ['1', 'b3', '4', 'b5', '5', 'b7'],
        category: 'blues',
        description: 'Traditional blues scale with blue notes'
    },
    
    // World/Exotic scales
    phrygianDominant: {
        name: 'Phrygian Dominant',
        intervals: [0, 1, 4, 5, 7, 8, 10],
        degrees: ['1', 'b2', '3', '4', '5', 'b6', 'b7'],
        category: 'exotic',
        description: 'Spanish/Middle Eastern scale'
    }
};
```

### Instrument-Specific Configurations
```javascript
const INSTRUMENT_CONFIGS = {
    handPan: {
        noteCount: 8,
        defaultOctave: 4,
        noteLayout: 'circular',
        preferredScales: ['minor', 'majorPentatonic', 'minorPentatonic'],
        octaveRange: [3, 5],
        noteFormatting: (note, octave) => `${note}${octave}`
    },
    
    fretboard: {
        noteCount: 'variable',
        defaultOctave: 'variable',
        noteLayout: 'linear',
        preferredScales: ['major', 'naturalMinor', 'pentatonic', 'blues'],
        octaveRange: [2, 6],
        fretRange: [0, 24],
        stringCount: { guitar: 6, ukulele: 4, mandolin: 8 }
    },
    
    piano: {
        noteCount: 88,
        defaultOctave: 4,
        noteLayout: 'chromatic',
        preferredScales: 'all',
        octaveRange: [0, 8],
        keyLayout: 'traditional'
    }
};
```

### Note and Frequency Management
```javascript
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ENHARMONIC_EQUIVALENTS = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

const FREQUENCY_REFERENCE = {
    note: 'A',
    octave: 4,
    frequency: 440 // Hz
};
```

---

## Component Architecture

### File Structure
```
components/scale-key/
├── scale-key.js                 # Main component class
├── scale-pattern.js             # Scale pattern definitions and utilities
├── key-signature.js             # Key signature management
├── note-utils.js                # Note calculation utilities
├── frequency-calculator.js      # Frequency calculation utilities
├── instrument-adapters/         # Instrument-specific adaptations
│   ├── hand-pan-adapter.js
│   ├── fretboard-adapter.js
│   └── piano-adapter.js
├── __tests__/
│   ├── scale-key.test.js
│   ├── scale-pattern.test.js
│   ├── key-signature.test.js
│   └── integration.test.js
└── data/
    ├── scale-patterns.js
    ├── key-signatures.js
    └── chord-scale-relationships.js
```

### Component Integration Points
```javascript
// Integration with existing components
export class ScaleKeyIntegration {
    // State management integration
    static connectToGlobalState(scaleKey, stateManager) {}
    
    // Event system integration
    static setupEventListeners(scaleKey, eventBus) {}
    
    // Component communication
    static broadcastScaleChange(key, scaleType, notes) {}
    
    // Audio system integration
    static updateAudioContext(scaleKey, audioContext) {}
}
```

---

## Integration Patterns

### With Existing Components

#### HandPan Component Integration
```javascript
// In HandPan component
import ScaleKey from '../scale-key/scale-key.js';

class HandPan extends HTMLElement {
    constructor() {
        super();
        this.scaleKey = new ScaleKey({
            instrument: 'handPan',
            defaultKey: 'D',
            defaultScale: 'minor'
        });
        
        this.scaleKey.addEventListener('scale-changed', this.handleScaleChange.bind(this));
    }
    
    handleScaleChange(event) {
        const { key, scaleType, notes } = event.detail;
        this.notes = notes;
        this.currentKey = key;
        this.currentScale = scaleType;
        this.render();
    }
    
    changeKey(key, scale) {
        this.scaleKey.generateScale(key, scale, { 
            noteCount: 8,
            octave: 4,
            layout: 'handPan'
        });
    }
}
```

#### Fretboard Component Integration
```javascript
// In Fretboard component
import ScaleKey from '../scale-key/scale-key.js';

class Fretboard extends BaseComponent {
    constructor(options = {}) {
        super();
        this.scaleKey = new ScaleKey({
            instrument: 'fretboard',
            instrumentType: options.instrumentType || 'guitar'
        });
    }
    
    displayScale(key, scaleType) {
        const scaleData = this.scaleKey.generateScale(key, scaleType, {
            fretRange: [0, 12],
            strings: this.instrument.strings,
            tuning: this.instrument.tuning
        });
        
        this.renderer.renderScale(scaleData);
    }
}
```

### State Management Integration
```javascript
// Global state integration
import State from '../../state/state.js';
import ScaleKey from '../scale-key/scale-key.js';

// Extend global state with scale/key management
const scaleKeyState = {
    currentKey: 'C',
    currentScale: 'major',
    activeInstrument: 'guitar'
};

// State synchronization
export function synchronizeScaleKeyState(scaleKey) {
    scaleKey.addEventListener('scale-changed', (event) => {
        State.setCurrentKey(event.detail.key);
        State.setCurrentScale(event.detail.scaleType);
        
        // Broadcast to other components
        document.dispatchEvent(new CustomEvent('global-scale-change', {
            detail: event.detail
        }));
    });
}
```

---

## Implementation Details

### Core Algorithm Implementation
```javascript
// Scale generation algorithm
class ScaleGenerator {
    static generateScale(key, scaleType, options = {}) {
        const pattern = SCALE_PATTERNS[scaleType];
        if (!pattern) {
            throw new Error(`Unknown scale type: ${scaleType}`);
        }
        
        const rootIndex = CHROMATIC_NOTES.indexOf(key);
        if (rootIndex === -1) {
            throw new Error(`Invalid key: ${key}`);
        }
        
        const notes = pattern.intervals.map(interval => {
            const noteIndex = (rootIndex + interval) % 12;
            const octave = options.octave || 4;
            const octaveOffset = Math.floor((rootIndex + interval) / 12);
            
            return {
                note: CHROMATIC_NOTES[noteIndex],
                octave: octave + octaveOffset,
                degree: pattern.degrees[pattern.intervals.indexOf(interval)],
                interval: interval,
                frequency: this.calculateFrequency(CHROMATIC_NOTES[noteIndex], octave + octaveOffset)
            };
        });
        
        return {
            key,
            scaleType,
            pattern: pattern.name,
            notes,
            metadata: {
                category: pattern.category,
                description: pattern.description,
                generatedAt: Date.now()
            }
        };
    }
    
    static calculateFrequency(note, octave) {
        const noteIndex = CHROMATIC_NOTES.indexOf(note);
        const a4Index = CHROMATIC_NOTES.indexOf('A');
        const semitones = (octave - 4) * 12 + (noteIndex - a4Index);
        
        return 440 * Math.pow(2, semitones / 12);
    }
}
```

### Instrument Adapter Pattern
```javascript
// Base adapter interface
class InstrumentAdapter {
    constructor(instrumentConfig) {
        this.config = instrumentConfig;
    }
    
    adaptScale(scaleData, options = {}) {
        throw new Error('adaptScale must be implemented by subclass');
    }
    
    formatNote(note, octave) {
        return this.config.noteFormatting(note, octave);
    }
}

// HandPan-specific adapter
class HandPanAdapter extends InstrumentAdapter {
    adaptScale(scaleData, options = {}) {
        const { notes } = scaleData;
        const noteCount = options.noteCount || this.config.noteCount;
        
        // Take first N notes for hand pan layout
        const adaptedNotes = notes.slice(0, noteCount).map(noteObj => {
            return this.formatNote(noteObj.note, noteObj.octave);
        });
        
        return {
            ...scaleData,
            adaptedNotes,
            layout: 'circular',
            instrument: 'handPan'
        };
    }
}
```

### Performance Optimizations
```javascript
// Caching system for generated scales
class ScaleCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    
    get(key, scaleType, options) {
        const cacheKey = this.generateCacheKey(key, scaleType, options);
        return this.cache.get(cacheKey);
    }
    
    set(key, scaleType, options, scaleData) {
        const cacheKey = this.generateCacheKey(key, scaleType, options);
        
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(cacheKey, scaleData);
    }
    
    generateCacheKey(key, scaleType, options) {
        return `${key}-${scaleType}-${JSON.stringify(options)}`;
    }
}
```

---

## Usage Examples

### Basic Scale Generation
```javascript
import ScaleKey from './components/scale-key/scale-key.js';

// Initialize scale component
const scaleKey = new ScaleKey();

// Generate a D minor scale
const dMinorScale = scaleKey.generateScale('D', 'naturalMinor', {
    octave: 4,
    noteCount: 8
});

console.log(dMinorScale);
// Output:
// {
//   key: 'D',
//   scaleType: 'naturalMinor',
//   pattern: 'Natural Minor Scale',
//   notes: [
//     { note: 'D', octave: 4, degree: '1', interval: 0, frequency: 293.66 },
//     { note: 'E', octave: 4, degree: '2', interval: 2, frequency: 329.63 },
//     // ... more notes
//   ]
// }
```

### HandPan Integration
```javascript
// HandPan component using ScaleKey
class HandPan extends HTMLElement {
    constructor() {
        super();
        this.scaleKey = new ScaleKey({
            instrument: 'handPan',
            cache: true
        });
        
        // Set up event listeners
        this.scaleKey.addEventListener('scale-changed', (event) => {
            this.updateNotes(event.detail.notes);
        });
    }
    
    changeKey(newKey, newScale) {
        // Generate new scale with HandPan-specific options
        this.scaleKey.generateScale(newKey, newScale, {
            noteCount: 8,
            octave: 4,
            layout: 'circular'
        });
    }
    
    updateNotes(notes) {
        this.notes = notes.map(noteObj => `${noteObj.note}${noteObj.octave}`);
        this.render();
    }
}
```

### Fretboard Scale Visualization
```javascript
// Fretboard component using ScaleKey for scale patterns
class Fretboard extends BaseComponent {
    constructor(options = {}) {
        super();
        this.scaleKey = new ScaleKey({
            instrument: 'fretboard',
            instrumentType: options.instrumentType
        });
    }
    
    displayScale(key, scaleType) {
        const scaleData = this.scaleKey.generateScale(key, scaleType, {
            instrument: 'fretboard',
            strings: this.instrument.strings,
            tuning: this.instrument.tuning,
            fretRange: [0, 12]
        });
        
        // Calculate fretboard positions for scale notes
        const positions = this.calculateFretboardPositions(scaleData.notes);
        this.renderer.renderScalePositions(positions);
    }
    
    calculateFretboardPositions(scaleNotes) {
        // Implementation specific to fretboard layout
        return positions;
    }
}
```

### Chord-Scale Relationships
```javascript
// Using ScaleKey for chord suggestions
const scaleKey = new ScaleKey();

// Get compatible chords for C major scale
const chordSuggestions = scaleKey.getChordSuggestions('C', 'major');
console.log(chordSuggestions);
// Output:
// [
//   { chord: 'C', function: 'I', notes: ['C', 'E', 'G'] },
//   { chord: 'Dm', function: 'ii', notes: ['D', 'F', 'A'] },
//   { chord: 'Em', function: 'iii', notes: ['E', 'G', 'B'] },
//   // ... more chords
// ]
```

### Key Transposition
```javascript
// Transpose from one key to another
const originalNotes = ['C4', 'E4', 'G4', 'B4'];
const transposedNotes = scaleKey.transposeKey('C', 'G', originalNotes);
console.log(transposedNotes);
// Output: ['G4', 'B4', 'D5', 'F#5']

// Get relative minor key
const relativeMinor = scaleKey.getRelativeKey('C', 'major');
console.log(relativeMinor);
// Output: { key: 'A', scaleType: 'naturalMinor' }
```

---

## Testing Strategy

### Unit Tests
```javascript
// Example test structure
describe('ScaleKey Component', () => {
    let scaleKey;
    
    beforeEach(() => {
        scaleKey = new ScaleKey();
    });
    
    describe('Scale Generation', () => {
        test('should generate correct C major scale', () => {
            const scale = scaleKey.generateScale('C', 'major');
            const noteNames = scale.notes.map(n => n.note);
            
            expect(noteNames).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
        });
        
        test('should handle invalid keys gracefully', () => {
            expect(() => scaleKey.generateScale('H', 'major')).toThrow();
        });
        
        test('should generate correct frequencies', () => {
            const scale = scaleKey.generateScale('A', 'major', { octave: 4 });
            const aNote = scale.notes.find(n => n.note === 'A');
            
            expect(aNote.frequency).toBeCloseTo(440, 1);
        });
    });
    
    describe('Key Transposition', () => {
        test('should transpose correctly between keys', () => {
            const notes = ['C4', 'E4', 'G4'];
            const transposed = scaleKey.transposeKey('C', 'D', notes);
            
            expect(transposed).toEqual(['D4', 'F#4', 'A4']);
        });
    });
    
    describe('Instrument Adaptation', () => {
        test('should adapt scale for handPan', () => {
            const adapted = scaleKey.generateScale('D', 'minor', {
                instrument: 'handPan',
                noteCount: 8
            });
            
            expect(adapted.notes).toHaveLength(8);
            expect(adapted.instrument).toBe('handPan');
        });
    });
});
```

### Integration Tests
```javascript
describe('ScaleKey Integration', () => {
    test('should integrate with HandPan component', () => {
        const handPan = new HandPan();
        const scaleKey = new ScaleKey({ instrument: 'handPan' });
        
        // Mock event listener
        const mockHandler = jest.fn();
        scaleKey.addEventListener('scale-changed', mockHandler);
        
        scaleKey.generateScale('D', 'minor');
        
        expect(mockHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: expect.objectContaining({
                    key: 'D',
                    scaleType: 'minor'
                })
            })
        );
    });
});
```

### Performance Tests
```javascript
describe('ScaleKey Performance', () => {
    test('should generate scales within performance threshold', () => {
        const scaleKey = new ScaleKey();
        const startTime = performance.now();
        
        // Generate 100 different scales
        for (let i = 0; i < 100; i++) {
            const key = CHROMATIC_NOTES[i % 12];
            scaleKey.generateScale(key, 'major');
        }
        
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(50); // 50ms threshold
    });
    
    test('should benefit from caching', () => {
        const scaleKey = new ScaleKey({ cache: true });
        
        // First generation (cache miss)
        const start1 = performance.now();
        scaleKey.generateScale('C', 'major');
        const time1 = performance.now() - start1;
        
        // Second generation (cache hit)
        const start2 = performance.now();
        scaleKey.generateScale('C', 'major');
        const time2 = performance.now() - start2;
        
        expect(time2).toBeLessThan(time1 * 0.5); // 50% faster
    });
});
```

---

## Future Considerations

### Advanced Features
- **Microtonal Scales**: Support for quarter-tone and other microtonal intervals
- **Custom Scale Builder**: Visual interface for creating custom scale patterns
- **Scale Analysis**: Harmonic analysis and scale comparison tools
- **MIDI Integration**: Real-time scale detection from MIDI input
- **Machine Learning**: AI-powered scale and chord suggestions

### Extended Scale Library
- **World Music Scales**: Extensive collection of global music scales
- **Historical Scales**: Medieval modes and historical temperaments
- **Jazz Scales**: Comprehensive jazz scale collection
- **Synthetic Scales**: Computer-generated scale patterns

### Performance Enhancements
- **Web Workers**: Offload calculations to background threads
- **WebAssembly**: High-performance calculations for complex operations
- **Progressive Loading**: Lazy-load scale definitions and patterns
- **Memory Optimization**: Efficient data structures for large scale libraries

### Integration Expansions
- **DAW Integration**: Export scales and keys to digital audio workstations
- **Notation Software**: Generate sheet music with scale annotations
- **Educational Tools**: Interactive scale learning and theory teaching
- **Collaborative Features**: Share and collaborate on custom scales

### API Extensions
```javascript
// Future API additions
class ScaleKey {
    // Advanced analysis
    analyzeHarmony(notes) {}
    detectScale(notes) {}
    suggestProgressions(key, scaleType) {}
    
    // Educational features
    getScaleInfo(scaleType) {}
    playScale(key, scaleType, tempo) {}
    visualizeScale(key, scaleType, instrument) {}
    
    // Import/Export
    exportScale(format) {} // JSON, MusicXML, MIDI
    importScale(data, format) {}
    
    // Collaboration
    shareScale(scaleData) {}
    loadSharedScale(shareId) {}
}
```

---

## Conclusion

The Scale/Key Component represents a comprehensive musical theory foundation for the Songstructor application. By providing a unified, well-documented API for scale and key operations, this component ensures consistency across all musical instruments and interfaces while maintaining the flexibility to accommodate future enhancements.

The modular architecture allows for easy integration with existing components while the extensible design supports the addition of new scales, instruments, and features. The thorough testing strategy ensures reliability and performance across all use cases.

This specification provides a clear roadmap for implementation while establishing patterns that will guide future musical component development in the Songstructor ecosystem.