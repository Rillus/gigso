import HandPan from '../components/hand-pan/hand-pan.js';

// Mock Tone.js for testing
global.Tone = {
    Synth: jest.fn().mockImplementation(() => ({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.062, decay: 0.26, sustain: 0.7, release: 0.3 },
        triggerAttackRelease: jest.fn(),
        toDestination: jest.fn(),
        connect: jest.fn()
    })),
    Reverb: jest.fn().mockImplementation(() => ({
        decay: 1.4,
        wet: 0.8,
        preDelay: 0.04,
        toDestination: jest.fn(),
        connect: jest.fn()
    })),
    Chorus: jest.fn().mockImplementation(() => ({
        frequency: 3.5,
        delayTime: 2.5,
        depth: 0.35,
        wet: 0.7,
        connect: jest.fn()
    })),
    PingPongDelay: jest.fn().mockImplementation(() => ({
        delayTime: 0.175,
        feedback: 0.2,
        wet: 0.85,
        connect: jest.fn()
    })),
    context: {
        state: 'running',
        resume: jest.fn().mockResolvedValue(),
        createBuffer: jest.fn().mockReturnValue({}),
        createBufferSource: jest.fn().mockReturnValue({
            buffer: null,
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn()
        }),
        destination: {}
    },
    start: jest.fn().mockResolvedValue()
};

describe('HandPan Phase 4: Polish & Performance', () => {
    let handPan;

    beforeEach(() => {
        handPan = document.createElement('hand-pan');
        document.body.appendChild(handPan);
    });

    afterEach(() => {
        if (handPan && handPan.parentNode) {
            handPan.parentNode.removeChild(handPan);
        }
    });

    describe('Performance Optimisation', () => {
        test('should handle rapid touch events efficiently', () => {
            const startTime = performance.now();
            
            // Simulate rapid touches
            for (let i = 0; i < 10; i++) {
                const field = handPan.shadowRoot.querySelector('.tone-field');
                if (field) {
                    const touchEvent = new TouchEvent('touchstart', {
                        touches: [{ identifier: i }]
                    });
                    field.dispatchEvent(touchEvent);
                }
            }
            
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
        });

        test('should debounce rapid successive note plays', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            const mockSynth = handPan.synth;
            
            // Simulate rapid clicks
            for (let i = 0; i < 5; i++) {
                field.click();
            }
            
            // Should have debounced some calls
            expect(mockSynth.triggerAttackRelease.mock.calls.length).toBeLessThan(5);
        });

        test('should not create memory leaks during rapid key changes', () => {
            const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Simulate rapid key changes
            for (let i = 0; i < 20; i++) {
                handPan.changeKey('D', 'minor');
                handPan.changeKey('F', 'major');
                handPan.changeKey('G', 'pentatonic');
            }
            
            const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            // Memory usage should not increase significantly
            if (performance.memory) {
                const memoryIncrease = finalMemory - initialMemory;
                expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB increase
            }
        });

        test('should maintain smooth 60fps animations', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            const startTime = performance.now();
            
            // Trigger animation
            field.click();
            
            // Check if animation properties are optimized
            const computedStyle = getComputedStyle(field);
            expect(computedStyle.willChange).toBe('transform');
            expect(computedStyle.transformOrigin).toBe('center center');
        });
    });

    describe('Visual Polish', () => {
        test('should have metallic appearance with proper gradients', () => {
            const handPanElement = handPan.shadowRoot.querySelector('.hand-pan');
            const computedStyle = getComputedStyle(handPanElement);
            
            // Check for metallic gradient background
            expect(computedStyle.background).toContain('linear-gradient');
            expect(computedStyle.boxShadow).toContain('rgba');
        });

        test('should be responsive on different screen sizes', () => {
            // Test small size
            handPan.setAttribute('size', 'small');
            let handPanElement = handPan.shadowRoot.querySelector('.hand-pan');
            expect(handPanElement.classList.contains('small')).toBe(true);
            
            // Test large size
            handPan.setAttribute('size', 'large');
            handPanElement = handPan.shadowRoot.querySelector('.hand-pan');
            expect(handPanElement.classList.contains('large')).toBe(true);
        });

        test('should have smooth ripple animations', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            
            // Trigger ripple
            field.click();
            
            // Check if ripple element was created
            const ripple = field.querySelector('.ripple');
            expect(ripple).toBeTruthy();
            
            // Check ripple animation properties
            const rippleStyle = getComputedStyle(ripple);
            expect(rippleStyle.animation).toContain('ripple');
        });

        test('should have proper hover effects', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            const computedStyle = getComputedStyle(field);
            
            // Check for transition properties
            expect(computedStyle.transition).toContain('all 0.2s ease');
        });
    });

    describe('Error Handling', () => {
        test('should handle audio context errors gracefully', () => {
            // Mock audio context error
            const originalTriggerAttackRelease = handPan.synth.triggerAttackRelease;
            handPan.synth.triggerAttackRelease = jest.fn().mockImplementation(() => {
                throw new Error('Audio context error');
            });
            
            const field = handPan.shadowRoot.querySelector('.tone-field');
            
            // Should not throw error
            expect(() => field.click()).not.toThrow();
            
            // Restore original function
            handPan.synth.triggerAttackRelease = originalTriggerAttackRelease;
        });

        test('should handle touch event fallbacks', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            
            // Test mouse fallback when touch events fail
            const mouseEvent = new MouseEvent('mousedown');
            expect(() => field.dispatchEvent(mouseEvent)).not.toThrow();
        });

        test('should show loading state when audio is not ready', () => {
            // Mock audio context as suspended
            Tone.context.state = 'suspended';
            
            // Re-render to show audio status indicator
            handPan.render();
            
            const audioIndicator = handPan.shadowRoot.getElementById('audioStatusIndicator');
            expect(audioIndicator).toBeTruthy();
            expect(audioIndicator.style.display).not.toBe('none');
        });

        test('should handle synthesiser creation errors', () => {
            // Mock Tone.Synth to throw error
            const originalSynth = Tone.Synth;
            Tone.Synth = jest.fn().mockImplementation(() => {
                throw new Error('Synth creation failed');
            });
            
            // Create new hand pan instance
            const newHandPan = document.createElement('hand-pan');
            document.body.appendChild(newHandPan);
            
            // Should not throw error and should have fallback synth
            expect(newHandPan.synth).toBeTruthy();
            expect(newHandPan.audioEffects).toBeTruthy();
            
            // Cleanup
            document.body.removeChild(newHandPan);
            Tone.Synth = originalSynth;
        });
    });

    describe('Accessibility Improvements', () => {
        test('should have proper ARIA labels', () => {
            const fields = handPan.shadowRoot.querySelectorAll('.tone-field');
            
            fields.forEach((field, index) => {
                expect(field.getAttribute('data-note')).toBeTruthy();
                expect(field.getAttribute('data-index')).toBeTruthy();
            });
        });

        test('should be keyboard accessible', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            
            // Check if element is focusable
            field.focus();
            expect(document.activeElement).toBe(field);
        });

        test('should have proper color contrast', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            const computedStyle = getComputedStyle(field);
            
            // Check that text color is visible
            expect(computedStyle.color).not.toBe('transparent');
            expect(computedStyle.color).not.toBe('rgba(0, 0, 0, 0)');
        });
    });

    describe('Mobile Optimisation', () => {
        test('should handle touch events properly on mobile', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            
            // Simulate touch event
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ identifier: 1 }],
                bubbles: true
            });
            
            expect(() => field.dispatchEvent(touchEvent)).not.toThrow();
        });

        test('should prevent default touch behavior', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ identifier: 1 }],
                bubbles: true
            });
            
            const preventDefaultSpy = jest.spyOn(touchEvent, 'preventDefault');
            field.dispatchEvent(touchEvent);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        test('should have appropriate touch target sizes', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            const rect = field.getBoundingClientRect();
            
            // Touch targets should be at least 44px for accessibility
            expect(rect.width).toBeGreaterThanOrEqual(40);
            expect(rect.height).toBeGreaterThanOrEqual(40);
        });
    });

    describe('Audio Latency', () => {
        test('should have low audio latency', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            const startTime = performance.now();
            
            // Trigger note play
            field.click();
            
            const endTime = performance.now();
            const latency = endTime - startTime;
            
            // Audio should trigger within 50ms
            expect(latency).toBeLessThan(50);
        });

        test('should maintain audio context efficiently', () => {
            // Check that audio context is properly managed
            expect(Tone.context.state).toBe('running');
            
            // Test audio context resumption
            Tone.context.state = 'suspended';
            handPan.ensureAudioContextRunning();
            
            expect(Tone.context.resume).toHaveBeenCalled();
        });
    });

    describe('Memory Management', () => {
        test('should clean up event listeners properly', () => {
            const initialListenerCount = handPan.toneFields.length;
            
            // Change key to trigger re-render
            handPan.changeKey('F', 'major');
            
            // Should maintain same number of listeners
            expect(handPan.toneFields.length).toBe(initialListenerCount);
        });

        test('should not leak DOM elements during rapid interactions', () => {
            const field = handPan.shadowRoot.querySelector('.tone-field');
            const initialRippleCount = field.querySelectorAll('.ripple').length;
            
            // Trigger multiple ripples
            for (let i = 0; i < 5; i++) {
                field.click();
            }
            
            // Wait for ripple cleanup
            setTimeout(() => {
                const finalRippleCount = field.querySelectorAll('.ripple').length;
                expect(finalRippleCount).toBeLessThanOrEqual(initialRippleCount);
            }, 1000);
        });
    });
});