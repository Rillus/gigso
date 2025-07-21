/**
 * ScaleKey - Main component class for unified scale and key operations
 * Provides comprehensive musical theory functionality for all instruments
 */

import { SCALE_PATTERNS, CHROMATIC_NOTES } from './data/scale-patterns.js';
import { INSTRUMENT_CONFIGS, DEFAULT_INSTRUMENT } from './data/instrument-configs.js';
import ScalePattern from './scale-pattern.js';
import KeySignature from './key-signature.js';
import { 
    calculateFrequency, 
    transposeNote, 
    getIntervalSemitones, 
    isValidNote,
    formatNoteString
} from './note-utils.js';
import HandPanAdapter from './instrument-adapters/hand-pan-adapter.js';

// Scale Key Events
export const SCALE_KEY_EVENTS = {
    SCALE_CHANGED: 'scale-changed',
    KEY_CHANGED: 'key-changed',
    SCALE_GENERATED: 'scale-generated',
    TRANSPOSITION_COMPLETE: 'transposition-complete',
    VALIDATION_ERROR: 'validation-error'
};

// Caching system for performance optimization
class ScaleCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key, scaleType, options) {
        const cacheKey = this.generateCacheKey(key, scaleType, options);
        return this.cache.get(cacheKey);
    }

    set(key, scaleType, options, scaleData) {
        const cacheKey = this.generateCacheKey(key, scaleType, options);
        
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(cacheKey, scaleData);
    }

    generateCacheKey(key, scaleType, options) {
        return `${key}-${scaleType}-${JSON.stringify(options)}`;
    }

    clear() {
        this.cache.clear();
    }
}

export default class ScaleKey extends EventTarget {
    constructor(options = {}) {
        super();
        
        // Configuration
        this.instrument = options.instrument || DEFAULT_INSTRUMENT;
        this.defaultKey = options.defaultKey || 'C';
        this.defaultScale = options.defaultScale || 'major';
        this.enableCache = options.cache !== false;
        
        // Internal state
        this.currentKey = this.defaultKey;
        this.currentScale = this.defaultScale;
        this.scalePatterns = this.initializeScalePatterns();
        this.instrumentAdapters = this.initializeInstrumentAdapters();
        
        // Performance optimization
        this.cache = this.enableCache ? new ScaleCache() : null;
        
        // Initialize with default scale
        this.generateScale(this.defaultKey, this.defaultScale);
    }

    /**
     * Initialize scale patterns from data
     * @returns {Map} Map of scale patterns
     */
    initializeScalePatterns() {
        const patterns = new Map();
        
        for (const [key, patternData] of Object.entries(SCALE_PATTERNS)) {
            const pattern = new ScalePattern(
                patternData.name,
                patternData.intervals,
                patternData.degrees,
                patternData
            );
            patterns.set(key, pattern);
        }
        
        return patterns;
    }

    /**
     * Initialize instrument adapters
     * @returns {Map} Map of instrument adapters
     */
    initializeInstrumentAdapters() {
        const adapters = new Map();
        
        // Add HandPan adapter
        if (INSTRUMENT_CONFIGS.handPan) {
            adapters.set('handPan', new HandPanAdapter(INSTRUMENT_CONFIGS.handPan));
        }
        
        // Additional adapters can be added here as they're implemented
        
        return adapters;
    }

    /**
     * Generate a scale with the specified key and scale type
     * @param {string} key - Root key (C, D, F#, etc.)
     * @param {string} scaleType - Scale type (major, minor, etc.)
     * @param {Object} options - Generation options
     * @returns {Object} Generated scale data
     */
    generateScale(key, scaleType, options = {}) {
        try {
            // Validate inputs
            if (!this.isValidKey(key)) {
                throw new Error(`Invalid key: ${key}`);
            }
            
            if (!this.isValidScale(scaleType)) {
                throw new Error(`Invalid scale type: ${scaleType}`);
            }

            // Check cache first
            if (this.cache) {
                const cached = this.cache.get(key, scaleType, options);
                if (cached) {
                    this.updateCurrentState(key, scaleType, cached);
                    return cached;
                }
            }

            // Get scale pattern
            const pattern = this.scalePatterns.get(scaleType);
            if (!pattern) {
                throw new Error(`Scale pattern not found: ${scaleType}`);
            }

            // Generate base scale data
            const octave = options.octave || 4;
            const notes = pattern.generateNotes(key, octave);

            const scaleData = {
                key,
                scaleType,
                pattern: pattern.getName(),
                notes,
                keySignature: new KeySignature(key, scaleType),
                metadata: {
                    category: pattern.getCategory(),
                    description: pattern.getDescription(),
                    generatedAt: Date.now(),
                    options
                }
            };

            // Apply instrument-specific adaptation if specified
            let finalScaleData = scaleData;
            const instrument = options.instrument || this.instrument;
            
            if (instrument && this.instrumentAdapters.has(instrument)) {
                const adapter = this.instrumentAdapters.get(instrument);
                finalScaleData = adapter.adaptScale(scaleData, options);
            }

            // Cache the result
            if (this.cache) {
                this.cache.set(key, scaleType, options, finalScaleData);
            }

            // Update internal state and dispatch events
            this.updateCurrentState(key, scaleType, finalScaleData);
            this.dispatchScaleEvent('scale-generated', finalScaleData);

            return finalScaleData;

        } catch (error) {
            this.dispatchEvent(new CustomEvent(SCALE_KEY_EVENTS.VALIDATION_ERROR, {
                detail: { error: error.message, key, scaleType, options }
            }));
            throw error;
        }
    }

    /**
     * Get scale notes for a specific key and scale type
     * @param {string} key - Root key
     * @param {string} scaleType - Scale type
     * @param {number} octave - Starting octave
     * @returns {Array} Array of note strings
     */
    getScaleNotes(key, scaleType, octave = 4) {
        const scaleData = this.generateScale(key, scaleType, { octave });
        return scaleData.notes.map(noteObj => noteObj.noteString);
    }

    /**
     * Get the scale pattern for a scale type
     * @param {string} scaleType - Scale type
     * @returns {Object} Scale pattern data
     */
    getScalePattern(scaleType) {
        const pattern = this.scalePatterns.get(scaleType);
        return pattern ? pattern.toObject() : null;
    }

    /**
     * Transpose notes from one key to another
     * @param {string} fromKey - Source key
     * @param {string} toKey - Target key
     * @param {Array} notes - Array of note strings to transpose
     * @returns {Array} Transposed note strings
     */
    transposeKey(fromKey, toKey, notes) {
        try {
            const semitones = getIntervalSemitones(fromKey, toKey);
            
            const transposedNotes = notes.map(noteString => {
                // Parse note and octave
                const match = noteString.match(/^([A-G][#b]?)(\d+)$/);
                if (!match) {
                    throw new Error(`Invalid note string: ${noteString}`);
                }
                
                const [, note, octave] = match;
                const transposedNote = transposeNote(note, semitones);
                
                return formatNoteString(transposedNote, parseInt(octave));
            });

            this.dispatchEvent(new CustomEvent(SCALE_KEY_EVENTS.TRANSPOSITION_COMPLETE, {
                detail: { fromKey, toKey, originalNotes: notes, transposedNotes }
            }));

            return transposedNotes;

        } catch (error) {
            this.dispatchEvent(new CustomEvent(SCALE_KEY_EVENTS.VALIDATION_ERROR, {
                detail: { error: error.message, fromKey, toKey, notes }
            }));
            throw error;
        }
    }

    /**
     * Get the relative key for a given key and scale type
     * @param {string} key - Current key
     * @param {string} scaleType - Current scale type
     * @returns {Object} Relative key information
     */
    getRelativeKey(key, scaleType) {
        const keySignature = new KeySignature(key, scaleType);
        
        if (scaleType === 'major') {
            return {
                key: keySignature.getRelativeMinor(),
                scaleType: 'naturalMinor'
            };
        } else if (scaleType === 'minor' || scaleType === 'naturalMinor') {
            return {
                key: keySignature.getRelativeMajor(),
                scaleType: 'major'
            };
        }
        
        return { key, scaleType }; // Return original if no relative relationship
    }

    /**
     * Get key signature information
     * @param {string} key - Key
     * @param {string} scaleType - Scale type
     * @returns {Object} Key signature data
     */
    getKeySignature(key, scaleType) {
        const keySignature = new KeySignature(key, scaleType);
        return keySignature.toObject();
    }

    /**
     * Validate if a key is valid
     * @param {string} key - Key to validate
     * @returns {boolean} True if valid
     */
    isValidKey(key) {
        return isValidNote(key);
    }

    /**
     * Validate if a scale type is valid
     * @param {string} scaleType - Scale type to validate
     * @returns {boolean} True if valid
     */
    isValidScale(scaleType) {
        return this.scalePatterns.has(scaleType);
    }

    /**
     * Validate key and scale combination
     * @param {string} key - Key to validate
     * @param {string} scaleType - Scale type to validate
     * @returns {boolean} True if valid combination
     */
    validateKeyScale(key, scaleType) {
        return this.isValidKey(key) && this.isValidScale(scaleType);
    }

    /**
     * Get the frequency of a note
     * @param {string} noteString - Note string (e.g., "A4")
     * @returns {number} Frequency in Hz
     */
    getNoteFrequency(noteString) {
        const match = noteString.match(/^([A-G][#b]?)(\d+)$/);
        if (!match) {
            throw new Error(`Invalid note string: ${noteString}`);
        }
        
        const [, note, octave] = match;
        return calculateFrequency(note, parseInt(octave));
    }

    /**
     * Get the interval between two notes
     * @param {string} rootNote - Root note
     * @param {string} targetNote - Target note
     * @returns {number} Interval in semitones
     */
    getIntervalFromRoot(rootNote, targetNote) {
        return getIntervalSemitones(rootNote, targetNote);
    }

    /**
     * Get chord suggestions for a key and scale
     * @param {string} key - Key
     * @param {string} scaleType - Scale type
     * @returns {Array} Array of chord suggestions
     */
    getChordSuggestions(key, scaleType) {
        const scaleData = this.generateScale(key, scaleType);
        const { notes } = scaleData;
        
        // Generate basic triad chords from scale degrees
        const chords = [];
        const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
        
        for (let i = 0; i < Math.min(notes.length, 7); i++) {
            const root = notes[i];
            const third = notes[(i + 2) % notes.length];
            const fifth = notes[(i + 4) % notes.length];
            
            const chord = {
                root: root.note,
                notes: [root.note, third.note, fifth.note],
                function: romanNumerals[i] || `${i + 1}`,
                quality: this.determineChordQuality(root, third, fifth)
            };
            
            chords.push(chord);
        }
        
        return chords;
    }

    /**
     * Determine the quality of a chord
     * @param {Object} root - Root note object
     * @param {Object} third - Third note object
     * @param {Object} fifth - Fifth note object
     * @returns {string} Chord quality
     */
    determineChordQuality(root, third, fifth) {
        const thirdInterval = (third.interval - root.interval + 12) % 12;
        const fifthInterval = (fifth.interval - root.interval + 12) % 12;
        
        if (thirdInterval === 4 && fifthInterval === 7) return 'major';
        if (thirdInterval === 3 && fifthInterval === 7) return 'minor';
        if (thirdInterval === 3 && fifthInterval === 6) return 'diminished';
        if (thirdInterval === 4 && fifthInterval === 8) return 'augmented';
        
        return 'unknown';
    }

    /**
     * Update internal state and dispatch change events
     * @param {string} key - New key
     * @param {string} scaleType - New scale type
     * @param {Object} scaleData - Generated scale data
     */
    updateCurrentState(key, scaleType, scaleData) {
        const keyChanged = this.currentKey !== key;
        const scaleChanged = this.currentScale !== scaleType;
        
        this.currentKey = key;
        this.currentScale = scaleType;
        
        if (keyChanged) {
            this.dispatchScaleEvent('key-changed', { key, scaleType, scaleData });
        }
        
        if (scaleChanged) {
            this.dispatchScaleEvent('scale-changed', { key, scaleType, scaleData });
        }
    }

    /**
     * Dispatch a scale-related event
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    dispatchScaleEvent(eventType, data) {
        this.dispatchEvent(new CustomEvent(eventType, {
            detail: {
                ...data,
                timestamp: Date.now()
            }
        }));
    }

    /**
     * Get all available keys
     * @returns {Array} Array of all chromatic keys
     */
    getAllKeys() {
        return [...CHROMATIC_NOTES];
    }

    /**
     * Get all available scale types
     * @returns {Array} Array of scale type names
     */
    getAllScaleTypes() {
        return Array.from(this.scalePatterns.keys());
    }

    /**
     * Get scale types by category
     * @param {string} category - Category to filter by
     * @returns {Array} Array of scale types in the category
     */
    getScaleTypesByCategory(category) {
        const scaleTypes = [];
        
        for (const [type, pattern] of this.scalePatterns) {
            if (pattern.getCategory() === category) {
                scaleTypes.push(type);
            }
        }
        
        return scaleTypes;
    }

    /**
     * Get current scale state
     * @returns {Object} Current state
     */
    getCurrentState() {
        return {
            key: this.currentKey,
            scaleType: this.currentScale,
            instrument: this.instrument
        };
    }

    /**
     * Clear the cache
     */
    clearCache() {
        if (this.cache) {
            this.cache.clear();
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        if (!this.cache) {
            return { enabled: false };
        }
        
        return {
            enabled: true,
            size: this.cache.cache.size,
            maxSize: this.cache.maxSize
        };
    }
}