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

    describe('Form Validation', () => {
        beforeEach(() => {
            window.alert = jest.fn();
        });

        test('should reject empty chord name', () => {
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
            const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

            fireEvent.input(notesInput, { target: { value: 'C4,E4,G4' } });
            fireEvent.click(addButton);

            expect(window.alert).toHaveBeenCalledWith('Please fill in all fields correctly.');
        });

        test('should accept empty notes field', () => {
            const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
            const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

            fireEvent.input(nameInput, { target: { value: 'C Major' } });
            fireEvent.input(notesInput, { target: { value: '' } }); // Explicitly empty

            const mockDispatchEvent = jest.spyOn(addChordElement, 'dispatchComponentEvent');
            fireEvent.click(addButton);

            // Empty string splits to [''], which has length > 0, so this should work
            expect(mockDispatchEvent).toHaveBeenCalledWith(null, 'add-chord', {
                name: 'C Major',
                notes: [''], // Empty note
                duration: 1,
                delay: 0,
            });
        });

        test('should reject invalid duration', () => {
            const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
            const durationInput = addChordElement.shadowRoot.querySelector('#chord-duration');
            const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

            fireEvent.input(nameInput, { target: { value: 'C Major' } });
            fireEvent.input(notesInput, { target: { value: 'C4,E4,G4' } });
            fireEvent.input(durationInput, { target: { value: '0' } });
            fireEvent.click(addButton);

            expect(window.alert).toHaveBeenCalledWith('Please fill in all fields correctly.');
        });

        test('should accept valid input with default delay', () => {
            const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
            const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

            fireEvent.input(nameInput, { target: { value: 'C Major' } });
            fireEvent.input(notesInput, { target: { value: 'C4,E4,G4' } });

            const mockDispatchEvent = jest.spyOn(addChordElement, 'dispatchComponentEvent');
            fireEvent.click(addButton);

            expect(mockDispatchEvent).toHaveBeenCalledWith(null, 'add-chord', {
                name: 'C Major',
                notes: ['C4', 'E4', 'G4'],
                duration: 1,
                delay: 0,
            });
        });
    });

    describe('Form Clearing', () => {
        test('should clear form after successful chord addition', () => {
            const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
            const durationInput = addChordElement.shadowRoot.querySelector('#chord-duration');
            const delayInput = addChordElement.shadowRoot.querySelector('#chord-delay');
            const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

            // Fill form
            fireEvent.input(nameInput, { target: { value: 'C Major' } });
            fireEvent.input(notesInput, { target: { value: 'C4,E4,G4' } });
            fireEvent.input(durationInput, { target: { value: '2.0' } });
            fireEvent.input(delayInput, { target: { value: '1.0' } });

            // Submit
            fireEvent.click(addButton);

            // Check form is cleared
            expect(nameInput.value).toBe('');
            expect(notesInput.value).toBe('');
            expect(durationInput.value).toBe('1');
            expect(delayInput.value).toBe('0');
        });

        test('should provide clearForm method', () => {
            const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');

            // Fill form
            fireEvent.input(nameInput, { target: { value: 'Test' } });
            fireEvent.input(notesInput, { target: { value: 'C4,E4' } });

            // Clear manually
            addChordElement.clearForm();

            expect(nameInput.value).toBe('');
            expect(notesInput.value).toBe('');
        });
    });

    describe('Notes Processing', () => {
        test('should handle notes with extra whitespace', () => {
            const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
            const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

            fireEvent.input(nameInput, { target: { value: 'C Major' } });
            fireEvent.input(notesInput, { target: { value: ' C4 , E4 , G4 ' } });

            const mockDispatchEvent = jest.spyOn(addChordElement, 'dispatchComponentEvent');
            fireEvent.click(addButton);

            expect(mockDispatchEvent).toHaveBeenCalledWith(null, 'add-chord', {
                name: 'C Major',
                notes: ['C4', 'E4', 'G4'], // Should be trimmed
                duration: 1,
                delay: 0,
            });
        });

        test('should handle single note chord', () => {
            const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
            const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

            fireEvent.input(nameInput, { target: { value: 'Single Note' } });
            fireEvent.input(notesInput, { target: { value: 'C4' } });

            const mockDispatchEvent = jest.spyOn(addChordElement, 'dispatchComponentEvent');
            fireEvent.click(addButton);

            expect(mockDispatchEvent).toHaveBeenCalledWith(null, 'add-chord', {
                name: 'Single Note',
                notes: ['C4'],
                duration: 1,
                delay: 0,
            });
        });
    });

    describe('Input Attributes', () => {
        test('should have correct input constraints', () => {
            const durationInput = addChordElement.shadowRoot.querySelector('#chord-duration');
            const delayInput = addChordElement.shadowRoot.querySelector('#chord-delay');

            expect(durationInput.getAttribute('min')).toBe('0.1');
            expect(durationInput.getAttribute('step')).toBe('0.1');
            expect(delayInput.getAttribute('min')).toBe('0');
            expect(delayInput.getAttribute('step')).toBe('0.1');
        });

        test('should have default values', () => {
            const durationInput = addChordElement.shadowRoot.querySelector('#chord-duration');
            const delayInput = addChordElement.shadowRoot.querySelector('#chord-delay');

            expect(durationInput.value).toBe('1');
            expect(delayInput.value).toBe('0');
        });
    });

    describe('Accessibility', () => {
        test('should have proper labels for inputs', () => {
            const labels = addChordElement.shadowRoot.querySelectorAll('label');
            expect(labels.length).toBe(4);
            
            const labelTexts = Array.from(labels).map(label => label.textContent.trim());
            expect(labelTexts).toContain('Chord Name:');
            expect(labelTexts).toContain('Notes (comma-separated):');
            expect(labelTexts).toContain('Duration (in beats):');
            expect(labelTexts).toContain('Delay (in beats):');
        });

        test('should have proper form structure', () => {
            const container = addChordElement.shadowRoot.querySelector('.form-container');
            const inputs = container.querySelectorAll('input');
            const button = container.querySelector('button');

            expect(container).toBeTruthy();
            expect(inputs.length).toBe(4);
            expect(button).toBeTruthy();
        });
    });

    describe('Edge Cases', () => {
        test('should handle notes with only commas and spaces', () => {
            const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
            const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

            fireEvent.input(nameInput, { target: { value: 'Test' } });
            fireEvent.input(notesInput, { target: { value: '   ,  , ' } }); // Only commas and spaces

            const mockDispatchEvent = jest.spyOn(addChordElement, 'dispatchComponentEvent');
            fireEvent.click(addButton);

            // This creates ['', '', ''] which still has length > 0
            expect(mockDispatchEvent).toHaveBeenCalledWith(null, 'add-chord', {
                name: 'Test',
                notes: ['', '', ''], // Empty notes after trimming
                duration: 1,
                delay: 0,
            });
        });

        test('should trim chord name', () => {
            const nameInput = addChordElement.shadowRoot.querySelector('#chord-name');
            const notesInput = addChordElement.shadowRoot.querySelector('#chord-notes');
            const addButton = addChordElement.shadowRoot.querySelector('#add-chord-button');

            fireEvent.input(nameInput, { target: { value: '  C Major  ' } });
            fireEvent.input(notesInput, { target: { value: 'C4,E4,G4' } });

            const mockDispatchEvent = jest.spyOn(addChordElement, 'dispatchComponentEvent');
            fireEvent.click(addButton);

            expect(mockDispatchEvent).toHaveBeenCalledWith(null, 'add-chord', {
                name: 'C Major', // Should be trimmed
                notes: ['C4', 'E4', 'G4'],
                duration: 1,
                delay: 0,
            });
        });
    });

    describe('Component Styling', () => {
        test('should have form container styles', () => {
            const styles = addChordElement.shadowRoot.querySelector('style');
            expect(styles.textContent).toContain('.form-container');
            expect(styles.textContent).toContain('flex-direction: column');
            expect(styles.textContent).toContain('gap: 10px');
        });
    });
});