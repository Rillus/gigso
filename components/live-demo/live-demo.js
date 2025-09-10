import BaseComponent from '../base-component.js';

export default class LiveDemo extends BaseComponent {
    constructor() {
        const template = `
            <div class="demo-container" id="demo-container">
                <div class="demo-header">
                    <h3 id="demo-title">Live Demo</h3>
                    <div class="demo-controls">
                        <button id="start-demo-btn" class="demo-btn">▶ Start Demo</button>
                        <button id="reset-demo-btn" class="demo-btn">↻ Reset</button>
                        <button id="focus-demo-btn" class="demo-btn">🔍 Focus</button>
                    </div>
                </div>
                
                <div class="demo-content" id="demo-content">
                    <div class="demo-stage" id="demo-stage">
                        <div class="demo-launch">
                            <h3>🎵 Interactive Demo</h3>
                            <p>Experience the full Gigso application with all components in action.</p>
                            <button class="launch-demo-btn" id="launch-demo-btn" 
                                    onclick="this.getRootNode().host.launchFullScreenDemo()"
                                    type="button"
                                    aria-label="Launch full-screen demo">
                                🚀 Launch Full-Screen Demo
                            </button>
                            <p class="demo-hint">Opens in a new window for the best experience</p>
                        </div>
                    </div>
                    
                    <div class="demo-instructions" id="demo-instructions">
                        <h4>Demo Instructions</h4>
                        <ol id="instruction-steps">
                            <!-- Instructions will be loaded based on demo type -->
                        </ol>
                    </div>
                </div>
                
                <div class="demo-footer">
                    <div class="audio-status" id="audio-status">
                        <span class="audio-indicator" id="audio-indicator">🔇</span>
                        <span>Audio: <span id="audio-state">Initializing</span></span>
                    </div>
                    <div class="demo-progress">
                        <span>Step <span id="current-step">1</span> of <span id="total-steps">4</span></span>
                    </div>
                </div>
            </div>
        `;
        
        const styles = `
            .demo-container {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid #00ff87;
                border-radius: 15px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .demo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(0, 255, 135, 0.1);
                border-bottom: 1px solid rgba(0, 255, 135, 0.3);
            }
            
            .demo-header h3 {
                margin: 0;
                color: #00ff87;
                font-size: 1.4em;
            }
            
            .demo-controls {
                display: flex;
                gap: 10px;
            }
            
            .demo-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s ease;
            }
            
            .demo-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }
            
            .demo-btn:active {
                transform: translateY(0);
            }
            
            .demo-content {
                flex: 1;
                display: flex;
                padding: 20px;
                gap: 20px;
                overflow: hidden;
            }
            
            .demo-stage {
                flex: 2;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                min-height: 300px;
                overflow: hidden;
            }
            
            .demo-launch {
                max-width: 500px;
                margin: 0 auto;
                position: relative;
                z-index: 10;
            }
            
            .demo-launch h3 {
                font-size: 2em;
                margin: 0 0 20px 0;
                background: linear-gradient(135deg, #00ff87, #60efff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .demo-launch p {
                font-size: 1.1em;
                margin: 0 0 30px 0;
                opacity: 0.9;
                line-height: 1.6;
            }
            
            .launch-demo-btn {
                background: linear-gradient(135deg, #00ff87, #60efff);
                border: none;
                color: #000;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 1.2em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(0, 255, 135, 0.3);
                position: relative;
                z-index: 100;
            }
            
            .launch-demo-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 25px rgba(0, 255, 135, 0.5);
                filter: brightness(1.1);
            }
            
            .launch-demo-btn:active {
                transform: translateY(-1px);
            }
            
            .demo-hint {
                font-size: 0.9em;
                opacity: 0.7;
                margin: 20px 0 0 0;
                font-style: italic;
            }
            
            .demo-instructions {
                flex: 1;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
                overflow-y: auto;
            }
            
            .demo-instructions h4 {
                margin: 0 0 15px 0;
                color: #60efff;
                font-size: 1.2em;
            }
            
            .demo-instructions ol {
                padding-left: 20px;
                line-height: 1.6;
            }
            
            .demo-instructions li {
                margin-bottom: 10px;
                color: rgba(255, 255, 255, 0.9);
            }
            
            .demo-instructions li.completed {
                color: #00ff87;
                text-decoration: line-through;
            }
            
            .demo-instructions li.current {
                color: #60efff;
                font-weight: 600;
                background: rgba(96, 239, 255, 0.1);
                padding: 5px 10px;
                border-radius: 5px;
            }
            
            .demo-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .audio-status {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
            }
            
            .audio-indicator {
                font-size: 16px;
                animation: pulse 2s infinite;
            }
            
            .audio-indicator.active {
                animation: none;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .demo-progress {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .demo-component {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                transition: all 0.3s ease;
                flex-shrink: 0;
                max-width: 100%;
                overflow: hidden;
            }
            
            .demo-component:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }
            
            .demo-component.highlight {
                border-color: #00ff87;
                box-shadow: 0 0 15px rgba(0, 255, 135, 0.3);
            }
            
            /* Ensure child components fit within demo containers */
            .demo-component > * {
                max-width: 100%;
                box-sizing: border-box;
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .demo-content {
                    flex-direction: column;
                    padding: 15px;
                }
                
                .demo-header {
                    padding: 10px 15px;
                }
                
                .demo-controls {
                    flex-wrap: wrap;
                    gap: 5px;
                }
                
                .demo-btn {
                    padding: 6px 12px;
                    font-size: 11px;
                }
            }
        `;
        
        super(template, styles);
        
        this.demoType = '';
        this.currentStep = 0;
        this.totalSteps = 0;
        this.demoComponents = [];
        this.audioContext = null;
        this.isRunning = false;
        
        // Component initialized successfully
        
        this.setupEventListeners();
    }
    
    static get observedAttributes() {
        return ['demo-type'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'demo-type' && newValue !== oldValue) {
            this.demoType = newValue;
            this.loadDemoConfiguration();
        }
    }
    
    setupEventListeners() {
        const startBtn = this.shadowRoot.getElementById('start-demo-btn');
        const resetBtn = this.shadowRoot.getElementById('reset-demo-btn');
        const focusBtn = this.shadowRoot.getElementById('focus-demo-btn');
        const launchBtn = this.shadowRoot.getElementById('launch-demo-btn');
        
        startBtn.addEventListener('click', () => this.startDemo());
        resetBtn.addEventListener('click', () => this.resetDemo());
        focusBtn.addEventListener('click', () => this.focusDemo());
        
        if (launchBtn) {
            launchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.launchFullScreenDemo();
            });
        }
    }
    
    loadDemoConfiguration() {
        const configurations = {
            'song-building': {
                title: 'Building a Pop Progression',
                steps: [
                    'Start with C major chord from ChordPalette',
                    'Add F, G, Am to create I-V-vi-IV progression',
                    'Set 4/4 time signature and 120 BPM',
                    'Enable loop and play the progression'
                ],
                components: ['chord-palette', 'current-chord', 'transport-controls', 'piano-roll']
            },
            'jazz-chord': {
                title: 'Creating a Jazz Chord',
                steps: [
                    'Use AddChord component to create Cmaj7',
                    'Show chord diagram with Fretboard component',
                    'Demonstrate chord voicing variations',
                    'Play with different inversions'
                ],
                components: ['add-chord', 'fretboard', 'chord-diagram']
            },
            'multi-component': {
                title: 'Multi-Component Integration',
                steps: [
                    'Show chord selection updating multiple components',
                    'Demonstrate real-time synchronization',
                    'Highlight event-driven architecture',
                    'Show responsive design across devices'
                ],
                components: ['chord-palette', 'current-chord', 'hand-pan', 'fretboard']
            }
        };
        
        const config = configurations[this.demoType] || configurations['song-building'];
        this.totalSteps = config.steps.length;
        
        // Update demo title
        const titleElement = this.shadowRoot.getElementById('demo-title');
        titleElement.textContent = config.title;
        
        // Load instructions
        const instructionsList = this.shadowRoot.getElementById('instruction-steps');
        instructionsList.innerHTML = config.steps.map((step, index) => 
            `<li id="step-${index}" class="${index === 0 ? 'current' : ''}">${step}</li>`
        ).join('');
        
        // Update step counter
        this.updateStepCounter();
        
        // Demo components will be loaded in the dedicated full-screen demo page
        // this.loadDemoComponents(config.components);
    }
    
    loadDemoComponents(componentNames) {
        const stage = this.shadowRoot.getElementById('demo-stage');
        stage.innerHTML = '';
        this.demoComponents = [];
        
        componentNames.forEach((componentName, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'demo-component';
            wrapper.style.animationDelay = `${index * 0.2}s`;
            
            const component = document.createElement(componentName);
            
            // Configure components for demo mode
            this.configureDemoComponent(component, componentName);
            
            wrapper.appendChild(component);
            stage.appendChild(wrapper);
            this.demoComponents.push({ name: componentName, element: component, wrapper });
        });
    }
    
    configureDemoComponent(component, componentName) {
        switch (componentName) {
            case 'chord-palette':
                // Pre-populate with common chords
                component.setAttribute('preset', 'pop-progression');
                break;
            case 'hand-pan':
                // Set to C major scale
                component.setAttribute('key', 'C');
                component.setAttribute('scale', 'major');
                component.setAttribute('size', 'small');
                break;
            case 'fretboard':
                component.setAttribute('instrument', 'guitar');
                component.setAttribute('scale-display', 'true');
                break;
            case 'transport-controls':
                component.setAttribute('compact', 'true');
                break;
        }
        
        // Add event listeners for demo interaction
        this.addDemoEventListeners(component, componentName);
    }
    
    addDemoEventListeners(component, componentName) {
        switch (componentName) {
            case 'chord-palette':
                component.addEventListener('chord-selected', (event) => {
                    this.highlightComponent(componentName);
                    this.advanceStep('Chord selected: ' + event.detail.chord);
                });
                break;
            case 'current-chord':
                component.addEventListener('chord-updated', (event) => {
                    this.highlightComponent(componentName);
                });
                break;
            case 'transport-controls':
                component.addEventListener('play-started', () => {
                    this.highlightComponent(componentName);
                    this.advanceStep('Playback started');
                });
                break;
        }
    }
    
    async startDemo() {
        this.isRunning = true;
        this.currentStep = 0;
        
        // Initialize audio context
        await this.setupAudioContext();
        
        // Highlight first component
        if (this.demoComponents.length > 0) {
            this.highlightComponent(this.demoComponents[0].name);
        }
        
        // Update UI
        const startBtn = this.shadowRoot.getElementById('start-demo-btn');
        startBtn.textContent = '⏸ Pause Demo';
        startBtn.onclick = () => this.pauseDemo();
        
        this.updateAudioStatus('Running');
        this.updateStepCounter();
        
        this.dispatchEvent(new CustomEvent('demo-started', {
            detail: { demoType: this.demoType }
        }));
    }
    
    pauseDemo() {
        this.isRunning = false;
        
        // Update UI
        const startBtn = this.shadowRoot.getElementById('start-demo-btn');
        startBtn.textContent = '▶ Resume Demo';
        startBtn.onclick = () => this.startDemo();
        
        this.updateAudioStatus('Paused');
        
        this.dispatchEvent(new CustomEvent('demo-paused', {
            detail: { currentStep: this.currentStep }
        }));
    }
    
    resetDemo() {
        this.isRunning = false;
        this.currentStep = 0;
        
        // Reset all demo components
        this.demoComponents.forEach(({ element, wrapper }) => {
            wrapper.classList.remove('highlight');
            if (element.reset && typeof element.reset === 'function') {
                element.reset();
            }
        });
        
        // Reset instruction steps
        const steps = this.shadowRoot.querySelectorAll('#instruction-steps li');
        steps.forEach((step, index) => {
            step.className = index === 0 ? 'current' : '';
        });
        
        // Update UI
        const startBtn = this.shadowRoot.getElementById('start-demo-btn');
        startBtn.textContent = '▶ Start Demo';
        startBtn.onclick = () => this.startDemo();
        
        this.updateStepCounter();
        this.updateAudioStatus('Ready');
        
        this.dispatchEvent(new CustomEvent('demo-reset', {
            detail: { demoType: this.demoType }
        }));
    }
    
    focusDemo() {
        // Enter fullscreen demo mode
        this.requestFullscreen().then(() => {
            this.classList.add('demo-focused');
            
            this.dispatchEvent(new CustomEvent('demo-focused', {
                detail: { demoType: this.demoType }
            }));
        }).catch(err => {
            console.warn('Could not enter fullscreen demo mode:', err);
        });
    }
    
    launchFullScreenDemo() {
        // Open the dedicated full-screen demo page
        const newWindow = window.open('presentation-demo.html', '_blank', 'width=1200,height=800,toolbar=no,menubar=no,scrollbars=yes,resizable=yes');
        
        if (!newWindow) {
            alert('Please allow popups to view the full-screen demo');
        }
        
        // Dispatch event for analytics/tracking
        this.dispatchEvent(new CustomEvent('demo-launched', {
            detail: { 
                demoType: this.demoType,
                timestamp: Date.now()
            }
        }));
    }
    
    async setupAudioContext() {
        try {
            if (window.Tone) {
                if (window.Tone.context.state !== 'running') {
                    await window.Tone.start();
                }
                this.audioContext = window.Tone.context;
                this.updateAudioStatus('Ready');
            } else {
                this.updateAudioStatus('No Audio Engine');
            }
        } catch (error) {
            console.error('Audio setup error:', error);
            this.updateAudioStatus('Audio Error');
        }
    }
    
    highlightComponent(componentName) {
        // Remove highlight from all components
        this.demoComponents.forEach(({ wrapper }) => {
            if (wrapper && wrapper.classList) {
                wrapper.classList.remove('highlight');
            }
        });
        
        // Highlight the specified component
        const targetComponent = this.demoComponents.find(comp => comp.name === componentName);
        if (targetComponent && targetComponent.wrapper) {
            if (targetComponent.wrapper.classList) {
                targetComponent.wrapper.classList.add('highlight');
            }
            
            // Scroll to component if needed
            if (targetComponent.wrapper.scrollIntoView) {
                targetComponent.wrapper.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }
    }
    
    advanceStep(message) {
        if (!this.isRunning) return;
        
        const steps = this.shadowRoot.querySelectorAll('#instruction-steps li');
        
        // Mark current step as completed
        if (steps[this.currentStep]) {
            steps[this.currentStep].classList.remove('current');
            steps[this.currentStep].classList.add('completed');
        }
        
        // Move to next step
        this.currentStep++;
        
        if (this.currentStep < this.totalSteps && steps[this.currentStep]) {
            steps[this.currentStep].classList.add('current');
        }
        
        this.updateStepCounter();
        
        // Dispatch step advancement event
        this.dispatchEvent(new CustomEvent('demo-step-advanced', {
            detail: { 
                step: this.currentStep,
                message: message,
                completed: this.currentStep >= this.totalSteps
            }
        }));
        
        // Check if demo is complete
        if (this.currentStep >= this.totalSteps) {
            this.completeDemo();
        }
    }
    
    completeDemo() {
        this.isRunning = false;
        this.updateAudioStatus('Demo Complete');
        
        // Show completion animation
        const stage = this.shadowRoot.getElementById('demo-stage');
        stage.style.background = 'linear-gradient(135deg, rgba(0, 255, 135, 0.2), rgba(96, 239, 255, 0.2))';
        
        setTimeout(() => {
            stage.style.background = 'rgba(255, 255, 255, 0.05)';
        }, 2000);
        
        this.dispatchEvent(new CustomEvent('demo-completed', {
            detail: { 
                demoType: this.demoType,
                totalSteps: this.totalSteps
            }
        }));
    }
    
    updateStepCounter() {
        const currentElement = this.shadowRoot.getElementById('current-step');
        const totalElement = this.shadowRoot.getElementById('total-steps');
        
        currentElement.textContent = Math.min(this.currentStep + 1, this.totalSteps);
        totalElement.textContent = this.totalSteps;
    }
    
    updateAudioStatus(status) {
        const indicator = this.shadowRoot.getElementById('audio-indicator');
        const state = this.shadowRoot.getElementById('audio-state');
        
        state.textContent = status;
        
        switch (status) {
            case 'Ready':
            case 'Running':
                indicator.textContent = '🔊';
                indicator.classList.add('active');
                break;
            case 'Paused':
                indicator.textContent = '⏸️';
                indicator.classList.remove('active');
                break;
            case 'Demo Complete':
                indicator.textContent = '✅';
                indicator.classList.add('active');
                break;
            default:
                indicator.textContent = '🔇';
                indicator.classList.remove('active');
        }
    }
    
    // Public API methods
    setDemoType(type) {
        this.setAttribute('demo-type', type);
    }
    
    getCurrentStep() {
        return this.currentStep;
    }
    
    getTotalSteps() {
        return this.totalSteps;
    }
    
    isReady() {
        return this.audioContext !== null;
    }
    
    connectedCallback() {
        // Initialize audio setup
        this.setupAudioContext();
        
        // Load demo configuration if demo-type is set
        if (this.demoType) {
            this.loadDemoConfiguration();
        }
        
        // Component is now connected and ready
    }
    
    disconnectedCallback() {
        // Clean up audio context and components
        this.demoComponents.forEach(({ element }) => {
            if (element && element.disconnectedCallback) {
                element.disconnectedCallback();
            }
        });
        
        if (this.audioContext) {
            // Clean up audio resources if needed
        }
    }
}

customElements.define('live-demo', LiveDemo);