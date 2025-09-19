import ChordWheel from '../chord-wheel.js';

// Mock Tone.js
global.Tone = {
    context: {
        state: 'running'
    },
    start: jest.fn(() => Promise.resolve()),
    PolySynth: jest.fn(() => ({
        triggerAttackRelease: jest.fn(),
        connect: jest.fn(),
        toDestination: jest.fn(),
        volume: { value: 0 }
    })),
    Reverb: jest.fn(() => ({
        connect: jest.fn(),
        toDestination: jest.fn()
    })),
    PingPongDelay: jest.fn(() => ({
        connect: jest.fn(),
        toDestination: jest.fn()
    })),
    Analyser: jest.fn(() => ({
        connect: jest.fn(),
        toDestination: jest.fn(),
        getValue: jest.fn(() => new Array(256).fill(0)),
        size: 256
    }))
};

// Mock dependencies
jest.mock('../../../helpers/audioUtils.js', () => ({
    checkToneJsStatus: jest.fn(() => ({ available: true })),
    getAudioErrorMessage: jest.fn(() => 'Audio error'),
    logAudioStatus: jest.fn()
}));

jest.mock('../../../helpers/audioManager.js', () => ({
    default: {
        playChord: jest.fn()
    }
}));

jest.mock('../../../state/state.js', () => ({
    default: {
        isKeySet: jest.fn(() => false),
        songKey: jest.fn(() => 'C'),
        songScale: jest.fn(() => 'major')
    }
}));

describe('ChordWheel Integration Tests', () => {
    let chordWheel;
    let mockMixer;
    let mockChordPalette;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Reset DOM
        document.body.innerHTML = '';

        // Create mock mixer
        mockMixer = document.createElement('div');
        mockMixer.setAttribute('class', 'gigso-mixer');
        mockMixer.addInstrument = jest.fn();
        mockMixer.updateLevel = jest.fn();
        document.body.appendChild(mockMixer);

        // Create mock chord palette
        mockChordPalette = document.createElement('div');
        mockChordPalette.setAttribute('class', 'chord-palette');
        document.body.appendChild(mockChordPalette);

        // Create chord wheel
        chordWheel = new ChordWheel();
        document.body.appendChild(chordWheel);
    });

    afterEach(() => {
        // Clean up
        document.body.innerHTML = '';
    });

    describe('State Integration', () => {
        test('should initialize with state key when available', () => {
            // Mock state to return key
            const mockState = require('../../../state/state.js').default;
            mockState.isKeySet.mockReturnValue(true);
            mockState.songKey.mockReturnValue('F');
            mockState.songScale.mockReturnValue('minor');

            // Create new chord wheel
            const newChordWheel = new ChordWheel();
            document.body.appendChild(newChordWheel);

            expect(newChordWheel.getAttribute('key')).toBe('F');
            expect(newChordWheel.getAttribute('scale')).toBe('minor');

            // Cleanup
            newChordWheel.remove();
        });

        test('should use defaults when state is not available', () => {
            const mockState = require('../../../state/state.js').default;
            mockState.isKeySet.mockReturnValue(false);

            const newChordWheel = new ChordWheel();
            document.body.appendChild(newChordWheel);

            expect(newChordWheel.getAttribute('key')).toBe('C');
            expect(newChordWheel.getAttribute('scale')).toBe('major');

            // Cleanup
            newChordWheel.remove();
        });
    });

    describe('Mixer Integration', () => {
        test('should register with mixer on connection', (done) => {
            // Wait for registration timeout
            setTimeout(() => {
                expect(mockMixer.addInstrument).toHaveBeenCalledWith({
                    id: 'chord-wheel',
                    name: 'Chord Wheel',
                    icon: '🎡',
                    volume: 0.8
                });
                done();
            }, 150);
        });

        test('should handle volume change events', () => {
            const volumeEvent = new CustomEvent('volume-change', {
                detail: { volume: 0.6 }
            });

            chordWheel.dispatchEvent(volumeEvent);

            expect(chordWheel.instrumentVolume).toBe(0.6);
        });

        test('should handle mute toggle events', () => {
            const muteEvent = new CustomEvent('mute-toggle', {
                detail: { muted: true }
            });

            chordWheel.dispatchEvent(muteEvent);

            expect(chordWheel.isMuted).toBe(true);
        });

        test('should handle master volume changes', () => {
            const masterVolumeEvent = new CustomEvent('master-volume-change', {
                detail: { volume: 0.5 }
            });

            chordWheel.dispatchEvent(masterVolumeEvent);

            expect(chordWheel.masterVolume).toBe(0.5);
        });

        test('should handle master mute toggle', () => {
            const masterMuteEvent = new CustomEvent('master-mute-toggle', {
                detail: { muted: true }
            });

            chordWheel.dispatchEvent(masterMuteEvent);

            expect(chordWheel.masterMuted).toBe(true);
        });

        test('should update mixer with audio levels', (done) => {
            // Start level monitoring
            chordWheel.startLevelMonitoring();

            // Wait for level update
            setTimeout(() => {
                expect(mockMixer.updateLevel).toHaveBeenCalledWith('chord-wheel', expect.any(Number));
                done();
            }, 50);
        });

        test('should combine instrument and master volumes correctly', () => {
            chordWheel.instrumentVolume = 0.8;
            chordWheel.masterVolume = 0.6;

            chordWheel.updateSynthVolume();

            // Combined volume should be 0.8 * 0.6 = 0.48
            // In dB: 20 * log10(0.48) ≈ -6.4 dB
            expect(chordWheel.synth.volume.value).toBeCloseTo(-6.4, 1);
        });
    });

    describe('Cross-Component Communication', () => {
        test('should respond to external key-changed events', () => {
            const keyChangedEvent = new CustomEvent('key-changed', {
                detail: { key: 'D', scale: 'minor' }
            });

            document.dispatchEvent(keyChangedEvent);

            expect(chordWheel.currentKey).toBe('D');
            expect(chordWheel.currentScale).toBe('minor');
        });

        test('should respond to external key-set events', () => {
            const keySetEvent = new CustomEvent('key-set', {
                detail: { key: 'A', scale: 'major' }
            });

            document.dispatchEvent(keySetEvent);

            expect(chordWheel.currentKey).toBe('A');
            expect(chordWheel.currentScale).toBe('major');
        });

        test('should dispatch chord-played events to other components', () => {
            const chordPlayedSpy = jest.fn();
            document.addEventListener('chord-played', chordPlayedSpy);

            // Simulate chord button click
            const firstButton = chordWheel.shadowRoot.querySelector('.chord-button');
            const clickEvent = new MouseEvent('mousedown');
            Object.defineProperty(clickEvent, 'target', { value: firstButton });

            chordWheel.handleMouseInteraction(clickEvent, 0);

            expect(chordPlayedSpy).toHaveBeenCalled();
            expect(chordPlayedSpy.mock.calls[0][0].detail).toHaveProperty('chord');
            expect(chordPlayedSpy.mock.calls[0][0].detail).toHaveProperty('notes');
        });

        test('should dispatch key-changed events to other components', () => {
            const keyChangedSpy = jest.fn();
            document.addEventListener('key-changed', keyChangedSpy);

            chordWheel.changeKey('G', 'major');

            expect(keyChangedSpy).toHaveBeenCalled();
            expect(keyChangedSpy.mock.calls[0][0].detail).toEqual({
                key: 'G',
                scale: 'major',
                chords: chordWheel.chords
            });
        });

        test('should dispatch mode-changed events to other components', () => {
            const modeChangedSpy = jest.fn();
            document.addEventListener('mode-changed', modeChangedSpy);

            chordWheel.changeMode('diatonic');

            expect(modeChangedSpy).toHaveBeenCalled();
            expect(modeChangedSpy.mock.calls[0][0].detail).toEqual({
                mode: 'diatonic',
                chords: chordWheel.chords
            });
        });
    });

    describe('Multi-Touch and Multi-User Scenarios', () => {
        test('should handle multiple simultaneous chord interactions', async () => {
            const button1 = chordWheel.shadowRoot.querySelectorAll('.chord-button')[0];
            const button2 = chordWheel.shadowRoot.querySelectorAll('.chord-button')[1];

            // Simulate two simultaneous touch events
            const touch1 = new TouchEvent('touchstart', {
                touches: [{ identifier: 0, clientX: 100, clientY: 100 }]
            });
            const touch2 = new TouchEvent('touchstart', {
                touches: [{ identifier: 1, clientX: 200, clientY: 200 }]
            });

            Object.defineProperty(touch1, 'target', { value: button1 });
            Object.defineProperty(touch2, 'target', { value: button2 });

            await chordWheel.handleTouchStart(touch1, 0);
            await chordWheel.handleTouchStart(touch2, 1);

            // Should track both touches
            expect(chordWheel.activeTouches.size).toBe(2);
            expect(chordWheel.activeChords.size).toBe(2);

            // Both buttons should be active
            expect(button1.classList.contains('active')).toBe(true);
            expect(button2.classList.contains('active')).toBe(true);
        });

        test('should handle touch and mouse interactions simultaneously', async () => {
            const button1 = chordWheel.shadowRoot.querySelectorAll('.chord-button')[0];
            const button2 = chordWheel.shadowRoot.querySelectorAll('.chord-button')[1];

            // Touch event
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ identifier: 0, clientX: 100, clientY: 100 }]
            });
            Object.defineProperty(touchEvent, 'target', { value: button1 });

            // Mouse event
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: 200,
                clientY: 200
            });
            Object.defineProperty(mouseEvent, 'target', { value: button2 });

            await chordWheel.handleTouchStart(touchEvent, 0);
            await chordWheel.handleMouseInteraction(mouseEvent, 1);

            // Should handle both interaction types
            expect(chordWheel.activeTouches.size).toBe(1); // Touch tracking
            expect(chordWheel.activeChords.size).toBe(2); // Both chords active
        });

        test('should limit simultaneous chords for performance', async () => {
            chordWheel.maxSimultaneousChords = 2;

            const buttons = chordWheel.shadowRoot.querySelectorAll('.chord-button');

            // Try to trigger more chords than the limit
            for (let i = 0; i < 4; i++) {
                const touchEvent = new TouchEvent('touchstart', {
                    touches: [{ identifier: i, clientX: 100 + i * 10, clientY: 100 }]
                });
                Object.defineProperty(touchEvent, 'target', { value: buttons[i] });

                await chordWheel.handleTouchStart(touchEvent, i);
            }

            // Should not exceed the maximum
            expect(chordWheel.activeTouches.size).toBeLessThanOrEqual(chordWheel.maxSimultaneousChords);
        });
    });

    describe('Performance and Memory Management', () => {
        test('should clean up event listeners on disconnect', () => {
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

            chordWheel.disconnectedCallback();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('key-changed', chordWheel.boundHandleSongKeyChange);
            expect(removeEventListenerSpy).toHaveBeenCalledWith('key-set', chordWheel.boundHandleSongKeySet);
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', chordWheel.boundHandleKeydown);
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', chordWheel.boundHandleKeyup);
        });

        test('should dispose audio effects on cleanup', () => {
            const mockEffect = { dispose: jest.fn() };
            chordWheel.audioEffects = { reverb: mockEffect, delay: mockEffect };

            chordWheel.cleanup();

            expect(mockEffect.dispose).toHaveBeenCalledTimes(2);
        });

        test('should stop level monitoring on disconnect', () => {
            const stopLevelMonitoringSpy = jest.spyOn(chordWheel, 'stopLevelMonitoring');

            chordWheel.disconnectedCallback();

            expect(stopLevelMonitoringSpy).toHaveBeenCalled();
        });

        test('should clear intervals on level monitoring stop', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

            chordWheel.startLevelMonitoring();
            const intervalId = chordWheel.levelMonitoringInterval;

            chordWheel.stopLevelMonitoring();

            expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
            expect(chordWheel.levelMonitoringInterval).toBeNull();
        });
    });

    describe('Error Recovery and Resilience', () => {
        test('should handle missing mixer gracefully', () => {
            // Remove mock mixer
            mockMixer.remove();

            // Should not throw error when trying to register
            expect(() => {
                chordWheel.registerWithMixer();
            }).not.toThrow();
        });

        test('should handle Tone.js not being available', () => {
            // Temporarily disable Tone.js
            const originalTone = global.Tone;
            delete global.Tone;

            const newChordWheel = new ChordWheel();

            // Should create fallback synth
            expect(newChordWheel.synth).toBeDefined();
            expect(typeof newChordWheel.synth.triggerAttackRelease).toBe('function');

            // Restore Tone.js
            global.Tone = originalTone;

            // Cleanup
            newChordWheel.remove();
        });

        test('should recover from audio context errors', async () => {
            // Mock audio context failure
            global.Tone.context.state = 'suspended';
            global.Tone.start = jest.fn(() => Promise.reject(new Error('Audio context error')));

            const result = await chordWheel.ensureAudioContextRunning();

            expect(result).toBe(false);
            expect(chordWheel.updateAudioStatusIndicator).toBeDefined();
        });

        test('should handle chord generation errors gracefully', () => {
            // Force an error in chord generation
            const originalGetChordNotes = chordWheel.getChordNotes;
            chordWheel.getChordNotes = jest.fn(() => {
                throw new Error('Chord generation error');
            });

            // Should not crash when generating chords
            expect(() => {
                chordWheel.generateChordsForMode();
            }).not.toThrow();

            // Restore original method
            chordWheel.getChordNotes = originalGetChordNotes;
        });
    });

    describe('Accessibility Integration', () => {
        test('should work with screen readers', () => {
            const buttons = chordWheel.shadowRoot.querySelectorAll('.chord-button');

            buttons.forEach((button, index) => {
                expect(button.getAttribute('aria-label')).toContain('Play');
                expect(button.getAttribute('role')).toBe('button');
                expect(button.getAttribute('tabindex')).toBe('0');
            });
        });

        test('should support keyboard navigation', () => {
            const buttons = chordWheel.shadowRoot.querySelectorAll('.chord-button');
            const firstButton = buttons[0];

            // Focus first button
            firstButton.focus();
            expect(document.activeElement).toBe(firstButton);

            // Should be able to activate with Enter key
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            Object.defineProperty(enterEvent, 'target', { value: firstButton });

            const chordPlayedSpy = jest.fn();
            chordWheel.addEventListener('chord-played', chordPlayedSpy);

            chordWheel.handleKeyboardInteraction(enterEvent, 0);

            expect(chordPlayedSpy).toHaveBeenCalled();
            expect(firstButton.getAttribute('aria-pressed')).toBe('true');
        });

        test('should announce state changes', () => {
            // Change key
            chordWheel.changeKey('F', 'minor');

            const keyIndicator = chordWheel.shadowRoot.querySelector('.key-indicator');
            expect(keyIndicator.textContent).toContain('F minor');
        });
    });

    describe('Mobile and Touch Device Integration', () => {
        test('should handle touch events properly on mobile', async () => {
            // Simulate mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 400
            });

            const button = chordWheel.shadowRoot.querySelector('.chord-button');
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
                bubbles: true
            });

            Object.defineProperty(touchEvent, 'target', { value: button });

            // Should prevent default to avoid scrolling
            const preventDefaultSpy = jest.spyOn(touchEvent, 'preventDefault');

            await chordWheel.handleTouchStart(touchEvent, 0);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        test('should scale properly on different screen sizes', () => {
            chordWheel.setAttribute('size', 'small');

            const chordWheelElement = chordWheel.shadowRoot.querySelector('.chord-wheel');
            expect(chordWheelElement.classList.contains('small')).toBe(true);

            // Check that styles are applied for mobile
            const styles = window.getComputedStyle ? window.getComputedStyle(chordWheelElement) : {};
            // Styles would be applied by CSS media queries in real usage
        });
    });
});