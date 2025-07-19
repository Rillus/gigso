# StopButton

**File:** `components/stop-button/stop-button.js`  
**Purpose:** Stops playback and resets to beginning.

## Overview
The StopButton component provides a stop control that halts playback and resets the song to the beginning. It displays a stop square symbol and manages its visual state with automatic deactivation.

## Inputs

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `activate` | - | Activates the button briefly (300ms) |
| `deactivate` | - | Deactivates the button |

### User Interactions
- **Click**: User clicks the stop button to stop playback

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `stop-clicked` | - | Dispatched when button is clicked |

### Visual States
- **Active**: Button shows active state briefly (300ms)
- **Inactive**: Button shows normal state
- **Stop symbol**: Square symbol (■) for stop action

## Expected Behaviour

### Visual Display
- **Stop symbol**: Displays square symbol (■) for stop action
- **Button styling**: Consistent with other transport buttons
- **Brief activation**: Shows active state for 300ms when activated
- **Auto-deactivation**: Automatically returns to inactive state

### Click Handling
- **Event dispatch**: Dispatches `stop-clicked` event on click
- **Bubbling**: Event bubbles up to document level
- **Composed**: Event crosses Shadow DOM boundaries
- **Immediate response**: No delay in event dispatching

### State Management
- **Activate**: Adds 'active' class and auto-deactivates after 300ms
- **Deactivate**: Removes 'active' class immediately
- **Visual feedback**: Brief indication of stop action
- **Automatic reset**: Returns to normal state automatically

## Key Methods

### `handleClick()`
Handles button click:
- Dispatches `stop-clicked` event
- Event bubbles and is composed for cross-component communication

### `activate()`
Activates the button briefly:
- Adds 'active' class to button element
- Sets timeout to auto-deactivate after 300ms
- Provides brief visual feedback

### `deactivate()`
Deactivates the button:
- Removes 'active' class from button element
- Returns to normal visual state

## Integration Patterns

### With Main App
```javascript
// Main app listens for stop-clicked event
document.body.addEventListener('stop-clicked', () => {
  stopSong();
  dispatchComponentEvent('piano-roll', 'stop');
});
```

### With Transport Controls
```javascript
// TransportControls manages button state
stopButton.addEventListener('activate', () => stopButton.activate());
stopButton.addEventListener('deactivate', () => stopButton.deactivate());
```

### Event Flow
1. User clicks stop button
2. StopButton dispatches `stop-clicked` event
3. Main app receives event and stops playback
4. Main app deactivates play button and activates stop button briefly
5. PianoRoll receives stop event and resets timeline

## Styling

### CSS Classes
- `.transport-button`: Base button styling
- `.active`: Active state styling

### Visual Design
- **Stop symbol**: Unicode square (■)
- **Button styling**: Consistent with transport controls
- **Brief active state**: Visual indication when stop is triggered
- **Hover effects**: Interactive feedback

## Testing Requirements

### Core Functionality
- Button renders with stop symbol
- Click dispatches correct event
- Brief activation works properly
- Auto-deactivation functions correctly

### Event Handling
```javascript
test('should dispatch stop-clicked event when clicked', () => {
  const stopButton = document.createElement('stop-button');
  const mockHandler = jest.fn();
  
  document.body.addEventListener('stop-clicked', mockHandler);
  
  // Click the button
  const button = stopButton.querySelector('#stop-button');
  button.click();
  
  expect(mockHandler).toHaveBeenCalled();
});
```

### State Management
```javascript
test('should auto-deactivate after 300ms', async () => {
  const stopButton = document.createElement('stop-button');
  document.body.appendChild(stopButton);
  
  const button = stopButton.querySelector('#stop-button');
  
  // Test activate
  stopButton.dispatchEvent(new CustomEvent('activate'));
  expect(button.classList.contains('active')).toBe(true);
  
  // Wait for auto-deactivation
  await new Promise(resolve => setTimeout(resolve, 350));
  expect(button.classList.contains('active')).toBe(false);
});
```

### Visual Tests
- Stop symbol displays correctly
- Button styling is consistent
- Brief active state visual feedback
- Responsive design

## Performance Considerations

### Event Handling
- Lightweight click handler
- Efficient event dispatching
- Minimal DOM manipulation
- Simple state management

### Visual Performance
- Simple CSS class changes
- Brief timeout management
- Fast state transitions
- Minimal rendering overhead

## Future Enhancements

### Planned Features
- **Configurable timing**: Adjustable activation duration
- **Loading state**: Visual feedback during stop process
- **Keyboard shortcuts**: Escape key integration
- **Touch support**: Mobile-friendly interaction

### UI Improvements
- **Better animations**: Smooth state transitions
- **Accessibility**: Screen reader support
- **Theming**: Customisable button styles
- **Visual feedback**: More detailed state indicators

## Related Components
- **PlayButton**: Complementary play functionality
- **TransportControls**: Container for transport buttons
- **PianoRoll**: Receives stop events
- **Actions**: Handles stop logic 