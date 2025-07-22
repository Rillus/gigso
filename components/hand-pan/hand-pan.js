import { generateScaleNotes, getNoteFrequency } from '../../helpers/scaleUtils.js';
import { applyNoteColor, getBaseNote } from '../../helpers/noteColorUtils.js';

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
    }

    disconnectedCallback() {
        // Clean up when component is removed from DOM
        this.cleanup();
    }

    createHandPanSynth() {
        try {
            // Check if Tone.js is available
            if (typeof Tone === 'undefined') {
                console.warn('HandPan: Tone.js not available, creating fallback synthesiser');
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

            // Create effects chain: synth → chorus → delay → reverb → destination
            this.synth.connect(this.chorus);
            this.chorus.connect(this.delay);
            this.delay.connect(this.reverb);
            this.reverb.toDestination();

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
                this.synth.toDestination();
                
                // Set fallback audio effects
                this.audioEffects = { synth: this.synth };
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
        const size = this.getAttribute('size') || 'medium';
        const toneFields = this.createToneFields();
        const audioStatus = this.getAudioStatusIndicator();

        this.shadowRoot.innerHTML = `
            <style>
                @import "../../hand-pan.css";
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
        const noteId = `keyboard-${index}`;
        
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
        const noteId = `keyboard-${index}`;
        
        // Remove from active notes
        this.activeNotes.delete(noteId);
        
        // Remove visual feedback immediately
        const field = event.target;
        if (field) {
            field.classList.remove('active');
            field.setAttribute('aria-pressed', 'false');
        }
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
        // Check if Tone.js is available
        if (typeof Tone === 'undefined') {
            console.warn('HandPan: Tone.js not loaded yet');
            return false;
        }
        
        // Check if Tone.context exists
        if (!Tone.context) {
            console.warn('HandPan: Tone.context not available');
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
                return false;
            }
        }
        return true;
    }
    
    updateAudioStatusIndicator() {
        const indicator = this.shadowRoot.getElementById('audioStatusIndicator');
        if (indicator) {
            if (typeof Tone !== 'undefined' && Tone.context && Tone.context.state === 'running') {
                indicator.style.display = 'none';
            } else {
                indicator.style.display = 'block';
                const textElement = indicator.querySelector('.audio-status-text');
                if (textElement) {
                    textElement.textContent = '🔇 Click to enable audio';
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
        if (!this.synth || this.isMuted) {
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
            if (now - this.lastPlayTime < 50) { // 50ms debounce
                return;
            }
            this.lastPlayTime = now;
            
            // Validate note before playing
            if (!note || typeof note !== 'string') {
                console.warn('HandPan: Invalid note provided:', note);
                return;
            }
            
            // Use triggerAttackRelease for proper timing - 0.8 second duration
            if (typeof this.synth.triggerAttackRelease === 'function') {
                this.synth.triggerAttackRelease(note, "8n");
            } else {
                console.warn('HandPan: Synthesiser triggerAttackRelease method not available');
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