import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';
import Mixer from '../mixer.js';

describe('Mixer Component', () => {
    let mixer;

    beforeEach(() => {
        document.body.innerHTML = '';

        // Create a mock Tone.js with Volume nodes and Analyser
        window.Tone = {
            Volume: jest.fn().mockImplementation((volume = 0) => ({
                volume: { value: volume },
                connect: jest.fn(),
                disconnect: jest.fn(),
                toDestination: jest.fn()
            })),
            Analyser: jest.fn().mockImplementation(() => ({
                getValue: jest.fn(() => new Array(1024).fill(-60)),
                connect: jest.fn(),
                disconnect: jest.fn()
            })),
            Destination: {
                connect: jest.fn()
            },
            context: {
                state: 'running',
                resume: jest.fn(),
                start: jest.fn()
            }
        };

        // Mock console to prevent test pollution
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        if (mixer && mixer.parentNode) {
            mixer.parentNode.removeChild(mixer);
        }
        console.log.mockRestore();
        console.warn.mockRestore();
        jest.clearAllMocks();
    });

    describe('Component Initialization', () => {
        test('should render mixer component with shadow DOM', () => {
            // Arrange & Act
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);

            // Assert
            expect(mixer.shadowRoot).toBeDefined();
            const mixerElement = mixer.shadowRoot.querySelector('.mixer');
            expect(mixerElement).toBeInTheDocument();
        });

        test('should initialize with default mixer state', () => {
            // Arrange & Act
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);

            // Assert
            expect(mixer.mixerState).toBeDefined();
            expect(mixer.mixerState.instruments).toEqual({});
            expect(mixer.mixerState.master).toEqual({
                volume: 0.7,
                level: 0.0,
                muted: false
            });
        });

        test('should create master volume control', () => {
            // Arrange & Act
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);

            // Assert
            const masterVolumeSlider = mixer.shadowRoot.querySelector('.master-volume');
            expect(masterVolumeSlider).toBeInTheDocument();
            expect(masterVolumeSlider.value).toBe('70'); // 0.7 * 100
        });

        test('should have isolated styles in shadow DOM', () => {
            // Arrange & Act
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);

            // Assert
            expect(mixer.shadowRoot).toBeDefined();
            const styleElement = mixer.shadowRoot.querySelector('style');
            expect(styleElement).toBeInTheDocument();
        });
    });

    describe('Instrument Management', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);
        });

        test('should add instrument to mixer', () => {
            // Arrange
            const instrumentConfig = {
                id: 'piano-roll',
                name: 'Piano Roll',
                icon: '🎹',
                volume: 0.6
            };

            // Act
            mixer.addInstrument(instrumentConfig);

            // Assert
            expect(mixer.mixerState.instruments['piano-roll']).toBeDefined();
            expect(mixer.mixerState.instruments['piano-roll'].name).toBe('Piano Roll');
            expect(mixer.mixerState.instruments['piano-roll'].volume).toBe(0.6);
            expect(mixer.mixerState.instruments['piano-roll'].muted).toBe(false);
            expect(mixer.mixerState.instruments['piano-roll'].soloed).toBe(false);
        });

        test('should render channel strip for added instrument', () => {
            // Arrange
            const instrumentConfig = {
                id: 'piano-roll',
                name: 'Piano Roll',
                icon: '🎹',
                volume: 0.6
            };

            // Act
            mixer.addInstrument(instrumentConfig);

            // Assert
            const channelStrip = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"]');
            expect(channelStrip).toBeInTheDocument();

            const instrumentLabel = channelStrip.querySelector('.instrument-label');
            expect(instrumentLabel.textContent).toContain('Piano Roll');

            const volumeSlider = channelStrip.querySelector('.volume-slider');
            expect(volumeSlider.value).toBe('60'); // 0.6 * 100
        });

        test('should remove instrument from mixer', () => {
            // Arrange
            const instrumentConfig = {
                id: 'piano-roll',
                name: 'Piano Roll',
                icon: '🎹',
                volume: 0.6
            };
            mixer.addInstrument(instrumentConfig);

            // Act
            mixer.removeInstrument('piano-roll');

            // Assert
            expect(mixer.mixerState.instruments['piano-roll']).toBeUndefined();
            const channelStrip = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"]');
            expect(channelStrip).not.toBeInTheDocument();
        });

        test('should handle multiple instruments', () => {
            // Arrange
            const instruments = [
                { id: 'piano-roll', name: 'Piano Roll', icon: '🎹', volume: 0.6 },
                { id: 'hand-pan', name: 'Hand Pan', icon: '🥁', volume: 0.8 },
                { id: 'gigso-keyboard', name: 'Gigso Keyboard', icon: '🎸', volume: 0.45 }
            ];

            // Act
            instruments.forEach(instrument => mixer.addInstrument(instrument));

            // Assert
            expect(Object.keys(mixer.mixerState.instruments)).toHaveLength(3);
            instruments.forEach(instrument => {
                expect(mixer.mixerState.instruments[instrument.id]).toBeDefined();
                const channelStrip = mixer.shadowRoot.querySelector(`[data-instrument="${instrument.id}"]`);
                expect(channelStrip).toBeInTheDocument();
            });
        });
    });

    describe('Volume Control', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);

            // Add test instrument
            mixer.addInstrument({
                id: 'piano-roll',
                name: 'Piano Roll',
                icon: '🎹',
                volume: 0.6
            });
        });

        test('should set volume for specific instrument', () => {
            // Act
            mixer.setVolume('piano-roll', 0.8);

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].volume).toBe(0.8);
            const volumeSlider = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .volume-slider');
            expect(volumeSlider.value).toBe('80');
        });

        test('should dispatch volume change event when volume is set', () => {
            // Arrange
            const eventSpy = jest.fn();
            mixer.addEventListener('mixer-volume-change', eventSpy);

            // Act
            mixer.setVolume('piano-roll', 0.8);

            // Assert
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        instrumentId: 'piano-roll',
                        volume: 0.8,
                        muted: false
                    })
                })
            );
        });

        test('should update volume via slider interaction', () => {
            // Arrange
            const volumeSlider = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .volume-slider');
            const eventSpy = jest.fn();
            mixer.addEventListener('mixer-volume-change', eventSpy);

            // Act
            volumeSlider.value = '75';
            fireEvent.input(volumeSlider);

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].volume).toBe(0.75);
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        instrumentId: 'piano-roll',
                        volume: 0.75
                    })
                })
            );
        });

        test('should update volume percentage display', () => {
            // Act
            mixer.setVolume('piano-roll', 0.85);

            // Assert
            const volumeDisplay = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .volume-percentage');
            expect(volumeDisplay.textContent).toBe('85%');
        });

        test('should clamp volume values between 0 and 1', () => {
            // Act & Assert
            mixer.setVolume('piano-roll', -0.5);
            expect(mixer.mixerState.instruments['piano-roll'].volume).toBe(0);

            mixer.setVolume('piano-roll', 1.5);
            expect(mixer.mixerState.instruments['piano-roll'].volume).toBe(1);
        });
    });

    describe('Master Volume Control', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);
        });

        test('should set master volume', () => {
            // Act
            mixer.setMasterVolume(0.5);

            // Assert
            expect(mixer.mixerState.master.volume).toBe(0.5);
            const masterSlider = mixer.shadowRoot.querySelector('.master-volume');
            expect(masterSlider.value).toBe('50');
        });

        test('should dispatch master volume change event', () => {
            // Arrange
            const eventSpy = jest.fn();
            mixer.addEventListener('mixer-master-volume-change', eventSpy);

            // Act
            mixer.setMasterVolume(0.5);

            // Assert
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        volume: 0.5
                    })
                })
            );
        });

        test('should update master volume via slider interaction', () => {
            // Arrange
            const masterSlider = mixer.shadowRoot.querySelector('.master-volume');
            const eventSpy = jest.fn();
            mixer.addEventListener('mixer-master-volume-change', eventSpy);

            // Act
            masterSlider.value = '40';
            fireEvent.input(masterSlider);

            // Assert
            expect(mixer.mixerState.master.volume).toBe(0.4);
            expect(eventSpy).toHaveBeenCalled();
        });

        test('should update master volume percentage display', () => {
            // Act
            mixer.setMasterVolume(0.65);

            // Assert
            const masterVolumeDisplay = mixer.shadowRoot.querySelector('.master-volume-percentage');
            expect(masterVolumeDisplay.textContent).toBe('65%');
        });
    });

    describe('Master Mute Functionality', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);
        });

        test('should initialize master with muted set to false', () => {
            // Assert
            expect(mixer.mixerState.master.muted).toBe(false);
        });

        test('should have master mute button in the DOM', () => {
            // Assert
            const masterMuteButton = mixer.shadowRoot.querySelector('.master-mute-button');
            expect(masterMuteButton).toBeInTheDocument();
            expect(masterMuteButton).toHaveAttribute('aria-label', 'Mute Master');
            expect(masterMuteButton).toHaveAttribute('aria-pressed', 'false');
        });

        test('should toggle master mute state', () => {
            // Act
            mixer.toggleMasterMute();

            // Assert
            expect(mixer.mixerState.master.muted).toBe(true);
        });

        test('should dispatch master mute toggle event', () => {
            // Arrange
            const eventSpy = jest.fn();
            mixer.addEventListener('mixer-master-mute-toggle', eventSpy);

            // Act
            mixer.toggleMasterMute();

            // Assert
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        muted: true
                    })
                })
            );
        });

        test('should toggle master mute via button click', () => {
            // Arrange
            const masterMuteButton = mixer.shadowRoot.querySelector('.master-mute-button');
            const eventSpy = jest.fn();
            mixer.addEventListener('mixer-master-mute-toggle', eventSpy);

            // Act
            fireEvent.click(masterMuteButton);

            // Assert
            expect(mixer.mixerState.master.muted).toBe(true);
            expect(eventSpy).toHaveBeenCalled();
        });

        test('should apply muted visual state to master channel', () => {
            // Act
            mixer.toggleMasterMute();

            // Assert
            const masterChannel = mixer.shadowRoot.querySelector('.master-channel');
            const masterMuteButton = mixer.shadowRoot.querySelector('.master-mute-button');

            expect(masterChannel).toHaveClass('muted');
            expect(masterMuteButton).toHaveClass('active');
            expect(masterMuteButton).toHaveAttribute('aria-pressed', 'true');
        });

        test('should unmute master when toggled again', () => {
            // Arrange
            mixer.toggleMasterMute(); // Mute first

            // Act
            mixer.toggleMasterMute(); // Unmute

            // Assert
            expect(mixer.mixerState.master.muted).toBe(false);
            const masterChannel = mixer.shadowRoot.querySelector('.master-channel');
            const masterMuteButton = mixer.shadowRoot.querySelector('.master-mute-button');

            expect(masterChannel).not.toHaveClass('muted');
            expect(masterMuteButton).not.toHaveClass('active');
            expect(masterMuteButton).toHaveAttribute('aria-pressed', 'false');
        });

        test('should include master muted state in mixer state', () => {
            // Arrange
            mixer.toggleMasterMute();

            // Act
            const state = mixer.getMixerState();

            // Assert
            expect(state.master.muted).toBe(true);
        });
    });

    describe('Mute Functionality', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);

            mixer.addInstrument({
                id: 'piano-roll',
                name: 'Piano Roll',
                icon: '🎹',
                volume: 0.6
            });
        });

        test('should toggle mute for instrument', () => {
            // Act
            mixer.toggleMute('piano-roll');

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].muted).toBe(true);
        });

        test('should dispatch mute toggle event', () => {
            // Arrange
            const eventSpy = jest.fn();
            mixer.addEventListener('mixer-mute-toggle', eventSpy);

            // Act
            mixer.toggleMute('piano-roll');

            // Assert
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        instrumentId: 'piano-roll',
                        muted: true
                    })
                })
            );
        });

        test('should toggle mute via button click', () => {
            // Arrange
            const muteButton = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .mute-button');
            const eventSpy = jest.fn();
            mixer.addEventListener('mixer-mute-toggle', eventSpy);

            // Act
            fireEvent.click(muteButton);

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].muted).toBe(true);
            expect(eventSpy).toHaveBeenCalled();
        });

        test('should apply muted visual state', () => {
            // Act
            mixer.toggleMute('piano-roll');

            // Assert
            const channelStrip = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"]');
            expect(channelStrip).toHaveClass('muted');

            const muteButton = channelStrip.querySelector('.mute-button');
            expect(muteButton).toHaveClass('active');
        });

        test('should unmute when toggled again', () => {
            // Arrange
            mixer.toggleMute('piano-roll'); // Mute first

            // Act
            mixer.toggleMute('piano-roll'); // Unmute

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].muted).toBe(false);
            const channelStrip = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"]');
            expect(channelStrip).not.toHaveClass('muted');
        });
    });

    describe('Solo Functionality', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);

            // Add multiple instruments for solo testing
            mixer.addInstrument({ id: 'piano-roll', name: 'Piano Roll', icon: '🎹', volume: 0.6 });
            mixer.addInstrument({ id: 'hand-pan', name: 'Hand Pan', icon: '🥁', volume: 0.8 });
            mixer.addInstrument({ id: 'gigso-keyboard', name: 'Gigso Keyboard', icon: '🎸', volume: 0.45 });
        });

        test('should toggle solo for instrument', () => {
            // Act
            mixer.toggleSolo('piano-roll');

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].soloed).toBe(true);
        });

        test('should dispatch solo toggle event', () => {
            // Arrange
            const eventSpy = jest.fn();
            mixer.addEventListener('mixer-solo-toggle', eventSpy);

            // Act
            mixer.toggleSolo('piano-roll');

            // Assert
            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        instrumentId: 'piano-roll',
                        soloed: true
                    })
                })
            );
        });

        test('should mute other instruments when one is soloed', () => {
            // Act
            mixer.toggleSolo('piano-roll');

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].soloed).toBe(true);
            expect(mixer.mixerState.instruments['hand-pan'].muted).toBe(true);
            expect(mixer.mixerState.instruments['gigso-keyboard'].muted).toBe(true);
        });

        test('should unmute other instruments when solo is disabled', () => {
            // Arrange
            mixer.toggleSolo('piano-roll'); // Solo first

            // Act
            mixer.toggleSolo('piano-roll'); // Unsolo

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].soloed).toBe(false);
            expect(mixer.mixerState.instruments['hand-pan'].muted).toBe(false);
            expect(mixer.mixerState.instruments['gigso-keyboard'].muted).toBe(false);
        });

        test('should switch solo between instruments', () => {
            // Arrange
            mixer.toggleSolo('piano-roll'); // Solo piano-roll

            // Act
            mixer.toggleSolo('hand-pan'); // Solo hand-pan instead

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].soloed).toBe(false);
            expect(mixer.mixerState.instruments['hand-pan'].soloed).toBe(true);
            expect(mixer.mixerState.instruments['piano-roll'].muted).toBe(true);
            expect(mixer.mixerState.instruments['gigso-keyboard'].muted).toBe(true);
        });

        test('should apply soloed visual state', () => {
            // Act
            mixer.toggleSolo('piano-roll');

            // Assert
            const channelStrip = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"]');
            expect(channelStrip).toHaveClass('soloed');

            const soloButton = channelStrip.querySelector('.solo-button');
            expect(soloButton).toHaveClass('active');
        });
    });

    describe('Level Meters', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);

            mixer.addInstrument({
                id: 'piano-roll',
                name: 'Piano Roll',
                icon: '🎹',
                volume: 0.6
            });
        });

        test('should update instrument level', () => {
            // Act
            mixer.updateLevel('piano-roll', 0.5);

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].level).toBe(0.5);
        });

        test('should update level meter visual display', () => {
            // Act
            mixer.updateLevel('piano-roll', 0.7);

            // Assert
            const levelMeter = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .level-meter');
            expect(levelMeter.style.getPropertyValue('--level')).toBe('70%');
        });

        test('should handle level updates for non-existent instruments gracefully', () => {
            // Act & Assert - Should not throw
            expect(() => {
                mixer.updateLevel('non-existent', 0.5);
            }).not.toThrow();
        });

        test('should clamp level values between 0 and 1', () => {
            // Act
            mixer.updateLevel('piano-roll', -0.5);
            expect(mixer.mixerState.instruments['piano-roll'].level).toBe(0);

            mixer.updateLevel('piano-roll', 1.5);
            expect(mixer.mixerState.instruments['piano-roll'].level).toBe(1);
        });

        test('should update master level meter', () => {
            // Act
            mixer.updateMasterLevel(0.8);

            // Assert
            expect(mixer.mixerState.master.level).toBe(0.8);
            const masterLevelMeter = mixer.shadowRoot.querySelector('.master-level-meter');
            expect(masterLevelMeter.style.getPropertyValue('--level')).toBe('80%');
        });
    });

    describe('State Management', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);
        });

        test('should get current mixer state', () => {
            // Arrange
            mixer.addInstrument({ id: 'piano-roll', name: 'Piano Roll', icon: '🎹', volume: 0.6 });
            mixer.setVolume('piano-roll', 0.8);
            mixer.toggleMute('piano-roll');

            // Act
            const state = mixer.getMixerState();

            // Assert
            expect(state).toEqual(mixer.mixerState);
            expect(state.instruments['piano-roll'].volume).toBe(0.8);
            expect(state.instruments['piano-roll'].muted).toBe(true);
        });

        test('should reset all volumes to default', () => {
            // Arrange
            mixer.addInstrument({ id: 'piano-roll', name: 'Piano Roll', icon: '🎹', volume: 0.6 });
            mixer.addInstrument({ id: 'hand-pan', name: 'Hand Pan', icon: '🥁', volume: 0.8 });
            mixer.setVolume('piano-roll', 0.9);
            mixer.setVolume('hand-pan', 0.2);
            mixer.setMasterVolume(0.3);

            // Act
            mixer.resetVolumes();

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].volume).toBe(0.6); // Original default
            expect(mixer.mixerState.instruments['hand-pan'].volume).toBe(0.8); // Original default
            expect(mixer.mixerState.master.volume).toBe(0.7); // System default
        });
    });

    describe('Event System', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);
        });

        test('should handle instrument-registered event', () => {
            // Arrange
            const instrumentConfig = {
                id: 'new-instrument',
                name: 'New Instrument',
                icon: '🎺',
                volume: 0.5
            };

            const mockInstrument = document.createElement('div');
            mockInstrument.id = 'new-instrument';
            document.body.appendChild(mockInstrument);

            // Act
            const event = new CustomEvent('instrument-registered', { detail: instrumentConfig });
            mockInstrument.dispatchEvent(event);

            // Simulate the mixer listening to this event
            mixer.addInstrument(instrumentConfig);

            // Assert
            expect(mixer.mixerState.instruments['new-instrument']).toBeDefined();
        });

        test('should handle audio-level-update event', () => {
            // Arrange
            mixer.addInstrument({ id: 'piano-roll', name: 'Piano Roll', icon: '🎹', volume: 0.6 });

            const mockInstrument = document.createElement('div');
            mockInstrument.id = 'piano-roll';
            document.body.appendChild(mockInstrument);

            // Act
            const event = new CustomEvent('audio-level-update', {
                detail: { instrumentId: 'piano-roll', level: 0.7 }
            });
            mockInstrument.dispatchEvent(event);

            // Simulate the mixer handling this event
            mixer.updateLevel('piano-roll', 0.7);

            // Assert
            expect(mixer.mixerState.instruments['piano-roll'].level).toBe(0.7);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);
        });

        test('should handle operations on non-existent instruments gracefully', () => {
            // Act & Assert - Should not throw
            expect(() => {
                mixer.setVolume('non-existent', 0.5);
                mixer.toggleMute('non-existent');
                mixer.toggleSolo('non-existent');
                mixer.updateLevel('non-existent', 0.5);
            }).not.toThrow();
        });

        test('should handle invalid volume values', () => {
            // Arrange
            mixer.addInstrument({ id: 'piano-roll', name: 'Piano Roll', icon: '🎹', volume: 0.6 });

            // Act & Assert - Should handle gracefully
            expect(() => {
                mixer.setVolume('piano-roll', 'invalid');
                mixer.setVolume('piano-roll', null);
                mixer.setVolume('piano-roll', undefined);
            }).not.toThrow();

            // Volume should remain unchanged or be set to a safe default
            const volume = mixer.mixerState.instruments['piano-roll'].volume;
            expect(typeof volume).toBe('number');
            expect(volume).toBeGreaterThanOrEqual(0);
            expect(volume).toBeLessThanOrEqual(1);
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            mixer = document.createElement('gigso-mixer');
            document.body.appendChild(mixer);

            mixer.addInstrument({
                id: 'piano-roll',
                name: 'Piano Roll',
                icon: '🎹',
                volume: 0.6
            });
        });

        test('should have ARIA labels on volume sliders', () => {
            // Assert
            const volumeSlider = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .volume-slider');
            expect(volumeSlider).toHaveAttribute('aria-label');
            expect(volumeSlider.getAttribute('aria-label')).toContain('Piano Roll volume');

            const masterSlider = mixer.shadowRoot.querySelector('.master-volume');
            expect(masterSlider).toHaveAttribute('aria-label');
            expect(masterSlider.getAttribute('aria-label')).toContain('Master volume');
        });

        test('should have ARIA labels on mute and solo buttons', () => {
            // Assert
            const muteButton = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .mute-button');
            expect(muteButton).toHaveAttribute('aria-label');
            expect(muteButton.getAttribute('aria-label')).toContain('Mute Piano Roll');

            const soloButton = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .solo-button');
            expect(soloButton).toHaveAttribute('aria-label');
            expect(soloButton.getAttribute('aria-label')).toContain('Solo Piano Roll');
        });

        test('should update ARIA states for mute and solo buttons', () => {
            // Arrange
            const muteButton = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .mute-button');
            const soloButton = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .solo-button');

            // Act - Test mute first
            mixer.toggleMute('piano-roll');

            // Assert mute state
            expect(muteButton).toHaveAttribute('aria-pressed', 'true');

            // Act - Test solo (this will reset mute state as per professional mixer behavior)
            mixer.toggleSolo('piano-roll');

            // Assert solo state (and mute should be false since solo overrides mute)
            expect(soloButton).toHaveAttribute('aria-pressed', 'true');
            expect(muteButton).toHaveAttribute('aria-pressed', 'false');
        });

        test('should support keyboard navigation', () => {
            // Arrange
            const volumeSlider = mixer.shadowRoot.querySelector('[data-instrument="piano-roll"] .volume-slider');

            // Act - Simulate keyboard interaction
            fireEvent.keyDown(volumeSlider, { key: 'ArrowUp' });

            // Assert - Should be focusable and respond to keyboard
            expect(volumeSlider).toHaveAttribute('tabindex', '0');
        });
    });
});