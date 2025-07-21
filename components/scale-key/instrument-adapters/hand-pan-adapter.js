/**
 * HandPan Instrument Adapter - Adapts scales for HandPan layout and requirements
 */

import BaseInstrumentAdapter from './base-adapter.js';

export default class HandPanAdapter extends BaseInstrumentAdapter {
    /**
     * Adapt scale data for HandPan instrument
     * @param {Object} scaleData - Scale data from ScaleKey component
     * @param {Object} options - HandPan-specific options
     * @returns {Object} Adapted scale data for HandPan
     */
    adaptScale(scaleData, options = {}) {
        const mergedOptions = this.mergeOptions(options);
        const { notes } = scaleData;
        const noteCount = mergedOptions.noteCount || this.config.noteCount;

        // Take the specified number of notes for hand pan layout
        let adaptedNotes = notes.slice(0, noteCount);

        // Ensure notes are within octave range
        adaptedNotes = this.filterNotesByOctaveRange(adaptedNotes);

        // If we don't have enough notes after filtering, extend the scale
        if (adaptedNotes.length < noteCount) {
            adaptedNotes = this.extendScaleToFillNotes(scaleData, noteCount, mergedOptions);
        }

        // Apply HandPan-specific note formatting
        const formattedNotes = adaptedNotes.map(noteObj => ({
            ...noteObj,
            formatted: this.formatNote(noteObj.note, noteObj.octave),
            position: this.calculateHandPanPosition(noteObj, adaptedNotes)
        }));

        return {
            ...scaleData,
            adaptedNotes: formattedNotes,
            layout: 'circular',
            instrument: 'handPan',
            noteCount: formattedNotes.length,
            centerNote: formattedNotes[0], // First note is typically the center
            metadata: {
                ...scaleData.metadata,
                instrumentConfig: this.getConfig(),
                adaptationOptions: mergedOptions
            }
        };
    }

    /**
     * Extend the scale to fill the required number of notes
     * @param {Object} scaleData - Original scale data
     * @param {number} targetCount - Target number of notes
     * @param {Object} options - Adaptation options
     * @returns {Array} Extended notes array
     */
    extendScaleToFillNotes(scaleData, targetCount, options) {
        const { notes } = scaleData;
        const extendedNotes = [...notes];
        
        // If we need more notes, continue the scale pattern into the next octave
        while (extendedNotes.length < targetCount) {
            const baseNote = notes[extendedNotes.length % notes.length];
            const octaveOffset = Math.floor(extendedNotes.length / notes.length);
            
            const newNote = {
                ...baseNote,
                octave: baseNote.octave + octaveOffset,
                noteString: this.formatNote(baseNote.note, baseNote.octave + octaveOffset)
            };

            // Only add if within octave range
            if (this.isOctaveInRange(newNote.octave)) {
                extendedNotes.push(newNote);
            } else {
                break; // Stop if we're outside the octave range
            }
        }

        return extendedNotes.slice(0, targetCount);
    }

    /**
     * Calculate the position of a note in the HandPan layout
     * @param {Object} noteObj - Note object
     * @param {Array} allNotes - All notes in the adapted scale
     * @returns {Object} Position information
     */
    calculateHandPanPosition(noteObj, allNotes) {
        const index = allNotes.indexOf(noteObj);
        const totalNotes = allNotes.length;

        if (index === 0) {
            // Center note
            return {
                type: 'center',
                index: 0,
                angle: 0,
                radius: 0
            };
        }

        // Surrounding notes in circular pattern
        const angleStep = 360 / (totalNotes - 1); // -1 because center note doesn't count
        const angle = (index - 1) * angleStep;

        return {
            type: 'surrounding',
            index: index,
            angle: angle,
            radius: 1, // Normalized radius
            position: index - 1 // Position in the circle (0-based)
        };
    }

    /**
     * Get HandPan-specific default options
     * @returns {Object} Default options
     */
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            centerNote: true, // Whether to include a center note
            circularLayout: true, // Use circular layout
            symmetrical: false // Whether to arrange notes symmetrically
        };
    }

    /**
     * Validate HandPan-specific options
     * @param {Object} options - Options to validate
     * @returns {boolean} True if valid
     */
    validateOptions(options) {
        if (!super.validateOptions(options)) {
            return false;
        }

        const { noteCount } = options;
        
        // HandPan typically has 8-9 notes
        if (noteCount && (noteCount < 5 || noteCount > 12)) {
            console.warn(`HandPan adapter: noteCount ${noteCount} is outside typical range (5-12)`);
        }

        return true;
    }

    /**
     * Get suggested note counts for HandPan
     * @returns {Array} Array of suggested note counts
     */
    getSuggestedNoteCounts() {
        return [7, 8, 9, 10]; // Common HandPan configurations
    }

    /**
     * Check if a scale type works well with HandPan
     * @param {string} scaleType - Scale type to check
     * @returns {boolean} True if well-suited
     */
    isWellSuitedScale(scaleType) {
        const wellSuitedScales = [
            'minor', 'naturalMinor', 'dorian', 'majorPentatonic', 
            'minorPentatonic', 'phrygian', 'mixolydian'
        ];
        return wellSuitedScales.includes(scaleType);
    }

    /**
     * Get layout suggestions for a given scale
     * @param {Object} scaleData - Scale data
     * @returns {Object} Layout suggestions
     */
    getLayoutSuggestions(scaleData) {
        const { scaleType, notes } = scaleData;
        
        const suggestions = {
            noteCount: this.getSuggestedNoteCounts(),
            centerNote: notes[0],
            wellSuited: this.isWellSuitedScale(scaleType),
            description: this.getScaleDescription(scaleType)
        };

        return suggestions;
    }

    /**
     * Get a description of how a scale works with HandPan
     * @param {string} scaleType - Scale type
     * @returns {string} Description
     */
    getScaleDescription(scaleType) {
        const descriptions = {
            'minor': 'Excellent for HandPan - creates meditative, flowing melodies',
            'naturalMinor': 'Perfect for HandPan - natural minor scales are ideal',
            'dorian': 'Great for HandPan - offers both minor and bright qualities',
            'majorPentatonic': 'Very good - pentatonic scales avoid dissonance',
            'minorPentatonic': 'Excellent - classic choice for HandPan music',
            'major': 'Good but less common - creates brighter, more uplifting tones',
            'blues': 'Interesting choice - adds blue notes for expressive playing'
        };

        return descriptions[scaleType] || 'Suitable for HandPan with careful arrangement';
    }
}