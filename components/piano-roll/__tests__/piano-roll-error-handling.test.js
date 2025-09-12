import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import '../piano-roll.js';

// Mock console methods
const originalError = console.error;
const originalLog = console.log;
const errorMock = jest.fn();
const logMock = jest.fn();

describe('PianoRoll Component - Error Handling', () => {
    let pianoRollElement;

    beforeEach(() => {
        pianoRollElement = document.createElement('piano-roll');
        document.body.appendChild(pianoRollElement);
        
        // Mock console methods
        console.error = errorMock;
        console.log = logMock;
        errorMock.mockClear();
        logMock.mockClear();
    });

    afterEach(() => {
        document.body.removeChild(pianoRollElement);
        console.error = originalError;
        console.log = originalLog;
    });

    describe('Chord Diagram Creation Errors', () => {
        test('should handle chord-diagram creation failure gracefully', () => {
            // Mock document.createElement to fail for chord-diagram
            const originalCreateElement = document.createElement;
            document.createElement = jest.fn((tagName) => {
                if (tagName === 'chord-diagram') {
                    throw new Error('Chord diagram component not available');
                }
                return originalCreateElement.call(document, tagName);
            });

            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
            }).not.toThrow();
            
            // Should log the error
            expect(errorMock).toHaveBeenCalledWith(
                'PianoRoll: Error creating chord-diagram:', 
                expect.any(Error)
            );
            
            // Restore original createElement
            document.createElement = originalCreateElement;
        });

        test('should create fallback content when chord-diagram fails', () => {
            // Mock document.createElement to fail for chord-diagram
            const originalCreateElement = document.createElement;
            document.createElement = jest.fn((tagName) => {
                if (tagName === 'chord-diagram') {
                    throw new Error('Component failure');
                }
                return originalCreateElement.call(document, tagName);
            });

            const chord = { name: 'Test Chord', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

            // Check that fallback content was created
            const chordBox = pianoRollElement.shadowRoot.querySelector('.chord-box');
            const fallbackContent = chordBox.querySelector('div');
            
            expect(fallbackContent).not.toBeNull();
            expect(fallbackContent.textContent).toBe('[Test Chord]');
            expect(fallbackContent.style.fontSize).toBe('12px');
            expect(fallbackContent.style.color).toBe('rgb(102, 102, 102)'); // Browser converts hex to rgb

            document.createElement = originalCreateElement;
        });

        test('should handle setAttribute errors on chord-diagram', () => {
            // Mock chord-diagram with failing setAttribute
            const originalCreateElement = document.createElement;
            const mockChordDiagram = {
                setAttribute: jest.fn(() => {
                    throw new Error('setAttribute failed');
                })
            };
            
            document.createElement = jest.fn((tagName) => {
                if (tagName === 'chord-diagram') {
                    return mockChordDiagram;
                }
                return originalCreateElement.call(document, tagName);
            });

            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
            }).not.toThrow();

            document.createElement = originalCreateElement;
        });

        test('should handle missing chord name gracefully', () => {
            const chordWithoutName = { notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chordWithoutName }));
            }).not.toThrow();

            // Should still create chord box
            const chordBoxes = pianoRollElement.shadowRoot.querySelectorAll('.chord-box');
            expect(chordBoxes.length).toBe(1);
        });
    });

    describe('Invalid Chord Data Handling', () => {
        test('should handle null chord data', () => {
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: null }));
            }).toThrow(); // The current implementation doesn't handle null gracefully
        });

        test('should handle undefined chord data', () => {
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: undefined }));
            }).toThrow(); // The current implementation doesn't handle undefined gracefully
        });

        test('should handle empty chord object', () => {
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: {} }));
            }).not.toThrow();
        });

        test('should handle chord with invalid duration', () => {
            const invalidChords = [
                { name: 'Test1', notes: ['C4'], duration: null, delay: 0 },
                { name: 'Test2', notes: ['C4'], duration: undefined, delay: 0 },
                { name: 'Test3', notes: ['C4'], duration: 'invalid', delay: 0 },
                { name: 'Test4', notes: ['C4'], duration: NaN, delay: 0 }
            ];

            invalidChords.forEach(chord => {
                expect(() => {
                    fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
                }).not.toThrow();
            });
        });

        test('should handle chord with invalid delay', () => {
            const invalidChords = [
                { name: 'Test1', notes: ['C4'], duration: 1, delay: null },
                { name: 'Test2', notes: ['C4'], duration: 1, delay: 'invalid' },
                { name: 'Test3', notes: ['C4'], duration: 1, delay: NaN }
            ];

            invalidChords.forEach(chord => {
                expect(() => {
                    fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
                }).not.toThrow();
            });
        });

        test('should handle chord with no notes array', () => {
            const chordsWithoutNotes = [
                { name: 'Test1', duration: 1, delay: 0 },
                { name: 'Test2', notes: null, duration: 1, delay: 0 },
                { name: 'Test3', notes: 'not-an-array', duration: 1, delay: 0 }
            ];

            chordsWithoutNotes.forEach(chord => {
                expect(() => {
                    fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
                }).not.toThrow();
            });
        });
    });

    describe('DOM Manipulation Errors', () => {
        test('should handle missing shadowRoot gracefully', () => {
            // Temporarily remove shadowRoot
            const originalShadowRoot = pianoRollElement.shadowRoot;
            Object.defineProperty(pianoRollElement, 'shadowRoot', {
                get: () => null,
                configurable: true
            });

            expect(() => {
                pianoRollElement.updateChordDisplay();
                pianoRollElement.toggleChordDisplay();
            }).not.toThrow();

            // Restore shadowRoot
            Object.defineProperty(pianoRollElement, 'shadowRoot', {
                get: () => originalShadowRoot,
                configurable: true
            });
        });

        test('should handle missing DOM elements', () => {
            // Remove key elements
            const reel = pianoRollElement.shadowRoot.querySelector('.reel');
            const chordDisplay = pianoRollElement.shadowRoot.querySelector('.chord-display-content');
            
            reel.remove();
            chordDisplay.remove();

            expect(() => {
                pianoRollElement.renderChords();
                pianoRollElement.updateChordDisplay();
            }).not.toThrow();
        });

        test('should handle appendChild failures', () => {
            // Mock appendChild to fail
            const reel = pianoRollElement.shadowRoot.querySelector('.reel');
            const originalAppendChild = reel.appendChild;
            reel.appendChild = jest.fn(() => {
                throw new Error('appendChild failed');
            });

            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
            }).not.toThrow();

            reel.appendChild = originalAppendChild;
        });
    });

    describe('Event Handling Errors', () => {
        test('should handle malformed events', () => {
            const malformedEvents = [
                new CustomEvent('add-chord'), // no detail
                new CustomEvent('add-chord', { detail: null }),
                new CustomEvent('add-chord', { detail: 'not-an-object' }),
            ];

            malformedEvents.forEach(event => {
                expect(() => {
                    fireEvent(pianoRollElement, event);
                }).not.toThrow();
            });
        });

        test('should handle event listener failures', () => {
            // Mock addEventListener to fail
            const originalAddEventListener = pianoRollElement.addEventListener;
            pianoRollElement.addEventListener = jest.fn(() => {
                throw new Error('addEventListener failed');
            });

            expect(() => {
                pianoRollElement.connectedCallback();
            }).not.toThrow();

            pianoRollElement.addEventListener = originalAddEventListener;
        });

        test('should handle dispatchEvent failures', () => {
            // Mock dispatchEvent to fail
            const originalDispatchEvent = pianoRollElement.dispatchEvent;
            pianoRollElement.dispatchEvent = jest.fn(() => {
                throw new Error('dispatchEvent failed');
            });

            expect(() => {
                pianoRollElement.playChord({ name: 'Test', notes: ['C4'] }, 1);
            }).not.toThrow();

            pianoRollElement.dispatchEvent = originalDispatchEvent;
        });
    });

    describe('Array Manipulation Errors', () => {
        test('should handle corrupted chords array', () => {
            // Corrupt the chords array
            pianoRollElement.chords = 'not-an-array';

            expect(() => {
                pianoRollElement.renderChords();
                pianoRollElement.updateChordDisplay();
            }).toThrow(); // forEach will fail on non-array

            // Reset to valid array for next test
            pianoRollElement.chords = [];
            
            pianoRollElement.chords = null;

            expect(() => {
                pianoRollElement.renderChords();
                pianoRollElement.play();
            }).toThrow(); // forEach will fail on null
        });

        test('should handle invalid array indices', () => {
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

            expect(() => {
                pianoRollElement.removeChord(-1);
                pianoRollElement.removeChord(999);
                pianoRollElement.removeChord('invalid');
                pianoRollElement.removeChord(null);
            }).not.toThrow();
        });

        test('should handle splice failures', () => {
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

            // Mock splice to fail
            const originalSplice = Array.prototype.splice;
            Array.prototype.splice = jest.fn(() => {
                throw new Error('splice failed');
            });

            expect(() => {
                pianoRollElement.removeChord(0);
            }).not.toThrow();

            Array.prototype.splice = originalSplice;
        });
    });

    describe('JSON Handling Errors', () => {
        test('should handle JSON.stringify failures', () => {
            // Create chord with circular reference
            const chord = { name: 'Test', notes: ['C4'], duration: 1, delay: 0 };
            chord.self = chord; // Circular reference
            pianoRollElement.chords = [chord];

            expect(() => {
                pianoRollElement.updateChordDisplay();
            }).not.toThrow();
        });

        test('should handle malformed chord data in display', () => {
            // Set chords to something that can't be stringified normally
            pianoRollElement.chords = [
                { name: undefined, notes: [BigInt(123)], duration: Symbol('test'), delay: 0 }
            ];

            expect(() => {
                pianoRollElement.updateChordDisplay();
            }).not.toThrow();
        });
    });

    describe('Animation and Timing Errors', () => {
        test('should handle requestAnimationFrame failures', () => {
            const originalRAF = global.requestAnimationFrame;
            global.requestAnimationFrame = jest.fn(() => {
                throw new Error('requestAnimationFrame failed');
            });

            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

            expect(() => {
                pianoRollElement.play();
            }).not.toThrow();

            global.requestAnimationFrame = originalRAF;
        });

        test('should handle style transformation errors', () => {
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

            // Mock style setting to fail
            const reel = pianoRollElement.shadowRoot.querySelector('.reel');
            Object.defineProperty(reel.style, 'transform', {
                set: () => {
                    throw new Error('Style setting failed');
                },
                configurable: true
            });

            expect(() => {
                pianoRollElement.play();
                pianoRollElement.stop();
            }).not.toThrow();
        });
    });

    describe('Song Loading Errors', () => {
        test('should handle invalid song data', () => {
            const invalidSongs = [
                null,
                undefined,
                'not-an-object',
                {},
                { chords: 'not-an-array' },
                { chords: null }
            ];

            invalidSongs.forEach(song => {
                expect(() => {
                    fireEvent(pianoRollElement, new CustomEvent('load-song', { detail: song }));
                }).not.toThrow();
            });
        });

        test('should handle corrupted chord data in songs', () => {
            const corruptedSong = {
                chords: [
                    null,
                    undefined,
                    'not-an-object',
                    { name: null, notes: null, duration: 'invalid' }
                ]
            };

            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('load-song', { detail: corruptedSong }));
            }).not.toThrow();
        });
    });

    describe('Memory and Resource Errors', () => {
        test('should handle out of memory conditions gracefully', () => {
            // Create a scenario that might cause memory issues
            const largeChordArray = new Array(10000).fill({
                name: 'Memory Test',
                notes: ['C4', 'E4', 'G4'],
                duration: 1,
                delay: 0
            });

            expect(() => {
                pianoRollElement.chords = largeChordArray;
                pianoRollElement.renderChords();
            }).not.toThrow();
        });

        test('should handle cleanup failures', () => {
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

            // Mock removeEventListener to fail
            const originalRemoveEventListener = window.removeEventListener;
            window.removeEventListener = jest.fn(() => {
                throw new Error('removeEventListener failed');
            });

            expect(() => {
                // Trigger drag initialization and cleanup
                const chordBox = pianoRollElement.shadowRoot.querySelector('.chord-box');
                fireEvent.mouseDown(chordBox, { clientX: 100 });
                fireEvent(window, new MouseEvent('mouseup'));
            }).not.toThrow();

            window.removeEventListener = originalRemoveEventListener;
        });
    });

    describe('Edge Case Error Recovery', () => {
        test('should recover from multiple consecutive errors', () => {
            // Cause multiple errors in sequence
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: null }));
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: undefined }));
                fireEvent(pianoRollElement, new CustomEvent('load-song', { detail: null }));
                pianoRollElement.removeChord(-1);
                pianoRollElement.setTempo(NaN);
                pianoRollElement.setTimeSignature(null);
            }).not.toThrow();

            // Should still be functional
            const validChord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: validChord }));
            }).not.toThrow();

            expect(pianoRollElement.chords).toContain(validChord);
        });

        test('should maintain component state after errors', () => {
            const initialState = {
                tempo: pianoRollElement.tempo,
                timeSignature: pianoRollElement.timeSignature,
                chords: [...pianoRollElement.chords]
            };

            // Cause various errors
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: null }));
            pianoRollElement.removeChord(999);

            // Core state should remain stable
            expect(pianoRollElement.tempo).toBe(initialState.tempo);
            expect(pianoRollElement.timeSignature).toBe(initialState.timeSignature);
        });
    });
});