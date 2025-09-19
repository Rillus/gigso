import { checkToneJsStatus, getAudioErrorMessage, logAudioStatus } from '../../helpers/audioUtils.js';
import audioManager from '../../helpers/audioManager.js';
import state from '../../state/state.js';

export default class MobileUkulele extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Initialize properties
        this.tuning = 'standard';
        this.size = 'mobile';
        this.frets = 6;
        this.showNotes = false;
        this.isMuted = false;

        // Tuning configurations
        this.tunings = {
            'standard': ['G4', 'C4', 'E4', 'A4'],
            'low-g': ['G3', 'C4', 'E4', 'A4'],
            'baritone': ['D3', 'G3', 'B3', 'E4']
        };

        this.strings = this.tunings[this.tuning];

        // Touch and interaction state
        this.pressedFrets = new Map(); // string -> fret mapping
        this.activeTouches = new Map(); // touch id -> {type, string, fret}
        this.lastPlayTime = 0;
        this.minPlayInterval = 50; // Minimum time between note triggers (ms)

        // Audio properties
        this.instrumentVolume = 0.8;
        this.masterVolume = 0.7;

        // UI references
        this.fretButtons = [];
        this.strumArea = null;

        // Create ukulele synthesiser
        this.createUkuleleSynth();
    }

    static get observedAttributes() {
        return ['tuning', 'size', 'frets', 'show-notes'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'tuning') {
            this.changeTuning(newValue || 'standard');
        }
        if (name === 'size') {
            this.size = newValue || 'mobile';
            this.render();
        }
        if (name === 'frets') {
            this.frets = parseInt(newValue) || 6;
            this.render();
        }
        if (name === 'show-notes') {
            this.showNotes = newValue === 'true' || newValue === '';
            this.render();
        }
    }

    connectedCallback() {
        console.log('MobileUkulele: Component connected to DOM');

        // Log audio status for debugging
        logAudioStatus('MobileUkulele');

        // Set default attributes if not provided
        if (!this.hasAttribute('tuning')) {
            this.setAttribute('tuning', 'standard');
        }
        if (!this.hasAttribute('size')) {
            this.setAttribute('size', 'mobile');
        }
        if (!this.hasAttribute('frets')) {
            this.setAttribute('frets', '6');
        }
        if (!this.hasAttribute('show-notes')) {
            this.setAttribute('show-notes', 'false');
        }

        this.render();
        this.addEventListeners();

        // Listen for external events
        this.addEventListener('set-tuning', (event) => {
            const { tuning } = event.detail;
            this.changeTuning(tuning);
        });

        this.addEventListener('mute', () => {
            this.isMuted = true;
        });

        this.addEventListener('unmute', () => {
            this.isMuted = false;
        });

        this.addEventListener('highlight-chord', (event) => {
            const { chord, frets } = event.detail;
            this.highlightChord(chord, frets);
        });

        // Initialize audio context on first user interaction
        this.initializeAudioContext();

        console.log('MobileUkulele: Component initialization complete');

        // Register with mixer
        this.registerWithMixer();

        // Start level monitoring
        this.startLevelMonitoring();
    }

    disconnectedCallback() {
        // Stop level monitoring
        this.stopLevelMonitoring();

        // Clean up when component is removed from DOM
        this.cleanup();
    }

    createUkuleleSynth() {
        try {
            // Check if Tone.js is available
            const status = checkToneJsStatus();

            if (!status.available) {
                console.warn('MobileUkulele:', getAudioErrorMessage('MobileUkulele', status.error));
                this.createFallbackSynth();
                return;
            }

            // Create ukulele-specific synthesiser with bright, plucky sound
            this.synth = new Tone.PolySynth({
                oscillator: {
                    type: "sawtooth"  // Bright, plucky sound
                },
                envelope: {
                    attack: 0.01,     // Quick attack
                    decay: 0.1,       // Quick decay
                    sustain: 0.2,     // Low sustain
                    release: 0.5      // Medium release
                }
            });

            // Create subtle reverb for string resonance
            this.reverb = new Tone.Reverb({
                decay: 0.8,
                wet: 0.2
            });

            // Create slight delay for richness
            this.delay = new Tone.PingPongDelay({
                delayTime: 0.1,
                feedback: 0.1,
                wet: 0.1
            });

            // Create analyser for level monitoring
            this.analyser = new Tone.Analyser('waveform', 256);

            // Create effects chain: synth → delay → reverb → analyser → destination
            this.synth.connect(this.delay);
            this.delay.connect(this.reverb);
            this.reverb.connect(this.analyser);
            this.analyser.toDestination();

            // Expose effects for external control
            this.audioEffects = {
                synth: this.synth,
                reverb: this.reverb,
                delay: this.delay
            };

        } catch (error) {
            console.warn('MobileUkulele: Error creating audio synthesiser:', error);
            this.createFallbackSynth();
        }
    }

    createFallbackSynth() {
        try {
            if (typeof Tone !== 'undefined') {
                // Create fallback synthesiser without effects
                this.synth = new Tone.PolySynth({
                    oscillator: { type: "sawtooth" },
                    envelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.2,
                        release: 0.5
                    }
                });

                // Create analyser for level monitoring
                this.analyser = new Tone.Analyser('waveform', 256);

                // Connect: synth → analyser → destination
                this.synth.connect(this.analyser);
                this.analyser.toDestination();

                // Set fallback audio effects
                this.audioEffects = { synth: this.synth, analyser: this.analyser };

                // Set initial volume
                this.updateSynthVolume();
            } else {
                // Create mock synthesiser for test environments
                this.synth = {
                    triggerAttackRelease: () => {},
                    toDestination: () => {},
                    connect: () => {},
                    oscillator: { type: 'sawtooth' },
                    envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 }
                };
                this.audioEffects = { synth: this.synth };
            }
        } catch (error) {
            console.warn('MobileUkulele: Error creating fallback synthesiser:', error);
            // Create minimal mock synthesiser
            this.synth = {
                triggerAttackRelease: () => {},
                toDestination: () => {},
                connect: () => {},
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 }
            };
            this.audioEffects = { synth: this.synth };
        }
    }

    render() {
        console.log('MobileUkulele: Rendering component');

        const fretboard = this.createFretboard();
        const strumArea = this.createStrumArea();
        const audioStatus = this.getAudioStatusIndicator();

        this.shadowRoot.innerHTML = `
            <style>
                /* Mobile Ukulele Component Styles */
                .mobile-ukulele {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    height: 100%;
                    min-height: 200px;
                    background: linear-gradient(145deg, #8B4513 0%, #CD853F 50%, #F4A460 100%);
                    border-radius: 15px;
                    padding: 10px;
                    box-shadow:
                        inset 0 0 20px rgba(139, 69, 19, 0.3),
                        0 4px 20px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    position: relative;
                    user-select: none;
                    -webkit-user-select: none;
                    touch-action: manipulation;
                }

                .mobile-ukulele.mobile {
                    max-width: 100vw;
                    height: 180px;
                }

                .mobile-ukulele.tablet {
                    max-width: 90vw;
                    height: 220px;
                }

                .mobile-ukulele.desktop {
                    max-width: 800px;
                    height: 250px;
                }

                .fretboard {
                    flex: 1;
                    position: relative;
                    background: linear-gradient(90deg,
                        #D2691E 0%,
                        #CD853F 10%,
                        #DEB887 50%,
                        #CD853F 90%,
                        #D2691E 100%);
                    border-radius: 8px;
                    margin-right: 15px;
                    padding: 15px 10px;
                    box-shadow:
                        inset 0 0 10px rgba(139, 69, 19, 0.4),
                        0 2px 8px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .fretboard::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        rgba(139, 69, 19, 0.3) 10%,
                        rgba(139, 69, 19, 0.5) 50%,
                        rgba(139, 69, 19, 0.3) 90%,
                        transparent 100%);
                    transform: translateY(-50%);
                }

                .strings-container {
                    position: relative;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .string {
                    position: relative;
                    height: 4px;
                    background: linear-gradient(90deg,
                        #C0C0C0 0%,
                        #E5E5E5 50%,
                        #C0C0C0 100%);
                    border-radius: 2px;
                    box-shadow:
                        0 1px 2px rgba(0, 0, 0, 0.3),
                        inset 0 1px 1px rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 5px;
                }

                .string.string-1 { background: linear-gradient(90deg, #FFD700 0%, #FFF8DC 50%, #FFD700 100%); }
                .string.string-2 { background: linear-gradient(90deg, #E5E5E5 0%, #F8F8FF 50%, #E5E5E5 100%); }
                .string.string-3 { background: linear-gradient(90deg, #CD853F 0%, #F5DEB3 50%, #CD853F 100%); }
                .string.string-4 { background: linear-gradient(90deg, #C0C0C0 0%, #E5E5E5 50%, #C0C0C0 100%); }

                .fret-line {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(180deg,
                        transparent 10%,
                        #8B4513 30%,
                        #D2691E 50%,
                        #8B4513 70%,
                        transparent 90%);
                    transform: translateX(-50%);
                    z-index: 1;
                }

                .fret-button {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%,
                        #F5F5DC 0%,
                        #DDD 50%,
                        #AAA 100%);
                    border: 2px solid #8B4513;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    font-weight: bold;
                    color: #8B4513;
                    z-index: 10;
                    transform: translate(-50%, -50%);
                    box-shadow:
                        0 2px 4px rgba(0, 0, 0, 0.3),
                        inset 0 1px 2px rgba(255, 255, 255, 0.3);
                }

                .fret-button:hover {
                    background: radial-gradient(circle at 30% 30%,
                        #FFFACD 0%,
                        #F0E68C 50%,
                        #DAA520 100%);
                    transform: translate(-50%, -50%) scale(1.1);
                    box-shadow:
                        0 3px 6px rgba(0, 0, 0, 0.4),
                        inset 0 1px 3px rgba(255, 255, 255, 0.4);
                }

                .fret-button.pressed {
                    background: radial-gradient(circle at 30% 30%,
                        #FFD700 0%,
                        #FFA500 50%,
                        #FF8C00 100%);
                    border-color: #FF4500;
                    transform: translate(-50%, -50%) scale(0.9);
                    box-shadow:
                        inset 0 2px 4px rgba(0, 0, 0, 0.3),
                        0 1px 2px rgba(255, 215, 0, 0.4);
                    animation: fretPress 0.3s ease-out;
                }

                @keyframes fretPress {
                    0% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                }

                .fret-marker {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: radial-gradient(circle,
                        #FFD700 0%,
                        #DAA520 50%,
                        #B8860B 100%);
                    border: 1px solid #8B4513;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }

                .strum-area {
                    width: 120px;
                    background: linear-gradient(145deg,
                        #654321 0%,
                        #8B4513 50%,
                        #A0522D 100%);
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 15px 10px;
                    box-shadow:
                        inset 0 0 10px rgba(101, 67, 33, 0.4),
                        0 2px 8px rgba(0, 0, 0, 0.2);
                    position: relative;
                    overflow: hidden;
                }

                .strum-area::before {
                    content: '';
                    position: absolute;
                    top: 10px;
                    bottom: 10px;
                    left: 50%;
                    width: 2px;
                    background: linear-gradient(180deg,
                        transparent 0%,
                        #D2691E 20%,
                        #CD853F 50%,
                        #D2691E 80%,
                        transparent 100%);
                    transform: translateX(-50%);
                    z-index: 1;
                }

                .strum-zone {
                    flex: 1;
                    margin: 2px 0;
                    background: radial-gradient(ellipse at center,
                        rgba(255, 255, 255, 0.1) 0%,
                        rgba(255, 255, 255, 0.05) 30%,
                        transparent 60%);
                    border: 1px solid rgba(139, 69, 19, 0.3);
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                    color: rgba(255, 255, 255, 0.7);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                    z-index: 2;
                    position: relative;
                }

                .strum-zone:hover {
                    background: radial-gradient(ellipse at center,
                        rgba(255, 215, 0, 0.2) 0%,
                        rgba(255, 215, 0, 0.1) 30%,
                        transparent 60%);
                    border-color: rgba(255, 215, 0, 0.5);
                    transform: scale(1.05);
                    box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
                }

                .strum-zone.active {
                    background: radial-gradient(ellipse at center,
                        rgba(255, 215, 0, 0.4) 0%,
                        rgba(255, 165, 0, 0.2) 30%,
                        transparent 60%);
                    border-color: #FFD700;
                    transform: scale(0.95);
                    box-shadow:
                        inset 0 2px 4px rgba(255, 140, 0, 0.3),
                        0 0 8px rgba(255, 215, 0, 0.5);
                    animation: strumPulse 0.3s ease-out;
                }

                @keyframes strumPulse {
                    0% {
                        transform: scale(1);
                        box-shadow: 0 0 4px rgba(255, 215, 0, 0.3);
                    }
                    50% {
                        transform: scale(0.9);
                        box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
                    }
                }

                .string-label {
                    position: absolute;
                    left: -25px;
                    font-size: 10px;
                    font-weight: bold;
                    color: #8B4513;
                    background: rgba(255, 255, 255, 0.8);
                    padding: 2px 4px;
                    border-radius: 3px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                }

                .note-label {
                    font-size: 6px;
                    font-weight: bold;
                    color: #8B4513;
                    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
                }

                .audio-status-indicator {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 0, 0, 0.8);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: bold;
                    text-align: center;
                    z-index: 100;
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    animation: audioPulse 2s ease-in-out infinite;
                }

                .audio-status-indicator:hover {
                    background: rgba(255, 0, 0, 0.9);
                    transform: translate(-50%, -50%) scale(1.05);
                }

                @keyframes audioPulse {
                    0%, 100% {
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    }
                    50% {
                        box-shadow: 0 4px 20px rgba(255, 0, 0, 0.4);
                    }
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .mobile-ukulele.mobile {
                        height: 160px;
                    }

                    .fret-button {
                        width: 18px;
                        height: 18px;
                        font-size: 7px;
                    }

                    .strum-area {
                        width: 100px;
                    }

                    .strum-zone {
                        font-size: 9px;
                    }
                }

                @media (max-width: 480px) {
                    .mobile-ukulele.mobile {
                        height: 140px;
                        padding: 8px;
                    }

                    .fret-button {
                        width: 16px;
                        height: 16px;
                        font-size: 6px;
                    }

                    .strum-area {
                        width: 80px;
                        padding: 10px 8px;
                    }

                    .strum-zone {
                        font-size: 8px;
                    }
                }

                /* Landscape orientation optimization */
                @media (orientation: landscape) and (max-height: 500px) {
                    .mobile-ukulele {
                        height: 120px;
                        min-height: 120px;
                    }

                    .fret-button {
                        width: 14px;
                        height: 14px;
                        font-size: 6px;
                    }

                    .strum-area {
                        width: 70px;
                        padding: 8px 6px;
                    }

                    .strum-zone {
                        font-size: 7px;
                    }

                    .string {
                        height: 3px;
                    }
                }
            </style>

            <div class="mobile-ukulele ${this.size}">
                ${fretboard}
                ${strumArea}
                ${audioStatus}
            </div>
        `;

        // Store references to interactive elements
        this.updateUIReferences();
        this.addEventListeners();

        // Update audio status indicator
        this.updateAudioStatusIndicator();
    }

    createFretboard() {
        const stringElements = this.strings.map((stringNote, stringIndex) => {
            const fretButtonsForString = [];

            // Create fret buttons for this string
            for (let fretIndex = 0; fretIndex <= this.frets; fretIndex++) {
                const note = this.calculateNote(stringIndex, fretIndex);
                const position = (fretIndex / this.frets) * 100;

                fretButtonsForString.push(`
                    <div
                        class="fret-button"
                        data-string="${stringIndex}"
                        data-fret="${fretIndex}"
                        data-note="${note}"
                        style="left: ${position}%"
                        role="button"
                        tabindex="0"
                        aria-label="Play ${note} on string ${stringIndex + 1} fret ${fretIndex}"
                        aria-pressed="false"
                    >
                        ${this.showNotes ? `<span class="note-label">${note.replace(/\d/, '')}</span>` : ''}
                    </div>
                `);
            }

            return `
                <div class="string string-${stringIndex + 1}">
                    <div class="string-label">${stringNote.replace(/\d/, '')}</div>
                    ${fretButtonsForString.join('')}
                </div>
            `;
        }).join('');

        // Add fret markers at common positions
        const fretMarkers = [3, 5].map(fretNum => {
            if (fretNum <= this.frets) {
                const position = (fretNum / this.frets) * 100;
                return `<div class="fret-marker" style="left: ${position}%"></div>`;
            }
            return '';
        }).join('');

        // Add fret lines
        const fretLines = [];
        for (let fretIndex = 1; fretIndex <= this.frets; fretIndex++) {
            const position = (fretIndex / this.frets) * 100;
            fretLines.push(`<div class="fret-line" style="left: ${position}%"></div>`);
        }

        return `
            <div class="fretboard">
                ${fretLines.join('')}
                ${fretMarkers}
                <div class="strings-container">
                    ${stringElements}
                </div>
            </div>
        `;
    }

    createStrumArea() {
        const strumZones = this.strings.map((stringNote, stringIndex) => {
            return `
                <div
                    class="strum-zone"
                    data-string="${stringIndex}"
                    role="button"
                    tabindex="0"
                    aria-label="Strum string ${stringIndex + 1} (${stringNote.replace(/\d/, '')})"
                >
                    ${stringNote.replace(/\d/, '')}
                </div>
            `;
        }).join('');

        return `
            <div class="strum-area">
                ${strumZones}
            </div>
        `;
    }

    getAudioStatusIndicator() {
        // Only show audio status indicator if audio context is not running
        if (typeof Tone !== 'undefined' && Tone.context && Tone.context.state === 'running') {
            return '';
        }

        return `
            <div class="audio-status-indicator" id="audioStatusIndicator">
                <div class="audio-status-text">🔇 Tap to enable audio</div>
            </div>
        `;
    }

    updateUIReferences() {
        this.fretButtons = this.shadowRoot.querySelectorAll('.fret-button');
        this.strumArea = this.shadowRoot.querySelector('.strum-area');
        this.strumZones = this.shadowRoot.querySelectorAll('.strum-zone');
    }

    addEventListeners() {
        // Add event listeners to fret buttons
        this.fretButtons.forEach(button => {
            const string = parseInt(button.getAttribute('data-string'));
            const fret = parseInt(button.getAttribute('data-fret'));

            // Touch events for mobile
            button.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.handleFretPress(event, string, fret);
            });

            button.addEventListener('touchend', (event) => {
                event.preventDefault();
                this.handleFretRelease(event, string, fret);
            });

            // Mouse events for desktop
            button.addEventListener('mousedown', (event) => {
                this.handleFretPress(event, string, fret);
            });

            button.addEventListener('mouseup', (event) => {
                this.handleFretRelease(event, string, fret);
            });

            // Keyboard events for accessibility
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleFretPress(event, string, fret);
                }
            });

            button.addEventListener('keyup', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleFretRelease(event, string, fret);
                }
            });
        });

        // Add event listeners to strum zones
        this.strumZones.forEach(zone => {
            const string = parseInt(zone.getAttribute('data-string'));

            // Touch events for mobile
            zone.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.handleStrum(event, string);
            });

            // Mouse events for desktop
            zone.addEventListener('mousedown', (event) => {
                this.handleStrum(event, string);
            });

            // Keyboard events for accessibility
            zone.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleStrum(event, string);
                }
            });
        });

        // Add click handler for audio status indicator
        const audioIndicator = this.shadowRoot.getElementById('audioStatusIndicator');
        if (audioIndicator) {
            audioIndicator.addEventListener('click', async (event) => {
                event.stopPropagation();
                console.log('MobileUkulele: Audio status indicator clicked, attempting to start audio...');
                await this.ensureAudioContextRunning();
            });
        }
    }

    handleFretPress(event, string, fret) {
        console.log('MobileUkulele: Fret pressed - String:', string, 'Fret:', fret);

        // Store pressed fret for this string
        this.pressedFrets.set(string, fret);

        // Add visual feedback
        const button = event.target;
        button.classList.add('pressed');
        button.setAttribute('aria-pressed', 'true');

        // Track touch if it's a touch event
        if (event.touches && event.touches.length > 0) {
            const touch = event.touches[0];
            this.activeTouches.set(touch.identifier, {
                type: 'fret',
                string: string,
                fret: fret,
                element: button
            });
        }

        // Dispatch fret-pressed event
        const note = this.calculateNote(string, fret);
        this.dispatchEvent(new CustomEvent('fret-pressed', {
            detail: { string, fret, note }
        }));
    }

    handleFretRelease(event, string, fret) {
        console.log('MobileUkulele: Fret released - String:', string, 'Fret:', fret);

        // Remove pressed fret for this string
        this.pressedFrets.delete(string);

        // Remove visual feedback
        const button = event.target;
        button.classList.remove('pressed');
        button.setAttribute('aria-pressed', 'false');

        // Remove touch tracking if it's a touch event
        if (event.changedTouches && event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            this.activeTouches.delete(touch.identifier);
        }

        // Dispatch fret-released event
        const note = this.calculateNote(string, fret);
        this.dispatchEvent(new CustomEvent('fret-released', {
            detail: { string, fret, note }
        }));
    }

    async handleStrum(event, string) {
        if (this.isMuted) return;

        console.log('MobileUkulele: String strummed - String:', string);

        // Get the fret for this string (default to open string if none pressed)
        const fret = this.pressedFrets.get(string) || 0;
        const note = this.calculateNote(string, fret);

        // Add visual feedback to strum zone
        const zone = event.target;
        zone.classList.add('active');
        setTimeout(() => {
            zone.classList.remove('active');
        }, 300);

        // Play the note
        await this.playNote(string, fret, '4n');

        // Dispatch events
        this.dispatchEvent(new CustomEvent('note-played', {
            detail: {
                note,
                string,
                fret,
                frequency: this.noteToFrequency(note)
            }
        }));

        // Check if this creates a chord (multiple pressed frets)
        if (this.pressedFrets.size > 1) {
            const chordNotes = [];
            const chordFrets = [];

            for (let i = 0; i < this.strings.length; i++) {
                const fretForString = this.pressedFrets.get(i) || 0;
                chordNotes.push(this.calculateNote(i, fretForString));
                chordFrets.push(fretForString);
            }

            this.dispatchEvent(new CustomEvent('chord-played', {
                detail: {
                    chord: this.identifyChord(chordNotes),
                    notes: chordNotes,
                    frets: chordFrets
                }
            }));
        }
    }

    async playNote(string, fret, duration = '4n') {
        if (!this.synth || this.isAudioMuted()) {
            return;
        }

        try {
            // Ensure audio context is running
            const audioReady = await this.ensureAudioContextRunning();
            if (!audioReady) {
                console.warn('MobileUkulele: Audio context not ready, skipping note playback');
                return;
            }

            // Debounce rapid successive calls for performance
            const now = Date.now();
            if (now - this.lastPlayTime < this.minPlayInterval) {
                return;
            }
            this.lastPlayTime = now;

            const note = this.calculateNote(string, fret);

            // Use triggerAttackRelease for proper note timing
            if (typeof this.synth.triggerAttackRelease === 'function') {
                this.synth.triggerAttackRelease(note, duration);
            } else {
                console.warn('MobileUkulele: Local synthesiser not available, using AudioManager fallback');
                // Fallback to AudioManager for reliable audio
                audioManager.playNote(note, duration, "mobile-ukulele");
            }

        } catch (error) {
            console.warn('MobileUkulele: Error playing note:', error);
            // Don't throw error to prevent breaking user interaction
        }
    }

    async playChord(frets, duration = '2n') {
        if (!this.synth || this.isAudioMuted()) {
            return;
        }

        try {
            // Ensure audio context is running
            const audioReady = await this.ensureAudioContextRunning();
            if (!audioReady) {
                console.warn('MobileUkulele: Audio context not ready, skipping chord playback');
                return;
            }

            const notes = frets.map((fret, string) => this.calculateNote(string, fret));

            // Use triggerAttackRelease for proper chord timing
            if (typeof this.synth.triggerAttackRelease === 'function') {
                this.synth.triggerAttackRelease(notes, duration);
            } else {
                console.warn('MobileUkulele: Local synthesiser not available, using AudioManager fallback');
                // Fallback to AudioManager for reliable audio
                audioManager.playChord(notes, duration, "mobile-ukulele");
            }

        } catch (error) {
            console.warn('MobileUkulele: Error playing chord:', error);
            // Don't throw error to prevent breaking user interaction
        }
    }

    calculateNote(string, fret) {
        const openNote = this.strings[string];
        const noteMap = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };

        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // Parse the open note to get note name and octave
        const openNoteName = openNote.slice(0, -1);
        const openOctave = parseInt(openNote.slice(-1));

        // Calculate the semitone offset
        const openSemitone = noteMap[openNoteName];
        const newSemitone = (openSemitone + fret) % 12;
        const octaveOffset = Math.floor((openSemitone + fret) / 12);

        const newNoteName = noteNames[newSemitone];
        const newOctave = openOctave + octaveOffset;

        return newNoteName + newOctave;
    }

    noteToFrequency(note) {
        // Convert note name to frequency (A4 = 440Hz)
        const noteMap = {
            'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
            'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2
        };

        const noteName = note.slice(0, -1);
        const octave = parseInt(note.slice(-1));

        const semitoneOffset = noteMap[noteName];
        const octaveOffset = (octave - 4) * 12;
        const totalOffset = semitoneOffset + octaveOffset;

        return 440 * Math.pow(2, totalOffset / 12);
    }

    identifyChord(notes) {
        // Simple chord identification - could be expanded
        const uniqueNotes = [...new Set(notes.map(note => note.slice(0, -1)))];

        if (uniqueNotes.length === 1) {
            return uniqueNotes[0];
        }

        // Basic chord patterns
        const chordPatterns = {
            'C-E-G': 'C',
            'G-C-E': 'C',
            'E-G-C': 'C',
            'D-F#-A': 'D',
            'G-B-D': 'G',
            'A-C#-E': 'A',
            'F-A-C': 'F'
        };

        const sortedNotes = uniqueNotes.sort().join('-');
        return chordPatterns[sortedNotes] || 'Unknown';
    }

    changeTuning(tuning) {
        console.log('MobileUkulele: Changing tuning to', tuning);

        if (this.tunings[tuning]) {
            this.tuning = tuning;
            this.strings = this.tunings[tuning];

            // Clear pressed frets
            this.pressedFrets.clear();

            // Re-render with new tuning
            this.render();

            // Dispatch tuning-changed event
            this.dispatchEvent(new CustomEvent('tuning-changed', {
                detail: {
                    tuning: tuning,
                    strings: this.strings
                }
            }));
        } else {
            console.warn('MobileUkulele: Unknown tuning:', tuning);
        }
    }

    highlightChord(chord, frets) {
        console.log('MobileUkulele: Highlighting chord', chord, 'with frets', frets);

        // Clear existing highlights
        this.fretButtons.forEach(button => {
            button.classList.remove('highlighted');
        });

        // Highlight the specified frets
        if (frets && Array.isArray(frets)) {
            frets.forEach((fret, string) => {
                if (fret >= 0) {
                    const button = this.shadowRoot.querySelector(
                        `.fret-button[data-string="${string}"][data-fret="${fret}"]`
                    );
                    if (button) {
                        button.classList.add('highlighted');
                    }
                }
            });
        }
    }

    async ensureAudioContextRunning() {
        // Check if Tone.js is available
        const status = checkToneJsStatus();

        if (!status.available) {
            const errorMessage = getAudioErrorMessage('MobileUkulele', status.error);
            console.warn('MobileUkulele:', errorMessage);

            // Update the audio status indicator with helpful information
            this.updateAudioStatusIndicator(status.error);
            return false;
        }

        // Handle different audio context states
        if (Tone.context.state === 'suspended') {
            try {
                console.log('MobileUkulele: Audio context suspended, attempting to resume...');
                await Tone.context.resume();
                console.log('MobileUkulele: Audio context resumed successfully');
                this.updateAudioStatusIndicator();
                return true;
            } catch (error) {
                console.warn('MobileUkulele: Error resuming audio context:', error);
                this.updateAudioStatusIndicator('AUDIO_CONTEXT_FAILED');
                return false;
            }
        } else if (Tone.context.state !== 'running') {
            try {
                console.log('MobileUkulele: Audio context not running, attempting to start...');
                await Tone.start();
                console.log('MobileUkulele: Audio context started successfully');
                this.updateAudioStatusIndicator();
                return true;
            } catch (error) {
                console.warn('MobileUkulele: Error starting audio context:', error);
                this.updateAudioStatusIndicator('AUDIO_CONTEXT_FAILED');
                return false;
            }
        }
        return true;
    }

    updateAudioStatusIndicator(errorType = null) {
        const indicator = this.shadowRoot.getElementById('audioStatusIndicator');
        if (indicator) {
            if (typeof Tone !== 'undefined' && Tone.context && Tone.context.state === 'running') {
                indicator.style.display = 'none';
            } else {
                indicator.style.display = 'block';
                const textElement = indicator.querySelector('.audio-status-text');
                if (textElement) {
                    if (errorType) {
                        const errorMessage = getAudioErrorMessage('MobileUkulele', errorType);
                        textElement.textContent = '🔇 Audio Error - Tap for details';
                        textElement.title = errorMessage;
                    } else {
                        textElement.textContent = '🔇 Tap to enable audio';
                        textElement.title = 'Tap to enable audio functionality';
                    }
                }
            }
        }
    }

    initializeAudioContext() {
        // Add a one-time click listener to initialize audio context
        const initializeAudio = async () => {
            try {
                // Check if Tone.js is available
                if (typeof Tone === 'undefined') {
                    console.warn('MobileUkulele: Tone.js not loaded yet, waiting...');
                    return;
                }

                if (Tone.context.state !== 'running') {
                    console.log('MobileUkulele: Initializing audio context on first interaction...');
                    await Tone.start();
                    console.log('MobileUkulele: Audio context initialized successfully');
                    this.updateAudioStatusIndicator();
                }
                // Remove the listener after first use
                document.removeEventListener('click', initializeAudio);
                document.removeEventListener('touchstart', initializeAudio);
            } catch (error) {
                console.warn('MobileUkulele: Error initializing audio context:', error);
            }
        };

        // Add listeners for both mouse and touch interactions
        document.addEventListener('click', initializeAudio, { once: true });
        document.addEventListener('touchstart', initializeAudio, { once: true });
    }

    /**
     * Mixer Integration Methods
     */
    registerWithMixer() {
        // Find mixer component and register this instrument
        setTimeout(() => {
            const mixer = document.querySelector('gigso-mixer');
            if (mixer) {
                mixer.addInstrument({
                    id: 'mobile-ukulele',
                    name: 'Mobile Ukulele',
                    icon: '🎸',
                    volume: 0.8
                });
                console.log('MobileUkulele: Registered with mixer');
            }
        }, 100); // Small delay to ensure mixer is initialized

        // Listen for mixer events
        this.addEventListener('volume-change', this.handleVolumeChange.bind(this));
        this.addEventListener('mute-toggle', this.handleMuteToggle.bind(this));
        this.addEventListener('solo-toggle', this.handleSoloToggle.bind(this));
        this.addEventListener('master-volume-change', this.handleMasterVolumeChange.bind(this));
        this.addEventListener('master-mute-toggle', this.handleMasterMuteToggle.bind(this));
    }

    handleVolumeChange(event) {
        const { volume } = event.detail;
        console.log('MobileUkulele: Volume change received:', volume);

        this.instrumentVolume = volume;
        this.updateSynthVolume();
    }

    handleMuteToggle(event) {
        const { muted } = event.detail;
        console.log('MobileUkulele: Mute toggle received:', muted);
        this.isMuted = muted;
    }

    handleSoloToggle(event) {
        const { soloed } = event.detail;
        console.log('MobileUkulele: Solo toggle received:', soloed);
        // Solo logic is handled by the mixer muting other instruments
    }

    handleMasterVolumeChange(event) {
        const { volume } = event.detail;
        console.log('MobileUkulele: Master volume change received:', volume);

        this.masterVolume = volume;
        this.updateSynthVolume();
    }

    handleMasterMuteToggle(event) {
        const { muted } = event.detail;
        console.log('MobileUkulele: Master mute toggle received:', muted);
        this.masterMuted = muted;
    }

    updateSynthVolume() {
        if (this.synth && this.synth.volume) {
            // Multiply instrument and master volumes (0-1 range)
            const combinedVolume = (this.instrumentVolume || 0.8) * (this.masterVolume || 0.7);

            // Convert to decibels (-60dB to 0dB)
            const volumeDb = combinedVolume === 0 ? -60 : Math.log10(combinedVolume) * 20;
            this.synth.volume.value = volumeDb;

            console.log('MobileUkulele: Volume updated - Instrument:', this.instrumentVolume, 'Master:', this.masterVolume, 'Combined:', combinedVolume, 'dB:', volumeDb);
        }
    }

    startLevelMonitoring() {
        if (this.levelMonitoringInterval) return;

        this.levelMonitoringInterval = setInterval(() => {
            this.updateAudioLevel();
        }, 1000 / 30); // 30fps for individual instruments

        console.log('MobileUkulele: Level monitoring started');
    }

    stopLevelMonitoring() {
        if (this.levelMonitoringInterval) {
            clearInterval(this.levelMonitoringInterval);
            this.levelMonitoringInterval = null;
            console.log('MobileUkulele: Level monitoring stopped');
        }
    }

    updateAudioLevel() {
        if (!this.analyser) return;

        try {
            const bufferLength = this.analyser.size;
            const dataArray = this.analyser.getValue();

            // Calculate RMS level
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                const sample = Array.isArray(dataArray) ? dataArray[i] : dataArray[i] || 0;
                sum += sample * sample;
            }

            const rms = Math.sqrt(sum / bufferLength);
            const level = Math.min(rms * 8, 1.0); // Scale and clamp to 0-1

            // Find mixer component and update level
            const mixer = document.querySelector('gigso-mixer');
            if (mixer && mixer.updateLevel) {
                mixer.updateLevel('mobile-ukulele', level);
            }

        } catch (error) {
            console.warn('MobileUkulele: Error updating audio level:', error);
        }
    }

    isAudioMuted() {
        return this.isMuted || this.masterMuted;
    }

    cleanup() {
        try {
            // Clear pressed frets and active touches
            this.pressedFrets.clear();
            this.activeTouches.clear();

            // Remove event listeners
            if (this.fretButtons) {
                this.fretButtons.forEach(button => {
                    if (button) {
                        // Remove all event listeners - they'll be recreated on re-render
                        button.removeEventListener('touchstart', this.handleFretPress);
                        button.removeEventListener('touchend', this.handleFretRelease);
                        button.removeEventListener('mousedown', this.handleFretPress);
                        button.removeEventListener('mouseup', this.handleFretRelease);
                        button.removeEventListener('keydown', this.handleFretPress);
                        button.removeEventListener('keyup', this.handleFretRelease);
                    }
                });
            }

            if (this.strumZones) {
                this.strumZones.forEach(zone => {
                    if (zone) {
                        zone.removeEventListener('touchstart', this.handleStrum);
                        zone.removeEventListener('mousedown', this.handleStrum);
                        zone.removeEventListener('keydown', this.handleStrum);
                    }
                });
            }

            // Clean up audio effects if they exist
            if (this.audioEffects) {
                Object.values(this.audioEffects).forEach(effect => {
                    if (effect && typeof effect.dispose === 'function') {
                        effect.dispose();
                    }
                });
            }

            console.log('MobileUkulele: Cleanup completed');
        } catch (error) {
            console.warn('MobileUkulele: Error during cleanup:', error);
        }
    }
}

customElements.define('mobile-ukulele', MobileUkulele);
console.log('MobileUkulele: Custom element registered as "mobile-ukulele"');