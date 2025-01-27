import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import '../piano-roll.js'; // Import the component to ensure it's defined

describe('PianoRoll Component', () => {
    let pianoRollElement;

    beforeEach(() => {
        // Create an instance of the component
        pianoRollElement = document.createElement('piano-roll');
        document.body.appendChild(pianoRollElement);
    });

    afterEach(() => {
        // Clean up the DOM
        document.body.removeChild(pianoRollElement);
    });

    test('should initialize with no chords', () => {
        expect(pianoRollElement.chords).toEqual([]);
    });

    test('should add a chord and update the display', () => {
        const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0, startPosition: 0 };
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

        expect(pianoRollElement.chords).toContainEqual(chord);
        const chordDisplayText = pianoRollElement.shadowRoot.querySelector('.chord-display').textContent;
        expect(JSON.parse(chordDisplayText)).toEqual([chord]);
    });

    test('should remove a chord when the remove button is clicked', () => {
        const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

        const removeButton = pianoRollElement.shadowRoot.querySelector('.remove-button');
        fireEvent.click(removeButton);

        expect(pianoRollElement.chords).toEqual([]);
        expect(pianoRollElement.shadowRoot.querySelector('.chord-display')).toHaveTextContent('[]');
    });

    test('should dispatch play-chord event when play is called', () => {
        const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

        const mockDispatchEvent = jest.spyOn(pianoRollElement, 'dispatchEvent');
        pianoRollElement.play();

        expect(mockDispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
            type: 'play-chord',
            detail: { chord, duration: 1 }
        }));
    });

    test('should not play if no chords', () => {
        pianoRollElement.play();
        expect(pianoRollElement.isPlaying).toBe(false);
    });

    test('should stop playing when stop is called', () => {
        const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0, startPosition: 0 };
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
        pianoRollElement.play();
        pianoRollElement.stop();

        expect(pianoRollElement.isPlaying).toBe(false);
        expect(pianoRollElement.currentPosition).toBe(0);
    });

    test('should toggle loopActive state when set-loop event is dispatched', () => {
        fireEvent(pianoRollElement, new CustomEvent('set-loop', { detail: true }));
        expect(pianoRollElement.loopActive).toBe(true);

        fireEvent(pianoRollElement, new CustomEvent('set-loop', { detail: false }));
        expect(pianoRollElement.loopActive).toBe(false);
    });
}); 