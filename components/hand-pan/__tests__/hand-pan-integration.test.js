import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';
import HandPan from '../hand-pan.js';

describe('HandPan Component - Chord Palette Integration', () => {
    let handPan;

    beforeEach(() => {
        document.body.innerHTML = '';

        // Create a mock Tone.js
        window.Tone = {
            Synth: jest.fn().mockImplementation(() => ({
                triggerAttackRelease: jest.fn(),
                toDestination: jest.fn(() => ({
                    triggerAttackRelease: jest.fn()
                }))
            })),
            context: {
                state: 'running',
                resume: jest.fn(),
                start: jest.fn()
            }
        };

        // Mock console methods to prevent test pollution
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        if (handPan && handPan.parentNode) {
            handPan.parentNode.removeChild(handPan);
        }
        // Restore console methods
        console.log.mockRestore();
        console.warn.mockRestore();
    });

    describe('Event Listening', () => {
        test('should listen for key-changed events from document', () => {
            // Arrange
            handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);

            // Act - Dispatch key-changed event
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'F', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should have received the event (check console.log calls)
            expect(console.log).toHaveBeenCalledWith(
                'HandPan: Received key-changed event',
                { key: 'F', scale: 'major' }
            );
        });

        test('should listen for key-set events from document', () => {
            // Arrange
            handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);

            // Act - Dispatch key-set event
            const keySetEvent = new CustomEvent('key-set', {
                detail: { key: 'G', scale: 'minor' },
                bubbles: true
            });
            document.dispatchEvent(keySetEvent);

            // Assert - Should have received the event
            expect(console.log).toHaveBeenCalledWith(
                'HandPan: Received key-set event (initial song key)',
                { key: 'G', scale: 'minor' }
            );
        });
    });

    describe('Key Mapping', () => {
        beforeEach(() => {
            handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
        });

        test('should map supported song keys directly', () => {
            // Test keys that hand-pan already supports
            const supportedKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            
            supportedKeys.forEach(key => {
                const mappedKey = handPan.mapSongKeyToHandPanKey(key);
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
                const mappedKey = handPan.mapSongKeyToHandPanKey(flat);
                expect(mappedKey).toBe(sharp);
            });
        });

        test('should default to D for unsupported keys', () => {
            const unsupportedKeys = ['X', 'Y', 'Z', 'invalid'];
            
            unsupportedKeys.forEach(key => {
                const mappedKey = handPan.mapSongKeyToHandPanKey(key);
                expect(mappedKey).toBe('D');
            });
        });
    });

    describe('Scale Mapping', () => {
        beforeEach(() => {
            handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
        });

        test('should map supported song scales directly', () => {
            const supportedScales = ['major', 'minor', 'pentatonic'];
            
            supportedScales.forEach(scale => {
                const mappedScale = handPan.mapSongScaleToHandPanScale(scale);
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
                const mappedScale = handPan.mapSongScaleToHandPanScale(modal);
                expect(mappedScale).toBe(expected);
            });
        });

        test('should map pentatonic scales', () => {
            const pentatonicMappings = {
                'pentatonic-major': 'pentatonic',
                'pentatonic-minor': 'pentatonic'
            };

            Object.entries(pentatonicMappings).forEach(([pentatonic, expected]) => {
                const mappedScale = handPan.mapSongScaleToHandPanScale(pentatonic);
                expect(mappedScale).toBe(expected);
            });
        });

        test('should default to minor for unsupported scales', () => {
            const unsupportedScales = ['invalid', 'custom', 'unknown'];
            
            unsupportedScales.forEach(scale => {
                const mappedScale = handPan.mapSongScaleToHandPanScale(scale);
                expect(mappedScale).toBe('minor');
            });
        });
    });

    describe('Integration with Chord Palette Events', () => {
        beforeEach(() => {
            handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
        });

        test('should change hand-pan key when chord palette key changes', () => {
            // Arrange
            const initialKey = handPan.currentKey;
            const initialScale = handPan.currentScale;

            // Act - Simulate chord palette key change
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'F', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Hand-pan should have changed key
            expect(handPan.currentKey).toBe('F');
            expect(handPan.currentScale).toBe('major');
            expect(handPan.currentKey).not.toBe(initialKey);
            expect(handPan.currentScale).not.toBe(initialScale);
        });

        test('should handle key mapping from chord palette', () => {
            // Arrange
            const initialKey = handPan.currentKey;

            // Act - Simulate chord palette with flat key
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'Bb', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should map Bb to A#
            expect(handPan.currentKey).toBe('A#');
            expect(handPan.currentScale).toBe('major');
        });

        test('should handle scale mapping from chord palette', () => {
            // Arrange
            const initialScale = handPan.currentScale;

            // Act - Simulate chord palette with modal scale
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'D', scale: 'dorian' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should map dorian to minor
            expect(handPan.currentKey).toBe('D');
            expect(handPan.currentScale).toBe('minor');
        });

        test('should update key indicator when key changes from chord palette', async () => {
            // Arrange
            handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Wait for initial render
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const keyIndicator = handPan.shadowRoot.querySelector('.key-indicator');
            const initialText = keyIndicator.textContent;

            // Act - Simulate chord palette key change
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'G', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Wait for the key change to complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert - Check that the hand-pan key actually changed
            expect(handPan.currentKey).toBe('G');
            expect(handPan.currentScale).toBe('major');
            
            // Get the updated key indicator after the change
            const updatedKeyIndicator = handPan.shadowRoot.querySelector('.key-indicator');
            
            // Assert - Key indicator should be updated
            expect(updatedKeyIndicator.textContent).toContain('G');
            expect(updatedKeyIndicator.textContent).toContain('major');
            expect(updatedKeyIndicator.textContent).not.toBe(initialText);
        });

        test('should maintain audio functionality during key changes', async () => {
            // Arrange
            handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            handPan.isMuted = false;

            const mockSynth = { triggerAttackRelease: jest.fn() };
            handPan.synth = mockSynth;

            // Act - Change key and then play a note
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'A', scale: 'minor' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Wait for key change to complete
            await new Promise(resolve => setTimeout(resolve, 50));

            // Play a note after key change
            const firstField = handPan.shadowRoot.querySelector('.tone-field');
            const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
            firstField.dispatchEvent(mousedownEvent);

            // Wait for note to play
            await new Promise(resolve => setTimeout(resolve, 10));

            // Assert - Should still be able to play notes
            expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
        });

        test('should handle invalid key gracefully', () => {
            // Act - Simulate chord palette with invalid key
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'INVALID', scale: 'major' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should default to D minor
            expect(handPan.currentKey).toBe('D');
            expect(handPan.currentScale).toBe('major');
        });

        test('should handle invalid scale gracefully', () => {
            // Act - Simulate chord palette with invalid scale
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'F', scale: 'INVALID' },
                bubbles: true
            });
            document.dispatchEvent(keyChangedEvent);

            // Assert - Should default to minor
            expect(handPan.currentKey).toBe('F');
            expect(handPan.currentScale).toBe('minor');
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
            handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);

            // Clear any initial console.log calls
            console.log.mockClear();

            // Act - Remove from DOM
            document.body.removeChild(handPan);

            // Assert - Should not receive events after disconnect
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'F', scale: 'major' },
                bubbles: true
            });
            
            document.dispatchEvent(keyChangedEvent);
            
            // Should not have received the event (no console.log calls for key-changed)
            const keyChangedCalls = console.log.mock.calls.filter(call => 
                call[0] === 'HandPan: Received key-changed event'
            );
            expect(keyChangedCalls).toHaveLength(0);
        });
    });
});
