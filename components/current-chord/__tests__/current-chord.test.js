import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import '../current-chord.js'; // Import the component to ensure it's defined

describe('CurrentChord Component', () => {
    let currentChordElement;

    beforeEach(() => {
        // Create an instance of the component
        currentChordElement = document.createElement('current-chord');
        document.body.appendChild(currentChordElement);
    });

    afterEach(() => {
        // Clean up the DOM
        document.body.removeChild(currentChordElement);
    });

    test('should display "Chord: None" by default', () => {
        const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
        expect(chordDisplay).toHaveTextContent('Chord: None');
    });

    test('should update the displayed chord when set-chord event is dispatched', () => {
        const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
        const newChord = 'C Major';

        fireEvent(currentChordElement, new CustomEvent('set-chord', { detail: newChord }));

        expect(chordDisplay).toHaveTextContent(`Chord: ${newChord}`);
    });
});
