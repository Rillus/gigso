import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';
import HandPan from '../hand-pan.js';

describe('HandPan Component - Phase 2', () => {
    beforeEach(() => {
        document.body.innerHTML = '';

        // Create a mock Tone.js with Reverb
        window.Tone = {
            Synth: jest.fn().mockImplementation(() => ({
                triggerAttackRelease: jest.fn(),
                toDestination: jest.fn(() => ({
                    triggerAttackRelease: jest.fn()
                })),
                connect: jest.fn()
            })),
            Reverb: jest.fn().mockImplementation(() => ({
                decay: 1.5,
                wet: 0.3,
                toDestination: jest.fn()
            }))
        };
    });

    test('should create hand pan synthesiser with triangle oscillator', () => {
        // Arrange & Act
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Assert
        expect(window.Tone.Synth).toHaveBeenCalledWith({
            oscillator: {
                type: "triangle"
            },
            envelope: {
                attack: 0.01,
                decay: 0.2,
                sustain: 0.3,
                release: 2.5
            }
        });
    });

    test('should create reverb effect', () => {
        // Arrange & Act
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Assert
        expect(window.Tone.Reverb).toHaveBeenCalledWith({
            decay: 1.5,
            wet: 0.3
        });
    });

    test('should support multiple simultaneous touches', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Act - Simulate multiple touches
        const fields = handPan.shadowRoot.querySelectorAll('.tone-field');
        
        // Touch start on first field
        fireEvent.touchStart(fields[0], {
            touches: [{ identifier: 1 }]
        });
        
        // Touch start on second field
        fireEvent.touchStart(fields[1], {
            touches: [{ identifier: 2 }]
        });

        // Assert
        const activeFields = handPan.shadowRoot.querySelectorAll('.tone-field.active');
        expect(activeFields.length).toBe(2);
        expect(handPan.activeTouches.size).toBe(2);
    });

    test('should handle touch end correctly', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Act
        const field = handPan.shadowRoot.querySelector('.tone-field');
        
        // Touch start
        fireEvent.touchStart(field, {
            touches: [{ identifier: 1 }]
        });
        
        // Touch end
        fireEvent.touchEnd(field, {
            changedTouches: [{ identifier: 1 }]
        });

        // Assert
        expect(handPan.activeTouches.size).toBe(0);
    });

    test('should track active notes correctly', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Act
        const field = handPan.shadowRoot.querySelector('.tone-field');
        fireEvent.mousedown(field);

        // Assert
        expect(handPan.activeNotes.size).toBe(1);
        expect(handPan.activeNotes.has('mouse-0')).toBe(true);
    });

    test('should dispatch note events with index', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
        
        const eventSpy = jest.fn();
        handPan.addEventListener('note-played', eventSpy);

        // Act
        const field = handPan.shadowRoot.querySelector('.tone-field');
        fireEvent.mousedown(field);

        // Assert
        expect(eventSpy).toHaveBeenCalled();
        expect(eventSpy.mock.calls[0][0].detail).toHaveProperty('index');
        expect(eventSpy.mock.calls[0][0].detail.index).toBe(0);
    });

    test('should handle mouse release correctly', () => {
        // Arrange
        const handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);

        // Act
        const field = handPan.shadowRoot.querySelector('.tone-field');
        fireEvent.mousedown(field);
        fireEvent.mouseup(field);

        // Assert
        expect(handPan.activeNotes.size).toBe(0);
    });
}); 