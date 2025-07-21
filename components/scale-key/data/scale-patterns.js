/**
 * Musical Scale Pattern Definitions
 * Comprehensive collection of scale patterns with intervals, degrees, and metadata
 */

export const SCALE_PATTERNS = {
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
    
    // Legacy support for existing components
    minor: {
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
    },
    
    // Modal scales
    dorian: {
        name: 'Dorian Mode',
        intervals: [0, 2, 3, 5, 7, 9, 10],
        degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'],
        category: 'modal',
        description: 'Second mode of major scale'
    },
    
    phrygian: {
        name: 'Phrygian Mode',
        intervals: [0, 1, 3, 5, 7, 8, 10],
        degrees: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
        category: 'modal',
        description: 'Third mode of major scale'
    },
    
    lydian: {
        name: 'Lydian Mode',
        intervals: [0, 2, 4, 6, 7, 9, 11],
        degrees: ['1', '2', '3', '#4', '5', '6', '7'],
        category: 'modal',
        description: 'Fourth mode of major scale'
    },
    
    mixolydian: {
        name: 'Mixolydian Mode',
        intervals: [0, 2, 4, 5, 7, 9, 10],
        degrees: ['1', '2', '3', '4', '5', '6', 'b7'],
        category: 'modal',
        description: 'Fifth mode of major scale'
    },
    
    locrian: {
        name: 'Locrian Mode',
        intervals: [0, 1, 3, 5, 6, 8, 10],
        degrees: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
        category: 'modal',
        description: 'Seventh mode of major scale'
    }
};

export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const ENHARMONIC_EQUIVALENTS = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

export const FREQUENCY_REFERENCE = {
    note: 'A',
    octave: 4,
    frequency: 440 // Hz
};