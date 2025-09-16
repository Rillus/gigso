import BaseComponent from '../base-component.js';
import audioManager from '../../helpers/audioManager.js';

const template = `
<div class="mixer">
  <div class="mixer-header">
    <button class="collapse-button" aria-label="Toggle mixer visibility">
      <span class="collapse-icon">▼</span>
    </button>
    <h3 class="mixer-title">Mixer</h3>
  </div>

  <div class="mixer-content">
    <div class="channel-strips"></div>

    <div class="master-section">
      <div class="channel-strip master-channel">
        <div class="instrument-label">
          <span class="instrument-icon">🎩</span>
          <span class="instrument-name">Master</span>
        </div>

        <div class="volume-control">
          <input type="range"
                 class="volume-slider master-volume"
                 min="0"
                 max="100"
                 value="70"
                 aria-label="Master volume control">
          <div class="volume-percentage master-volume-percentage">70%</div>
        </div>

        <div class="control-buttons">
          <button class="mute-button master-mute-button"
                  aria-label="Mute Master"
                  aria-pressed="false"
                  tabindex="0">M</button>
        </div>

        <div class="level-meter-container">
          <div class="level-meter master-level-meter" style="--level: 0%">
            <div class="level-bar"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

const styles = `
.mixer {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #ecf0f1;
  user-select: none;
  min-width: 320px;
}

.mixer-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #4a5568;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px 8px 0 0;
}

.collapse-button {
  background: none;
  border: none;
  color: #ecf0f1;
  cursor: pointer;
  padding: 4px;
  margin-right: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.collapse-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.collapse-icon {
  display: inline-block;
  transition: transform 0.2s ease;
  font-size: 12px;
}

.mixer.collapsed .collapse-icon {
  transform: rotate(-90deg);
}

.mixer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ecf0f1;
}

.mixer-content {
  padding: 16px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

.mixer.collapsed .mixer-content {
  display: none;
}

.channel-strips {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
}

.channel-strip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #4a5568;
  border-radius: 6px;
  padding: 12px 8px;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.channel-strip:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: #6c7b7f;
}

.channel-strip.muted {
  background: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
}

.channel-strip.soloed {
  background: rgba(241, 196, 15, 0.1);
  border-color: #f1c40f;
  box-shadow: 0 0 8px rgba(241, 196, 15, 0.3);
}

.master-section {
  border-left: 2px solid #4a5568;
  padding-left: 12px;
  margin-left: 8px;
}

.master-channel {
  background: rgba(130, 190, 231, 0.2);
  border-color: #3498db;
}

.instrument-label {
  text-align: center;
  margin-bottom: 4px;
}

.instrument-icon {
  font-size: 18px;
  display: block;
  margin-bottom: 2px;
}

.instrument-name {
  font-size: 11px;
  font-weight: 500;
  color: #bdc3c7;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 80px;
}

.volume-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.volume-slider {
  writing-mode: bt-lr; /* IE */
  writing-mode: vertical-lr; /* Standard */
  width: 4px;
  height: 80px;
  background: #34495e;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: slider-vertical;
  appearance: slider-vertical;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  border: 2px solid #2c3e50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  border: 2px solid #2c3e50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider:hover::-webkit-slider-thumb {
  background: #5dade2;
  transform: scale(1.1);
}

.volume-percentage {
  font-size: 10px;
  color: #95a5a6;
  font-weight: 500;
  min-width: 30px;
  text-align: center;
}

.control-buttons {
  display: flex;
  gap: 4px;
  margin: 4px 0;
}

.mute-button,
.solo-button {
  width: 24px;
  height: 20px;
  border: 1px solid #4a5568;
  background: rgba(255, 255, 255, 0.05);
  color: #bdc3c7;
  font-size: 9px;
  font-weight: bold;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mute-button:hover,
.solo-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #6c7b7f;
}

.mute-button.active {
  background: #e74c3c;
  border-color: #c0392b;
  color: white;
}

.solo-button.active {
  background: #f1c40f;
  border-color: #d4ac0d;
  color: #2c3e50;
}

.level-meter-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.level-meter {
  width: 8px;
  height: 60px;
  background: #2c3e50;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  border: 1px solid #4a5568;
}

.level-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--level, 0%);
  background: linear-gradient(to top,
    #27ae60 0%,
    #27ae60 60%,
    #f39c12 80%,
    #e74c3c 100%);
  transition: height 0.1s ease-out;
  border-radius: 0 0 3px 3px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .mixer-content {
    flex-direction: column;
    gap: 8px;
  }

  .channel-strips {
    flex-wrap: wrap;
    gap: 8px;
  }

  .master-section {
    border-left: none;
    border-top: 2px solid #4a5568;
    padding-left: 0;
    padding-top: 12px;
    margin-left: 0;
    margin-top: 8px;
  }

  .channel-strip {
    min-width: 80px;
  }

  .volume-slider {
    height: 60px;
  }

  .level-meter {
    height: 40px;
  }
}

@media (max-width: 480px) {
  .mixer {
    min-width: 280px;
  }

  .channel-strip {
    min-width: 70px;
    padding: 8px 6px;
  }

  .instrument-icon {
    font-size: 16px;
  }

  .instrument-name {
    font-size: 10px;
    max-width: 60px;
  }

  .volume-slider {
    height: 50px;
  }

  .level-meter {
    height: 35px;
    width: 6px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .mixer {
    background: #000;
    color: #fff;
    border: 2px solid #fff;
  }

  .channel-strip {
    background: #222;
    border-color: #fff;
  }

  .volume-slider::-webkit-slider-thumb {
    background: #fff;
    border-color: #000;
  }
}

/* Focus styles for accessibility */
.volume-slider:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.mute-button:focus,
.solo-button:focus,
.collapse-button:focus {
  outline: 2px solid #3498db;
  outline-offset: 1px;
}

/* Animation for level meters */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.level-bar.clipping {
  animation: pulse 0.2s infinite;
}
`;

export default class Mixer extends BaseComponent {
  constructor() {
    super(template, styles, true);

    this.mixerState = {
      instruments: {},
      master: {
        volume: 0.7,
        level: 0.0,
        muted: false
      }
    };

    this.levelUpdateInterval = null;
    this.isCollapsed = false;

    this.initializeMixer();
    this.addEventListeners();
  }

  connectedCallback() {
    // Set up audio context if needed
    this.initializeAudio();

    // Register for level updates from AudioManager
    this.registerLevelCallbacks();
  }

  disconnectedCallback() {
    // Unregister level callbacks
    this.unregisterLevelCallbacks();
  }

  initializeMixer() {
    // Initialize master volume display
    this.updateMasterVolumeDisplay();
  }

  initializeAudio() {
    // Audio initialization will be handled by the main application
    // This component focuses on UI and state management
  }

  addEventListeners() {
    const eventListeners = [
      {
        selector: '.collapse-button',
        event: 'click',
        handler: this.toggleCollapse.bind(this)
      },
      {
        selector: '.master-volume',
        event: 'input',
        handler: this.handleMasterVolumeChange.bind(this)
      },
      {
        selector: '.master-mute-button',
        event: 'click',
        handler: this.toggleMasterMute.bind(this)
      }
    ];

    super.addEventListeners(eventListeners);
  }

  // Instrument Management
  addInstrument(instrumentConfig) {
    const { id, name, icon = '🎵', volume = 0.6 } = instrumentConfig;

    this.mixerState.instruments[id] = {
      id,
      name,
      icon,
      volume: Math.max(0, Math.min(1, volume)),
      muted: false,
      soloed: false,
      level: 0.0,
      originalVolume: volume // Store original for reset
    };

    this.renderChannelStrip(id);
    this.attachChannelStripEvents(id);

    // Register level callback for this new instrument
    audioManager.registerLevelCallback(id, (level) => {
      this.updateLevel(id, level);
    });
  }

  removeInstrument(instrumentId) {
    delete this.mixerState.instruments[instrumentId];

    const channelStrip = this.shadowRoot.querySelector(`[data-instrument="${instrumentId}"]`);
    if (channelStrip) {
      channelStrip.remove();
    }

    // Unregister level callback for this instrument
    audioManager.unregisterLevelCallback(instrumentId);
  }

  renderChannelStrip(instrumentId) {
    const instrument = this.mixerState.instruments[instrumentId];
    if (!instrument) return;

    const channelStripHTML = `
      <div class="channel-strip" data-instrument="${instrumentId}">
        <div class="instrument-label">
          <span class="instrument-icon">${instrument.icon}</span>
          <span class="instrument-name">${instrument.name}</span>
        </div>

        <div class="volume-control">
          <input type="range"
                 class="volume-slider"
                 min="0"
                 max="100"
                 value="${Math.round(instrument.volume * 100)}"
                 aria-label="${instrument.name} volume control"
                 tabindex="0">
          <div class="volume-percentage">${Math.round(instrument.volume * 100)}%</div>
        </div>

        <div class="control-buttons">
          <button class="mute-button"
                  aria-label="Mute ${instrument.name}"
                  aria-pressed="false"
                  tabindex="0">M</button>
          <button class="solo-button"
                  aria-label="Solo ${instrument.name}"
                  aria-pressed="false"
                  tabindex="0">S</button>
        </div>

        <div class="level-meter-container">
          <div class="level-meter" style="--level: 0%">
            <div class="level-bar"></div>
          </div>
        </div>
      </div>
    `;

    const channelStripsContainer = this.shadowRoot.querySelector('.channel-strips');
    channelStripsContainer.insertAdjacentHTML('beforeend', channelStripHTML);
  }

  attachChannelStripEvents(instrumentId) {
    const channelStrip = this.shadowRoot.querySelector(`[data-instrument="${instrumentId}"]`);
    if (!channelStrip) return;

    const volumeSlider = channelStrip.querySelector('.volume-slider');
    const muteButton = channelStrip.querySelector('.mute-button');
    const soloButton = channelStrip.querySelector('.solo-button');

    volumeSlider.addEventListener('input', (e) => {
      this.handleVolumeChange(instrumentId, parseFloat(e.target.value) / 100);
    });

    muteButton.addEventListener('click', () => {
      this.toggleMute(instrumentId);
    });

    soloButton.addEventListener('click', () => {
      this.toggleSolo(instrumentId);
    });
  }

  // Volume Control
  setVolume(instrumentId, volume) {
    const instrument = this.mixerState.instruments[instrumentId];
    if (!instrument) {
      console.warn(`Instrument ${instrumentId} not found`);
      return;
    }

    // Handle invalid volume values
    if (typeof volume !== 'number' || isNaN(volume)) {
      volume = instrument.volume; // Keep current value
    } else {
      volume = Math.max(0, Math.min(1, volume)); // Clamp to 0-1
    }

    instrument.volume = volume;
    this.updateVolumeDisplay(instrumentId);

    this.dispatchEvent(new CustomEvent('mixer-volume-change', {
      detail: {
        instrumentId,
        volume: instrument.volume,
        muted: instrument.muted
      }
    }));
  }

  handleVolumeChange(instrumentId, volume) {
    this.setVolume(instrumentId, volume);
  }

  updateVolumeDisplay(instrumentId) {
    const instrument = this.mixerState.instruments[instrumentId];
    if (!instrument) return;

    const channelStrip = this.shadowRoot.querySelector(`[data-instrument="${instrumentId}"]`);
    if (!channelStrip) return;

    const volumeSlider = channelStrip.querySelector('.volume-slider');
    const volumePercentage = channelStrip.querySelector('.volume-percentage');

    const volumePercent = Math.round(instrument.volume * 100);
    volumeSlider.value = volumePercent;
    volumePercentage.textContent = `${volumePercent}%`;
  }

  // Master Volume Control
  setMasterVolume(volume) {
    if (typeof volume !== 'number' || isNaN(volume)) {
      volume = this.mixerState.master.volume; // Keep current value
    } else {
      volume = Math.max(0, Math.min(1, volume)); // Clamp to 0-1
    }

    this.mixerState.master.volume = volume;
    this.updateMasterVolumeDisplay();

    this.dispatchEvent(new CustomEvent('mixer-master-volume-change', {
      detail: { volume }
    }));
  }

  handleMasterVolumeChange(e) {
    this.setMasterVolume(parseFloat(e.target.value) / 100);
  }

  updateMasterVolumeDisplay() {
    const masterSlider = this.shadowRoot.querySelector('.master-volume');
    const masterPercentage = this.shadowRoot.querySelector('.master-volume-percentage');

    const volumePercent = Math.round(this.mixerState.master.volume * 100);
    masterSlider.value = volumePercent;
    masterPercentage.textContent = `${volumePercent}%`;
  }

  // Master Mute Functionality
  toggleMasterMute() {
    this.mixerState.master.muted = !this.mixerState.master.muted;
    this.updateMasterMuteDisplay();

    this.dispatchEvent(new CustomEvent('mixer-master-mute-toggle', {
      detail: {
        muted: this.mixerState.master.muted
      }
    }));
  }

  updateMasterMuteDisplay() {
    const masterChannel = this.shadowRoot.querySelector('.master-channel');
    const masterMuteButton = this.shadowRoot.querySelector('.master-mute-button');

    if (this.mixerState.master.muted) {
      masterChannel.classList.add('muted');
      masterMuteButton.classList.add('active');
      masterMuteButton.setAttribute('aria-pressed', 'true');
    } else {
      masterChannel.classList.remove('muted');
      masterMuteButton.classList.remove('active');
      masterMuteButton.setAttribute('aria-pressed', 'false');
    }
  }

  // Mute Functionality
  toggleMute(instrumentId) {
    const instrument = this.mixerState.instruments[instrumentId];
    if (!instrument) {
      console.warn(`Instrument ${instrumentId} not found`);
      return;
    }

    instrument.muted = !instrument.muted;
    this.updateMuteDisplay(instrumentId);

    this.dispatchEvent(new CustomEvent('mixer-mute-toggle', {
      detail: {
        instrumentId,
        muted: instrument.muted
      }
    }));
  }

  updateMuteDisplay(instrumentId) {
    const instrument = this.mixerState.instruments[instrumentId];
    if (!instrument) return;

    const channelStrip = this.shadowRoot.querySelector(`[data-instrument="${instrumentId}"]`);
    if (!channelStrip) return;

    const muteButton = channelStrip.querySelector('.mute-button');

    if (instrument.muted) {
      channelStrip.classList.add('muted');
      muteButton.classList.add('active');
      muteButton.setAttribute('aria-pressed', 'true');
    } else {
      channelStrip.classList.remove('muted');
      muteButton.classList.remove('active');
      muteButton.setAttribute('aria-pressed', 'false');
    }
  }

  // Solo Functionality
  toggleSolo(instrumentId) {
    const instrument = this.mixerState.instruments[instrumentId];
    if (!instrument) {
      console.warn(`Instrument ${instrumentId} not found`);
      return;
    }

    // Handle exclusive solo logic
    const currentlysoloed = instrument.soloed;

    // Turn off all solos and unmute all instruments
    Object.keys(this.mixerState.instruments).forEach(id => {
      this.mixerState.instruments[id].soloed = false;
      this.mixerState.instruments[id].muted = false;
    });

    // If this instrument wasn't soloed, solo it and mute others
    if (!currentlysoloed) {
      instrument.soloed = true;
      Object.keys(this.mixerState.instruments).forEach(id => {
        if (id !== instrumentId) {
          this.mixerState.instruments[id].muted = true;
        }
      });
    }

    // Update all displays
    Object.keys(this.mixerState.instruments).forEach(id => {
      this.updateSoloDisplay(id);
      this.updateMuteDisplay(id);
    });

    this.dispatchEvent(new CustomEvent('mixer-solo-toggle', {
      detail: {
        instrumentId,
        soloed: instrument.soloed
      }
    }));
  }

  updateSoloDisplay(instrumentId) {
    const instrument = this.mixerState.instruments[instrumentId];
    if (!instrument) return;

    const channelStrip = this.shadowRoot.querySelector(`[data-instrument="${instrumentId}"]`);
    if (!channelStrip) return;

    const soloButton = channelStrip.querySelector('.solo-button');

    if (instrument.soloed) {
      channelStrip.classList.add('soloed');
      soloButton.classList.add('active');
      soloButton.setAttribute('aria-pressed', 'true');
    } else {
      channelStrip.classList.remove('soloed');
      soloButton.classList.remove('active');
      soloButton.setAttribute('aria-pressed', 'false');
    }
  }

  // Level Meters
  updateLevel(instrumentId, level) {
    const instrument = this.mixerState.instruments[instrumentId];
    if (!instrument) return;

    level = Math.max(0, Math.min(1, level)); // Clamp to 0-1
    instrument.level = level;

    const channelStrip = this.shadowRoot.querySelector(`[data-instrument="${instrumentId}"]`);
    if (!channelStrip) return;

    const levelMeter = channelStrip.querySelector('.level-meter');
    const levelBar = levelMeter.querySelector('.level-bar');

    const levelPercent = Math.round(level * 100);
    levelMeter.style.setProperty('--level', `${levelPercent}%`);

    // Add clipping indicator for levels above 90%
    if (level > 0.9) {
      levelBar.classList.add('clipping');
    } else {
      levelBar.classList.remove('clipping');
    }
  }

  updateMasterLevel(level) {
    level = Math.max(0, Math.min(1, level)); // Clamp to 0-1
    this.mixerState.master.level = level;

    const masterLevelMeter = this.shadowRoot.querySelector('.master-level-meter');
    if (!masterLevelMeter) return;

    const levelBar = masterLevelMeter.querySelector('.level-bar');
    const levelPercent = Math.round(level * 100);
    masterLevelMeter.style.setProperty('--level', `${levelPercent}%`);

    if (level > 0.9) {
      levelBar.classList.add('clipping');
    } else {
      levelBar.classList.remove('clipping');
    }
  }

  registerLevelCallbacks() {
    // Register master level callback
    audioManager.registerLevelCallback('master', (level) => {
      this.updateMasterLevel(level);
    });

    // Register callbacks for all instruments in the mixer
    Object.keys(this.mixerState.instruments).forEach(instrumentId => {
      audioManager.registerLevelCallback(instrumentId, (level) => {
        this.updateLevel(instrumentId, level);
      });
    });

    console.log('Mixer: Registered level callbacks with AudioManager');
  }

  unregisterLevelCallbacks() {
    // Unregister master level callback
    audioManager.unregisterLevelCallback('master');

    // Unregister callbacks for all instruments
    Object.keys(this.mixerState.instruments).forEach(instrumentId => {
      audioManager.unregisterLevelCallback(instrumentId);
    });

    console.log('Mixer: Unregistered level callbacks from AudioManager');
  }

  // UI Controls
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    const mixer = this.shadowRoot.querySelector('.mixer');

    if (this.isCollapsed) {
      mixer.classList.add('collapsed');
    } else {
      mixer.classList.remove('collapsed');
    }
  }

  // State Management
  getMixerState() {
    return { ...this.mixerState };
  }

  resetVolumes() {
    // Reset all instrument volumes to their original values
    Object.keys(this.mixerState.instruments).forEach(instrumentId => {
      const instrument = this.mixerState.instruments[instrumentId];
      this.setVolume(instrumentId, instrument.originalVolume);
    });

    // Reset master volume to default
    this.setMasterVolume(0.7);
  }
}

// Register the custom element
customElements.define('gigso-mixer', Mixer);