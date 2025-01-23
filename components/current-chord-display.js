class CurrentChordDisplay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .chord-display {
                    font-size: 20px;
                    font-weight: bold;
                    margin: 10px;
                    border: 1px solid black;
                    padding: 10px;
                }
            </style>
            <div class="chord-display">Chord: None</div>
        `;
        this.chordDisplay = this.shadowRoot.querySelector('.chord-display');
    }

    connectedCallback() {
        this.addEventListener('set-chord', (event) => {
            this.setChord(event.detail);
        });
    }

    setChord(chord) {
        this.chordDisplay.textContent = `Chord: ${chord}`;
    }
}

customElements.define('current-chord-display', CurrentChordDisplay); 