/**
 * @jest-environment jsdom
 */
import EQDisplay from './eq-display.js';

describe('EQDisplay', () => {
  let eqDisplay;

  beforeEach(() => {
    eqDisplay = new EQDisplay();
    document.body.appendChild(eqDisplay);
  });

  afterEach(() => {
    document.body.removeChild(eqDisplay);
  });

  it('renders the EQ display with bars', () => {
    const container = eqDisplay.shadowRoot.querySelector('.eq-display');
    const bars = eqDisplay.shadowRoot.querySelectorAll('.eq-bar');
    expect(container).toBeTruthy();
    expect(bars.length).toBe(32); // Should have 32 bars
  });

  it('updates bar heights based on frequency data', () => {
    // Create mock frequency data with reasonable dB values
    const frequencyData = new Float32Array(32).fill(-80); // -80 dB
    
    // Update the spectrum
    eqDisplay.updateSpectrum(frequencyData);
    
    // Check that bars have been updated
    const bars = eqDisplay.shadowRoot.querySelectorAll('.eq-bar');
    bars.forEach(bar => {
      expect(bar.style.height).not.toBe('0%');
      expect(bar.style.height).not.toBe('100%');
    });
  });

  it('handles empty frequency data', () => {
    // Test with null, undefined, and empty array
    eqDisplay.updateSpectrum(null);
    
    let bars = eqDisplay.shadowRoot.querySelectorAll('.eq-bar');
    bars.forEach(bar => {
      expect(bar.style.height).toBe('0%');
    });

    eqDisplay.updateSpectrum(undefined);
    
    bars = eqDisplay.shadowRoot.querySelectorAll('.eq-bar');
    bars.forEach(bar => {
      expect(bar.style.height).toBe('0%');
    });

    eqDisplay.updateSpectrum(new Float32Array(0));
    
    bars = eqDisplay.shadowRoot.querySelectorAll('.eq-bar');
    bars.forEach(bar => {
      expect(bar.style.height).toBe('0%');
    });
  });

  it('handles very low dB values correctly', () => {
    // Test with very low dB values (which should result in minimal bar heights)
    const frequencyData = new Float32Array(32).fill(-200); // Very low dB
    eqDisplay.updateSpectrum(frequencyData);
    
    const bars = eqDisplay.shadowRoot.querySelectorAll('.eq-bar');
    bars.forEach(bar => {
      // Very low dB should result in very small heights (close to 0%)
      const height = parseFloat(bar.style.height);
      expect(height).toBeGreaterThanOrEqual(0);
      expect(height).toBeLessThan(5); // Should be very small
    });
  });
}); 