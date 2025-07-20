import HandPanWrapper from '../components/hand-pan-wrapper/hand-pan-wrapper.js';

describe('HandPan Default Values', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = new HandPanWrapper();
        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        if (wrapper && wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
    });

    test('should have correct default reverb values', () => {
        expect(wrapper.audioEffects.reverb.decay).toBe(1.4);
        expect(wrapper.audioEffects.reverb.wet).toBe(0.8);
        expect(wrapper.audioEffects.reverb.preDelay).toBe(0.04);
    });

    test('should have correct default chorus values', () => {
        expect(wrapper.audioEffects.chorus.frequency).toBe(3.5);
        expect(wrapper.audioEffects.chorus.depth).toBe(0.35);
        expect(wrapper.audioEffects.chorus.wet).toBe(0.7);
    });

    test('should have correct default delay values', () => {
        expect(wrapper.audioEffects.delay.delayTime).toBe(0.175);
        expect(wrapper.audioEffects.delay.feedback).toBe(0.2);
        expect(wrapper.audioEffects.delay.wet).toBe(0.85);
    });

    test('should have correct default synth values', () => {
        expect(wrapper.audioEffects.synth.attack).toBe(0.062);
        expect(wrapper.audioEffects.synth.decay).toBe(0.26);
        expect(wrapper.audioEffects.synth.sustain).toBe(0.7);
        expect(wrapper.audioEffects.synth.release).toBe(0.3);
    });

    test('should reset to correct default values', () => {
        // Change some values
        wrapper.audioEffects.reverb.decay = 0.5;
        wrapper.audioEffects.chorus.frequency = 1.0;
        
        // Reset
        wrapper.resetEffects();
        
        // Check that they're back to defaults
        expect(wrapper.audioEffects.reverb.decay).toBe(1.4);
        expect(wrapper.audioEffects.chorus.frequency).toBe(3.5);
    });
});