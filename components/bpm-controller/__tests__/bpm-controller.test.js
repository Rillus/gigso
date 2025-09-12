import { fireEvent, getByRole, getByDisplayValue, getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import '../bpm-controller.js';
import State from '../../../state/state.js';

describe('BpmController Component', () => {
  let bpmController;
  let plusButton;
  let minusButton;
  let bpmInput;

  beforeEach(() => {
    // Reset state before each test
    State.setBpm(120);
    
    document.body.innerHTML = '<bpm-controller></bpm-controller>';
    bpmController = document.querySelector('bpm-controller');
    plusButton = getByRole(bpmController, 'button', { name: /increment/i });
    minusButton = getByRole(bpmController, 'button', { name: /decrement/i });
    bpmInput = getByTestId(bpmController, 'bpm-input');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Component Initialisation', () => {
    test('should render with default BPM value of 120', () => {
      expect(bpmInput.value).toBe('120');
    });

    test('should render with custom initial BPM', () => {
      document.body.innerHTML = '<bpm-controller initial-bpm="140"></bpm-controller>';
      bpmController = document.querySelector('bpm-controller');
      bpmInput = getByTestId(bpmController, 'bpm-input');
      
      expect(bpmInput.value).toBe('140');
    });

    test('should render plus and minus buttons', () => {
      expect(plusButton).toBeInTheDocument();
      expect(minusButton).toBeInTheDocument();
    });

    test('should have correct default configuration', () => {
      expect(bpmController.minBpm).toBe(60);
      expect(bpmController.maxBpm).toBe(200);
      expect(bpmController.stepSize).toBe(5);
    });

    test('should render with custom configuration', () => {
      document.body.innerHTML = '<bpm-controller min-bpm="80" max-bpm="180" step-size="10"></bpm-controller>';
      bpmController = document.querySelector('bpm-controller');
      
      expect(bpmController.minBpm).toBe(80);
      expect(bpmController.maxBpm).toBe(180);
      expect(bpmController.stepSize).toBe(10);
    });
  });

  describe('Plus Button Functionality', () => {
    test('should increment BPM by step size when plus button is clicked', () => {
      fireEvent.click(plusButton);
      expect(bpmInput.value).toBe('125');
    });

    test('should respect maximum BPM limit', () => {
      // Set BPM to near maximum
      fireEvent.change(bpmInput, { target: { value: '198' } });
      
      fireEvent.click(plusButton);
      expect(bpmInput.value).toBe('200'); // Should cap at max
      
      fireEvent.click(plusButton);
      expect(bpmInput.value).toBe('200'); // Should not exceed max
    });

    test('should dispatch bpm-changed event when BPM is incremented', () => {
      const bpmChangedHandler = jest.fn();
      bpmController.addEventListener('bpm-changed', bpmChangedHandler);

      fireEvent.click(plusButton);

      expect(bpmChangedHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            bpm: 125,
            previousBpm: 120
          })
        })
      );
    });

    test('should not dispatch event when at maximum BPM', () => {
      fireEvent.change(bpmInput, { target: { value: '200' } });
      
      const bpmChangedHandler = jest.fn();
      bpmController.addEventListener('bpm-changed', bpmChangedHandler);

      fireEvent.click(plusButton);

      expect(bpmChangedHandler).not.toHaveBeenCalled();
    });
  });

  describe('Minus Button Functionality', () => {
    test('should decrement BPM by step size when minus button is clicked', () => {
      fireEvent.click(minusButton);
      expect(bpmInput.value).toBe('115');
    });

    test('should respect minimum BPM limit', () => {
      // Set BPM to near minimum
      fireEvent.change(bpmInput, { target: { value: '62' } });
      
      fireEvent.click(minusButton);
      expect(bpmInput.value).toBe('60'); // Should cap at min
      
      fireEvent.click(minusButton);
      expect(bpmInput.value).toBe('60'); // Should not go below min
    });

    test('should dispatch bpm-changed event when BPM is decremented', () => {
      const bpmChangedHandler = jest.fn();
      bpmController.addEventListener('bpm-changed', bpmChangedHandler);

      fireEvent.click(minusButton);

      expect(bpmChangedHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            bpm: 115,
            previousBpm: 120
          })
        })
      );
    });

    test('should not dispatch event when at minimum BPM', () => {
      fireEvent.change(bpmInput, { target: { value: '60' } });
      
      const bpmChangedHandler = jest.fn();
      bpmController.addEventListener('bpm-changed', bpmChangedHandler);

      fireEvent.click(minusButton);

      expect(bpmChangedHandler).not.toHaveBeenCalled();
    });
  });

  describe('Text Input Functionality', () => {
    test('should be read-only by default', () => {
      expect(bpmInput).toHaveAttribute('readonly');
    });

    test('should become editable when clicked', () => {
      fireEvent.click(bpmInput);
      expect(bpmInput).not.toHaveAttribute('readonly');
    });

    test('should allow direct BPM input', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: '150' } });
      fireEvent.blur(bpmInput);

      expect(bpmInput.value).toBe('150');
    });

    test('should validate input within bounds', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: '250' } }); // Above max
      fireEvent.blur(bpmInput);

      expect(bpmInput.value).toBe('200'); // Should cap at max
    });

    test('should validate input below minimum', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: '30' } }); // Below min
      fireEvent.blur(bpmInput);

      expect(bpmInput.value).toBe('60'); // Should cap at min
    });

    test('should dispatch bpm-changed event on valid input', () => {
      const bpmChangedHandler = jest.fn();
      bpmController.addEventListener('bpm-changed', bpmChangedHandler);

      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: '150' } });
      fireEvent.blur(bpmInput);

      expect(bpmChangedHandler).toHaveBeenCalledTimes(1);
      const eventCall = bpmChangedHandler.mock.calls[0][0];
      expect(eventCall.detail.bpm).toBe(150);
      expect(typeof eventCall.detail.previousBpm).toBe('number');
    });

    test('should commit changes on Enter key', () => {
      const bpmChangedHandler = jest.fn();
      bpmController.addEventListener('bpm-changed', bpmChangedHandler);

      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: '130' } });
      fireEvent.keyDown(bpmInput, { key: 'Enter' });

      expect(bpmInput.value).toBe('130');
      expect(bpmInput).toHaveAttribute('readonly');
      expect(bpmChangedHandler).toHaveBeenCalled();
    });

    test('should cancel changes on Escape key', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: '130' } });
      fireEvent.keyDown(bpmInput, { key: 'Escape' });

      expect(bpmInput.value).toBe('120'); // Should revert to original
      expect(bpmInput).toHaveAttribute('readonly');
    });

    test('should handle non-numeric input gracefully', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: 'abc' } });
      fireEvent.blur(bpmInput);

      expect(bpmInput.value).toBe('120'); // Should revert to previous valid value
    });
  });

  describe('Keyboard Navigation', () => {
    test('should support Arrow Up to increment BPM', () => {
      fireEvent.click(bpmInput); // Enter edit mode
      fireEvent.keyDown(bpmInput, { key: 'ArrowUp' });

      expect(bpmInput.value).toBe('125');
    });

    test('should support Arrow Down to decrement BPM', () => {
      fireEvent.click(bpmInput); // Enter edit mode
      fireEvent.keyDown(bpmInput, { key: 'ArrowDown' });

      expect(bpmInput.value).toBe('115');
    });

    test('should respect bounds with arrow keys', () => {
      fireEvent.change(bpmInput, { target: { value: '200' } });
      fireEvent.click(bpmInput);
      fireEvent.keyDown(bpmInput, { key: 'ArrowUp' });

      expect(bpmInput.value).toBe('200'); // Should not exceed max
    });
  });

  describe('Event Handling', () => {
    test('should handle set-bpm event', () => {
      const setBpmEvent = new CustomEvent('set-bpm', { 
        detail: { bpm: 140 } 
      });
      
      bpmController.dispatchEvent(setBpmEvent);
      
      expect(bpmInput.value).toBe('140');
    });

    test('should handle reset-bpm event', () => {
      fireEvent.change(bpmInput, { target: { value: '150' } });
      
      const resetBpmEvent = new CustomEvent('reset-bpm');
      bpmController.dispatchEvent(resetBpmEvent);
      
      expect(bpmInput.value).toBe('120'); // Should reset to default
    });

    test('should validate set-bpm event input', () => {
      const setBpmEvent = new CustomEvent('set-bpm', { 
        detail: { bpm: 250 } // Above max
      });
      
      bpmController.dispatchEvent(setBpmEvent);
      
      expect(bpmInput.value).toBe('200'); // Should cap at max
    });
  });

  describe('State Integration', () => {
    test('should update global state when BPM changes', () => {
      // Mock state integration
      const originalSetBpm = State.setBpm;
      const mockSetBpm = jest.fn();
      State.setBpm = mockSetBpm;

      fireEvent.click(plusButton);

      expect(mockSetBpm).toHaveBeenCalledWith(125);
      
      // Restore original method
      State.setBpm = originalSetBpm;
    });

    test('should read from global state on initialisation', () => {
      // Set state to 140
      State.setBpm(140);

      // Re-initialise component
      bpmController.connectedCallback();

      expect(bpmInput.value).toBe('140');
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      expect(plusButton).toHaveAttribute('aria-label', 'Increment BPM by 5');
      expect(minusButton).toHaveAttribute('aria-label', 'Decrement BPM by 5');
      expect(bpmInput).toHaveAttribute('aria-label', 'BPM (Beats Per Minute)');
    });

    test('should support keyboard navigation', () => {
      plusButton.focus();
      expect(plusButton).toHaveFocus();

      // Test that elements can be focused
      bpmInput.focus();
      expect(bpmInput).toHaveFocus();

      minusButton.focus();
      expect(minusButton).toHaveFocus();
    });

    test('should announce BPM changes to screen readers', () => {
      const announcer = document.querySelector('[aria-live]');
      expect(announcer).toBeInTheDocument();

      fireEvent.click(plusButton);
      expect(announcer).toHaveTextContent('BPM changed to 125');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid attribute values gracefully', () => {
      document.body.innerHTML = '<bpm-controller initial-bpm="invalid" min-bpm="abc"></bpm-controller>';
      bpmController = document.querySelector('bpm-controller');
      
      // Should fall back to defaults
      expect(bpmController.minBpm).toBe(60);
      expect(bpmController.maxBpm).toBe(200);
    });

    test('should handle missing Tone.js gracefully', () => {
      // Mock missing Tone.js
      const originalTone = global.Tone;
      global.Tone = undefined;

      // Should not throw error during initialisation
      expect(() => {
        document.body.innerHTML = '<bpm-controller></bpm-controller>';
      }).not.toThrow();

      // Restore Tone.js
      global.Tone = originalTone;
    });

    test('should provide user feedback for invalid input', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: 'invalid' } });
      fireEvent.blur(bpmInput);

      const errorMessage = document.querySelector('.error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.textContent).toContain('valid BPM');
    });
  });

  describe('Integration Tests', () => {
    test('should work with Tone.js Transport', async () => {
      // Mock Tone.js Transport
      const mockTransport = {
        bpm: { value: 120 }
      };
      
      global.Tone = {
        Transport: mockTransport
      };

      fireEvent.click(plusButton);

      expect(mockTransport.bpm.value).toBe(125);
    });

    test('should maintain sync with other components', () => {
      const otherComponent = document.createElement('div');
      document.body.addEventListener('bpm-changed', (event) => {
        otherComponent.dataset.bpm = event.detail.bpm;
      });
      document.body.appendChild(otherComponent);

      fireEvent.click(plusButton);

      expect(otherComponent.dataset.bpm).toBe('125');
    });
  });
});
