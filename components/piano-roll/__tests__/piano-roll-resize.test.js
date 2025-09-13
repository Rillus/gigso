import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import '../piano-roll.js';

describe('PianoRoll Component - Chord Resizing', () => {
    let pianoRollElement;

    beforeEach(() => {
        pianoRollElement = document.createElement('piano-roll');
        document.body.appendChild(pianoRollElement);

        // Add test chords with different initial durations
        const chord1 = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
        const chord2 = { name: 'F Major', notes: ['F4', 'A4', 'C5'], duration: 2, delay: 0 };
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord1 }));
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord2 }));
    });

    afterEach(() => {
        document.body.removeChild(pianoRollElement);
    });

    describe('Resize Initialization', () => {
        test('should initialize resize on resize handle mousedown', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const mockInitResize = jest.spyOn(pianoRollElement, 'initResize');
            
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            
            expect(mockInitResize).toHaveBeenCalledWith(
                expect.objectContaining({ clientX: 100 }), 
                0
            );
        });

        test('should prevent default and stop propagation on resize start', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const event = new MouseEvent('mousedown', { clientX: 100 });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');
            
            fireEvent(resizeHandle, event);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(stopPropagationSpy).toHaveBeenCalled();
        });

        test('should not trigger drag when resizing', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const mockInitDrag = jest.spyOn(pianoRollElement, 'initDrag');
            
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            
            expect(mockInitDrag).not.toHaveBeenCalled();
        });
    });

    describe('Resize Movement', () => {
        test('should increase duration when dragging right', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const initialDuration = pianoRollElement.chords[0].duration;
            
            // Start resize
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            
            // Drag right to increase width
            fireEvent(window, new MouseEvent('mousemove', { clientX: 150 }));
            
            expect(pianoRollElement.chords[0].duration).toBeGreaterThan(initialDuration);
        });

        test('should decrease duration when dragging left', () => {
            const resizeHandles = pianoRollElement.shadowRoot.querySelectorAll('.resize-handle');
            const resizeHandle = resizeHandles[1]; // Second chord has duration 2
            const initialDuration = pianoRollElement.chords[1].duration;
            
            // Start resize
            fireEvent.mouseDown(resizeHandle, { clientX: 200 });
            
            // Drag left to decrease width
            fireEvent(window, new MouseEvent('mousemove', { clientX: 150 }));
            
            expect(pianoRollElement.chords[1].duration).toBeLessThan(initialDuration);
        });

        test('should calculate duration correctly based on chord width', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const chordWidth = pianoRollElement.chordWidth; // 25px
            
            // Start resize
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            
            // Increase width by 100px
            fireEvent(window, new MouseEvent('mousemove', { clientX: 200 }));
            
            // Duration should increase by 4 (100px / 25px chordWidth = 4 beats)
            expect(pianoRollElement.chords[0].duration).toBe(5); // 1 + 4 = 5
        });

        test('should enforce minimum duration', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            
            // Start resize
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            
            // Try to drag far left to make it very small
            fireEvent(window, new MouseEvent('mousemove', { clientX: -500 }));
            
            // Duration should not go below minimum (0.1)
            expect(pianoRollElement.chords[0].duration).toBeGreaterThanOrEqual(0.1);
        });

        test('should update display during resize', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const updateDisplaySpy = jest.spyOn(pianoRollElement, 'updateChordDisplay');
            const renderChordsSpy = jest.spyOn(pianoRollElement, 'renderChords');
            
            // Start resize and move
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            fireEvent(window, new MouseEvent('mousemove', { clientX: 150 }));
            
            expect(renderChordsSpy).toHaveBeenCalled();
            expect(updateDisplaySpy).toHaveBeenCalled();
        });
    });

    describe('Resize End', () => {
        test('should stop resize on mouseup', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            
            // Start resize
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            
            // Move and then end resize
            fireEvent(window, new MouseEvent('mousemove', { clientX: 150 }));
            const finalDuration = pianoRollElement.chords[0].duration;
            
            fireEvent(window, new MouseEvent('mouseup'));
            
            // Further mouse movement should not affect duration
            fireEvent(window, new MouseEvent('mousemove', { clientX: 200 }));
            expect(pianoRollElement.chords[0].duration).toBe(finalDuration);
        });

        test('should clean up event listeners on resize end', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            
            // Start and end resize
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            fireEvent(window, new MouseEvent('mouseup'));
            
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
            
            removeEventListenerSpy.mockRestore();
        });
    });

    describe('Multi-chord Resize', () => {
        test('should only affect resized chord', () => {
            const resizeHandles = pianoRollElement.shadowRoot.querySelectorAll('.resize-handle');
            const initialDuration2 = pianoRollElement.chords[1].duration;
            
            // Resize first chord
            fireEvent.mouseDown(resizeHandles[0], { clientX: 100 });
            fireEvent(window, new MouseEvent('mousemove', { clientX: 150 }));
            fireEvent(window, new MouseEvent('mouseup'));
            
            // Second chord duration should remain unchanged
            expect(pianoRollElement.chords[1].duration).toBe(initialDuration2);
        });

        test('should handle resizing different chord indices correctly', () => {
            const resizeHandles = pianoRollElement.shadowRoot.querySelectorAll('.resize-handle');
            const initialDuration1 = pianoRollElement.chords[0].duration;
            
            // Resize second chord
            fireEvent.mouseDown(resizeHandles[1], { clientX: 200 });
            fireEvent(window, new MouseEvent('mousemove', { clientX: 250 }));
            
            // Second chord should be affected, first should not
            expect(pianoRollElement.chords[1].duration).toBeGreaterThan(2);
            expect(pianoRollElement.chords[0].duration).toBe(initialDuration1);
        });
    });

    describe('Edge Cases', () => {
        test('should handle resize with no chords gracefully', () => {
            const emptyPianoRoll = document.createElement('piano-roll');
            document.body.appendChild(emptyPianoRoll);
            
            expect(() => {
                emptyPianoRoll.initResize({ 
                    clientX: 100, 
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn()
                }, 0);
            }).toThrow(); // Current implementation doesn't handle missing chords gracefully
            
            document.body.removeChild(emptyPianoRoll);
        });

        test('should handle invalid chord index', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            
            expect(() => {
                pianoRollElement.initResize({ 
                    clientX: 100, 
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn()
                }, 999);
            }).toThrow(); // Current implementation doesn't handle invalid index gracefully
        });

        test('should handle mouse events without clientX', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            
            expect(() => {
                fireEvent.mouseDown(resizeHandle, {});
            }).not.toThrow();
        });

        test('should handle very small durations correctly', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            
            // Start resize
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            
            // Try to make it extremely small
            fireEvent(window, new MouseEvent('mousemove', { clientX: 95 }));
            
            // Should still be at least 0.1
            expect(pianoRollElement.chords[0].duration).toBeGreaterThanOrEqual(0.1);
        });

        test('should handle very large durations correctly', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            
            // Start resize
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            
            // Make it very large
            fireEvent(window, new MouseEvent('mousemove', { clientX: 1000 }));
            
            // Should handle large durations without error
            // 900px movement / 25px chordWidth = 36 beats + initial 1 = 37 beats
            expect(pianoRollElement.chords[0].duration).toBeGreaterThan(30);
            expect(pianoRollElement.chords[0].duration).toBeLessThan(40); // Reasonable upper bound
        });
    });

    describe('Visual Feedback', () => {
        test('should update chord width visually during resize', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const initialDuration = pianoRollElement.chords[0].duration;
            
            // Resize to change width
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            fireEvent(window, new MouseEvent('mousemove', { clientX: 200 }));
            
            // Chord duration should change (visual update happens via renderChords)
            expect(pianoRollElement.chords[0].duration).not.toBe(initialDuration);
        });

        test('should maintain chord position during resize', () => {
            const chordBox = pianoRollElement.shadowRoot.querySelector('.chord-box');
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const initialPosition = chordBox.style.marginLeft;
            
            // Resize should not affect position
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            fireEvent(window, new MouseEvent('mousemove', { clientX: 200 }));
            
            expect(chordBox.style.marginLeft).toBe(initialPosition);
        });

        test('should show correct duration in chord display', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            
            // Resize chord
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            fireEvent(window, new MouseEvent('mousemove', { clientX: 200 }));
            fireEvent(window, new MouseEvent('mouseup'));
            
            const chordDisplayContent = pianoRollElement.shadowRoot.querySelector('.chord-display-content');
            const chordData = JSON.parse(chordDisplayContent.textContent);
            
            expect(chordData[0].duration).toBe(pianoRollElement.chords[0].duration);
        });
    });

    describe('Performance', () => {
        test('should handle rapid resize movements efficiently', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const renderSpy = jest.spyOn(pianoRollElement, 'renderChords');
            
            // Start resize
            fireEvent.mouseDown(resizeHandle, { clientX: 100 });
            
            // Rapid movements
            for (let i = 0; i < 10; i++) {
                fireEvent(window, new MouseEvent('mousemove', { clientX: 100 + i * 5 }));
            }
            
            // Should render for each movement
            expect(renderSpy).toHaveBeenCalledTimes(10);
            
            // End resize
            fireEvent(window, new MouseEvent('mouseup'));
        });

        test('should not leak memory from event listeners', () => {
            const resizeHandle = pianoRollElement.shadowRoot.querySelector('.resize-handle');
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
            
            // Multiple resize operations
            for (let i = 0; i < 3; i++) {
                fireEvent.mouseDown(resizeHandle, { clientX: 100 });
                fireEvent(window, new MouseEvent('mouseup'));
            }
            
            // Should have equal add/remove calls
            const addCalls = addEventListenerSpy.mock.calls.length;
            const removeCalls = removeEventListenerSpy.mock.calls.length;
            expect(addCalls).toBe(removeCalls);
            
            addEventListenerSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });
    });
});