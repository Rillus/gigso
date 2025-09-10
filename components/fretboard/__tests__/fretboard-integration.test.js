import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';
import Fretboard from '../fretboard.js';

// Mock the dependencies
jest.mock('../fretboard-renderer.js', () => {
  return jest.fn().mockImplementation(() => ({
    render: jest.fn(),
    renderChord: jest.fn(),
    renderScale: jest.fn(),
    setCurrentScale: jest.fn(),
    setInstrument: jest.fn(),
    setTheme: jest.fn(),
    setFretRange: jest.fn(),
    clearChord: jest.fn(),
    clearAll: jest.fn(),
    setPracticeMode: jest.fn(),
    setIntervalHighlights: jest.fn(),
    setScaleDisplayOptions: jest.fn(),
    renderKeySignature: jest.fn()
  }));
});

jest.mock('../fretboard-calculator.js', () => {
  return jest.fn().mockImplementation(() => ({
    getEnhancedScalePositions: jest.fn().mockReturnValue([]),
    getKeySignature: jest.fn().mockReturnValue({ key: 'C', sharps: 0, flats: 0 }),
    getRelativeKey: jest.fn().mockReturnValue('A'),
    getParallelKey: jest.fn().mockReturnValue('C')
  }));
});

jest.mock('../../../chord-library.js', () => ({}));

jest.mock('../../../state/state.js', () => ({
  instrument: () => 'guitar',
  currentChord: () => null
}));

jest.mock('../../scale-key/scale-key.js', () => {
  return jest.fn().mockImplementation(() => ({
    generateScale: jest.fn().mockReturnValue({ notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] }),
    getScaleNotes: jest.fn().mockReturnValue(['C', 'D', 'E', 'F', 'G', 'A', 'B']),
    getChordSuggestions: jest.fn().mockReturnValue([]),
    validateKeyScale: jest.fn().mockReturnValue(true),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }));
});

describe('Fretboard Component - Chord Palette Integration', () => {
    let fretboard;

    beforeEach(() => {
        document.body.innerHTML = '';

        // Mock console methods to prevent test pollution
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        if (fretboard && fretboard.parentNode) {
            fretboard.parentNode.removeChild(fretboard);
        }
        // Restore console methods
        console.log.mockRestore();
        console.warn.mockRestore();
    });

    describe('Event Listening', () => {
        test('should listen for key-changed events from document', async () => {
            // Arrange
            fretboard = new Fretboard();
            document.body.appendChild(fretboard);
            
            // Wait for component to be fully initialized
            await new Promise(resolve => setTimeout(resolve, 10));

            // Act - Dispatch key-changed event
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'F', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Wait for event processing
            await new Promise(resolve => setTimeout(resolve, 10));

            // Assert - Should have received the event (check console.log calls)
            expect(console.log).toHaveBeenCalledWith(
                'Fretboard: Received key-changed event',
                { key: 'F', scale: 'major' }
            );
        });

        test('should listen for key-set events from document', async () => {
            // Arrange
            fretboard = new Fretboard();
            document.body.appendChild(fretboard);
            
            // Wait for component to be fully initialized
            await new Promise(resolve => setTimeout(resolve, 10));

            // Act - Dispatch key-set event
            const keySetEvent = new CustomEvent('key-set', {
                detail: { key: 'G', scale: 'minor' },
                bubbles: true
            });
            document.dispatchEvent(keySetEvent);

            // Wait for event processing
            await new Promise(resolve => setTimeout(resolve, 10));

            // Assert - Should have received the event
            expect(console.log).toHaveBeenCalledWith(
                'Fretboard: Received key-set event (initial song key)',
                { key: 'G', scale: 'minor' }
            );
        });
    });

    describe('Key Mapping', () => {
        beforeEach(async () => {
            fretboard = new Fretboard();
            document.body.appendChild(fretboard);
            
            // Wait for component to be fully initialized
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        test('should map supported song keys directly', () => {
            // Test keys that fretboard already supports
            const supportedKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            
            supportedKeys.forEach(key => {
                const mappedKey = fretboard.mapSongKeyToFretboardKey(key);
                expect(mappedKey).toBe(key);
            });
        });

        test('should map flat keys to sharp equivalents', () => {
            const flatToSharpMappings = {
                'Db': 'C#',
                'Eb': 'D#',
                'Gb': 'F#',
                'Ab': 'G#',
                'Bb': 'A#'
            };

            Object.entries(flatToSharpMappings).forEach(([flat, sharp]) => {
                const mappedKey = fretboard.mapSongKeyToFretboardKey(flat);
                expect(mappedKey).toBe(sharp);
            });
        });

        test('should default to C for unsupported keys', () => {
            const unsupportedKeys = ['X', 'Y', 'Z', 'invalid'];
            
            unsupportedKeys.forEach(key => {
                const mappedKey = fretboard.mapSongKeyToFretboardKey(key);
                expect(mappedKey).toBe('C');
            });
        });
    });

    describe('Scale Mapping', () => {
        beforeEach(async () => {
            fretboard = new Fretboard();
            document.body.appendChild(fretboard);
            
            // Wait for component to be fully initialized
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        test('should map supported song scales directly', () => {
            const supportedScales = ['major', 'minor', 'pentatonic', 'blues', 'harmonic-minor', 'melodic-minor'];
            
            supportedScales.forEach(scale => {
                const mappedScale = fretboard.mapSongScaleToFretboardScale(scale);
                expect(mappedScale).toBe(scale);
            });
        });

        test('should map modal scales to major/minor', () => {
            const modalMappings = {
                'ionian': 'major',
                'dorian': 'minor',
                'phrygian': 'minor',
                'lydian': 'major',
                'mixolydian': 'major',
                'aeolian': 'minor',
                'locrian': 'minor'
            };

            Object.entries(modalMappings).forEach(([modal, expected]) => {
                const mappedScale = fretboard.mapSongScaleToFretboardScale(modal);
                expect(mappedScale).toBe(expected);
            });
        });

        test('should map pentatonic scales', () => {
            const pentatonicMappings = {
                'pentatonic-major': 'pentatonic',
                'pentatonic-minor': 'pentatonic'
            };

            Object.entries(pentatonicMappings).forEach(([pentatonic, expected]) => {
                const mappedScale = fretboard.mapSongScaleToFretboardScale(pentatonic);
                expect(mappedScale).toBe(expected);
            });
        });

        test('should default to major for unsupported scales', () => {
            const unsupportedScales = ['invalid', 'custom', 'unknown'];
            
            unsupportedScales.forEach(scale => {
                const mappedScale = fretboard.mapSongScaleToFretboardScale(scale);
                expect(mappedScale).toBe('major');
            });
        });
    });

    describe('Integration with Chord Palette Events', () => {
        beforeEach(async () => {
            fretboard = new Fretboard();
            document.body.appendChild(fretboard);
            
            // Wait for component to be fully initialized
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        test('should update fretboard scale when chord palette key changes', () => {
            // Arrange
            const initialScale = fretboard.currentScale;

            // Act - Simulate chord palette key change
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'F', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Fretboard should have updated scale
            expect(fretboard.currentScale).toBeDefined();
            expect(fretboard.currentScale.root).toBe('F');
            expect(fretboard.currentScale.type).toBe('major');
            expect(fretboard.currentScale.key).toBe('F');
        });

        test('should handle key mapping from chord palette', () => {
            // Arrange
            const initialScale = fretboard.currentScale;

            // Act - Simulate chord palette with flat key
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'Bb', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should map Bb to A#
            expect(fretboard.currentScale).toBeDefined();
            expect(fretboard.currentScale.root).toBe('A#');
            expect(fretboard.currentScale.type).toBe('major');
        });

        test('should handle scale mapping from chord palette', () => {
            // Arrange
            const initialScale = fretboard.currentScale;

            // Act - Simulate chord palette with modal scale
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'D', scale: 'dorian' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should map dorian to minor
            expect(fretboard.currentScale).toBeDefined();
            expect(fretboard.currentScale.root).toBe('D');
            expect(fretboard.currentScale.type).toBe('minor');
        });

        test('should create default scale when no current scale exists', () => {
            // Arrange - Ensure no current scale
            fretboard.currentScale = null;

            // Act - Simulate chord palette key change
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'G', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should create a new scale
            expect(fretboard.currentScale).toBeDefined();
            expect(fretboard.currentScale.root).toBe('G');
            expect(fretboard.currentScale.type).toBe('major');
        });

        test('should call displayScale when key changes', () => {
            // Arrange
            const displayScaleSpy = jest.spyOn(fretboard, 'displayScale');

            // Act - Simulate chord palette key change
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'A', scale: 'minor' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should call displayScale with mapped values
            expect(displayScaleSpy).toHaveBeenCalledWith('A', 'minor', 'A');
        });
    });

    describe('Error Handling', () => {
        beforeEach(async () => {
            fretboard = new Fretboard();
            document.body.appendChild(fretboard);
            
            // Wait for component to be fully initialized
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        test('should handle invalid key gracefully', () => {
            // Act - Simulate chord palette with invalid key
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'INVALID', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should default to C major
            expect(fretboard.currentScale).toBeDefined();
            expect(fretboard.currentScale.root).toBe('C');
            expect(fretboard.currentScale.type).toBe('major');
        });

        test('should handle invalid scale gracefully', () => {
            // Act - Simulate chord palette with invalid scale
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'F', scale: 'INVALID' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should default to major
            expect(fretboard.currentScale).toBeDefined();
            expect(fretboard.currentScale.root).toBe('F');
            expect(fretboard.currentScale.type).toBe('major');
        });

        test('should handle missing event detail gracefully', () => {
            // Act - Simulate malformed event
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: null,
                bubbles: true
            });
            
            // Should not throw error
            expect(() => {
                document.dispatchEvent(keyChangedEvent);
            }).not.toThrow();
        });
    });

    describe('Event Cleanup', () => {
        test('should remove event listeners on disconnect', () => {
            // Arrange
            fretboard = new Fretboard();
            document.body.appendChild(fretboard);

            // Clear any initial console.log calls
            console.log.mockClear();

            // Act - Remove from DOM
            document.body.removeChild(fretboard);

            // Assert - Should not receive events after disconnect
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'F', scale: 'major' },
                bubbles: true
            });
            
            document.dispatchEvent(keyChangedEvent);
            
            // Should not have received the event (no console.log calls for key-changed)
            const keyChangedCalls = console.log.mock.calls.filter(call => 
                call[0] === 'Fretboard: Received key-changed event'
            );
            expect(keyChangedCalls).toHaveLength(0);
        });
    });

    describe('Scale Display Integration', () => {
        beforeEach(async () => {
            fretboard = new Fretboard();
            document.body.appendChild(fretboard);
            
            // Wait for component to be fully initialized
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        test('should update scale display when key changes', () => {
            // Arrange
            const displayScaleSpy = jest.spyOn(fretboard, 'displayScale');
            
            // Set up a current scale first
            fretboard.currentScale = {
                root: 'C',
                type: 'major',
                key: 'C'
            };

            // Act - Simulate chord palette key change
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'G', scale: 'minor' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should call displayScale with new key/scale
            expect(displayScaleSpy).toHaveBeenCalledWith('G', 'minor', 'G');
        });

        test('should maintain scale key consistency', () => {
            // Arrange
            fretboard.currentScale = {
                root: 'D',
                type: 'major',
                key: 'D'
            };

            // Act - Simulate chord palette key change
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'E', scale: 'minor' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Scale key should match root note
            expect(fretboard.currentScale.root).toBe('E');
            expect(fretboard.currentScale.key).toBe('E');
            expect(fretboard.currentScale.type).toBe('minor');
        });
    });
});
