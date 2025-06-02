/**
 * @jest-environment jsdom
 */
import ChromaticTuner from './chromatic-tuner.js';

describe('ChromaticTuner', () => {
  let tuner;

  beforeEach(() => {
    tuner = new ChromaticTuner();
    document.body.appendChild(tuner);
  });

  afterEach(() => {
    document.body.removeChild(tuner);
  });

  it('renders the tuner with all elements', () => {
    const container = tuner.shadowRoot.querySelector('.tuner');
    const needle = tuner.shadowRoot.querySelector('.tuner-needle');
    const frequencyDisplay = tuner.shadowRoot.querySelector('.current-frequency');
    const noteDisplay = tuner.shadowRoot.querySelector('.current-note');
    const instrumentDisplay = tuner.shadowRoot.querySelector('.current-instrument');
    
    expect(container).toBeTruthy();
    expect(needle).toBeTruthy();
    expect(frequencyDisplay).toBeTruthy();
    expect(noteDisplay).toBeTruthy();
    expect(instrumentDisplay).toBeTruthy();
  });

  it('has default instrument set to guitar', () => {
    expect(tuner.currentInstrument).toBe('guitar');
    const instrumentDisplay = tuner.shadowRoot.querySelector('.current-instrument');
    expect(instrumentDisplay.textContent).toBe('Guitar');
  });

  it('changes instrument when instrument-selected event is received', () => {
    const event = new CustomEvent('instrument-selected', {
      detail: 'ukulele',
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(event);
    
    expect(tuner.currentInstrument).toBe('ukulele');
    const instrumentDisplay = tuner.shadowRoot.querySelector('.current-instrument');
    expect(instrumentDisplay.textContent).toBe('Ukulele');
  });

  it('ignores invalid instrument selection', () => {
    const originalInstrument = tuner.currentInstrument;
    
    const event = new CustomEvent('instrument-selected', {
      detail: 'invalid-instrument',
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(event);
    
    expect(tuner.currentInstrument).toBe(originalInstrument);
  });

  it('listens for frequency-detected events', () => {
    // Set volume above threshold first
    const volumeEvent = new CustomEvent('volume-detected', {
      detail: { rms: 0.05 }, // Above default threshold of 0.01
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(volumeEvent);

    const event = new CustomEvent('frequency-detected', {
      detail: {
        frequency: 440,
        note: 'A4',
        cents: 0
      },
      bubbles: true,
      composed: true
    });
    
    const frequencyDisplay = tuner.shadowRoot.querySelector('.current-frequency');
    const noteDisplay = tuner.shadowRoot.querySelector('.current-note');
    const initialFrequency = frequencyDisplay.textContent;
    const initialNote = noteDisplay.textContent;
    
    // Dispatch the event
    document.dispatchEvent(event);
    
    // Verify the display was updated (which proves the event was handled)
    expect(frequencyDisplay.textContent).not.toBe(initialFrequency);
    expect(noteDisplay.textContent).not.toBe(initialNote);
    expect(frequencyDisplay.textContent).toBe('440 Hz');
  });

  it('finds closest note for guitar strings', () => {
    tuner.currentInstrument = 'guitar';
    
    // Test low E string (82.41 Hz)
    const result = tuner.findClosestNote(82.5);
    expect(result.note).toBe('E2');
    expect(Math.abs(result.cents)).toBeLessThan(5); // Should be very close
  });

  it('finds closest note for ukulele strings', () => {
    tuner.currentInstrument = 'ukulele';
    
    // Test A string (440 Hz)
    const result = tuner.findClosestNote(440);
    expect(result.note).toBe('A4');
    expect(Math.abs(result.cents)).toBeLessThan(1); // Should be very close
  });

  it('finds closest note for mandolin strings', () => {
    tuner.currentInstrument = 'mandolin';
    
    // Test G string (196 Hz)
    const result = tuner.findClosestNote(196);
    expect(result.note).toBe('G3');
    expect(Math.abs(result.cents)).toBeLessThan(1); // Should be very close
  });

  it('calculates cents correctly', () => {
    const cents = tuner.getCents(220, 440); // One octave down
    expect(Math.abs(cents + 1200)).toBeLessThan(0.1); // Should be -1200 cents
    
    const centsUp = tuner.getCents(466.16, 440); // Slightly sharp
    expect(centsUp).toBeGreaterThan(0);
    expect(centsUp).toBeLessThan(100);
  });

  it('sets needle angle correctly', () => {
    tuner.setNeedleAngle(25);
    
    const needle = tuner.shadowRoot.querySelector('.tuner-needle');
    expect(needle.style.transform).toBe('translateX(-50%) rotate(25deg)');
  });

  it('updates display when frequency is detected', () => {
    // Test with guitar E2 string
    tuner.currentInstrument = 'guitar';
    
    // Set volume above threshold first
    const volumeEvent = new CustomEvent('volume-detected', {
      detail: { rms: 0.05 }, // Above default threshold of 0.01
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(volumeEvent);
    
    const event = new CustomEvent('frequency-detected', {
      detail: {
        frequency: 82.41, // Low E
        note: 'E2',
        cents: 0
      },
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(event);
    
    const frequencyDisplay = tuner.shadowRoot.querySelector('.current-frequency');
    const noteDisplay = tuner.shadowRoot.querySelector('.current-note');
    
    expect(frequencyDisplay.textContent).toBe('82 Hz');
    expect(noteDisplay.textContent).toBe('E2');
  });

  it('handles sharp frequency correctly', () => {
    tuner.currentInstrument = 'guitar';
    
    // Set volume above threshold first
    const volumeEvent = new CustomEvent('volume-detected', {
      detail: { rms: 0.05 }, // Above default threshold of 0.01
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(volumeEvent);
    
    const event = new CustomEvent('frequency-detected', {
      detail: {
        frequency: 445, // A4 sharp by about 20 cents
        note: 'A4',
        cents: 20
      },
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(event);
    
    const needle = tuner.shadowRoot.querySelector('.tuner-needle');
    // Should be rotated to show sharp (positive angle)
    expect(needle.style.transform).toContain('rotate(');
    const angle = parseFloat(needle.style.transform.match(/rotate\(([^)]+)deg\)/)[1]);
    expect(angle).toBeGreaterThan(0);
  });

  it('handles flat frequency correctly', () => {
    tuner.currentInstrument = 'guitar';
    
    // Set volume above threshold first
    const volumeEvent = new CustomEvent('volume-detected', {
      detail: { rms: 0.05 }, // Above default threshold of 0.01
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(volumeEvent);
    
    // Use a frequency that will be flat relative to a guitar string
    // Let's use a frequency slightly flat relative to the A2 string (110Hz)
    const event = new CustomEvent('frequency-detected', {
      detail: {
        frequency: 108, // Flat relative to A2 (110Hz)
        note: 'A2',
        cents: -20
      },
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(event);
    
    const needle = tuner.shadowRoot.querySelector('.tuner-needle');
    // Should be rotated to show flat (negative angle)
    expect(needle.style.transform).toContain('rotate(');
    const angle = parseFloat(needle.style.transform.match(/rotate\(([^)]+)deg\)/)[1]);
    expect(angle).toBeLessThan(0);
  });

  it('resets display when no frequency is detected', () => {
    // Set volume above threshold first
    const volumeEvent = new CustomEvent('volume-detected', {
      detail: { rms: 0.05 }, // Above default threshold of 0.01
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(volumeEvent);

    const event = new CustomEvent('frequency-detected', {
      detail: {
        frequency: 0,
        note: '--',
        cents: 0
      },
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(event);
    
    const needle = tuner.shadowRoot.querySelector('.tuner-needle');
    const frequencyDisplay = tuner.shadowRoot.querySelector('.current-frequency');
    const noteDisplay = tuner.shadowRoot.querySelector('.current-note');
    
    expect(needle.style.transform).toBe('translateX(-50%) rotate(-50deg)'); // Rest position
    expect(frequencyDisplay.textContent).toBe('-- Hz');
    expect(noteDisplay.textContent).toBe('--');
  });

  it('cleans up event listeners when disconnected', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    tuner.disconnectedCallback();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('frequency-detected', tuner._boundFrequencyHandler);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('instrument-selected', tuner._boundInstrumentChange);
    
    removeEventListenerSpy.mockRestore();
  });

  it('only responds to frequency when volume is above threshold', () => {
    tuner.currentInstrument = 'guitar';
    
    // Set volume below threshold
    const lowVolumeEvent = new CustomEvent('volume-detected', {
      detail: { rms: 0.005 }, // Below default threshold of 0.01
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(lowVolumeEvent);
    
    // Now send a frequency event
    const frequencyEvent = new CustomEvent('frequency-detected', {
      detail: {
        frequency: 440,
        note: 'A4',
        cents: 0
      },
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(frequencyEvent);
    
    // Should show "Too Quiet" instead of processing the frequency
    const noteDisplay = tuner.shadowRoot.querySelector('.current-note');
    expect(noteDisplay.textContent).toBe('Too Quiet');
  });

  it('responds to frequency when volume is above threshold', () => {
    tuner.currentInstrument = 'guitar';
    
    // Set volume above threshold
    const highVolumeEvent = new CustomEvent('volume-detected', {
      detail: { rms: 0.05 }, // Above default threshold of 0.01
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(highVolumeEvent);
    
    // Now send a frequency event
    const frequencyEvent = new CustomEvent('frequency-detected', {
      detail: {
        frequency: 440,
        note: 'A4',
        cents: 0
      },
      bubbles: true,
      composed: true
    });
    
    document.dispatchEvent(frequencyEvent);
    
    // Should process the frequency normally
    const frequencyDisplay = tuner.shadowRoot.querySelector('.current-frequency');
    const noteDisplay = tuner.shadowRoot.querySelector('.current-note');
    
    expect(frequencyDisplay.textContent).toBe('440 Hz');
    expect(noteDisplay.textContent).not.toBe('Too Quiet');
  });
}); 