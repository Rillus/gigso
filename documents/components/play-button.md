# PlayButton

**File:** `components/play-button/play-button.js`  
**Purpose:** Initiates playback of the current song.

## Overview
The PlayButton component provides a play control that initiates playback of the current song. It displays a play triangle symbol and manages its visual state based on playback status.

## Inputs

### Events Received
| Event | Data | Description |
|-------|------|-------------|
| `activate` | - | Activates the button (adds 'active' class) |
| `deactivate` | - | Deactivates the button (removes 'active' class) |

### User Interactions
- **Click**: User clicks the play button to start playback

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `play-clicked` | - | Dispatched when button is clicked |

### Visual States
- **Active**: Button shows active state (visual feedback)
- **Inactive**: Button shows normal state
- **Play symbol**: Triangle symbol (▶) for play action

## Expected Behaviour

### Visual Display
- **Play symbol**: Displays triangle symbol (▶) for play action
- **Button styling**: Consistent with other transport buttons
- **State changes**: Visual feedback for active/inactive states
- **Responsive**: Works with different screen sizes

### Click Handling
- **Event dispatch**: Dispatches `play-clicked` event on click
- **Bubbling**: Event bubbles up to document level
- **Composed**: Event crosses Shadow DOM boundaries
- **Immediate response**: No delay in event dispatching

### State Management
- **Activate**: Adds 'active' class when activated
- **Deactivate**: Removes 'active' class when deactivated
- **Visual feedback**: Clear indication of current state
- **State persistence**: Maintains state until changed

## Key Methods

### `handleClick()`
Handles button click:
- Dispatches `play-clicked` event
- Event bubbles and is composed for cross-component communication

### `activate()`
Activates the button:
- Adds 'active' class to button element
- Provides visual feedback for active state

### `deactivate()`
Deactivates the button:
- Removes 'active' class from button element
- Returns to normal visual state

## Integration Patterns

### With Main App
```javascript
// Main app listens for play-clicked event
document.body.addEventListener('play-clicked', async () => {
  await Tone.start();
  playSong();
  dispatchComponentEvent('piano-roll', 'play');
});
```

### With Transport Controls
```javascript
// TransportControls manages button state
playButton.addEventListener('activate', () => playButton.activate());
playButton.addEventListener('deactivate', () => playButton.deactivate());
```

### Event Flow
1. User clicks play button
2. PlayButton dispatches `play-clicked` event
3. Main app receives event and starts playback
4. Main app activates play button and deactivates stop button
5. PianoRoll receives play event and starts timeline

## Styling

### CSS Classes
- `.transport-button`: Base button styling
- `.active`: Active state styling

### Visual Design
- **Play symbol**: Unicode triangle (▶)
- **Button styling**: Consistent with transport controls
- **Active state**: Visual indication when playback is active
- **Hover effects**: Interactive feedback

## Testing Requirements

### Core Functionality
- Button renders with play symbol
- Click dispatches correct event
- State changes work properly
- Event bubbling functions correctly

### Event Handling
```javascript
test('should dispatch play-clicked event when clicked', () => {
  const playButton = document.createElement('play-button');
  const mockHandler = jest.fn();
  
  document.body.addEventListener('play-clicked', mockHandler);
  
  // Click the button
  const button = playButton.querySelector('#play-button');
  button.click();
  
  expect(mockHandler).toHaveBeenCalled();
});
```

### State Management
```javascript
test('should activate and deactivate correctly', () => {
  const playButton = document.createElement('play-button');
  document.body.appendChild(playButton);
  
  const button = playButton.querySelector('#play-button');
  
  // Test activate
  playButton.dispatchEvent(new CustomEvent('activate'));
  expect(button.classList.contains('active')).toBe(true);
  
  // Test deactivate
  playButton.dispatchEvent(new CustomEvent('deactivate'));
  expect(button.classList.contains('active')).toBe(false);
});
```

### Visual Tests
- Play symbol displays correctly
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
- **Pause functionality**: Toggle between play/pause
- **Loading state**: Visual feedback during initialisation
- **Keyboard shortcuts**: Spacebar integration
- **Touch support**: Mobile-friendly interaction

### UI Improvements
- **Better animations**: Smooth state transitions
- **Accessibility**: Screen reader support
- **Theming**: Customisable button styles
- **Visual feedback**: More detailed state indicators

## Related Components
- **StopButton**: Complementary stop functionality
- **TransportControls**: Container for transport buttons
- **PianoRoll**: Receives play events
- **Actions**: Handles playback logic 