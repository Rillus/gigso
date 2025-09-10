import BaseComponent from '../base-component.js';

export default class PresentationSlide extends BaseComponent {
    constructor() {
        const template = `
            <div class="slide-content" id="slide-content">
                <!-- Content will be dynamically loaded based on slide type -->
            </div>
        `;
        
        const styles = `
            .slide-content {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 40px;
                box-sizing: border-box;
            }
            
            .slide-title {
                font-size: 3.5em;
                font-weight: 700;
                margin-bottom: 30px;
                background: linear-gradient(135deg, #00ff87, #60efff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 4px 20px rgba(0, 255, 135, 0.3);
            }
            
            .slide-subtitle {
                font-size: 1.8em;
                font-weight: 300;
                margin-bottom: 20px;
                color: rgba(255, 255, 255, 0.9);
            }
            
            .slide-content h2 {
                font-size: 2.5em;
                font-weight: 600;
                margin-bottom: 30px;
                color: #00ff87;
            }
            
            .slide-content h3 {
                font-size: 1.8em;
                font-weight: 500;
                margin-bottom: 20px;
                color: #60efff;
            }
            
            .slide-bullets {
                font-size: 1.4em;
                line-height: 1.8;
                text-align: left;
                max-width: 800px;
                margin: 0 auto;
                list-style-type: none;
            }
            
            .slide-bullets li {
                margin-bottom: 15px;
                padding-left: 20px;
                position: relative;
            }
            
            .slide-bullets li::before {
                content: "▶";
                position: absolute;
                left: 0;
                color: #00ff87;
                font-size: 0.8em;
                line-height: 60px;
            }
            
            .highlight {
                background: linear-gradient(135deg, #667eea, #764ba2);
                padding: 5px 15px;
                border-radius: 25px;
                font-weight: 600;
                display: inline-block;
                margin: 5px;
            }
            
            .code-block {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 20px;
                font-family: 'Courier New', monospace;
                font-size: 1.1em;
                text-align: left;
                max-width: 600px;
                margin: 20px auto;
                overflow-x: auto;
            }
            
            .demo-area {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid #00ff87;
                border-radius: 15px;
                padding: 30px;
                margin: 20px auto;
                max-width: 900px;
                min-height: 400px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                overflow-y: auto;
            }
            
            .component-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
                max-width: 800px;
            }
            
            .component-card {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                transition: transform 0.3s ease;
            }
            
            .component-card:hover {
                transform: translateY(-5px);
                background: rgba(255, 255, 255, 0.2);
            }
            
            .component-icon {
                font-size: 2em;
                margin-bottom: 10px;
                display: block;
            }
            
            .author-info {
                margin-top: 40px;
                font-size: 1.2em;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .date-info {
                font-size: 1.1em;
                color: #60efff;
                margin-top: 10px;
            }
            
            /* Animation classes */
            .fade-in {
                animation: fadeIn 0.8s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .slide-in-left {
                animation: slideInLeft 0.6s ease-out;
            }
            
            @keyframes slideInLeft {
                from { opacity: 0; transform: translateX(-50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .slide-in-right {
                animation: slideInRight 0.6s ease-out;
            }
            
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .slide-content {
                    padding: 20px;
                }
                
                .slide-title {
                    font-size: 2.5em;
                }
                
                .slide-bullets {
                    font-size: 1.2em;
                }
                
                .component-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
            }
        `;
        
        super(template, styles);
        
        this.slideIndex = 0;
        this.slideType = '';
        this.title = '';
        this.isVisible = false;
    }
    
    static get observedAttributes() {
        return ['slide-index', 'slide-type', 'title'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch (name) {
            case 'slide-index':
                this.slideIndex = parseInt(newValue) || 0;
                break;
            case 'slide-type':
                this.slideType = newValue;
                this.loadSlideContent();
                break;
            case 'title':
                this.title = newValue;
                break;
        }
    }
    
    loadSlideContent() {
        const content = this.shadowRoot.getElementById('slide-content');
        
        switch (this.slideType) {
            case 'title-slide':
                content.innerHTML = `
                    <h1 class="slide-title fade-in">From Code to Chords</h1>
                    <p class="slide-subtitle fade-in">Building a Web-Based Music Maker Without Frameworks</p>
                    <p class="slide-subtitle fade-in">How Web Components Enable Professional Music Applications</p>
                    <div class="author-info fade-in">
                        <div>Riley Ramone</div>
                        <div class="date-info">September 16th, 2025</div>
                    </div>
                `;
                break;
                
            case 'web-components-overview':
                content.innerHTML = `
                    <h2 class="slide-in-left">What Are Web Components?</h2>
                    <ul class="slide-bullets slide-in-right">
                        <li><span class="highlight">Encapsulation</span>: Shadow DOM isolates styles and markup</li>
                        <li><span class="highlight">Reusability</span>: Custom elements work across any framework</li>
                        <li><span class="highlight">Standards-based</span>: Built on web standards, no external dependencies</li>
                        <li><span class="highlight">Composability</span>: Components combine to build complex applications</li>
                    </ul>
                `;
                break;
                
            case 'web-components-benefits':
                content.innerHTML = `
                    <h2 class="slide-in-left">Why Web Components for Music?</h2>
                    <ul class="slide-bullets slide-in-right">
                        <li><span class="highlight">Modularity</span>: Each instrument/control is a separate component</li>
                        <li><span class="highlight">Interoperability</span>: Components communicate via standard events</li>
                        <li><span class="highlight">Performance</span>: Native browser APIs, no framework overhead</li>
                        <li><span class="highlight">Audio-First</span>: Direct access to Web Audio API for real-time audio</li>
                    </ul>
                `;
                break;
                
            case 'architecture-overview':
                content.innerHTML = `
                    <h2 class="slide-in-left">BaseComponent Architecture</h2>
                    <div class="code-block slide-in-right">
export default class BaseComponent extends HTMLElement {
  constructor(template, styles, isolatedStyles = true) {
    super();
    this.attachShadow({ mode: 'open' });
    this.render(template, styles, isolatedStyles);
  }
  
  dispatchComponentEvent(target, eventName, data) {
    // Centralized event handling
  }
}
                    </div>
                    <p class="slide-subtitle">🤔 Is BaseComponent a good idea?</p>
                `;
                break;
                
            case 'component-categories':
                content.innerHTML = `
                    <h2 class="slide-in-left">Component Categories</h2>
                    <div class="component-grid slide-in-right">
                        <div class="component-card">
                            <span class="component-icon">🎹</span>
                            <h3>Music Creation</h3>
                            <p>PianoRoll, ChordPalette, AddChord</p>
                        </div>
                        <div class="component-card">
                            <span class="component-icon">🎸</span>
                            <h3>Instruments</h3>
                            <p>HandPan, GigsoKeyboard, Fretboard</p>
                        </div>
                        <div class="component-card">
                            <span class="component-icon">⏯️</span>
                            <h3>Playback Controls</h3>
                            <p>TransportControls, PlayButton, LoopButton</p>
                        </div>
                        <div class="component-card">
                            <span class="component-icon">📊</span>
                            <h3>Visual Feedback</h3>
                            <p>CurrentChord, VUMeter, EQDisplay</p>
                        </div>
                    </div>
                `;
                break;
                
            case 'event-architecture':
                content.innerHTML = `
                    <h2 class="slide-in-left">Event-Driven Architecture</h2>
                    <ul class="slide-bullets slide-in-right">
                        <li><span class="highlight">CustomEvent</span>: Components communicate via standard events</li>
                        <li><span class="highlight">Centralized State</span>: Single source of truth for application state</li>
                        <li><span class="highlight">Real-time Updates</span>: Changes propagate across all components</li>
                        <li><span class="highlight">Example</span>: Chord selection updates multiple components simultaneously</li>
                    </ul>
                    <div class="code-block">
// Component communication example
this.dispatchEvent(new CustomEvent('chord-selected', {
  detail: { chord: 'Cmaj7', notes: ['C', 'E', 'G', 'B'] }
}));
                    </div>
                `;
                break;
                
            case 'live-demo':
                content.innerHTML = `
                    <h2 class="slide-in-left">Live Demo: Building a Song</h2>
                    <div class="demo-area" id="live-demo-area">
                        <p>🎵 Interactive Demo Loading...</p>
                        <live-demo demo-type="song-building"></live-demo>
                    </div>
                `;
                break;
                
            case 'technical-future':
                content.innerHTML = `
                    <h2 class="slide-in-left">Technical Innovation & Future</h2>
                    <div style="display: flex; justify-content: space-between; gap: 40px; align-items: flex-start;">
                        <div style="flex: 1;">
                            <h3>Advanced Features</h3>
                            <ul class="slide-bullets">
                                <li><span class="highlight">Audio Engine</span>: Tone.js integration</li>
                                <li><span class="highlight">Touch Support</span>: Multi-touch instruments</li>
                                <li><span class="highlight">Performance</span>: 60fps, <50ms latency</li>
                                <li><span class="highlight">Responsive</span>: Desktop, tablet, mobile</li>
                            </ul>
                        </div>
                        <div style="flex: 1;">
                            <h3>What's Next</h3>
                            <ul class="slide-bullets">
                                <li><span class="highlight">MIDI</span>: Import/export capabilities</li>
                                <li><span class="highlight">AI</span>: Assisted composition</li>
                                <li><span class="highlight">Collaboration</span>: Real-time editing</li>
                                <li><span class="highlight">Mobile</span>: Native app development</li>
                            </ul>
                        </div>
                    </div>
                `;
                break;
                
            default:
                content.innerHTML = `
                    <h2>Slide Content</h2>
                    <p>Slide type: ${this.slideType}</p>
                    <p>Title: ${this.title}</p>
                `;
        }
    }
    
    show() {
        this.isVisible = true;
        this.classList.add('active');
        
        // Trigger animations for slide elements
        const animatedElements = this.shadowRoot.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
        animatedElements.forEach((element, index) => {
            setTimeout(() => {
                element.style.animationDelay = `${index * 0.2}s`;
            }, 100);
        });
        
        // Load demo component if this is a demo slide
        if (this.slideType === 'live-demo') {
            this.loadDemoComponent();
        }
        
        this.dispatchEvent(new CustomEvent('slide-shown', {
            detail: { 
                slideIndex: this.slideIndex,
                slideType: this.slideType,
                title: this.title
            }
        }));
    }
    
    hide() {
        this.isVisible = false;
        this.classList.remove('active');
        
        // Clean up demo components
        if (this.slideType === 'live-demo') {
            this.cleanupDemo();
        }
        
        this.dispatchEvent(new CustomEvent('slide-hidden', {
            detail: { 
                slideIndex: this.slideIndex,
                slideType: this.slideType
            }
        }));
    }
    
    loadDemoComponent() {
        const demoArea = this.shadowRoot.getElementById('live-demo-area');
        if (!demoArea) return;
        
        // Check if live-demo component already exists
        const existingLiveDemo = demoArea.querySelector('live-demo');
        if (existingLiveDemo) {
            // Live-demo component already exists, just remove the loading message
            const loadingMessage = demoArea.querySelector('p');
            if (loadingMessage) {
                loadingMessage.remove();
            }
            console.log('Preserving existing live-demo component');
            return;
        }
        
        // Fallback: Create and configure demo components based on slide type
        const demoComponents = this.createDemoComponents();
        
        // Clear existing content
        demoArea.innerHTML = '';
        
        // Add demo components
        demoComponents.forEach(component => {
            demoArea.appendChild(component);
        });
        
        // Initialize audio context for demos
        this.initializeDemoAudio();
    }
    
    createDemoComponents() {
        const components = [];
        
        switch (this.slideType) {
            case 'live-demo':
                // Create a simplified demo environment
                const demoContainer = document.createElement('div');
                demoContainer.style.cssText = `
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    width: 100%;
                    max-width: 800px;
                `;
                
                // Add demo chord palette
                const chordPalette = document.createElement('demo-chord-palette');
                chordPalette.style.cssText = 'grid-column: 1;';
                
                // Add current chord display
                const currentChord = document.createElement('current-chord');
                currentChord.style.cssText = 'grid-column: 2; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px;';
                
                // Add transport controls
                const transportControls = document.createElement('demo-transport-controls');
                transportControls.style.cssText = 'grid-column: 1 / -1; margin-top: 15px;';
                
                demoContainer.appendChild(chordPalette);
                demoContainer.appendChild(currentChord);
                demoContainer.appendChild(transportControls);
                components.push(demoContainer);
                break;
        }
        
        return components;
    }
    
    initializeDemoAudio() {
        // Initialize audio context for demo components
        if (window.Tone && !window.Tone.context.state === 'running') {
            window.Tone.start().catch(err => {
                console.warn('Could not start audio context for demo:', err);
            });
        }
    }
    
    cleanupDemo() {
        const demoArea = this.shadowRoot.getElementById('live-demo-area');
        if (demoArea) {
            // Remove all demo components
            const demoComponents = demoArea.querySelectorAll('*');
            demoComponents.forEach(component => {
                if (component.disconnectedCallback) {
                    component.disconnectedCallback();
                }
            });
            demoArea.innerHTML = '<p>🎵 Demo Complete</p>';
        }
    }
    
    connectedCallback() {
        super.connectedCallback();
        
        // Load content if attributes are already set
        if (this.slideType) {
            this.loadSlideContent();
        }
    }
}

customElements.define('presentation-slide', PresentationSlide);