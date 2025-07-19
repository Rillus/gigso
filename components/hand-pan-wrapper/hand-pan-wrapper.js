import { getAllKeys, getAllScaleTypes } from '../../helpers/scaleUtils.js';

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
        
        // Get all available keys and scales
        this.availableKeys = getAllKeys();
        this.availableScales = getAllScaleTypes();
        
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
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import "./components/hand-pan-wrapper/hand-pan-wrapper.css";
            </style>
            
            <div class="hand-pan-wrapper">
                <!-- Audio Control Section -->
                <div class="control-section audio-section">
                    <h3>🎵 Audio Controls</h3>
                    <div class="audio-controls">
                        <button id="audioToggleBtn" class="control-btn ${this.audioEnabled ? 'enabled' : 'disabled'}">
                            ${this.audioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
                        </button>
                        <span id="audioStatus" class="status-text">
                            ${this.audioEnabled ? 'Audio ready' : 'Click to enable audio'}
                        </span>
                    </div>
                </div>

                <!-- Key Selection Section -->
                <div class="control-section key-section">
                    <h3>🎼 Key Selection</h3>
                    <div class="key-controls">
                        <div class="key-row">
                            <label>Key:</label>
                            <select id="keySelect" class="control-select">
                                ${this.availableKeys.map(key => 
                                    `<option value="${key}" ${this.currentKey === key ? 'selected' : ''}>${key}</option>`
                                ).join('')}
                            </select>
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

                <!-- Size Selection Section -->
                <div class="control-section size-section">
                    <h3>📏 Size Selection</h3>
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

                <!-- HandPan Component -->
                <div class="hand-pan-container">
                    <hand-pan 
                        id="handPan" 
                        key="${this.currentKey}" 
                        scale="${this.currentScale}" 
                        size="${this.currentSize}">
                    </hand-pan>
                </div>

                <!-- Event Log -->
                <div class="control-section log-section">
                    <h3>📝 Event Log</h3>
                    <div id="eventLog" class="event-log">
                        <div class="log-entry">HandPan wrapper ready...</div>
                    </div>
                    <button id="clearLogBtn" class="control-btn secondary">Clear Log</button>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        // Audio toggle
        const audioToggleBtn = this.shadowRoot.getElementById('audioToggleBtn');
        audioToggleBtn.addEventListener('click', () => this.toggleAudio());

        // Key selection
        const keySelect = this.shadowRoot.getElementById('keySelect');
        keySelect.addEventListener('change', (e) => {
            this.currentKey = e.target.value;
            this.updateHandPan();
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
}

customElements.define('hand-pan-wrapper', HandPanWrapper); 