import BaseComponent from '../base-component.js';

export default class LiveDemo extends BaseComponent {
    constructor() {
        const template = `
            <div class="demo-stage" id="demo-stage">
                <!-- add demo component here -->
            </div>
        `;
        
        const styles = `                                    
            .demo-launch h3 {
                font-size: 2rem;
                font-weight: 700;
                margin: 0 0 1rem 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                letter-spacing: -0.02em;
            }
            
            .demo-launch p {
                font-size: 1.1rem;
                color: rgba(255, 255, 255, 0.9);
                margin: 0 0 2rem 0;
                line-height: 1.6;
                font-weight: 400;
            }
            
            .launch-demo-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                padding: 1rem 2.5rem;
                border-radius: 50px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 
                    0 8px 25px rgba(102, 126, 234, 0.4),
                    0 4px 12px rgba(0, 0, 0, 0.15);
                position: relative;
                overflow: hidden;
                text-transform: none;
                letter-spacing: 0.5px;
                min-width: 280px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            
            .launch-demo-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent, rgba(255, 255, 255, 0.3), transparent);
                transition: left 0.6s ease;
            }
            
            .launch-demo-btn:hover {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 
                    0 12px 35px rgba(102, 126, 234, 0.5),
                    0 6px 20px rgba(0, 0, 0, 0.2);
                background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
            }
            
            .launch-demo-btn:hover::before {
                left: 100%;
            }
            
            .launch-demo-btn:active {
                transform: translateY(-1px) scale(0.98);
                transition: all 0.1s ease;
            }
            
            .launch-demo-btn:focus {
                outline: none;
                box-shadow: 
                    0 8px 25px rgba(102, 126, 234, 0.4),
                    0 4px 12px rgba(0, 0, 0, 0.15),
                    0 0 0 4px rgba(102, 126, 234, 0.2);
            }
            
            .demo-hint {
                font-size: 0.9rem !important;
                color: rgba(255, 255, 255, 0.7) !important;
                margin: 1.5rem 0 0 0 !important;
                font-style: italic;
                opacity: 0.8;
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
            
            /* Responsive design */
            @media (max-width: 768px) {
                .demo-launch {
                    padding: 1.5rem;
                }
                
                .demo-launch h3 {
                    font-size: 1.5rem;
                }
                
                .demo-launch p {
                    font-size: 1rem;
                }
                
                .launch-demo-btn {
                    padding: 0.8rem 2rem;
                    font-size: 1rem;
                    min-width: 240px;
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
    
    loadDemoConfiguration() {
        if (!this.demoType) return;
        
        const demoStage = this.shadowRoot.getElementById('demo-stage');
        if (!demoStage) return;
        
        // Clear existing content
        demoStage.innerHTML = '';
        
        // Configure demo based on type
        switch (this.demoType) {
            case 'gigso':
                this.setupGigsoDemo(demoStage);
                break;
            case 'hand-pan':
                this.setupHandPanDemo(demoStage);
                break;
            default:
                demoStage.innerHTML = `<p>Demo type "${this.demoType}" not configured</p>`;
        }
    }
    
    setupGigsoDemo(demoStage) {
        // Create interactive music components for the song building demo
        demoStage.innerHTML = `
            <div class="demo-launch">
                <button class="launch-demo-btn" id="launch-demo-btn" 
                        type="button"
                        aria-label="Launch full-screen demo">
                    🚀 Launch Full-Screen Demo
                </button>
            </div>
        `;
        
        // Set up event listener for the launch button
        const launchBtn = demoStage.querySelector('#launch-demo-btn');
        if (launchBtn) {
            launchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.launchFullScreenDemo();
            });
        }
    }
    
    setupHandPanDemo(demoStage) {
        // Create handpan wrapper component for the handpan demo
        demoStage.innerHTML = `
            <div class="demo-launch">
                <hand-pan id="demo-component" key="C" scale="major" size="large"></hand-pan-wrapper>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Event listeners will be set up when demo content is loaded
        // This method is called during construction, but elements are created later
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
            case 'hand-pan-wrapper':
                // Configure hand-pan wrapper for demo
                component.setAttribute('key', 'C');
                component.setAttribute('scale', 'major');
                component.setAttribute('size', 'medium');
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
        const newWindow = window.open('all-together-demo.html', '_blank', 'width=1200,height=800,toolbar=no,menubar=no,scrollbars=yes,resizable=yes');
        
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