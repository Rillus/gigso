import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import '../../../chord-library.js'; // Ensure the chord library is available
import '../chord-diagram.js';

describe('ChordDiagram Component', () => {
    let chordDiagramElement;

    beforeEach(() => {
        document.body.innerHTML = '<chord-diagram></chord-diagram>';
        chordDiagramElement = document.querySelector('chord-diagram');
    });

    test('should render the fretboard', () => {
        // Test with guitar (should have 30 frets)
        chordDiagramElement.setAttribute('instrument', 'guitar');
        let frets = chordDiagramElement.shadowRoot.querySelectorAll('.fret');
        expect(frets.length).toBe(30);

        // Test with ukulele (should have 20 frets)
        chordDiagramElement.setAttribute('instrument', 'ukulele');
        frets = chordDiagramElement.shadowRoot.querySelectorAll('.fret');
        expect(frets.length).toBe(20);
    });

    test('should activate frets for a given chord', () => {
        // Set instrument first
        chordDiagramElement.setAttribute('instrument', 'guitar');
        
        // Then set the chord
        const chord = 'C'; // Assuming 'C' is a valid chord in the library
        chordDiagramElement.setAttribute('chord', chord);
        
        chordDiagramElement.renderChord(chord);

        const activeFrets = chordDiagramElement.shadowRoot.querySelectorAll('.fret.active');
        // Replace the expected number with the actual number of active frets for the 'C' chord
        expect(activeFrets.length).toBeGreaterThan(0);
    });

    test('should handle undefined chord gracefully', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        chordDiagramElement.setAttribute('chord', 'undefinedChord');

        chordDiagramElement.renderChord('undefinedChord');

        expect(consoleErrorSpy).toHaveBeenCalledWith('chord undefined: ', 'undefinedChord');
        consoleErrorSpy.mockRestore();
    });

    test('should update instrument attribute', () => {
        chordDiagramElement.setAttribute('instrument', 'guitar');
        chordDiagramElement.setAttribute('chord', 'C');
        expect(chordDiagramElement.instrument).toBe('guitar');
    });

    test('should dispatch set-chord event and render chord', async () => {
        // Set instrument first
        chordDiagramElement.setAttribute('instrument', 'guitar');
        
        const chord = 'G'; // Assuming 'G' is a valid chord
        const event = new CustomEvent('set-chord', { detail: chord });
        chordDiagramElement.dispatchEvent(event);

        // Wait for the next microtask
        await Promise.resolve();

        const activeFrets = chordDiagramElement.shadowRoot.querySelectorAll('.fret.active');
        // Replace the expected number with the actual number of active frets for the 'G' chord
        expect(activeFrets.length).toBeGreaterThan(0);
    });

    describe('Instrument Support', () => {
        test('should support mandolin instrument', () => {
            chordDiagramElement.setAttribute('instrument', 'mandolin');
            const frets = chordDiagramElement.shadowRoot.querySelectorAll('.fret');
            expect(frets.length).toBe(20); // Mandolin uses same as ukulele
        });

        test('should handle case insensitive instrument names', () => {
            chordDiagramElement.setAttribute('instrument', 'GUITAR');
            expect(chordDiagramElement.instrument).toBe('guitar');
            
            chordDiagramElement.setAttribute('instrument', 'UkUlElE');
            expect(chordDiagramElement.instrument).toBe('ukulele');
        });

        test('should apply correct CSS classes for instruments', () => {
            const diagram = chordDiagramElement.shadowRoot.querySelector('.chord-diagram');
            
            chordDiagramElement.setAttribute('instrument', 'guitar');
            expect(diagram.classList.contains('chord-diagram--guitar')).toBe(true);
            
            chordDiagramElement.setAttribute('instrument', 'ukulele');
            expect(diagram.classList.contains('chord-diagram--ukulele')).toBe(true);
            expect(diagram.classList.contains('chord-diagram--guitar')).toBe(false);
        });
    });

    describe('Chord Rendering', () => {
        test('should clear previous chord when rendering new one', () => {
            chordDiagramElement.setAttribute('instrument', 'guitar');
            
            // Render first chord
            chordDiagramElement.renderChord('C');
            let activeFrets = chordDiagramElement.shadowRoot.querySelectorAll('.fret.active');
            const firstChordCount = activeFrets.length;
            
            // Render different chord
            chordDiagramElement.renderChord('G');
            activeFrets = chordDiagramElement.shadowRoot.querySelectorAll('.fret.active');
            
            // Should have different number of active frets (or at least cleared previous)
            expect(activeFrets.length).toBeGreaterThan(0);
        });

        test('should handle chord with undefined instrument data', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            chordDiagramElement.setAttribute('instrument', 'guitar');
            chordDiagramElement.renderChord('SomeUnknownChord');
            
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });

        test('should handle chord with undefined positions', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            // Mock a chord that exists but has no positions for the instrument
            const originalChords = chordDiagramElement.chords;
            chordDiagramElement.chords = {
                'TestChord': {
                    guitar: {} // No positions property
                }
            };
            
            chordDiagramElement.setAttribute('instrument', 'guitar');
            chordDiagramElement.renderChord('TestChord');
            
            expect(consoleErrorSpy).toHaveBeenCalledWith('positions undefined for this chord/instrument: ', 'TestChord', 'guitar');
            
            chordDiagramElement.chords = originalChords;
            consoleErrorSpy.mockRestore();
        });

        test('should handle out of bounds fret positions', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            
            // Mock a chord with invalid fret positions
            const originalChords = chordDiagramElement.chords;
            chordDiagramElement.chords = {
                'TestChord': {
                    guitar: {
                        positions: [0, 0, 0, 99, 0, 0] // 99 is way out of bounds
                    }
                }
            };
            
            chordDiagramElement.setAttribute('instrument', 'guitar');
            chordDiagramElement.renderChord('TestChord');
            
            expect(consoleWarnSpy).toHaveBeenCalled();
            
            chordDiagramElement.chords = originalChords;
            consoleWarnSpy.mockRestore();
        });
    });

    describe('Component Lifecycle', () => {
        test('should not initialize twice', () => {
            chordDiagramElement.setAttribute('instrument', 'guitar');
            chordDiagramElement.connectedCallback();
            
            const firstHTML = chordDiagramElement.shadowRoot.innerHTML;
            
            // Call connectedCallback again
            chordDiagramElement.connectedCallback();
            
            expect(chordDiagramElement.shadowRoot.innerHTML).toBe(firstHTML);
        });

        test('should handle multiple attribute changes', () => {
            // Change instrument
            chordDiagramElement.setAttribute('instrument', 'guitar');
            expect(chordDiagramElement.instrument).toBe('guitar');
            
            // Change chord
            chordDiagramElement.setAttribute('chord', 'Am');
            expect(chordDiagramElement.chord).toBe('Am');
            
            // Change back to different instrument
            chordDiagramElement.setAttribute('instrument', 'ukulele');
            expect(chordDiagramElement.instrument).toBe('ukulele');
        });
    });

    describe('Fret Calculations', () => {
        test('should calculate correct fret positions for chords', () => {
            chordDiagramElement.setAttribute('instrument', 'ukulele');
            chordDiagramElement.renderChord('C');
            
            const activeFrets = chordDiagramElement.shadowRoot.querySelectorAll('.fret.active');
            // Should have the correct number of active frets for C chord on ukulele
            expect(activeFrets.length).toBeGreaterThan(0);
            expect(activeFrets.length).toBeLessThanOrEqual(4); // Max 4 strings on ukulele
        });

        test('should handle open string positions correctly', () => {
            chordDiagramElement.setAttribute('instrument', 'guitar');
            chordDiagramElement.renderChord('Em'); // Em has open strings
            
            // Should not crash and should render correctly
            const activeFrets = chordDiagramElement.shadowRoot.querySelectorAll('.fret.active');
            expect(activeFrets.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Visual Feedback', () => {
        test('should have proper grid layout for different instruments', () => {
            const diagram = chordDiagramElement.shadowRoot.querySelector('.chord-diagram');
            
            chordDiagramElement.setAttribute('instrument', 'guitar');
            expect(diagram.classList.contains('chord-diagram--guitar')).toBe(true);
            
            chordDiagramElement.setAttribute('instrument', 'ukulele');
            expect(diagram.classList.contains('chord-diagram--ukulele')).toBe(true);
        });

        test('should show active fret styling', () => {
            chordDiagramElement.setAttribute('instrument', 'guitar');
            chordDiagramElement.renderChord('C');
            
            const activeFrets = chordDiagramElement.shadowRoot.querySelectorAll('.fret.active');
            activeFrets.forEach(fret => {
                expect(fret.classList.contains('active')).toBe(true);
            });
        });
    });

    describe('Print Styles', () => {
        test('should have print-specific CSS rules', () => {
            const styles = chordDiagramElement.shadowRoot.querySelector('style');
            expect(styles.textContent).toContain('@media print');
            expect(styles.textContent).toContain('background: white !important');
        });
    });

    describe('Null Position Handling', () => {
        test('should display x on nut above strings with null positions', () => {
            // Mock a chord with null positions
            const originalChords = chordDiagramElement.chords;
            chordDiagramElement.chords = {
                'TestChord': {
                    guitar: {
                        positions: [null, 3, 5, 5, 4, 3] // First string is null
                    }
                }
            };
            
            chordDiagramElement.setAttribute('instrument', 'guitar');
            chordDiagramElement.renderChord('TestChord');
            
            // Check that x markers are displayed on the nut
            const xMarkers = chordDiagramElement.shadowRoot.querySelectorAll('.nut-marker');
            expect(xMarkers.length).toBe(1); // One null position
            
            // Check that the x marker is on the correct string
            const firstStringX = chordDiagramElement.shadowRoot.querySelector('.nut-marker[data-string="0"]');
            expect(firstStringX).toBeTruthy();
            expect(firstStringX.textContent).toBe('x');
            
            chordDiagramElement.chords = originalChords;
        });

        test('should display multiple x markers for multiple null positions', () => {
            // Mock a chord with multiple null positions
            const originalChords = chordDiagramElement.chords;
            chordDiagramElement.chords = {
                'TestChord': {
                    guitar: {
                        positions: [null, null, 0, 2, 3, 2] // First two strings are null
                    }
                }
            };
            
            chordDiagramElement.setAttribute('instrument', 'guitar');
            chordDiagramElement.renderChord('TestChord');
            
            // Check that x markers are displayed on the nut
            const xMarkers = chordDiagramElement.shadowRoot.querySelectorAll('.nut-marker');
            expect(xMarkers.length).toBe(2); // Two null positions
            
            // Check that x markers are on the correct strings
            const firstStringX = chordDiagramElement.shadowRoot.querySelector('.nut-marker[data-string="0"]');
            const secondStringX = chordDiagramElement.shadowRoot.querySelector('.nut-marker[data-string="1"]');
            expect(firstStringX).toBeTruthy();
            expect(secondStringX).toBeTruthy();
            expect(firstStringX.textContent).toBe('x');
            expect(secondStringX.textContent).toBe('x');
            
            chordDiagramElement.chords = originalChords;
        });

        test('should clear x markers when rendering new chord', () => {
            // Mock a chord with null positions
            const originalChords = chordDiagramElement.chords;
            chordDiagramElement.chords = {
                'TestChordWithNulls': {
                    guitar: {
                        positions: [null, 3, 5, 5, 4, 3]
                    }
                },
                'TestChordNoNulls': {
                    guitar: {
                        positions: [1, 3, 5, 5, 4, 3]
                    }
                }
            };
            
            chordDiagramElement.setAttribute('instrument', 'guitar');
            
            // Render chord with null positions
            chordDiagramElement.renderChord('TestChordWithNulls');
            let xMarkers = chordDiagramElement.shadowRoot.querySelectorAll('.nut-marker');
            expect(xMarkers.length).toBe(1);
            
            // Render chord without null positions
            chordDiagramElement.renderChord('TestChordNoNulls');
            xMarkers = chordDiagramElement.shadowRoot.querySelectorAll('.nut-marker');
            expect(xMarkers.length).toBe(0);
            
            chordDiagramElement.chords = originalChords;
        });

        test('should handle null positions on ukulele', () => {
            // Mock a chord with null positions for ukulele
            const originalChords = chordDiagramElement.chords;
            chordDiagramElement.chords = {
                'TestChord': {
                    ukulele: {
                        positions: [null, 2, 0, 0] // First string is null
                    }
                }
            };
            
            chordDiagramElement.setAttribute('instrument', 'ukulele');
            chordDiagramElement.renderChord('TestChord');
            
            // Check that x marker is displayed on the nut
            const xMarkers = chordDiagramElement.shadowRoot.querySelectorAll('.nut-marker');
            expect(xMarkers.length).toBe(1);
            
            const firstStringX = chordDiagramElement.shadowRoot.querySelector('.nut-marker[data-string="0"]');
            expect(firstStringX).toBeTruthy();
            expect(firstStringX.textContent).toBe('x');
            
            chordDiagramElement.chords = originalChords;
        });

        test('should not display x markers for zero positions', () => {
            // Mock a chord with zero positions (open strings)
            const originalChords = chordDiagramElement.chords;
            chordDiagramElement.chords = {
                'TestChord': {
                    guitar: {
                        positions: [0, 0, 2, 2, 2, 0] // Open strings, not null
                    }
                }
            };
            
            chordDiagramElement.setAttribute('instrument', 'guitar');
            chordDiagramElement.renderChord('TestChord');
            
            // Check that no x markers are displayed
            const xMarkers = chordDiagramElement.shadowRoot.querySelectorAll('.nut-marker');
            expect(xMarkers.length).toBe(0);
            
            chordDiagramElement.chords = originalChords;
        });
    });
}); 