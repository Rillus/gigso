import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import '../piano-roll.js'; // Import the component to ensure it's defined
import State from '../../../state/state.js';
const { loopActive, setLoopActive } = State;

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
        const chordDisplayContent = pianoRollElement.shadowRoot.querySelector('.chord-display-content');
        expect(JSON.parse(chordDisplayContent.textContent)).toEqual([chord]);
    });

    test('should remove a chord when the remove button is clicked', () => {
        const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

        const removeButton = pianoRollElement.shadowRoot.querySelector('.remove-button');
        fireEvent.click(removeButton);

        expect(pianoRollElement.chords).toEqual([]);
        expect(pianoRollElement.shadowRoot.querySelector('.chord-display-content')).toHaveTextContent('[]');
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

    test('should play in a loop if loopActive is true', () => {
        const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
        fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));
        setLoopActive(true);
        pianoRollElement.play();
        expect(pianoRollElement.isPlaying).toBe(true);
        expect(loopActive()).toBe(true);
    });

    describe('Chord Display Collapsible Functionality', () => {
        test('should be collapsed by default', () => {
            const chordDisplay = pianoRollElement.shadowRoot.querySelector('.chord-display');
            expect(chordDisplay).toHaveClass('collapsed');
            expect(chordDisplay).not.toHaveClass('expanded');
        });

        test('should have a toggle header with down arrow', () => {
            const header = pianoRollElement.shadowRoot.querySelector('.chord-display-header');
            const arrow = pianoRollElement.shadowRoot.querySelector('.toggle-arrow');
            
            expect(header).toBeInTheDocument();
            expect(arrow).toBeInTheDocument();
            expect(arrow.textContent).toBe('▼');
        });

        test('should toggle between collapsed and expanded when header is clicked', () => {
            const chordDisplay = pianoRollElement.shadowRoot.querySelector('.chord-display');
            const header = pianoRollElement.shadowRoot.querySelector('.chord-display-header');
            
            // Initially collapsed
            expect(chordDisplay).toHaveClass('collapsed');
            expect(chordDisplay).not.toHaveClass('expanded');
            
            // Click to expand
            fireEvent.click(header);
            expect(chordDisplay).toHaveClass('expanded');
            expect(chordDisplay).not.toHaveClass('collapsed');
            
            // Click to collapse again
            fireEvent.click(header);
            expect(chordDisplay).toHaveClass('collapsed');
            expect(chordDisplay).not.toHaveClass('expanded');
        });

        test('should update chord display content when chords are added', () => {
            const chord = { name: 'C Major', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 };
            fireEvent(pianoRollElement, new CustomEvent('add-chord', { detail: chord }));

            const chordDisplayContent = pianoRollElement.shadowRoot.querySelector('.chord-display-content');
            expect(JSON.parse(chordDisplayContent.textContent)).toEqual([chord]);
        });

        test('should have proper CSS classes for collapsed state', () => {
            const chordDisplay = pianoRollElement.shadowRoot.querySelector('.chord-display');
            const content = pianoRollElement.shadowRoot.querySelector('.chord-display-content');
            const arrow = pianoRollElement.shadowRoot.querySelector('.toggle-arrow');
            
            expect(chordDisplay).toHaveClass('collapsed');
            expect(chordDisplay).not.toHaveClass('expanded');
            expect(content).toBeInTheDocument();
            expect(arrow).toBeInTheDocument();
        });

        test('should have proper CSS classes for expanded state after toggle', () => {
            const chordDisplay = pianoRollElement.shadowRoot.querySelector('.chord-display');
            const content = pianoRollElement.shadowRoot.querySelector('.chord-display-content');
            const arrow = pianoRollElement.shadowRoot.querySelector('.toggle-arrow');
            const header = pianoRollElement.shadowRoot.querySelector('.chord-display-header');
            
            // Toggle to expanded
            fireEvent.click(header);
            
            expect(chordDisplay).toHaveClass('expanded');
            expect(chordDisplay).not.toHaveClass('collapsed');
            expect(content).toBeInTheDocument();
            expect(arrow).toBeInTheDocument();
        });
    });
}); 