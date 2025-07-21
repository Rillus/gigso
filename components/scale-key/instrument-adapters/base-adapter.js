/**
 * Base Instrument Adapter - Abstract base class for instrument-specific adaptations
 */

export default class BaseInstrumentAdapter {
    constructor(instrumentConfig) {
        this.config = instrumentConfig;
    }

    /**
     * Adapt scale data for the specific instrument
     * Must be implemented by subclasses
     * @param {Object} scaleData - Scale data from ScaleKey component
     * @param {Object} options - Instrument-specific options
     * @returns {Object} Adapted scale data
     */
    adaptScale(scaleData, options = {}) {
        throw new Error('adaptScale must be implemented by subclass');
    }

    /**
     * Format a note according to instrument conventions
     * @param {string} note - Note name
     * @param {number} octave - Octave number
     * @returns {string} Formatted note string
     */
    formatNote(note, octave) {
        return this.config.noteFormatting(note, octave);
    }

    /**
     * Get the instrument configuration
     * @returns {Object} Instrument configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Get preferred scales for this instrument
     * @returns {Array} Array of preferred scale types
     */
    getPreferredScales() {
        return this.config.preferredScales === 'all' 
            ? [] 
            : [...this.config.preferredScales];
    }

    /**
     * Check if a scale is preferred for this instrument
     * @param {string} scaleType - Scale type to check
     * @returns {boolean} True if preferred
     */
    isPreferredScale(scaleType) {
        if (this.config.preferredScales === 'all') {
            return true;
        }
        return this.config.preferredScales.includes(scaleType);
    }

    /**
     * Get the octave range for this instrument
     * @returns {Array} [minOctave, maxOctave]
     */
    getOctaveRange() {
        return [...this.config.octaveRange];
    }

    /**
     * Check if an octave is within the instrument's range
     * @param {number} octave - Octave to check
     * @returns {boolean} True if within range
     */
    isOctaveInRange(octave) {
        const [min, max] = this.config.octaveRange;
        return octave >= min && octave <= max;
    }

    /**
     * Filter notes to only include those within the instrument's octave range
     * @param {Array} notes - Array of note objects
     * @returns {Array} Filtered notes
     */
    filterNotesByOctaveRange(notes) {
        return notes.filter(noteObj => this.isOctaveInRange(noteObj.octave));
    }

    /**
     * Get the default octave for this instrument
     * @returns {number} Default octave
     */
    getDefaultOctave() {
        return this.config.defaultOctave;
    }

    /**
     * Get the note layout type
     * @returns {string} Layout type
     */
    getNoteLayout() {
        return this.config.noteLayout;
    }

    /**
     * Get a description of the instrument layout
     * @returns {string} Layout description
     */
    getLayoutDescription() {
        return this.config.layoutDescription || 'Standard layout';
    }

    /**
     * Validate options for this adapter
     * @param {Object} options - Options to validate
     * @returns {boolean} True if valid
     */
    validateOptions(options) {
        // Base validation - can be overridden by subclasses
        return typeof options === 'object';
    }

    /**
     * Get default options for this adapter
     * @returns {Object} Default options
     */
    getDefaultOptions() {
        return {
            octave: this.getDefaultOctave(),
            noteCount: this.config.noteCount,
            layout: this.getNoteLayout()
        };
    }

    /**
     * Merge provided options with defaults
     * @param {Object} options - User-provided options
     * @returns {Object} Merged options
     */
    mergeOptions(options = {}) {
        return {
            ...this.getDefaultOptions(),
            ...options
        };
    }
}