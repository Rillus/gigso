export default class GigsoKeyboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.synth = new Tone.Synth().toDestination();
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
    }

    static get observedAttributes() {
        return ['octaves'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'octaves') {
            this.render();
        }
    }

    connectedCallback() {
        if (!this.hasAttribute('octaves')) {
            this.setAttribute('octaves', '4');
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
        }

        if (event.key === '-' || event.key === '_') {
            this.currentOctave--;
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
        const octaves = parseInt(this.getAttribute('octaves')) || 1;
        const keys = this.generateKeys(octaves);

        this.shadowRoot.innerHTML = `
            <style>
                @import "./components/gigso-keyboard/gigso-keyboard.css";

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
        this.synth.triggerAttackRelease(note, '8n');
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
}

customElements.define('gigso-keyboard', GigsoKeyboard);