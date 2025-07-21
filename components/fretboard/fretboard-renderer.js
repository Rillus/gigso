import { INSTRUMENT_CONFIG, SCALE_PATTERNS, INTERVALS } from './fretboard-calculator.js';

export default class FretboardRenderer {
  constructor(container, instrument, options = {}) {
    this.container = container;
    this.instrument = instrument;
    this.options = {
      fretRange: { start: 0, end: 12 },
      theme: 'default',
      showNoteNames: true,
      showFretNumbers: true,
      showScaleDegrees: true,
      showIntervals: false,
      highlightRoot: true,
      highlightThirds: false,
      highlightFifths: false,
      highlightSevenths: false,
      practiceMode: false,
      practiceLevel: 1,
      ...options
    };
    
    this.svg = null;
    this.instrumentConfig = INSTRUMENT_CONFIG[instrument];
    this.dimensions = this.calculateDimensions();
    
    this.createSVG();
  }

  calculateDimensions() {
    const containerRect = this.container.getBoundingClientRect();
    const fretCount = this.options.fretRange.end - this.options.fretRange.start;
    
    return {
      width: Math.max(800, containerRect.width - 40),
      height: Math.max(200, (this.instrumentConfig.strings * 30) + 100),
      fretWidth: 60,
      stringSpacing: 25,
      nutWidth: 8,
      fretLineWidth: 2
    };
  }

  createSVG() {
    if (this.svg) {
      this.svg.remove();
    }

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'fretboard-svg');
    this.svg.setAttribute('width', this.dimensions.width);
    this.svg.setAttribute('height', this.dimensions.height);
    this.svg.setAttribute('viewBox', `0 0 ${this.dimensions.width} ${this.dimensions.height}`);
    
    this.container.appendChild(this.svg);
  }

  render() {
    this.clearSVG();
    this.renderFretboard();
    this.renderFretMarkers();
    this.renderStringLabels();
  }

  clearSVG() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  renderFretboard() {
    const { fretRange } = this.options;
    const fretCount = fretRange.end - fretRange.start + 1;
    const startX = this.dimensions.nutWidth + 20;
    const startY = 30;

    // Render nut (if starting from fret 0)
    if (fretRange.start === 0) {
      this.renderNut(startX - this.dimensions.nutWidth, startY);
    }

    // Render frets
    for (let fret = 0; fret <= fretCount; fret++) {
      const x = startX + (fret * this.dimensions.fretWidth);
      this.renderFret(x, startY, fret + fretRange.start);
    }

    // Render strings
    for (let string = 0; string < this.instrumentConfig.strings; string++) {
      const y = startY + (string * this.dimensions.stringSpacing);
      this.renderString(startX, y, fretCount);
    }

    // Render fret positions (clickable areas)
    this.renderFretPositions(startX, startY, fretCount);
  }

  renderNut(x, y) {
    const nutHeight = (this.instrumentConfig.strings - 1) * this.dimensions.stringSpacing;
    
    const nut = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    nut.setAttribute('x', x);
    nut.setAttribute('y', y);
    nut.setAttribute('width', this.dimensions.nutWidth);
    nut.setAttribute('height', nutHeight);
    nut.setAttribute('fill', '#8B4513');
    nut.setAttribute('stroke', '#654321');
    nut.setAttribute('stroke-width', '1');
    
    this.svg.appendChild(nut);
  }

  renderFret(x, y, fretNumber) {
    const fretHeight = (this.instrumentConfig.strings - 1) * this.dimensions.stringSpacing;
    
    const fretLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    fretLine.setAttribute('x1', x);
    fretLine.setAttribute('y1', y);
    fretLine.setAttribute('x2', x);
    fretLine.setAttribute('y2', y + fretHeight);
    fretLine.setAttribute('stroke', '#C0C0C0');
    fretLine.setAttribute('stroke-width', this.dimensions.fretLineWidth);
    
    this.svg.appendChild(fretLine);

    // Add fret number if enabled
    if (this.options.showFretNumbers && fretNumber > 0) {
      const fretNumberText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      fretNumberText.setAttribute('x', x - this.dimensions.fretWidth / 2);
      fretNumberText.setAttribute('y', y + fretHeight + 20);
      fretNumberText.setAttribute('text-anchor', 'middle');
      fretNumberText.setAttribute('font-family', 'Arial, sans-serif');
      fretNumberText.setAttribute('font-size', '12');
      fretNumberText.setAttribute('fill', '#666');
      fretNumberText.textContent = fretNumber;
      
      this.svg.appendChild(fretNumberText);
    }
  }

  renderString(x, y, fretCount) {
    const stringLength = fretCount * this.dimensions.fretWidth;
    
    const string = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    string.setAttribute('x1', x);
    string.setAttribute('y1', y);
    string.setAttribute('x2', x + stringLength);
    string.setAttribute('y2', y);
    string.setAttribute('stroke', '#B8860B');
    string.setAttribute('stroke-width', '2');
    
    this.svg.appendChild(string);
  }

  renderStringLabels() {
    const startX = 5;
    const startY = 30;
    
    this.instrumentConfig.tuning.forEach((note, index) => {
      const y = startY + (index * this.dimensions.stringSpacing);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', startX);
      label.setAttribute('y', y + 5);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-family', 'Arial, sans-serif');
      label.setAttribute('font-size', '14');
      label.setAttribute('font-weight', 'bold');
      label.setAttribute('fill', '#333');
      label.textContent = note;
      
      this.svg.appendChild(label);
    });
  }

  renderFretMarkers() {
    const { fretRange } = this.options;
    const startX = this.dimensions.nutWidth + 20;
    const centerY = 30 + ((this.instrumentConfig.strings - 1) * this.dimensions.stringSpacing) / 2;
    
    this.instrumentConfig.markers.forEach(fretNumber => {
      if (fretNumber >= fretRange.start && fretNumber <= fretRange.end) {
        const fretIndex = fretNumber - fretRange.start;
        const x = startX + (fretIndex * this.dimensions.fretWidth) - (this.dimensions.fretWidth / 2);
        
        if (this.instrumentConfig.doubleMarkers.includes(fretNumber)) {
          // Double marker (e.g., 12th fret)
          this.renderMarkerDot(x, centerY - 8, 4);
          this.renderMarkerDot(x, centerY + 8, 4);
        } else {
          // Single marker
          this.renderMarkerDot(x, centerY, 4);
        }
      }
    });
  }

  renderMarkerDot(x, y, radius) {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', radius);
    dot.setAttribute('fill', '#DDD');
    dot.setAttribute('stroke', '#BBB');
    dot.setAttribute('stroke-width', '1');
    
    this.svg.appendChild(dot);
  }

  renderFretPositions(startX, startY, fretCount) {
    for (let fret = 0; fret < fretCount; fret++) {
      for (let string = 0; string < this.instrumentConfig.strings; string++) {
        const x = startX + (fret * this.dimensions.fretWidth) + (this.dimensions.fretWidth / 2);
        const y = startY + (string * this.dimensions.stringSpacing);
        
        const position = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        position.setAttribute('cx', x);
        position.setAttribute('cy', y);
        position.setAttribute('r', '8');
        position.setAttribute('fill', 'transparent');
        position.setAttribute('class', 'fret-position');
        position.setAttribute('data-string', string);
        position.setAttribute('data-fret', fret + this.options.fretRange.start);
        position.setAttribute('data-note', this.calculateNote(string, fret + this.options.fretRange.start));
        position.style.cursor = 'pointer';
        
        this.svg.appendChild(position);
      }
    }
  }

  calculateNote(stringIndex, fret) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const openNote = this.instrumentConfig.tuning[stringIndex];
    const openNoteIndex = notes.indexOf(openNote);
    const noteIndex = (openNoteIndex + fret) % 12;
    return notes[noteIndex];
  }

  renderChord(chordData) {
    this.clearChordMarkers();
    
    if (!chordData || !chordData.data) return;
    
    const positions = chordData.data.positions;
    const startX = this.dimensions.nutWidth + 20;
    const startY = 30;
    
    positions.forEach((fretNumber, stringIndex) => {
      if (fretNumber === null || fretNumber === undefined) return;
      
      if (fretNumber === 0) {
        // Open string indicator
        this.renderOpenString(startX - 15, startY + (stringIndex * this.dimensions.stringSpacing));
      } else if (fretNumber > 0) {
        // Finger position
        const fretIndex = fretNumber - this.options.fretRange.start;
        if (fretIndex >= 0 && fretIndex < (this.options.fretRange.end - this.options.fretRange.start)) {
          const x = startX + (fretIndex * this.dimensions.fretWidth) + (this.dimensions.fretWidth / 2);
          const y = startY + (stringIndex * this.dimensions.stringSpacing);
          this.renderFingerPosition(x, y, fretNumber);
        }
      }
    });
  }

  renderOpenString(x, y) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '6');
    circle.setAttribute('fill', 'white');
    circle.setAttribute('stroke', '#333');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', 'chord-marker open-string');
    
    this.svg.appendChild(circle);
  }

  renderFingerPosition(x, y, fretNumber) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '10');
    circle.setAttribute('fill', '#FF6B6B');
    circle.setAttribute('stroke', '#FF4757');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', 'chord-marker finger-position');
    
    this.svg.appendChild(circle);
    
    // Add fret number text inside the circle
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 4);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', 'white');
    text.setAttribute('class', 'chord-marker finger-number');
    text.textContent = fretNumber;
    
    this.svg.appendChild(text);
  }

  renderScale(scaleData) {
    this.clearScaleMarkers();
    
    if (!scaleData || !scaleData.positions) return;
    
    const startX = this.dimensions.nutWidth + 20;
    const startY = 30;
    
    // Filter positions based on practice mode
    let positionsToRender = scaleData.positions;
    if (this.options.practiceMode) {
      const scalePattern = SCALE_PATTERNS[scaleData.type];
      const maxInterval = scalePattern.intervals[Math.min(this.options.practiceLevel - 1, scalePattern.intervals.length - 1)];
      positionsToRender = scaleData.positions.filter(position => 
        position.interval <= maxInterval
      );
    }
    
    positionsToRender.forEach(position => {
      const { string, fret, note, degree, interval, isRoot, isThird, isFifth, isSeventh } = position;
      const fretIndex = fret - this.options.fretRange.start;
      
      if (fretIndex >= 0 && fretIndex < (this.options.fretRange.end - this.options.fretRange.start)) {
        const x = startX + (fretIndex * this.dimensions.fretWidth) + (this.dimensions.fretWidth / 2);
        const y = startY + (string * this.dimensions.stringSpacing);
        
        this.renderScalePosition(x, y, note, degree, interval, isRoot, isThird, isFifth, isSeventh);
      }
    });
  }

  renderScalePosition(x, y, note, degree, interval, isRoot, isThird, isFifth, isSeventh) {
    // Determine colors based on highlighting options
    let fillColor = '#95E1D3';
    let strokeColor = '#4ECDC4';
    let radius = 8;
    
    if (isRoot && this.options.highlightRoot) {
      fillColor = '#4ECDC4';
      strokeColor = '#26D0CE';
      radius = 12;
    } else if (isThird && this.options.highlightThirds) {
      fillColor = '#F7DC6F';
      strokeColor = '#F4D03F';
      radius = 10;
    } else if (isFifth && this.options.highlightFifths) {
      fillColor = '#82E0AA';
      strokeColor = '#58D68D';
      radius = 10;
    } else if (isSeventh && this.options.highlightSevenths) {
      fillColor = '#D7BDE2';
      strokeColor = '#BB8FCE';
      radius = 10;
    } else if (interval !== undefined && INTERVALS[interval]) {
      fillColor = INTERVALS[interval].color;
      strokeColor = this.darkenColor(INTERVALS[interval].color, 0.2);
    }
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', fillColor);
    circle.setAttribute('stroke', strokeColor);
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', `scale-marker ${isRoot ? 'root-note' : 'scale-note'}`);
    
    this.svg.appendChild(circle);
    
    // Add note name, degree, or interval
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 3);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-size', radius > 8 ? '10' : '8');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#333');
    text.setAttribute('class', 'scale-marker scale-text');
    
    let textContent = note;
    if (this.options.showScaleDegrees && !this.options.showIntervals) {
      textContent = degree;
    } else if (this.options.showIntervals && interval !== undefined) {
      textContent = interval.toString();
    }
    
    text.textContent = textContent;
    this.svg.appendChild(text);
  }

  clearChord() {
    this.clearChordMarkers();
  }

  clearScale() {
    this.clearScaleMarkers();
  }

  clearAll() {
    this.clearChordMarkers();
    this.clearScaleMarkers();
  }

  clearChordMarkers() {
    const markers = this.svg.querySelectorAll('.chord-marker');
    markers.forEach(marker => marker.remove());
  }

  clearScaleMarkers() {
    const markers = this.svg.querySelectorAll('.scale-marker');
    markers.forEach(marker => marker.remove());
  }

  setInstrument(instrument) {
    this.instrument = instrument;
    this.instrumentConfig = INSTRUMENT_CONFIG[instrument];
    this.dimensions = this.calculateDimensions();
    this.createSVG();
  }

  setTheme(theme) {
    this.options.theme = theme;
    // Theme implementation would go here
  }

  setFretRange(start, end) {
    this.options.fretRange = { start, end };
    this.dimensions = this.calculateDimensions();
    this.createSVG();
  }

  // Phase 2 Helper Methods

  /**
   * Darken a hex color by a given percentage
   * @param {string} hexColor - Hex color string
   * @param {number} percent - Percentage to darken (0-1)
   * @returns {string} Darkened hex color
   */
  darkenColor(hexColor, percent) {
    const num = parseInt(hexColor.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /**
   * Set scale display options for Phase 2
   * @param {Object} options - Display options
   */
  setScaleDisplayOptions(options) {
    this.options = { ...this.options, ...options };
    if (this.currentScale) {
      this.renderScale(this.currentScale);
    }
  }

  /**
   * Enable/disable practice mode
   * @param {boolean} enabled - Whether practice mode is enabled
   * @param {number} level - Practice level (1-7)
   */
  setPracticeMode(enabled, level = 1) {
    this.options.practiceMode = enabled;
    this.options.practiceLevel = level;
    if (this.currentScale) {
      this.renderScale(this.currentScale);
    }
  }

  /**
   * Highlight specific intervals
   * @param {Object} highlights - Object with boolean values for each interval type
   */
  setIntervalHighlights(highlights) {
    this.options.highlightRoot = highlights.root !== undefined ? highlights.root : this.options.highlightRoot;
    this.options.highlightThirds = highlights.thirds !== undefined ? highlights.thirds : this.options.highlightThirds;
    this.options.highlightFifths = highlights.fifths !== undefined ? highlights.fifths : this.options.highlightFifths;
    this.options.highlightSevenths = highlights.sevenths !== undefined ? highlights.sevenths : this.options.highlightSevenths;
    
    if (this.currentScale) {
      this.renderScale(this.currentScale);
    }
  }

  /**
   * Render key signature information
   * @param {Object} keySignature - Key signature data
   */
  renderKeySignature(keySignature) {
    if (!keySignature) return;
    
    // Clear existing key signature display
    this.clearKeySignature();
    
    const keySignatureGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    keySignatureGroup.setAttribute('class', 'key-signature');
    
    // Position for key signature display
    const x = this.dimensions.width - 150;
    const y = 30;
    
    // Key name
    const keyText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    keyText.setAttribute('x', x);
    keyText.setAttribute('y', y);
    keyText.setAttribute('font-family', 'Arial, sans-serif');
    keyText.setAttribute('font-size', '14');
    keyText.setAttribute('font-weight', 'bold');
    keyText.setAttribute('fill', '#333');
    keyText.textContent = `Key: ${keySignature.key || 'C'}`;
    
    keySignatureGroup.appendChild(keyText);
    
    // Sharps or flats
    if (keySignature.sharps > 0) {
      const sharpsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sharpsText.setAttribute('x', x);
      sharpsText.setAttribute('y', y + 20);
      sharpsText.setAttribute('font-family', 'Arial, sans-serif');
      sharpsText.setAttribute('font-size', '12');
      sharpsText.setAttribute('fill', '#666');
      sharpsText.textContent = `Sharps: ${keySignature.sharpsList?.join(', ') || keySignature.sharps}`;
      
      keySignatureGroup.appendChild(sharpsText);
    } else if (keySignature.flats > 0) {
      const flatsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      flatsText.setAttribute('x', x);
      flatsText.setAttribute('y', y + 20);
      flatsText.setAttribute('font-family', 'Arial, sans-serif');
      flatsText.setAttribute('font-size', '12');
      flatsText.setAttribute('fill', '#666');
      flatsText.textContent = `Flats: ${keySignature.flatsList?.join(', ') || keySignature.flats}`;
      
      keySignatureGroup.appendChild(flatsText);
    }
    
    this.svg.appendChild(keySignatureGroup);
  }

  /**
   * Clear key signature display
   */
  clearKeySignature() {
    const keySignature = this.svg.querySelector('.key-signature');
    if (keySignature) {
      keySignature.remove();
    }
  }

  /**
   * Store current scale for re-rendering
   */
  setCurrentScale(scaleData) {
    this.currentScale = scaleData;
  }
}