import state from '../../state/state.js';

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
            position: relative;
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            padding: 20px;
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
        
        /* Key selection styles */
        .chord-button.key-chord {
            border: 3px solid var(--unclelele-accent, #F7931E);
            box-shadow: 0 0 10px rgba(247, 147, 30, 0.5);
            transform: scale(1.05);
        }
        
        .key-indicator {
            grid-column: 1 / -1;
            grid-row: 1;
            text-align: center;
            font-weight: bold;
            color: var(--unclelele-accent, #F7931E);
            margin-bottom: 10px;
            padding: 8px;
            top: -15px;
            left: -15px;
            background: rgba(247, 147, 30, 0.1);
            border-radius: 5px;
            position: absolute;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
            user-select: none;
        }
        
        .key-indicator:hover {
            background: rgba(247, 147, 30, 0.2);
            transform: scale(1.02);
        }
        
        ${chordColours}

      </style>
      <div class="palette">
          <div class="key-indicator" id="keyIndicator">
              Key: <span id="keyDisplay">C Major</span>
          </div>
          ${this.createChordButtons()}
      </div>
    `;

    this.shadowRoot.querySelectorAll(".chord-button").forEach((button) => {
      button.addEventListener("click", (e) => this.addChord(e));
    });
  }

  connectedCallback() {
    // Set up key indicator click handler
    const keyIndicator = this.shadowRoot.getElementById('keyIndicator');
    if (keyIndicator) {
      keyIndicator.addEventListener('click', (e) => this.showKeySelection(e));
      keyIndicator.style.cursor = 'pointer';
    }
    
    // Initialize with default key if set
    if (state.isKeySet()) {
      this.updateKeyDisplay(state.songKey(), state.songScale());
      this.highlightKeyChord(state.songKey(), state.songScale());
      
      // Dispatch initial key to notify other components
      this.dispatchKeyChangeEvent(state.songKey(), state.songScale());
    }
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
    
    // Note: Key selection is now handled by clicking the key indicator
    // The first chord no longer automatically sets the key
  }

  // Key detection methods
  extractRootNote(chordName) {
    // Remove common chord suffixes to get the root note
    const cleanName = chordName.replace(/[m7sus2add9majminaugdim]/g, '');
    // Also remove octave numbers if present
    return cleanName.replace(/\d/g, '');
  }

  determineScaleType(chordName) {
    // Check if the chord is minor
    if (chordName.includes('m') && !chordName.includes('maj')) {
      return 'minor';
    }
    return 'major';
  }

  setKeyFromChord(chord) {
    const rootNote = this.extractRootNote(chord.name);
    const scaleType = this.determineScaleType(chord.name);
    
    // Update state
    state.setSongKey(rootNote);
    state.setSongScale(scaleType);
    state.setIsKeySet(true);
    
    // Update visual feedback
    this.updateKeyDisplay(rootNote, scaleType);
    this.highlightKeyChord(rootNote, scaleType);
    
    // Dispatch key change events
    this.dispatchKeyChangeEvent(rootNote, scaleType);
  }

  updateKeyDisplay(key, scale) {
    const keyIndicator = this.shadowRoot.getElementById('keyIndicator');
    const keyDisplay = this.shadowRoot.getElementById('keyDisplay');
    
    if (keyIndicator && keyDisplay) {
      keyDisplay.textContent = `${key} ${scale.charAt(0).toUpperCase() + scale.slice(1)}`;
      keyIndicator.style.display = 'block';
    }
  }

  highlightKeyChord(key, scale) {
    // Remove previous highlighting
    this.shadowRoot.querySelectorAll('.chord-button.key-chord').forEach(button => {
      button.classList.remove('key-chord');
    });
    
    // Find and highlight the current key chord
    const keyChordName = scale === 'minor' ? `${key}m` : key;
    const keyButton = Array.from(this.shadowRoot.querySelectorAll('.chord-button')).find(button => {
      const chordData = JSON.parse(button.getAttribute('data-chord'));
      return chordData.name === keyChordName;
    });
    
    if (keyButton) {
      keyButton.classList.add('key-chord');
    }
  }

  dispatchKeyChangeEvent(key, scale) {
    const keyData = { key, scale };
    
    // Dispatch key-changed event
    this.dispatchEvent(
      new CustomEvent('key-changed', {
        detail: keyData,
        bubbles: true
      })
    );
    
    // Dispatch key-set event if this is the first key selection
    // Check the state before we set it
    const wasKeySet = state.isKeySet();
    if (!wasKeySet) {
      this.dispatchEvent(
        new CustomEvent('key-set', {
          detail: keyData,
          bubbles: true
        })
      );
    }
  }

  showKeySelection(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Create key selection modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
    `;
    
    modalContent.innerHTML = `
      <h3 style="margin-top: 0; color: #333;">Select Key</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0;">
        ${this.createKeySelectionButtons()}
      </div>
      <div style="text-align: right;">
        <button id="cancelKeySelection" style="padding: 8px 16px; margin-right: 10px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listeners
    modalContent.querySelectorAll('.key-selection-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const key = e.target.dataset.key;
        const scale = e.target.dataset.scale;
        this.selectKey(key, scale);
        document.body.removeChild(modal);
      });
    });
    
    modalContent.querySelector('#cancelKeySelection').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  createKeySelectionButtons() {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const scales = ['major', 'minor'];
    
    let buttons = '';
    scales.forEach(scale => {
      keys.forEach(key => {
        const isCurrent = state.songKey() === key && state.songScale() === scale;
        const scaleLabel = scale === 'major' ? '' : 'm';
        buttons += `
          <button 
            class="key-selection-button" 
            data-key="${key}" 
            data-scale="${scale}"
            style="
              padding: 10px;
              border: 2px solid ${isCurrent ? '#F7931E' : '#ddd'};
              background: ${isCurrent ? '#F7931E' : 'white'};
              color: ${isCurrent ? 'white' : '#333'};
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              font-weight: ${isCurrent ? 'bold' : 'normal'};
            "
          >
            ${key}${scaleLabel}
          </button>
        `;
      });
    });
    
    return buttons;
  }

  selectKey(key, scale) {
    // Update state
    state.setSongKey(key);
    state.setSongScale(scale);
    state.setIsKeySet(true);
    
    // Update visual feedback
    this.updateKeyDisplay(key, scale);
    this.highlightKeyChord(key, scale);
    
    // Dispatch key change events
    this.dispatchKeyChangeEvent(key, scale);
  }
}

customElements.define("chord-palette", ChordPalette);
