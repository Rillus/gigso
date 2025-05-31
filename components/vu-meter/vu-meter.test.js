/**
 * @jest-environment jsdom
 */
import VUMeterDisplay from './vu-meter.js';

describe('VUMeterDisplay', () => {
  let vumeter;

  beforeEach(() => {
    vumeter = new VUMeterDisplay();
    document.body.appendChild(vumeter);
  });

  afterEach(() => {
    document.body.removeChild(vumeter);
  });

  it('renders the VU meter face, ticks, and needle', () => {
    const face = vumeter.shadowRoot.querySelector('.vu-face');
    const ticks = vumeter.shadowRoot.querySelectorAll('.vu-tick');
    const needle = vumeter.shadowRoot.querySelector('.vu-needle');
    expect(face).toBeTruthy();
    expect(ticks.length).toBeGreaterThan(0);
    expect(needle).toBeTruthy();
  });

  it('updates needle position based on volume', () => {
    // Test minimum volume (RMS = 0)
    vumeter.setVolume(0);
    let needle = vumeter.shadowRoot.querySelector('.vu-needle');
    expect(needle.style.transform).toBe('translateX(-50%) rotate(-60deg)');

    // Test maximum volume (RMS = 1)
    vumeter.setVolume(1);
    needle = vumeter.shadowRoot.querySelector('.vu-needle');
    expect(needle.style.transform).toBe('translateX(-50%) rotate(60deg)');

    // Test middle volume (RMS = 0.5)
    vumeter.setVolume(0.5);
    needle = vumeter.shadowRoot.querySelector('.vu-needle');
    // For 0.5 RMS, we expect approximately -6dB, which maps to around 48 degrees
    expect(needle.style.transform).toBe('translateX(-50%) rotate(47.95880017344075deg)');
  });

  it('responds to volume-detected event from specified monitor', () => {
    // Create a mock monitor element
    const mockMonitor = document.createElement('div');
    document.body.appendChild(mockMonitor);

    // Set the monitor attribute
    vumeter.setAttribute('monitor', 'div');

    // Simulate a volume-detected event from the monitor
    mockMonitor.dispatchEvent(new CustomEvent('volume-detected', { 
      detail: { rms: 0.5 },
      bubbles: true,
      composed: true
    }));
    const needle = vumeter.shadowRoot.querySelector('.vu-needle');
    // For 0.5 RMS, we expect approximately -6dB, which maps to around 48 degrees
    expect(needle.style.transform).toBe('translateX(-50%) rotate(47.95880017344075deg)');

    // Clean up
    document.body.removeChild(mockMonitor);
  });
});