import { fireEvent, getByTestId, getByRole } from '@testing-library/dom';
import '@testing-library/jest-dom';
import '../bpm-controller.js';

describe('BpmController Accessibility Tests', () => {
  let bpmController;
  let bpmInput;
  let plusButton;
  let minusButton;

  beforeEach(() => {
    document.body.innerHTML = '<bpm-controller></bpm-controller>';
    bpmController = document.querySelector('bpm-controller');
    bpmInput = getByTestId(bpmController, 'bpm-input');
    plusButton = getByRole(bpmController, 'button', { name: /increment/i });
    minusButton = getByRole(bpmController, 'button', { name: /decrement/i });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('ARIA Labels and Roles', () => {
    test('should have correct ARIA labels', () => {
      expect(bpmInput).toHaveAttribute('aria-label', 'BPM (Beats Per Minute)');
      expect(plusButton).toHaveAttribute('aria-label', 'Increment BPM by 5');
      expect(minusButton).toHaveAttribute('aria-label', 'Decrement BPM by 5');
    });

    test('should have correct roles', () => {
      expect(bpmInput).toHaveAttribute('role', 'spinbutton');
      expect(plusButton).toHaveAttribute('role', 'button');
      expect(minusButton).toHaveAttribute('role', 'button');
    });

    test('should have proper aria-valuenow attribute', () => {
      expect(bpmInput).toHaveAttribute('aria-valuenow', '120');
      
      fireEvent.click(plusButton);
      expect(bpmInput).toHaveAttribute('aria-valuenow', '125');
    });

    test('should have proper aria-valuemin and aria-valuemax attributes', () => {
      expect(bpmInput).toHaveAttribute('aria-valuemin', '60');
      expect(bpmInput).toHaveAttribute('aria-valuemax', '200');
    });

    test('should update ARIA attributes when configuration changes', () => {
      document.body.innerHTML = '<bpm-controller min-bpm="80" max-bpm="180" step-size="10"></bpm-controller>';
      bpmController = document.querySelector('bpm-controller');
      bpmInput = getByTestId(bpmController, 'bpm-input');
      plusButton = getByRole(bpmController, 'button', { name: /increment/i });
      minusButton = getByRole(bpmController, 'button', { name: /decrement/i });

      expect(bpmInput).toHaveAttribute('aria-valuemin', '80');
      expect(bpmInput).toHaveAttribute('aria-valuemax', '180');
      expect(plusButton).toHaveAttribute('aria-label', 'Increment BPM by 10');
      expect(minusButton).toHaveAttribute('aria-label', 'Decrement BPM by 10');
    });
  });

  describe('Keyboard Navigation', () => {
    test('should support Tab navigation', () => {
      plusButton.focus();
      expect(plusButton).toHaveFocus();

      fireEvent.keyDown(plusButton, { key: 'Tab' });
      expect(bpmInput).toHaveFocus();

      fireEvent.keyDown(bpmInput, { key: 'Tab' });
      expect(minusButton).toHaveFocus();
    });

    test('should support Shift+Tab reverse navigation', () => {
      minusButton.focus();
      expect(minusButton).toHaveFocus();

      fireEvent.keyDown(minusButton, { key: 'Tab', shiftKey: true });
      expect(bpmInput).toHaveFocus();

      fireEvent.keyDown(bpmInput, { key: 'Tab', shiftKey: true });
      expect(plusButton).toHaveFocus();
    });

    test('should support Space key activation on buttons', () => {
      plusButton.focus();
      fireEvent.keyDown(plusButton, { key: ' ' });
      
      expect(bpmInput).toHaveValue('125');
    });

    test('should support Enter key activation on buttons', () => {
      minusButton.focus();
      fireEvent.keyDown(minusButton, { key: 'Enter' });
      
      expect(bpmInput).toHaveValue('115');
    });

    test('should support arrow keys in input field', () => {
      fireEvent.click(bpmInput);
      
      fireEvent.keyDown(bpmInput, { key: 'ArrowUp' });
      expect(bpmInput).toHaveValue('125');
      
      fireEvent.keyDown(bpmInput, { key: 'ArrowDown' });
      expect(bpmInput).toHaveValue('120');
    });
  });

  describe('Screen Reader Support', () => {
    test('should have live region for announcements', () => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    test('should announce BPM changes to screen readers', () => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      
      fireEvent.click(plusButton);
      
      expect(liveRegion).toHaveTextContent('BPM changed to 125');
    });

    test('should announce input validation errors', () => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: 'invalid' } });
      fireEvent.blur(bpmInput);
      
      expect(liveRegion).toHaveTextContent(/invalid/i);
    });

    test('should announce when limits are reached', () => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      
      // Set to maximum
      fireEvent.change(bpmInput, { target: { value: '200' } });
      fireEvent.click(plusButton);
      
      expect(liveRegion).toHaveTextContent(/maximum/i);
    });
  });

  describe('Focus Management', () => {
    test('should maintain focus after button clicks', () => {
      plusButton.focus();
      fireEvent.click(plusButton);
      
      expect(plusButton).toHaveFocus();
    });

    test('should handle focus on input field correctly', () => {
      fireEvent.click(bpmInput);
      
      expect(bpmInput).toHaveFocus();
      expect(bpmInput).not.toHaveAttribute('readonly');
    });

    test('should return focus after input editing', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: '130' } });
      fireEvent.keyDown(bpmInput, { key: 'Enter' });
      
      expect(bpmInput).toHaveAttribute('readonly');
      // Focus should remain on input
      expect(bpmInput).toHaveFocus();
    });

    test('should handle focus loss gracefully', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: '130' } });
      fireEvent.blur(bpmInput);
      
      expect(bpmInput).toHaveAttribute('readonly');
      expect(bpmInput).toHaveValue('130');
    });
  });

  describe('High Contrast Mode Support', () => {
    test('should have sufficient color contrast', () => {
      const computedStyle = window.getComputedStyle(bpmInput);
      
      // This would need actual contrast testing in a real implementation
      expect(bpmInput).toHaveStyle('color: rgb(0, 0, 0)'); // Example
    });

    test('should provide visual indicators beyond color', () => {
      expect(bpmInput).toHaveStyle('border: 1px solid'); // Should have border
      expect(plusButton).toHaveStyle('border: 1px solid'); // Should have border
    });
  });

  describe('Mobile Accessibility', () => {
    test('should have appropriate touch targets', () => {
      const plusButtonStyle = window.getComputedStyle(plusButton);
      const minusButtonStyle = window.getComputedStyle(minusButton);
      
      // Minimum touch target size should be 44x44px
      expect(plusButton).toHaveStyle('min-width: 44px');
      expect(plusButton).toHaveStyle('min-height: 44px');
      expect(minusButton).toHaveStyle('min-width: 44px');
      expect(minusButton).toHaveStyle('min-height: 44px');
    });

    test('should support touch interactions', () => {
      fireEvent.touchStart(plusButton);
      fireEvent.touchEnd(plusButton);
      
      expect(bpmInput).toHaveValue('125');
    });

    test('should prevent double-tap zoom on input', () => {
      expect(bpmInput).toHaveStyle('touch-action: manipulation');
    });
  });

  describe('Error Handling Accessibility', () => {
    test('should associate error messages with input', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: 'invalid' } });
      fireEvent.blur(bpmInput);
      
      const errorMessage = document.querySelector('.error-message');
      expect(errorMessage).toHaveAttribute('id');
      expect(bpmInput).toHaveAttribute('aria-describedby', errorMessage.id);
    });

    test('should announce errors immediately', () => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: 'invalid' } });
      fireEvent.blur(bpmInput);
      
      expect(liveRegion).toHaveTextContent(/error/i);
    });

    test('should clear error messages when input becomes valid', () => {
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: 'invalid' } });
      fireEvent.blur(bpmInput);
      
      const errorMessage = document.querySelector('.error-message');
      expect(errorMessage).toBeInTheDocument();
      
      fireEvent.click(bpmInput);
      fireEvent.change(bpmInput, { target: { value: '130' } });
      fireEvent.blur(bpmInput);
      
      expect(errorMessage).not.toBeInTheDocument();
      expect(bpmInput).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Internationalisation Support', () => {
    test('should support RTL languages', () => {
      document.dir = 'rtl';
      document.body.innerHTML = '<bpm-controller></bpm-controller>';
      bpmController = document.querySelector('bpm-controller');
      
      expect(bpmController).toHaveStyle('direction: rtl');
    });

    test('should localise number format', () => {
      // Mock different locale
      const originalToLocaleString = Number.prototype.toLocaleString;
      Number.prototype.toLocaleString = jest.fn().mockReturnValue('120,00');
      
      bpmInput = getByTestId(bpmController, 'bpm-input');
      expect(bpmInput).toHaveValue('120,00');
      
      Number.prototype.toLocaleString = originalToLocaleString;
    });
  });
});
