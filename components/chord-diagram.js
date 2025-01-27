import BaseComponent from "./base-component.js";
import chordLibrary from "../chord-library.js";

class ChordDiagram extends BaseComponent {
    constructor() {
        const template = `
            <div class="chord-diagram">
            </div>
        `;
        const styles = `
            .chord-diagram {
                display: grid;
                grid-template-columns: repeat(4, 20%);
                grid-template-rows: repeat(5, 25px);
                gap: 0;
                max-width: 80px;
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
        
        this.instrument = 'ukulele';
        this.chords = chordLibrary.chords;

        this.shadowRoot.querySelector('.chord-diagram').innerHTML = this.createFretboard();
    }

    static get observedAttributes() {
        return ['chord'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'chord') {
            this.renderChord(newValue);
        }

        if (name === 'instrument') {
            this.instrumnet = newValue;
        }
    }

    connectedCallback() {
        this.addEventListener('set-chord', (event) => {
            this.renderChord(event.detail);
        });
    }

    createFretboard() {
        return Array(20).fill('<div class="fret"></div>').join('');
    }

    renderChord(chord) {
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

        this.chords[chord][this.instrument].positions.forEach((fretNumber, stringIndex) => {
            if (fretNumber > 0) {
                const fretPosition = stringIndex + (fretNumber - 1) * 4;
                frets[fretPosition].classList.add('active');
            }
        });
    }
}

customElements.define('chord-diagram', ChordDiagram); 