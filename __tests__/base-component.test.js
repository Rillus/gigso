import '../components/base-component.js';
import BaseComponent from '../components/base-component.js';

// Register the custom element
customElements.define('base-component', BaseComponent);

// __tests__/base-component.test.js
describe('BaseComponent isolatedStyles', () => {
  let baseComponent;

  beforeEach(() => {
    const template = '<div>Test</div>';
    const styles = 'div { color: red; }';
    baseComponent = new BaseComponent(template, styles, true);
    document.body.appendChild(baseComponent);
  });
  
  afterEach(() => {
    document.body.removeChild(baseComponent);
  });
  
  test('should attach shadow DOM when isolatedStyles is true', () => {
    expect(baseComponent.shadowRoot).not.toBeNull();
  });

  test.skip('should add event listeners to elements', () => {
    const mockHandler = jest.fn();
    const div = baseComponent.shadowRoot.querySelector('div');
    baseComponent.addEventListeners([
      { selector: 'div', event: 'click', handler: mockHandler }
    ]);

    div.click();
    expect(mockHandler).toHaveBeenCalled();
  });

  test('should dispatch events correctly', () => {
    const mockHandler = jest.fn();
    baseComponent.addEventListener('custom-event', mockHandler);

    baseComponent.dispatchComponentEvent(null, 'custom-event', { detail: 'test' });

    expect(mockHandler).toHaveBeenCalled();
    expect(mockHandler.mock.calls[0][0].detail.detail).toBe('test');
  });
});

describe('BaseComponent not isolatedStyles', () => {
  let baseComponent;

  beforeEach(() => {
    const template = '<div>Test</div>';
    const styles = 'div { color: red; }';
    baseComponent = new BaseComponent(template, styles, false);
    document.body.appendChild(baseComponent);
  });

  afterEach(() => {
    document.body.removeChild(baseComponent);
  });

  test('should not attach shadow DOM when isolatedStyles is false', () => {
    expect(baseComponent.shadowRoot).toBeNull();
  });

  test('should add event listeners to elements', () => {
    const mockHandler = jest.fn();
    const div = baseComponent.querySelector('div');
    baseComponent.addEventListeners([
      { selector: 'div', event: 'click', handler: mockHandler }
    ]);

    div.click();
    expect(mockHandler).toHaveBeenCalled();
  });
});