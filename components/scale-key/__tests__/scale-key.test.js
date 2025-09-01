/**
 * Tests for ScaleKey component
 */

// Mock DOM environment for testing
global.EventTarget = global.EventTarget || class {
    constructor() {
        this.listeners = {};
    }
    
    addEventListener(type, listener) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(listener);
    }
    
    removeEventListener(type, listener) {
        if (this.listeners[type]) {
            const index = this.listeners[type].indexOf(listener);
            if (index > -1) {
                this.listeners[type].splice(index, 1);
            }
        }
    }
    
    dispatchEvent(event) {
        if (this.listeners[event.type]) {
            this.listeners[event.type].forEach(listener => listener(event));
        }
    }
};

global.CustomEvent = global.CustomEvent || class extends Event {
    constructor(type, options = {}) {
        super(type);
        this.detail = options.detail;
    }
};

import ScaleKey, { SCALE_KEY_EVENTS } from '../scale-key.js';

describe('ScaleKey Component', () => {
    let scaleKey;
    
    beforeEach(() => {
        scaleKey = new ScaleKey();
    });
    
    describe('Initialization', () => {
        test('should initialize with default values', () => {
            expect(scaleKey.currentKey).toBe('C');
            expect(scaleKey.currentScale).toBe('major');
            expect(scaleKey.instrument).toBe('handPan');
        });
        
        test('should initialize with custom options', () => {
            const customScaleKey = new ScaleKey({
                defaultKey: 'D',
                defaultScale: 'minor',
                instrument: 'fretboard'
            });
            
            expect(customScaleKey.currentKey).toBe('D');
            expect(customScaleKey.currentScale).toBe('minor');
            expect(customScaleKey.instrument).toBe('fretboard');
        });
    });
    
    describe('Scale Generation', () => {
        test('should generate correct C major scale', () => {
            const scale = scaleKey.generateScale('C', 'major');
            const noteNames = scale.notes.map(n => n.note);
            
            expect(noteNames).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
        });
        
        test('should generate correct D minor scale', () => {
            const scale = scaleKey.generateScale('D', 'minor');
            const noteNames = scale.notes.map(n => n.note);
            
            expect(noteNames).toEqual(['D', 'E', 'F', 'G', 'A', 'A#', 'C']);
        });
        
        test('should generate correct frequencies', () => {
            const scale = scaleKey.generateScale('A', 'major', { octave: 4 });
            const aNote = scale.notes.find(n => n.note === 'A');
            
            expect(aNote.frequency).toBeCloseTo(440, 1);
        });
        
        test('should handle invalid keys gracefully', () => {
            expect(() => scaleKey.generateScale('H', 'major')).toThrow('Invalid key: H');
        });
        
        test('should handle invalid scale types gracefully', () => {
            expect(() => scaleKey.generateScale('C', 'invalid')).toThrow('Invalid scale type: invalid');
        });
        
        test('should include key signature information', () => {
            const scale = scaleKey.generateScale('G', 'major');
            
            expect(scale.keySignature).toBeDefined();
            expect(scale.keySignature.key).toBe('G');
            expect(scale.keySignature.scaleType).toBe('major');
        });
    });
    
    describe('Key Transposition', () => {
        test('should transpose correctly between keys', () => {
            const notes = ['C4', 'E4', 'G4'];
            const transposed = scaleKey.transposeKey('C', 'D', notes);
            
            expect(transposed).toEqual(['D4', 'F#4', 'A4']);
        });
        
        test('should handle octave wrapping in transposition', () => {
            const notes = ['A4', 'B4'];
            const transposed = scaleKey.transposeKey('A', 'C', notes);
            
            expect(transposed).toEqual(['C4', 'D4']);
        });
        
        test('should emit transposition complete event', () => {
            const eventSpy = jest.fn();
            scaleKey.addEventListener(SCALE_KEY_EVENTS.TRANSPOSITION_COMPLETE, eventSpy);
            
            scaleKey.transposeKey('C', 'G', ['C4']);
            
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        fromKey: 'C',
                        toKey: 'G',
                        originalNotes: ['C4'],
                        transposedNotes: ['G4']
                    })
                })
            );
        });
    });
    
    describe('Instrument Adaptation', () => {
        test('should adapt scale for handPan', () => {
            const adapted = scaleKey.generateScale('D', 'minor', {
                instrument: 'handPan',
                noteCount: 8
            });
            
            expect(adapted.instrument).toBe('handPan');
            expect(adapted.layout).toBe('circular');
            expect(adapted.adaptedNotes).toHaveLength(8);
        });
        
        test('should include position information for handPan notes', () => {
            const adapted = scaleKey.generateScale('C', 'major', {
                instrument: 'handPan',
                noteCount: 7
            });
            
            const centerNote = adapted.adaptedNotes[0];
            expect(centerNote.position.type).toBe('center');
            
            const surroundingNote = adapted.adaptedNotes[1];
            expect(surroundingNote.position.type).toBe('surrounding');
            expect(surroundingNote.position.angle).toBeDefined();
        });
    });
    
    describe('Relative Keys', () => {
        test('should find relative minor for major keys', () => {
            const relative = scaleKey.getRelativeKey('C', 'major');
            
            expect(relative.key).toBe('A');
            expect(relative.scaleType).toBe('naturalMinor');
        });
        
        test('should find relative major for minor keys', () => {
            const relative = scaleKey.getRelativeKey('A', 'minor');
            
            expect(relative.key).toBe('C');
            expect(relative.scaleType).toBe('major');
        });
    });
    
    describe('Chord Suggestions', () => {
        test('should generate chord suggestions for major scale', () => {
            const chords = scaleKey.getChordSuggestions('C', 'major');
            
            expect(chords).toHaveLength(7);
            expect(chords[0].root).toBe('C');
            expect(chords[0].function).toBe('I');
            expect(chords[0].quality).toBe('major');
        });
        
        test('should include chord notes', () => {
            const chords = scaleKey.getChordSuggestions('C', 'major');
            const cMajor = chords[0];
            
            expect(cMajor.notes).toEqual(['C', 'E', 'G']);
        });
    });
    
    describe('Validation', () => {
        test('should validate keys correctly', () => {
            expect(scaleKey.isValidKey('C')).toBe(true);
            expect(scaleKey.isValidKey('F#')).toBe(true);
            expect(scaleKey.isValidKey('H')).toBe(false);
            expect(scaleKey.isValidKey('')).toBe(false);
        });
        
        test('should validate scale types correctly', () => {
            expect(scaleKey.isValidScale('major')).toBe(true);
            expect(scaleKey.isValidScale('minor')).toBe(true);
            expect(scaleKey.isValidScale('blues')).toBe(true);
            expect(scaleKey.isValidScale('invalid')).toBe(false);
        });
        
        test('should validate key-scale combinations', () => {
            expect(scaleKey.validateKeyScale('C', 'major')).toBe(true);
            expect(scaleKey.validateKeyScale('H', 'major')).toBe(false);
            expect(scaleKey.validateKeyScale('C', 'invalid')).toBe(false);
        });
    });
    
    describe('Frequency Calculations', () => {
        test('should calculate note frequencies correctly', () => {
            expect(scaleKey.getNoteFrequency('A4')).toBeCloseTo(440, 1);
            expect(scaleKey.getNoteFrequency('C4')).toBeCloseTo(261.63, 1);
        });
        
        test('should handle octave changes in frequency calculation', () => {
            const a4 = scaleKey.getNoteFrequency('A4');
            const a5 = scaleKey.getNoteFrequency('A5');
            
            expect(a5).toBeCloseTo(a4 * 2, 1);
        });
    });
    
    describe('Utility Methods', () => {
        test('should get all available keys', () => {
            const keys = scaleKey.getAllKeys();
            
            expect(keys).toHaveLength(12);
            expect(keys).toContain('C');
            expect(keys).toContain('F#');
        });
        
        test('should get all available scale types', () => {
            const scaleTypes = scaleKey.getAllScaleTypes();
            
            expect(scaleTypes.length).toBeGreaterThan(5);
            expect(scaleTypes).toContain('major');
            expect(scaleTypes).toContain('minor');
            expect(scaleTypes).toContain('blues');
        });
        
        test('should filter scale types by category', () => {
            const pentatonicScales = scaleKey.getScaleTypesByCategory('pentatonic');
            
            expect(pentatonicScales).toContain('majorPentatonic');
            expect(pentatonicScales).toContain('minorPentatonic');
        });
    });
    
    describe('Event System', () => {
        test('should emit scale-changed event', () => {
            const eventSpy = jest.fn();
            scaleKey.addEventListener(SCALE_KEY_EVENTS.SCALE_CHANGED, eventSpy);
            
            scaleKey.generateScale('G', 'minor');
            
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        key: 'G',
                        scaleType: 'minor'
                    })
                })
            );
        });
        
        test('should emit validation-error event for invalid input', () => {
            const eventSpy = jest.fn();
            scaleKey.addEventListener(SCALE_KEY_EVENTS.VALIDATION_ERROR, eventSpy);
            
            try {
                scaleKey.generateScale('Invalid', 'major');
            } catch (e) {
                // Expected to throw
            }
            
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        error: 'Invalid key: Invalid'
                    })
                })
            );
        });
    });
    
    describe('Caching', () => {
        test('should cache generated scales when enabled', () => {
            const cachedScaleKey = new ScaleKey({ cache: true });
            
            // Generate same scale twice
            const scale1 = cachedScaleKey.generateScale('C', 'major');
            const scale2 = cachedScaleKey.generateScale('C', 'major');
            
            // Should be the same object (cached)
            expect(scale1).toBe(scale2);
        });
        
        test('should not cache when disabled', () => {
            const noCacheScaleKey = new ScaleKey({ cache: false });
            
            const scale1 = noCacheScaleKey.generateScale('C', 'major');
            const scale2 = noCacheScaleKey.generateScale('C', 'major');
            
            // Should be different objects (not cached)
            expect(scale1).not.toBe(scale2);
        });
        
        test('should provide cache statistics', () => {
            const stats = scaleKey.getCacheStats();
            
            expect(stats.enabled).toBe(true);
            expect(typeof stats.size).toBe('number');
            expect(typeof stats.maxSize).toBe('number');
        });
    });
    
    describe('State Management', () => {
        test('should track current state', () => {
            scaleKey.generateScale('F#', 'dorian');
            
            const state = scaleKey.getCurrentState();
            expect(state.key).toBe('F#');
            expect(state.scaleType).toBe('dorian');
        });
        
        test('should clear cache on demand', () => {
            scaleKey.generateScale('C', 'major');
            
            const statsBefore = scaleKey.getCacheStats();
            expect(statsBefore.size).toBeGreaterThan(0);
            
            scaleKey.clearCache();
            
            const statsAfter = scaleKey.getCacheStats();
            expect(statsAfter.size).toBe(0);
        });
    });
});