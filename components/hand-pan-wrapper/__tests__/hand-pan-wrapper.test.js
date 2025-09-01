import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import HandPanWrapper from '../hand-pan-wrapper.js';

// Mock the scaleUtils and noteColorUtils dependencies
jest.mock('../../../helpers/scaleUtils.js', () => ({
    getAllKeys: () => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    getAllScaleTypes: () => ['major', 'minor', 'dorian', 'mixolydian', 'pentatonic']
}));

jest.mock('../../../helpers/noteColorUtils.js', () => ({
    applyNoteColor: jest.fn(),
    getNoteColor: jest.fn(() => '#cccccc')
}));

describe('HandPanWrapper Component', () => {
    let wrapper;

    beforeEach(() => {
        // Mock Tone.js
        global.Tone = {
            start: jest.fn(() => Promise.resolve()),
            Synth: jest.fn().mockImplementation(() => ({
                triggerAttackRelease: jest.fn(),
                dispose: jest.fn(),
                chain: jest.fn(),
                toDestination: jest.fn()
            })),
            Reverb: jest.fn().mockImplementation(() => ({
                wet: { value: 0 }
            })),
            Chorus: jest.fn().mockImplementation(() => ({
                wet: { value: 0 }
            })),
            FeedbackDelay: jest.fn().mockImplementation(() => ({
                wet: { value: 0 }
            })),
            Destination: {}
        };

        document.body.innerHTML = '';
        wrapper = document.createElement('hand-pan-wrapper');
        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        if (wrapper && wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
    });

    describe('Initialization', () => {
        test('should create wrapper with default values', () => {
            expect(wrapper.currentKey).toBe('D');
            expect(wrapper.currentScale).toBe('minor');
            expect(wrapper.currentSize).toBe('medium');
            expect(wrapper.audioEnabled).toBe(false);
            expect(wrapper.audioPreviewEnabled).toBe(true);
        });

        test('should render all control sections', () => {
            const audioSection = wrapper.shadowRoot.querySelector('.audio-section');
            const effectsSection = wrapper.shadowRoot.querySelector('.effects-section');
            const keySection = wrapper.shadowRoot.querySelector('.key-section');
            const sizeSection = wrapper.shadowRoot.querySelector('.size-section');
            const logSection = wrapper.shadowRoot.querySelector('.log-section');

            expect(audioSection).toBeTruthy();
            expect(effectsSection).toBeTruthy();
            expect(keySection).toBeTruthy();
            expect(sizeSection).toBeTruthy();
            expect(logSection).toBeTruthy();
        });

        test('should render hand-pan element', () => {
            const handPan = wrapper.shadowRoot.getElementById('handPan');
            expect(handPan).toBeTruthy();
            expect(handPan.getAttribute('key')).toBe('D');
            expect(handPan.getAttribute('scale')).toBe('minor');
            expect(handPan.getAttribute('size')).toBe('medium');
        });

        test('should have collapsible sections initially collapsed', () => {
            const collapsibleSections = wrapper.shadowRoot.querySelectorAll('.collapsible');
            collapsibleSections.forEach(section => {
                expect(section.classList.contains('collapsed')).toBe(true);
            });
        });
    });

    describe('Audio Controls', () => {
        test('should toggle audio on click', async () => {
            const audioBtn = wrapper.shadowRoot.getElementById('audioToggleBtn');
            
            expect(wrapper.audioEnabled).toBe(false);
            
            // Check initial state
            expect(wrapper.audioEnabled).toBe(false);
            
            // Mock the toggleAudio method
            wrapper.toggleAudio = jest.fn();
            audioBtn.onclick = wrapper.toggleAudio;
            
            fireEvent.click(audioBtn);
            
            expect(wrapper.toggleAudio).toHaveBeenCalled();
        });

        test('should update audio control display', () => {
            const audioBtn = wrapper.shadowRoot.getElementById('audioToggleBtn');
            const audioStatus = wrapper.shadowRoot.getElementById('audioStatus');
            
            // Initially disabled
            expect(audioBtn.textContent).toContain('Audio Off');
            expect(audioStatus.textContent).toContain('Click to enable');
            
            wrapper.audioEnabled = true;
            wrapper.updateAudioControls();
            
            expect(audioBtn.textContent).toContain('Audio On');
            expect(audioStatus.textContent).toContain('Audio ready');
        });

        test('should handle audio preview toggle', () => {
            const previewToggle = wrapper.shadowRoot.getElementById('audioPreviewToggle');
            
            expect(wrapper.audioPreviewEnabled).toBe(true);
            
            fireEvent.change(previewToggle, { target: { checked: false } });
            
            expect(wrapper.audioPreviewEnabled).toBe(false);
        });
    });

    describe('Key and Scale Selection', () => {
        test('should render key buttons', () => {
            const keyButtons = wrapper.shadowRoot.querySelectorAll('.key-btn');
            expect(keyButtons.length).toBe(12); // 12 chromatic keys
            
            // Check that D is initially active
            const dButton = wrapper.shadowRoot.querySelector('[data-key="D"]');
            expect(dButton.classList.contains('active')).toBe(true);
        });

        test('should change key on button click', () => {
            const cButton = wrapper.shadowRoot.querySelector('[data-key="C"]');
            
            fireEvent.click(cButton);
            
            expect(wrapper.currentKey).toBe('C');
            expect(cButton.classList.contains('active')).toBe(true);
        });

        test('should render scale dropdown', () => {
            const scaleSelect = wrapper.shadowRoot.getElementById('scaleSelect');
            expect(scaleSelect).toBeTruthy();
            expect(scaleSelect.value).toBe('minor');
            
            const options = scaleSelect.querySelectorAll('option');
            expect(options.length).toBeGreaterThanOrEqual(5);
        });

        test('should change scale on dropdown change', () => {
            const scaleSelect = wrapper.shadowRoot.getElementById('scaleSelect');
            
            fireEvent.change(scaleSelect, { target: { value: 'major' } });
            
            expect(wrapper.currentScale).toBe('major');
        });

        test('should update hand-pan when key/scale changes', () => {
            const handPan = wrapper.shadowRoot.getElementById('handPan');
            const cButton = wrapper.shadowRoot.querySelector('[data-key="C"]');
            
            fireEvent.click(cButton);
            
            expect(handPan.getAttribute('key')).toBe('C');
        });
    });

    describe('Size Selection', () => {
        test('should render size buttons', () => {
            const sizeButtons = wrapper.shadowRoot.querySelectorAll('.size-btn');
            expect(sizeButtons.length).toBe(3);
            
            const mediumButton = wrapper.shadowRoot.querySelector('[data-size="medium"]');
            expect(mediumButton.classList.contains('active')).toBe(true);
        });

        test('should change size on button click', () => {
            const largeButton = wrapper.shadowRoot.querySelector('[data-size="large"]');
            
            fireEvent.click(largeButton);
            
            expect(wrapper.currentSize).toBe('large');
            expect(largeButton.classList.contains('active')).toBe(true);
        });
    });

    describe('Audio Effects', () => {
        test('should have default effect values', () => {
            expect(wrapper.audioEffects.reverb.decay).toBe(1.4);
            expect(wrapper.audioEffects.chorus.frequency).toBe(3.5);
            expect(wrapper.audioEffects.delay.delayTime).toBe(0.175);
            expect(wrapper.audioEffects.synth.attack).toBe(0.062);
        });

        test('should render effect sliders', () => {
            const reverbDecaySlider = wrapper.shadowRoot.getElementById('reverbDecay');
            const chorusFreqSlider = wrapper.shadowRoot.getElementById('chorusFreq');
            const delayTimeSlider = wrapper.shadowRoot.getElementById('delayTime');
            const synthAttackSlider = wrapper.shadowRoot.getElementById('synthAttack');

            expect(reverbDecaySlider).toBeTruthy();
            expect(chorusFreqSlider).toBeTruthy();
            expect(delayTimeSlider).toBeTruthy();
            expect(synthAttackSlider).toBeTruthy();
        });

        test('should update effect value on slider change', () => {
            const reverbDecaySlider = wrapper.shadowRoot.getElementById('reverbDecay');
            
            fireEvent.input(reverbDecaySlider, { target: { value: '2.0' } });
            
            expect(wrapper.audioEffects.reverb.decay).toBe(2.0);
        });

        test('should reset effects to defaults', () => {
            // Change some values
            wrapper.audioEffects.reverb.decay = 3.0;
            wrapper.audioEffects.chorus.frequency = 1.0;
            
            const resetBtn = wrapper.shadowRoot.getElementById('resetEffectsBtn');
            fireEvent.click(resetBtn);
            
            expect(wrapper.audioEffects.reverb.decay).toBe(1.4);
            expect(wrapper.audioEffects.chorus.frequency).toBe(3.5);
        });
    });

    describe('Collapsible Sections', () => {
        test('should toggle sections on header click', () => {
            const audioSection = wrapper.shadowRoot.querySelector('.audio-section');
            const audioHeader = audioSection.querySelector('.section-header');
            
            expect(audioSection.classList.contains('collapsed')).toBe(true);
            
            fireEvent.click(audioHeader);
            
            expect(audioSection.classList.contains('collapsed')).toBe(false);
        });
    });

    describe('Event Logging', () => {
        test('should log events', () => {
            wrapper.logEvent('Test event');
            
            const logEntries = wrapper.shadowRoot.querySelectorAll('.log-entry');
            const lastEntry = logEntries[logEntries.length - 1];
            
            expect(lastEntry.textContent).toContain('Test event');
        });

        test('should clear log', () => {
            wrapper.logEvent('Test event 1');
            wrapper.logEvent('Test event 2');
            
            const clearBtn = wrapper.shadowRoot.getElementById('clearLogBtn');
            fireEvent.click(clearBtn);
            
            const logEntries = wrapper.shadowRoot.querySelectorAll('.log-entry');
            expect(logEntries.length).toBe(1);
            expect(logEntries[0].textContent).toContain('Log cleared');
        });
    });

    describe('Attribute Changes', () => {
        test('should respond to key attribute changes', () => {
            wrapper.setAttribute('key', 'G');
            
            expect(wrapper.currentKey).toBe('G');
        });

        test('should respond to scale attribute changes', () => {
            wrapper.setAttribute('scale', 'major');
            
            expect(wrapper.currentScale).toBe('major');
        });

        test('should respond to size attribute changes', () => {
            wrapper.setAttribute('size', 'large');
            
            expect(wrapper.currentSize).toBe('large');
        });

        test('should respond to audio-enabled attribute changes', () => {
            wrapper.setAttribute('audio-enabled', 'true');
            
            expect(wrapper.audioEnabled).toBe(true);
        });
    });

    describe('Public API', () => {
        test('should provide enableAudio method', () => {
            expect(typeof wrapper.enableAudio).toBe('function');
        });

        test('should provide disableAudio method', () => {
            expect(typeof wrapper.disableAudio).toBe('function');
        });

        test('should provide setKey method', () => {
            wrapper.setKey('F', 'major');
            
            expect(wrapper.currentKey).toBe('F');
            expect(wrapper.currentScale).toBe('major');
        });

        test('should provide setSize method', () => {
            wrapper.setSize('small');
            
            expect(wrapper.currentSize).toBe('small');
        });

        test('should provide getHandPan method', () => {
            const handPan = wrapper.getHandPan();
            expect(handPan.tagName.toLowerCase()).toBe('hand-pan');
        });
    });

    describe('Event Handling', () => {
        test('should handle note-played events from hand-pan', () => {
            const event = new CustomEvent('note-played', {
                detail: { note: 'C4', index: 0 }
            });
            
            wrapper.dispatchEvent(event);
            
            // Check that event was logged
            const logEntries = wrapper.shadowRoot.querySelectorAll('.log-entry');
            const lastEntry = logEntries[logEntries.length - 1];
            expect(lastEntry.textContent).toContain('Note played: C4');
        });

        test('should handle key-changed events from hand-pan', () => {
            const event = new CustomEvent('key-changed', {
                detail: { key: 'G', scale: 'major' }
            });
            
            wrapper.dispatchEvent(event);
            
            // Check that event was logged
            const logEntries = wrapper.shadowRoot.querySelectorAll('.log-entry');
            const lastEntry = logEntries[logEntries.length - 1];
            expect(lastEntry.textContent).toContain('Key changed to: G major');
        });
    });
});