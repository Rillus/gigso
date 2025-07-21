/**
 * ScalePattern class - Represents a musical scale pattern with methods for note generation
 */

import { CHROMATIC_NOTES } from './data/scale-patterns.js';
import { calculateFrequency, formatNoteString } from './note-utils.js';

export default class ScalePattern {
    constructor(name, intervals, degrees, metadata = {}) {
        this.name = name;
        this.intervals = intervals;
        this.degrees = degrees;
        this.metadata = metadata;
    }

    /**
     * Get the pattern name
     * @returns {string} Pattern name
     */
    getName() {
        return this.name;
    }

    /**
     * Get the interval array
     * @returns {Array} Array of intervals in semitones
     */
    getIntervals() {
        return [...this.intervals];
    }

    /**
     * Get the degree array
     * @returns {Array} Array of scale degrees
     */
    getDegrees() {
        return [...this.degrees];
    }

    /**
     * Get the metadata object
     * @returns {Object} Metadata object
     */
    getMetadata() {
        return { ...this.metadata };
    }

    /**
     * Generate notes for this pattern starting from a root key
     * @param {string} rootKey - Root note (C, D, F#, etc.)
     * @param {number} octave - Starting octave (default: 4)
     * @returns {Array} Array of note objects
     */
    generateNotes(rootKey, octave = 4) {
        const rootIndex = CHROMATIC_NOTES.indexOf(rootKey);
        if (rootIndex === -1) {
            throw new Error(`Invalid root key: ${rootKey}`);
        }

        return this.intervals.map((interval, index) => {
            const noteIndex = (rootIndex + interval) % 12;
            const octaveOffset = Math.floor((rootIndex + interval) / 12);
            const finalOctave = octave + octaveOffset;
            const note = CHROMATIC_NOTES[noteIndex];

            return {
                note,
                octave: finalOctave,
                noteString: formatNoteString(note, finalOctave),
                degree: this.degrees[index],
                interval,
                frequency: calculateFrequency(note, finalOctave)
            };
        });
    }

    /**
     * Get notes within a specific octave range
     * @param {string} rootKey - Root note
     * @param {number} startOctave - Starting octave
     * @param {number} endOctave - Ending octave
     * @returns {Array} Array of note objects within the range
     */
    getNotesInRange(rootKey, startOctave, endOctave) {
        const allNotes = [];
        
        for (let octave = startOctave; octave <= endOctave; octave++) {
            const notesInOctave = this.generateNotes(rootKey, octave);
            // Filter notes that are actually in the target octave range
            const filteredNotes = notesInOctave.filter(noteObj => 
                noteObj.octave >= startOctave && noteObj.octave <= endOctave
            );
            allNotes.push(...filteredNotes);
        }
        
        return allNotes;
    }

    /**
     * Validate that this pattern is properly formed
     * @returns {boolean} True if valid
     */
    isValid() {
        if (!this.name || !Array.isArray(this.intervals) || !Array.isArray(this.degrees)) {
            return false;
        }
        
        if (this.intervals.length !== this.degrees.length) {
            return false;
        }
        
        // Check that intervals are unique and in ascending order
        for (let i = 1; i < this.intervals.length; i++) {
            if (this.intervals[i] <= this.intervals[i - 1]) {
                return false;
            }
        }
        
        // Root should always be at interval 0
        return this.intervals[0] === 0;
    }

    /**
     * Check if this pattern contains a specific interval
     * @param {number} interval - Interval in semitones
     * @returns {boolean} True if interval exists in pattern
     */
    hasInterval(interval) {
        return this.intervals.includes(interval);
    }

    /**
     * Get the number of notes in this scale
     * @returns {number} Number of notes
     */
    getNoteCount() {
        return this.intervals.length;
    }

    /**
     * Get a human-readable description of the scale
     * @returns {string} Description
     */
    getDescription() {
        return this.metadata.description || `${this.name} with ${this.getNoteCount()} notes`;
    }

    /**
     * Get the category of this scale
     * @returns {string} Scale category
     */
    getCategory() {
        return this.metadata.category || 'uncategorized';
    }

    /**
     * Create a copy of this scale pattern
     * @returns {ScalePattern} New ScalePattern instance
     */
    clone() {
        return new ScalePattern(
            this.name,
            [...this.intervals],
            [...this.degrees],
            { ...this.metadata }
        );
    }

    /**
     * Convert to a plain object for serialization
     * @returns {Object} Plain object representation
     */
    toObject() {
        return {
            name: this.name,
            intervals: this.intervals,
            degrees: this.degrees,
            metadata: this.metadata
        };
    }

    /**
     * Create a ScalePattern from a plain object
     * @param {Object} obj - Object with scale data
     * @returns {ScalePattern} New ScalePattern instance
     */
    static fromObject(obj) {
        return new ScalePattern(
            obj.name,
            obj.intervals,
            obj.degrees,
            obj.metadata
        );
    }
}