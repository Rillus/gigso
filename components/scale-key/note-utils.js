/**
 * Note calculation utilities for the Scale/Key component
 */

import { CHROMATIC_NOTES, FREQUENCY_REFERENCE, ENHARMONIC_EQUIVALENTS } from './data/scale-patterns.js';

/**
 * Calculate the frequency of a note
 * @param {string} note - Note name (C, C#, D, etc.)
 * @param {number} octave - Octave number
 * @returns {number} Frequency in Hz
 */
export function calculateFrequency(note, octave) {
    const noteIndex = CHROMATIC_NOTES.indexOf(note);
    if (noteIndex === -1) {
        throw new Error(`Invalid note: ${note}`);
    }
    
    const a4Index = CHROMATIC_NOTES.indexOf(FREQUENCY_REFERENCE.note);
    const semitones = (octave - FREQUENCY_REFERENCE.octave) * 12 + (noteIndex - a4Index);
    
    return FREQUENCY_REFERENCE.frequency * Math.pow(2, semitones / 12);
}

/**
 * Parse a note string into note and octave components
 * @param {string} noteString - Note string like "C4", "F#3"
 * @returns {Object} Object with note and octave properties
 */
export function parseNoteString(noteString) {
    const match = noteString.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) {
        throw new Error(`Invalid note string: ${noteString}`);
    }
    
    return {
        note: match[1],
        octave: parseInt(match[2])
    };
}

/**
 * Convert a note and octave to a formatted string
 * @param {string} note - Note name
 * @param {number} octave - Octave number
 * @returns {string} Formatted note string
 */
export function formatNoteString(note, octave) {
    return `${note}${octave}`;
}

/**
 * Get the enharmonic equivalent of a note
 * @param {string} note - Note name
 * @returns {string} Enharmonic equivalent or original note
 */
export function getEnharmonicEquivalent(note) {
    return ENHARMONIC_EQUIVALENTS[note] || note;
}

/**
 * Calculate the interval in semitones between two notes
 * @param {string} fromNote - Starting note
 * @param {string} toNote - Ending note
 * @returns {number} Number of semitones
 */
export function getIntervalSemitones(fromNote, toNote) {
    const fromIndex = CHROMATIC_NOTES.indexOf(fromNote);
    const toIndex = CHROMATIC_NOTES.indexOf(toNote);
    
    if (fromIndex === -1 || toIndex === -1) {
        throw new Error(`Invalid notes: ${fromNote}, ${toNote}`);
    }
    
    let interval = toIndex - fromIndex;
    if (interval < 0) {
        interval += 12;
    }
    
    return interval;
}

/**
 * Transpose a note by a number of semitones
 * @param {string} note - Original note
 * @param {number} semitones - Number of semitones to transpose
 * @returns {string} Transposed note
 */
export function transposeNote(note, semitones) {
    const noteIndex = CHROMATIC_NOTES.indexOf(note);
    if (noteIndex === -1) {
        throw new Error(`Invalid note: ${note}`);
    }
    
    const newIndex = (noteIndex + semitones) % 12;
    const adjustedIndex = newIndex < 0 ? newIndex + 12 : newIndex;
    
    return CHROMATIC_NOTES[adjustedIndex];
}

/**
 * Validate if a string is a valid note name
 * @param {string} note - Note to validate
 * @returns {boolean} True if valid
 */
export function isValidNote(note) {
    return CHROMATIC_NOTES.includes(note);
}

/**
 * Validate if a string is a valid note string with octave
 * @param {string} noteString - Note string to validate
 * @returns {boolean} True if valid
 */
export function isValidNoteString(noteString) {
    try {
        parseNoteString(noteString);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get all chromatic notes
 * @returns {Array} Array of all chromatic notes
 */
export function getAllNotes() {
    return [...CHROMATIC_NOTES];
}