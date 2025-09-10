import BaseComponent from "../base-component.js";

const INSTRUMENT_RANGES = {
  guitar: {
    name: 'Guitar',
    strings: [
      { note: 'E2', frequency: 82.41 },
      { note: 'A2', frequency: 110.00 },
      { note: 'D3', frequency: 146.83 },
      { note: 'G3', frequency: 196.00 },
      { note: 'B3', frequency: 246.94 },
      { note: 'E4', frequency: 329.63 }
    ]
  },
  ukulele: {
    name: 'Ukulele',
    strings: [
      { note: 'G4', frequency: 392.00 },
      { note: 'C4', frequency: 261.63 },
      { note: 'E4', frequency: 329.63 },
      { note: 'A4', frequency: 440.00 }
    ]
  },
  mandolin: {
    name: 'Mandolin',
    strings: [
      { note: 'G3', frequency: 196.00 },
      { note: 'D4', frequency: 293.66 },
      { note: 'A4', frequency: 440.00 },
      { note: 'E5', frequency: 659.25 }
    ]
  }
};

export default class ChromaticTuner extends BaseComponent {
  constructor() {
    const template = `
      <div class="tuner">
        <div class="tuner-face">
          <span class="current-frequency">-- Hz</span>
          <span class="current-note">--</span>
          <span class="current-instrument">Guitar</span>
          <div class="tuner-ticks"></div>
          <div class="tuner-needle"></div>
        </div>
      </div>
    `;

    const styles = `
      .tuner {
        position: relative;
        width: 220px;
        height: 150px;
        background: #222;
        border-radius: 18px;
        box-shadow: 0 4px 16px #000a;
        border: 4px solid #111;
        overflow: hidden;
      }
      .tuner-face {
        position: absolute;
        left: 10px; top: 10px; right: 10px; bottom: 10px;
        background: radial-gradient(ellipse at 60% 80%, #66ff66 60%, #00b300 100%);
        border-radius: 120px 120px 0 0/100px 100px 0 0;
        box-shadow: 0 2px 8px #0008 inset;
        z-index: 1;
      }
      .tuner-face::before {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 0; 
        width: 80px; 
        height: 40px;
        background: #222;
        border-radius: 100px 100px 0 0;
        z-index: 6;
      }
      .current-frequency, .current-note, .current-instrument {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        color: #fff;
        font-family: Arial, sans-serif;
        font-weight: bold;
        font-size: 1.2rem;
        z-index: 5;
        pointer-events: none;
        user-select: none;
        text-shadow: 0 0 5px #0008;
        z-index: 10;
      }
      .current-frequency { 
        bottom: 17px; 
        font-size: 0.8rem;
      }
      .current-note { 
        bottom: 0px; 
        font-size: 0.8rem;
      }
      .current-instrument { 
        bottom: 0px; 
        font-size: 0.9rem;
        opacity: 0;
      }
      .tuner-ticks {
        position: absolute;
        left: -10px; 
        top: 0; 
        width: 100%; 
        height: 100%;
        z-index: 2;
        pointer-events: none;
      }
      .tuner-tick {
        position: absolute;
        width: 3px;
        height: 28px;
        background: #222;
        top: 50%;
        left: 50%;
        transform-origin: bottom center;
      }
      .tuner-tick-label {
        position: absolute;
        font-size: 1rem;
        color: #222;
        font-family: Arial, sans-serif;
        top: 50%;
        left: 50%;
        transform-origin: bottom center;
        text-align: center;
        width: 40px;
        margin-left: -20px;
        font-weight: bold;
        pointer-events: none;
      }
      .tuner-needle {
        position: absolute;
        left: 50%; 
        top: 40px;
        width: 4px; 
        height: 90px;
        background: linear-gradient(to top, #c00 60%, #f22 100%);
        border-radius: 2px;
        transform-origin: 50% 90%;
        border: 1px solid #f66;
        border-width: 0 0 0 1px;
        box-shadow: 0 0 3px #222;
        z-index: 4;
        transition: transform 0.15s cubic-bezier(.4,2,.6,1);
      }
    `;

    super(template, styles);

    this.currentInstrument = 'guitar';
    this.volumeThreshold = 0.01; // Minimum RMS volume to activate tuner (adjust as needed)
    this.currentVolume = 0;
    this.isTuningActive = true; // Start in tuning mode
    this.referenceFrequency = 440; // Standard A4 reference frequency
    this._boundFrequencyHandler = this.handleFrequencyDetected.bind(this);
    this._boundInstrumentChange = this.handleInstrumentSelected.bind(this);
    this._boundVolumeHandler = this.handleVolumeDetected.bind(this);

    // Initialize the tuner
    this.renderTicks();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for frequency-detected events from the frequency monitor
    document.addEventListener('frequency-detected', this._boundFrequencyHandler);
    
    // Listen for volume-detected events to track audio level
    document.addEventListener('volume-detected', this._boundVolumeHandler);
    
    // Listen for instrument-selected events from the instrument select component
    document.addEventListener('instrument-selected', this._boundInstrumentChange);
  }

  handleInstrumentSelected(event) {
    const instrument = event.detail.toLowerCase();
    if (INSTRUMENT_RANGES[instrument]) {
      this.currentInstrument = instrument;
      this.updateInstrumentDisplay();
      this.renderTicks();
    }
  }

  updateInstrumentDisplay() {
    const instrumentDisplay = this.shadowRoot.querySelector('.current-instrument');
    instrumentDisplay.textContent = INSTRUMENT_RANGES[this.currentInstrument].name;
  }

  handleVolumeDetected(event) {
    this.currentVolume = event.detail.rms;
  }

  handleFrequencyDetected(event) {
    const { frequency, note, cents } = event.detail;
    
    // Only process if tuning is active
    if (!this.isTuningActive) {
      return;
    }
    
    // Only process frequency data if volume is above threshold
    if (this.currentVolume < this.volumeThreshold) {
      // Signal too weak - reset to rest position
      this.setNeedleAngle(-50);
      this.shadowRoot.querySelector('.current-frequency').textContent = '-- Hz';
      this.shadowRoot.querySelector('.current-note').textContent = 'Too Quiet';
      return;
    }

    if (frequency > 0 && isFinite(frequency)) {
      // Update frequency display (round to nearest integer)
      this.shadowRoot.querySelector('.current-frequency').textContent = `${Math.round(frequency)} Hz`;
      this.shadowRoot.querySelector('.current-note').textContent = note;

      // Calculate needle angle based on cents
      // Map cents to angle: -50 cents = -50 degrees, +50 cents = +50 degrees
      const angle = Math.max(-50, Math.min(50, cents));
      this.setNeedleAngle(angle);
    } else {
      // Reset to rest position for invalid frequencies
      this.setNeedleAngle(-50);
      this.shadowRoot.querySelector('.current-frequency').textContent = '-- Hz';
      this.shadowRoot.querySelector('.current-note').textContent = '--';
    }
  }

  renderTicks() {
    const radius = 70;
    const labelRadius = 90;
    const centreX = 110;
    const centreY = 120;
    const ticks = [
      { value: -50, label: '-50¢' },
      { value: -25, label: '-25¢' },
      { value: 0, label: '0¢' },
      { value: 25, label: '+25¢' },
      { value: 50, label: '+50¢' },
    ];
    const tickCount = 21;
    const minAngle = -50;
    const maxAngle = 50;
    const ticksContainer = this.shadowRoot.querySelector('.tuner-ticks');
    ticksContainer.innerHTML = '';

    // Draw main ticks
    for (let i = 0; i < tickCount; i++) {
      const angle = minAngle + (i / (tickCount - 1)) * (maxAngle - minAngle);
      const rad = (angle - 90) * Math.PI / 180;
      const x = centreX + radius * Math.cos(rad);
      const y = centreY + radius * Math.sin(rad);
      const tick = document.createElement('div');
      tick.className = 'tuner-tick';
      tick.style.height = i % 4 === 0 ? '28px' : '18px';
      tick.style.background = i % 4 === 0 ? '#222' : '#444';
      tick.style.left = `${x}px`;
      tick.style.top = `${y}px`;
      tick.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
      ticksContainer.appendChild(tick);
    }

    // Draw labels
    // ticks.forEach((tick) => {
    //   const angle = minAngle + ((tick.value + 50) / 100) * (maxAngle - minAngle);
    //   const rad = (angle - 90) * Math.PI / 180;
    //   const x = centreX + labelRadius * Math.cos(rad);
    //   const y = centreY + labelRadius * Math.sin(rad);
    //   const label = document.createElement('div');
    //   label.className = 'tuner-tick-label';
    //   label.textContent = tick.label;
    //   label.style.left = `${x}px`;
    //   label.style.top = `${y}px`;
    //   label.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    //   ticksContainer.appendChild(label);
    // });
  }

  findClosestNote(frequency) {
    const instrument = INSTRUMENT_RANGES[this.currentInstrument];
    let closestNote = null;
    let minCents = Infinity;

    // Check each string's frequency
    for (const string of instrument.strings) {
      const cents = this.getCents(frequency, string.frequency);
      if (Math.abs(cents) < Math.abs(minCents)) {
        minCents = cents;
        closestNote = string.note;
      }
    }

    return { note: closestNote, cents: minCents };
  }

  getCents(frequency, targetFrequency) {
    return 1200 * Math.log2(frequency / targetFrequency);
  }

  setNeedleAngle(angle) {
    const needle = this.shadowRoot.querySelector('.tuner-needle');
    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
  }

  // Public API methods for external control
  setInstrument(instrumentName) {
    if (INSTRUMENT_RANGES[instrumentName]) {
      this.currentInstrument = instrumentName;
      this.updateInstrumentDisplay();
      this.renderTicks();
      
      // Dispatch instrument changed event
      this.dispatchEvent(new CustomEvent('instrument-changed', {
        detail: { instrument: instrumentName },
        bubbles: true,
        composed: true
      }));
    } else {
      throw new Error(`Unsupported instrument: ${instrumentName}`);
    }
  }

  setReferenceFrequency(frequency) {
    if (frequency > 0 && frequency < 1000) {
      this.referenceFrequency = frequency;
      
      // Dispatch reference frequency changed event
      this.dispatchEvent(new CustomEvent('reference-changed', {
        detail: { frequency: frequency },
        bubbles: true,
        composed: true
      }));
    } else {
      throw new Error(`Invalid reference frequency: ${frequency}`);
    }
  }

  setSensitivity(level) {
    const sensitivityMap = {
      'low': 0.05,
      'medium': 0.01,
      'high': 0.005
    };
    
    if (sensitivityMap[level] !== undefined) {
      this.volumeThreshold = sensitivityMap[level];
      
      // Dispatch sensitivity changed event
      this.dispatchEvent(new CustomEvent('sensitivity-changed', {
        detail: { level: level, threshold: this.volumeThreshold },
        bubbles: true,
        composed: true
      }));
    } else {
      throw new Error(`Invalid sensitivity level: ${level}`);
    }
  }

  startTuning() {
    // Enable tuning mode (currently always active, but could add state management)
    this.isTuningActive = true;
    
    // Dispatch tuning started event
    this.dispatchEvent(new CustomEvent('tuning-started', {
      detail: { active: true },
      bubbles: true,
      composed: true
    }));
  }

  stopTuning() {
    // Disable tuning mode
    this.isTuningActive = false;
    
    // Reset display
    this.setNeedleAngle(-50);
    this.shadowRoot.querySelector('.current-frequency').textContent = '-- Hz';
    this.shadowRoot.querySelector('.current-note').textContent = '--';
    
    // Dispatch tuning stopped event
    this.dispatchEvent(new CustomEvent('tuning-stopped', {
      detail: { active: false },
      bubbles: true,
      composed: true
    }));
  }

  getInstrument() {
    return this.currentInstrument;
  }

  getReferenceFrequency() {
    return this.referenceFrequency;
  }

  getSensitivity() {
    const thresholdMap = {
      0.05: 'low',
      0.01: 'medium',
      0.005: 'high'
    };
    return thresholdMap[this.volumeThreshold] || 'medium';
  }

  isTuning() {
    return this.isTuningActive;
  }

  disconnectedCallback() {
    // Clean up event listeners
    document.removeEventListener('frequency-detected', this._boundFrequencyHandler);
    document.removeEventListener('volume-detected', this._boundVolumeHandler);
    document.removeEventListener('instrument-selected', this._boundInstrumentChange);
  }
}

customElements.define('chromatic-tuner', ChromaticTuner); 