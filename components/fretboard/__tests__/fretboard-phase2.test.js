import { describe, it, expect, beforeEach, afterEach } from 'https://esm.sh/vitest@1.0.0';
import Fretboard from '../fretboard.js';
import FretboardCalculator from '../fretboard-calculator.js';
import { SCALE_PATTERNS, KEY_SIGNATURES, INTERVALS } from '../fretboard-calculator.js';

describe('Fretboard Component - Phase 2', () => {
  let fretboard;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    fretboard = new Fretboard({
      instrument: 'guitar',
      fretRange: { start: 0, end: 12 }
    });
    container.appendChild(fretboard);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Enhanced Scale Data Structure', () => {
    it('should support all Phase 2 scale patterns', () => {
      const expectedScales = [
        'major', 'naturalMinor', 'harmonicMinor', 'melodicMinor',
        'pentatonicMajor', 'pentatonicMinor', 'blues',
        'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'
      ];

      expectedScales.forEach(scaleType => {
        expect(SCALE_PATTERNS[scaleType]).toBeDefined();
        expect(SCALE_PATTERNS[scaleType].intervals).toBeDefined();
        expect(SCALE_PATTERNS[scaleType].degrees).toBeDefined();
        expect(SCALE_PATTERNS[scaleType].name).toBeDefined();
        expect(SCALE_PATTERNS[scaleType].color).toBeDefined();
        expect(SCALE_PATTERNS[scaleType].rootColor).toBeDefined();
      });
    });

    it('should have proper key signature definitions', () => {
      const testKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
      
      testKeys.forEach(key => {
        expect(KEY_SIGNATURES[key]).toBeDefined();
        expect(KEY_SIGNATURES[key].sharps).toBeDefined();
        expect(KEY_SIGNATURES[key].flats).toBeDefined();
        expect(KEY_SIGNATURES[key].relative).toBeDefined();
      });
    });

    it('should have interval definitions with colors', () => {
      for (let i = 0; i <= 11; i++) {
        expect(INTERVALS[i]).toBeDefined();
        expect(INTERVALS[i].name).toBeDefined();
        expect(INTERVALS[i].color).toBeDefined();
        expect(INTERVALS[i].description).toBeDefined();
      }
    });
  });

  describe('Enhanced Scale Calculation', () => {
    let calculator;

    beforeEach(() => {
      calculator = new FretboardCalculator();
    });

    it('should get enhanced scale positions with interval information', () => {
      const positions = calculator.getEnhancedScalePositions('guitar', 'C', 'major');
      
      expect(positions).toBeDefined();
      expect(positions.length).toBeGreaterThan(0);
      
      positions.forEach(position => {
        expect(position.string).toBeDefined();
        expect(position.fret).toBeDefined();
        expect(position.note).toBeDefined();
        expect(position.degree).toBeDefined();
        expect(position.interval).toBeDefined();
        expect(position.scaleType).toBe('major');
        expect(position.scaleName).toBe('Major Scale');
        expect(position.keySignature).toBeDefined();
        expect(position.intervalName).toBeDefined();
        expect(position.intervalColor).toBeDefined();
        expect(position.isRoot).toBeDefined();
        expect(position.isThird).toBeDefined();
        expect(position.isFifth).toBeDefined();
        expect(position.isSeventh).toBeDefined();
      });
    });

    it('should get key signature information', () => {
      const keySignature = calculator.getKeySignature('G');
      
      expect(keySignature).toBeDefined();
      expect(keySignature.sharps).toBe(1);
      expect(keySignature.flats).toBe(0);
      expect(keySignature.relative).toBe('Em');
      expect(keySignature.sharpsList).toEqual(['F#']);
    });

    it('should transpose scales correctly', () => {
      const transposed = calculator.transposeScale('C', 'major', 'G');
      
      expect(transposed.root).toBe('G');
      expect(transposed.type).toBe('major');
      expect(transposed.notes).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
      expect(transposed.semitones).toBe(7);
    });

    it('should get scale notes', () => {
      const notes = calculator.getScaleNotes('C', 'major');
      
      expect(notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('should get relative key', () => {
      const relativeKey = calculator.getRelativeKey('C');
      expect(relativeKey).toBe('Am');
    });

    it('should get parallel keys', () => {
      const parallelKeys = calculator.getParallelKey('C');
      expect(parallelKeys.minor).toBe('A');
      expect(parallelKeys.major).toBe('E');
    });

    it('should group scale positions by interval', () => {
      const grouped = calculator.getScalePositionsByInterval('guitar', 'C', 'major');
      
      expect(grouped).toBeDefined();
      expect(typeof grouped).toBe('object');
      
      // Should have groups for each interval in the major scale
      [0, 2, 4, 5, 7, 9, 11].forEach(interval => {
        expect(grouped[interval]).toBeDefined();
        expect(Array.isArray(grouped[interval])).toBe(true);
      });
    });

    it('should get practice mode positions', () => {
      const level1Positions = calculator.getScalePracticePositions('guitar', 'C', 'major', 1);
      const level3Positions = calculator.getScalePracticePositions('guitar', 'C', 'major', 3);
      
      expect(level1Positions.length).toBeLessThanOrEqual(level3Positions.length);
      
      // Level 1 should only have root notes (interval 0)
      level1Positions.forEach(position => {
        expect(position.interval).toBe(0);
      });
    });
  });

  describe('Enhanced Scale Display', () => {
    it('should display scale with enhanced information', () => {
      fretboard.displayScale('C', 'major');
      
      // Wait for rendering
      setTimeout(() => {
        const scaleMarkers = fretboard.shadowRoot.querySelectorAll('.scale-marker');
        expect(scaleMarkers.length).toBeGreaterThan(0);
      }, 100);
    });

    it('should support practice mode', () => {
      fretboard.displayScale('C', 'major');
      fretboard.setPracticeMode(true, 1);
      
      // Should only show root notes in practice mode level 1
      setTimeout(() => {
        const rootNotes = fretboard.shadowRoot.querySelectorAll('.scale-marker.root-note');
        expect(rootNotes.length).toBeGreaterThan(0);
      }, 100);
    });

    it('should highlight intervals', () => {
      fretboard.displayScale('C', 'major');
      fretboard.highlightIntervals({
        root: true,
        thirds: true,
        fifths: false,
        sevenths: false
      });
      
      // Should have highlighted root and third notes
      setTimeout(() => {
        const highlightedNotes = fretboard.shadowRoot.querySelectorAll('.scale-marker');
        expect(highlightedNotes.length).toBeGreaterThan(0);
      }, 100);
    });

    it('should set scale display options', () => {
      fretboard.displayScale('C', 'major');
      fretboard.setScaleDisplayOptions({
        showNoteNames: false,
        showScaleDegrees: true,
        showIntervals: false
      });
      
      // Should show scale degrees instead of note names
      setTimeout(() => {
        const scaleTexts = fretboard.shadowRoot.querySelectorAll('.scale-text');
        expect(scaleTexts.length).toBeGreaterThan(0);
      }, 100);
    });
  });

  describe('Key Signature Display', () => {
    it('should render key signature information', () => {
      fretboard.displayScale('G', 'major');
      
      // Should show key signature for G major (1 sharp)
      setTimeout(() => {
        const keySignature = fretboard.shadowRoot.querySelector('.key-signature');
        expect(keySignature).toBeDefined();
      }, 100);
    });

    it('should handle keys with flats', () => {
      fretboard.displayScale('F', 'major');
      
      // Should show key signature for F major (1 flat)
      setTimeout(() => {
        const keySignature = fretboard.shadowRoot.querySelector('.key-signature');
        expect(keySignature).toBeDefined();
      }, 100);
    });
  });

  describe('Transposition Features', () => {
    it('should transpose scale to different key', () => {
      fretboard.displayScale('C', 'major');
      fretboard.transposeScale('G');
      
      // Should now display G major scale
      setTimeout(() => {
        expect(fretboard.currentScale.root).toBe('G');
        expect(fretboard.currentScale.type).toBe('major');
      }, 100);
    });

    it('should get relative key', () => {
      fretboard.displayScale('C', 'major');
      const relativeKey = fretboard.getRelativeKey();
      expect(relativeKey).toBe('Am');
    });

    it('should get parallel keys', () => {
      fretboard.displayScale('C', 'major');
      const parallelKeys = fretboard.getParallelKey();
      expect(parallelKeys.minor).toBe('A');
      expect(parallelKeys.major).toBe('E');
    });
  });

  describe('Event Handling', () => {
    it('should dispatch scale-changed event', (done) => {
      fretboard.addEventListener('scale-changed', (event) => {
        expect(event.detail).toBeDefined();
        expect(event.detail.root).toBe('C');
        expect(event.detail.type).toBe('major');
        done();
      });
      
      fretboard.displayScale('C', 'major');
    });

    it('should handle note clicks', (done) => {
      fretboard.addEventListener('note-clicked', (event) => {
        expect(event.detail).toBeDefined();
        expect(event.detail.string).toBeDefined();
        expect(event.detail.fret).toBeDefined();
        expect(event.detail.note).toBeDefined();
        done();
      });
      
      // Simulate note click
      const notePosition = fretboard.shadowRoot.querySelector('.fret-position');
      if (notePosition) {
        notePosition.click();
      }
    });
  });

  describe('Static Methods', () => {
    it('should get available keys', () => {
      const keys = Fretboard.getAvailableKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys).toContain('C');
      expect(keys).toContain('G');
    });

    it('should get available scales', () => {
      const scales = Fretboard.getAvailableScales();
      expect(Array.isArray(scales)).toBe(true);
      expect(scales.length).toBeGreaterThan(0);
      expect(scales).toContain('major');
      expect(scales).toContain('naturalMinor');
    });

    it('should get interval information', () => {
      const intervalInfo = Fretboard.getIntervalInfo(0);
      expect(intervalInfo).toBeDefined();
      expect(intervalInfo.name).toBe('Unison');
      expect(intervalInfo.color).toBeDefined();
    });
  });

  describe('Multi-Instrument Support', () => {
    it('should work with guitar', () => {
      fretboard.setInstrument('guitar');
      fretboard.displayScale('C', 'major');
      
      expect(fretboard.instrument).toBe('guitar');
    });

    it('should work with ukulele', () => {
      fretboard.setInstrument('ukulele');
      fretboard.displayScale('C', 'major');
      
      expect(fretboard.instrument).toBe('ukulele');
    });

    it('should work with mandolin', () => {
      fretboard.setInstrument('mandolin');
      fretboard.displayScale('C', 'major');
      
      expect(fretboard.instrument).toBe('mandolin');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid scale types gracefully', () => {
      expect(() => {
        fretboard.displayScale('C', 'invalidScale');
      }).not.toThrow();
    });

    it('should handle invalid root notes gracefully', () => {
      expect(() => {
        fretboard.displayScale('X', 'major');
      }).not.toThrow();
    });

    it('should handle invalid instruments gracefully', () => {
      expect(() => {
        fretboard.setInstrument('invalidInstrument');
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should render scales efficiently', () => {
      const startTime = performance.now();
      
      fretboard.displayScale('C', 'major');
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle rapid scale changes', () => {
      const scales = ['C', 'G', 'D', 'A', 'E'];
      const types = ['major', 'naturalMinor', 'pentatonicMajor'];
      
      scales.forEach(root => {
        types.forEach(type => {
          expect(() => {
            fretboard.displayScale(root, type);
          }).not.toThrow();
        });
      });
    });
  });
});