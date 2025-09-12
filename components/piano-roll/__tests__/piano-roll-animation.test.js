import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import '../piano-roll.js';
import State from '../../../state/state.js';

// Mock requestAnimationFrame for testing
let animationFrameCallbacks = [];
global.requestAnimationFrame = jest.fn((callback) => {
    animationFrameCallbacks.push(callback);
    return animationFrameCallbacks.length;
});

global.cancelAnimationFrame = jest.fn((id) => {
    animationFrameCallbacks[id - 1] = null;
});

const triggerAnimationFrame = () => {
    const callbacks = [...animationFrameCallbacks];
    animationFrameCallbacks = [];
    callbacks.forEach(callback => callback && callback());
};

describe('PianoRoll Component - Animation and Playback', () => {
    let pianoRollElement;
    const { setLoopActive } = State;

    beforeEach(() => {
        pianoRollElement = document.createElement('piano-roll');
        document.body.appendChild(pianoRollElement);
        
        // Add test chords with different positions and durations
        const chord1 = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
        const chord2 = { name: 'F Major', notes: ['F4', 'A4', 'C5'], duration: 2, delay: 1 };
        const chord3 = { name: 'G Major', notes: ['G4', 'B4', 'D5'], duration: 1, delay: 3 };
        
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord1 }));
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord2 }));
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord3 }));

        // Reset animation frame mocks
        animationFrameCallbacks = [];
        global.requestAnimationFrame.mockClear();
    });

    afterEach(() => {
        document.body.removeChild(pianoRollElement);
        setLoopActive(false); // Reset loop state
        animationFrameCallbacks = [];
    });

    describe('Playback Initialization', () => {
        test('should start animation when play is called', () => {
            pianoRollElement.play();
            
            expect(pianoRollElement.isPlaying).toBe(true);
            expect(global.requestAnimationFrame).toHaveBeenCalled();
        });

        test('should not start playback if no chords exist', () => {
            const emptyPianoRoll = document.createElement('piano-roll');
            document.body.appendChild(emptyPianoRoll);
            
            emptyPianoRoll.play();
            
            expect(emptyPianoRoll.isPlaying).toBe(false);
            expect(global.requestAnimationFrame).not.toHaveBeenCalled();
            
            document.body.removeChild(emptyPianoRoll);
        });

        test('should play first chord immediately when playback starts', () => {
            const playChordSpy = jest.spyOn(pianoRollElement, 'playChord');
            
            pianoRollElement.play();
            
            expect(playChordSpy).toHaveBeenCalledWith(
                pianoRollElement.chords[0], 
                pianoRollElement.chords[0].duration
            );
            expect(pianoRollElement.chordPlaying).toBe(0);
        });
    });

    describe('Reel Scrolling', () => {
        test('should advance current position during playback', () => {
            pianoRollElement.play();
            const initialPosition = pianoRollElement.currentPosition;
            
            // Trigger animation frame
            triggerAnimationFrame();
            
            expect(pianoRollElement.currentPosition).toBeGreaterThan(initialPosition);
        });

        test('should update reel transform during scrolling', () => {
            const reel = pianoRollElement.shadowRoot.querySelector('.reel');
            
            pianoRollElement.play();
            triggerAnimationFrame(); // Advance position
            
            expect(reel.style.transform).toContain('translateX(-');
        });

        test('should continue animation while playing', () => {
            pianoRollElement.play();
            
            // First frame
            triggerAnimationFrame();
            const firstCallCount = global.requestAnimationFrame.mock.calls.length;
            
            // Should request another frame
            expect(global.requestAnimationFrame).toHaveBeenCalledTimes(firstCallCount + 1);
        });

        test('should stop animation when not playing', () => {
            pianoRollElement.play();
            triggerAnimationFrame(); // Start animation
            
            pianoRollElement.pause();
            const callCountAfterPause = global.requestAnimationFrame.mock.calls.length;
            
            triggerAnimationFrame(); // Try to continue
            
            // Should not request more frames after pause
            expect(global.requestAnimationFrame).toHaveBeenCalledTimes(callCountAfterPause);
        });
    });

    describe('Chord Timing', () => {
        test('should trigger chords based on their start positions', () => {
            const playChordSpy = jest.spyOn(pianoRollElement, 'playChord');
            pianoRollElement.play();
            
            // Advance to position where second chord should play
            pianoRollElement.currentPosition = pianoRollElement.chords[1].startPosition + 1;
            triggerAnimationFrame();
            
            expect(playChordSpy).toHaveBeenCalledWith(
                pianoRollElement.chords[1],
                pianoRollElement.chords[1].duration
            );
        });

        test('should advance chord playing index correctly', () => {
            pianoRollElement.play();
            const initialChordPlaying = pianoRollElement.chordPlaying;
            
            // Advance to next chord position
            pianoRollElement.currentPosition = pianoRollElement.chords[1].startPosition + 1;
            triggerAnimationFrame();
            
            expect(pianoRollElement.chordPlaying).toBe(initialChordPlaying + 1);
        });

        test('should handle multiple chords in sequence', () => {
            const playChordSpy = jest.spyOn(pianoRollElement, 'playChord');
            pianoRollElement.play();
            
            // Simulate advancing through all chord positions
            pianoRollElement.chords.forEach((chord, index) => {
                if (index > 0) { // First chord already played at start
                    pianoRollElement.currentPosition = chord.startPosition + 1;
                    triggerAnimationFrame();
                }
            });
            
            expect(playChordSpy).toHaveBeenCalledTimes(pianoRollElement.chords.length);
        });

        test('should not play same chord multiple times', () => {
            const playChordSpy = jest.spyOn(pianoRollElement, 'playChord');
            pianoRollElement.play();
            
            // Advance past first chord multiple times
            for (let i = 0; i < 5; i++) {
                triggerAnimationFrame();
            }
            
            // First chord should only be played once (at start)
            const firstChordCalls = playChordSpy.mock.calls.filter(
                call => call[0] === pianoRollElement.chords[0]
            );
            expect(firstChordCalls).toHaveLength(1);
        });
    });

    describe('End of Sequence Handling', () => {
        test('should pause when reaching end without loop', () => {
            setLoopActive(false);
            pianoRollElement.play();
            
            // Jump to end position
            pianoRollElement.currentPosition = pianoRollElement.endPosition + 1;
            triggerAnimationFrame();
            
            expect(pianoRollElement.isPlaying).toBe(false);
        });

        test('should reset to beginning with loop active', () => {
            setLoopActive(true);
            pianoRollElement.play();
            
            // Jump to end position
            pianoRollElement.currentPosition = pianoRollElement.endPosition + 1;
            triggerAnimationFrame();
            
            expect(pianoRollElement.currentPosition).toBe(0);
            expect(pianoRollElement.chordPlaying).toBe(0);
            expect(pianoRollElement.isPlaying).toBe(true);
        });

        test('should continue playing after loop reset', () => {
            setLoopActive(true);
            const playChordSpy = jest.spyOn(pianoRollElement, 'playChord');
            pianoRollElement.play();
            
            // Jump to end to trigger loop
            pianoRollElement.currentPosition = pianoRollElement.endPosition + 1;
            triggerAnimationFrame();
            
            // Should play first chord again after loop
            expect(playChordSpy).toHaveBeenCalledWith(
                pianoRollElement.chords[0],
                pianoRollElement.chords[0].duration
            );
        });
    });

    describe('Playback Controls', () => {
        test('should stop animation on stop', () => {
            pianoRollElement.play();
            triggerAnimationFrame(); // Start animation
            
            pianoRollElement.stop();
            
            expect(pianoRollElement.isPlaying).toBe(false);
            expect(pianoRollElement.currentPosition).toBe(0);
            expect(pianoRollElement.chordPlaying).toBeNull();
        });

        test('should reset reel position on stop', () => {
            const reel = pianoRollElement.shadowRoot.querySelector('.reel');
            pianoRollElement.play();
            triggerAnimationFrame(); // Advance position
            
            pianoRollElement.stop();
            
            expect(reel.style.transform).toBe('translateX(0px)');
        });

        test('should pause without resetting position', () => {
            pianoRollElement.play();
            triggerAnimationFrame(); // Advance position
            const currentPos = pianoRollElement.currentPosition;
            
            pianoRollElement.pause();
            
            expect(pianoRollElement.isPlaying).toBe(false);
            expect(pianoRollElement.currentPosition).toBe(currentPos);
            expect(pianoRollElement.chordPlaying).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty chord array during playback', () => {
            pianoRollElement.chords = [];
            
            expect(() => {
                pianoRollElement.scrollReel();
            }).not.toThrow();
        });

        test('should handle undefined next chord gracefully', () => {
            pianoRollElement.play();
            
            // Set chord playing beyond array bounds
            pianoRollElement.chordPlaying = pianoRollElement.chords.length;
            
            expect(() => {
                triggerAnimationFrame();
            }).not.toThrow();
        });

        test('should handle missing startPosition in chord', () => {
            const chordWithoutStartPos = { name: 'Test', notes: ['C4'], duration: 1, delay: 0 };
            pianoRollElement.chords.push(chordWithoutStartPos);
            
            expect(() => {
                pianoRollElement.play();
                triggerAnimationFrame();
            }).not.toThrow();
        });

        test('should handle rapid play/stop cycles', () => {
            for (let i = 0; i < 5; i++) {
                pianoRollElement.play();
                pianoRollElement.stop();
            }
            
            expect(pianoRollElement.isPlaying).toBe(false);
            expect(pianoRollElement.currentPosition).toBe(0);
        });
    });

    describe('Performance', () => {
        test('should efficiently handle long sequences', () => {
            // Add many chords
            for (let i = 0; i < 50; i++) {
                const chord = { name: `Chord${i}`, notes: ['C4'], duration: 1, delay: i };
                pianoRollElement.chords.push(chord);
            }
            pianoRollElement.renderChords();
            
            const startTime = performance.now();
            pianoRollElement.play();
            
            // Run several animation frames
            for (let i = 0; i < 10; i++) {
                triggerAnimationFrame();
            }
            
            const endTime = performance.now();
            
            // Should complete within reasonable time (adjust threshold as needed)
            expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
        });

        test('should not accumulate animation frame requests', () => {
            pianoRollElement.play();
            
            // Multiple frames
            for (let i = 0; i < 10; i++) {
                triggerAnimationFrame();
            }
            
            pianoRollElement.stop();
            
            // Should not have accumulated excessive requests
            expect(global.requestAnimationFrame.mock.calls.length).toBeLessThan(15);
        });
    });

    describe('Visual Updates', () => {
        test('should update reel transform smoothly', () => {
            const reel = pianoRollElement.shadowRoot.querySelector('.reel');
            pianoRollElement.play();
            
            const transforms = [];
            for (let i = 0; i < 5; i++) {
                triggerAnimationFrame();
                transforms.push(reel.style.transform);
            }
            
            // Each transform should be different (progressive movement)
            const uniqueTransforms = new Set(transforms);
            expect(uniqueTransforms.size).toBeGreaterThan(1);
        });

        test('should maintain consistent animation speed', () => {
            pianoRollElement.play();
            const positions = [];
            
            for (let i = 0; i < 5; i++) {
                triggerAnimationFrame();
                positions.push(pianoRollElement.currentPosition);
            }
            
            // Position should increase by 1 each frame (default speed)
            for (let i = 1; i < positions.length; i++) {
                expect(positions[i] - positions[i-1]).toBe(1);
            }
        });
    });
});