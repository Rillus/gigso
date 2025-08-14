export default class GigsoKeyboard extends HTMLElement {
    constructor() {
        try {
            super();
            this.attachShadow({ mode: 'open' });
            this.synth = null; // Will be initialized when needed
            this.keyMap = {
                'a': 0,  // C
                'w': 1,  // C#
                's': 2,  // D
                'e': 3,  // D#
                'd': 4,  // E
                'f': 5,  // F
                't': 6,  // F#
                'g': 7,  // G
                'y': 8,  // G#
                'h': 9,  // A
                'u': 10, // A#
                'j': 11  // B
            };

            this.keysPerOctave = [
                'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
            ];
            
            this.currentOctave = 3;
            this.playingNotes = new Set();
        } catch (error) {
            console.error('GigsoKeyboard: Constructor error:', error);
            // Re-throw to prevent silent failures
            throw error;
        }
    }

    /**
     * Initialize the Tone.js synth when needed
     */
    initializeSynth() {
        // Only try to initialize if Tone.js is available
        if (typeof window.Tone === 'undefined') {
            console.warn('GigsoKeyboard: Tone.js not available yet');
            return null;
        }
        
        if (!this.synth) {
            try {
                this.synth = new window.Tone.Synth().toDestination();
            } catch (error) {
                console.warn('GigsoKeyboard: Failed to initialize Tone.js synth:', error);
                this.synth = null;
            }
        }
        return this.synth;
    }

    static get observedAttributes() {
        return ['octaves', 'size'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'octaves') {
            this.render();
        }
        if (name === 'size') {
            this.updateSize();
        }
    }

    connectedCallback() {
        if (!this.hasAttribute('octaves')) {
            this.setAttribute('octaves', '4');
        }
        if (!this.hasAttribute('size')) {
            this.setAttribute('size', 'medium');
        }
        this.render();
        this.addKeyboardListeners();
        this.addEventListener('highlight-notes', (event) => {
            this.highlightNotes(event.detail);
        });
    }

    addKeyboardListeners() {
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        if (event.key === '=' || event.key === '+') {
            this.currentOctave++;
            this.dispatchEvent(new CustomEvent('octave-change', {
                detail: { octave: this.currentOctave }
            }));
        }

        if (event.key === '-' || event.key === '_') {
            this.currentOctave--;
            this.dispatchEvent(new CustomEvent('octave-change', {
                detail: { octave: this.currentOctave }
            }));
        }

        const index = this.keyMap[event.key];
        if (index !== undefined) {
            this.playNoteAndHighlight(index);
        }
    }

    handleKeyUp(event) {
        const index = this.keyMap[event.key];
        if (index !== undefined) {
            this.removeHighlight(index);
        }
    }

    playNoteAndHighlight(index) {
        this.playNote(index, true);
        const keyElement = this.shadowRoot.querySelectorAll('.key')[index + ((this.currentOctave - 1) * 12)];
        if (keyElement) {
            keyElement.classList.add('active');
        }
    }

    removeHighlight(index) {
        const keyElement = this.shadowRoot.querySelectorAll('.key')[index + ((this.currentOctave - 1) * 12)];
        if (keyElement) {
            keyElement.classList.remove('active');
        }
    }

    render() {
        try {
            const octaves = parseInt(this.getAttribute('octaves')) || 1;
            const keys = this.generateKeys(octaves);

            this.shadowRoot.innerHTML = `
                <style>
                    @import "../../gigso-keyboard.css";

                    .keyboard {
                        --octaves: ${octaves};
                        --keys: ${7 * octaves};
                        --white-key-width: calc(100% / var(--keys));
                        --black-key-width: calc(100% / var(--keys) / 1.5);
                        --black-key-margin: calc(100% / var(--keys) / 3);
                    }
                </style>
                <ol class="keyboard">
                    ${keys}
                </ol>
            `;

            this.shadowRoot.querySelectorAll('.key').forEach((key, index) => {
                key.addEventListener('mousedown', () => this.playNote(index));
            });
        } catch (error) {
            console.error('GigsoKeyboard: Render error:', error);
            // Fallback rendering without CSS import
            this.shadowRoot.innerHTML = `
                <style>
                    .keyboard { display: flex; }
                    .key { width: 20px; height: 100px; border: 1px solid #000; margin: 1px; }
                </style>
                <div class="keyboard">
                    <div class="key">C</div>
                    <div class="key">D</div>
                    <div class="key">E</div>
                    <div class="key">F</div>
                    <div class="key">G</div>
                    <div class="key">A</div>
                    <div class="key">B</div>
                </div>
            `;
        }
    }

    generateKeys(octaves) {
        return Array(octaves).fill(this.keysPerOctave).flat().map((note, index) => {
            const isBlack = note.includes('#');
            const octaveNumber = Math.floor(index / 12) + 2;
            return `
                <li 
                    class="key ${isBlack ? 'black' : 'white'} ${note.substring(0, 1)}${isBlack ? 's' : ''}" 
                    data-note="${note}${octaveNumber}"
                ></li>
            `;
        }).join('');
    }

    playNote(index, useOctave) {
        const octave = useOctave ? this.currentOctave : Math.floor(index / 12);
        const noteIndex = index % 12;
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const note = noteNames[noteIndex] + (octave);
        
        // Add note to playing notes set
        this.playingNotes.add(note);
        
        // Emit key-press event
        this.dispatchEvent(new CustomEvent('key-press', {
            detail: { note: note }
        }));
        
        // Initialize synth if needed and play note
        const synth = this.initializeSynth();
        if (synth) {
            try {
                synth.triggerAttackRelease(note, '8n');
            } catch (error) {
                console.warn('GigsoKeyboard: Failed to play note:', error);
            }
        } else {
            console.warn('GigsoKeyboard: Tone.js synth not available');
        }
    }

    highlightNotes(played) {
        this.shadowRoot.querySelectorAll('.key').forEach((key, index) => {
            const note = key.getAttribute('data-note');
            if (played.notes.includes(note)) {
                key.classList.add('active');

                setTimeout(() => {
                    key.classList.remove('active');
                }, played.duration * 1000); 
            } else {
                key.classList.remove('active');
            }
        });
    }

    // New methods for demo compatibility

    /**
     * Set the current octave for keyboard input
     * @param {number} octave - The octave number to set
     */
    setOctave(octave) {
        this.currentOctave = octave;
        
        // Update the octaves attribute to trigger a re-render
        this.setAttribute('octaves', Math.ceil(octave / 7) + 1);
        
        this.dispatchEvent(new CustomEvent('octave-change', {
            detail: { octave: this.currentOctave }
        }));
    }

    /**
     * Set the size of the keyboard
     * @param {string} size - The size ('small', 'medium', 'large')
     */
    setSize(size) {
        this.setAttribute('size', size);
        this.updateSize();
    }

    /**
     * Update the keyboard size styling
     */
    updateSize() {
        const size = this.getAttribute('size') || 'medium';
        
        // Remove existing size classes
        this.classList.remove('size-small', 'size-medium', 'size-large');
        
        // Add the new size class
        this.classList.add(`size-${size}`);
        
        // Update CSS custom properties for size-based styling
        const sizeMultipliers = {
            'small': 0.8,
            'medium': 1.0,
            'large': 1.2
        };
        
        const multiplier = sizeMultipliers[size] || 1.0;
        this.style.setProperty('--size-multiplier', multiplier);
        
        // Force a re-render to apply size changes
        this.render();
    }

    /**
     * Play a C major scale
     */
    playScale() {
        const scaleNotes = [0, 2, 4, 5, 7, 9, 11, 12]; // C major scale
        const delay = 0.5; // Half second between notes
        
        scaleNotes.forEach((noteIndex, i) => {
            setTimeout(() => {
                this.playNote(noteIndex, true);
            }, i * delay * 1000);
        });
    }

    /**
     * Stop all currently playing notes
     */
    stopAll() {
        // Stop all notes in the synth
        if (this.synth && typeof this.synth.triggerRelease === 'function') {
            try {
                this.synth.triggerRelease();
            } catch (error) {
                console.warn('GigsoKeyboard: Failed to stop notes:', error);
            }
        }
        
        // Clear playing notes set
        this.playingNotes.clear();
        
        // Remove all active highlights
        this.shadowRoot.querySelectorAll('.key.active').forEach(key => {
            key.classList.remove('active');
        });
    }
}

try {
    console.log('GigsoKeyboard: About to register custom element');
    customElements.define('gigso-keyboard', GigsoKeyboard);
    console.log('GigsoKeyboard: Custom element registered successfully');
} catch (error) {
    console.error('GigsoKeyboard: Failed to register custom element:', error);
    throw error;
}