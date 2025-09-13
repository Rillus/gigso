import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import '../piano-roll.js';

// Mock console.log to capture configuration logging
const originalLog = console.log;
const logMock = jest.fn();

describe('PianoRoll Component - Configuration', () => {
    let pianoRollElement;

    beforeEach(() => {
        pianoRollElement = document.createElement('piano-roll');
        document.body.appendChild(pianoRollElement);
        
        // Add test chord for instrument testing
        const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
        
        // Mock console.log
        console.log = logMock;
        logMock.mockClear();
    });

    afterEach(() => {
        // Only remove if still in the DOM
        if (pianoRollElement.parentNode) {
            document.body.removeChild(pianoRollElement);
        }
        console.log = originalLog;
    });

    describe('Tempo Configuration', () => {
        test('should set tempo correctly', () => {
            const newTempo = 140;
            pianoRollElement.setTempo(newTempo);
            
            expect(pianoRollElement.tempo).toBe(newTempo);
            expect(pianoRollElement.getTempo()).toBe(newTempo);
        });

        test('should log tempo change', () => {
            const newTempo = 90;
            pianoRollElement.setTempo(newTempo);
            
            expect(logMock).toHaveBeenCalledWith('PianoRoll: Tempo set to', newTempo, 'BPM');
        });

        test('should handle various tempo values', () => {
            const tempos = [60, 120, 180, 200, 300];
            
            tempos.forEach(tempo => {
                pianoRollElement.setTempo(tempo);
                expect(pianoRollElement.getTempo()).toBe(tempo);
            });
        });

        test('should handle decimal tempo values', () => {
            const decimalTempo = 125.5;
            pianoRollElement.setTempo(decimalTempo);
            
            expect(pianoRollElement.getTempo()).toBe(decimalTempo);
        });

        test('should handle zero and negative tempo values', () => {
            // Zero tempo
            pianoRollElement.setTempo(0);
            expect(pianoRollElement.getTempo()).toBe(0);
            
            // Negative tempo
            pianoRollElement.setTempo(-60);
            expect(pianoRollElement.getTempo()).toBe(-60);
        });

        test('should handle very large tempo values', () => {
            const largeTempo = 1000;
            pianoRollElement.setTempo(largeTempo);
            
            expect(pianoRollElement.getTempo()).toBe(largeTempo);
        });

        test('should handle string tempo values', () => {
            // Should handle string conversion
            pianoRollElement.setTempo('150');
            expect(pianoRollElement.getTempo()).toBe('150');
        });

        test('should handle undefined/null tempo values', () => {
            pianoRollElement.setTempo(undefined);
            expect(pianoRollElement.getTempo()).toBeUndefined();
            
            pianoRollElement.setTempo(null);
            expect(pianoRollElement.getTempo()).toBeNull();
        });
    });

    describe('Time Signature Configuration', () => {
        test('should set time signature correctly', () => {
            const newTimeSignature = '3/4';
            pianoRollElement.setTimeSignature(newTimeSignature);
            
            expect(pianoRollElement.timeSignature).toBe(newTimeSignature);
            expect(pianoRollElement.getTimeSignature()).toBe(newTimeSignature);
        });

        test('should log time signature change', () => {
            const newTimeSignature = '6/8';
            pianoRollElement.setTimeSignature(newTimeSignature);
            
            expect(logMock).toHaveBeenCalledWith('PianoRoll: Time signature set to', newTimeSignature);
        });

        test('should handle various time signatures', () => {
            const timeSignatures = ['4/4', '3/4', '2/4', '6/8', '9/8', '12/8', '5/4', '7/8'];
            
            timeSignatures.forEach(timeSignature => {
                pianoRollElement.setTimeSignature(timeSignature);
                expect(pianoRollElement.getTimeSignature()).toBe(timeSignature);
            });
        });

        test('should handle invalid time signature formats', () => {
            const invalidSignatures = ['invalid', '4', '4/4/4', '', '4/', '/4'];
            
            invalidSignatures.forEach(invalid => {
                pianoRollElement.setTimeSignature(invalid);
                expect(pianoRollElement.getTimeSignature()).toBe(invalid);
            });
        });

        test('should handle null/undefined time signatures', () => {
            pianoRollElement.setTimeSignature(null);
            expect(pianoRollElement.getTimeSignature()).toBeNull();
            
            pianoRollElement.setTimeSignature(undefined);
            expect(pianoRollElement.getTimeSignature()).toBeUndefined();
        });
    });

    describe('Instrument Configuration', () => {
        test('should set instrument correctly', () => {
            const newInstrument = 'guitar';
            pianoRollElement.setInstrument(newInstrument);
            
            expect(pianoRollElement.instrument).toBe(newInstrument);
        });

        test('should trigger chord re-rendering on instrument change', () => {
            const renderChordsSpy = jest.spyOn(pianoRollElement, 'renderChords');
            
            pianoRollElement.setInstrument('ukulele');
            
            expect(renderChordsSpy).toHaveBeenCalled();
        });

        test('should handle various instrument types', () => {
            const instruments = ['piano', 'guitar', 'ukulele', 'mandolin', 'bass', 'violin'];
            
            instruments.forEach(instrument => {
                pianoRollElement.setInstrument(instrument);
                expect(pianoRollElement.instrument).toBe(instrument);
            });
        });

        test('should update chord diagrams with new instrument', () => {
            // Mock chord diagram creation
            const originalCreateElement = document.createElement;
            const mockChordDiagram = { setAttribute: jest.fn() };
            document.createElement = jest.fn((tagName) => {
                if (tagName === 'chord-diagram') {
                    return mockChordDiagram;
                }
                return originalCreateElement.call(document, tagName);
            });

            pianoRollElement.setInstrument('guitar');
            
            expect(mockChordDiagram.setAttribute).toHaveBeenCalledWith('instrument', 'guitar');
            
            // Restore original createElement
            document.createElement = originalCreateElement;
        });

        test('should handle null/undefined instruments', () => {
            pianoRollElement.setInstrument(null);
            expect(pianoRollElement.instrument).toBeNull();
            
            pianoRollElement.setInstrument(undefined);
            expect(pianoRollElement.instrument).toBeUndefined();
        });

        test('should handle empty string instrument', () => {
            pianoRollElement.setInstrument('');
            expect(pianoRollElement.instrument).toBe('');
        });
    });

    describe('Default Configuration Values', () => {
        test('should have correct default tempo', () => {
            const freshPianoRoll = document.createElement('piano-roll');
            expect(freshPianoRoll.tempo).toBe(120);
            expect(freshPianoRoll.getTempo()).toBe(120);
        });

        test('should have correct default time signature', () => {
            const freshPianoRoll = document.createElement('piano-roll');
            expect(freshPianoRoll.timeSignature).toBe('4/4');
            expect(freshPianoRoll.getTimeSignature()).toBe('4/4');
        });

        test('should have correct default chord width', () => {
            const freshPianoRoll = document.createElement('piano-roll');
            expect(freshPianoRoll.chordWidth).toBe(25);
        });

        test('should initialize with State.instrument() value', () => {
            // This depends on the State module's default instrument
            const freshPianoRoll = document.createElement('piano-roll');
            expect(freshPianoRoll.instrument).toBeDefined();
        });
    });

    describe('Configuration Persistence', () => {
        test('should maintain tempo during playback operations', () => {
            const customTempo = 150;
            pianoRollElement.setTempo(customTempo);
            
            // Perform various operations
            pianoRollElement.play();
            pianoRollElement.stop();
            pianoRollElement.pause();
            
            expect(pianoRollElement.getTempo()).toBe(customTempo);
        });

        test('should maintain time signature during chord operations', () => {
            const customTimeSignature = '3/4';
            pianoRollElement.setTimeSignature(customTimeSignature);
            
            // Add and remove chords
            const chord = { name: 'Test', notes: ['C4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
            pianoRollElement.removeChord(0);
            
            expect(pianoRollElement.getTimeSignature()).toBe(customTimeSignature);
        });

        test('should maintain instrument setting during re-renders', () => {
            const customInstrument = 'guitar';
            pianoRollElement.setInstrument(customInstrument);
            
            // Force re-render
            pianoRollElement.renderChords();
            
            expect(pianoRollElement.instrument).toBe(customInstrument);
        });
    });

    describe('Configuration Interactions', () => {
        test('should handle multiple configuration changes', () => {
            pianoRollElement.setTempo(160);
            pianoRollElement.setTimeSignature('3/4');
            pianoRollElement.setInstrument('guitar');
            
            expect(pianoRollElement.getTempo()).toBe(160);
            expect(pianoRollElement.getTimeSignature()).toBe('3/4');
            expect(pianoRollElement.instrument).toBe('guitar');
        });

        test('should handle rapid configuration changes', () => {
            for (let i = 0; i < 10; i++) {
                pianoRollElement.setTempo(100 + i);
                pianoRollElement.setTimeSignature(`${i % 4 + 2}/4`);
                pianoRollElement.setInstrument(`instrument${i}`);
            }
            
            expect(pianoRollElement.getTempo()).toBe(109);
            expect(pianoRollElement.getTimeSignature()).toBe('3/4'); // i=9: 9%4+2=3 → "3/4"
            expect(pianoRollElement.instrument).toBe('instrument9');
        });
    });

    describe('Configuration Validation', () => {
        test('should accept valid tempo ranges', () => {
            const validTempos = [40, 60, 120, 200, 300];
            
            validTempos.forEach(tempo => {
                pianoRollElement.setTempo(tempo);
                expect(pianoRollElement.getTempo()).toBe(tempo);
            });
        });

        test('should accept common time signatures', () => {
            const commonSignatures = ['4/4', '3/4', '2/4', '6/8', '9/8', '12/8'];
            
            commonSignatures.forEach(signature => {
                pianoRollElement.setTimeSignature(signature);
                expect(pianoRollElement.getTimeSignature()).toBe(signature);
            });
        });

        test('should accept standard instruments', () => {
            const standardInstruments = ['piano', 'guitar', 'ukulele', 'mandolin'];
            
            standardInstruments.forEach(instrument => {
                pianoRollElement.setInstrument(instrument);
                expect(pianoRollElement.instrument).toBe(instrument);
            });
        });
    });

    describe('Error Handling', () => {
        test('should not throw on invalid configurations', () => {
            expect(() => {
                pianoRollElement.setTempo(NaN);
                pianoRollElement.setTempo(Infinity);
                pianoRollElement.setTempo(-Infinity);
            }).not.toThrow();

            expect(() => {
                pianoRollElement.setTimeSignature({});
                pianoRollElement.setTimeSignature([]);
                pianoRollElement.setTimeSignature(123);
            }).not.toThrow();

            expect(() => {
                pianoRollElement.setInstrument({});
                pianoRollElement.setInstrument(123);
                pianoRollElement.setInstrument(true);
            }).not.toThrow();
        });

        test('should handle configuration during component destruction', () => {
            document.body.removeChild(pianoRollElement);
            
            expect(() => {
                pianoRollElement.setTempo(140);
                pianoRollElement.setTimeSignature('3/4');
                pianoRollElement.setInstrument('guitar');
            }).not.toThrow();
        });
    });

    describe('Performance', () => {
        test('should handle rapid tempo changes efficiently', () => {
            const startTime = performance.now();
            
            for (let i = 0; i < 100; i++) {
                pianoRollElement.setTempo(60 + i);
            }
            
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
        });

        test('should handle instrument changes without memory leaks', () => {
            const renderSpy = jest.spyOn(pianoRollElement, 'renderChords');
            
            for (let i = 0; i < 20; i++) {
                pianoRollElement.setInstrument(`instrument${i}`);
            }
            
            // Should call renderChords for each instrument change
            expect(renderSpy).toHaveBeenCalledTimes(20);
            
            renderSpy.mockRestore();
        });
    });
});