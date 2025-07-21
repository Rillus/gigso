import { INSTRUMENT_CONFIG } from './fretboard-calculator.js';

export default class FretboardRenderer {
  constructor(container, instrument, options = {}) {
    this.container = container;
    this.instrument = instrument;
    this.options = {
      fretRange: { start: 0, end: 12 },
      theme: 'default',
      showNoteNames: true,
      showFretNumbers: true,
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
    
    scaleData.positions.forEach(position => {
      const { string, fret, note, degree } = position;
      const fretIndex = fret - this.options.fretRange.start;
      
      if (fretIndex >= 0 && fretIndex < (this.options.fretRange.end - this.options.fretRange.start)) {
        const x = startX + (fretIndex * this.dimensions.fretWidth) + (this.dimensions.fretWidth / 2);
        const y = startY + (string * this.dimensions.stringSpacing);
        
        this.renderScalePosition(x, y, note, degree, note === scaleData.root);
      }
    });
  }

  renderScalePosition(x, y, note, degree, isRoot) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', isRoot ? '12' : '8');
    circle.setAttribute('fill', isRoot ? '#4ECDC4' : '#95E1D3');
    circle.setAttribute('stroke', isRoot ? '#26D0CE' : '#4ECDC4');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', `scale-marker ${isRoot ? 'root-note' : 'scale-note'}`);
    
    this.svg.appendChild(circle);
    
    // Add note name or degree
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 3);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-size', isRoot ? '10' : '8');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#333');
    text.setAttribute('class', 'scale-marker scale-text');
    text.textContent = this.options.showNoteNames ? note : degree;
    
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
}