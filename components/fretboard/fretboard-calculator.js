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
    strings: 4, // Treat as 4-string instrument (courses)
    courses: 4, // Double strings per course
    tuning: ['G', 'D', 'A', 'E'], // Course tuning (each course has 2 strings)
    fretCount: 20,
    stringSpacing: 25, // Increased spacing for visual clarity
    fretSpacing: 25,
    markers: [3, 5, 7, 9, 12, 15, 17, 19],
    doubleMarkers: [12],
    stringGauges: [0.011, 0.016, 0.026, 0.040] // One gauge per course
  }
};

// Enhanced scale pattern definitions for Phase 2
export const SCALE_PATTERNS = {
  major: {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ['1', '2', '3', '4', '5', '6', '7'],
    name: 'Major Scale',
    color: '#4ECDC4',
    rootColor: '#26D0CE'
  },
  naturalMinor: {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    name: 'Natural Minor Scale',
    color: '#95E1D3',
    rootColor: '#4ECDC4'
  },
  harmonicMinor: {
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    name: 'Harmonic Minor Scale',
    color: '#FF6B6B',
    rootColor: '#FF4757'
  },
  melodicMinor: {
    intervals: [0, 2, 3, 5, 7, 9, 11],
    degrees: ['1', '2', 'b3', '4', '5', '6', '7'],
    name: 'Melodic Minor Scale',
    color: '#FFA07A',
    rootColor: '#FF8C42'
  },
  pentatonicMajor: {
    intervals: [0, 2, 4, 7, 9],
    degrees: ['1', '2', '3', '5', '6'],
    name: 'Major Pentatonic Scale',
    color: '#98D8C8',
    rootColor: '#7BC8A4'
  },
  pentatonicMinor: {
    intervals: [0, 3, 5, 7, 10],
    degrees: ['1', 'b3', '4', '5', 'b7'],
    name: 'Minor Pentatonic Scale',
    color: '#F7DC6F',
    rootColor: '#F4D03F'
  },
  blues: {
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ['1', 'b3', '4', 'b5', '5', 'b7'],
    name: 'Blues Scale',
    color: '#BB8FCE',
    rootColor: '#9B59B6'
  },
  dorian: {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    name: 'Dorian Mode',
    color: '#85C1E9',
    rootColor: '#5DADE2'
  },
  phrygian: {
    intervals: [0, 1, 4, 5, 7, 8, 10],
    degrees: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    name: 'Phrygian Mode',
    color: '#F8C471',
    rootColor: '#F39C12'
  },
  lydian: {
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degrees: ['1', '2', '3', '#4', '5', '6', '7'],
    name: 'Lydian Mode',
    color: '#82E0AA',
    rootColor: '#58D68D'
  },
  mixolydian: {
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ['1', '2', '3', '4', '5', '6', 'b7'],
    name: 'Mixolydian Mode',
    color: '#F1948A',
    rootColor: '#EC7063'
  },
  aeolian: {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    name: 'Aeolian Mode',
    color: '#85C1E9',
    rootColor: '#5DADE2'
  },
  locrian: {
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degrees: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    name: 'Locrian Mode',
    color: '#D7BDE2',
    rootColor: '#BB8FCE'
  }
};

// Key signature definitions for Phase 2
export const KEY_SIGNATURES = {
  'C': { sharps: 0, flats: 0, relative: 'Am' },
  'G': { sharps: 1, flats: 0, relative: 'Em', sharpsList: ['F#'] },
  'D': { sharps: 2, flats: 0, relative: 'Bm', sharpsList: ['F#', 'C#'] },
  'A': { sharps: 3, flats: 0, relative: 'F#m', sharpsList: ['F#', 'C#', 'G#'] },
  'E': { sharps: 4, flats: 0, relative: 'C#m', sharpsList: ['F#', 'C#', 'G#', 'D#'] },
  'B': { sharps: 5, flats: 0, relative: 'G#m', sharpsList: ['F#', 'C#', 'G#', 'D#', 'A#'] },
  'F#': { sharps: 6, flats: 0, relative: 'D#m', sharpsList: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
  'C#': { sharps: 7, flats: 0, relative: 'A#m', sharpsList: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'] },
  'F': { sharps: 0, flats: 1, relative: 'Dm', flatsList: ['Bb'] },
  'Bb': { sharps: 0, flats: 2, relative: 'Gm', flatsList: ['Bb', 'Eb'] },
  'Eb': { sharps: 0, flats: 3, relative: 'Cm', flatsList: ['Bb', 'Eb', 'Ab'] },
  'Ab': { sharps: 0, flats: 4, relative: 'Fm', flatsList: ['Bb', 'Eb', 'Ab', 'Db'] },
  'Db': { sharps: 0, flats: 5, relative: 'Bbm', flatsList: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
  'Gb': { sharps: 0, flats: 6, relative: 'Ebm', flatsList: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] },
  'Cb': { sharps: 0, flats: 7, relative: 'Abm', flatsList: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'] }
};

// Interval definitions for highlighting
export const INTERVALS = {
  0: { name: 'Unison', color: '#4ECDC4', description: 'Root note' },
  1: { name: 'Minor 2nd', color: '#FF6B6B', description: 'Half step' },
  2: { name: 'Major 2nd', color: '#95E1D3', description: 'Whole step' },
  3: { name: 'Minor 3rd', color: '#F7DC6F', description: 'Minor third' },
  4: { name: 'Major 3rd', color: '#98D8C8', description: 'Major third' },
  5: { name: 'Perfect 4th', color: '#85C1E9', description: 'Perfect fourth' },
  6: { name: 'Tritone', color: '#BB8FCE', description: 'Augmented fourth' },
  7: { name: 'Perfect 5th', color: '#82E0AA', description: 'Perfect fifth' },
  8: { name: 'Minor 6th', color: '#F8C471', description: 'Minor sixth' },
  9: { name: 'Major 6th', color: '#F1948A', description: 'Major sixth' },
  10: { name: 'Minor 7th', color: '#D7BDE2', description: 'Minor seventh' },
  11: { name: 'Major 7th', color: '#4ECDC4', description: 'Major seventh' }
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

    // Use standard tuning (mandolin now treated as 4-string)
    const tuning = config.tuning;

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

    // Use standard tuning (mandolin now treated as 4-string)
    const tuning = config.tuning;

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

    // Use standard tuning (mandolin now treated as 4-string)
    const tuning = config.tuning;

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

  // Phase 2 Enhanced Methods

  /**
   * Get key signature information for a given key
   * @param {string} key - The musical key (e.g., 'C', 'G', 'F#')
   * @returns {Object} Key signature information
   */
  getKeySignature(key) {
    return KEY_SIGNATURES[key] || null;
  }

  /**
   * Transpose a scale to a different key
   * @param {string} rootNote - Original root note
   * @param {string} scaleType - Scale type
   * @param {string} newKey - New key to transpose to
   * @returns {Object} Transposed scale data
   */
  transposeScale(rootNote, scaleType, newKey) {
    const originalRootIndex = this.chromatic.indexOf(rootNote);
    const newRootIndex = this.chromatic.indexOf(newKey);
    
    if (originalRootIndex === -1 || newRootIndex === -1) {
      throw new Error('Invalid note names');
    }
    
    const semitones = (newRootIndex - originalRootIndex + 12) % 12;
    const transposedNotes = this.getScaleNotes(rootNote, scaleType).map(note => 
      this.transposeNote(note, semitones)
    );
    
    return {
      root: newKey,
      type: scaleType,
      notes: transposedNotes,
      semitones: semitones
    };
  }

  /**
   * Get all notes in a scale
   * @param {string} rootNote - Root note of the scale
   * @param {string} scaleType - Type of scale
   * @returns {Array} Array of note names in the scale
   */
  getScaleNotes(rootNote, scaleType) {
    const scalePattern = SCALE_PATTERNS[scaleType];
    if (!scalePattern) {
      throw new Error(`Unknown scale type: ${scaleType}`);
    }

    const rootIndex = this.chromatic.indexOf(rootNote);
    if (rootIndex === -1) {
      throw new Error(`Invalid root note: ${rootNote}`);
    }

    return scalePattern.intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return this.chromatic[noteIndex];
    });
  }

  /**
   * Get scale positions with enhanced information for Phase 2
   * @param {string} instrument - The instrument type
   * @param {string} rootNote - The root note of the scale
   * @param {string} scaleType - The scale type
   * @param {Object} options - Additional options
   * @returns {Array} Enhanced scale position data
   */
  getEnhancedScalePositions(instrument, rootNote, scaleType, options = {}) {
    const positions = this.getScalePositions(instrument, rootNote, scaleType);
    const scalePattern = SCALE_PATTERNS[scaleType];
    const keySignature = this.getKeySignature(rootNote);
    
    return positions.map(position => ({
      ...position,
      scaleType: scaleType,
      scaleName: scalePattern.name,
      keySignature: keySignature,
      intervalName: INTERVALS[position.interval]?.name || '',
      intervalColor: INTERVALS[position.interval]?.color || '#95E1D3',
      isRoot: position.note === rootNote,
      isThird: position.interval === 3 || position.interval === 4,
      isFifth: position.interval === 7,
      isSeventh: position.interval === 10 || position.interval === 11
    }));
  }

  /**
   * Get scale positions grouped by intervals for highlighting
   * @param {string} instrument - The instrument type
   * @param {string} rootNote - The root note of the scale
   * @param {string} scaleType - The scale type
   * @returns {Object} Scale positions grouped by intervals
   */
  getScalePositionsByInterval(instrument, rootNote, scaleType) {
    const positions = this.getEnhancedScalePositions(instrument, rootNote, scaleType);
    
    return positions.reduce((groups, position) => {
      const interval = position.interval;
      if (!groups[interval]) {
        groups[interval] = [];
      }
      groups[interval].push(position);
      return groups;
    }, {});
  }

  /**
   * Get scale practice mode positions (progressive revelation)
   * @param {string} instrument - The instrument type
   * @param {string} rootNote - The root note of the scale
   * @param {string} scaleType - The scale type
   * @param {number} level - Practice level (1-7 for 7-note scales, 1-5 for pentatonic)
   * @returns {Array} Scale positions for practice mode
   */
  getScalePracticePositions(instrument, rootNote, scaleType, level = 1) {
    const allPositions = this.getEnhancedScalePositions(instrument, rootNote, scaleType);
    const scalePattern = SCALE_PATTERNS[scaleType];
    
    // Limit to the specified level
    const maxInterval = scalePattern.intervals[Math.min(level - 1, scalePattern.intervals.length - 1)];
    
    return allPositions.filter(position => 
      position.interval <= maxInterval
    );
  }

  /**
   * Get relative minor/major key for a given key
   * @param {string} key - The musical key
   * @returns {string} Relative key
   */
  getRelativeKey(key) {
    const keySignature = this.getKeySignature(key);
    return keySignature?.relative || null;
  }

  /**
   * Get parallel minor/major key for a given key
   * @param {string} key - The musical key
   * @returns {string} Parallel key
   */
  getParallelKey(key) {
    const keyIndex = this.chromatic.indexOf(key);
    if (keyIndex === -1) return null;
    
    // For major keys, find parallel minor (3 semitones down)
    // For minor keys, find parallel major (3 semitones up)
    // This is a simplified approach - in practice, you'd need to determine if it's major or minor
    const parallelMinor = this.chromatic[(keyIndex - 3 + 12) % 12];
    const parallelMajor = this.chromatic[(keyIndex + 3) % 12];
    
    return { minor: parallelMinor, major: parallelMajor };
  }

  /**
   * Get all available keys
   * @returns {Array} Array of available keys
   */
  static getAvailableKeys() {
    return Object.keys(KEY_SIGNATURES);
  }

  /**
   * Get interval information
   * @param {number} interval - Interval in semitones
   * @returns {Object} Interval information
   */
  static getIntervalInfo(interval) {
    return INTERVALS[interval] || null;
  }
}