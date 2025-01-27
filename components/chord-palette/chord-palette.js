export default class ChordPalette extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
            <style>
                .palette {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    padding: 10px;
                    border: 1px solid #ccc;
                    background: #f9f9f9;
                    margin-bottom: 10px;
                }
                .chord-button {
                    padding: 10px;
                    font-size: 14px;
                    background: #e0e0e0;
                    border: 1px solid #999;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background 0.3s;
                }
                .chord-button:hover {
                    background: #d0d0d0;
                }
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
      { name: "Em", notes: ["E4", "G4", "B4", "B5", "E5"] },
      { name: "F", notes: ["F4", "A4", "C5"] },
      { name: "G", notes: ["G4", "B4", "D5"] },
      { name: "Am", notes: ["A4", "C5", "E5"] },
      { name: "Am7", notes: ["A4", "C5", "E5", "G5", "G4"] },
      { name: "Asus2", notes: ["A4", "B4", "E5"] },
      { name: "B", notes: ["B4", "D#5", "F#5"] },
      { name: "Bm", notes: ["B4", "D5", "F#5"] },
    ];

    return chords
      .map(
        (chord) => `
            <button class="chord-button" data-chord='${JSON.stringify(chord)}'>
                ${chord.name}
            </button>
        `
      )
      .join("");
  }

  addChord(event) {
    const chord = JSON.parse(event.target.getAttribute("data-chord"));
    this.dispatchEvent(new CustomEvent("add-chord", { detail: {...chord, duration: 1, delay: 0} }));
  }
}

customElements.define("chord-palette", ChordPalette);
