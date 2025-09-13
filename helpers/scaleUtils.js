/**
 * Musical Scale Utilities for HandPan Component
 * Provides comprehensive scale generation for all 12 major and minor scales
 */

// Chromatic scale for reference
const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Scale patterns (intervals from root) - 8 unique notes for hand pan
const SCALE_PATTERNS = {
    major: [0, 2, 4, 5, 7, 9, 11, 12], // Root, Major 2nd, Major 3rd, Perfect 4th, Perfect 5th, Major 6th, Major 7th, Octave
    minor: [0, 2, 3, 5, 7, 8, 10, 12]  // Root, Major 2nd, Minor 3rd, Perfect 4th, Perfect 5th, Minor 6th, Minor 7th, Octave
};

/**
 * Generate notes for a specific key and scale
 * @param {string} key - The root note (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
 * @param {string} scale - The scale type ('major' or 'minor')
 * @returns {Array} Array of 8 notes for the hand pan layout
 */
export function generateScaleNotes(key, scale) {
    if (!CHROMATIC_SCALE.includes(key)) {
        console.warn(`Invalid key: ${key}. Using D as default.`);
        key = 'D';
    }
    
    if (!SCALE_PATTERNS[scale]) {
        console.warn(`Invalid scale: ${scale}. Using minor as default.`);
        scale = 'minor';
    }
    
    const rootIndex = CHROMATIC_SCALE.indexOf(key);
    const pattern = SCALE_PATTERNS[scale];
    
    // Generate 8 notes using the scale pattern
    const notes = pattern.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return CHROMATIC_SCALE[noteIndex];
    });
    
    // Convert to hand pan layout with appropriate octaves
    return convertToHandPanLayout(notes, key);
}

/**
 * Convert scale notes to hand pan layout with appropriate octaves
 * @param {Array} scaleNotes - Array of 8 notes in scale order
 * @param {string} rootKey - The root key for octave determination
 * @returns {Array} Array of 8 notes formatted for hand pan layout
 */
function convertToHandPanLayout(scaleNotes, rootKey) {
    // Create a hand pan layout starting from root note in octave 4
    // and ascending through the scale, wrapping to octave 5 when needed
    const layout = [];
    
    // Start with root note in octave 4
    layout.push(`${scaleNotes[0]}4`); // Root
    
    // Continue ascending through the scale
    // Track the cumulative semitones to determine octave changes
    let cumulativeSemitones = 0;
    
    for (let i = 1; i < scaleNotes.length; i++) {
        const currentNote = scaleNotes[i];
        const previousNote = scaleNotes[i - 1];
        
        // Calculate semitones between previous and current note
        const currentIndex = CHROMATIC_SCALE.indexOf(currentNote);
        const previousIndex = CHROMATIC_SCALE.indexOf(previousNote);
        
        let semitones;
        if (currentIndex >= previousIndex) {
            semitones = currentIndex - previousIndex;
        } else {
            // Wrapped around the chromatic scale
            semitones = (12 - previousIndex) + currentIndex;
        }
        
        cumulativeSemitones += semitones;
        
        // Determine octave based on cumulative semitones
        // Start in octave 4, increment when we go beyond 12 semitones
        const octave = 4 + Math.floor(cumulativeSemitones / 12);
        
        layout.push(`${currentNote}${octave}`);
    }
    
    return layout;
}

/**
 * Get all available keys for the hand pan
 * @returns {Array} Array of all 12 chromatic keys
 */
export function getAllKeys() {
    return [...CHROMATIC_SCALE];
}

/**
 * Get all available scale types
 * @returns {Array} Array of scale types
 */
export function getAllScaleTypes() {
    return Object.keys(SCALE_PATTERNS);
}

/**
 * Validate a key and scale combination
 * @param {string} key - The key to validate
 * @param {string} scale - The scale type to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateKeyAndScale(key, scale) {
    return CHROMATIC_SCALE.includes(key) && SCALE_PATTERNS.hasOwnProperty(scale);
}

/**
 * Get the frequency of a note
 * @param {string} note - Note in format "C4", "D#3", etc.
 * @returns {number} Frequency in Hz
 */
export function getNoteFrequency(note) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    const noteIndex = noteNames.indexOf(noteName);
    
    // A4 = 440Hz, calculate relative frequency
    const a4Index = 9; // A is at index 9
    const a4Octave = 4;
    const semitones = (octave - a4Octave) * 12 + (noteIndex - a4Index);
    
    return 440 * Math.pow(2, semitones / 12);
}

/**
 * Get scale information for display
 * @param {string} key - The root key
 * @param {string} scale - The scale type
 * @returns {Object} Scale information object
 */
export function getScaleInfo(key, scale) {
    const notes = generateScaleNotes(key, scale);
    return {
        key,
        scale,
        notes,
        pattern: SCALE_PATTERNS[scale],
        displayName: `${key} ${scale}`
    };
} 