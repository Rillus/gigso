import { generateScaleNotes, getNoteFrequency } from '../../helpers/scaleUtils.js';
import { applyNoteColor, getBaseNote } from '../../helpers/noteColorUtils.js';
import { checkToneJsStatus, getAudioErrorMessage, logAudioStatus } from '../../helpers/audioUtils.js';
import audioManager from '../../helpers/audioManager.js';

export default class HandPan extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Initialise properties
        this.currentKey = 'D';
        this.currentScale = 'minor';
        this.notes = generateScaleNotes('D', 'minor'); // Use scale utilities
        this.isMuted = false;
        this.toneFields = [];
        this.activeTouches = new Map(); // Track multiple touches
        this.activeNotes = new Set(); // Track currently playing notes
        this.lastPlayTime = 0; // Track last play time for debouncing
        this.maxSimultaneousNotes = 6; // Limit simultaneous notes for performance
        this.minNoteInterval = 20; // Minimum time between notes (ms)
        
        // Initialize volume properties
        this.instrumentVolume = 0.8; // Default volume
        this.masterVolume = 0.7; // Default master volume

        // Create synthesiser
        this.createHandPanSynth();
    }

    static get observedAttributes() {
        return ['key', 'scale', 'size'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'key' || name === 'scale') {
            const key = this.getAttribute('key') || 'D';
            const scale = this.getAttribute('scale') || 'minor';
            this.changeKey(key, scale);
        }
        if (name === 'size') {
            this.render();
        }
    }

    connectedCallback() {
        console.log('HandPan: Component connected to DOM');
        
        // Log audio status for debugging
        logAudioStatus('HandPan');
        
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

        this.render();
        this.addEventListeners();
        
        // Listen for external events
        this.addEventListener('set-key', (event) => {
            const { key, scale } = event.detail;
            this.changeKey(key, scale);
        });
        
        // Listen for song key changes from chord palette
        this.boundHandleSongKeyChange = this.handleSongKeyChange.bind(this);
        this.boundHandleSongKeySet = this.handleSongKeySet.bind(this);
        document.addEventListener('key-changed', this.boundHandleSongKeyChange);
        document.addEventListener('key-set', this.boundHandleSongKeySet);
        
        // Add keyboard listeners for number keys 1-8
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
        
        // Initialize accelerometer support
        this.initializeAccelerometer();
        
        console.log('HandPan: Component initialization complete');

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

    createHandPanSynth() {
        try {
            // Check if Tone.js is available using the utility
            const status = checkToneJsStatus();
            
            if (!status.available) {
                console.warn('HandPan:', getAudioErrorMessage('HandPan', status.error));
                this.createFallbackSynth();
                return;
            }

            // Create authentic steel drum/hand pan synthesiser with rich harmonics and sustain
            this.synth = new Tone.Synth({
                oscillator: {
                    type: "triangle"  // Base metallic sound
                },
                envelope: {
                    attack: 0.062,    // Slightly longer attack for smoother response
                    decay: 0.26,      // Longer decay for richer tone
                    sustain: 0.7,     // Higher sustain for longer notes
                    release: 0.3      // Shorter release for quicker note fade
                }
            });

            // Create enhanced reverb for steel drum resonance
            this.reverb = new Tone.Reverb({
                decay: 1.4,           // Longer decay for richer resonance
                wet: 0.8,             // More reverb for atmospheric sound
                preDelay: 0.04        // Slightly longer pre-delay for depth
            });

            // Add chorus for steel drum shimmer
            this.chorus = new Tone.Chorus({
                frequency: 3.5,
                delayTime: 2.5,
                depth: 0.35,
                wet: 0.7
            });

            // Add subtle delay for steel drum echo
            this.delay = new Tone.PingPongDelay({
                delayTime: 0.175,     // Longer delay time for more echo
                feedback: 0.2,
                wet: 0.85
            });

            // Create analyser for level monitoring
            this.analyser = new Tone.Analyser('waveform', 256);

            // Create effects chain: synth → chorus → delay → reverb → analyser → destination
            this.synth.connect(this.chorus);
            this.chorus.connect(this.delay);
            this.delay.connect(this.reverb);
            this.reverb.connect(this.analyser);
            this.analyser.toDestination();

            // Expose effects for external control
            this.audioEffects = {
                synth: this.synth,
                reverb: this.reverb,
                chorus: this.chorus,
                delay: this.delay
            };
        } catch (error) {
            console.warn('HandPan: Error creating audio synthesiser:', error);
            this.createFallbackSynth();
        }
    }

    createFallbackSynth() {
        try {
            if (typeof Tone !== 'undefined') {
                // Create fallback synthesiser without effects
                this.synth = new Tone.Synth({
                    oscillator: { type: "triangle" },
                    envelope: {
                        attack: 0.062,
                        decay: 0.26,
                        sustain: 0.7,
                        release: 0.3
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
                    envelope: { attack: 0.062, decay: 0.26, sustain: 0.7, release: 0.3 }
                };
                this.audioEffects = { synth: this.synth };
            }
        } catch (error) {
            console.warn('HandPan: Error creating fallback synthesiser:', error);
            // Create minimal mock synthesiser
            this.synth = {
                triggerAttackRelease: () => {},
                toDestination: () => {},
                connect: () => {},
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.062, decay: 0.26, sustain: 0.7, release: 0.3 }
            };
            this.audioEffects = { synth: this.synth };
        }
    }

    render() {
        console.log('HandPan: Rendering component');
        const size = this.getAttribute('size') || 'medium';
        const toneFields = this.createToneFields();
        const audioStatus = this.getAudioStatusIndicator();

        this.shadowRoot.innerHTML = `
            <style>
                /* HandPan Component Styles */
                .hand-pan {
                    position: relative;
                    width: 300px;
                    height: 300px;
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
                            hsl(0, 0%, 25%) 0%, 
                            hsl(0, 0%, 15%) 50%, 
                            hsl(0, 0%, 10%) 100%);
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
                    --metallic-intensity: 80%;
                    --reflection-speed: 50%;
                    --reflection-x: 0px;
                    --reflection-y: 0px;
                    background: 
                        radial-gradient(circle at calc(30% + var(--reflection-x)) calc(30% + var(--reflection-y)), 
                            rgba(255,255,255,calc(0.2 * var(--metallic-intensity) / 100)) 0%, 
                            rgba(255,255,255,calc(0.08 * var(--metallic-intensity) / 100)) 20%, 
                            transparent 50%),
                        radial-gradient(circle at calc(70% + var(--reflection-x)) calc(70% + var(--reflection-y)), 
                            rgba(255,255,255,calc(0.15 * var(--metallic-intensity) / 100)) 0%, 
                            rgba(255,255,255,calc(0.03 * var(--metallic-intensity) / 100)) 30%, 
                            transparent 60%),
                        linear-gradient(145deg, 
                            hsl(0, 0%, calc(25 + var(--metallic-intensity) / 4)) 0%, 
                            hsl(0, 0%, calc(15 + var(--metallic-intensity) / 6)) 50%, 
                            hsl(0, 0%, calc(10 + var(--metallic-intensity) / 8)) 100%);
                    transition: all calc(0.3s * var(--reflection-speed) / 50) ease;
                }

                .hand-pan.small {
                    width: 200px;
                    height: 200px;
                }

                .hand-pan.large {
                    width: 400px;
                    height: 400px;
                }

                .tone-fields-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .tone-field {
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: 
                        radial-gradient(circle at 25% 25%, 
                            rgba(255,255,255,0.2) 0%, 
                            rgba(255,255,255,0.05) 40%, 
                            transparent 70%),
                        linear-gradient(145deg, 
                            hsl(0, 0%, 35%) 0%, 
                            hsl(0, 0%, 25%) 50%, 
                            hsl(0, 0%, 20%) 100%);
                    border: 2px solid #5a5a5a;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    color: #ddd;
                    font-weight: bold;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    transform-origin: center center;
                    will-change: transform;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    outline: none;
                    transition: all 0.2s ease, outline 0.1s ease;
                    box-shadow: 
                        inset 0 2px 4px rgba(255,255,255,0.1),
                        inset 0 -2px 4px rgba(0,0,0,0.3),
                        0 2px 8px rgba(0,0,0,0.4);
                }

                .tone-field:hover {
                    background: 
                        radial-gradient(circle at 25% 25%, 
                            rgba(255,255,255,0.3) 0%, 
                            rgba(255,255,255,0.08) 40%, 
                            transparent 70%),
                        linear-gradient(145deg, 
                            hsl(0, 0%, 45%) 0%, 
                            hsl(0, 0%, 35%) 50%, 
                            hsl(0, 0%, 30%) 100%);
                    transform: translate(-50%, -50%) scale(1.05);
                    border-color: #6a6a6a;
                    box-shadow: 
                        inset 0 2px 6px rgba(255,255,255,0.15),
                        inset 0 -2px 6px rgba(0,0,0,0.4),
                        0 4px 12px rgba(0,0,0,0.5),
                        0 0 15px rgba(255,255,255,0.1);
                }

                .tone-field:focus {
                    outline: 2px solid #7a7a7a;
                    outline-offset: 2px;
                    background: 
                        radial-gradient(circle at 25% 25%, 
                            rgba(255,255,255,0.25) 0%, 
                            rgba(255,255,255,0.06) 40%, 
                            transparent 70%),
                        linear-gradient(145deg, 
                            hsl(0, 0%, 40%) 0%, 
                            hsl(0, 0%, 30%) 50%, 
                            hsl(0, 0%, 25%) 100%);
                    transform: translate(-50%, -50%) scale(1.02);
                    box-shadow: 
                        inset 0 2px 5px rgba(255,255,255,0.12),
                        inset 0 -2px 5px rgba(0,0,0,0.35),
                        0 3px 10px rgba(0,0,0,0.45);
                }

                .tone-field.active {
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
                    animation: metallicPulse 0.4s ease-out;
                    transform-origin: center center !important;
                    color: #fff !important;
                }

                @keyframes metallicPulse {
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
                    background: rgba(0,0,0,0.7);
                    color: #fff;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: bold;
                    text-align: center;
                    z-index: 10;
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(255,255,255,0.2);
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
                    animation: metallicRipple 1s ease-out;
                    pointer-events: none;
                    border: 2px solid rgba(255,255,255,0.4);
                    will-change: transform, opacity;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    box-shadow: 
                        0 0 10px rgba(255,255,255,0.3),
                        inset 0 0 5px rgba(255,255,255,0.2);
                }

                @keyframes metallicRipple {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                        box-shadow: 
                            0 0 5px rgba(255,255,255,0.4),
                            inset 0 0 3px rgba(255,255,255,0.3);
                    }
                    25% {
                        transform: scale(1.5);
                        opacity: 0.9;
                        box-shadow: 
                            0 0 15px rgba(255,255,255,0.5),
                            inset 0 0 8px rgba(255,255,255,0.4);
                    }
                    50% {
                        transform: scale(2.5);
                        opacity: 0.7;
                        box-shadow: 
                            0 0 25px rgba(255,255,255,0.4),
                            inset 0 0 12px rgba(255,255,255,0.3);
                    }
                    75% {
                        transform: scale(3.5);
                        opacity: 0.4;
                        box-shadow: 
                            0 0 35px rgba(255,255,255,0.3),
                            inset 0 0 15px rgba(255,255,255,0.2);
                    }
                    100% {
                        transform: scale(4.5);
                        opacity: 0;
                        box-shadow: 
                            0 0 45px rgba(255,255,255,0.1),
                            inset 0 0 18px rgba(255,255,255,0.1);
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
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                }

                .audio-status-text {
                    display: flex;
                    align-items: center;
                    gap: 8px;
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
                    .hand-pan {
                        width: 250px;
                        height: 250px;
                    }
                    
                    .hand-pan.small {
                        width: 180px;
                        height: 180px;
                    }
                    
                    .hand-pan.large {
                        width: 320px;
                        height: 320px;
                    }
                    
                    .tone-field {
                        width: 50px;
                        height: 50px;
                        font-size: 10px;
                        min-width: 44px;
                        min-height: 44px;
                    }
                    
                    .audio-status-indicator {
                        font-size: 12px;
                        padding: 8px 12px;
                    }
                }

                @media (max-width: 480px) {
                    .hand-pan {
                        width: 200px;
                        height: 200px;
                    }
                    
                    .tone-field {
                        width: 40px;
                        height: 40px;
                        font-size: 9px;
                        min-width: 44px;
                        min-height: 44px;
                    }
                    
                    .key-indicator {
                        font-size: 12px;
                        padding: 6px 10px;
                    }
                    
                    .audio-status-indicator {
                        font-size: 11px;
                        padding: 6px 10px;
                    }
                }
            </style>
            <div class="hand-pan ${size}">
                <div class="tone-fields-container">
                    ${toneFields}
                </div>
                <div class="key-indicator">
                    ${this.currentKey} ${this.currentScale}
                </div>
                ${audioStatus}
            </div>
        `;

        // Store references to tone fields and re-add event listeners
        this.toneFields = this.shadowRoot.querySelectorAll('.tone-field');
        this.addEventListeners();
        
        // Apply note colors to tone fields
        this.applyNoteColors();
        
        // Update audio status indicator
        this.updateAudioStatusIndicator();
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

    createToneFields() {
        // Create 8 tone fields in a circular pattern
        const positions = [
            { top: '10%', left: '50%' },   // Top
            { top: '20%', left: '75%' },   // Top right
            { top: '50%', left: '85%' },   // Right
            { top: '80%', left: '75%' },   // Bottom right
            { top: '90%', left: '50%' },   // Bottom
            { top: '80%', left: '25%' },   // Bottom left
            { top: '50%', left: '15%' },   // Left
            { top: '20%', left: '25%' }    // Top left
        ];

        // Sort notes by frequency to ensure clockwise ascending order
        const sortedNotes = [...this.notes].sort((a, b) => {
            const freqA = this.getNoteFrequency(a);
            const freqB = this.getNoteFrequency(b);
            return freqA - freqB;
        });

        // Store the sorted notes for use in event handlers
        this.sortedNotes = sortedNotes;

        return sortedNotes.map((note, index) => {
            const position = positions[index];
            return `
                <div 
                    class="tone-field" 
                    data-note="${note}"
                    data-index="${index}"
                    role="button"
                    tabindex="0"
                    aria-label="Play ${note} note"
                    aria-pressed="false"
                    style="top: ${position.top}; left: ${position.left}; transform: translate(-50%, -50%); transform-origin: center center;"
                >
                    ${note}
                </div>
            `;
        }).join('');
    }

    addEventListeners() {
        // Add click and touch event listeners to tone fields
        this.toneFields.forEach((field, index) => {
            // Mouse events
            field.addEventListener('mousedown', (event) => this.handleMouseInteraction(event, index));
            field.addEventListener('mouseup', (event) => this.handleMouseRelease(event, index));
            
            // Touch events
            field.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.handleTouchStart(event, index);
            });
            
            field.addEventListener('touchend', (event) => {
                event.preventDefault();
                this.handleTouchEnd(event, index);
            });
            
            // Keyboard events for accessibility
            field.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleKeyboardInteraction(event, index);
                }
            });
            
            field.addEventListener('keyup', (event) => {
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
                console.log('HandPan: Audio status indicator clicked, attempting to start audio...');
                await this.ensureAudioContextRunning();
            });
        }
    }

    async handleMouseInteraction(event, index) {
        if (this.isMuted) return;

        const note = this.sortedNotes[index];
        const noteId = `mouse-${index}`;
        
        console.log('HandPan: Mouse interaction - Playing note', note, 'at index', index);
        
        // Performance optimization: Use requestAnimationFrame for visual updates
        requestAnimationFrame(() => {
            // Add visual feedback
            const field = event.target;
            if (field) {
                field.classList.add('active');
                
                // Create ripple effect
                this.createRipple(event, field);
            }
        });
        
        // Play the note (non-blocking)
        this.playNote(note, '2n').catch(error => {
            console.warn('HandPan: Error playing note:', error);
        });
        
        // Track active note
        this.activeNotes.add(noteId);
        
        // Dispatch note-played event
        this.dispatchNoteEvent(note, index);
        
        // Remove visual feedback after animation completes
        setTimeout(() => {
            if (this.activeNotes.has(noteId)) {
                this.activeNotes.delete(noteId);
            }
            const field = event.target;
            if (field) {
                field.classList.remove('active');
            }
        }, 300);
    }

    handleMouseRelease(event, index) {
        const noteId = `mouse-${index}`;
        
        // Remove from active notes
        this.activeNotes.delete(noteId);
        
        // Remove visual feedback immediately
        const field = event.target;
        if (field) {
            field.classList.remove('active');
        }
    }

    handleKeyboardInteraction(event, index) {
        if (this.isMuted) return;

        const note = this.sortedNotes[index];
        const noteId = `keyboard-${index + 1}-${index}`; // Use key number (index + 1) for consistency
        
        console.log('HandPan: Keyboard interaction - Playing note', note, 'at index', index);
        
        // Performance optimization: Use requestAnimationFrame for visual updates
        requestAnimationFrame(() => {
            // Add visual feedback
            const field = event.target;
            if (field) {
                field.classList.add('active');
                field.setAttribute('aria-pressed', 'true');
                
                // Create ripple effect
                this.createRipple(event, field);
            }
        });
        
        // Play the note (non-blocking)
        this.playNote(note, '2n').catch(error => {
            console.warn('HandPan: Error playing note:', error);
        });
        
        // Track active note
        this.activeNotes.add(noteId);
        
        // Dispatch note-played event
        this.dispatchNoteEvent(note, index);
        
        // Remove visual feedback after animation completes
        setTimeout(() => {
            if (this.activeNotes.has(noteId)) {
                this.activeNotes.delete(noteId);
            }
            const field = event.target;
            if (field) {
                field.classList.remove('active');
                field.setAttribute('aria-pressed', 'false');
            }
        }, 300);
    }

    handleKeyboardRelease(event, index) {
        const noteId = `keyboard-${index + 1}-${index}`; // Use key number (index + 1) for consistency
        
        // Remove from active notes
        this.activeNotes.delete(noteId);
        
        // Remove visual feedback immediately
        const field = event.target;
        if (field) {
            field.classList.remove('active');
            field.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * Handle keyboard keydown events for number keys 1-8
     * Maps number keys to handpan tone fields clockwise from 12 o'clock
     */
    handleKeydown(event) {
        // Only handle number keys 1-8
        const key = event.key;
        if (!/^[1-8]$/.test(key)) {
            return;
        }

        // Prevent default behaviour for number keys
        event.preventDefault();

        // Check if handpan is muted
        if (this.isMuted) {
            return;
        }

        // Convert key to index (1-8 becomes 0-7)
        const index = parseInt(key) - 1;
        
        // Check if we have sorted notes available
        if (!this.sortedNotes || !this.sortedNotes[index]) {
            console.warn('HandPan: No note available for key', key);
            return;
        }

        const note = this.sortedNotes[index];
        const noteId = `keyboard-${key}-${index}`;
        
        // Check if this key is already being played (prevent duplicate triggers)
        if (this.activeNotes.has(noteId)) {
            return;
        }

        console.log('HandPan: Keyboard keydown - Playing note', note, 'at index', index, 'for key', key);
        
        // Performance optimization: Use requestAnimationFrame for visual updates
        requestAnimationFrame(() => {
            // Add visual feedback to the corresponding tone field
            if (this.toneFields && this.toneFields[index]) {
                const field = this.toneFields[index];
                field.classList.add('active');
                field.setAttribute('aria-pressed', 'true');
                
                // Create ripple effect at the centre of the field
                this.createRippleAtCentre(field);
            }
        });
        
        // Play the note (non-blocking)
        this.playNote(note, '2n').catch(error => {
            console.warn('HandPan: Error playing note from keyboard:', error);
        });
        
        // Track active note
        this.activeNotes.add(noteId);
        
        // Dispatch note-played event
        this.dispatchNoteEvent(note, index);
    }

    /**
     * Handle keyboard keyup events for number keys 1-8
     */
    handleKeyup(event) {
        // Only handle number keys 1-8
        const key = event.key;
        if (!/^[1-8]$/.test(key)) {
            return;
        }

        // Prevent default behaviour for number keys
        event.preventDefault();

        // Convert key to index (1-8 becomes 0-7)
        const index = parseInt(key) - 1;
        const noteId = `keyboard-${key}-${index}`;
        
        console.log('HandPan: Keyboard keyup - Stopping note at index', index, 'for key', key);
        
        // Remove from active notes
        this.activeNotes.delete(noteId);
        
        // Remove visual feedback immediately
        if (this.toneFields && this.toneFields[index]) {
            const field = this.toneFields[index];
            field.classList.remove('active');
            field.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * Create a ripple effect at the centre of a tone field
     * Used for keyboard interactions where we don't have mouse coordinates
     */
    createRippleAtCentre(element) {
        if (!element) return;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        // Position ripple at the centre of the element
        const x = (rect.width - size) / 2;
        const y = (rect.height - size) / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.appendChild(ripple);
        
        // Memory management: Clean up ripple after animation
        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    async handleTouchStart(event, index) {
        if (this.isMuted) return;

        const note = this.sortedNotes[index];
        const touch = event.touches[0];
        const touchId = touch.identifier;
        const noteId = `touch-${touchId}-${index}`;
        
        console.log('HandPan: Touch start - Playing note', note, 'at index', index, 'touch ID:', touchId);
        
        // Track this touch
        this.activeTouches.set(touchId, { index, noteId });
        
        // Performance optimization: Use requestAnimationFrame for visual updates
        requestAnimationFrame(() => {
            // Add visual feedback
            const field = event.target;
            if (field) {
                field.classList.add('active');
                
                // Create ripple effect
                this.createRipple(event, field);
            }
        });
        
        // Play the note (non-blocking)
        this.playNote(note, '2n').catch(error => {
            console.warn('HandPan: Error playing note:', error);
        });
        
        // Track active note
        this.activeNotes.add(noteId);
        
        // Dispatch note-played event
        this.dispatchNoteEvent(note, index);
        
        // Remove visual feedback after animation completes
        setTimeout(() => {
            if (this.activeNotes.has(noteId)) {
                this.activeNotes.delete(noteId);
            }
            const field = event.target;
            if (field) {
                field.classList.remove('active');
            }
        }, 300);
    }

    handleTouchEnd(event, index) {
        const touch = event.changedTouches[0];
        const touchId = touch.identifier;
        const touchData = this.activeTouches.get(touchId);
        
        if (touchData) {
            const { noteId } = touchData;
            
            console.log('HandPan: Touch end - Stopping note at index', index, 'touch ID:', touchId);
            
            // Remove from active touches and notes
            this.activeTouches.delete(touchId);
            this.activeNotes.delete(noteId);
            
            // Remove visual feedback immediately
            const field = event.target;
            if (field) {
                field.classList.remove('active');
            }
        }
    }

    dispatchNoteEvent(note, index) {
        const noteEvent = new CustomEvent('note-played', {
            detail: {
                note: note,
                frequency: this.getNoteFrequency(note),
                duration: 1, // Shorter duration for faster note fade
                index: index
            }
        });
        
        console.log('HandPan: Dispatching note-played event', noteEvent.detail);
        this.dispatchEvent(noteEvent);
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
        
        // Memory management: Clean up ripple after animation
        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    async ensureAudioContextRunning() {
        // Check if Tone.js is available using the utility
        const status = checkToneJsStatus();
        
        if (!status.available) {
            const errorMessage = getAudioErrorMessage('HandPan', status.error);
            console.warn('HandPan:', errorMessage);
            
            // Update the audio status indicator with helpful information
            this.updateAudioStatusIndicator(status.error);
            return false;
        }
        
        // Handle different audio context states
        if (Tone.context.state === 'suspended') {
            try {
                console.log('HandPan: Audio context suspended, attempting to resume...');
                await Tone.context.resume();
                console.log('HandPan: Audio context resumed successfully');
                this.updateAudioStatusIndicator();
                return true;
            } catch (error) {
                console.warn('HandPan: Error resuming audio context:', error);
                this.updateAudioStatusIndicator('AUDIO_CONTEXT_FAILED');
                return false;
            }
        } else if (Tone.context.state !== 'running') {
            try {
                console.log('HandPan: Audio context not running, attempting to start...');
                await Tone.start();
                console.log('HandPan: Audio context started successfully');
                this.updateAudioStatusIndicator();
                return true;
            } catch (error) {
                console.warn('HandPan: Error starting audio context:', error);
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
                        const errorMessage = getAudioErrorMessage('HandPan', errorType);
                        textElement.textContent = '🔇 Audio Error - Click for details';
                        textElement.title = errorMessage; // Show full message on hover
                    } else {
                        textElement.textContent = '🔇 Click to enable audio';
                        textElement.title = 'Click to enable audio functionality';
                    }
                }
            }
        }
    }

    /**
     * Apply note colors to tone fields based on their note assignments
     */
    applyNoteColors() {
        if (!this.toneFields || !this.sortedNotes) return;

        this.toneFields.forEach((field, index) => {
            const note = this.sortedNotes[index];
            if (note && field) {
                // Extract just the note without octave for color mapping
                const noteWithoutOctave = note.replace(/\d+$/, '');
                
                // Apply the note color with hand pan specific styling
                applyNoteColor(field, noteWithoutOctave, {
                    useBackground: true,
                    useTextColor: false,
                    applySharpFlatStyling: true
                });
                
                // Ensure text remains white for visibility
                field.style.color = '#fff';
                field.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
                
                // Maintain the metallic gradient overlay
                const originalBackground = field.style.background;
                field.style.background = `
                    linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1)),
                    ${originalBackground}
                `;
            }
        });
    }
    
    async playNote(note, duration) {
        if (!this.synth || this.isAudioMuted()) {
            return;
        }

        try {
            // Ensure audio context is running
            const audioReady = await this.ensureAudioContextRunning();
            if (!audioReady) {
                console.warn('HandPan: Audio context not ready, skipping note playback');
                return;
            }
            
            // Debounce rapid successive calls for performance
            const now = Date.now();
            if (now - this.lastPlayTime < this.minNoteInterval) {
                return;
            }
            this.lastPlayTime = now;
            
            // Note: activeNotes tracking is handled by the calling interaction methods
            // This avoids mixing interaction IDs with note names in the same Set
            
            // Validate note before playing
            if (!note || typeof note !== 'string') {
                console.warn('HandPan: Invalid note provided:', note);
                return;
            }
            
            // Use triggerAttackRelease for proper timing - 0.8 second duration
            if (typeof this.synth.triggerAttackRelease === 'function') {
                this.synth.triggerAttackRelease(note, "8n");
            } else {
                console.warn('HandPan: Local synthesiser not available, using AudioManager fallback');
                // Fallback to AudioManager for reliable audio
                audioManager.playNote(note, "8n", "handpan");
            }
            
        } catch (error) {
            console.warn('HandPan: Error playing note:', error);
            // Don't throw error to prevent breaking user interaction
        }
    }

    getNoteFrequency(note) {
        // Use the scale utilities for frequency calculation
        return getNoteFrequency(note);
    }

    changeKey(key, scale) {
        console.log('HandPan: Changing key to', key, scale);
        
        // Validate key and scale before updating
        const validKey = this.validateKey(key) ? key : 'D';
        const validScale = this.validateScale(scale) ? scale : 'minor';
        
        this.currentKey = validKey;
        this.currentScale = validScale;
        
        // Update notes based on key and scale
        try {
            this.notes = this.getNotesForKey(validKey, validScale);
        } catch (error) {
            console.warn('HandPan: Error generating notes, using default D minor:', error);
            this.notes = this.getNotesForKey('D', 'minor');
        }
        
        console.log('HandPan: New notes', this.notes);
        
        // Re-render with new notes
        this.render();
        
        // Dispatch key-changed event
        const keyEvent = new CustomEvent('key-changed', {
            detail: {
                key: validKey,
                scale: validScale,
                notes: this.notes
            }
        });
        
        console.log('HandPan: Dispatching key-changed event', keyEvent.detail);
        
        // Dispatch event (it will bubble up to document automatically)
        this.dispatchEvent(keyEvent);
    }

    validateKey(key) {
        const validKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return validKeys.includes(key);
    }

    validateScale(scale) {
        const validScales = ['major', 'minor', 'pentatonic'];
        return validScales.includes(scale);
    }

    getNotesForKey(key, scale) {
        // Use the scale utilities to generate notes for any key and scale
        return generateScaleNotes(key, scale);
    }
    
    /**
     * Handle song key changes from chord palette
     * Maps song keys to hand-pan supported keys
     */
    handleSongKeyChange(event) {
        // Handle missing or invalid event detail gracefully
        if (!event || !event.detail) {
            console.warn('HandPan: Received key-changed event with missing detail');
            return;
        }
        
        const { key, scale } = event.detail;
        console.log('HandPan: Received key-changed event', { key, scale });
        
        // Map the song key to a hand-pan supported key
        const mappedKey = this.mapSongKeyToHandPanKey(key);
        const mappedScale = this.mapSongScaleToHandPanScale(scale);
        
        if (mappedKey && mappedScale) {
            console.log('HandPan: Mapping song key', { key, scale }, 'to hand-pan key', { mappedKey, mappedScale });
            this.changeKey(mappedKey, mappedScale);
        } else {
            console.warn('HandPan: Could not map song key', { key, scale }, 'to hand-pan key');
        }
    }
    
    /**
     * Handle initial song key set from chord palette
     * Same as key-changed but with additional logging
     */
    handleSongKeySet(event) {
        // Handle missing or invalid event detail gracefully
        if (!event || !event.detail) {
            console.warn('HandPan: Received key-set event with missing detail');
            return;
        }
        
        console.log('HandPan: Received key-set event (initial song key)', event.detail);
        this.handleSongKeyChange(event);
    }
    
    /**
     * Map song keys to hand-pan supported keys
     * Hand-pan supports: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
     */
    mapSongKeyToHandPanKey(songKey) {
        // If the song key is already supported by hand-pan, use it directly
        if (this.validateKey(songKey)) {
            return songKey;
        }
        
        // Map common song keys to hand-pan keys
        const keyMapping = {
            'Db': 'C#',  // D flat -> C sharp
            'Eb': 'D#',  // E flat -> D sharp
            'Gb': 'F#',  // G flat -> F sharp
            'Ab': 'G#',  // A flat -> G sharp
            'Bb': 'A#',  // B flat -> A sharp
        };
        
        const mappedKey = keyMapping[songKey];
        if (mappedKey && this.validateKey(mappedKey)) {
            return mappedKey;
        }
        
        // Default to D if no mapping found
        console.warn('HandPan: No mapping found for song key', songKey, ', defaulting to D');
        return 'D';
    }
    
    /**
     * Map song scales to hand-pan supported scales
     * Hand-pan supports: major, minor, pentatonic
     */
    mapSongScaleToHandPanScale(songScale) {
        // If the song scale is already supported by hand-pan, use it directly
        if (this.validateScale(songScale)) {
            return songScale;
        }
        
        // Map common song scales to hand-pan scales
        const scaleMapping = {
            'ionian': 'major',      // Ionian mode -> major
            'dorian': 'minor',      // Dorian mode -> minor
            'phrygian': 'minor',    // Phrygian mode -> minor
            'lydian': 'major',      // Lydian mode -> major
            'mixolydian': 'major',  // Mixolydian mode -> major
            'aeolian': 'minor',     // Aeolian mode -> minor
            'locrian': 'minor',     // Locrian mode -> minor
            'pentatonic-major': 'pentatonic',  // Pentatonic major -> pentatonic
            'pentatonic-minor': 'pentatonic',  // Pentatonic minor -> pentatonic
        };
        
        const mappedScale = scaleMapping[songScale];
        if (mappedScale && this.validateScale(mappedScale)) {
            return mappedScale;
        }
        
        // Default to minor if no mapping found
        console.warn('HandPan: No mapping found for song scale', songScale, ', defaulting to minor');
        return 'minor';
    }
    
    initializeAudioContext() {
        // Add a one-time click listener to initialize audio context
        const initializeAudio = async () => {
            try {
                // Check if Tone.js is available
                if (typeof Tone === 'undefined') {
                    console.warn('HandPan: Tone.js not loaded yet, waiting...');
                    return;
                }
                
                if (Tone.context.state !== 'running') {
                    console.log('HandPan: Initializing audio context on first interaction...');
                    await Tone.start();
                    console.log('HandPan: Audio context initialized successfully');
                    this.updateAudioStatusIndicator();
                }
                // Remove the listener after first use
                document.removeEventListener('click', initializeAudio);
                document.removeEventListener('touchstart', initializeAudio);
            } catch (error) {
                console.warn('HandPan: Error initializing audio context:', error);
                // Try alternative initialization for mobile browsers
                this.tryAlternativeAudioInitialization();
            }
        };
        
        // Add listeners for both mouse and touch interactions
        document.addEventListener('click', initializeAudio, { once: true });
        document.addEventListener('touchstart', initializeAudio, { once: true });
    }
    
    async tryAlternativeAudioInitialization() {
        try {
            console.log('HandPan: Trying alternative audio initialization...');
            
            // Check if Tone.context exists before proceeding
            if (!Tone.context) {
                console.warn('HandPan: Tone.context not available for alternative initialization');
                return;
            }
            
            // For some mobile browsers, we need to create a silent buffer first
            const silentBuffer = Tone.context.createBuffer(1, 1, 22050);
            const source = Tone.context.createBufferSource();
            source.buffer = silentBuffer;
            source.connect(Tone.context.destination);
            source.start(0);
            source.stop(0.001);
            
            // Then try to resume the context
            if (Tone.context.state === 'suspended') {
                await Tone.context.resume();
            }
            
            console.log('HandPan: Alternative audio initialization completed');
            this.updateAudioStatusIndicator();
        } catch (error) {
            console.warn('HandPan: Alternative audio initialization failed:', error);
        }
    }

    // Initialize accelerometer support
    initializeAccelerometer() {
        this.accelerometerData = { x: 0, y: 0, z: 0 };
        this.isAccelerometerAvailable = false;
        
        if (window.DeviceMotionEvent) {
            // Request permission on iOS
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                // Store the permission request for later use
                this.requestAccelerometerPermission = () => {
                    DeviceMotionEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                this.enableAccelerometer();
                            } else {
                                console.log('HandPan: Accelerometer permission denied');
                            }
                        })
                        .catch(error => {
                            console.warn('HandPan: Error requesting accelerometer permission:', error);
                        });
                };
            } else {
                // Android and other devices
                this.enableAccelerometer();
            }
        } else {
            console.log('HandPan: DeviceMotionEvent not supported');
        }
    }

    // Enable accelerometer tracking
    enableAccelerometer() {
        this.isAccelerometerAvailable = true;
        this.handleDeviceMotion = this.handleDeviceMotion.bind(this);
        window.addEventListener('devicemotion', this.handleDeviceMotion);
        console.log('HandPan: Accelerometer enabled');
        
        // Dispatch event to notify parent components
        this.dispatchEvent(new CustomEvent('accelerometer-enabled', {
            detail: { available: true }
        }));
    }

    // Handle device motion events
    handleDeviceMotion(event) {
        if (event.accelerationIncludingGravity) {
            const { x, y, z } = event.accelerationIncludingGravity;
            this.accelerometerData = { x: x || 0, y: y || 0, z: z || 0 };
            
            // Update hand pan reflections based on device orientation
            this.updateReflections();
        }
    }

    // Update reflections based on accelerometer data
    updateReflections() {
        if (!this.isAccelerometerAvailable) return;
        
        // Calculate reflection offset based on accelerometer data
        const maxOffset = 15; // Maximum pixel offset
        const xOffset = (this.accelerometerData.x / 9.8) * maxOffset; // Normalize to gravity
        const yOffset = (this.accelerometerData.y / 9.8) * maxOffset;
        
        // Apply reflection transform to hand pan
        this.style.setProperty('--reflection-x', xOffset + 'px');
        this.style.setProperty('--reflection-y', yOffset + 'px');
    }

    // Request accelerometer permission (for iOS)
    requestAccelerometerAccess() {
        if (this.requestAccelerometerPermission) {
            this.requestAccelerometerPermission();
        }
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
                    id: 'hand-pan',
                    name: 'Hand Pan',
                    icon: '🥘',
                    volume: 0.8
                });
                console.log('HandPan: Registered with mixer');
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
        console.log('HandPan: Volume change received:', volume);

        this.instrumentVolume = volume;
        this.updateSynthVolume();
    }

    handleMuteToggle(event) {
        const { muted } = event.detail;
        console.log('HandPan: Mute toggle received:', muted);
        this.isMuted = muted;
    }

    handleSoloToggle(event) {
        const { soloed } = event.detail;
        console.log('HandPan: Solo toggle received:', soloed);
        // Solo logic is handled by the mixer muting other instruments
    }

    handleMasterVolumeChange(event) {
        const { volume } = event.detail;
        console.log('HandPan: Master volume change received:', volume);

        this.masterVolume = volume;
        this.updateSynthVolume();
    }

    handleMasterMuteToggle(event) {
        const { muted } = event.detail;
        console.log('HandPan: Master mute toggle received:', muted);
        this.masterMuted = muted;
        // Apply master mute in addition to individual mute
    }

    // Update synth volume based on instrument and master volume
    updateSynthVolume() {
        if (this.synth && this.synth.volume) {
            // Multiply instrument and master volumes (0-1 range)
            const combinedVolume = (this.instrumentVolume || 0.8) * (this.masterVolume || 0.7);

            // Convert to decibels (-60dB to 0dB)
            const volumeDb = combinedVolume === 0 ? -60 : Math.log10(combinedVolume) * 20;
            this.synth.volume.value = volumeDb;

            console.log('HandPan: Volume updated - Instrument:', this.instrumentVolume, 'Master:', this.masterVolume, 'Combined:', combinedVolume, 'dB:', volumeDb);
        }
    }

    // Level monitoring methods
    startLevelMonitoring() {
        if (this.levelMonitoringInterval) return;

        this.levelMonitoringInterval = setInterval(() => {
            this.updateAudioLevel();
        }, 1000 / 30); // 30fps for individual instruments to reduce load

        console.log('HandPan: Level monitoring started');
    }

    stopLevelMonitoring() {
        if (this.levelMonitoringInterval) {
            clearInterval(this.levelMonitoringInterval);
            this.levelMonitoringInterval = null;
            console.log('HandPan: Level monitoring stopped');
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
                mixer.updateLevel('hand-pan', level);
            }

        } catch (error) {
            console.warn('HandPan: Error updating audio level:', error);
        }
    }

    // Override playNote to respect mute states
    isAudioMuted() {
        return this.isMuted || this.masterMuted;
    }

    // Cleanup method for memory management
    cleanup() {
        try {
            // Clear active touches and notes
            this.activeTouches.clear();
            this.activeNotes.clear();
            
            // Remove event listeners
            if (this.toneFields) {
                this.toneFields.forEach(field => {
                    if (field) {
                        field.removeEventListener('mousedown', this.handleMouseInteraction);
                        field.removeEventListener('mouseup', this.handleMouseRelease);
                        field.removeEventListener('touchstart', this.handleTouchStart);
                        field.removeEventListener('touchend', this.handleTouchEnd);
                        field.removeEventListener('keydown', this.handleKeyboardInteraction);
                        field.removeEventListener('keyup', this.handleKeyboardRelease);
                    }
                });
            }
            
            // Clean up accelerometer
            if (this.handleDeviceMotion) {
                window.removeEventListener('devicemotion', this.handleDeviceMotion);
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
            
            console.log('HandPan: Cleanup completed');
        } catch (error) {
            console.warn('HandPan: Error during cleanup:', error);
        }
    }
}

customElements.define('hand-pan', HandPan);
console.log('HandPan: Custom element registered as "hand-pan"'); 