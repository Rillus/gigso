import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';
import GigsoKeyboard from '../gigso-keyboard.js';

describe('GigsoKeyboard Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '';

        // Create a mock synth
        window.Tone = {
            Synth: jest.fn().mockImplementation(() => ({
                triggerAttackRelease: jest.fn(),
                toDestination: jest.fn(() => ({
                    triggerAttackRelease: jest.fn()
                }))
            }))
        };
    });

    test('should render the correct number of keys based on octaves attribute', () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        keyboard.setAttribute('octaves', '2');

        // Act
        document.body.appendChild(keyboard);

        // Assert
        const keys = keyboard.shadowRoot.querySelectorAll('.key');
        expect(keys.length).toBe(24); // 12 keys per octave * 2 octaves
    });

    test('should highlight key on keydown and remove highlight on keyup', () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        document.body.appendChild(keyboard);

        // Act
        fireEvent.keyDown(window, { key: 'a' }); // C note
        const keyElement = keyboard.shadowRoot.querySelector('[data-note="C4"]');

        // Assert
        expect(keyElement).toHaveClass('active');

        // Act
        fireEvent.keyUp(window, { key: 'a' });

        // Assert
        expect(keyElement).not.toHaveClass('active');
    });

    test('should play note on mousedown', () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        document.body.appendChild(keyboard);

        // Mock the playNote method
        const playNoteSpy = jest.spyOn(keyboard, 'playNote');

        // Act
        const keyElement = keyboard.shadowRoot.querySelector('.key.C');
        fireEvent.mouseDown(keyElement);
        
        // Assert
        expect(playNoteSpy).toHaveBeenCalled();
    });

    // test octave change
    test('should change octave on keydown', () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        document.body.appendChild(keyboard);

        // Act
        fireEvent.keyDown(window, { key: '+' });

        // Assert
        expect(keyboard.currentOctave).toBe(4);

        // Act
        fireEvent.keyDown(window, { key: '-' });
        fireEvent.keyDown(window, { key: '-' });

        // Assert
        expect(keyboard.currentOctave).toBe(2);
    });
});