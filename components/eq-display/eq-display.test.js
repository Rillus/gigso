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
    // Create mock frequency data (32 points)
    const frequencyData = new Float32Array(2048).fill(0.5);
    
    // Update the spectrum
    eqDisplay.updateSpectrum(frequencyData);
    
    // Check that bars have been updated
    const bars = eqDisplay.shadowRoot.querySelectorAll('.eq-bar');
    bars.forEach(bar => {
      expect(bar.style.height).not.toBe('0%');
    });
  });

  it('handles empty frequency data', () => {
    const frequencyData = new Float32Array(2048).fill(0);
    eqDisplay.updateSpectrum(frequencyData);
    
    const bars = eqDisplay.shadowRoot.querySelectorAll('.eq-bar');
    bars.forEach(bar => {
      expect(bar.style.height).toBe('0%');
    });
  });
}); 