// add-chord.test.js
import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/dom';
import AddChord from '../add-chord.js';

describe('AddChord Component', () => {
    let addChordElement;

    beforeEach(() => {
        // Create an instance of the component
        addChordElement = new AddChord();
        document.body.appendChild(addChordElement);
    });

    afterEach(() => {
        // Clean up the DOM
        document.body.removeChild(addChordElement);
    });

    test('should render the form correctly', () => {
        expect(addChordElement.shadowRoot.querySelector('#chord-name').getAttribute('placeholder')).toBe('e.g., C Major');
        expect(addChordElement.shadowRoot.querySelector('#chord-notes').getAttribute('placeholder')).toBe('e.g., C4,E4,G4');
        expect(addChordElement.shadowRoot.querySelector('#add-chord-button').textContent).toBe('Add Chord');
    });

    test('should add a chord when all fields are filled correctly', () => {
        const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
        const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
        const durationInput = addChordElement.shadowRoot.querySelector('#chord-duration');
        const delayInput = addChordElement.shadowRoot.querySelector('#chord-delay');
        const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

        fireEvent.input(nameInput, { target: { value: 'C Major' } });
        fireEvent.input(notesInput, { target: { value: 'C4,E4,G4' } });
        fireEvent.input(durationInput, { target: { value: '1.5' } });
        fireEvent.input(delayInput, { target: { value: '0.5' } });

        const mockDispatchEvent = jest.spyOn(addChordElement, 'dispatchComponentEvent');
        fireEvent.click(addButton);

        expect(mockDispatchEvent).toHaveBeenCalledWith(null, 'add-chord', {
            name: 'C Major',
            notes: ['C4', 'E4', 'G4'],
            duration: 1.5,
            delay: 0.5,
        });
    });

    test('should alert when fields are not filled correctly', () => {
        const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');
        window.alert = jest.fn();

        fireEvent.click(addButton);

        expect(window.alert).toHaveBeenCalledWith('Please fill in all fields correctly.');
    });
});