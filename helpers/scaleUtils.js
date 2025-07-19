/**
 * Musical Scale Utilities for HandPan Component
 * Provides comprehensive scale generation for all 12 major and minor scales
 */

// Chromatic scale for reference
const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Scale patterns (intervals from root) - 8 unique notes for hand pan
const SCALE_PATTERNS = {
    major: [0, 2, 4, 5, 7, 9, 11, 14], // Root, Major 2nd, Major 3rd, Perfect 4th, Perfect 5th, Major 6th, Major 7th, Major 9th
    minor: [0, 2, 3, 5, 7, 8, 10, 14]  // Root, Major 2nd, Minor 3rd, Perfect 4th, Perfect 5th, Minor 6th, Minor 7th, Major 9th
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
    // Create a hand pan layout with optimal octave distribution
    // Use octave 4 for root, 3rd, 5th, 7th (higher notes)
    // Use octave 3 for 2nd, 4th, 6th, 9th (lower notes)
    const layout = [];
    
    // First 4 notes in octave 4
    layout.push(`${scaleNotes[0]}4`); // Root
    layout.push(`${scaleNotes[2]}4`); // 3rd
    layout.push(`${scaleNotes[4]}4`); // 5th
    layout.push(`${scaleNotes[6]}4`); // 7th
    
    // Next 4 notes in octave 3
    layout.push(`${scaleNotes[1]}3`); // 2nd
    layout.push(`${scaleNotes[3]}3`); // 4th
    layout.push(`${scaleNotes[5]}3`); // 6th
    layout.push(`${scaleNotes[7]}3`); // 9th
    
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