import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/dom';
import ChordPalette from '../chord-palette.js';

describe('ChordPalette Component', () => {
    let chordPaletteElement;

    beforeEach(() => {
        // Create an instance of the component
        chordPaletteElement = new ChordPalette();
        document.body.appendChild(chordPaletteElement);
    });

    afterEach(() => {
        // Clean up the DOM
        document.body.removeChild(chordPaletteElement);
    });

    test('should render all chord buttons', () => {
        const buttons = chordPaletteElement.shadowRoot.querySelectorAll('.chord-button');
        expect(buttons.length).toBe(11); // Ensure all chords are rendered
    });

    test('should dispatch add-chord event with correct details when a chord button is clicked', () => {
        const button = chordPaletteElement.shadowRoot.querySelector('.chord-button[data-chord*="C"]');
        const mockDispatchEvent = jest.spyOn(chordPaletteElement, 'dispatchEvent');

        fireEvent.click(button);

        expect(mockDispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
            type: 'add-chord',
            detail: {
                name: 'C',
                notes: ['C4', 'E4', 'G4'],
                duration: 1,
                delay: 0
            }
        }));
    });
});
