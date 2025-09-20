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

        this.strings = this.tunings[this.tuning].slice().reverse(); // Reverse for proper ukulele orientation

        // Touch and interaction state
        this.pressedFrets = new Map(); // string -> fret mapping
        this.activeTouches = new Map(); // touch id -> {type, string, fret}
        this.lastPlayTime = 0;
        this.minPlayInterval = 50; // Minimum time between note triggers (ms)

        // Chord playing state
        this.chordPlaybackDelay = 40; // Delay between strings in chord strumming (ms)

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

            // Create physically modelled ukulele synthesis using Karplus-Strong algorithm
            this.createPhysicalModelSynth();

            // Create analyser for level monitoring
            this.analyser = new Tone.Analyser('waveform', 256);

            // Connect analyser to destination
            this.analyser.toDestination();

            // Expose effects for external control
            this.audioEffects = {
                noise: this.noise,
                filter: this.filter,
                feedbackDelay: this.feedbackDelay,
                reverb: this.reverb,
                analyser: this.analyser
            };

        } catch (error) {
            console.warn('MobileUkulele: Error creating audio synthesiser:', error);
            this.createFallbackSynth();
        }
    }

    createPhysicalModelSynth() {
        // Create noise source for the "pluck"
        this.noise = new Tone.Noise("white").start();
        
        // Create feedback delay loop for string resonance
        this.feedbackDelay = new Tone.FeedbackDelay("8n", 0.5);
        
        // Create filter to model string dampening
        this.filter = new Tone.Filter(2000, "lowpass");
        
        // Create subtle reverb for string resonance
        this.reverb = new Tone.Reverb({
            decay: 0.8,
            wet: 0.15
        });
        
        // Connect the components: noise → filter → feedbackDelay → reverb
        this.noise.connect(this.filter);
        this.filter.connect(this.feedbackDelay);
        this.feedbackDelay.connect(this.reverb);
        this.reverb.connect(this.analyser);
        
        // The feedback loop: feedbackDelay → filter (creates the string resonance)
        this.feedbackDelay.connect(this.filter);
        
        // Set initial noise volume to silent
        this.noise.volume.value = -Infinity;
        
        // Create a polyphonic version by creating multiple instances for chords
        this.stringVoices = new Map(); // Map to store individual string voices
        
        console.log('MobileUkulele: Physical model synthesis created with Karplus-Strong algorithm');
    }

    createFallbackSynth() {
        try {
            if (typeof Tone !== 'undefined') {
                // Try to create physical model fallback
                try {
                    this.createPhysicalModelSynth();
                } catch (physicalError) {
                    console.warn('MobileUkulele: Physical model failed, using basic synthesiser fallback');
                    
                    // Create basic synthesiser fallback
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

                    // Override pluckString to use basic synth
                    this.pluckString = (note) => {
                        try {
                            if (this.synth && typeof this.synth.triggerAttackRelease === 'function') {
                                this.synth.triggerAttackRelease(note, '4n');
                            }
                        } catch (error) {
                            console.warn('MobileUkulele: Error in fallback pluckString:', error);
                        }
                    };
                }

                // Set initial volume
                this.updateSynthVolume();
            } else {
                // Create mock synthesiser for test environments
                this.noise = {
                    volume: { value: -Infinity, rampTo: () => {} },
                    start: () => {},
                    connect: () => {}
                };
                this.filter = {
                    connect: () => {},
                    dispose: () => {}
                };
                this.feedbackDelay = {
                    delayTime: { value: 0 },
                    connect: () => {},
                    dispose: () => {}
                };
                this.reverb = {
                    connect: () => {},
                    dispose: () => {}
                };
                this.analyser = {
                    connect: () => {},
                    dispose: () => {}
                };
                
                // Mock pluckString function
                this.pluckString = () => {
                    console.log('MobileUkulele: Mock pluckString called (test environment)');
                };
                
                this.audioEffects = { 
                    noise: this.noise, 
                    filter: this.filter, 
                    feedbackDelay: this.feedbackDelay,
                    reverb: this.reverb,
                    analyser: this.analyser 
                };
            }
        } catch (error) {
            console.warn('MobileUkulele: Error creating fallback synthesiser:', error);
            // Create minimal mock synthesiser
            this.noise = {
                volume: { value: -Infinity, rampTo: () => {} },
                start: () => {},
                connect: () => {}
            };
            this.pluckString = () => {};
            this.audioEffects = { noise: this.noise };
        }
    }

    render() {
        console.log('MobileUkulele: Rendering component');

        const fretboard = this.createFretboard();
        const chordArea = this.createChordArea();
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
                    box-sizing: border-box;
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
                    flex: 0 0 80%;
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

                .chord-area {
                    flex: 1;
                    min-width: 80px;
                    background: linear-gradient(145deg,
                        #654321 0%,
                        #8B4513 50%,
                        #A0522D 100%);
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 15px;
                    padding: 20px 10px;
                    box-shadow:
                        inset 0 0 10px rgba(101, 67, 33, 0.4),
                        0 2px 8px rgba(0, 0, 0, 0.2);
                    position: relative;
                    overflow: hidden;
                }

                .chord-button {
                    flex: 1;
                    min-height: 50px;
                    background: linear-gradient(145deg,
                        rgba(255, 255, 255, 0.1) 0%,
                        rgba(255, 255, 255, 0.05) 50%,
                        transparent 100%);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #FFE4B5;
                    font-weight: 600;
                    font-size: 12px;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                    cursor: pointer;
                    transition: all 0.15s ease;
                    user-select: none;
                    touch-action: manipulation;
                    outline: none;
                }

                .chord-button:hover {
                    background: linear-gradient(145deg,
                        rgba(255, 255, 255, 0.2) 0%,
                        rgba(255, 255, 255, 0.1) 50%,
                        rgba(255, 255, 255, 0.05) 100%);
                    border-color: rgba(255, 255, 255, 0.4);
                    color: #FFF;
                    transform: scale(1.02);
                }

                .chord-button:active,
                .chord-button.active {
                    background: linear-gradient(145deg,
                        rgba(255, 215, 0, 0.3) 0%,
                        rgba(255, 215, 0, 0.2) 50%,
                        rgba(255, 215, 0, 0.1) 100%);
                    border-color: rgba(255, 215, 0, 0.6);
                    color: #FFD700;
                    transform: scale(0.98);
                    box-shadow:
                        inset 0 0 10px rgba(255, 215, 0, 0.3),
                        0 0 15px rgba(255, 215, 0, 0.4);
                }

                .chord-button-icon {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 4px;
                }

                .chord-button-label {
                    font-size: 10px;
                    opacity: 0.8;
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

                    .chord-area {
                        width: 100px;
                    }

                    .chord-button {
                        min-height: 40px;
                        font-size: 9px;
                    }

                    .chord-button-icon {
                        font-size: 16px;
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

                    .chord-area {
                        width: 80px;
                        padding: 10px 8px;
                    }

                    .chord-button {
                        min-height: 35px;
                        font-size: 8px;
                    }

                    .chord-button-icon {
                        font-size: 14px;
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

                    .chord-area {
                        width: 70px;
                        padding: 8px 6px;
                    }

                    .chord-button {
                        min-height: 30px;
                        font-size: 7px;
                    }

                    .chord-button-icon {
                        font-size: 12px;
                    }

                    .string {
                        height: 3px;
                    }
                }
            </style>

            <div class="mobile-ukulele ${this.size}">
                ${fretboard}
                ${chordArea}
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

            // Create fret buttons for this string (starting from fret 1, since fret 0 is open string)
            for (let fretIndex = 1; fretIndex <= this.frets; fretIndex++) {
                const note = this.calculateNote(stringIndex, fretIndex);
                const position = ((fretIndex - 1) / (this.frets - 1)) * 100;

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
                const position = ((fretNum - 1) / (this.frets - 1)) * 100;
                return `<div class="fret-marker" style="left: ${position}%"></div>`;
            }
            return '';
        }).join('');

        // Add fret lines
        const fretLines = [];
        for (let fretIndex = 1; fretIndex <= this.frets; fretIndex++) {
            const position = ((fretIndex - 1) / (this.frets - 1)) * 100;
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

    createChordArea() {
        return `
            <div class="chord-area">
                <button
                    class="chord-button upstroke"
                    id="upstroke-button"
                    role="button"
                    tabindex="0"
                    aria-label="Play upstroke chord (A-E-C-G)"
                >
                    <div class="chord-button-icon">↑</div>
                    <div class="chord-button-label">Up</div>
                </button>
                <button
                    class="chord-button downstroke"
                    id="downstroke-button"
                    role="button"
                    tabindex="0"
                    aria-label="Play downstroke chord (G-C-E-A)"
                >
                    <div class="chord-button-icon">↓</div>
                    <div class="chord-button-label">Down</div>
                </button>
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
        this.chordArea = this.shadowRoot.querySelector('.chord-area');
        this.upstrokeButton = this.shadowRoot.querySelector('#upstroke-button');
        this.downstrokeButton = this.shadowRoot.querySelector('#downstroke-button');
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

        // Add event listeners to chord buttons
        if (this.upstrokeButton) {
            // Touch events
            this.upstrokeButton.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.handleUpstroke(event);
            });

            // Mouse events
            this.upstrokeButton.addEventListener('mousedown', (event) => {
                this.handleUpstroke(event);
            });

            // Keyboard events
            this.upstrokeButton.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleUpstroke(event);
                }
            });
        }

        if (this.downstrokeButton) {
            // Touch events
            this.downstrokeButton.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.handleDownstroke(event);
            });

            // Mouse events
            this.downstrokeButton.addEventListener('mousedown', (event) => {
                this.handleDownstroke(event);
            });

            // Keyboard events
            this.downstrokeButton.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleDownstroke(event);
                }
            });
        }

        // Chord area is handled by individual button event listeners above

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
                element: button,
                touchId: touch.identifier
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

        // Add visual feedback to strum zone if available
        const zone = event.target || this.shadowRoot.querySelector(`.strum-zone[data-string="${string}"]`);
        if (zone && zone.classList) {
            zone.classList.add('active');
            setTimeout(() => {
                zone.classList.remove('active');
            }, 300);
        }

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

    async handleUpstroke(event) {
        if (this.isMuted) return;

        console.log('MobileUkulele: Upstroke triggered');

        // Add visual feedback to button
        const button = event.target.closest('.chord-button');
        if (button) {
            button.classList.add('active');
            setTimeout(() => {
                button.classList.remove('active');
            }, 200);
        }

        // Play chord in upstroke order: A-E-C-G (string indices 0,1,2,3)
        const upstrokeOrder = [0, 1, 2, 3]; // A-E-C-G
        const chordNotes = [];
        const chordFrets = [];

        // Calculate notes for each string
        for (let i = 0; i < this.strings.length; i++) {
            const fret = this.pressedFrets.get(i) || 0;
            chordNotes.push(this.calculateNote(i, fret));
            chordFrets.push(fret);
        }

        // Play notes with slight delay between each string
        const strumDelay = 40; // 40ms delay between strings
        for (let i = 0; i < upstrokeOrder.length; i++) {
            const stringIndex = upstrokeOrder[i];
            const fret = this.pressedFrets.get(stringIndex) || 0;

            setTimeout(async () => {
                await this.playNote(stringIndex, fret, '4n');
            }, i * strumDelay);
        }

        // Dispatch upstroke event
        this.dispatchEvent(new CustomEvent('upstroke-played', {
            detail: {
                direction: 'up',
                chord: this.identifyChord(chordNotes),
                notes: chordNotes,
                frets: chordFrets,
                order: upstrokeOrder
            }
        }));
    }

    async handleDownstroke(event) {
        if (this.isMuted) return;

        console.log('MobileUkulele: Downstroke triggered');

        // Add visual feedback to button
        const button = event.target.closest('.chord-button');
        if (button) {
            button.classList.add('active');
            setTimeout(() => {
                button.classList.remove('active');
            }, 200);
        }

        // Play chord in downstroke order: G-C-E-A (string indices 3,2,1,0)
        const downstrokeOrder = [3, 2, 1, 0]; // G-C-E-A
        const chordNotes = [];
        const chordFrets = [];

        // Calculate notes for each string
        for (let i = 0; i < this.strings.length; i++) {
            const fret = this.pressedFrets.get(i) || 0;
            chordNotes.push(this.calculateNote(i, fret));
            chordFrets.push(fret);
        }

        // Play notes with slight delay between each string
        const strumDelay = 40; // 40ms delay between strings
        for (let i = 0; i < downstrokeOrder.length; i++) {
            const stringIndex = downstrokeOrder[i];
            const fret = this.pressedFrets.get(stringIndex) || 0;

            setTimeout(async () => {
                await this.playNote(stringIndex, fret, '4n');
            }, i * strumDelay);
        }

        // Dispatch downstroke event
        this.dispatchEvent(new CustomEvent('downstroke-played', {
            detail: {
                direction: 'down',
                chord: this.identifyChord(chordNotes),
                notes: chordNotes,
                frets: chordFrets,
                order: downstrokeOrder
            }
        }));
    }

    // Old swipe methods removed - now using chord buttons for upstroke/downstroke

    async playNote(string, fret, duration = '4n') {
        if (!this.noise || this.isAudioMuted()) {
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
            
            // Use physically modelled string pluck
            this.pluckString(note);

        } catch (error) {
            console.warn('MobileUkulele: Error playing note:', error);
            // Don't throw error to prevent breaking user interaction
        }
    }

    pluckString(note) {
        try {
            // Convert note to frequency and set the delay time
            // This is the core of the pitch control in Karplus-Strong synthesis
            const frequency = this.noteToFrequency(note);
            const delayTime = 1 / frequency; // Delay time = 1/frequency for pitch
            
            // Set the delay time for the string resonance
            this.feedbackDelay.delayTime.value = delayTime;
            
            // Trigger the pluck by briefly turning on the noise
            this.noise.volume.value = -10; // Pluck volume
            this.noise.volume.rampTo(-Infinity, 0.01); // Quick fade to silence
            
            console.log(`MobileUkulele: Plucked string - Note: ${note}, Frequency: ${frequency.toFixed(2)}Hz, Delay: ${(delayTime * 1000).toFixed(2)}ms`);
            
        } catch (error) {
            console.warn('MobileUkulele: Error plucking string:', error);
        }
    }

    async playChord(frets, duration = '2n') {
        if (!this.noise || this.isAudioMuted()) {
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

            // Play each note in the chord with slight timing offset for realistic strumming
            const strumDelay = 30; // 30ms delay between strings for chord strumming
            notes.forEach((note, index) => {
                setTimeout(() => {
                    this.pluckString(note);
                }, index * strumDelay);
            });

        } catch (error) {
            console.warn('MobileUkulele: Error playing chord:', error);
            // Don't throw error to prevent breaking user interaction
        }
    }

    calculateNote(string, fret) {
        // Since we display strings in reverse order (A-E-C-G instead of G-C-E-A),
        // the string parameter is already correct for the reversed array
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
            this.strings = this.tunings[tuning].slice().reverse(); // Reverse for proper ukulele orientation

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
                if (fret > 0) { // Only highlight frets 1 and above (fret 0 is open string)
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
        // Calculate combined volume
        const combinedVolume = (this.instrumentVolume || 0.8) * (this.masterVolume || 0.7);
        
        // Convert to decibels (-60dB to 0dB)
        const volumeDb = combinedVolume === 0 ? -60 : Math.log10(combinedVolume) * 20;
        
        // Update volume for physical model components
        if (this.reverb && this.reverb.volume) {
            this.reverb.volume.value = volumeDb;
        }
        
        // Also update synth volume if it exists (fallback mode)
        if (this.synth && this.synth.volume) {
            this.synth.volume.value = volumeDb;
        }

        console.log('MobileUkulele: Volume updated - Instrument:', this.instrumentVolume, 'Master:', this.masterVolume, 'Combined:', combinedVolume, 'dB:', volumeDb);
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
                        zone.removeEventListener('touchstart', this.handleStrumTouchStart);
                        zone.removeEventListener('touchmove', this.handleStrumTouchMove);
                        zone.removeEventListener('touchend', this.handleStrumTouchEnd);
                        zone.removeEventListener('mousedown', this.handleStrum);
                        zone.removeEventListener('keydown', this.handleStrum);
                    }
                });
            }

            // Chord button cleanup is handled automatically when shadowRoot is cleared

            // Clean up audio effects if they exist
            if (this.audioEffects) {
                Object.values(this.audioEffects).forEach(effect => {
                    if (effect && typeof effect.dispose === 'function') {
                        effect.dispose();
                    }
                });
            }
            
            // Clean up physical model components
            if (this.noise && typeof this.noise.dispose === 'function') {
                this.noise.dispose();
            }
            if (this.filter && typeof this.filter.dispose === 'function') {
                this.filter.dispose();
            }
            if (this.feedbackDelay && typeof this.feedbackDelay.dispose === 'function') {
                this.feedbackDelay.dispose();
            }
            if (this.reverb && typeof this.reverb.dispose === 'function') {
                this.reverb.dispose();
            }
            if (this.analyser && typeof this.analyser.dispose === 'function') {
                this.analyser.dispose();
            }

            console.log('MobileUkulele: Cleanup completed');
        } catch (error) {
            console.warn('MobileUkulele: Error during cleanup:', error);
        }
    }
}

customElements.define('mobile-ukulele', MobileUkulele);
console.log('MobileUkulele: Custom element registered as "mobile-ukulele"');