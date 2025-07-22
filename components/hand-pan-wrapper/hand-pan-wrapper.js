import { getAllKeys, getAllScaleTypes } from '../../helpers/scaleUtils.js';
import { applyNoteColor, getNoteColor } from '../../helpers/noteColorUtils.js';

export default class HandPanWrapper extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Initialise properties
        this.currentKey = 'D';
        this.currentScale = 'minor';
        this.currentSize = 'medium';
        this.audioEnabled = false;
        this.audioContextStarted = false;
        this.audioPreviewEnabled = true; // New property for audio preview toggle
        
        // Audio effect properties
        this.audioEffects = {
            reverb: {
                decay: 1.4,
                wet: 0.8,
                preDelay: 0.04
            },
            chorus: {
                frequency: 3.5,
                delayTime: 2.5,
                depth: 0.35,
                wet: 0.7
            },
            delay: {
                delayTime: 0.175, // 15n in seconds
                feedback: 0.2,
                wet: 0.85
            },
            synth: {
                attack: 0.062,
                decay: 0.26,
                sustain: 0.7,
                release: 0.3
            }
        };
        
        // Get all available keys and scales
        this.availableKeys = getAllKeys();
        this.availableScales = getAllScaleTypes();
        
        // Audio preview synth for slider changes
        this.previewSynth = null;
        this.previewTimeout = null; // For debouncing audio preview
        
        this.render();
        this.addEventListeners();
    }

    static get observedAttributes() {
        return ['key', 'scale', 'size', 'audio-enabled'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'key' || name === 'scale') {
            this.currentKey = this.getAttribute('key') || 'D';
            this.currentScale = this.getAttribute('scale') || 'minor';
            this.updateHandPan();
        }
        if (name === 'size') {
            this.currentSize = this.getAttribute('size') || 'medium';
            this.updateHandPan();
        }
        if (name === 'audio-enabled') {
            this.audioEnabled = this.getAttribute('audio-enabled') === 'true';
            this.updateAudioControls();
        }
    }

    connectedCallback() {
        // Set default attributes if not provided
        if (!this.hasAttribute('key')) {
            this.setAttribute('key', 'D');
        }
        if (!this.hasAttribute('scale')) {
            this.setAttribute('scale', 'minor');
        }
        if (!this.hasAttribute('size')) {
            this.setAttribute('size', 'medium');
        }
        if (!this.hasAttribute('audio-enabled')) {
            this.setAttribute('audio-enabled', 'false');
        }

        this.render();
        this.addEventListeners();
        
        // Apply note colors after everything is set up
        setTimeout(() => {
            this.applyKeyColors();
        }, 0);
        
        // Apply note colors to key buttons after initial render
        this.applyKeyColors();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import "../../hand-pan-wrapper.css";
            </style>
            
            <div class="hand-pan-wrapper">
                <!-- HandPan Component - Now at the top -->
                <div class="hand-pan-container">
                    <hand-pan 
                        id="handPan" 
                        key="${this.currentKey}" 
                        scale="${this.currentScale}" 
                        size="${this.currentSize}">
                    </hand-pan>
                </div>

                <!-- Settings Sections - All collapsible -->
                
                <!-- Audio Control Section -->
                <div class="control-section audio-section collapsible collapsed">
                    <div class="section-header" data-section="audio">
                        <h3>🎵 Audio Controls</h3>
                        <span class="collapse-icon">▼</span>
                    </div>
                    <div class="section-content">
                        <div class="audio-controls">
                            <button id="audioToggleBtn" class="control-btn ${this.audioEnabled ? 'enabled' : 'disabled'}">
                                ${this.audioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
                            </button>
                            <span id="audioStatus" class="status-text">
                                ${this.audioEnabled ? 'Audio ready' : 'Click to enable audio'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Audio Effects Section -->
                <div class="control-section effects-section collapsible collapsed">
                    <div class="section-header" data-section="effects">
                        <h3>🎛️ Audio Effects</h3>
                        <span class="collapse-icon">▼</span>
                    </div>
                    <div class="section-content">
                        <!-- Audio Preview Toggle -->
                        <div class="audio-preview-toggle">
                            <label class="checkbox-label">
                                <input type="checkbox" id="audioPreviewToggle" ${this.audioPreviewEnabled ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                🔊 Play C4 preview when changing sliders
                            </label>
                        </div>
                        
                        <div class="effects-grid">
                            <!-- Reverb Controls -->
                            <div class="effect-group">
                                <h4>🌊 Reverb</h4>
                                <div class="slider-group">
                                    <label>Decay: <span id="reverbDecayValue">${this.audioEffects.reverb.decay}</span></label>
                                    <input type="range" id="reverbDecay" min="0.1" max="2.0" step="0.1" value="${this.audioEffects.reverb.decay}" class="slider">
                                    
                                    <label>Wet: <span id="reverbWetValue">${this.audioEffects.reverb.wet}</span></label>
                                    <input type="range" id="reverbWet" min="0" max="1" step="0.05" value="${this.audioEffects.reverb.wet}" class="slider">
                                    
                                    <label>Pre-delay: <span id="reverbPreDelayValue">${this.audioEffects.reverb.preDelay}</span></label>
                                    <input type="range" id="reverbPreDelay" min="0.01" max="0.1" step="0.01" value="${this.audioEffects.reverb.preDelay}" class="slider">
                                </div>
                            </div>

                            <!-- Chorus Controls -->
                            <div class="effect-group">
                                <h4>🎭 Chorus</h4>
                                <div class="slider-group">
                                    <label>Frequency: <span id="chorusFreqValue">${this.audioEffects.chorus.frequency}</span></label>
                                    <input type="range" id="chorusFreq" min="0.5" max="5" step="0.1" value="${this.audioEffects.chorus.frequency}" class="slider">
                                    
                                    <label>Depth: <span id="chorusDepthValue">${this.audioEffects.chorus.depth}</span></label>
                                    <input type="range" id="chorusDepth" min="0" max="1" step="0.05" value="${this.audioEffects.chorus.depth}" class="slider">
                                    
                                    <label>Wet: <span id="chorusWetValue">${this.audioEffects.chorus.wet}</span></label>
                                    <input type="range" id="chorusWet" min="0" max="1" step="0.05" value="${this.audioEffects.chorus.wet}" class="slider">
                                </div>
                            </div>

                            <!-- Delay Controls -->
                            <div class="effect-group">
                                <h4>⏱️ Delay</h4>
                                <div class="slider-group">
                                    <label>Time: <span id="delayTimeValue">${this.audioEffects.delay.delayTime}</span></label>
                                    <input type="range" id="delayTime" min="0.05" max="0.5" step="0.025" value="${this.audioEffects.delay.delayTime}" class="slider">
                                    
                                    <label>Feedback: <span id="delayFeedbackValue">${this.audioEffects.delay.feedback}</span></label>
                                    <input type="range" id="delayFeedback" min="0" max="0.8" step="0.05" value="${this.audioEffects.delay.feedback}" class="slider">
                                    
                                    <label>Wet: <span id="delayWetValue">${this.audioEffects.delay.wet}</span></label>
                                    <input type="range" id="delayWet" min="0" max="1" step="0.05" value="${this.audioEffects.delay.wet}" class="slider">
                                </div>
                            </div>

                            <!-- Synth Controls -->
                            <div class="effect-group">
                                <h4>🎹 Synth</h4>
                                <div class="slider-group">
                                    <label>Attack: <span id="synthAttackValue">${this.audioEffects.synth.attack}</span></label>
                                    <input type="range" id="synthAttack" min="0.001" max="0.1" step="0.001" value="${this.audioEffects.synth.attack}" class="slider">
                                    
                                    <label>Decay: <span id="synthDecayValue">${this.audioEffects.synth.decay}</span></label>
                                    <input type="range" id="synthDecay" min="0.01" max="0.5" step="0.01" value="${this.audioEffects.synth.decay}" class="slider">
                                    
                                    <label>Sustain: <span id="synthSustainValue">${this.audioEffects.synth.sustain}</span></label>
                                    <input type="range" id="synthSustain" min="0" max="1" step="0.05" value="${this.audioEffects.synth.sustain}" class="slider">
                                    
                                    <label>Release: <span id="synthReleaseValue">${this.audioEffects.synth.release}</span></label>
                                    <input type="range" id="synthRelease" min="0.1" max="2" step="0.05" value="${this.audioEffects.synth.release}" class="slider">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Reset Effects Button -->
                        <div class="effects-actions">
                            <button id="resetEffectsBtn" class="control-btn secondary">Reset to Defaults</button>
                        </div>
                    </div>
                </div>

                <!-- Key Selection Section -->
                <div class="control-section key-section collapsible collapsed">
                    <div class="section-header" data-section="key">
                        <h3>🎼 Key Selection</h3>
                        <span class="collapse-icon">▼</span>
                    </div>
                    <div class="section-content">
                        <div class="key-controls">
                            <div class="key-row">
                                <label>Key:</label>
                                <div class="key-buttons-container">
                                    ${this.availableKeys.map(key => 
                                        `<button class="key-btn ${this.currentKey === key ? 'active' : ''}" data-key="${key}">${key}</button>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="key-row">
                                <label>Scale:</label>
                                <select id="scaleSelect" class="control-select">
                                    ${this.availableScales.map(scale => 
                                        `<option value="${scale}" ${this.currentScale === scale ? 'selected' : ''}>${scale.charAt(0).toUpperCase() + scale.slice(1)}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Size Selection Section -->
                <div class="control-section size-section collapsible collapsed">
                    <div class="section-header" data-section="size">
                        <h3>📏 Size Selection</h3>
                        <span class="collapse-icon">▼</span>
                    </div>
                    <div class="section-content">
                        <div class="size-controls">
                            <button id="sizeSmall" class="size-btn ${this.currentSize === 'small' ? 'active' : ''}" data-size="small">
                                Small
                            </button>
                            <button id="sizeMedium" class="size-btn ${this.currentSize === 'medium' ? 'active' : ''}" data-size="medium">
                                Medium
                            </button>
                            <button id="sizeLarge" class="size-btn ${this.currentSize === 'large' ? 'active' : ''}" data-size="large">
                                Large
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Event Log -->
                <div class="control-section log-section collapsible collapsed">
                    <div class="section-header" data-section="log">
                        <h3>📝 Event Log</h3>
                        <span class="collapse-icon">▼</span>
                    </div>
                    <div class="section-content">
                        <div id="eventLog" class="event-log">
                            <div class="log-entry">HandPan wrapper ready...</div>
                        </div>
                        <button id="clearLogBtn" class="control-btn secondary">Clear Log</button>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        // Collapsible section headers
        const sectionHeaders = this.shadowRoot.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const section = e.currentTarget.closest('.collapsible');
                section.classList.toggle('collapsed');
            });
        });

        // Audio preview toggle
        const audioPreviewToggle = this.shadowRoot.getElementById('audioPreviewToggle');
        audioPreviewToggle.addEventListener('change', (e) => {
            this.audioPreviewEnabled = e.target.checked;
            this.logEvent(`Audio preview ${this.audioPreviewEnabled ? 'enabled' : 'disabled'}`);
        });

        // Audio toggle
        const audioToggleBtn = this.shadowRoot.getElementById('audioToggleBtn');
        audioToggleBtn.addEventListener('click', () => this.toggleAudio());

        // Audio effect sliders
        this.addEffectSliderListeners();

        // Reset effects button
        const resetEffectsBtn = this.shadowRoot.getElementById('resetEffectsBtn');
        resetEffectsBtn.addEventListener('click', () => this.resetEffects());

        // Key selection buttons
        const keyBtns = this.shadowRoot.querySelectorAll('.key-btn');
        keyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentKey = e.target.dataset.key;
                this.updateKeyButtons();
                this.updateHandPan();
            });
        });

        const scaleSelect = this.shadowRoot.getElementById('scaleSelect');
        scaleSelect.addEventListener('change', (e) => {
            this.currentScale = e.target.value;
            this.updateHandPan();
        });

        // Size selection
        const sizeBtns = this.shadowRoot.querySelectorAll('.size-btn');
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentSize = e.target.dataset.size;
                this.updateSizeButtons();
                this.updateHandPan();
            });
        });

        // Clear log
        const clearLogBtn = this.shadowRoot.getElementById('clearLogBtn');
        clearLogBtn.addEventListener('click', () => this.clearLog());

        // Listen for HandPan events
        this.addEventListener('note-played', (event) => {
            this.logEvent(`Note played: ${event.detail.note} (index: ${event.detail.index})`);
        });

        this.addEventListener('key-changed', (event) => {
            this.logEvent(`Key changed to: ${event.detail.key} ${event.detail.scale}`);
        });
    }

    addEffectSliderListeners() {
        // Reverb sliders
        this.addSliderListener('reverbDecay', 'reverb', 'decay');
        this.addSliderListener('reverbWet', 'reverb', 'wet');
        this.addSliderListener('reverbPreDelay', 'reverb', 'preDelay');

        // Chorus sliders
        this.addSliderListener('chorusFreq', 'chorus', 'frequency');
        this.addSliderListener('chorusDepth', 'chorus', 'depth');
        this.addSliderListener('chorusWet', 'chorus', 'wet');

        // Delay sliders
        this.addSliderListener('delayTime', 'delay', 'delayTime');
        this.addSliderListener('delayFeedback', 'delay', 'feedback');
        this.addSliderListener('delayWet', 'delay', 'wet');

        // Synth sliders
        this.addSliderListener('synthAttack', 'synth', 'attack');
        this.addSliderListener('synthDecay', 'synth', 'decay');
        this.addSliderListener('synthSustain', 'synth', 'sustain');
        this.addSliderListener('synthRelease', 'synth', 'release');
    }

    addSliderListener(sliderId, effectType, property) {
        const slider = this.shadowRoot.getElementById(sliderId);
        const valueDisplay = this.shadowRoot.getElementById(sliderId + 'Value');
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.audioEffects[effectType][property] = value;
            
            // Update display
            if (valueDisplay) {
                valueDisplay.textContent = value.toFixed(3);
            }
            
            // Apply effect to hand-pan
            this.applyAudioEffects();
            
            // Play audio preview if enabled (with debouncing)
            if (this.audioPreviewEnabled && this.audioEnabled) {
                // Clear existing timeout
                if (this.previewTimeout) {
                    clearTimeout(this.previewTimeout);
                }
                // Set new timeout for debounced preview
                this.previewTimeout = setTimeout(() => {
                    this.playAudioPreview();
                }, 100);
            }
            
            this.logEvent(`${effectType} ${property} changed to ${value.toFixed(3)}`);
        });
    }

    async playAudioPreview() {
        try {
            if (!this.audioEnabled) {
                return;
            }

            const { default: Tone } = await import('https://unpkg.com/tone@14.7.77/build/Tone.js');
            
            // Always dispose and recreate the preview synth to get fresh effects
            if (this.previewSynth) {
                this.previewSynth.dispose();
                this.previewSynth = null;
            }
            
            // Create a simple synth for preview
            this.previewSynth = new Tone.Synth({
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: this.audioEffects.synth.attack,
                    decay: this.audioEffects.synth.decay,
                    sustain: this.audioEffects.synth.sustain,
                    release: this.audioEffects.synth.release
                }
            });
            
            // Apply current audio effects to the preview synth
            if (this.audioEffects) {
                // Create effects chain
                const reverb = new Tone.Reverb({
                    decay: this.audioEffects.reverb.decay,
                    preDelay: this.audioEffects.reverb.preDelay
                });
                reverb.wet.value = this.audioEffects.reverb.wet;
                
                const chorus = new Tone.Chorus({
                    frequency: this.audioEffects.chorus.frequency,
                    delayTime: this.audioEffects.chorus.delayTime,
                    depth: this.audioEffects.chorus.depth
                });
                chorus.wet.value = this.audioEffects.chorus.wet;
                
                const delay = new Tone.FeedbackDelay({
                    delayTime: this.audioEffects.delay.delayTime,
                    feedback: this.audioEffects.delay.feedback
                });
                delay.wet.value = this.audioEffects.delay.wet;
                
                // Connect the chain
                this.previewSynth.chain(reverb, chorus, delay, Tone.Destination);
            } else {
                this.previewSynth.toDestination();
            }
            
            // Play C4 note
            this.previewSynth.triggerAttackRelease('C4', '8n');
        } catch (error) {
            console.log('Audio preview error:', error);
        }
    }

    applyAudioEffects() {
        const handPan = this.shadowRoot.getElementById('handPan');
        if (handPan && handPan.audioEffects) {
            try {
                // Apply synth envelope changes
                if (handPan.audioEffects.synth && handPan.audioEffects.synth.envelope) {
                    handPan.audioEffects.synth.envelope.attack = this.audioEffects.synth.attack;
                    handPan.audioEffects.synth.envelope.decay = this.audioEffects.synth.decay;
                    handPan.audioEffects.synth.envelope.sustain = this.audioEffects.synth.sustain;
                    handPan.audioEffects.synth.envelope.release = this.audioEffects.synth.release;
                }

                // Apply reverb changes
                if (handPan.audioEffects.reverb) {
                    handPan.audioEffects.reverb.decay = this.audioEffects.reverb.decay;
                    handPan.audioEffects.reverb.wet.value = this.audioEffects.reverb.wet;
                    handPan.audioEffects.reverb.preDelay = this.audioEffects.reverb.preDelay;
                }

                // Apply chorus changes
                if (handPan.audioEffects.chorus) {
                    handPan.audioEffects.chorus.frequency.value = this.audioEffects.chorus.frequency;
                    handPan.audioEffects.chorus.depth.value = this.audioEffects.chorus.depth;
                    handPan.audioEffects.chorus.wet.value = this.audioEffects.chorus.wet;
                }

                // Apply delay changes
                if (handPan.audioEffects.delay) {
                    handPan.audioEffects.delay.delayTime.value = this.audioEffects.delay.delayTime;
                    handPan.audioEffects.delay.feedback.value = this.audioEffects.delay.feedback;
                    handPan.audioEffects.delay.wet.value = this.audioEffects.delay.wet;
                }
            } catch (error) {
                this.logEvent(`Error applying audio effects: ${error.message}`);
            }
        }
        
        // Reset preview synth so it gets recreated with new effects
        if (this.previewSynth) {
            this.previewSynth.dispose();
            this.previewSynth = null;
        }
    }

    resetEffects() {
        // Reset to default values
        this.audioEffects = {
            reverb: {
                decay: 1.4,
                wet: 0.8,
                preDelay: 0.04
            },
            chorus: {
                frequency: 3.5,
                delayTime: 2.5,
                depth: 0.35,
                wet: 0.7
            },
            delay: {
                delayTime: 0.175,
                feedback: 0.2,
                wet: 0.85
            },
            synth: {
                attack: 0.062,
                decay: 0.26,
                sustain: 0.7,
                release: 0.3
            }
        };

        // Update sliders and displays
        this.updateEffectSliders();
        
        // Apply effects
        this.applyAudioEffects();
        
        this.logEvent('Audio effects reset to defaults');
    }

    updateEffectSliders() {
        // Update all sliders and their value displays
        Object.keys(this.audioEffects).forEach(effectType => {
            Object.keys(this.audioEffects[effectType]).forEach(property => {
                const sliderId = effectType + property.charAt(0).toUpperCase() + property.slice(1);
                const slider = this.shadowRoot.getElementById(sliderId);
                const valueDisplay = this.shadowRoot.getElementById(sliderId + 'Value');
                
                if (slider) {
                    slider.value = this.audioEffects[effectType][property];
                }
                if (valueDisplay) {
                    valueDisplay.textContent = this.audioEffects[effectType][property].toFixed(3);
                }
            });
        });
    }

    async toggleAudio() {
        if (!this.audioEnabled) {
            try {
                // Import Tone.js dynamically
                const { default: Tone } = await import('https://unpkg.com/tone@14.7.77/build/Tone.js');
                await Tone.start();
                
                this.audioEnabled = true;
                this.audioContextStarted = true;
                this.updateAudioControls();
                this.logEvent('Audio context started successfully');
                
                // Apply audio effects after audio is enabled
                setTimeout(() => {
                    this.applyAudioEffects();
                }, 200);
                
                // Dispatch audio-enabled event
                this.dispatchEvent(new CustomEvent('audio-enabled', {
                    detail: { enabled: true }
                }));
            } catch (error) {
                this.logEvent(`Error starting audio: ${error.message}`);
            }
        } else {
            this.audioEnabled = false;
            this.updateAudioControls();
            this.logEvent('Audio disabled');
            
            // Clean up preview synth when audio is disabled
            if (this.previewSynth) {
                this.previewSynth.dispose();
                this.previewSynth = null;
            }
            
            // Clear any pending preview timeout
            if (this.previewTimeout) {
                clearTimeout(this.previewTimeout);
                this.previewTimeout = null;
            }
            
            // Dispatch audio-disabled event
            this.dispatchEvent(new CustomEvent('audio-disabled', {
                detail: { enabled: false }
            }));
        }
    }

    updateAudioControls() {
        const audioToggleBtn = this.shadowRoot.getElementById('audioToggleBtn');
        const audioStatus = this.shadowRoot.getElementById('audioStatus');
        
        if (this.audioEnabled) {
            audioToggleBtn.textContent = '🔊 Audio On';
            audioToggleBtn.className = 'control-btn enabled';
            audioStatus.textContent = 'Audio ready';
        } else {
            audioToggleBtn.textContent = '🔇 Audio Off';
            audioToggleBtn.className = 'control-btn disabled';
            audioStatus.textContent = 'Click to enable audio';
        }
    }

    updateHandPan() {
        const handPan = this.shadowRoot.getElementById('handPan');
        if (handPan) {
            handPan.setAttribute('key', this.currentKey);
            handPan.setAttribute('scale', this.currentScale);
            handPan.setAttribute('size', this.currentSize);
            
            // Apply audio effects after a short delay to ensure hand-pan is ready
            setTimeout(() => {
                this.applyAudioEffects();
            }, 100);
        }
    }

    updateSizeButtons() {
        const sizeBtns = this.shadowRoot.querySelectorAll('.size-btn');
        sizeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === this.currentSize);
        });
    }

    logEvent(message) {
        const eventLog = this.shadowRoot.getElementById('eventLog');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `[${timestamp}] ${message}`;
        eventLog.appendChild(logEntry);
        eventLog.scrollTop = eventLog.scrollHeight;
    }

    clearLog() {
        const eventLog = this.shadowRoot.getElementById('eventLog');
        eventLog.innerHTML = '<div class="log-entry">Log cleared...</div>';
    }

    // Public methods for external control
    enableAudio() {
        if (!this.audioEnabled) {
            this.toggleAudio();
        }
    }

    disableAudio() {
        if (this.audioEnabled) {
            this.toggleAudio();
        }
    }

    setKey(key, scale) {
        this.currentKey = key;
        this.currentScale = scale;
        this.updateHandPan();
    }

    setSize(size) {
        this.currentSize = size;
        this.updateSizeButtons();
        this.updateHandPan();
    }

    getHandPan() {
        return this.shadowRoot.getElementById('handPan');
    }

    /**
     * Apply note colors to key selection buttons
     */
    applyKeyColors() {
        const keyBtns = this.shadowRoot.querySelectorAll('.key-btn');
        keyBtns.forEach(btn => {
            const key = btn.dataset.key;
            if (key) {
                applyNoteColor(btn, key, {
                    useBackground: true,
                    useTextColor: false,
                    applySharpFlatStyling: true
                });
                
                // Ensure text is white for visibility
                btn.style.color = '#fff';
                btn.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
                btn.style.fontWeight = 'bold';
            }
        });
    }

    /**
     * Update active state of key buttons
     */
    updateKeyButtons() {
        const keyBtns = this.shadowRoot.querySelectorAll('.key-btn');
        keyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.key === this.currentKey);
        });
    }
}

customElements.define('hand-pan-wrapper', HandPanWrapper); 