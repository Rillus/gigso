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

    describe('Chord Display', () => {
        test('should have proper styling', () => {
            const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
            const styles = currentChordElement.shadowRoot.querySelector('style');
            
            expect(chordDisplay).toBeTruthy();
            expect(styles.textContent).toContain('font-size: 20px');
            expect(styles.textContent).toContain('font-weight: bold');
            expect(styles.textContent).toContain('border: 1px solid black');
        });

        test('should display chord with proper format', () => {
            const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
            
            currentChordElement.setChord('Dm');
            expect(chordDisplay.textContent).toBe('Chord: Dm');
            
            currentChordElement.setChord('F#maj7');
            expect(chordDisplay.textContent).toBe('Chord: F#maj7');
        });

        test('should handle empty chord string', () => {
            const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
            
            currentChordElement.setChord('');
            expect(chordDisplay.textContent).toBe('Chord: ');
        });

        test('should handle null/undefined chord', () => {
            const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
            
            currentChordElement.setChord(null);
            expect(chordDisplay.textContent).toBe('Chord: null');
            
            currentChordElement.setChord(undefined);
            expect(chordDisplay.textContent).toBe('Chord: undefined');
        });
    });

    describe('Event Handling', () => {
        test('should respond to set-chord events with different chord types', () => {
            const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
            
            // Test major chord
            fireEvent(currentChordElement, new CustomEvent('set-chord', { detail: 'C' }));
            expect(chordDisplay.textContent).toBe('Chord: C');
            
            // Test minor chord
            fireEvent(currentChordElement, new CustomEvent('set-chord', { detail: 'Am' }));
            expect(chordDisplay.textContent).toBe('Chord: Am');
            
            // Test complex chord
            fireEvent(currentChordElement, new CustomEvent('set-chord', { detail: 'Cmaj7' }));
            expect(chordDisplay.textContent).toBe('Chord: Cmaj7');
        });

        test('should handle multiple rapid chord changes', () => {
            const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
            
            const chords = ['C', 'F', 'G', 'Am'];
            chords.forEach(chord => {
                fireEvent(currentChordElement, new CustomEvent('set-chord', { detail: chord }));
            });
            
            // Should show the last chord
            expect(chordDisplay.textContent).toBe('Chord: Am');
        });

        test('should only listen to set-chord events after connected', () => {
            // Create a new component that hasn't been connected
            const newElement = document.createElement('current-chord');
            const chordDisplay = newElement.shadowRoot.querySelector('.chord-display');
            
            // Dispatch event before connecting
            fireEvent(newElement, new CustomEvent('set-chord', { detail: 'Test' }));
            expect(chordDisplay.textContent).toBe('Chord: None'); // Should not change
            
            // Connect and try again
            document.body.appendChild(newElement);
            fireEvent(newElement, new CustomEvent('set-chord', { detail: 'Test' }));
            expect(chordDisplay.textContent).toBe('Chord: Test'); // Should change now
            
            document.body.removeChild(newElement);
        });
    });

    describe('Direct API', () => {
        test('should provide setChord method', () => {
            expect(typeof currentChordElement.setChord).toBe('function');
        });

        test('should update display when setChord is called directly', () => {
            const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
            
            currentChordElement.setChord('Direct Call');
            expect(chordDisplay.textContent).toBe('Chord: Direct Call');
        });
    });

    describe('Component Structure', () => {
        test('should have shadow DOM', () => {
            expect(currentChordElement.shadowRoot).toBeTruthy();
        });

        test('should have chord display element', () => {
            expect(currentChordElement.chordDisplay).toBeTruthy();
            expect(currentChordElement.chordDisplay.classList.contains('chord-display')).toBe(true);
        });

        test('should be properly defined as custom element', () => {
            expect(customElements.get('current-chord')).toBeTruthy();
        });
    });

    describe('Accessibility', () => {
        test('should have readable text content', () => {
            const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
            expect(chordDisplay.textContent).toMatch(/^Chord: /);
        });

        test('should have visible styling', () => {
            const chordDisplay = currentChordElement.shadowRoot.querySelector('.chord-display');
            const computedStyle = window.getComputedStyle(chordDisplay);
            
            // Note: jsdom has limited CSS support, but we can check the raw styles
            const styles = currentChordElement.shadowRoot.querySelector('style');
            expect(styles.textContent).toContain('font-size: 20px');
            expect(styles.textContent).toContain('padding: 10px');
        });
    });
});
