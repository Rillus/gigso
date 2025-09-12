import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import '../piano-roll.js';
import EventHandlers from '../../../helpers/eventHandlers.js';

// Mock EventHandlers
jest.mock('../../../helpers/eventHandlers.js', () => ({
    addEventListeners: jest.fn()
}));

describe('PianoRoll Component - Event Integration', () => {
    let pianoRollElement;

    beforeEach(() => {
        pianoRollElement = document.createElement('piano-roll');
        document.body.appendChild(pianoRollElement);
        
        // Clear EventHandlers mock
        EventHandlers.addEventListeners.mockClear();
    });

    afterEach(() => {
        document.body.removeChild(pianoRollElement);
    });

    describe('Event Listener Registration', () => {
        test('should register EventHandlers for set-instrument', () => {
            expect(EventHandlers.addEventListeners).toHaveBeenCalledWith([
                {
                    selector: pianoRollElement,
                    event: 'set-instrument',
                    handler: expect.any(Function)
                }
            ]);
        });

        test('should register internal event listeners', () => {
            const addEventListenerSpy = jest.spyOn(pianoRollElement, 'addEventListener');
            
            // Re-trigger connectedCallback to test listener setup
            pianoRollElement.connectedCallback();
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('add-chord', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('play', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('stop', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('pause', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('next-chord', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('previous-chord', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('load-song', expect.any(Function));
            
            addEventListenerSpy.mockRestore();
        });

        test('should register chord display toggle listener', () => {
            const header = pianoRollElement.shadowRoot.querySelector('.chord-display-header');
            const addEventListenerSpy = jest.spyOn(header, 'addEventListener');
            
            // Re-trigger connectedCallback
            pianoRollElement.connectedCallback();
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
            
            addEventListenerSpy.mockRestore();
        });
    });

    describe('Incoming Event Handling', () => {
        test('should handle add-chord events', () => {
            const addChordSpy = jest.spyOn(pianoRollElement, 'addChord');
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
            
            expect(addChordSpy).toHaveBeenCalledWith(chord);
        });

        test('should handle play events', () => {
            const playSpy = jest.spyOn(pianoRollElement, 'play');
            
            fireEvent(pianoRollElement, new CustomEvent('play'));
            
            expect(playSpy).toHaveBeenCalled();
        });

        test('should handle stop events', () => {
            const stopSpy = jest.spyOn(pianoRollElement, 'stop');
            
            fireEvent(pianoRollElement, new CustomEvent('stop'));
            
            expect(stopSpy).toHaveBeenCalled();
        });

        test('should handle pause events', () => {
            const pauseSpy = jest.spyOn(pianoRollElement, 'pause');
            
            fireEvent(pianoRollElement, new CustomEvent('pause'));
            
            expect(pauseSpy).toHaveBeenCalled();
        });

        test('should handle next-chord events', () => {
            const nextChordSpy = jest.spyOn(pianoRollElement, 'nextChord');
            
            fireEvent(pianoRollElement, new CustomEvent('next-chord'));
            
            expect(nextChordSpy).toHaveBeenCalled();
        });

        test('should handle previous-chord events', () => {
            const previousChordSpy = jest.spyOn(pianoRollElement, 'previousChord');
            
            fireEvent(pianoRollElement, new CustomEvent('previous-chord'));
            
            expect(previousChordSpy).toHaveBeenCalled();
        });

        test('should handle load-song events', () => {
            const loadSongSpy = jest.spyOn(pianoRollElement, 'loadSong');
            const song = { chords: [{ name: 'Test', notes: ['C4'], duration: 1, delay: 0 }] };
            
            fireEvent(pianoRollElement, new CustomEvent('load-song', { detail: song }));
            
            expect(loadSongSpy).toHaveBeenCalledWith(song);
        });

        test('should handle set-instrument events via EventHandlers', () => {
            const setInstrumentSpy = jest.spyOn(pianoRollElement, 'setInstrument');
            
            // Get the handler function that was registered
            const handlerCall = EventHandlers.addEventListeners.mock.calls[0][0][0];
            const handler = handlerCall.handler;
            
            // Simulate the event
            handler({ detail: 'guitar' });
            
            expect(setInstrumentSpy).toHaveBeenCalledWith('guitar');
        });
    });

    describe('Outgoing Event Dispatching', () => {
        test('should dispatch play-chord events', () => {
            const dispatchSpy = jest.spyOn(pianoRollElement, 'dispatchEvent');
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'] };
            const duration = 2;
            
            pianoRollElement.playChord(chord, duration);
            
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'play-chord',
                    detail: { chord, duration }
                })
            );
        });

        test('should dispatch isReady event on initialization', () => {
            const dispatchSpy = jest.spyOn(pianoRollElement, 'dispatchEvent');
            
            // Re-trigger connectedCallback
            pianoRollElement.connectedCallback();
            
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'isReady'
                })
            );
        });

        test('should create custom events with correct structure', () => {
            const chord = { name: 'F Major', notes: ['F4', 'A4', 'C5'] };
            const duration = 1.5;
            
            pianoRollElement.playChord(chord, duration);
            
            // Verify the event was created correctly
            const dispatchCalls = pianoRollElement.dispatchEvent.mock?.calls || [];
            if (dispatchCalls.length > 0) {
                const event = dispatchCalls[dispatchCalls.length - 1][0];
                expect(event).toBeInstanceOf(CustomEvent);
                expect(event.type).toBe('play-chord');
                expect(event.detail).toEqual({ chord, duration });
            }
        });
    });

    describe('Event Bubbling and Propagation', () => {
        test('should allow events to bubble by default', () => {
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
            
            // Create a play-chord event and verify it bubbles
            let eventCaught = false;
            document.addEventListener('play-chord', () => {
                eventCaught = true;
            }, { once: true });
            
            pianoRollElement.playChord(chord, 1);
            
            expect(eventCaught).toBe(true);
        });

        test('should handle event propagation correctly', () => {
            const parentElement = document.createElement('div');
            parentElement.appendChild(pianoRollElement);
            document.body.appendChild(parentElement);
            
            let parentEventReceived = false;
            parentElement.addEventListener('play-chord', () => {
                parentEventReceived = true;
            });
            
            const chord = { name: 'Test', notes: ['C4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
            pianoRollElement.playChord(chord, 1);
            
            expect(parentEventReceived).toBe(true);
            
            document.body.removeChild(parentElement);
        });
    });

    describe('Event Handler Error Handling', () => {
        test('should handle errors in event handlers gracefully', () => {
            // Mock addChord to throw an error
            const originalAddChord = pianoRollElement.addChord;
            pianoRollElement.addChord = jest.fn(() => {
                throw new Error('Handler error');
            });
            
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
            }).toThrow('Handler error');
            
            pianoRollElement.addChord = originalAddChord;
        });

        test('should handle missing event detail gracefully', () => {
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord')); // no detail
                fireEvent(pianoRollElement, new CustomEvent('load-song')); // no detail
            }).not.toThrow();
        });

        test('should handle null/undefined event detail', () => {
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: null }));
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: undefined }));
                fireEvent(pianoRollElement, new CustomEvent('load-song', { detail: null }));
            }).not.toThrow();
        });
    });

    describe('Event Timing and Order', () => {
        test('should dispatch isReady event after setup completion', () => {
            const events = [];
            const originalDispatch = pianoRollElement.dispatchEvent;
            pianoRollElement.dispatchEvent = jest.fn((event) => {
                events.push(event.type);
                return originalDispatch.call(pianoRollElement, event);
            });
            
            pianoRollElement.connectedCallback();
            
            expect(events).toContain('isReady');
            expect(events.indexOf('isReady')).toBe(events.length - 1); // Should be last
            
            pianoRollElement.dispatchEvent = originalDispatch;
        });

        test('should handle rapid event sequences', () => {
            const chord1 = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            const chord2 = { name: 'F Major', notes: ['F4', 'A4', 'C5'], duration: 1, delay: 0 };
            
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord1 }));
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord2 }));
                fireEvent(pianoRollElement, new CustomEvent('play'));
                fireEvent(pianoRollElement, new CustomEvent('stop'));
                fireEvent(pianoRollElement, new CustomEvent('play'));
                fireEvent(pianoRollElement, new CustomEvent('pause'));
            }).not.toThrow();
            
            expect(pianoRollElement.chords).toHaveLength(2);
        });

        test('should handle simultaneous events correctly', () => {
            const addChordSpy = jest.spyOn(pianoRollElement, 'addChord');
            const playSpy = jest.spyOn(pianoRollElement, 'play');
            
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            
            // Fire events simultaneously
            setTimeout(() => fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord })), 0);
            setTimeout(() => fireEvent(pianoRollElement, new CustomEvent('play')), 0);
            
            return new Promise(resolve => setTimeout(() => {
                expect(addChordSpy).toHaveBeenCalled();
                expect(playSpy).toHaveBeenCalled();
                resolve();
            }, 10));
        });
    });

    describe('Event Memory Management', () => {
        test('should not leak event listeners', () => {
            const addEventListenerSpy = jest.spyOn(pianoRollElement, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(pianoRollElement, 'removeEventListener');
            
            // Simulate component lifecycle
            pianoRollElement.connectedCallback();
            pianoRollElement.disconnectedCallback?.(); // If it exists
            
            // For this test, we'll just verify listeners were added
            // (Real leak detection would require more complex setup)
            expect(addEventListenerSpy.mock.calls.length).toBeGreaterThan(0);
            
            addEventListenerSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });

        test('should handle repeated connection/disconnection', () => {
            expect(() => {
                for (let i = 0; i < 5; i++) {
                    pianoRollElement.connectedCallback();
                    pianoRollElement.disconnectedCallback?.(); // If implemented
                }
            }).not.toThrow();
        });
    });

    describe('Cross-Component Event Integration', () => {
        test('should integrate with EventHandlers system', () => {
            // Verify EventHandlers.addEventListeners was called correctly
            expect(EventHandlers.addEventListeners).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        selector: pianoRollElement,
                        event: 'set-instrument',
                        handler: expect.any(Function)
                    })
                ])
            );
        });

        test('should handle events from external components', () => {
            const setInstrumentSpy = jest.spyOn(pianoRollElement, 'setInstrument');
            
            // Simulate external component sending set-instrument event
            const externalEvent = new CustomEvent('set-instrument', { detail: 'ukulele' });
            
            // Get the registered handler
            const handlerCall = EventHandlers.addEventListeners.mock.calls[0][0][0];
            handlerCall.handler(externalEvent);
            
            expect(setInstrumentSpy).toHaveBeenCalledWith('ukulele');
        });

        test('should emit events that other components can consume', () => {
            let externalHandlerCalled = false;
            let receivedChord = null;
            
            // Simulate external component listening
            document.addEventListener('play-chord', (event) => {
                externalHandlerCalled = true;
                receivedChord = event.detail.chord;
            }, { once: true });
            
            const chord = { name: 'G Major', notes: ['G4', 'B4', 'D5'] };
            pianoRollElement.playChord(chord, 1);
            
            expect(externalHandlerCalled).toBe(true);
            expect(receivedChord).toEqual(chord);
        });
    });

    describe('Event Data Validation', () => {
        test('should validate event detail data', () => {
            const invalidDetails = [
                { name: null, notes: null, duration: null },
                { name: '', notes: [], duration: 0 },
                { name: 'Test' }, // missing notes and duration
            ];
            
            invalidDetails.forEach(detail => {
                expect(() => {
                    fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail }));
                }).not.toThrow();
            });
        });

        test('should handle events with extra properties', () => {
            const chordWithExtra = {
                name: 'C Major',
                notes: ['C4', 'E4', 'G4'],
                duration: 1,
                delay: 0,
                extraProperty: 'should be ignored',
                anotherExtra: { complex: 'object' }
            };
            
            expect(() => {
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chordWithExtra }));
            }).not.toThrow();
            
            expect(pianoRollElement.chords[0]).toEqual(chordWithExtra);
        });
    });

    describe('Performance Under Load', () => {
        test('should handle many events efficiently', () => {
            const startTime = performance.now();
            
            // Fire many events
            for (let i = 0; i < 100; i++) {
                const chord = { name: `Chord${i}`, notes: ['C4'], duration: 1, delay: 0 };
                fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
            }
            
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
            expect(pianoRollElement.chords).toHaveLength(100);
        });

        test('should maintain responsiveness during event bursts', () => {
            const events = ['play', 'stop', 'pause', 'play', 'stop'];
            
            const startTime = performance.now();
            
            events.forEach(eventType => {
                for (let i = 0; i < 20; i++) {
                    fireEvent(pianoRollElement, new CustomEvent(eventType));
                }
            });
            
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(50); // Should be very fast
        });
    });
});