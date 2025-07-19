import midiInterface from '../../helpers/midiInterface.js';

class MidiController extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.connected = false;
    this.devices = {
      inputs: new Map(),
      outputs: new Map()
    };
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  async init() {
    try {
      await midiInterface.init();
      this.devices.inputs = midiInterface.midiAccess.inputs;
      this.devices.outputs = midiInterface.midiAccess.outputs;
      this.connected = true;
      this.updateStatus();
      this.dispatchEvent(new CustomEvent('midi-connected', {
        detail: { devices: this.devices }
      }));
    } catch (error) {
      console.error('Failed to initialise MIDI:', error);
      this.connected = false;
      this.updateStatus();
    }
  }

  cleanup() {
    if (this.connected) {
      // Remove MIDI event listeners
      this.devices.inputs.forEach(input => {
        input.onmidimessage = null;
      });
      this.connected = false;
      this.updateStatus();
    }
  }

  setupEventListeners() {
    const toggleButton = this.shadowRoot.querySelector('#toggle-midi');
    toggleButton.addEventListener('click', async () => {
      if (!this.connected) {
        await this.init();
      } else {
        this.cleanup();
      }
    });
  }

  updateStatus() {
    const status = this.shadowRoot.querySelector('#midi-status');
    const toggleButton = this.shadowRoot.querySelector('#toggle-midi');
    
    if (this.connected) {
      status.textContent = 'MIDI Connected';
      status.className = 'connected';
      toggleButton.textContent = 'Disconnect MIDI';
    } else {
      status.textContent = 'MIDI Disconnected';
      status.className = 'disconnected';
      toggleButton.textContent = 'Connect MIDI';
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 4px;
          margin: 1rem 0;
        }

        .midi-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        #midi-status {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: bold;
        }

        .connected {
          background: #4CAF50;
          color: white;
        }

        .disconnected {
          background: #f44336;
          color: white;
        }

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background: #2196F3;
          color: white;
          cursor: pointer;
          font-weight: bold;
        }

        button:hover {
          background: #1976D2;
        }

        .device-list {
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .device-list h3 {
          margin: 0.5rem 0;
        }

        .device-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .device-list li {
          padding: 0.25rem 0;
        }
      </style>

      <div class="midi-container">
        <div id="midi-status">MIDI Disconnected</div>
        <button id="toggle-midi">Connect MIDI</button>
      </div>
      <div class="device-list">
        <h3>Available Devices:</h3>
        <div id="device-list"></div>
      </div>
    `;
  }
}

customElements.define('midi-controller', MidiController); 