export default class ChordPalette extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const diatonicChords = ["C", "D", "E", "F", "G", "A", "B"];
    let chordColours = "";

    diatonicChords.forEach(chord => {
      chordColours += `
        .chord-button[data-chord-name*="${chord}"] {
          background: var(--colour-${chord});
        }
      `;
    });

    this.shadowRoot.innerHTML = `
      <style>
        .palette {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            padding: 10px;
            border: 1px solid #ccc;
            background: #f9f9f9;
            margin-bottom: 10px;
        }
        .chord-button {
            grid-row: 2;
            padding: 10px;
            font-size: 14px;
            background: #e0e0e0;
            color: #fff;
            text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6);
            border: 0;
            cursor: pointer;
            transition: background 0.3s;
        }
        .chord-button:hover {
            background: #d0d0d0;
        }
        .chord-button[data-chord-name*="#"] {
            grid-row: 1;
            grid-column: span 1;
            position: relative;
            left: 50%;
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
        }
        .chord-button[data-chord-name$="F#"] {
            grid-column: 4;
        }
        .chord-button[data-chord-name$="G#"] {
            grid-column: 5;
        }
        .chord-button[data-chord-name$="A#"] {
            grid-column: 6;
        }
        .chord-button[data-chord-name*="b"] {
            grid-row: 3;
            grid-column: span 1;
            position: relative;
            left: 50%;
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
        }
        .chord-button[data-chord-name$="Gb"] {
            grid-column: 4;
        }
        .chord-button[data-chord-name$="Ab"] {
            grid-column: 5;
        }
        .chord-button[data-chord-name$="Bb"] {
            grid-column: 6;
        }
        
        .chord-button[data-chord-name$="m"] {
            grid-row: 6;
            opacity: 0.8;
            text-shadow: 1px 1px 1px #000;
        }
        .chord-button[data-chord-name$="#m"] {
            grid-row: 5;
            margin-top: 2px;
        }
        .chord-button[data-chord-name$="F#m"] {
            grid-column: 4;
        }
        .chord-button[data-chord-name$="G#m"] {
            grid-column: 5;
        }
        .chord-button[data-chord-name$="A#m"] {
            grid-column: 6;
        }
        .chord-button[data-chord-name$="bm"] {
            grid-row: 7;
        }
        .chord-button[data-chord-name$="Gbm"] {
            grid-column: 4;
        }
        .chord-button[data-chord-name$="Abm"] {
            grid-column: 5;
        }
        .chord-button[data-chord-name$="Bbm"] {
            grid-column: 6;
        }
        ${chordColours}

      </style>
      <div class="palette">
          ${this.createChordButtons()}
      </div>
    `;

    this.shadowRoot.querySelectorAll(".chord-button").forEach((button) => {
      button.addEventListener("click", (e) => this.addChord(e));
    });
  }

  createChordButtons() {
    const chords = [
      { name: "C", notes: ["C4", "E4", "G4"] },
      { name: "Cm", notes: ["C4", "D#4", "G4"] },
      { name: "Dm", notes: ["D4", "F4", "A4"] },
      { name: "D7", notes: ["D4", "F#4", "A4", "C5"] },
      { name: "E", notes: ["E4", "G4", "B4"] },
      { name: "Em", notes: ["E4", "G4", "B4", "B5", "E5"] },
      { name: "F", notes: ["F4", "A4", "C5"] },
      { name: "F#m", notes: ["A4", "C#4", "F#4"] },
      { name: "G", notes: ["G4", "B4", "D5"] },
      { name: "G#m", notes: ["G#4", "B4", "D#5"] },
      { name: "G7", notes: ["G4", "B4", "D5", "F5", "G5"] },
      { name: "A", notes: ["A4", "C5", "E5"] },
      { name: "Am", notes: ["A4", "C5", "E5"] },
      { name: "Am7", notes: ["A4", "C5", "E5", "G5", "G4"] },
      { name: "Asus2", notes: ["A4", "B4", "E5"] },
      { name: "B", notes: ["B4", "D#5", "F#5"] },
      { name: "Bm", notes: ["B4", "D5", "F#5"] },
    ];

    const chromaticChords = [
      { name: "C", notes: ["C4", "E4", "G4"] },
      { name: "C#", notes: ["C#4", "E#4", "G#4"] },
      { name: "Db", notes: ["Db4", "F4", "Ab4"] },
      { name: "D", notes: ["D4", "F#4", "A4"] },
      { name: "D#", notes: ["D#4", "G4", "A#4"] },
      { name: "Eb", notes: ["Eb4", "G4", "Bb4"] },
      { name: "E", notes: ["E4", "G#4", "B4"] },
      { name: "F", notes: ["F4", "A4", "C5"] },
      { name: "F#", notes: ["F#4", "A#4", "C#5"] },
      { name: "Gb", notes: ["Gb4", "Bb4", "Db5"] },
      { name: "G", notes: ["G4", "B4", "D5"] },
      { name: "G#", notes: ["G#4", "C5", "D#5"] },
      { name: "Ab", notes: ["Ab4", "C5", "Eb5"] },
      { name: "A", notes: ["A4", "C#5", "E5"] },
      { name: "A#", notes: ["A#4", "D5", "F5"] },
      { name: "Bb", notes: ["Bb4", "D5", "F5"] },
      { name: "B", notes: ["B4", "D#5", "F#5"] },
      { name: "Cm", notes: ["C4", "D#4", "G4"] },
      { name: "C#m", notes: ["C#4", "E4", "G#4"] },
      { name: "Dbm", notes: ["Db4", "E4", "Ab4"] },
      { name: "Dm", notes: ["D4", "F4", "A4"] },
      { name: "D#m", notes: ["D#4", "G4", "A#4"] },
      { name: "Ebm", notes: ["Eb4", "Gb4", "Bb4"] },
      { name: "Em", notes: ["E4", "G4", "B4"] },
      { name: "Fm", notes: ["F4", "Ab4", "C5"] },
      { name: "F#m", notes: ["F#4", "A4", "C#5"] },
      { name: "Gbm", notes: ["Gb4", "A4", "Db5"] },
      { name: "Gm", notes: ["G4", "Bb4", "D5"] },
      { name: "G#m", notes: ["G#4", "B4", "D#5"] },
      { name: "Abm", notes: ["Ab4", "Bb4", "Eb5"] },
      { name: "Am", notes: ["A4", "C5", "E5"] },
      { name: "A#m", notes: ["A#4", "C#5", "F5"] },
      { name: "Bbm", notes: ["Bb4", "Db5", "F5"] },
      { name: "Bm", notes: ["B4", "D5", "F#5"] },
    ];

    return chromaticChords
      .map(
        (chord) => `
            <button 
              class="chord-button" 
              data-chord-name='${chord.name}'
              data-chord='${JSON.stringify(chord)}'>
                ${chord.name}
            </button>
        `
      )
      .join("");
  }

  addChord(event) {
    const chord = JSON.parse(event.target.getAttribute("data-chord"));
    this.dispatchEvent(
      new CustomEvent("add-chord", {
        detail: { ...chord, duration: 1, delay: 0 },
      })
    );
    
    // Also dispatch chord-selected for presentation demos
    this.dispatchEvent(
      new CustomEvent("chord-selected", {
        detail: { chord: chord.name, notes: chord.notes },
      })
    );
  }
}

customElements.define("chord-palette", ChordPalette);
