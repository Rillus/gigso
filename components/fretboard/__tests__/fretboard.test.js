import Fretboard from '../fretboard.js';
import FretboardCalculator from '../fretboard-calculator.js';

// Mock the dependencies that don't exist yet
jest.mock('../fretboard-renderer.js', () => {
  return class MockFretboardRenderer {
    constructor(container, instrument, options) {
      this.container = container;
      this.instrument = instrument;
      this.options = options;
    }
    
    render() {}
    clearChord() {}
    clearScale() {}
    clearAll() {}
    renderChord(chordData) {}
    renderScale(scaleData) {}
    setCurrentScale(scaleData) {}
    renderKeySignature(keySignatureData) {}
    setInstrument(instrument) {}
    setTheme(theme) {}
    setFretRange(start, end) {}
  };
});

describe('Fretboard Component', () => {
  let fretboardElement;

  beforeEach(() => {
    // Create a new fretboard element for each test
    fretboardElement = new Fretboard();
    document.body.appendChild(fretboardElement);
  });

  afterEach(() => {
    // Clean up after each test
    if (fretboardElement && fretboardElement.parentNode) {
      document.body.removeChild(fretboardElement);
    }
  });

  describe('Initialization', () => {
    test('should create fretboard element with default instrument', () => {
      expect(fretboardElement).toBeInstanceOf(Fretboard);
      expect(fretboardElement.instrument).toBe('guitar');
    });

    test('should initialize with custom instrument', () => {
      const ukuleleFretboard = new Fretboard({ instrument: 'ukulele' });
      expect(ukuleleFretboard.instrument).toBe('ukulele');
    });

    test('should have proper shadow DOM structure', () => {
      const container = fretboardElement.shadowRoot.querySelector('.fretboard-container');
      expect(container).toBeTruthy();
    });
  });

  describe('Chord Display', () => {
    test('should display C major chord correctly', () => {
      const spy = jest.spyOn(fretboardElement.renderer, 'renderChord');
      fretboardElement.displayChord('C');
      
      expect(spy).toHaveBeenCalled();
      expect(fretboardElement.currentChord).toBeTruthy();
      expect(fretboardElement.currentChord.name).toBe('C');
    });

    test('should clear chord when passed null', () => {
      const clearSpy = jest.spyOn(fretboardElement.renderer, 'clearChord');
      fretboardElement.displayChord(null);
      
      expect(clearSpy).toHaveBeenCalled();
      expect(fretboardElement.currentChord).toBeNull();
    });

    test('should warn for unknown chord', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      fretboardElement.displayChord('UnknownChord');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Chord UnknownChord not found')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Instrument Changes', () => {
    test('should change instrument correctly', () => {
      const spy = jest.spyOn(fretboardElement.renderer, 'setInstrument');
      fretboardElement.setInstrument('ukulele');
      
      expect(fretboardElement.instrument).toBe('ukulele');
      expect(spy).toHaveBeenCalledWith('ukulele');
    });

    test('should not change if same instrument', () => {
      const spy = jest.spyOn(fretboardElement.renderer, 'setInstrument');
      fretboardElement.setInstrument('guitar'); // Default is already guitar
      
      expect(spy).not.toHaveBeenCalled();
    });

    test('should re-render current chord when instrument changes', () => {
      fretboardElement.displayChord('C');
      const renderSpy = jest.spyOn(fretboardElement.renderer, 'renderChord');
      
      fretboardElement.setInstrument('ukulele');
      
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Scale Display', () => {
    test('should display major scale correctly', () => {
      const spy = jest.spyOn(fretboardElement.renderer, 'renderScale');
      fretboardElement.displayScale('C', 'major');
      
      expect(spy).toHaveBeenCalled();
      expect(fretboardElement.currentScale).toBeTruthy();
      expect(fretboardElement.currentScale.root).toBe('C');
      expect(fretboardElement.currentScale.type).toBe('major');
    });
  });

  describe('Fret Range', () => {
    test('should set fret range correctly', () => {
      const spy = jest.spyOn(fretboardElement.renderer, 'setFretRange');
      fretboardElement.setFretRange(5, 17);
      
      expect(fretboardElement.fretRange.start).toBe(5);
      expect(fretboardElement.fretRange.end).toBe(17);
      expect(spy).toHaveBeenCalledWith(5, 17);
    });
  });

  describe('Event Handling', () => {
    test('should handle note click events', () => {
      const mockEvent = {
        target: {
          classList: { contains: jest.fn().mockReturnValue(true) },
          dataset: { string: '0', fret: '3', note: 'G' }
        }
      };

      const eventSpy = jest.spyOn(fretboardElement, 'dispatchEvent');
      fretboardElement.handleNoteClick(mockEvent);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'note-clicked',
          detail: {
            string: 0,
            fret: 3,
            note: 'G'
          }
        })
      );
    });

    test('should register note click callback', () => {
      const callback = jest.fn();
      fretboardElement.onNoteClick(callback);
      
      // Simulate a note click event
      const event = new CustomEvent('note-clicked', {
        detail: { string: 0, fret: 3, note: 'G' }
      });
      fretboardElement.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Instrument-Select Communication', () => {
    beforeEach(() => {
      // Mock console methods to prevent test pollution
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore console methods
      console.log.mockRestore();
      console.warn.mockRestore();
    });

    test('should listen for instrument-selected events from document', async () => {
      // Arrange
      const originalInstrument = fretboardElement.instrument;
      
      // Act - Dispatch instrument-selected event
      const instrumentSelectedEvent = new CustomEvent('instrument-selected', {
        detail: 'ukulele',
        bubbles: true
      });
      document.dispatchEvent(instrumentSelectedEvent);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert - Should have received the event and updated instrument
      expect(console.log).toHaveBeenCalledWith(
        'Fretboard: Received instrument-selected event',
        { instrument: 'ukulele' }
      );
      expect(fretboardElement.instrument).toBe('ukulele');
    });

    test('should handle missing event detail gracefully', async () => {
      // Arrange
      const originalInstrument = fretboardElement.instrument;
      
      // Act - Dispatch instrument-selected event with missing detail
      const instrumentSelectedEvent = new CustomEvent('instrument-selected', {
        detail: null,
        bubbles: true
      });
      document.dispatchEvent(instrumentSelectedEvent);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert - Should warn about missing detail and not change instrument
      expect(console.warn).toHaveBeenCalledWith(
        'Fretboard: Received instrument-selected event with missing detail'
      );
      expect(fretboardElement.instrument).toBe(originalInstrument);
    });

    test('should handle invalid event gracefully', async () => {
      // Arrange
      const originalInstrument = fretboardElement.instrument;
      
      // Act - Dispatch invalid event
      const invalidEvent = new CustomEvent('instrument-selected', {
        bubbles: true
        // No detail property
      });
      document.dispatchEvent(invalidEvent);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert - Should warn about missing detail and not change instrument
      expect(console.warn).toHaveBeenCalledWith(
        'Fretboard: Received instrument-selected event with missing detail'
      );
      expect(fretboardElement.instrument).toBe(originalInstrument);
    });

    test('should update fretboard renderer when instrument changes', async () => {
      // Arrange
      const mockRenderer = fretboardElement.renderer;
      const setInstrumentSpy = jest.spyOn(mockRenderer, 'setInstrument');
      
      // Act - Dispatch instrument-selected event
      const instrumentSelectedEvent = new CustomEvent('instrument-selected', {
        detail: 'mandolin',
        bubbles: true
      });
      document.dispatchEvent(instrumentSelectedEvent);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert - Should call setInstrument on renderer
      expect(setInstrumentSpy).toHaveBeenCalledWith('mandolin');
    });

    test('should clean up instrument-selected event listener on component removal', () => {
      // Arrange
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      // Act - Remove the component
      fretboardElement.cleanup();
      
      // Assert - Should remove the event listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'instrument-selected',
        fretboardElement.boundHandleInstrumentSelected
      );
    });

    test('should dispatch instrument-changed event when instrument changes', () => {
      // Arrange
      const eventSpy = jest.fn();
      fretboardElement.addEventListener('instrument-changed', eventSpy);
      
      // Act - Change instrument
      fretboardElement.setInstrument('ukulele');
      
      // Assert - Should dispatch instrument-changed event
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'instrument-changed',
          detail: 'ukulele'
        })
      );
    });
  });

  describe('Attribute Changes', () => {
    test('should respond to chord attribute changes', () => {
      const spy = jest.spyOn(fretboardElement, 'displayChord');
      fretboardElement.setAttribute('chord', 'Am');
      
      expect(spy).toHaveBeenCalledWith('Am');
    });

    test('should respond to instrument attribute changes', () => {
      const spy = jest.spyOn(fretboardElement, 'setInstrument');
      fretboardElement.setAttribute('instrument', 'mandolin');
      
      expect(spy).toHaveBeenCalledWith('mandolin');
    });
  });

  describe('Clear Functions', () => {
    test('should clear all displays', () => {
      const spy = jest.spyOn(fretboardElement.renderer, 'clearAll');
      fretboardElement.clearDisplay();
      
      expect(spy).toHaveBeenCalled();
      expect(fretboardElement.currentChord).toBeNull();
      expect(fretboardElement.currentScale).toBeNull();
    });
  });
});

describe('FretboardCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new FretboardCalculator();
  });

  describe('Note Position Calculation', () => {
    test('should calculate C note positions on guitar', () => {
      const positions = calculator.generatePositions('guitar', 'C');
      
      expect(positions).toBeInstanceOf(Array);
      expect(positions.length).toBeGreaterThan(0);
      
      // Check that all positions have the correct note
      positions.forEach(position => {
        expect(position.note).toBe('C');
        expect(position).toHaveProperty('string');
        expect(position).toHaveProperty('fret');
        expect(position).toHaveProperty('octave');
      });
    });

    test('should throw error for invalid instrument', () => {
      expect(() => {
        calculator.generatePositions('invalid', 'C');
      }).toThrow('Unknown instrument: invalid');
    });

    test('should throw error for invalid note', () => {
      expect(() => {
        calculator.generatePositions('guitar', 'X');
      }).toThrow('Invalid note: X');
    });
  });

  describe('Scale Position Calculation', () => {
    test('should calculate C major scale positions', () => {
      const positions = calculator.getScalePositions('guitar', 'C', 'major');
      
      expect(positions).toBeInstanceOf(Array);
      expect(positions.length).toBeGreaterThan(0);
      
      // Should include root notes
      const rootNotes = positions.filter(pos => pos.isRoot);
      expect(rootNotes.length).toBeGreaterThan(0);
      rootNotes.forEach(pos => expect(pos.note).toBe('C'));
    });

    test('should throw error for invalid scale type', () => {
      expect(() => {
        calculator.getScalePositions('guitar', 'C', 'invalid');
      }).toThrow('Unknown scale type: invalid');
    });
  });

  describe('Note Calculation', () => {
    test('should calculate note at specific position', () => {
      // Guitar low E string, 3rd fret should be G
      const note = calculator.getNoteAtPosition('guitar', 0, 3);
      expect(note).toBe('G');
    });

    test('should throw error for invalid string index', () => {
      expect(() => {
        calculator.getNoteAtPosition('guitar', 10, 0);
      }).toThrow('Invalid string index: 10');
    });
  });

  describe('Interval Calculation', () => {
    test('should calculate interval between notes', () => {
      const interval = calculator.calculateInterval('C', 'G');
      expect(interval).toBe(7); // Perfect fifth
    });

    test('should calculate interval with wrap-around', () => {
      const interval = calculator.calculateInterval('G', 'C');
      expect(interval).toBe(5); // Perfect fourth
    });

    test('should throw error for invalid notes', () => {
      expect(() => {
        calculator.calculateInterval('X', 'C');
      }).toThrow('Invalid note names');
    });
  });

  describe('Note Transposition', () => {
    test('should transpose note up by semitones', () => {
      const transposed = calculator.transposeNote('C', 7);
      expect(transposed).toBe('G');
    });

    test('should transpose note down by semitones', () => {
      const transposed = calculator.transposeNote('C', -5);
      expect(transposed).toBe('G');
    });

    test('should handle wrap-around correctly', () => {
      const transposed = calculator.transposeNote('A', 3);
      expect(transposed).toBe('C');
    });
  });

  describe('Chord Notes', () => {
    test('should get major chord notes', () => {
      const notes = calculator.getChordNotes('C', 'major');
      expect(notes).toEqual(['C', 'E', 'G']);
    });

    test('should get minor chord notes', () => {
      const notes = calculator.getChordNotes('A', 'minor');
      expect(notes).toEqual(['A', 'C', 'E']);
    });

    test('should throw error for unknown chord type', () => {
      expect(() => {
        calculator.getChordNotes('C', 'unknown');
      }).toThrow('Unknown chord type: unknown');
    });
  });

  describe('Static Methods', () => {
    test('should get available instruments', () => {
      const instruments = FretboardCalculator.getAvailableInstruments();
      expect(instruments).toContain('guitar');
      expect(instruments).toContain('ukulele');
      expect(instruments).toContain('mandolin');
    });

    test('should get available scales', () => {
      const scales = FretboardCalculator.getAvailableScales();
      expect(scales).toContain('major');
      expect(scales).toContain('naturalMinor');
      expect(scales).toContain('pentatonicMajor');
    });

    test('should get instrument config', () => {
      const config = FretboardCalculator.getInstrumentConfig('guitar');
      expect(config).toHaveProperty('strings', 6);
      expect(config).toHaveProperty('tuning');
      expect(config.tuning).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
    });
  });
});