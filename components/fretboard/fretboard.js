import BaseComponent from "../base-component.js";
import FretboardRenderer from "./fretboard-renderer.js";
import FretboardCalculator from "./fretboard-calculator.js";
import chordLibrary from "../../chord-library.js";
import State from "../../state/state.js";

const { instrument: instrumentState, currentChord } = State;

export default class Fretboard extends BaseComponent {
  constructor(options = {}) {
    const template = `<div class="fretboard-container"></div>`;
    
    const styles = `
      .fretboard-container {
        width: 100%;
        height: 100%;
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;
        background: #f8f8f8;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        box-sizing: border-box;
      }
      
      .fretboard-svg {
        display: block;
        margin: 0 auto;
      }
      
      @media (max-width: 768px) {
        .fretboard-container {
          padding: 10px;
        }
      }
    `;

    super(template, styles);

    // Initialize properties
    this.instrument = options.instrument || instrumentState() || 'guitar';
    this.fretRange = options.fretRange || { start: 0, end: 12 };
    this.theme = options.theme || 'default';
    this.currentChord = null;
    this.currentScale = null;
    
    // Initialize calculator and renderer
    this.calculator = new FretboardCalculator();
    this.renderer = new FretboardRenderer(
      this.shadowRoot.querySelector('.fretboard-container'),
      this.instrument,
      options
    );

    // Set up event listeners
    this.setupEventListeners();
    
    // Initial render
    this.render();
  }

  static get observedAttributes() {
    return ['instrument', 'chord', 'scale-root', 'scale-type', 'key', 'practice-mode', 'practice-level'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'instrument':
        this.setInstrument(newValue);
        break;
      case 'chord':
        this.displayChord(newValue);
        break;
      case 'scale-root':
        if (this.getAttribute('scale-type')) {
          this.displayScale(newValue, this.getAttribute('scale-type'));
        }
        break;
      case 'scale-type':
        if (this.getAttribute('scale-root')) {
          this.displayScale(this.getAttribute('scale-root'), newValue);
        }
        break;
      case 'key':
        this.setKey(newValue);
        break;
      case 'practice-mode':
        this.setPracticeMode(newValue === 'true');
        break;
      case 'practice-level':
        this.setPracticeLevel(parseInt(newValue) || 1);
        break;
    }
  }

  setupEventListeners() {
    // Listen for global state changes
    this.addEventListener('set-chord', (event) => {
      this.displayChord(event.detail);
    });

    this.addEventListener('set-instrument', (event) => {
      this.setInstrument(event.detail);
    });

    // Listen for note clicks on the fretboard
    this.shadowRoot.addEventListener('click', (event) => {
      if (event.target.classList.contains('fret-position')) {
        this.handleNoteClick(event);
      }
    });
  }

  handleNoteClick(event) {
    const { string, fret, note } = event.target.dataset;
    
    this.dispatchEvent(new CustomEvent('note-clicked', {
      detail: {
        string: parseInt(string),
        fret: parseInt(fret),
        note: note
      },
      bubbles: true,
      composed: true
    }));
  }

  // Public API Methods
  displayChord(chordName, variation = 0) {
    if (!chordName) {
      this.currentChord = null;
      this.renderer.clearChord();
      return;
    }

    const chordData = chordLibrary.chords[chordName];
    if (!chordData || !chordData[this.instrument]) {
      console.warn(`Chord ${chordName} not found for instrument ${this.instrument}`);
      return;
    }

    this.currentChord = {
      name: chordName,
      data: chordData[this.instrument],
      variation: variation
    };

    this.renderer.renderChord(this.currentChord);
  }

  displayScale(rootNote, scaleType, key = 'C') {
    const scalePositions = this.calculator.getEnhancedScalePositions(
      this.instrument,
      rootNote,
      scaleType
    );

    this.currentScale = {
      root: rootNote,
      type: scaleType,
      key: key,
      positions: scalePositions
    };

    this.renderer.setCurrentScale(this.currentScale);
    this.renderer.renderScale(this.currentScale);
    
    // Render key signature if available
    const keySignature = this.calculator.getKeySignature(rootNote);
    if (keySignature) {
      this.renderer.renderKeySignature({ ...keySignature, key: rootNote });
    }
    
    // Dispatch scale change event
    this.dispatchEvent(new CustomEvent('scale-changed', {
      detail: this.currentScale,
      bubbles: true,
      composed: true
    }));
  }

  setInstrument(instrumentType) {
    if (this.instrument === instrumentType) return;

    this.instrument = instrumentType;
    this.renderer.setInstrument(instrumentType);
    this.render();
    
    // Re-render current chord/scale for new instrument
    if (this.currentChord) {
      this.displayChord(this.currentChord.name, this.currentChord.variation);
    }
    if (this.currentScale) {
      this.displayScale(this.currentScale.root, this.currentScale.type, this.currentScale.key);
    }
  }

  setTheme(themeName) {
    this.theme = themeName;
    this.renderer.setTheme(themeName);
  }

  setFretRange(startFret, endFret) {
    this.fretRange = { start: startFret, end: endFret };
    this.renderer.setFretRange(startFret, endFret);
    this.render();
  }

  clearDisplay() {
    this.currentChord = null;
    this.currentScale = null;
    this.renderer.clearAll();
  }

  render() {
    this.renderer.render();
  }

  // Event registration methods for external components
  onNoteClick(callback) {
    this.addEventListener('note-clicked', callback);
  }

  onChordChange(callback) {
    this.addEventListener('chord-changed', callback);
  }

  onScaleChange(callback) {
    this.addEventListener('scale-changed', callback);
  }

  // Phase 2 Enhanced API Methods

  /**
   * Set the musical key
   * @param {string} key - The musical key
   */
  setKey(key) {
    if (this.currentScale) {
      this.displayScale(this.currentScale.root, this.currentScale.type, key);
    }
  }

  /**
   * Enable or disable practice mode
   * @param {boolean} enabled - Whether practice mode is enabled
   * @param {number} level - Practice level (1-7)
   */
  setPracticeMode(enabled, level = 1) {
    this.renderer.setPracticeMode(enabled, level);
  }

  /**
   * Set practice level
   * @param {number} level - Practice level (1-7)
   */
  setPracticeLevel(level) {
    this.renderer.setPracticeMode(true, level);
  }

  /**
   * Highlight specific intervals
   * @param {Object} highlights - Object with boolean values for each interval type
   */
  highlightIntervals(highlights) {
    this.renderer.setIntervalHighlights(highlights);
  }

  /**
   * Set scale display options
   * @param {Object} options - Display options
   */
  setScaleDisplayOptions(options) {
    this.renderer.setScaleDisplayOptions(options);
  }

  /**
   * Transpose the current scale to a different key
   * @param {string} newKey - New key to transpose to
   */
  transposeScale(newKey) {
    if (!this.currentScale) return;
    
    const transposed = this.calculator.transposeScale(
      this.currentScale.root,
      this.currentScale.type,
      newKey
    );
    
    this.displayScale(transposed.root, transposed.type, newKey);
  }

  /**
   * Get relative key for current scale
   * @returns {string} Relative key
   */
  getRelativeKey() {
    if (!this.currentScale) return null;
    return this.calculator.getRelativeKey(this.currentScale.root);
  }

  /**
   * Get parallel key for current scale
   * @returns {Object} Parallel keys
   */
  getParallelKey() {
    if (!this.currentScale) return null;
    return this.calculator.getParallelKey(this.currentScale.root);
  }

  /**
   * Get scale positions grouped by intervals
   * @returns {Object} Scale positions grouped by intervals
   */
  getScalePositionsByInterval() {
    if (!this.currentScale) return null;
    return this.calculator.getScalePositionsByInterval(
      this.instrument,
      this.currentScale.root,
      this.currentScale.type
    );
  }

  /**
   * Get all available keys
   * @returns {Array} Array of available keys
   */
  static getAvailableKeys() {
    return this.calculator?.constructor.getAvailableKeys() || [];
  }

  /**
   * Get all available scale types
   * @returns {Array} Array of available scale types
   */
  static getAvailableScales() {
    return this.calculator?.constructor.getAvailableScales() || [];
  }

  /**
   * Get interval information
   * @param {number} interval - Interval in semitones
   * @returns {Object} Interval information
   */
  static getIntervalInfo(interval) {
    return this.calculator?.constructor.getIntervalInfo(interval) || null;
  }
}

customElements.define('fretboard-component', Fretboard);