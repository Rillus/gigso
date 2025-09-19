import { checkToneJsStatus, getAudioErrorMessage, logAudioStatus } from '../../helpers/audioUtils.js';
import audioManager from '../../helpers/audioManager.js';
import state from '../../state/state.js';

export default class ChordWheel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Initialize properties
        this.currentKey = 'C';
        this.currentScale = 'major';
        this.currentMode = 'circle-of-fifths';
        this.chords = [];
        this.isMuted = false;
        this.chordButtons = [];
        this.activeTouches = new Map();
        this.activeChords = new Set();
        this.lastPlayTime = 0;
        this.maxSimultaneousChords = 4;
        this.minChordInterval = 100; // Minimum time between chord triggers (ms)

        // Initialize volume properties
        this.instrumentVolume = 0.8;
        this.masterVolume = 0.7;

        // Create synthesiser
        this.createChordSynth();

        // Generate initial chords
        this.generateChordsForMode();
    }

    static get observedAttributes() {
        return ['key', 'scale', 'size', 'mode'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'key' || name === 'scale') {
            const key = this.getAttribute('key') || 'C';
            const scale = this.getAttribute('scale') || 'major';
            this.changeKey(key, scale);
        }
        if (name === 'mode') {
            const mode = this.getAttribute('mode') || 'circle-of-fifths';
            this.changeMode(mode);
        }
        if (name === 'size') {
            this.render();
        }
    }

    connectedCallback() {
        console.log('ChordWheel: Component connected to DOM');

        // Log audio status for debugging
        logAudioStatus('ChordWheel');

        // Check if there's a current key set in state
        if (typeof state !== 'undefined' && state.isKeySet && state.isKeySet()) {
            const currentKey = state.songKey();
            const currentScale = state.songScale();
            console.log('ChordWheel: Initializing with state key:', currentKey, currentScale);
            this.setAttribute('key', currentKey);
            this.setAttribute('scale', currentScale);
        } else {
            // Set default attributes if not provided
            if (!this.hasAttribute('key')) {
                this.setAttribute('key', 'C');
            }
            if (!this.hasAttribute('scale')) {
                this.setAttribute('scale', 'major');
            }
        }

        if (!this.hasAttribute('size')) {
            this.setAttribute('size', 'medium');
        }
        if (!this.hasAttribute('mode')) {
            this.setAttribute('mode', 'circle-of-fifths');
        }

        this.render();
        this.addEventListeners();

        // Listen for external events
        this.addEventListener('set-key', (event) => {
            const { key, scale } = event.detail;
            this.changeKey(key, scale);
        });

        this.addEventListener('set-mode', (event) => {
            const { mode } = event.detail;
            this.changeMode(mode);
        });

        // Listen for song key changes
        this.boundHandleSongKeyChange = this.handleSongKeyChange.bind(this);
        this.boundHandleSongKeySet = this.handleSongKeySet.bind(this);
        document.addEventListener('key-changed', this.boundHandleSongKeyChange);
        document.addEventListener('key-set', this.boundHandleSongKeySet);

        // Add keyboard listeners for number keys 1-12
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        this.boundHandleKeyup = this.handleKeyup.bind(this);
        document.addEventListener('keydown', this.boundHandleKeydown);
        document.addEventListener('keyup', this.boundHandleKeyup);

        this.addEventListener('mute', () => {
            this.isMuted = true;
        });

        this.addEventListener('unmute', () => {
            this.isMuted = false;
        });

        // Initialize audio context on first user interaction
        this.initializeAudioContext();

        console.log('ChordWheel: Component initialization complete');

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

    createChordSynth() {
        try {
            // Check if Tone.js is available
            const status = checkToneJsStatus();

            if (!status.available) {
                console.warn('ChordWheel:', getAudioErrorMessage('ChordWheel', status.error));
                this.createFallbackSynth();
                return;
            }

            // Create rich chord synthesiser with polyphonic support
            this.synth = new Tone.PolySynth({
                oscillator: {
                    type: "triangle"  // Warm, rich sound for chords
                },
                envelope: {
                    attack: 0.02,     // Quick attack for responsive chords
                    decay: 0.3,       // Medium decay
                    sustain: 0.4,     // Higher sustain for chord body
                    release: 3.0      // Long release for natural chord decay
                }
            });

            // Create spatial reverb for chord depth
            this.reverb = new Tone.Reverb({
                decay: 2.0,
                wet: 0.4,
                preDelay: 0.02
            });

            // Add subtle delay for richness
            this.delay = new Tone.PingPongDelay({
                delayTime: 0.25,
                feedback: 0.2,
                wet: 0.3
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
            console.warn('ChordWheel: Error creating audio synthesiser:', error);
            this.createFallbackSynth();
        }
    }

    createFallbackSynth() {
        try {
            if (typeof Tone !== 'undefined') {
                // Create fallback synthesiser without effects
                this.synth = new Tone.PolySynth({
                    oscillator: { type: "triangle" },
                    envelope: {
                        attack: 0.02,
                        decay: 0.3,
                        sustain: 0.4,
                        release: 3.0
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
                    oscillator: { type: 'triangle' },
                    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 3.0 }
                };
                this.audioEffects = { synth: this.synth };
            }
        } catch (error) {
            console.warn('ChordWheel: Error creating fallback synthesiser:', error);
            // Create minimal mock synthesiser
            this.synth = {
                triggerAttackRelease: () => {},
                toDestination: () => {},
                connect: () => {},
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 3.0 }
            };
            this.audioEffects = { synth: this.synth };
        }
    }

    generateChordsForMode() {
        const key = this.currentKey;
        const scale = this.currentScale;
        const mode = this.currentMode;

        console.log('ChordWheel: Generating chords for', { key, scale, mode });

        switch (mode) {
            case 'circle-of-fifths':
                this.chords = this.generateCircleOfFifthsChords(key, scale);
                break;
            case 'diatonic':
                this.chords = this.generateDiatonicChords(key, scale);
                break;
            case 'chromatic':
                this.chords = this.generateChromaticChords();
                break;
            case 'jazz-ii-v-i':
                this.chords = this.generateJazzChords(key, scale);
                break;
            case 'blues':
                this.chords = this.generateBluesChords(key, scale);
                break;
            default:
                this.chords = this.generateCircleOfFifthsChords(key, scale);
        }

        console.log('ChordWheel: Generated', this.chords.length, 'chords:', this.chords.map(c => c.name));
    }

    generateCircleOfFifthsChords(key, scale) {
        const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
        const startIndex = circleOfFifths.indexOf(key);

        const majorChords = [];
        const minorChords = [];

        for (let i = 0; i < 12; i++) {
            const chordKey = circleOfFifths[(startIndex + i) % 12];
            majorChords.push(this.createChord(chordKey, 'major'));
            minorChords.push(this.createChord(chordKey, 'minor'));
        }

        // Combine major and minor chords for circular layout
        const allChords = [];
        for (let i = 0; i < 12; i++) {
            allChords.push(majorChords[i]);
            if (i < 8) { // Only add 8 minor chords to avoid overcrowding
                allChords.push(minorChords[i]);
            }
        }

        return allChords.slice(0, 16); // Limit to 16 chords total
    }

    generateDiatonicChords(key, scale) {
        const scaleNotes = this.getScaleNotes(key, scale);
        const chords = [];

        // Generate chords based on scale degrees
        scaleNotes.forEach((note, index) => {
            const chordType = this.getDiatonicChordType(index, scale);
            chords.push(this.createChord(note, chordType));
        });

        // Add some common extensions
        if (chords.length < 12) {
            // Add relative minor/major
            const relativeKey = scale === 'major' ? this.getRelativeMinor(key) : this.getRelativeMajor(key);
            const relativeType = scale === 'major' ? 'minor' : 'major';
            chords.push(this.createChord(relativeKey, relativeType));
        }

        return chords;
    }

    generateChromaticChords() {
        const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const majorChords = chromaticNotes.map(note => this.createChord(note, 'major'));
        const minorChords = chromaticNotes.slice(0, 8).map(note => this.createChord(note, 'minor')); // Limit minor chords

        return [...majorChords, ...minorChords].slice(0, 16);
    }

    generateJazzChords(key, scale) {
        const chords = this.generateDiatonicChords(key, scale);

        // Add jazz-specific chords (7th, 9th, etc.)
        const jazzChords = [];
        chords.forEach(chord => {
            // Add 7th chord variation
            const seventhChord = { ...chord };
            seventhChord.name += '7';
            seventhChord.notes = [...chord.notes, this.getSeventhNote(chord.root, chord.type)];
            jazzChords.push(seventhChord);
        });

        return [...chords, ...jazzChords].slice(0, 16);
    }

    generateBluesChords(key, scale) {
        const I = this.createChord(key, 'major');
        const IV = this.createChord(this.getFourthNote(key), 'major');
        const V = this.createChord(this.getFifthNote(key), 'major');

        // Add 7th variations for blues
        const I7 = this.createChord(key, 'dominant7');
        const IV7 = this.createChord(this.getFourthNote(key), 'dominant7');
        const V7 = this.createChord(this.getFifthNote(key), 'dominant7');

        // Add minor variations
        const Im = this.createChord(key, 'minor');
        const IVm = this.createChord(this.getFourthNote(key), 'minor');

        return [I, IV, V, I7, IV7, V7, Im, IVm];
    }

    createChord(root, type) {
        const chord = {
            name: root + (type === 'major' ? '' : type === 'minor' ? 'm' : type),
            root: root,
            type: type,
            quality: type,
            notes: this.getChordNotes(root, type),
            extensions: [],
            duration: 1,
            delay: 0,
            startPosition: 0
        };

        return chord;
    }

    getChordNotes(root, type) {
        const noteMap = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };

        const rootIndex = noteMap[root];
        const octave = 4; // Default octave

        let intervals = [];
        switch (type) {
            case 'major':
                intervals = [0, 4, 7]; // Root, Major 3rd, Perfect 5th
                break;
            case 'minor':
                intervals = [0, 3, 7]; // Root, Minor 3rd, Perfect 5th
                break;
            case 'dominant7':
                intervals = [0, 4, 7, 10]; // Root, Major 3rd, Perfect 5th, Minor 7th
                break;
            case 'minor7':
                intervals = [0, 3, 7, 10]; // Root, Minor 3rd, Perfect 5th, Minor 7th
                break;
            default:
                intervals = [0, 4, 7]; // Default to major
        }

        const notes = intervals.map(interval => {
            const noteIndex = (rootIndex + interval) % 12;
            const noteName = Object.keys(noteMap)[noteIndex];
            return noteName + octave;
        });

        return notes;
    }

    // Helper methods for chord generation
    getScaleNotes(key, scale) {
        const noteMap = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };

        const rootIndex = noteMap[key];

        let intervals = [];
        switch (scale) {
            case 'major':
                intervals = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
                break;
            case 'minor':
                intervals = [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale intervals
                break;
            default:
                intervals = [0, 2, 4, 5, 7, 9, 11]; // Default to major
        }

        return intervals.map(interval => {
            const noteIndex = (rootIndex + interval) % 12;
            return Object.keys(noteMap)[noteIndex];
        });
    }

    getDiatonicChordType(index, scale) {
        if (scale === 'major') {
            // Major scale: I, ii, iii, IV, V, vi, vii°
            return [0, 3, 4].includes(index) ? 'major' : 'minor';
        } else {
            // Minor scale: i, ii°, III, iv, v, VI, VII
            return [2, 5, 6].includes(index) ? 'major' : 'minor';
        }
    }

    getRelativeMinor(majorKey) {
        const relatives = {
            'C': 'A', 'G': 'E', 'D': 'B', 'A': 'F#', 'E': 'C#', 'B': 'G#',
            'F#': 'D#', 'C#': 'A#', 'F': 'D', 'A#': 'G', 'D#': 'C', 'G#': 'F'
        };
        return relatives[majorKey] || 'A';
    }

    getRelativeMajor(minorKey) {
        const relatives = {
            'A': 'C', 'E': 'G', 'B': 'D', 'F#': 'A', 'C#': 'E', 'G#': 'B',
            'D#': 'F#', 'A#': 'C#', 'D': 'F', 'G': 'A#', 'C': 'D#', 'F': 'G#'
        };
        return relatives[minorKey] || 'C';
    }

    getFourthNote(key) {
        const circle = ['C', 'F', 'A#', 'D#', 'G#', 'C#', 'F#', 'B', 'E', 'A', 'D', 'G'];
        const index = circle.indexOf(key);
        return circle[(index + 1) % 12];
    }

    getFifthNote(key) {
        const circle = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
        const index = circle.indexOf(key);
        return circle[(index + 1) % 12];
    }

    getSeventhNote(root, type) {
        // Simplified 7th note calculation
        const noteMap = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };

        const rootIndex = noteMap[root];
        const seventhInterval = type === 'major' ? 11 : 10; // Major 7th or Minor 7th
        const seventhIndex = (rootIndex + seventhInterval) % 12;

        return Object.keys(noteMap)[seventhIndex] + '4';
    }

    render() {
        console.log('ChordWheel: Rendering component');
        const size = this.getAttribute('size') || 'medium';
        const chordButtons = this.createChordButtons();
        const audioStatus = this.getAudioStatusIndicator();
        const keyIndicator = this.createKeyIndicator();

        this.shadowRoot.innerHTML = `
            <style>
                /* ChordWheel Component Styles */
                .chord-wheel {
                    position: relative;
                    width: 350px;
                    height: 350px;
                    border-radius: 50%;
                    background:
                        radial-gradient(circle at 30% 30%,
                            rgba(255,255,255,0.15) 0%,
                            rgba(255,255,255,0.05) 20%,
                            transparent 50%),
                        radial-gradient(circle at 70% 70%,
                            rgba(255,255,255,0.1) 0%,
                            rgba(255,255,255,0.02) 30%,
                            transparent 60%),
                        linear-gradient(145deg,
                            hsl(240, 8%, 25%) 0%,
                            hsl(240, 8%, 15%) 50%,
                            hsl(240, 8%, 10%) 100%);
                    box-shadow:
                        inset 0 0 30px rgba(0,0,0,0.7),
                        inset 0 0 60px rgba(0,0,0,0.3),
                        0 0 30px rgba(255,255,255,0.1),
                        0 0 60px rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 20px auto;
                    transition: all 0.3s ease;
                }

                .chord-wheel.small {
                    width: 250px;
                    height: 250px;
                }

                .chord-wheel.large {
                    width: 450px;
                    height: 450px;
                }

                .chord-buttons-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .chord-button {
                    position: absolute;
                    border-radius: 50%;
                    background:
                        radial-gradient(circle at 25% 25%,
                            rgba(255,255,255,0.2) 0%,
                            rgba(255,255,255,0.05) 40%,
                            transparent 70%),
                        linear-gradient(145deg,
                            hsl(210, 15%, 35%) 0%,
                            hsl(210, 15%, 25%) 50%,
                            hsl(210, 15%, 20%) 100%);
                    border: 2px solid #5a5a5a;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    color: #ddd;
                    font-weight: bold;
                    user-select: none;
                    -webkit-user-select: none;
                    transform-origin: center center;
                    outline: none;
                    box-shadow:
                        inset 0 2px 4px rgba(255,255,255,0.1),
                        inset 0 -2px 4px rgba(0,0,0,0.3),
                        0 2px 8px rgba(0,0,0,0.4);
                }

                .chord-button.major {
                    width: 55px;
                    height: 55px;
                    background:
                        radial-gradient(circle at 25% 25%,
                            rgba(255,200,100,0.3) 0%,
                            rgba(255,150,50,0.15) 40%,
                            transparent 70%),
                        linear-gradient(145deg,
                            hsl(30, 40%, 35%) 0%,
                            hsl(30, 40%, 25%) 50%,
                            hsl(30, 40%, 20%) 100%);
                }

                .chord-button.minor {
                    width: 45px;
                    height: 45px;
                    background:
                        radial-gradient(circle at 25% 25%,
                            rgba(100,150,255,0.3) 0%,
                            rgba(50,100,200,0.15) 40%,
                            transparent 70%),
                        linear-gradient(145deg,
                            hsl(220, 40%, 35%) 0%,
                            hsl(220, 40%, 25%) 50%,
                            hsl(220, 40%, 20%) 100%);
                }

                .chord-button:hover {
                    transform: translate(-50%, -50%) scale(1.05);
                    border-color: #6a6a6a;
                    box-shadow:
                        inset 0 2px 6px rgba(255,255,255,0.15),
                        inset 0 -2px 6px rgba(0,0,0,0.4),
                        0 4px 12px rgba(0,0,0,0.5),
                        0 0 15px rgba(255,255,255,0.1);
                }

                .chord-button:focus {
                    outline: 2px solid #7a7a7a;
                    outline-offset: 2px;
                }

                .chord-button.active {
                    background:
                        radial-gradient(circle at 25% 25%,
                            rgba(255,255,255,0.4) 0%,
                            rgba(255,255,255,0.15) 40%,
                            transparent 70%),
                        linear-gradient(145deg,
                            hsl(0, 0%, 65%) 0%,
                            hsl(0, 0%, 55%) 50%,
                            hsl(0, 0%, 50%) 100%) !important;
                    border-color: #8a8a8a !important;
                    box-shadow:
                        inset 0 2px 8px rgba(255,255,255,0.25),
                        inset 0 -2px 8px rgba(0,0,0,0.5),
                        0 0 25px rgba(255,255,255,0.5),
                        0 0 50px rgba(255,255,255,0.3) !important;
                    animation: chordPulse 0.4s ease-out;
                    color: #fff !important;
                }

                @keyframes chordPulse {
                    0% {
                        box-shadow:
                            inset 0 2px 4px rgba(255,255,255,0.1),
                            inset 0 -2px 4px rgba(0,0,0,0.3),
                            0 2px 8px rgba(0,0,0,0.4);
                    }
                    50% {
                        box-shadow:
                            inset 0 2px 8px rgba(255,255,255,0.3),
                            inset 0 -2px 8px rgba(0,0,0,0.6),
                            0 0 30px rgba(255,255,255,0.6),
                            0 0 60px rgba(255,255,255,0.4);
                    }
                    100% {
                        box-shadow:
                            inset 0 2px 8px rgba(255,255,255,0.25),
                            inset 0 -2px 8px rgba(0,0,0,0.5),
                            0 0 25px rgba(255,255,255,0.5),
                            0 0 50px rgba(255,255,255,0.3);
                    }
                }

                .key-indicator {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: #fff;
                    padding: 12px 16px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: bold;
                    text-align: center;
                    z-index: 10;
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(255,255,255,0.2);
                    min-width: 80px;
                }

                .mode-indicator {
                    font-size: 10px;
                    opacity: 0.8;
                    margin-top: 4px;
                }

                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background:
                        radial-gradient(circle,
                            rgba(255,255,255,0.6) 0%,
                            rgba(255,255,255,0.3) 30%,
                            rgba(255,255,255,0.1) 60%,
                            transparent 100%);
                    transform: scale(0);
                    animation: chordRipple 1s ease-out;
                    pointer-events: none;
                    border: 2px solid rgba(255,255,255,0.4);
                    box-shadow:
                        0 0 10px rgba(255,255,255,0.3),
                        inset 0 0 5px rgba(255,255,255,0.2);
                }

                @keyframes chordRipple {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(4);
                        opacity: 0;
                    }
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
                    z-index: 20;
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

                @media (max-width: 768px) {
                    .chord-wheel {
                        width: 300px;
                        height: 300px;
                    }

                    .chord-wheel.small {
                        width: 220px;
                        height: 220px;
                    }

                    .chord-wheel.large {
                        width: 380px;
                        height: 380px;
                    }

                    .chord-button.major {
                        width: 50px;
                        height: 50px;
                        font-size: 10px;
                    }

                    .chord-button.minor {
                        width: 40px;
                        height: 40px;
                        font-size: 9px;
                    }
                }

                @media (max-width: 480px) {
                    .chord-wheel {
                        width: 250px;
                        height: 250px;
                    }

                    .chord-button.major {
                        width: 40px;
                        height: 40px;
                        font-size: 9px;
                    }

                    .chord-button.minor {
                        width: 32px;
                        height: 32px;
                        font-size: 8px;
                    }

                    .key-indicator {
                        font-size: 12px;
                        padding: 8px 12px;
                    }
                }
            </style>
            <div class="chord-wheel ${size}">
                <div class="chord-buttons-container">
                    ${chordButtons}
                </div>
                ${keyIndicator}
                ${audioStatus}
            </div>
        `;

        // Store references to chord buttons and re-add event listeners
        this.chordButtons = this.shadowRoot.querySelectorAll('.chord-button');
        this.addEventListeners();

        // Update audio status indicator
        this.updateAudioStatusIndicator();
    }

    createChordButtons() {
        if (!this.chords || this.chords.length === 0) {
            return '<div>No chords available</div>';
        }

        // Create chord buttons in circular layout
        return this.chords.map((chord, index) => {
            const position = this.getChordPosition(index, this.chords.length);
            const chordClass = chord.type === 'major' ? 'major' : 'minor';

            return `
                <div
                    class="chord-button ${chordClass}"
                    data-chord="${JSON.stringify(chord).replace(/"/g, '&quot;')}"
                    data-index="${index}"
                    role="button"
                    tabindex="0"
                    aria-label="Play ${chord.name} chord"
                    aria-pressed="false"
                    style="top: ${position.top}%; left: ${position.left}%; transform: translate(-50%, -50%);"
                >
                    ${chord.name}
                </div>
            `;
        }).join('');
    }

    getChordPosition(index, total) {
        // Calculate position in circular layout
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
        const radius = 35; // Percentage of container radius

        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        return { top: y, left: x };
    }

    createKeyIndicator() {
        const modeDisplayName = this.getModeDisplayName(this.currentMode);

        return `
            <div class="key-indicator">
                <div class="key-info">${this.currentKey} ${this.currentScale}</div>
                <div class="mode-indicator">${modeDisplayName}</div>
            </div>
        `;
    }

    getModeDisplayName(mode) {
        const displayNames = {
            'circle-of-fifths': 'Circle of 5ths',
            'diatonic': 'Diatonic',
            'chromatic': 'Chromatic',
            'jazz-ii-v-i': 'Jazz ii-V-I',
            'blues': 'Blues'
        };
        return displayNames[mode] || mode;
    }

    getAudioStatusIndicator() {
        // Only show audio status indicator if audio context is not running
        if (typeof Tone !== 'undefined' && Tone.context && Tone.context.state === 'running') {
            return '';
        }

        return `
            <div class="audio-status-indicator" id="audioStatusIndicator">
                <div class="audio-status-text">🔇 Click to enable audio</div>
            </div>
        `;
    }

    addEventListeners() {
        // Add event listeners to chord buttons
        this.chordButtons.forEach((button, index) => {
            // Mouse events
            button.addEventListener('mousedown', (event) => this.handleMouseInteraction(event, index));
            button.addEventListener('mouseup', (event) => this.handleMouseRelease(event, index));

            // Touch events
            button.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.handleTouchStart(event, index);
            });

            button.addEventListener('touchend', (event) => {
                event.preventDefault();
                this.handleTouchEnd(event, index);
            });

            // Keyboard events for accessibility
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleKeyboardInteraction(event, index);
                }
            });

            button.addEventListener('keyup', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleKeyboardRelease(event, index);
                }
            });
        });

        // Add click handler for audio status indicator
        const audioIndicator = this.shadowRoot.getElementById('audioStatusIndicator');
        if (audioIndicator) {
            audioIndicator.addEventListener('click', async (event) => {
                event.stopPropagation();
                console.log('ChordWheel: Audio status indicator clicked, attempting to start audio...');
                await this.ensureAudioContextRunning();
            });
        }
    }

    async handleMouseInteraction(event, index) {
        if (this.isMuted) return;

        const chordData = event.target.getAttribute('data-chord');
        if (!chordData) return;

        let chord;
        try {
            chord = JSON.parse(chordData);
        } catch (error) {
            console.warn('ChordWheel: Invalid chord data:', chordData);
            return;
        }
        const chordId = `mouse-${index}`;

        console.log('ChordWheel: Mouse interaction - Playing chord', chord.name, 'at index', index);

        // Performance optimization: Use requestAnimationFrame for visual updates
        requestAnimationFrame(() => {
            // Add visual feedback
            const button = event.target;
            if (button) {
                button.classList.add('active');

                // Create ripple effect
                this.createRipple(event, button);
            }
        });

        // Play the chord
        this.playChord(chord, '2n').catch(error => {
            console.warn('ChordWheel: Error playing chord:', error);
        });

        // Track active chord
        this.activeChords.add(chordId);

        // Dispatch chord-played event
        this.dispatchChordEvent(chord, index);

        // Remove visual feedback after animation completes
        setTimeout(() => {
            if (this.activeChords.has(chordId)) {
                this.activeChords.delete(chordId);
            }
            const button = event.target;
            if (button) {
                button.classList.remove('active');
            }
        }, 800);
    }

    handleMouseRelease(event, index) {
        const chordId = `mouse-${index}`;

        // Remove from active chords
        this.activeChords.delete(chordId);

        // Remove visual feedback immediately
        const button = event.target;
        if (button) {
            button.classList.remove('active');
        }
    }

    async handleTouchStart(event, index) {
        if (this.isMuted) return;

        const chordData = event.target.getAttribute('data-chord');
        if (!chordData) return;

        let chord;
        try {
            chord = JSON.parse(chordData);
        } catch (error) {
            console.warn('ChordWheel: Invalid chord data:', chordData);
            return;
        }
        const touch = event.touches[0];
        const touchId = touch.identifier;
        const chordId = `touch-${touchId}-${index}`;

        console.log('ChordWheel: Touch start - Playing chord', chord.name, 'at index', index, 'touch ID:', touchId);

        // Track this touch
        this.activeTouches.set(touchId, { index, chordId });

        // Performance optimization: Use requestAnimationFrame for visual updates
        requestAnimationFrame(() => {
            // Add visual feedback
            const button = event.target;
            if (button) {
                button.classList.add('active');

                // Create ripple effect
                this.createRipple(event, button);
            }
        });

        // Play the chord
        this.playChord(chord, '2n').catch(error => {
            console.warn('ChordWheel: Error playing chord:', error);
        });

        // Track active chord
        this.activeChords.add(chordId);

        // Dispatch chord-played event
        this.dispatchChordEvent(chord, index);

        // Remove visual feedback after animation completes
        setTimeout(() => {
            if (this.activeChords.has(chordId)) {
                this.activeChords.delete(chordId);
            }
            const button = event.target;
            if (button) {
                button.classList.remove('active');
            }
        }, 800);
    }

    handleTouchEnd(event, index) {
        const touch = event.changedTouches[0];
        const touchId = touch.identifier;
        const touchData = this.activeTouches.get(touchId);

        if (touchData) {
            const { chordId } = touchData;

            console.log('ChordWheel: Touch end - Stopping chord at index', index, 'touch ID:', touchId);

            // Remove from active touches and chords
            this.activeTouches.delete(touchId);
            this.activeChords.delete(chordId);

            // Remove visual feedback immediately
            const button = event.target;
            if (button) {
                button.classList.remove('active');
            }
        }
    }

    async handleKeyboardInteraction(event, index) {
        if (this.isMuted) return;

        const chordData = event.target.getAttribute('data-chord');
        if (!chordData) return;

        let chord;
        try {
            chord = JSON.parse(chordData);
        } catch (error) {
            console.warn('ChordWheel: Invalid chord data:', chordData);
            return;
        }
        const chordId = `keyboard-${index}`;

        console.log('ChordWheel: Keyboard interaction - Playing chord', chord.name, 'at index', index);

        // Performance optimization: Use requestAnimationFrame for visual updates
        requestAnimationFrame(() => {
            // Add visual feedback
            const button = event.target;
            if (button) {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');

                // Create ripple effect
                this.createRippleAtCenter(button);
            }
        });

        // Play the chord
        this.playChord(chord, '2n').catch(error => {
            console.warn('ChordWheel: Error playing chord:', error);
        });

        // Track active chord
        this.activeChords.add(chordId);

        // Dispatch chord-played event
        this.dispatchChordEvent(chord, index);

        // Remove visual feedback after animation completes
        setTimeout(() => {
            if (this.activeChords.has(chordId)) {
                this.activeChords.delete(chordId);
            }
            const button = event.target;
            if (button) {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            }
        }, 800);
    }

    handleKeyboardRelease(event, index) {
        const chordId = `keyboard-${index}`;

        // Remove from active chords
        this.activeChords.delete(chordId);

        // Remove visual feedback immediately
        const button = event.target;
        if (button) {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * Handle keyboard keydown events for number keys 1-12
     * Maps number keys to chord wheel buttons
     */
    handleKeydown(event) {
        // Only handle number keys 1-12
        const key = event.key;
        if (!/^([1-9]|1[0-2])$/.test(key)) {
            return;
        }

        // Prevent default behaviour for number keys
        event.preventDefault();

        // Check if chord wheel is muted
        if (this.isMuted) {
            return;
        }

        // Convert key to index (1-12 becomes 0-11)
        const index = parseInt(key) - 1;

        // Check if we have chords available
        if (!this.chords || !this.chords[index]) {
            console.warn('ChordWheel: No chord available for key', key);
            return;
        }

        const chord = this.chords[index];
        const chordId = `keyboard-${key}-${index}`;

        // Check if this key is already being played (prevent duplicate triggers)
        if (this.activeChords.has(chordId)) {
            return;
        }

        console.log('ChordWheel: Keyboard keydown - Playing chord', chord.name, 'at index', index, 'for key', key);

        // Performance optimization: Use requestAnimationFrame for visual updates
        requestAnimationFrame(() => {
            // Add visual feedback to the corresponding chord button
            if (this.chordButtons && this.chordButtons[index]) {
                const button = this.chordButtons[index];
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');

                // Create ripple effect at the center of the button
                this.createRippleAtCenter(button);
            }
        });

        // Play the chord
        this.playChord(chord, '2n').catch(error => {
            console.warn('ChordWheel: Error playing chord from keyboard:', error);
        });

        // Track active chord
        this.activeChords.add(chordId);

        // Dispatch chord-played event
        this.dispatchChordEvent(chord, index);
    }

    /**
     * Handle keyboard keyup events for number keys 1-12
     */
    handleKeyup(event) {
        // Only handle number keys 1-12
        const key = event.key;
        if (!/^([1-9]|1[0-2])$/.test(key)) {
            return;
        }

        // Prevent default behaviour for number keys
        event.preventDefault();

        // Convert key to index (1-12 becomes 0-11)
        const index = parseInt(key) - 1;
        const chordId = `keyboard-${key}-${index}`;

        console.log('ChordWheel: Keyboard keyup - Stopping chord at index', index, 'for key', key);

        // Remove from active chords
        this.activeChords.delete(chordId);

        // Remove visual feedback immediately
        if (this.chordButtons && this.chordButtons[index]) {
            const button = this.chordButtons[index];
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
        }
    }

    dispatchChordEvent(chord, index) {
        const chordEvent = new CustomEvent('chord-played', {
            detail: {
                chord: chord.name,
                notes: chord.notes,
                duration: chord.duration,
                index: index,
                chordData: chord
            }
        });

        console.log('ChordWheel: Dispatching chord-played event', chordEvent.detail);
        this.dispatchEvent(chordEvent);
    }

    createRipple(event, element) {
        if (!element) return;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        element.appendChild(ripple);

        // Clean up ripple after animation
        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.remove();
            }
        }, 1000);
    }

    /**
     * Create a ripple effect at the center of an element
     * Used for keyboard interactions where we don't have mouse coordinates
     */
    createRippleAtCenter(element) {
        if (!element) return;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        // Position ripple at the center of the element
        const x = (rect.width - size) / 2;
        const y = (rect.height - size) / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        element.appendChild(ripple);

        // Clean up ripple after animation
        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.remove();
            }
        }, 1000);
    }

    async playChord(chord, duration) {
        if (!this.synth || this.isAudioMuted()) {
            return;
        }

        try {
            // Ensure audio context is running
            const audioReady = await this.ensureAudioContextRunning();
            if (!audioReady) {
                console.warn('ChordWheel: Audio context not ready, skipping chord playback');
                return;
            }

            // Debounce rapid successive calls for performance
            const now = Date.now();
            if (now - this.lastPlayTime < this.minChordInterval) {
                return;
            }
            this.lastPlayTime = now;

            // Validate chord before playing
            if (!chord || !chord.notes || !Array.isArray(chord.notes)) {
                console.warn('ChordWheel: Invalid chord provided:', chord);
                return;
            }

            // Use triggerAttackRelease for proper chord timing
            if (typeof this.synth.triggerAttackRelease === 'function') {
                this.synth.triggerAttackRelease(chord.notes, "2n");
            } else {
                console.warn('ChordWheel: Local synthesiser not available, using AudioManager fallback');
                // Fallback to AudioManager for reliable audio
                audioManager.playChord(chord.notes, "2n", "chord-wheel");
            }

        } catch (error) {
            console.warn('ChordWheel: Error playing chord:', error);
            // Don't throw error to prevent breaking user interaction
        }
    }

    async ensureAudioContextRunning() {
        // Check if Tone.js is available
        const status = checkToneJsStatus();

        if (!status.available) {
            const errorMessage = getAudioErrorMessage('ChordWheel', status.error);
            console.warn('ChordWheel:', errorMessage);

            // Update the audio status indicator with helpful information
            this.updateAudioStatusIndicator(status.error);
            return false;
        }

        // Handle different audio context states
        if (Tone.context.state === 'suspended') {
            try {
                console.log('ChordWheel: Audio context suspended, attempting to resume...');
                await Tone.context.resume();
                console.log('ChordWheel: Audio context resumed successfully');
                this.updateAudioStatusIndicator();
                return true;
            } catch (error) {
                console.warn('ChordWheel: Error resuming audio context:', error);
                this.updateAudioStatusIndicator('AUDIO_CONTEXT_FAILED');
                return false;
            }
        } else if (Tone.context.state !== 'running') {
            try {
                console.log('ChordWheel: Audio context not running, attempting to start...');
                await Tone.start();
                console.log('ChordWheel: Audio context started successfully');
                this.updateAudioStatusIndicator();
                return true;
            } catch (error) {
                console.warn('ChordWheel: Error starting audio context:', error);
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
                        const errorMessage = getAudioErrorMessage('ChordWheel', errorType);
                        textElement.textContent = '🔇 Audio Error - Click for details';
                        textElement.title = errorMessage;
                    } else {
                        textElement.textContent = '🔇 Click to enable audio';
                        textElement.title = 'Click to enable audio functionality';
                    }
                }
            }
        }
    }

    changeKey(key, scale) {
        console.log('ChordWheel: Changing key to', key, scale);

        // Validate key and scale before updating
        const validKey = this.validateKey(key) ? key : 'C';
        const validScale = this.validateScale(scale) ? scale : 'major';

        this.currentKey = validKey;
        this.currentScale = validScale;

        // Regenerate chords for new key/scale
        this.generateChordsForMode();

        console.log('ChordWheel: New chords generated for', validKey, validScale);

        // Re-render with new chords
        this.render();

        // Dispatch key-changed event
        const keyEvent = new CustomEvent('key-changed', {
            detail: {
                key: validKey,
                scale: validScale,
                chords: this.chords
            }
        });

        console.log('ChordWheel: Dispatching key-changed event', keyEvent.detail);
        this.dispatchEvent(keyEvent);
    }

    changeMode(mode) {
        console.log('ChordWheel: Changing mode to', mode);

        this.currentMode = mode;

        // Regenerate chords for new mode
        this.generateChordsForMode();

        console.log('ChordWheel: New chords generated for mode', mode);

        // Re-render with new chords
        this.render();

        // Dispatch mode-changed event
        const modeEvent = new CustomEvent('mode-changed', {
            detail: {
                mode: mode,
                chords: this.chords
            }
        });

        console.log('ChordWheel: Dispatching mode-changed event', modeEvent.detail);
        this.dispatchEvent(modeEvent);
    }

    validateKey(key) {
        const validKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return validKeys.includes(key);
    }

    validateScale(scale) {
        const validScales = ['major', 'minor'];
        return validScales.includes(scale);
    }

    handleSongKeyChange(event) {
        if (!event || !event.detail) {
            console.warn('ChordWheel: Received key-changed event with missing detail');
            return;
        }

        const { key, scale } = event.detail;
        console.log('ChordWheel: Received key-changed event', { key, scale });

        if (this.validateKey(key) && this.validateScale(scale)) {
            this.changeKey(key, scale);
        } else {
            console.warn('ChordWheel: Invalid key/scale received', { key, scale });
        }
    }

    handleSongKeySet(event) {
        if (!event || !event.detail) {
            console.warn('ChordWheel: Received key-set event with missing detail');
            return;
        }

        console.log('ChordWheel: Received key-set event (initial song key)', event.detail);
        this.handleSongKeyChange(event);
    }

    initializeAudioContext() {
        // Add a one-time click listener to initialize audio context
        const initializeAudio = async () => {
            try {
                // Check if Tone.js is available
                if (typeof Tone === 'undefined') {
                    console.warn('ChordWheel: Tone.js not loaded yet, waiting...');
                    return;
                }

                if (Tone.context.state !== 'running') {
                    console.log('ChordWheel: Initializing audio context on first interaction...');
                    await Tone.start();
                    console.log('ChordWheel: Audio context initialized successfully');
                    this.updateAudioStatusIndicator();
                }
                // Remove the listener after first use
                document.removeEventListener('click', initializeAudio);
                document.removeEventListener('touchstart', initializeAudio);
            } catch (error) {
                console.warn('ChordWheel: Error initializing audio context:', error);
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
                    id: 'chord-wheel',
                    name: 'Chord Wheel',
                    icon: '🎡',
                    volume: 0.8
                });
                console.log('ChordWheel: Registered with mixer');
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
        console.log('ChordWheel: Volume change received:', volume);

        this.instrumentVolume = volume;
        this.updateSynthVolume();
    }

    handleMuteToggle(event) {
        const { muted } = event.detail;
        console.log('ChordWheel: Mute toggle received:', muted);
        this.isMuted = muted;
    }

    handleSoloToggle(event) {
        const { soloed } = event.detail;
        console.log('ChordWheel: Solo toggle received:', soloed);
        // Solo logic is handled by the mixer muting other instruments
    }

    handleMasterVolumeChange(event) {
        const { volume } = event.detail;
        console.log('ChordWheel: Master volume change received:', volume);

        this.masterVolume = volume;
        this.updateSynthVolume();
    }

    handleMasterMuteToggle(event) {
        const { muted } = event.detail;
        console.log('ChordWheel: Master mute toggle received:', muted);
        this.masterMuted = muted;
    }

    updateSynthVolume() {
        if (this.synth && this.synth.volume) {
            // Multiply instrument and master volumes (0-1 range)
            const combinedVolume = (this.instrumentVolume || 0.8) * (this.masterVolume || 0.7);

            // Convert to decibels (-60dB to 0dB)
            const volumeDb = combinedVolume === 0 ? -60 : Math.log10(combinedVolume) * 20;
            this.synth.volume.value = volumeDb;

            console.log('ChordWheel: Volume updated - Instrument:', this.instrumentVolume, 'Master:', this.masterVolume, 'Combined:', combinedVolume, 'dB:', volumeDb);
        }
    }

    startLevelMonitoring() {
        if (this.levelMonitoringInterval) return;

        this.levelMonitoringInterval = setInterval(() => {
            this.updateAudioLevel();
        }, 1000 / 30); // 30fps for individual instruments

        console.log('ChordWheel: Level monitoring started');
    }

    stopLevelMonitoring() {
        if (this.levelMonitoringInterval) {
            clearInterval(this.levelMonitoringInterval);
            this.levelMonitoringInterval = null;
            console.log('ChordWheel: Level monitoring stopped');
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
                mixer.updateLevel('chord-wheel', level);
            }

        } catch (error) {
            console.warn('ChordWheel: Error updating audio level:', error);
        }
    }

    isAudioMuted() {
        return this.isMuted || this.masterMuted;
    }

    cleanup() {
        try {
            // Clear active touches and chords
            this.activeTouches.clear();
            this.activeChords.clear();

            // Remove event listeners
            if (this.chordButtons) {
                this.chordButtons.forEach(button => {
                    if (button) {
                        button.removeEventListener('mousedown', this.handleMouseInteraction);
                        button.removeEventListener('mouseup', this.handleMouseRelease);
                        button.removeEventListener('touchstart', this.handleTouchStart);
                        button.removeEventListener('touchend', this.handleTouchEnd);
                        button.removeEventListener('keydown', this.handleKeyboardInteraction);
                        button.removeEventListener('keyup', this.handleKeyboardRelease);
                    }
                });
            }

            // Clean up document event listeners
            if (this.boundHandleSongKeyChange) {
                document.removeEventListener('key-changed', this.boundHandleSongKeyChange);
            }
            if (this.boundHandleSongKeySet) {
                document.removeEventListener('key-set', this.boundHandleSongKeySet);
            }
            if (this.boundHandleKeydown) {
                document.removeEventListener('keydown', this.boundHandleKeydown);
            }
            if (this.boundHandleKeyup) {
                document.removeEventListener('keyup', this.boundHandleKeyup);
            }

            // Clean up audio effects if they exist
            if (this.audioEffects) {
                Object.values(this.audioEffects).forEach(effect => {
                    if (effect && typeof effect.dispose === 'function') {
                        effect.dispose();
                    }
                });
            }

            console.log('ChordWheel: Cleanup completed');
        } catch (error) {
            console.warn('ChordWheel: Error during cleanup:', error);
        }
    }
}

customElements.define('chord-wheel', ChordWheel);
console.log('ChordWheel: Custom element registered as "chord-wheel"');