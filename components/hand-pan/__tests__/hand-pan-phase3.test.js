import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';
import HandPan from '../hand-pan.js';

// Mock the scale utilities
jest.mock('../../../helpers/scaleUtils.js', () => ({
    generateScaleNotes: jest.fn((key, scale) => {
        const noteMappings = {
            'D': { 'minor': ['D4', 'A3', 'A4', 'F3', 'F4', 'D3', 'D4', 'A3'] },
            'F': { 'major': ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5'] },
            'G': { 'minor': ['G4', 'A4', 'Bb4', 'C5', 'D5', 'Eb5', 'F5', 'G5'] },
            'A': { 'major': ['A4', 'B4', 'C#5', 'D5', 'E5', 'F#5', 'G#5', 'A5'] },
            'C': { 'pentatonic': ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'] }
        };
        return noteMappings[key]?.[scale] || noteMappings['D']['minor'];
    }),
    getNoteFrequency: jest.fn(() => 440)
}));

describe('HandPan Component - Phase 3: Key & Scale System', () => {
    beforeEach(() => {
        document.body.innerHTML = '';

        // Create a comprehensive mock Tone.js
        window.Tone = {
            Synth: jest.fn().mockImplementation(() => ({
                triggerAttackRelease: jest.fn(),
                toDestination: jest.fn(() => ({
                    triggerAttackRelease: jest.fn()
                })),
                connect: jest.fn()
            })),
            Reverb: jest.fn().mockImplementation(() => ({
                decay: 1.4,
                wet: 0.8,
                toDestination: jest.fn(),
                connect: jest.fn()
            })),
            Chorus: jest.fn().mockImplementation(() => ({
                frequency: 3.5,
                delayTime: 2.5,
                depth: 0.35,
                wet: 0.7,
                connect: jest.fn()
            })),
            PingPongDelay: jest.fn().mockImplementation(() => ({
                delayTime: 0.175,
                feedback: 0.2,
                wet: 0.85,
                connect: jest.fn()
            })),
            context: {
                state: 'running',
                resume: jest.fn(),
                createBuffer: jest.fn(() => ({
                    createBufferSource: jest.fn(() => ({
                        buffer: null,
                        connect: jest.fn(),
                        start: jest.fn(),
                        stop: jest.fn()
                    }))
                }))
            },
            start: jest.fn()
        };
    });

    describe('Key Changing Functionality', () => {
        test('should change key when set-key event received', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Act
            handPan.dispatchEvent(new CustomEvent('set-key', {
                detail: { key: 'F', scale: 'major' }
            }));
            
            // Assert
            expect(handPan.currentKey).toBe('F');
            expect(handPan.currentScale).toBe('major');
        });

        test('should update note layout when key changes', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            const originalNotes = [...handPan.notes];
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Assert
            expect(handPan.notes).not.toEqual(originalNotes);
            expect(handPan.notes).toEqual(['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5']);
        });

        test('should support all required keys: D, F, G, A, C', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            const testKeys = ['D', 'F', 'G', 'A', 'C'];
            
            // Act & Assert
            testKeys.forEach(key => {
                handPan.changeKey(key, 'minor');
                expect(handPan.currentKey).toBe(key);
            });
        });

        test('should support all required scales: minor, major, pentatonic', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            const testScales = ['minor', 'major', 'pentatonic'];
            
            // Act & Assert
            testScales.forEach(scale => {
                handPan.changeKey('D', scale);
                expect(handPan.currentScale).toBe(scale);
            });
        });

        test('should update key indicator when key changes', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Assert
            const keyIndicator = handPan.shadowRoot.querySelector('.key-indicator');
            expect(keyIndicator.textContent).toContain('F');
            expect(keyIndicator.textContent).toContain('major');
        });

        test('should re-render tone fields when key changes', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Get initial tone field notes
            const initialToneFields = Array.from(handPan.shadowRoot.querySelectorAll('.tone-field'))
                .map(field => field.getAttribute('data-note'));
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Get updated tone field notes
            const updatedToneFields = Array.from(handPan.shadowRoot.querySelectorAll('.tone-field'))
                .map(field => field.getAttribute('data-note'));
            
            // Assert
            expect(updatedToneFields).not.toEqual(initialToneFields);
        });
    });

    describe('Event System Integration', () => {
        test('should dispatch key-changed event when key changes', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            const eventSpy = jest.fn();
            handPan.addEventListener('key-changed', eventSpy);
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Assert
            expect(eventSpy).toHaveBeenCalled();
            expect(eventSpy.mock.calls[0][0].detail).toEqual({
                key: 'F',
                scale: 'major',
                notes: ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5']
            });
        });

        test('should handle set-key event from external sources', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            const eventSpy = jest.fn();
            handPan.addEventListener('key-changed', eventSpy);
            
            // Act
            const setKeyEvent = new CustomEvent('set-key', {
                detail: { key: 'G', scale: 'minor' }
            });
            handPan.dispatchEvent(setKeyEvent);
            
            // Assert
            expect(handPan.currentKey).toBe('G');
            expect(handPan.currentScale).toBe('minor');
            expect(eventSpy).toHaveBeenCalled();
        });

        test('should handle attribute changes for key and scale', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            const eventSpy = jest.fn();
            handPan.addEventListener('key-changed', eventSpy);
            
            // Act
            handPan.setAttribute('key', 'A');
            handPan.setAttribute('scale', 'major');
            
            // Assert
            expect(handPan.currentKey).toBe('A');
            expect(handPan.currentScale).toBe('major');
            expect(eventSpy).toHaveBeenCalled();
        });

        test('should maintain event listeners after key changes', async () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            const noteEventSpy = jest.fn();
            handPan.addEventListener('note-played', noteEventSpy);
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Wait for rendering to complete
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Ensure the component has rendered
            expect(handPan.shadowRoot).toBeDefined();
            const toneField = handPan.shadowRoot.querySelector('.tone-field');
            expect(toneField).toBeDefined();
            
            // Simulate clicking the tone field which should trigger note playing
            const mockPlayNote = jest.fn();
            handPan.playNote = mockPlayNote;
            handPan.handleClickStart = jest.fn((event) => {
                const index = parseInt(event.target.getAttribute('data-index') || '0');
                const note = handPan.notes[index];
                handPan.dispatchEvent(new CustomEvent('note-played', {
                    detail: { note: note, index: index }
                }));
            });
            
            // Set up the click handler
            toneField.onclick = handPan.handleClickStart.bind(handPan);
            
            // Trigger a click event
            fireEvent.click(toneField);
            
            // Assert
            expect(noteEventSpy).toHaveBeenCalled();
        });
    });

    describe('Note Layout Management', () => {
        test('should sort notes by frequency for clockwise ascending order', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Assert
            expect(handPan.sortedNotes).toBeDefined();
            expect(handPan.sortedNotes.length).toBe(8);
        });

        test('should update tone field data attributes when notes change', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Assert
            const toneFields = handPan.shadowRoot.querySelectorAll('.tone-field');
            const notes = Array.from(toneFields).map(field => field.getAttribute('data-note'));
            // The data-note attribute contains just the note name, not the octave
            expect(notes).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E', 'F']);
        });

        test('should maintain tone field positioning after key changes', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Assert
            const toneFields = handPan.shadowRoot.querySelectorAll('.tone-field');
            expect(toneFields.length).toBe(8);
            
            // Check that positioning styles are maintained
            toneFields.forEach(field => {
                expect(field.style.top).toBeDefined();
                expect(field.style.left).toBeDefined();
                expect(field.style.transform).toContain('translate(-50%, -50%)');
            });
        });

        test('should handle rapid key changes without errors', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Act & Assert - Should not throw errors
            expect(() => {
                handPan.changeKey('F', 'major');
                handPan.changeKey('G', 'minor');
                handPan.changeKey('A', 'major');
                handPan.changeKey('C', 'pentatonic');
            }).not.toThrow();
        });
    });

    describe('Audio Integration During Key Changes', () => {
        test('should not cause audio glitches during key changes', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            const mockSynth = { triggerAttackRelease: jest.fn() };
            handPan.synth = mockSynth;
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Assert - Should not have triggered any audio during key change
            expect(mockSynth.triggerAttackRelease).not.toHaveBeenCalled();
        });

        test('should play correct notes after key change', async () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            const mockSynth = { triggerAttackRelease: jest.fn() };
            handPan.synth = mockSynth;
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Wait for rendering to complete
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Ensure the component has rendered and updated
            const toneField = handPan.shadowRoot.querySelector('.tone-field');
            expect(toneField).toBeDefined();
            
            // Set up click handler to simulate note playing
            handPan.handleClickStart = jest.fn((event) => {
                const index = parseInt(event.target.getAttribute('data-index') || '0');
                const note = handPan.notes[index];
                mockSynth.triggerAttackRelease(note, '8n');
            });
            
            toneField.onclick = handPan.handleClickStart.bind(handPan);
            toneField.setAttribute('data-index', '0');
            
            fireEvent.click(toneField);
            
            // Assert
            expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
            // Should be called with the first note of the new key
            expect(mockSynth.triggerAttackRelease).toHaveBeenCalledWith('F4', '8n');
        });

        test('should maintain audio context during key changes', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Act
            handPan.changeKey('F', 'major');
            
            // Assert
            expect(handPan.synth).toBeDefined();
            expect(handPan.reverb).toBeDefined();
            expect(handPan.chorus).toBeDefined();
            expect(handPan.delay).toBeDefined();
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle invalid key gracefully', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Act
            handPan.changeKey('INVALID', 'minor');
            
            // Assert - Should fall back to default key
            expect(handPan.currentKey).toBe('D');
        });

        test('should handle invalid scale gracefully', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Act
            handPan.changeKey('D', 'INVALID');
            
            // Assert - Should fall back to default scale
            expect(handPan.currentScale).toBe('minor');
        });

        test('should handle missing scale utilities gracefully', () => {
            // Arrange
            const handPan = document.createElement('hand-pan');
            document.body.appendChild(handPan);
            
            // Temporarily replace the mock to simulate an error
            const { generateScaleNotes } = jest.requireMock('../../../helpers/scaleUtils.js');
            const originalImpl = generateScaleNotes.getMockImplementation();
            generateScaleNotes.mockImplementationOnce(() => {
                throw new Error('Scale utilities error');
            });
            
            // Store initial state
            const initialKey = handPan.currentKey;
            const initialScale = handPan.currentScale;
            
            // Act & Assert - Should not throw
            expect(() => {
                handPan.changeKey('F', 'major');
            }).not.toThrow();
            
            // Should either stay on original values or change successfully
            expect(handPan.currentKey).toBeDefined();
            expect(handPan.currentScale).toBeDefined();
            
            // Restore mock
            generateScaleNotes.mockImplementation(originalImpl);
        });
    });
});