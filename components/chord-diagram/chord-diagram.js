import BaseComponent from "../base-component.js";
import chordLibrary from "../../chord-library.js";
import State from '../../state/state.js';
import EventHandlers from "../../helpers/eventHandlers.js";
const { instrument: instrumentState } = State;

export default class ChordDiagram extends BaseComponent {
    constructor() {
        const template = `<div class="chord-diagram"></div>`;

        const styles = `
            .chord-diagram {
                display: grid;
                grid-template-columns: repeat(4, 20%);
                grid-template-rows: repeat(5, 25px);
                gap: 0;
                max-width: 80px;
            }
            .chord-diagram--guitar {
                grid-template-columns: repeat(6, 15%);
            }
            .string {
                width: 20px;
                height: 20px;
                background: #e0e0e0;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
            .fret {
                width: 20px;
                height: 25px;
                background: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                background: 
                    linear-gradient(
                        90deg,
                        rgba(0,0,0,0) 0%,
                        rgba(0,0,0,0) 40%,
                        rgba(100,100,100,1) 45%,
                        rgba(0,0,0,1) 55%,
                        rgba(0,0,0,0) 60%,
                        rgba(0,0,0,0) 100%
                    ),
                    linear-gradient(
                        0deg,
                        #666 2%,
                        #bcbcbc 5%,
                        #bcbcbc 7%,
                        #fff 9%,
                        #915800 10%,
                        #c47700 80%
                    );
            }
            .fret.active::after {
                content: '';
                display: block;
                width: 100%;
                height: 20px;
                border-radius: 50%;
                border: 1px solid #000;
                background: #fff;
                position: relative;
                z-index: 1;
            }
        `;

        super(template, styles)
        
        this.instrument = instrumentState();
        this.chord = this.getAttribute('chord');
        this.chords = chordLibrary.chords;
        this.initialised = false;

        this.shadowRoot.querySelector('.chord-diagram').innerHTML = this.createFretboard();
        this.initialised = true;

        // Add event listener for set-chord event
        this.addEventListener('set-chord', (event) => {
            this.chord = event.detail;
            this.renderChord(this.chord);
        });
    }

    static get observedAttributes() {
        return ['chord', 'instrument'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }
        
        if (name === 'chord') {
            this.chord = newValue;
        }

        if (name === 'instrument') {
            this.instrument = newValue.toLowerCase();
        }
        this.setInstrument();
    }

    connectedCallback() {
        if (this.initialised) {
            return;
        }
        this.setInstrument();
    }

    createFretboard() {
        if (this.instrument.toLowerCase() === 'mandolin' || this.instrument.toLowerCase() === 'ukulele') {
            return Array(20).fill('<div class="fret"></div>').join('');
        }
        return Array(30).fill('<div class="fret"></div>').join('');
    }

    renderChord(chord) {
        if (!this.initialised) {
            this.initialised = true;
            return;
        }
        const frets = this.shadowRoot.querySelectorAll('.fret');
        frets.forEach(fret => fret.classList.remove('active'));

        if (this.chords[chord] === undefined) {
            console.error('chord undefined: ', chord);
            return;
        }
        
        if (this.chords[chord][this.instrument] === undefined) {
            console.error('chord undefined for this instrument: ', chord, this.instrument);
            return;
        }

        if (this.chords[chord][this.instrument].positions === undefined) {
            console.error('positions undefined for this chord/instrument: ', chord, this.instrument);
            return;
        }

        const positions = this.chords[chord][this.instrument].positions;
        const numberOfStrings = positions.length;

        positions.forEach((fretNumber, stringIndex) => {
            if (fretNumber > 0) {
                const fretPosition = stringIndex + (fretNumber - 1) * numberOfStrings;
                
                if (fretPosition >= 0 && fretPosition < frets.length) {
                    frets[fretPosition].classList.add('active');
                } else {
                    console.warn(`Calculated fretPosition ${fretPosition} is out of bounds (0-${frets.length - 1}) for string ${stringIndex}, fret ${fretNumber}`);
                }
            }
        });
    }

    setInstrument() {
        this.shadowRoot.querySelector('.chord-diagram').classList.forEach(className => {
            if (className !== 'chord-diagram') {
                if (className !== `chord-diagram--${this.instrument}`) {
                    this.shadowRoot.querySelector('.chord-diagram').classList.remove(className);
                }
            }
        });
        if (!this.shadowRoot.querySelector('.chord-diagram').classList.contains(`chord-diagram--${this.instrument}`)) {
            this.shadowRoot.querySelector('.chord-diagram').classList.add(`chord-diagram--${this.instrument}`);
        }
        
        this.shadowRoot.querySelector('.chord-diagram').innerHTML = this.createFretboard();
       
        if (this.chord) {
            this.renderChord(this.chord);
        }
    }
}

customElements.define('chord-diagram', ChordDiagram); 