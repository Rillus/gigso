import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';
import HandPan from '../hand-pan.js';

describe('HandPan Component', () => {
    let handPan;

    beforeEach(() => {
        document.body.innerHTML = '';

        // Create a mock Tone.js
        window.Tone = {
            Synth: jest.fn().mockImplementation(() => ({
                triggerAttackRelease: jest.fn(),
                toDestination: jest.fn(() => ({
                    triggerAttackRelease: jest.fn()
                }))
            })),
            context: {
                state: 'running',
                resume: jest.fn(),
                start: jest.fn()
            }
        };

        // Mock console.log to prevent test pollution
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        if (handPan && handPan.parentNode) {
            handPan.parentNode.removeChild(handPan);
        }
        // Restore console methods
        console.log.mockRestore();
        console.warn.mockRestore();
    });

    test('should render hand pan with 8 tone fields', () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        
        // Act
        document.body.appendChild(handPan);

        // Assert
        const toneFields = handPan.shadowRoot.querySelectorAll('.tone-field');
        expect(toneFields.length).toBe(8);
    });

    test('should render circular layout', () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        
        // Act
        document.body.appendChild(handPan);

        // Assert
        const handPanElement = handPan.shadowRoot.querySelector('.hand-pan');
        expect(handPanElement).toBeInTheDocument();
        expect(handPanElement).toHaveClass('hand-pan');
    });

    test('should play note when tone field is clicked', async () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
        
        // Ensure component is fully initialized
        expect(handPan.shadowRoot).toBeDefined();
        expect(handPan.shadowRoot.querySelectorAll('.tone-field').length).toBe(8);
        
        const mockSynth = { triggerAttackRelease: jest.fn() };
        // Replace the synth after component creation
        handPan.synth = mockSynth;
        handPan.isMuted = false; // Ensure component is not muted
        
        // Act
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
        firstField.dispatchEvent(mousedownEvent);

        // Wait for async playNote to complete
        await new Promise(resolve => setTimeout(resolve, 10));

        // Assert
        expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
    });

    test('should show active state when tone field is clicked', async () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
        handPan.isMuted = false;

        // Act
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
        firstField.dispatchEvent(mousedownEvent);

        // Wait for requestAnimationFrame and a bit more
        await new Promise(resolve => requestAnimationFrame(() => {
            setTimeout(resolve, 10);
        }));

        // Assert - check activeNotes set rather than CSS class
        expect(handPan.activeNotes.size).toBeGreaterThan(0);
    });

    test('should track active notes correctly', async () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
        handPan.isMuted = false;

        // Act
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
        firstField.dispatchEvent(mousedownEvent);

        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 10));

        // Assert - should track the active note
        expect(handPan.activeNotes.size).toBe(1);
        expect(handPan.activeNotes.has('mouse-0')).toBe(true);
    });

    test('should have D minor notes by default', () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        
        // Act
        document.body.appendChild(handPan);

        // Assert
        expect(handPan.currentKey).toBe('D');
        expect(handPan.currentScale).toBe('minor');
        // The actual notes depend on the scale utilities implementation
        expect(handPan.notes).toHaveLength(8);
        expect(handPan.notes[0]).toBe('D4'); // Root note should be D4
    });

    test('should create Tone.js synthesiser on initialisation', () => {
        // Arrange & Act
        handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Assert
        expect(window.Tone.Synth).toHaveBeenCalled();
        expect(handPan.synth).toBeDefined();
    });

    test('should dispatch note-played event when note is played', () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
        
        const eventSpy = jest.fn();
        handPan.addEventListener('note-played', eventSpy);
        
        const mockSynth = { triggerAttackRelease: jest.fn() };
        handPan.synth = mockSynth;

        // Act
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
        firstField.dispatchEvent(mousedownEvent);

        // Assert
        expect(eventSpy).toHaveBeenCalled();
        expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('note');
        expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('frequency');
        expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('duration');
    });

    test('should support touch events', async () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
        
        const mockSynth = { triggerAttackRelease: jest.fn() };
        handPan.synth = mockSynth;
        handPan.isMuted = false;

        // Act - Use fireEvent for better touch event simulation
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        fireEvent.touchStart(firstField, {
            touches: [{ identifier: 1, clientX: 100, clientY: 100 }]
        });

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 10));

        // Assert - Check that touch was processed
        expect(handPan.activeTouches.size).toBe(1);
        expect(handPan.activeTouches.has(1)).toBe(true);
    });

    test('should have key indicator in centre', () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        
        // Act
        document.body.appendChild(handPan);

        // Assert
        const keyIndicator = handPan.shadowRoot.querySelector('.key-indicator');
        expect(keyIndicator).toBeInTheDocument();
        expect(keyIndicator.textContent).toContain('D');
        expect(keyIndicator.textContent).toContain('minor');
    });

    test('should have isolated styles in shadow DOM', () => {
        // Arrange
        handPan = document.createElement('hand-pan');
        
        // Act
        document.body.appendChild(handPan);

        // Assert
        expect(handPan.shadowRoot).toBeDefined();
        const styleElement = handPan.shadowRoot.querySelector('style');
        expect(styleElement).toBeInTheDocument();
    });
}); 