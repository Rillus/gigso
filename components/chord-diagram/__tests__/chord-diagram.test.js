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
}); 