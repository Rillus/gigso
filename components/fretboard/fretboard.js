import BaseComponent from "../base-component.js";
import FretboardRenderer from "./fretboard-renderer.js";
import FretboardCalculator from "./fretboard-calculator.js";
import chordLibrary from "../../chord-library.js";
import State from "../../state/state.js";
import ScaleKey from "../scale-key/scale-key.js";

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
    this.scaleKey = null;
    
    // Initialize calculator and renderer
    this.calculator = new FretboardCalculator();
    this.renderer = new FretboardRenderer(
      this.shadowRoot.querySelector('.fretboard-container'),
      this.instrument,
      options
    );
    
    // Initialize scale key component for enhanced scale operations
    this.initializeScaleKey(options);

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

  /**
   * Initialize the ScaleKey component for enhanced scale operations
   * @param {Object} options - Initialization options
   */
  initializeScaleKey(options = {}) {
    try {
      this.scaleKey = new ScaleKey({
        instrument: this.instrument,
        defaultKey: options.defaultKey || 'C',
        defaultScale: options.defaultScale || 'major',
        cache: options.cache !== false
      });
      
      // Listen for scale key events
      this.scaleKey.addEventListener('scale-changed', (event) => {
        this.dispatchEvent(new CustomEvent('scale-key-changed', {
          detail: event.detail,
          bubbles: true,
          composed: true
        }));
      });
      
      this.scaleKey.addEventListener('key-changed', (event) => {
        this.dispatchEvent(new CustomEvent('key-signature-changed', {
          detail: event.detail,
          bubbles: true,
          composed: true
        }));
      });
      
    } catch (error) {
      console.warn('ScaleKey component initialization failed:', error);
      this.scaleKey = null;
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
    // Use ScaleKey component if available for enhanced scale operations
    if (this.scaleKey) {
      try {
        // Generate scale using ScaleKey component
        const scaleData = this.scaleKey.generateScale(rootNote, scaleType, {
          key: key,
          instrument: this.instrument
        });
        
        // Get enhanced positions from calculator
        const scalePositions = this.calculator.getEnhancedScalePositions(
          this.instrument,
          rootNote,
          scaleType
        );

        this.currentScale = {
          root: rootNote,
          type: scaleType,
          key: key,
          positions: scalePositions,
          scaleData: scaleData
        };
        
      } catch (error) {
        console.warn('ScaleKey scale generation failed, falling back to calculator:', error);
        // Fallback to calculator method
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
      }
    } else {
      // Fallback to calculator method
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
    }

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
    
    // Update ScaleKey component if available
    if (this.scaleKey) {
      try {
        this.scaleKey.instrument = instrumentType;
      } catch (error) {
        console.warn('Failed to update ScaleKey instrument:', error);
      }
    }
    
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
    
    // Use ScaleKey component if available for enhanced transposition
    if (this.scaleKey) {
      try {
        const transposedNotes = this.scaleKey.transposeKey(
          this.currentScale.root,
          newKey,
          this.scaleKey.getScaleNotes(this.currentScale.root, this.currentScale.type)
        );
        
        // Find the new root note (first note of transposed scale)
        const newRoot = transposedNotes[0];
        
        this.displayScale(newRoot, this.currentScale.type, newKey);
        return;
      } catch (error) {
        console.warn('ScaleKey transposition failed, falling back to calculator:', error);
      }
    }
    
    // Fallback to calculator method
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

  // Phase 3 Enhanced Methods with ScaleKey Integration

  /**
   * Get chord suggestions based on current scale
   * @returns {Array} Array of suggested chords
   */
  getChordSuggestions() {
    if (!this.currentScale || !this.scaleKey) return [];
    
    try {
      return this.scaleKey.getChordSuggestions(this.currentScale.root, this.currentScale.type);
    } catch (error) {
      console.warn('Failed to get chord suggestions:', error);
      return [];
    }
  }

  /**
   * Get scale notes with frequencies
   * @param {string} rootNote - Root note of the scale
   * @param {string} scaleType - Type of scale
   * @param {number} octave - Starting octave
   * @returns {Array} Array of notes with frequencies
   */
  getScaleNotesWithFrequencies(rootNote, scaleType, octave = 4) {
    if (!this.scaleKey) return [];
    
    try {
      const notes = this.scaleKey.getScaleNotes(rootNote, scaleType, octave);
      return notes.map(note => ({
        note: note,
        frequency: this.scaleKey.getNoteFrequency(note)
      }));
    } catch (error) {
      console.warn('Failed to get scale notes with frequencies:', error);
      return [];
    }
  }

  /**
   * Get interval from root note
   * @param {string} rootNote - Root note
   * @param {string} targetNote - Target note
   * @returns {Object} Interval information
   */
  getIntervalFromRoot(rootNote, targetNote) {
    if (!this.scaleKey) return null;
    
    try {
      return this.scaleKey.getIntervalFromRoot(rootNote, targetNote);
    } catch (error) {
      console.warn('Failed to get interval from root:', error);
      return null;
    }
  }

  /**
   * Validate key and scale combination
   * @param {string} key - Musical key
   * @param {string} scaleType - Scale type
   * @returns {boolean} Whether the combination is valid
   */
  validateKeyScale(key, scaleType) {
    if (!this.scaleKey) return false;
    
    try {
      return this.scaleKey.validateKeyScale(key, scaleType);
    } catch (error) {
      console.warn('Failed to validate key-scale combination:', error);
      return false;
    }
  }

  /**
   * Get scale types by category
   * @param {string} category - Category name
   * @returns {Array} Array of scale types in category
   */
  getScaleTypesByCategory(category) {
    if (!this.scaleKey) return [];
    
    try {
      return this.scaleKey.getScaleTypesByCategory(category);
    } catch (error) {
      console.warn('Failed to get scale types by category:', error);
      return [];
    }
  }

  /**
   * Get current scale key state
   * @returns {Object} Current state information
   */
  getScaleKeyState() {
    if (!this.scaleKey) return null;
    
    try {
      return this.scaleKey.getCurrentState();
    } catch (error) {
      console.warn('Failed to get scale key state:', error);
      return null;
    }
  }

  /**
   * Clear scale key cache
   */
  clearScaleKeyCache() {
    if (this.scaleKey) {
      try {
        this.scaleKey.clearCache();
      } catch (error) {
        console.warn('Failed to clear scale key cache:', error);
      }
    }
  }

  /**
   * Get scale key cache statistics
   * @returns {Object} Cache statistics
   */
  getScaleKeyCacheStats() {
    if (!this.scaleKey) return null;
    
    try {
      return this.scaleKey.getCacheStats();
    } catch (error) {
      console.warn('Failed to get scale key cache stats:', error);
      return null;
    }
  }
}

customElements.define('fretboard-component', Fretboard);