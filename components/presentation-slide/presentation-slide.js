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
                white-space: pre;
            }
            
            .demo-area {
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
            
            .execute-btn {
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                margin: 10px 0;
            }
            
            .execute-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                background: linear-gradient(135deg, #5a6fd8, #6a4190);
            }
            
            .execute-btn:active {
                transform: translateY(0);
            }
            
            .execute-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
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
    
    // Handle property changes (when set directly as properties)
    set slideIndex(value) {
        this._slideIndex = value;
    }
    
    get slideIndex() {
        return this._slideIndex || 0;
    }
    
    set slideType(value) {
        this._slideType = value;
        if (value) {
            this.loadSlideContent();
        }
    }
    
    get slideType() {
        return this._slideType || '';
    }
    
    set title(value) {
        this._title = value;
    }
    
    get title() {
        return this._title || '';
    }
    
    set slideData(value) {
        this._slideData = value;
        if (value && value.content) {
            this.loadSlideContent();
        }
    }
    
    get slideData() {
        return this._slideData;
    }
    
    loadSlideContent() {
        const content = this.shadowRoot.getElementById('slide-content');
        
        if (!content) {
            // Content element not ready yet, skip
            return;
        }
        
        // Try to use JSON data first if available
        if (this.slideData && this.slideData.content) {
            this.renderSlideFromData(content, this.slideData.content);
            // Set up execute button if needed
            setTimeout(() => this.setupExecuteButton(), 100);
            return;
        }
        
        // Fallback to hardcoded content
        const slideType = this.slideType;
        if (!slideType) {
            return;
        }
        
        switch (slideType) {
            case 'title-slide':
                content.innerHTML = `
                    <h1 class="slide-title fade-in">From Code to Chords</h1>
                    <p class="slide-subtitle fade-in">Building a Web-Based Music Maker Without Frameworks</p>
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
    
    renderSlideFromData(content, slideContent) {
        switch (slideContent.type) {
            case 'title':
                content.innerHTML = `
                    <h1 class="slide-title fade-in">${slideContent.mainTitle}</h1>
                    <p class="slide-subtitle fade-in">${slideContent.subtitle}</p>
                    <div class="author-info fade-in">
                        <div>${slideContent.author}</div>
                        <div class="date-info">${slideContent.date}</div>
                    </div>
                `;
                break;
                
            case 'bullets':
                let bulletsHtml = `<h2 class="slide-in-left">${slideContent.mainTitle}</h2><ul class="slide-bullets slide-in-right">`;
                slideContent.bullets.forEach(bullet => {
                    bulletsHtml += `<li><span class="highlight">${bullet.highlight}</span>: ${bullet.text.replace(bullet.highlight + ': ', '')}</li>`;
                });
                bulletsHtml += '</ul>';
                content.innerHTML = bulletsHtml;
                break;
                
            case 'code':
                content.innerHTML = `
                    <h2 class="slide-in-left">${slideContent.mainTitle}</h2>
                    <div class="code-block slide-in-right">
${slideContent.codeBlock}
                    </div>
                    ${slideContent.question ? `<p class="slide-subtitle">${slideContent.question}</p>` : ''}
                    ${this.shouldShowExecuteButton(slideContent) ? this.createExecuteButton(slideContent) : ''}
                `;
                break;
                
            case 'grid':
                let gridHtml = `<h2 class="slide-in-left">${slideContent.mainTitle}</h2><div class="component-grid slide-in-right">`;
                slideContent.categories.forEach(category => {
                    gridHtml += `
                        <div class="component-card">
                            <span class="component-icon">${category.icon}</span>
                            <h3>${category.title}</h3>
                            <p>${category.description}</p>
                        </div>
                    `;
                });
                gridHtml += '</div>';
                content.innerHTML = gridHtml;
                break;
                
            case 'bullets-with-code':
                let bulletsCodeHtml = `<h2 class="slide-in-left">${slideContent.mainTitle}</h2><ul class="slide-bullets slide-in-right">`;
                slideContent.bullets.forEach(bullet => {
                    bulletsCodeHtml += `<li><span class="highlight">${bullet.highlight}</span>: ${bullet.text.replace(bullet.highlight + ': ', '')}</li>`;
                });
                bulletsCodeHtml += '</ul>';
                if (slideContent.codeBlock) {
                    bulletsCodeHtml += `<div class="code-block">${slideContent.codeBlock}</div>`;
                }
                content.innerHTML = bulletsCodeHtml;
                break;
                
            case 'demo':
                content.innerHTML = `
                    <h2 class="slide-in-left">${slideContent.mainTitle}</h2>
                    <div class="demo-area" id="live-demo-area">
                        <live-demo demo-type="${slideContent.demoType}"></live-demo>
                    </div>
                `;
                break;
                
            case 'two-column':
                let leftColumnHtml = `<h3>${slideContent.leftColumn.title}</h3><ul class="slide-bullets">`;
                slideContent.leftColumn.bullets.forEach(bullet => {
                    leftColumnHtml += `<li><span class="highlight">${bullet.highlight}</span>: ${bullet.text.replace(bullet.highlight + ': ', '')}</li>`;
                });
                leftColumnHtml += '</ul>';
                
                let rightColumnHtml = `<h3>${slideContent.rightColumn.title}</h3><ul class="slide-bullets">`;
                slideContent.rightColumn.bullets.forEach(bullet => {
                    rightColumnHtml += `<li><span class="highlight">${bullet.highlight}</span>: ${bullet.text.replace(bullet.highlight + ': ', '')}</li>`;
                });
                rightColumnHtml += '</ul>';
                
                content.innerHTML = `
                    <h2 class="slide-in-left">${slideContent.mainTitle}</h2>
                    <div style="display: flex; justify-content: space-between; gap: 40px; align-items: flex-start;">
                        <div style="flex: 1;">
                            ${leftColumnHtml}
                        </div>
                        <div style="flex: 1;">
                            ${rightColumnHtml}
                        </div>
                    </div>
                `;
                break;
                
            default:
                content.innerHTML = `
                    <h2>Slide Content</h2>
                    <p>Slide type: ${slideContent.type}</p>
                    <p>Title: ${this.title}</p>
                `;
        }
        
        // Set up execute button if needed
        setTimeout(() => this.setupExecuteButton(), 100);
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
        if (this.slideType === 'live-demo' || (this.slideData && this.slideData.content && this.slideData.content.type === 'demo')) {
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
        if (this.slideType === 'live-demo' || (this.slideData && this.slideData.content && this.slideData.content.type === 'demo')) {
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
    
    shouldShowExecuteButton(slideContent) {
        // Show execute button for Web Audio API code or Tone.js examples
        return slideContent.mainTitle && (
            slideContent.mainTitle.toLowerCase().includes('audio') || 
            slideContent.mainTitle.toLowerCase().includes('tone')
        );
    }
    
    createExecuteButton(slideContent) {
        const buttonId = `execute-btn-${this.slideIndex}`;
        const isToneJs = slideContent.mainTitle.toLowerCase().includes('tone');
        const buttonText = isToneJs ? '🎵 Play Tone.js Sound' : '🔊 Play Web Audio Sound';
        const descriptionText = isToneJs ? 'Click to hear Tone.js in action' : 'Click to hear the Web Audio API in action';
        
        return `
            <div class="execute-button-container" style="margin-top: 20px;">
                <button id="${buttonId}" class="execute-btn">
                    ${buttonText}
                </button>
                <p class="execute-note" style="font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 10px;">
                    ${descriptionText}
                </p>
            </div>
        `;
    }
    
    setupExecuteButton() {
        const executeBtn = this.shadowRoot.querySelector('.execute-btn');
        if (executeBtn) {
            executeBtn.addEventListener('click', () => {
                // Check if this is a Tone.js slide
                const slideContent = this.slideData?.content;
                const isToneJs = slideContent?.mainTitle?.toLowerCase().includes('tone');
                
                if (isToneJs) {
                    this.executeToneJsCode();
                } else {
                    this.executeWebAudioCode();
                }
            });
        }
    }
    
    executeToneJsCode() {
        try {
            // Check if Tone.js is available
            if (typeof Tone === 'undefined') {
                this.showAudioError('Tone.js not loaded');
                return;
            }
            
            // Start Tone.js context if needed
            if (Tone.context.state !== 'running') {
                Tone.start().then(() => {
                    this.playToneJsSuccessSound();
                });
            } else {
                this.playToneJsSuccessSound();
            }
        } catch (error) {
            console.error('Error executing Tone.js code:', error);
            this.showAudioError('Tone.js error');
        }
    }
    
    playToneJsSuccessSound() {
        try { 
            // Create a simple synth with a sine oscillator and a short attack/release envelope
            const synth = new Tone.Synth({
              oscillator: { type: "sine" },
              envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.1,
                release: 0.15,
              },
            }).toDestination();
            
            const now = Tone.now();
            
            // You can also use note names like "C4"
            synth.triggerAttack(600, now);
            synth.frequency.exponentialRampTo(1000, 0.15, now);
            synth.triggerRelease(now + 0.2);
            
            const btn = this.shadowRoot.querySelector('.execute-btn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = '🎵 Playing...';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 300);
            }
            
        } catch (error) {
            console.error('Error playing Tone.js sound:', error);
            this.showAudioError('Tone.js playback error');
        }
    }
    
    executeWebAudioCode() {
        try {
            // Create audio context if it doesn't exist
            if (!window.audioContext) {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const context = window.audioContext;
            
            // Resume context if suspended (required for user interaction)
            if (context.state === 'suspended') {
                context.resume().then(() => {
                    this.playSuccessSound(context);
                });
            } else {
                this.playSuccessSound(context);
            }
        } catch (error) {
            console.error('Error executing Web Audio code:', error);
            this.showAudioError();
        }
    }
    
    playSuccessSound(context) {
        try {
            // Create oscillator for the success sound
            const successNoise = context.createOscillator();
            successNoise.frequency.setValueAtTime(600, context.currentTime);
            successNoise.type = "sine";
            
            // Create frequency ramps
            successNoise.frequency.exponentialRampToValueAtTime(
                800,
                context.currentTime + 0.05
            );
            successNoise.frequency.exponentialRampToValueAtTime(
                1000,
                context.currentTime + 0.15
            );
            
            // Create gain node
            const successGain = context.createGain();
            successGain.gain.setValueAtTime(0.3, context.currentTime);
            successGain.gain.exponentialRampToValueAtTime(
                0.01,
                context.currentTime + 0.3
            );
            
            // Create filter
            const successFilter = context.createBiquadFilter();
            successFilter.type = "bandpass";
            successFilter.Q.setValueAtTime(0.01, context.currentTime);
            
            // Connect the audio graph
            successNoise.connect(successFilter);
            successFilter.connect(successGain);
            successGain.connect(context.destination);
            
            // Start and stop the sound
            successNoise.start();
            successNoise.stop(context.currentTime + 0.2);
            
            // Update button text temporarily
            const btn = this.shadowRoot.querySelector('.execute-btn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = '🎵 Playing...';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 300);
            }
            
        } catch (error) {
            console.error('Error playing success sound:', error);
            this.showAudioError();
        }
    }
    
    showAudioError(customMessage = 'Audio Error') {
        const btn = this.shadowRoot.querySelector('.execute-btn');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = `❌ ${customMessage}`;
            btn.disabled = true;
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
        }
    }
    
    connectedCallback() {
        // Load content if properties are already set
        if (this.slideType || (this.slideData && this.slideData.content)) {
            this.loadSlideContent();
        }
    }
}

customElements.define('presentation-slide', PresentationSlide);