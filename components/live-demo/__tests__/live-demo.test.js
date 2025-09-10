import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import LiveDemo from '../live-demo.js';

describe('LiveDemo Component', () => {
    let liveDemo;
    
    beforeEach(() => {
        // Mock HTMLElement.prototype.requestFullscreen
        HTMLElement.prototype.requestFullscreen = jest.fn(() => Promise.resolve());
        
        liveDemo = document.createElement('live-demo');
        document.body.appendChild(liveDemo);
    });
    
    afterEach(() => {
        if (liveDemo && liveDemo.parentNode) {
            liveDemo.parentNode.removeChild(liveDemo);
        }
    });
    
    describe('Initialization', () => {
        test('should render demo structure', () => {
            const container = liveDemo.shadowRoot.querySelector('.demo-container');
            const header = liveDemo.shadowRoot.querySelector('.demo-header');
            const content = liveDemo.shadowRoot.querySelector('.demo-content');
            const footer = liveDemo.shadowRoot.querySelector('.demo-footer');
            
            expect(container).toBeTruthy();
            expect(header).toBeTruthy();
            expect(content).toBeTruthy();
            expect(footer).toBeTruthy();
        });
        
        test('should initialize with default values', () => {
            expect(liveDemo.demoType).toBe('');
            expect(liveDemo.currentStep).toBe(0);
            expect(liveDemo.totalSteps).toBe(0);
            expect(liveDemo.isRunning).toBe(false);
        });
        
        test('should render demo control buttons', () => {
            const startBtn = liveDemo.shadowRoot.getElementById('start-demo-btn');
            const resetBtn = liveDemo.shadowRoot.getElementById('reset-demo-btn');
            const focusBtn = liveDemo.shadowRoot.getElementById('focus-demo-btn');
            
            expect(startBtn).toBeTruthy();
            expect(resetBtn).toBeTruthy();
            expect(focusBtn).toBeTruthy();
        });
    });
    
    describe('Demo Configuration', () => {
        test('should load song-building demo configuration', () => {
            liveDemo.setAttribute('demo-type', 'song-building');
            
            expect(liveDemo.demoType).toBe('song-building');
            expect(liveDemo.totalSteps).toBe(4);
            
            const title = liveDemo.shadowRoot.getElementById('demo-title');
            expect(title.textContent).toBe('Building a Pop Progression');
        });
        
        test('should load jazz-chord demo configuration', () => {
            liveDemo.setAttribute('demo-type', 'jazz-chord');
            
            expect(liveDemo.totalSteps).toBe(4);
            
            const title = liveDemo.shadowRoot.getElementById('demo-title');
            expect(title.textContent).toBe('Creating a Jazz Chord');
        });
        
        test('should handle unknown demo type gracefully', () => {
            liveDemo.setAttribute('demo-type', 'unknown-demo');
            
            // Should fall back to song-building demo
            const title = liveDemo.shadowRoot.getElementById('demo-title');
            expect(title.textContent).toBe('Building a Pop Progression');
        });
    });
    
    describe('Demo Controls', () => {
        beforeEach(() => {
            liveDemo.setAttribute('demo-type', 'song-building');
        });
        
        test('should start demo when start button clicked', async () => {
            const startBtn = liveDemo.shadowRoot.getElementById('start-demo-btn');
            const eventSpy = jest.fn();
            liveDemo.addEventListener('demo-started', eventSpy);
            
            // Mock setupAudioContext to resolve immediately
            liveDemo.setupAudioContext = jest.fn(() => Promise.resolve());
            
            fireEvent.click(startBtn);
            
            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 10));
            
            expect(liveDemo.isRunning).toBe(true);
            expect(eventSpy).toHaveBeenCalled();
        });
        
        test('should reset demo when reset button clicked', () => {
            liveDemo.isRunning = true;
            liveDemo.currentStep = 2;
            
            const resetBtn = liveDemo.shadowRoot.getElementById('reset-demo-btn');
            const eventSpy = jest.fn();
            liveDemo.addEventListener('demo-reset', eventSpy);
            
            fireEvent.click(resetBtn);
            
            expect(liveDemo.isRunning).toBe(false);
            expect(liveDemo.currentStep).toBe(0);
            expect(eventSpy).toHaveBeenCalled();
        });
        
        test('should toggle pause/resume correctly', async () => {
            const startBtn = liveDemo.shadowRoot.getElementById('start-demo-btn');
            
            // Mock setupAudioContext
            liveDemo.setupAudioContext = jest.fn(() => Promise.resolve());
            
            // Start demo
            fireEvent.click(startBtn);
            await new Promise(resolve => setTimeout(resolve, 10));
            
            expect(startBtn.textContent).toBe('⏸ Pause Demo');
            
            // Pause demo
            fireEvent.click(startBtn);
            
            expect(liveDemo.isRunning).toBe(false);
            expect(startBtn.textContent).toBe('▶ Resume Demo');
        });
    });
    
    describe('Step Management', () => {
        beforeEach(() => {
            liveDemo.setAttribute('demo-type', 'song-building');
            liveDemo.isRunning = true;
        });
        
        test('should advance steps correctly', () => {
            expect(liveDemo.currentStep).toBe(0);
            
            liveDemo.advanceStep('Test step');
            
            expect(liveDemo.currentStep).toBe(1);
        });
        
        test('should update step counter display', () => {
            liveDemo.updateStepCounter();
            
            const currentStep = liveDemo.shadowRoot.getElementById('current-step');
            const totalSteps = liveDemo.shadowRoot.getElementById('total-steps');
            
            expect(currentStep.textContent).toBe('1');
            expect(totalSteps.textContent).toBe('4');
        });
        
        test('should complete demo when all steps finished', () => {
            const eventSpy = jest.fn();
            liveDemo.addEventListener('demo-completed', eventSpy);
            
            // Advance through all steps
            for (let i = 0; i < liveDemo.totalSteps; i++) {
                liveDemo.advanceStep(`Step ${i + 1}`);
            }
            
            expect(eventSpy).toHaveBeenCalled();
            expect(liveDemo.isRunning).toBe(false);
        });
    });
    
    describe('Audio Management', () => {
        test('should update audio status display', () => {
            liveDemo.updateAudioStatus('Ready');
            
            const indicator = liveDemo.shadowRoot.getElementById('audio-indicator');
            const state = liveDemo.shadowRoot.getElementById('audio-state');
            
            expect(indicator.textContent).toBe('🔊');
            expect(state.textContent).toBe('Ready');
        });
        
        test('should handle different audio states', () => {
            const states = ['Ready', 'Running', 'Paused', 'Demo Complete'];
            
            states.forEach(state => {
                liveDemo.updateAudioStatus(state);
                const stateElement = liveDemo.shadowRoot.getElementById('audio-state');
                expect(stateElement.textContent).toBe(state);
            });
        });
    });
    
    describe('Component Highlighting', () => {
        beforeEach(() => {
            liveDemo.setAttribute('demo-type', 'song-building');
        });
        
        test('should highlight specified component', () => {
            // Mock demoComponents array
            liveDemo.demoComponents = [
                { name: 'demo-chord-palette', wrapper: { classList: { add: jest.fn(), remove: jest.fn() }, scrollIntoView: jest.fn() } },
                { name: 'current-chord', wrapper: { classList: { add: jest.fn(), remove: jest.fn() }, scrollIntoView: jest.fn() } }
            ];
            
            liveDemo.highlightComponent('demo-chord-palette');
            
            expect(liveDemo.demoComponents[0].wrapper.classList.add).toHaveBeenCalledWith('highlight');
            expect(liveDemo.demoComponents[0].wrapper.scrollIntoView).toHaveBeenCalled();
        });
    });
    
    describe('Public API', () => {
        test('should provide demo type setter', () => {
            liveDemo.setDemoType('jazz-chord');
            expect(liveDemo.getAttribute('demo-type')).toBe('jazz-chord');
        });
        
        test('should provide step getters', () => {
            liveDemo.currentStep = 2;
            liveDemo.totalSteps = 5;
            
            expect(liveDemo.getCurrentStep()).toBe(2);
            expect(liveDemo.getTotalSteps()).toBe(5);
        });
        
        test('should provide ready state check', () => {
            liveDemo.audioContext = {}; // Mock audio context
            expect(liveDemo.isReady()).toBe(true);
            
            liveDemo.audioContext = null;
            expect(liveDemo.isReady()).toBe(false);
        });
    });
});