# BaseComponent

**File:** `components/base-component.js`  
**Purpose:** Abstract base class for all Web Components providing common functionality.

## Overview
BaseComponent extends HTMLElement and provides a consistent foundation for all components in the Gigso application, including Shadow DOM encapsulation and event handling utilities.

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `template` | string | required | HTML template for the component |
| `styles` | string | required | CSS styles for the component |
| `isolatedStyles` | boolean | `true` | Whether to use Shadow DOM |

## Methods

### `addEventListeners(eventListeners)`
Adds event listeners to component elements.

**Parameters:**
- `eventListeners` (Array): Array of event listener objects

**Event Listener Object Structure:**
```javascript
{
  selector: '.button',     // CSS selector or null for component-level
  event: 'click',          // Event type
  handler: this.handleClick.bind(this)  // Event handler function
}
```

### `dispatchComponentEvent(selector, eventName, eventDetails)`
Dispatches custom events to other components.

**Parameters:**
- `selector` (string|null): CSS selector for target element, or null for component-level
- `eventName` (string): Name of the custom event
- `eventDetails` (any): Data to pass with the event

## Expected Behaviour

### Shadow DOM Management
- Creates isolated Shadow DOM when `isolatedStyles` is true
- Falls back to regular DOM when `isolatedStyles` is false
- Injects styles and template into appropriate DOM context

### Event Handling
- Supports both component-level and element-specific event listeners
- Automatically handles Shadow DOM vs regular DOM element selection
- Provides consistent event binding across all components

### Cross-Component Communication
- Enables components to communicate via custom events
- Handles element selection for both Shadow DOM and regular DOM
- Provides warning when target elements are not found

## Usage Example

```javascript
import BaseComponent from '../base-component.js';

export default class MyComponent extends BaseComponent {
  constructor() {
    const template = `<div class="my-component">...</div>`;
    const styles = `.my-component { /* styles */ }`;
    
    super(template, styles);
    
    this.addEventListeners([
      { selector: '.button', event: 'click', handler: this.handleClick.bind(this) },
      { selector: null, event: 'custom-event', handler: this.handleCustomEvent.bind(this) }
    ]);
  }
  
  handleClick(event) {
    this.dispatchComponentEvent('other-component', 'my-event', { data: 'value' });
  }
}
```

## Integration Patterns

### Event Communication
```javascript
// Dispatch to specific component
this.dispatchComponentEvent('piano-roll', 'add-chord', chordData);

// Dispatch component-level event
this.dispatchComponentEvent(null, 'ready', { component: 'my-component' });
```

### Event Listening
```javascript
// Listen for component-level events
this.addEventListener('custom-event', (event) => {
  const data = event.detail;
  // Handle event
});

// Listen for element-specific events
this.shadowRoot.querySelector('.button').addEventListener('click', handler);
```

## Testing Considerations

### Shadow DOM Testing
- Test both isolated and non-isolated styles modes
- Verify event listeners work in Shadow DOM context
- Test cross-component event communication

### Event Handling Tests
```javascript
test('should add event listeners correctly', () => {
  const component = new MyComponent();
  const button = component.shadowRoot.querySelector('.button');
  
  // Simulate click
  button.click();
  
  // Verify event was handled
  expect(mockHandler).toHaveBeenCalled();
});
```

## Performance Notes

- Shadow DOM provides style isolation but adds complexity
- Event delegation can improve performance for many elements
- Custom events bubble through Shadow DOM boundaries when `composed: true`

## Related Components
- All components extend BaseComponent
- See individual component specifications for specific implementations 