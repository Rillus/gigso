const template = document.createElement('template');
template.innerHTML = `
  <style>
    .eq-display {
      width: 300px;
      height: 150px;
      background: #222;
      border-radius: 8px;
      box-shadow: 0 4px 16px #000a;
      border: 4px solid #111;
      padding: 10px;
      display: flex;
      align-items: flex-end;
      gap: 2px;
      overflow: hidden;
    }
    .eq-bar {
      flex: 1;
      background: linear-gradient(to top, #4CAF50, #8BC34A);
      min-width: 4px;
      border-radius: 2px 2px 0 0;
      transition: height 0.1s ease-out;
    }
    .eq-bar::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: rgba(255, 255, 255, 0.3);
    }
  </style>
  <div class="eq-display"></div>
`;

export default class EQDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.bars = [];
    this.numBars = 32; // Number of frequency bands to display
    this.setupBars();
    
    // Buffer for frequency data
    this.frequencyBuffer = new Float32Array(this.numBars);
    
    // Animation frame handling
    this.isAnimating = false;
    this.lastUpdateTime = 0;
    this.updateInterval = 1000 / 30; // Target 30 FPS
    
    // Listen for frequency-data events
    document.addEventListener('frequency-data', (event) => {
      if (event.detail && event.detail.frequencyData) {
        // Copy data to buffer
        this.frequencyBuffer.set(event.detail.frequencyData);
        
        // Start animation if not already running
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.animate();
        }
      }
    });
  }

  setupBars() {
    const container = this.shadowRoot.querySelector('.eq-display');
    for (let i = 0; i < this.numBars; i++) {
      const bar = document.createElement('div');
      bar.className = 'eq-bar';
      bar.style.height = '0%';
      container.appendChild(bar);
      this.bars.push(bar);
    }
  }

  animate() {
    if (!this.isAnimating) return;
    
    const now = performance.now();
    const elapsed = now - this.lastUpdateTime;
    
    if (elapsed >= this.updateInterval) {
      this.updateSpectrum(this.frequencyBuffer);
      this.lastUpdateTime = now;
    }
    
    requestAnimationFrame(() => this.animate());
  }

  updateSpectrum(frequencyData) {
    // Handle empty or invalid data
    if (!frequencyData || frequencyData.length === 0) {
      this.bars.forEach(bar => {
        bar.style.height = '0%';
      });
      return;
    }

    // Convert dB to amplitude and normalize
    const minDb = -200;
    const maxDb = -60;
    const scalingFactor = 1000000; // Increased for better visibility

    for (let i = 0; i < this.numBars; i++) {
      const db = frequencyData[i];
      // Convert dB to amplitude
      const amplitude = Math.pow(10, db / 20);
      // Normalize to 0-100%
      const normalizedValue = Math.min(100, amplitude * scalingFactor);
      this.bars[i].style.height = `${normalizedValue}%`;
    }
  }
  
  disconnectedCallback() {
    // Clean up animation when component is removed
    this.isAnimating = false;
  }
}

customElements.define('eq-display', EQDisplay); 