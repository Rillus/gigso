const template = document.createElement('template');
template.innerHTML = `
  <style>
    .vu-meter {
      position: relative;
      width: 220px;
      height: 180px;
      background: #222;
      border-radius: 18px;
      box-shadow: 0 4px 16px #000a;
      border: 4px solid #111;
      overflow: hidden;
    }
    .vu-face {
      position: absolute;
      left: 10px; top: 10px; right: 10px; bottom: 10px;
      background: radial-gradient(ellipse at 60% 80%, #ffe066 60%, #ffb300 100%);
      border-radius: 0 0 120px 120px/0 0 100px 100px;
      box-shadow: 0 2px 8px #0008 inset;
      z-index: 1;
    }
    .current-frequency, .current-note {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      color: #222;
      font-family: Arial, sans-serif;
      font-size: 1.1rem;
      font-weight: bold;
      z-index: 5;
      pointer-events: none;
      user-select: none;
    }
    .current-frequency { top: 30px; }
    .current-note { top: 55px; }
    .vu-ticks {
      position: absolute;
      left: 0; top: 0; width: 100%; height: 100%;
      z-index: 2;
      pointer-events: none;
    }
    .vu-tick {
      position: absolute;
      width: 3px;
      height: 28px;
      background: #222;
      top: 50%;
      left: 50%;
      transform-origin: bottom center;
    }
    .vu-tick-label {
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
    .vu-needle {
      position: absolute;
      left: 50%; bottom: 30px;
      width: 4px; height: 90px;
      background: linear-gradient(to top, #c00 60%, #fff 100%);
      border-radius: 2px;
      transform-origin: 50% 90%;
      box-shadow: 0 0 4px #c00a;
      z-index: 4;
      transition: transform 0.15s cubic-bezier(.4,2,.6,1);
    }
    .vu-screws {
      position: absolute;
      width: 22px; height: 22px;
      background: radial-gradient(circle at 30% 30%, #eee 70%, #888 100%);
      border: 2px solid #444;
      border-radius: 50%;
      z-index: 10;
      box-shadow: 0 2px 4px #0008;
    }
    .vu-screw-tl { left: -8px; top: -8px; }
    .vu-screw-tr { right: -8px; top: -8px; }
    .vu-screw-bl { left: -8px; bottom: -8px; }
    .vu-screw-br { right: -8px; bottom: -8px; }
  </style>
  <div class="vu-meter">
    <div class="vu-face">
      <span class="current-note">VU</span>
      <div class="vu-ticks"></div>
      <div class="vu-needle"></div>
    </div>
    <div class="vu-screws vu-screw-tl"></div>
    <div class="vu-screws vu-screw-tr"></div>
    <div class="vu-screws vu-screw-bl"></div>
    <div class="vu-screws vu-screw-br"></div>
  </div>
`;

export default class VUMeter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    // Frame rate limiting
    this.lastUpdateTime = 0;
    this.updateInterval = 1000 / 30; // Target 30 FPS
    
    // Bind event handler
    this._boundVolumeHandler = this.handleVolume.bind(this);
    
    // Render ticks once
    this.renderTicks();
    
    // Listen for volume-detected events at document level
    document.addEventListener('volume-detected', this._boundVolumeHandler);
  }

  disconnectedCallback() {
    // Clean up event listener
    document.removeEventListener('volume-detected', this._boundVolumeHandler);
  }

  handleVolume(event) {
    const now = performance.now();
    if (now - this.lastUpdateTime < this.updateInterval) {
      return;
    }
    this.lastUpdateTime = now;
    
    this.setVolume(event.detail.rms);
  }

  setVolume(rms) {
    // Apply logarithmic scaling to make small values more visible
    // Map RMS value (0-1) to angle (-60 to 60 degrees) with logarithmic scaling
    const minDb = -60; // Minimum decibel level
    const maxDb = 0;   // Maximum decibel level
    const db = 20 * Math.log10(Math.max(rms, 0.000001)); // Convert to dB, prevent log(0)
    const normalizedDb = Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb))); // Normalize to 0-1 and clamp
    const angle = (normalizedDb * 120) - 60; // Map to -60 to 60 degrees
    
    // Special case for zero volume
    if (rms === 0) {
      this.shadowRoot.querySelector('.vu-needle').style.transform = 'translateX(-50%) rotate(-60deg)';
      return;
    }
    
    this.shadowRoot.querySelector('.vu-needle').style.transform = `translateX(-50%) rotate(${angle}deg)`;
  }

  renderTicks() {
    // Arc settings
    const radius = 70;
    const labelRadius = 90;
    const centreX = 100;
    const centreY = 140;
    const ticks = [
      { value: -40, label: '-40' },
      { value: -20, label: '-20' },
      { value: 0, label: '0' },
      { value: 5, label: '3' },
      { value: 20, label: '6' },
      { value: 40, label: '9' },
    ];
    const tickCount = 19;
    const minAngle = -60;
    const maxAngle = 60;
    const ticksContainer = this.shadowRoot.querySelector('.vu-ticks');
    ticksContainer.innerHTML = '';
    
    // Draw main ticks
    for (let i = 0; i < tickCount; i++) {
      const angle = minAngle + (i / (tickCount - 1)) * (maxAngle - minAngle);
      const rad = (angle - 90) * Math.PI / 180;
      const x = centreX + radius * Math.cos(rad);
      const y = centreY + radius * Math.sin(rad);
      const tick = document.createElement('div');
      tick.className = 'vu-tick';
      tick.style.height = i % 2 === 0 ? '16px' : '8px';
      tick.style.background = i % 2 === 0 ? '#222' : '#444';
      tick.style.left = `${x}px`;
      tick.style.top = `${y}px`;
      tick.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
      ticksContainer.appendChild(tick);
    }

    // Draw labels
    ticks.forEach((tick) => {
      const angle = minAngle + ((tick.value + 40) / 80) * (maxAngle - minAngle);
      const rad = (angle - 90) * Math.PI / 180;
      const x = centreX +20 + labelRadius * Math.cos(rad);
      const y = centreY + labelRadius * Math.sin(rad);
      const label = document.createElement('div');
      label.className = 'vu-tick-label';
      label.textContent = tick.label;
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
      label.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
      ticksContainer.appendChild(label);
    });
  }
}

customElements.define('vu-meter', VUMeter);