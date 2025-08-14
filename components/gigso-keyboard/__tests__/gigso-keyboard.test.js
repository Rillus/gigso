import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';
import GigsoKeyboard from '../gigso-keyboard.js';

describe('GigsoKeyboard Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '';

        // Create a mock synth with all required methods
        window.Tone = {
            Synth: jest.fn().mockImplementation(() => ({
                triggerAttackRelease: jest.fn(),
                triggerRelease: jest.fn(),
                toDestination: jest.fn(() => ({
                    triggerAttackRelease: jest.fn(),
                    triggerRelease: jest.fn()
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

    // Test setOctave method
    test('should set octave using setOctave method', () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        document.body.appendChild(keyboard);

        // Act
        keyboard.setOctave(5);

        // Assert
        expect(keyboard.currentOctave).toBe(5);
    });

    // Test setSize method
    test('should set size using setSize method', () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        document.body.appendChild(keyboard);

        // Act
        keyboard.setSize('large');

        // Assert
        expect(keyboard.getAttribute('size')).toBe('large');
    });

    // Test playScale method
    test('should play scale using playScale method', async () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        document.body.appendChild(keyboard);
        const playNoteSpy = jest.spyOn(keyboard, 'playNote');

        // Act
        keyboard.playScale();

        // Wait for the first note to be scheduled
        await new Promise(resolve => setTimeout(resolve, 100));

        // Assert
        expect(playNoteSpy).toHaveBeenCalled();
    });

    // Test stopAll method
    test('should stop all notes using stopAll method', () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        document.body.appendChild(keyboard);
        
        // Mock the synth and its methods
        const mockSynth = {
            triggerRelease: jest.fn()
        };
        keyboard.synth = mockSynth;
        
        const stopAllSpy = jest.spyOn(mockSynth, 'triggerRelease');

        // Act
        keyboard.stopAll();

        // Assert
        expect(stopAllSpy).toHaveBeenCalled();
    });

    // Test octave-change event emission
    test('should emit octave-change event when octave is set', () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        document.body.appendChild(keyboard);
        const eventSpy = jest.fn();
        keyboard.addEventListener('octave-change', eventSpy);

        // Act
        keyboard.setOctave(6);

        // Assert
        expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { octave: 6 }
            })
        );
    });

    // Test key-press event emission
    test('should emit key-press event when note is played', () => {
        // Arrange
        const keyboard = new GigsoKeyboard();
        document.body.appendChild(keyboard);
        const eventSpy = jest.fn();
        keyboard.addEventListener('key-press', eventSpy);

        // Act
        keyboard.playNote(0, true); // Play C note

        // Assert
        expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { note: 'C3' }
            })
        );
    });
});