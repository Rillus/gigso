# LoopButton

**File:** `components/loop-button/loop-button.js`  
**Purpose:** Toggles loop playback mode.

## Overview
The LoopButton component provides a loop control that toggles continuous playback mode. It displays a loop symbol and manages its visual state based on the global loop state.

## Inputs

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `activate` | - | Activates loop mode (adds 'active' class) |
| `deactivate` | - | Deactivates loop mode (removes 'active' class) |

### User Interactions
- **Click**: User clicks the loop button to toggle loop mode

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `loop-clicked` | - | Dispatched when button is clicked |

### Visual States
- **Active**: Button shows active state when loop is enabled
- **Inactive**: Button shows normal state when loop is disabled
- **Loop symbol**: Loop symbol (↻) for loop action

## Expected Behaviour

### Visual Display
- **Loop symbol**: Displays loop symbol (↻) for loop action
- **Button styling**: Consistent with other transport buttons
- **State changes**: Visual feedback for active/inactive states
- **Responsive**: Works with different screen sizes

### Click Handling
- **Event dispatch**: Dispatches `loop-clicked` event on click
- **Bubbling**: Event bubbles up to document level
- **Composed**: Event crosses Shadow DOM boundaries
- **Immediate response**: No delay in event dispatching

### State Management
- **Activate**: Adds 'active' class when loop is enabled
- **Deactivate**: Removes 'active' class when loop is disabled
- **Visual feedback**: Clear indication of current loop state
- **State persistence**: Maintains state until changed

## Key Methods

### `handleClick()`
Handles button click:
- Dispatches `loop-clicked` event
- Event bubbles and is composed for cross-component communication

### `activate()`
Activates loop mode:
- Adds 'active' class to button element
- Provides visual feedback for active state

### `deactivate()`
Deactivates loop mode:
- Removes 'active' class from button element
- Returns to normal visual state

## Integration Patterns

### With Main App
```javascript
// Main app listens for loop-clicked event
document.body.addEventListener('loop-clicked', () => {
  const newLoopActive = !loopActive();
  setLoopActive(newLoopActive);
  
  if (newLoopActive) {
    dispatchComponentEvent('loop-button', 'activate');
  } else {
    dispatchComponentEvent('loop-button', 'deactivate');
  }
});
```

### With Global State
```javascript
// Integrates with global loop state
import State from '../../state/state.js';
const { loopActive, setLoopActive } = State;
```

### Event Flow
1. User clicks loop button
2. LoopButton dispatches `loop-clicked` event
3. Main app receives event and toggles global loop state
4. Main app activates/deactivates loop button based on new state
5. PianoRoll uses loop state for playback decisions

## Styling

### CSS Classes
- `.transport-button`: Base button styling
- `.active`: Active state styling

### Visual Design
- **Loop symbol**: Unicode loop symbol (↻)
- **Button styling**: Consistent with transport controls
- **Active state**: Visual indication when loop is enabled
- **Hover effects**: Interactive feedback

## Testing Requirements

### Core Functionality
- Button renders with loop symbol
- Click dispatches correct event
- State changes work properly
- Event bubbling functions correctly

### Event Handling
```javascript
test('should dispatch loop-clicked event when clicked', () => {
  const loopButton = document.createElement('loop-button');
  const mockHandler = jest.fn();
  
  document.body.addEventListener('loop-clicked', mockHandler);
  
  // Click the button
  const button = loopButton.querySelector('#loop-button');
  button.click();
  
  expect(mockHandler).toHaveBeenCalled();
});
```

### State Management
```javascript
test('should activate and deactivate correctly', () => {
  const loopButton = document.createElement('loop-button');
  document.body.appendChild(loopButton);
  
  const button = loopButton.querySelector('#loop-button');
  
  // Test activate
  loopButton.dispatchEvent(new CustomEvent('activate'));
  expect(button.classList.contains('active')).toBe(true);
  
  // Test deactivate
  loopButton.dispatchEvent(new CustomEvent('deactivate'));
  expect(button.classList.contains('active')).toBe(false);
});
```

### Visual Tests
- Loop symbol displays correctly
- Button styling is consistent
- Active state visual feedback
- Responsive design

## Performance Considerations

### Event Handling
- Lightweight click handler
- Efficient event dispatching
- Minimal DOM manipulation
- Simple state management

### Visual Performance
- Simple CSS class changes
- No complex animations
- Fast state transitions
- Minimal rendering overhead

## Future Enhancements

### Planned Features
- **Loop region**: Define specific loop points
- **Loop count**: Set number of repetitions
- **Visual indicators**: Show loop boundaries
- **Keyboard shortcuts**: Loop toggle shortcut

### UI Improvements
- **Better animations**: Smooth state transitions
- **Accessibility**: Screen reader support
- **Theming**: Customisable button styles
- **Visual feedback**: More detailed state indicators

## Related Components
- **PlayButton**: Works with loop during playback
- **TransportControls**: Container for transport buttons
- **PianoRoll**: Uses loop state for playback decisions
- **State**: Manages global loop state 