import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';
import HandPan from '../hand-pan.js';

describe('HandPan Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '';

        // Create a mock Tone.js
        window.Tone = {
            Synth: jest.fn().mockImplementation(() => ({
                triggerAttackRelease: jest.fn(),
                toDestination: jest.fn(() => ({
                    triggerAttackRelease: jest.fn()
                }))
            }))
        };
    });

    test('should render hand pan with 8 tone fields', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        
        // Act
        document.body.appendChild(handPan);

        // Assert
        const toneFields = handPan.shadowRoot.querySelectorAll('.tone-field');
        expect(toneFields.length).toBe(8);
    });

    test('should render circular layout', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        
        // Act
        document.body.appendChild(handPan);

        // Assert
        const handPanElement = handPan.shadowRoot.querySelector('.hand-pan');
        expect(handPanElement).toBeInTheDocument();
        expect(handPanElement).toHaveClass('hand-pan');
    });

    test('should play note when tone field is clicked', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
        
        const mockSynth = { triggerAttackRelease: jest.fn() };
        handPan.synth = mockSynth;

        // Act
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        fireEvent.click(firstField);

        // Assert
        expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
    });

    test('should show active state when tone field is clicked', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Act
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        fireEvent.click(firstField);

        // Assert
        expect(firstField).toHaveClass('active');
    });

    test('should remove active state after note duration', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Act
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        fireEvent.click(firstField);

        // Assert - should be active initially
        expect(firstField).toHaveClass('active');

        // Wait for note duration (mock the timing)
        jest.advanceTimersByTime(2000); // Assuming 2 second note duration

        // Assert - should not be active after duration
        expect(firstField).not.toHaveClass('active');
    });

    test('should have D minor notes by default', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        
        // Act
        document.body.appendChild(handPan);

        // Assert
        expect(handPan.currentKey).toBe('D');
        expect(handPan.currentScale).toBe('minor');
        expect(handPan.notes).toEqual(['D4', 'A3', 'A4', 'F3', 'F4', 'D3', 'D4', 'A3']);
    });

    test('should create Tone.js synthesiser on initialisation', () => {
        // Arrange & Act
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Assert
        expect(window.Tone.Synth).toHaveBeenCalled();
        expect(handPan.synth).toBeDefined();
    });

    test('should dispatch note-played event when note is played', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
        
        const eventSpy = jest.fn();
        handPan.addEventListener('note-played', eventSpy);

        // Act
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        fireEvent.click(firstField);

        // Assert
        expect(eventSpy).toHaveBeenCalled();
        expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('note');
        expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('frequency');
        expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('duration');
    });

    test('should support touch events', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
        
        const mockSynth = { triggerAttackRelease: jest.fn() };
        handPan.synth = mockSynth;

        // Act
        const firstField = handPan.shadowRoot.querySelector('.tone-field');
        fireEvent.touchStart(firstField);

        // Assert
        expect(mockSynth.triggerAttackRelease).toHaveBeenCalled();
        expect(firstField).toHaveClass('active');
    });

    test('should have key indicator in centre', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        
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
        const handPan = document.createElement('hand-pan');
        
        // Act
        document.body.appendChild(handPan);

        // Assert
        expect(handPan.shadowRoot).toBeDefined();
        const styleElement = handPan.shadowRoot.querySelector('style');
        expect(styleElement).toBeInTheDocument();
    });
}); 