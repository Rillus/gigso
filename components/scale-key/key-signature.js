/**
 * KeySignature class - Manages key signatures, accidentals, and key relationships
 */

import { CHROMATIC_NOTES, ENHARMONIC_EQUIVALENTS } from './data/scale-patterns.js';
import { SCALE_PATTERNS } from './data/scale-patterns.js';

export default class KeySignature {
    constructor(key, scaleType = 'major') {
        this.key = key;
        this.scaleType = scaleType;
        this.sharps = [];
        this.flats = [];
        this.calculateAccidentals();
    }

    /**
     * Calculate sharps and flats for this key signature
     */
    calculateAccidentals() {
        // Order of sharps: F# C# G# D# A# E# B#
        const sharpOrder = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
        // Order of flats: Bb Eb Ab Db Gb Cb Fb
        const flatOrder = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];

        // Major key signatures
        const majorKeySharps = {
            'C': [], 'G': ['F#'], 'D': ['F#', 'C#'], 'A': ['F#', 'C#', 'G#'],
            'E': ['F#', 'C#', 'G#', 'D#'], 'B': ['F#', 'C#', 'G#', 'D#', 'A#'],
            'F#': ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'], 'C#': ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#']
        };

        const majorKeyFlats = {
            'F': ['Bb'], 'Bb': ['Bb', 'Eb'], 'Eb': ['Bb', 'Eb', 'Ab'],
            'Ab': ['Bb', 'Eb', 'Ab', 'Db'], 'Db': ['Bb', 'Eb', 'Ab', 'Db', 'Gb'],
            'Gb': ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'], 'Cb': ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb']
        };

        if (this.scaleType === 'major') {
            this.sharps = majorKeySharps[this.key] || [];
            this.flats = majorKeyFlats[this.key] || [];
        } else if (this.scaleType === 'minor' || this.scaleType === 'naturalMinor') {
            // For minor keys, use the relative major's key signature
            const relativeMajor = this.getRelativeMajor();
            this.sharps = majorKeySharps[relativeMajor] || [];
            this.flats = majorKeyFlats[relativeMajor] || [];
        } else {
            // For other scale types, calculate based on the pattern
            this.calculateFromScalePattern();
        }
    }

    /**
     * Calculate accidentals from the scale pattern
     */
    calculateFromScalePattern() {
        const pattern = SCALE_PATTERNS[this.scaleType];
        if (!pattern) {
            this.sharps = [];
            this.flats = [];
            return;
        }

        const rootIndex = CHROMATIC_NOTES.indexOf(this.key);
        const scaleNotes = pattern.intervals.map(interval => {
            const noteIndex = (rootIndex + interval) % 12;
            return CHROMATIC_NOTES[noteIndex];
        });

        this.sharps = scaleNotes.filter(note => note.includes('#'));
        this.flats = scaleNotes.filter(note => note.includes('b'));
    }

    /**
     * Get the relative major key for a minor key
     * @returns {string} Relative major key
     */
    getRelativeMajor() {
        if (this.scaleType !== 'minor' && this.scaleType !== 'naturalMinor') {
            return this.key;
        }

        const minorToMajor = {
            'A': 'C', 'E': 'G', 'B': 'D', 'F#': 'A', 'C#': 'E', 'G#': 'B', 'D#': 'F#',
            'D': 'F', 'G': 'Bb', 'C': 'Eb', 'F': 'Ab', 'Bb': 'Db', 'Eb': 'Gb', 'Ab': 'Cb'
        };

        return minorToMajor[this.key] || this.key;
    }

    /**
     * Get the relative minor key for a major key
     * @returns {string} Relative minor key
     */
    getRelativeMinor() {
        if (this.scaleType !== 'major') {
            return this.key;
        }

        const majorToMinor = {
            'C': 'A', 'G': 'E', 'D': 'B', 'A': 'F#', 'E': 'C#', 'B': 'G#', 'F#': 'D#',
            'F': 'D', 'Bb': 'G', 'Eb': 'C', 'Ab': 'F', 'Db': 'Bb', 'Gb': 'Eb', 'Cb': 'Ab'
        };

        return majorToMinor[this.key] || this.key;
    }

    /**
     * Get the sharps in this key signature
     * @returns {Array} Array of sharp notes
     */
    getSharps() {
        return [...this.sharps];
    }

    /**
     * Get the flats in this key signature
     * @returns {Array} Array of flat notes
     */
    getFlats() {
        return [...this.flats];
    }

    /**
     * Get all accidentals (sharps and flats)
     * @returns {Array} Array of all accidentals
     */
    getAccidentals() {
        return [...this.sharps, ...this.flats];
    }

    /**
     * Get the key center
     * @returns {string} Key center note
     */
    getKeyCenter() {
        return this.key;
    }

    /**
     * Get scale notes with proper accidentals applied
     * @returns {Array} Array of notes with accidentals
     */
    getNotesWithAccidentals() {
        const pattern = SCALE_PATTERNS[this.scaleType];
        if (!pattern) {
            return [];
        }

        const rootIndex = CHROMATIC_NOTES.indexOf(this.key);
        return pattern.intervals.map(interval => {
            const noteIndex = (rootIndex + interval) % 12;
            let note = CHROMATIC_NOTES[noteIndex];
            
            // Apply enharmonic equivalents based on key signature
            if (this.flats.length > 0 && note.includes('#')) {
                note = ENHARMONIC_EQUIVALENTS[note] || note;
            }
            
            return note;
        });
    }

    /**
     * Check if this key signature is enharmonically equivalent to another
     * @param {KeySignature} otherKeySignature - Other key signature to compare
     * @returns {boolean} True if enharmonically equivalent
     */
    isEnharmonicEquivalent(otherKeySignature) {
        // Compare the actual notes in the scales
        const thisNotes = this.getNotesWithAccidentals();
        const otherNotes = otherKeySignature.getNotesWithAccidentals();
        
        if (thisNotes.length !== otherNotes.length) {
            return false;
        }
        
        // Convert all notes to their "natural" form for comparison
        const normalizeNote = (note) => {
            return ENHARMONIC_EQUIVALENTS[note] || note;
        };
        
        const thisNormalized = thisNotes.map(normalizeNote).sort();
        const otherNormalized = otherNotes.map(normalizeNote).sort();
        
        return JSON.stringify(thisNormalized) === JSON.stringify(otherNormalized);
    }

    /**
     * Get position on the circle of fifths
     * @returns {number} Position on circle of fifths (-7 to +7)
     */
    getCircleOfFifthsPosition() {
        const majorPositions = {
            'Cb': -7, 'Gb': -6, 'Db': -5, 'Ab': -4, 'Eb': -3, 'Bb': -2, 'F': -1,
            'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7
        };

        if (this.scaleType === 'major') {
            return majorPositions[this.key] || 0;
        } else if (this.scaleType === 'minor' || this.scaleType === 'naturalMinor') {
            const relativeMajor = this.getRelativeMajor();
            return majorPositions[relativeMajor] || 0;
        }

        return 0;
    }

    /**
     * Get a display name for this key signature
     * @returns {string} Display name
     */
    getDisplayName() {
        const scaleDisplayNames = {
            'major': 'Major',
            'minor': 'Minor',
            'naturalMinor': 'Natural Minor',
            'harmonicMinor': 'Harmonic Minor',
            'melodicMinor': 'Melodic Minor'
        };

        const scaleName = scaleDisplayNames[this.scaleType] || this.scaleType;
        return `${this.key} ${scaleName}`;
    }

    /**
     * Convert to a plain object for serialization
     * @returns {Object} Plain object representation
     */
    toObject() {
        return {
            key: this.key,
            scaleType: this.scaleType,
            sharps: this.sharps,
            flats: this.flats
        };
    }

    /**
     * Create a KeySignature from a plain object
     * @param {Object} obj - Object with key signature data
     * @returns {KeySignature} New KeySignature instance
     */
    static fromObject(obj) {
        const keySignature = new KeySignature(obj.key, obj.scaleType);
        keySignature.sharps = obj.sharps || [];
        keySignature.flats = obj.flats || [];
        return keySignature;
    }
}