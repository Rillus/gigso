// Instrument configurations as defined in the specification
export const INSTRUMENT_CONFIG = {
  guitar: {
    strings: 6,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'], // Low to high
    fretCount: 24,
    stringSpacing: 20,
    fretSpacing: 30,
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
    tuning: ['G', 'D', 'A', 'E'], // Course tuning (each doubled)
    fretCount: 20,
    stringSpacing: 12,
    fretSpacing: 25,
    markers: [3, 5, 7, 9, 12, 15, 17, 19],
    doubleMarkers: [12],
    stringGauges: [0.011, 0.011, 0.016, 0.016, 0.026, 0.026, 0.040, 0.040]
  }
};

// Scale pattern definitions
export const SCALE_PATTERNS = {
  major: {
    intervals: [0, 2, 4, 5, 7, 9, 11],
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
  },
  pentatonicMinor: {
    intervals: [0, 3, 5, 7, 10],
    degrees: ['1', 'b3', '4', '5', 'b7'],
    name: 'Minor Pentatonic Scale'
  },
  blues: {
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ['1', 'b3', '4', 'b5', '5', 'b7'],
    name: 'Blues Scale'
  },
  dorian: {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    name: 'Dorian Mode'
  },
  mixolydian: {
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ['1', '2', '3', '4', '5', '6', 'b7'],
    name: 'Mixolydian Mode'
  }
};

export default class FretboardCalculator {
  constructor() {
    this.chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  }

  /**
   * Calculate all positions of a given note across the fretboard
   * @param {string} instrument - The instrument type
   * @param {string} note - The note to find positions for
   * @param {number} octaveRange - Number of octaves to consider (default: 1)
   * @returns {Array} Array of {string, fret, octave} objects
   */
  generatePositions(instrument, note, octaveRange = 1) {
    const config = INSTRUMENT_CONFIG[instrument];
    if (!config) {
      throw new Error(`Unknown instrument: ${instrument}`);
    }

    const positions = [];
    const noteIndex = this.chromatic.indexOf(note);
    
    if (noteIndex === -1) {
      throw new Error(`Invalid note: ${note}`);
    }

    // Handle mandolin course tuning (double strings)
    const tuning = instrument === 'mandolin' ? 
      [...config.tuning, ...config.tuning] : config.tuning;

    tuning.forEach((openNote, stringIndex) => {
      const openNoteIndex = this.chromatic.indexOf(openNote);
      
      for (let fret = 0; fret <= config.fretCount; fret++) {
        const fretNoteIndex = (openNoteIndex + fret) % 12;
        
        if (fretNoteIndex === noteIndex) {
          const octave = Math.floor((openNoteIndex + fret) / 12);
          positions.push({
            string: stringIndex,
            fret: fret,
            octave: octave,
            note: note
          });
        }
      }
    });

    return positions;
  }

  /**
   * Generate all positions for notes in a specified scale
   * @param {string} instrument - The instrument type
   * @param {string} rootNote - The root note of the scale
   * @param {string} scaleType - The scale type (e.g., 'major', 'minor')
   * @returns {Array} Array of position objects with note and degree information
   */
  getScalePositions(instrument, rootNote, scaleType) {
    const config = INSTRUMENT_CONFIG[instrument];
    const scalePattern = SCALE_PATTERNS[scaleType];
    
    if (!config) {
      throw new Error(`Unknown instrument: ${instrument}`);
    }
    
    if (!scalePattern) {
      throw new Error(`Unknown scale type: ${scaleType}`);
    }

    const rootIndex = this.chromatic.indexOf(rootNote);
    if (rootIndex === -1) {
      throw new Error(`Invalid root note: ${rootNote}`);
    }

    const scaleNotes = scalePattern.intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return this.chromatic[noteIndex];
    });

    const positions = [];

    // Handle mandolin course tuning
    const tuning = instrument === 'mandolin' ? 
      [...config.tuning, ...config.tuning] : config.tuning;

    tuning.forEach((openNote, stringIndex) => {
      const openNoteIndex = this.chromatic.indexOf(openNote);
      
      for (let fret = 0; fret <= config.fretCount; fret++) {
        const fretNoteIndex = (openNoteIndex + fret) % 12;
        const fretNote = this.chromatic[fretNoteIndex];
        
        const scaleNoteIndex = scaleNotes.indexOf(fretNote);
        if (scaleNoteIndex !== -1) {
          positions.push({
            string: stringIndex,
            fret: fret,
            note: fretNote,
            degree: scalePattern.degrees[scaleNoteIndex],
            interval: scalePattern.intervals[scaleNoteIndex],
            isRoot: fretNote === rootNote
          });
        }
      }
    });

    return positions;
  }

  /**
   * Calculate the note at a specific string and fret position
   * @param {string} instrument - The instrument type
   * @param {number} stringIndex - Zero-based string index
   * @param {number} fret - Fret number
   * @returns {string} The note name
   */
  getNoteAtPosition(instrument, stringIndex, fret) {
    const config = INSTRUMENT_CONFIG[instrument];
    if (!config) {
      throw new Error(`Unknown instrument: ${instrument}`);
    }

    // Handle mandolin course tuning
    const tuning = instrument === 'mandolin' ? 
      [...config.tuning, ...config.tuning] : config.tuning;

    if (stringIndex >= tuning.length) {
      throw new Error(`Invalid string index: ${stringIndex}`);
    }

    const openNote = tuning[stringIndex];
    const openNoteIndex = this.chromatic.indexOf(openNote);
    const noteIndex = (openNoteIndex + fret) % 12;
    
    return this.chromatic[noteIndex];
  }

  /**
   * Find chord positions for a given chord name and instrument
   * @param {string} instrument - The instrument type
   * @param {string} chordName - The chord name (e.g., 'C', 'Am', 'G7')
   * @returns {Object} Chord position data
   */
  getChordPositions(instrument, chordName) {
    // This would integrate with the existing chord library
    // For now, we'll return a placeholder structure
    return {
      name: chordName,
      positions: [], // Array of fret positions
      fingering: [], // Array of finger numbers
      difficulty: 'beginner',
      barre: null // Barre chord information
    };
  }

  /**
   * Calculate interval between two notes
   * @param {string} note1 - First note
   * @param {string} note2 - Second note
   * @returns {number} Interval in semitones
   */
  calculateInterval(note1, note2) {
    const index1 = this.chromatic.indexOf(note1);
    const index2 = this.chromatic.indexOf(note2);
    
    if (index1 === -1 || index2 === -1) {
      throw new Error('Invalid note names');
    }
    
    return (index2 - index1 + 12) % 12;
  }

  /**
   * Transpose a note by a given interval
   * @param {string} note - The note to transpose
   * @param {number} semitones - Number of semitones to transpose (can be negative)
   * @returns {string} The transposed note
   */
  transposeNote(note, semitones) {
    const noteIndex = this.chromatic.indexOf(note);
    if (noteIndex === -1) {
      throw new Error(`Invalid note: ${note}`);
    }
    
    const newIndex = (noteIndex + semitones + 12) % 12;
    return this.chromatic[newIndex];
  }

  /**
   * Get all notes in a chord
   * @param {string} rootNote - The root note of the chord
   * @param {string} chordType - The chord type (e.g., 'major', 'minor', 'dominant7')
   * @returns {Array} Array of note names in the chord
   */
  getChordNotes(rootNote, chordType) {
    const chordIntervals = {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      dominant7: [0, 4, 7, 10],
      major7: [0, 4, 7, 11],
      minor7: [0, 3, 7, 10],
      diminished: [0, 3, 6],
      augmented: [0, 4, 8],
      sus2: [0, 2, 7],
      sus4: [0, 5, 7]
    };

    const intervals = chordIntervals[chordType];
    if (!intervals) {
      throw new Error(`Unknown chord type: ${chordType}`);
    }

    const rootIndex = this.chromatic.indexOf(rootNote);
    if (rootIndex === -1) {
      throw new Error(`Invalid root note: ${rootNote}`);
    }

    return intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return this.chromatic[noteIndex];
    });
  }

  /**
   * Calculate responsive dimensions based on viewport and instrument
   * @param {Object} viewport - Viewport dimensions {width, height}
   * @param {string} instrument - Instrument type
   * @returns {Object} Calculated dimensions
   */
  static calculateDimensions(viewport, instrument) {
    const config = INSTRUMENT_CONFIG[instrument];
    const baseWidth = viewport.width * 0.9;
    const fretWidth = baseWidth / config.fretCount;
    const stringHeight = Math.min(40, viewport.height / 8);
    
    return {
      fretWidth: Math.max(20, fretWidth),
      stringHeight,
      totalWidth: baseWidth,
      totalHeight: stringHeight * config.strings
    };
  }

  /**
   * Get instrument configuration
   * @param {string} instrument - Instrument type
   * @returns {Object} Instrument configuration
   */
  static getInstrumentConfig(instrument) {
    return INSTRUMENT_CONFIG[instrument];
  }

  /**
   * Get scale pattern
   * @param {string} scaleType - Scale type
   * @returns {Object} Scale pattern configuration
   */
  static getScalePattern(scaleType) {
    return SCALE_PATTERNS[scaleType];
  }

  /**
   * Get all available instruments
   * @returns {Array} Array of instrument names
   */
  static getAvailableInstruments() {
    return Object.keys(INSTRUMENT_CONFIG);
  }

  /**
   * Get all available scale types
   * @returns {Array} Array of scale type names
   */
  static getAvailableScales() {
    return Object.keys(SCALE_PATTERNS);
  }
}