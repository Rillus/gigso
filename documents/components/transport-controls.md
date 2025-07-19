# TransportControls

**File:** `components/transport-controls/transport-controls.js`  
**Purpose:** Container component for playback control buttons.

## Overview
The TransportControls component serves as a container that groups together the play, stop, and loop buttons into a single, cohesive interface. It provides consistent styling and layout for the transport controls.

## Inputs

### Component Dependencies
- **PlayButton**: Playback initiation button
- **StopButton**: Playback stop button  
- **LoopButton**: Loop mode toggle button

### No Direct Events
- This component doesn't receive events directly
- Individual buttons handle their own event processing

## Outputs

### Rendered Components
- **PlayButton**: Rendered with play triangle symbol (▶)
- **StopButton**: Rendered with stop square symbol (■)
- **LoopButton**: Rendered with loop symbol (↻)

### Visual Layout
- Horizontal flex layout with connected buttons
- Consistent button styling and spacing
- Rounded corners on outer edges only

## Expected Behaviour

### Visual Display
- Displays three transport buttons in a horizontal row
- Buttons are visually connected (no gaps between them)
- First button has rounded left corners, last button has rounded right corners
- Consistent button sizing and spacing

### Layout Management
- Centers the transport controls in their container
- Maintains consistent spacing between buttons
- Responsive design that works on different screen sizes

### Component Integration
- Instantiates and manages child button components
- Provides consistent styling context
- Handles component lifecycle and cleanup

## Key Methods

### Constructor
Creates the container and initialises child components.

### `connectedCallback()`
Sets up the component when added to DOM:
- Creates container element
- Instantiates child button components
- Applies styling and layout

## Integration Patterns

### With Child Components
```javascript
// Creates and manages child components
this.playButton = new PlayButton();
this.stopButton = new StopButton();
this.loopButton = new LoopButton();

// Adds them to the container
this.querySelector('.transport-controls').append(
  this.playButton, 
  this.stopButton, 
  this.loopButton
);
```

### Event Flow
1. User clicks transport button
2. Individual button dispatches event (e.g., `play-clicked`)
3. Main app receives event and handles playback logic
4. Main app updates button states via activate/deactivate events

## Styling

### CSS Classes
- `.transport-controls`: Main container
- Button styling inherited from child components

### Visual Design
- Flex layout with centered alignment
- Connected button appearance
- Consistent margins and spacing
- Responsive design

### Button Connection
```css
.transport-controls > *:first-child button {
    border-radius: 5px 0 0 5px;  /* Rounded left corners */
}

.transport-controls > *:last-child button {
    border-radius: 0 5px 5px 0;  /* Rounded right corners */
}
```

## Testing Requirements

### Component Integration
- All child components render correctly
- Proper layout and spacing
- Button connection styling
- Responsive design

### Child Component Management
```javascript
test('should render all transport buttons', () => {
  const transport = document.createElement('transport-controls');
  document.body.appendChild(transport);
  
  expect(transport.querySelector('play-button')).toBeTruthy();
  expect(transport.querySelector('stop-button')).toBeTruthy();
  expect(transport.querySelector('loop-button')).toBeTruthy();
});
```

### Visual Tests
- Button alignment and spacing
- Connected button appearance
- Responsive layout
- Consistent styling

## Performance Considerations

### Rendering
- Efficient component instantiation
- Minimal DOM manipulation
- Lightweight container component

### Memory Management
- Proper cleanup of child components
- No event listener overhead
- Simple container logic

## Future Enhancements

### Planned Features
- **Additional controls**: Pause, record, tempo controls
- **Customisable layout**: User-defined button arrangements
- **Keyboard shortcuts**: Visual indicators for shortcuts
- **Touch gestures**: Swipe controls for mobile

### UI Improvements
- **Visual feedback**: Better state indicators
- **Accessibility**: Screen reader support
- **Theming**: Customisable button styles
- **Compact mode**: Collapsible transport controls

## Related Components
- **PlayButton**: Handles play functionality
- **StopButton**: Handles stop functionality
- **LoopButton**: Handles loop functionality
- **PianoRoll**: Receives playback control events 