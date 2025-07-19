import { generateScaleNotes, getNoteFrequency } from '../../helpers/scaleUtils.js';

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
    }

    createHandPanSynth() {
        // Create authentic steel drum/hand pan synthesiser with rich harmonics and sustain
        this.synth = new Tone.Synth({
            oscillator: {
                type: "triangle"  // Base metallic sound
            },
            envelope: {
                attack: 0.005,    // Very quick attack for immediate response
                decay: 0.1,       // Quick decay to sustain level
                sustain: 0.3,     // Lower sustain for faster fade
                release: 0.6      // Faster release for quicker note fade
            }
        });

        // Create enhanced reverb for steel drum resonance
        this.reverb = new Tone.Reverb({
            decay: 0.8,           // Shorter decay for faster note fade
            wet: 0.25,            // Less reverb for cleaner sound
            preDelay: 0.02        // Very short pre-delay for quick response
        });

        // Add chorus for steel drum shimmer
        this.chorus = new Tone.Chorus({
            frequency: 2.5,
            delayTime: 2.5,
            depth: 0.7,
            wet: 0.2
        });

        // Add subtle delay for steel drum echo
        this.delay = new Tone.PingPongDelay({
            delayTime: 0.125,     // Convert from "15n" to seconds
            feedback: 0.2,
            wet: 0.15
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
    }

    render() {
        const size = this.getAttribute('size') || 'medium';
        const toneFields = this.createToneFields();

        this.shadowRoot.innerHTML = `
            <style>
                @import "./components/hand-pan/hand-pan.css";
            </style>
            <div class="hand-pan ${size}">
                <div class="tone-fields-container">
                    ${toneFields}
                </div>
                <div class="key-indicator">
                    ${this.currentKey} ${this.currentScale}
                </div>
            </div>
        `;

        // Store references to tone fields and re-add event listeners
        this.toneFields = this.shadowRoot.querySelectorAll('.tone-field');
        this.addEventListeners();
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
        });
    }

    handleMouseInteraction(event, index) {
        if (this.isMuted) return;

        const note = this.sortedNotes[index];
        const noteId = `mouse-${index}`;
        
        console.log('HandPan: Mouse interaction - Playing note', note, 'at index', index);
        
        // Play the note
        this.playNote(note, '2n');
        
        // Track active note
        this.activeNotes.add(noteId);
        
        // Add visual feedback
        const field = event.target;
        field.classList.add('active');
        
        // Create ripple effect
        this.createRipple(event, field);
        
        // Dispatch note-played event
        this.dispatchNoteEvent(note, index);
        
        // Remove visual feedback after animation completes
        setTimeout(() => {
            if (this.activeNotes.has(noteId)) {
                this.activeNotes.delete(noteId);
            }
            field.classList.remove('active');
        }, 300);
    }

    handleMouseRelease(event, index) {
        const noteId = `mouse-${index}`;
        
        // Remove from active notes
        this.activeNotes.delete(noteId);
        
        // Remove visual feedback immediately
        const field = event.target;
        field.classList.remove('active');
    }

    handleTouchStart(event, index) {
        if (this.isMuted) return;

        const note = this.sortedNotes[index];
        const touch = event.touches[0];
        const touchId = touch.identifier;
        const noteId = `touch-${touchId}-${index}`;
        
        console.log('HandPan: Touch start - Playing note', note, 'at index', index, 'touch ID:', touchId);
        
        // Track this touch
        this.activeTouches.set(touchId, { index, noteId });
        
        // Play the note
        this.playNote(note, '2n');
        
        // Track active note
        this.activeNotes.add(noteId);
        
        // Add visual feedback
        const field = event.target;
        field.classList.add('active');
        
        // Create ripple effect
        this.createRipple(event, field);
        
        // Dispatch note-played event
        this.dispatchNoteEvent(note, index);
        
        // Remove visual feedback after animation completes
        setTimeout(() => {
            if (this.activeNotes.has(noteId)) {
                this.activeNotes.delete(noteId);
            }
            field.classList.remove('active');
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
            field.classList.remove('active');
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
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    playNote(note, duration) {
        if (this.synth && !this.isMuted) {
            try {
                // Debounce rapid successive calls
                const now = Date.now();
                if (now - this.lastPlayTime < 50) { // 50ms debounce
                    return;
                }
                this.lastPlayTime = now;
                
                // Use triggerAttackRelease for proper timing - 0.8 second duration
                this.synth.triggerAttackRelease(note, "8n");
                
            } catch (error) {
                console.warn('HandPan: Error playing note:', error);
            }
        }
    }

    getNoteFrequency(note) {
        // Use the scale utilities for frequency calculation
        return getNoteFrequency(note);
    }

    changeKey(key, scale) {
        console.log('HandPan: Changing key to', key, scale);
        
        this.currentKey = key;
        this.currentScale = scale;
        
        // Update notes based on key and scale
        this.notes = this.getNotesForKey(key, scale);
        
        console.log('HandPan: New notes', this.notes);
        
        // Re-render with new notes
        this.render();
        
        // Dispatch key-changed event
        const keyEvent = new CustomEvent('key-changed', {
            detail: {
                key: key,
                scale: scale,
                notes: this.notes
            }
        });
        
        console.log('HandPan: Dispatching key-changed event', keyEvent.detail);
        
        // Dispatch event (it will bubble up to document automatically)
        this.dispatchEvent(keyEvent);
    }

    getNotesForKey(key, scale) {
        // Use the scale utilities to generate notes for any key and scale
        return generateScaleNotes(key, scale);
    }
}

customElements.define('hand-pan', HandPan); 