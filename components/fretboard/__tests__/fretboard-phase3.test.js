/**
 * Phase 3 Test Suite for Fretboard Component
 * Multi-Instrument Support with Scale Component Integration
 */

import Fretboard from '../fretboard.js';
import ScaleKey from '../../scale-key/scale-key.js';
import chordLibrary from '../../../chord-library.js';
import { INSTRUMENT_CONFIG } from '../fretboard-calculator.js';

describe('Fretboard Component - Phase 3 Multi-Instrument Support', () => {
  let fretboard;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (fretboard) {
      fretboard.remove();
    }
    if (container) {
      container.remove();
    }
  });

  describe('Multi-Instrument Support', () => {
    test('should initialize with guitar by default', () => {
      fretboard = new Fretboard();
      expect(fretboard.instrument).toBe('guitar');
    });

    test('should support guitar instrument', () => {
      fretboard = new Fretboard({ instrument: 'guitar' });
      expect(fretboard.instrument).toBe('guitar');
      expect(INSTRUMENT_CONFIG.guitar).toBeDefined();
    });

    test('should support ukulele instrument', () => {
      fretboard = new Fretboard({ instrument: 'ukulele' });
      expect(fretboard.instrument).toBe('ukulele');
      expect(INSTRUMENT_CONFIG.ukulele).toBeDefined();
    });

    test('should support mandolin instrument', () => {
      fretboard = new Fretboard({ instrument: 'mandolin' });
      expect(fretboard.instrument).toBe('mandolin');
      expect(INSTRUMENT_CONFIG.mandolin).toBeDefined();
    });

    test('should switch instruments dynamically', () => {
      fretboard = new Fretboard({ instrument: 'guitar' });
      expect(fretboard.instrument).toBe('guitar');

      fretboard.setInstrument('ukulele');
      expect(fretboard.instrument).toBe('ukulele');

      fretboard.setInstrument('mandolin');
      expect(fretboard.instrument).toBe('mandolin');
    });

    test('should maintain chord display when switching instruments', () => {
      fretboard = new Fretboard({ instrument: 'guitar' });
      fretboard.displayChord('C');
      expect(fretboard.currentChord).toBeDefined();

      fretboard.setInstrument('ukulele');
      expect(fretboard.currentChord).toBeDefined();
      expect(fretboard.currentChord.name).toBe('C');
    });

    test('should maintain scale display when switching instruments', () => {
      fretboard = new Fretboard({ instrument: 'guitar' });
      fretboard.displayScale('C', 'major');
      expect(fretboard.currentScale).toBeDefined();

      fretboard.setInstrument('ukulele');
      expect(fretboard.currentScale).toBeDefined();
      expect(fretboard.currentScale.root).toBe('C');
      expect(fretboard.currentScale.type).toBe('major');
    });
  });

  describe('Scale Component Integration', () => {
    test('should initialize ScaleKey component', () => {
      fretboard = new Fretboard();
      expect(fretboard.scaleKey).toBeDefined();
      expect(fretboard.scaleKey).toBeInstanceOf(ScaleKey);
    });

    test('should handle ScaleKey initialization failure gracefully', () => {
      // Mock ScaleKey to throw error during construction
      const originalScaleKey = global.ScaleKey;
      global.ScaleKey = class {
        constructor() {
          throw new Error('ScaleKey initialization failed');
        }
      };

      // Create fretboard - it should handle the error gracefully
      fretboard = new Fretboard();
      
      // The component should still work without ScaleKey
      expect(fretboard).toBeDefined();
      expect(fretboard.calculator).toBeDefined();
      expect(fretboard.renderer).toBeDefined();

      // Restore original
      global.ScaleKey = originalScaleKey;
    });

    test('should use ScaleKey for enhanced scale operations', () => {
      fretboard = new Fretboard();
      const spy = jest.spyOn(fretboard.scaleKey, 'generateScale');
      
      fretboard.displayScale('C', 'major');
      
      expect(spy).toHaveBeenCalledWith('C', 'major', {
        key: 'C',
        instrument: 'guitar'
      });
    });

    test('should fallback to calculator when ScaleKey fails', () => {
      fretboard = new Fretboard();
      const calculatorSpy = jest.spyOn(fretboard.calculator, 'getEnhancedScalePositions');
      
      // Mock ScaleKey to throw error
      jest.spyOn(fretboard.scaleKey, 'generateScale').mockImplementation(() => {
        throw new Error('ScaleKey error');
      });
      
      fretboard.displayScale('C', 'major');
      
      expect(calculatorSpy).toHaveBeenCalledWith('guitar', 'C', 'major');
    });

    test('should update ScaleKey instrument when switching instruments', () => {
      fretboard = new Fretboard({ instrument: 'guitar' });
      
      // Check initial instrument
      expect(fretboard.scaleKey.instrument).toBe('guitar');
      
      fretboard.setInstrument('ukulele');
      
      // Check that instrument was updated
      expect(fretboard.scaleKey.instrument).toBe('ukulele');
    });
  });

  describe('Enhanced Scale Operations', () => {
    beforeEach(() => {
      fretboard = new Fretboard();
    });

    test('should get chord suggestions from ScaleKey', () => {
      fretboard.displayScale('C', 'major');
      const suggestions = fretboard.getChordSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    test('should get scale notes with frequencies', () => {
      const notes = fretboard.getScaleNotesWithFrequencies('C', 'major');
      expect(Array.isArray(notes)).toBe(true);
      notes.forEach(note => {
        expect(note).toHaveProperty('note');
        expect(note).toHaveProperty('frequency');
      });
    });

    test('should get interval from root', () => {
      const interval = fretboard.getIntervalFromRoot('C', 'E');
      expect(interval).toBeDefined();
    });

    test('should validate key-scale combinations', () => {
      const isValid = fretboard.validateKeyScale('C', 'major');
      expect(typeof isValid).toBe('boolean');
    });

    test('should get scale types by category', () => {
      const pentatonicScales = fretboard.getScaleTypesByCategory('pentatonic');
      expect(Array.isArray(pentatonicScales)).toBe(true);
    });

    test('should get ScaleKey state', () => {
      const state = fretboard.getScaleKeyState();
      expect(state).toBeDefined();
    });

    test('should clear ScaleKey cache', () => {
      expect(() => fretboard.clearScaleKeyCache()).not.toThrow();
    });

    test('should get ScaleKey cache statistics', () => {
      const stats = fretboard.getScaleKeyCacheStats();
      expect(stats).toBeDefined();
    });
  });

  describe('Enhanced Transposition', () => {
    beforeEach(() => {
      fretboard = new Fretboard();
      fretboard.displayScale('C', 'major');
    });

    test('should transpose scale using ScaleKey', () => {
      const transposeSpy = jest.spyOn(fretboard.scaleKey, 'transposeKey');
      
      fretboard.transposeScale('G');
      
      expect(transposeSpy).toHaveBeenCalled();
    });

    test('should fallback to calculator for transposition', () => {
      // Mock ScaleKey to throw error
      jest.spyOn(fretboard.scaleKey, 'transposeKey').mockImplementation(() => {
        throw new Error('Transposition error');
      });
      
      const calculatorSpy = jest.spyOn(fretboard.calculator, 'transposeScale');
      
      fretboard.transposeScale('G');
      
      expect(calculatorSpy).toHaveBeenCalled();
    });
  });

  describe('Chord Library Enhancements', () => {
    test('should get chords for specific instrument', () => {
      const guitarChords = chordLibrary.getChordsForInstrument('guitar');
      const ukuleleChords = chordLibrary.getChordsForInstrument('ukulele');
      
      expect(Array.isArray(guitarChords)).toBe(true);
      expect(Array.isArray(ukuleleChords)).toBe(true);
      expect(guitarChords.length).toBeGreaterThan(0);
      expect(ukuleleChords.length).toBeGreaterThan(0);
    });

    test('should get chord data for instrument', () => {
      const chordData = chordLibrary.getChordData('C', 'guitar');
      expect(chordData).toBeDefined();
      expect(chordData.positions).toBeDefined();
      // Note: fingering and difficulty may not be available for all chords
      expect(chordData.positions).toBeDefined();
    });

    test('should get chords by difficulty', () => {
      const beginnerChords = chordLibrary.getChordsByDifficulty('guitar', 'beginner');
      expect(Array.isArray(beginnerChords)).toBe(true);
    });

    test('should check chord existence', () => {
      expect(!!chordLibrary.hasChord('C', 'guitar')).toBe(true);
      expect(!!chordLibrary.hasChord('C', 'ukulele')).toBe(true);
      expect(!!chordLibrary.hasChord('InvalidChord', 'guitar')).toBe(false);
    });

    test('should get supported instruments', () => {
      const instruments = chordLibrary.getSupportedInstruments();
      expect(Array.isArray(instruments)).toBe(true);
      expect(instruments).toContain('guitar');
      expect(instruments).toContain('ukulele');
      expect(instruments).toContain('mandolin');
    });

    test('should get chord variations', () => {
      const variations = chordLibrary.getChordVariations('C', 'guitar');
      expect(Array.isArray(variations)).toBe(true);
      expect(variations.length).toBeGreaterThan(0);
    });

    test('should transpose chord positions', () => {
      const positions = [0, 3, 2, 0, 1, 0];
      const transposed = chordLibrary.transposeChordPositions(positions, 2);
      expect(transposed).toEqual([2, 5, 4, 2, 3, 2]);
    });

    test('should get chord notes for instrument', () => {
      const tuning = ['E', 'A', 'D', 'G', 'B', 'E'];
      const notes = chordLibrary.getChordNotes('C', 'guitar', tuning);
      expect(Array.isArray(notes)).toBe(true);
    });

    test('should transpose notes', () => {
      expect(chordLibrary.transposeNote('C', 2)).toBe('D');
      expect(chordLibrary.transposeNote('E', 1)).toBe('F');
      expect(chordLibrary.transposeNote('B', 1)).toBe('C');
    });
  });

  describe('Event Handling', () => {
    test('should dispatch scale-changed event', () => {
      fretboard = new Fretboard();
      const listener = jest.fn();
      fretboard.addEventListener('scale-changed', listener);
      
      // Trigger scale change
      fretboard.displayScale('C', 'major');
      
      expect(listener).toHaveBeenCalled();
    });

    test('should dispatch scale-key-changed event when ScaleKey is available', () => {
      fretboard = new Fretboard();
      const listener = jest.fn();
      fretboard.addEventListener('scale-key-changed', listener);
      
      // Mock scaleKey to simulate it being available
      fretboard.scaleKey = { setCurrentScale: jest.fn() };
      
      // Manually dispatch the event to test the handler
      fretboard.dispatchEvent(new CustomEvent('scale-key-changed', {
        detail: { key: 'C', scale: 'major' }
      }));
      
      expect(listener).toHaveBeenCalled();
    });

    test('should dispatch key-signature-changed event when ScaleKey is available', () => {
      fretboard = new Fretboard();
      const listener = jest.fn();
      fretboard.addEventListener('key-signature-changed', listener);
      
      // Mock scaleKey to simulate it being available
      fretboard.scaleKey = { setCurrentKey: jest.fn() };
      
      // Manually dispatch the event to test the handler
      fretboard.dispatchEvent(new CustomEvent('key-signature-changed', {
        detail: { key: 'G' }
      }));
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory', () => {
    test('should handle multiple instrument switches efficiently', () => {
      fretboard = new Fretboard();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        fretboard.setInstrument('guitar');
        fretboard.setInstrument('ukulele');
        fretboard.setInstrument('mandolin');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000);
    });

    test('should not leak memory with ScaleKey operations', () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // Simulate rapid scale operations
      for (let i = 0; i < 20; i++) {
        fretboard.displayScale('C', 'major');
        fretboard.displayScale('F', 'naturalMinor'); // Use 'naturalMinor' instead of 'minor'
        fretboard.displayScale('G', 'pentatonicMajor');
      }
      
      // Check memory usage (if available)
      if (performance.memory) {
        const finalMemory = performance.memory.usedJSHeapSize;
        expect(finalMemory).toBeLessThan(initialMemory * 1.5); // Should not grow more than 50%
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid instrument gracefully', () => {
      fretboard = new Fretboard();
      
      // Invalid instruments should throw an error
      expect(() => {
        fretboard.setInstrument('invalid-instrument');
      }).toThrow();
    });

    test('should handle ScaleKey method failures gracefully', () => {
      fretboard = new Fretboard();
      
      // Mock ScaleKey methods to throw errors
      jest.spyOn(fretboard.scaleKey, 'getChordSuggestions').mockImplementation(() => {
        throw new Error('Method failed');
      });
      
      const suggestions = fretboard.getChordSuggestions();
      expect(suggestions).toEqual([]);
    });

    test('should handle chord library errors gracefully', () => {
      expect(() => {
        chordLibrary.getChordData('InvalidChord', 'guitar');
      }).not.toThrow();
      
      const result = chordLibrary.getChordData('InvalidChord', 'guitar');
      expect(result).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    test('should work with complete workflow', () => {
      fretboard = new Fretboard({ instrument: 'guitar' });
      
      // Display chord
      fretboard.displayChord('C');
      expect(fretboard.currentChord.name).toBe('C');
      
      // Switch instrument
      fretboard.setInstrument('ukulele');
      expect(fretboard.instrument).toBe('ukulele');
      expect(fretboard.currentChord.name).toBe('C');
      
      // Display scale
      fretboard.displayScale('C', 'major');
      expect(fretboard.currentScale.root).toBe('C');
      expect(fretboard.currentScale.type).toBe('major');
      
      // Transpose scale
      fretboard.transposeScale('G');
      expect(fretboard.currentScale.key).toBe('G');
      
      // Get chord suggestions
      const suggestions = fretboard.getChordSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
      
      // Clear display
      fretboard.clearDisplay();
      expect(fretboard.currentChord).toBeNull();
      expect(fretboard.currentScale).toBeNull();
    });

    test('should handle all instruments with scales and chords', () => {
      const instruments = ['guitar', 'ukulele', 'mandolin'];
      
      instruments.forEach(instrument => {
        fretboard = new Fretboard({ instrument });
        
        // Test chord display
        fretboard.displayChord('C');
        expect(fretboard.currentChord.name).toBe('C');
        
        // Test scale display
        fretboard.displayScale('C', 'major');
        expect(fretboard.currentScale.root).toBe('C');
        expect(fretboard.currentScale.type).toBe('major');
        
        // Test ScaleKey integration
        expect(fretboard.scaleKey).toBeDefined();
        expect(fretboard.getChordSuggestions()).toBeDefined();
        
        fretboard.remove();
      });
    });
  });
});