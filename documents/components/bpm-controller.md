# BPM Controller Component Specification

## Overview

The BPM Controller component provides tempo control for the Gigso application, allowing users to adjust the beats per minute (BPM) of their musical compositions.

## Purpose

- Display current BPM value
- Allow increment/decrement via plus/minus buttons
- Support direct BPM input via text field
- Emit events when BPM changes
- Integrate with Tone.js Transport for tempo control

## Component Details

### File Location
- **Component**: `components/bpm-controller/bpm-controller.js`
- **Tests**: `components/bpm-controller/__tests__/bpm-controller.test.js`
- **Demo**: `bpm-controller-demo.html`

### Component Class
```javascript
export default class BpmController extends HTMLElement
```

## Inputs

### Attributes
- `initial-bpm` (number, optional): Initial BPM value (default: 120)
- `min-bpm` (number, optional): Minimum allowed BPM (default: 60)
- `max-bpm` (number, optional): Maximum allowed BPM (default: 200)
- `step-size` (number, optional): BPM increment/decrement step (default: 5)

### Events Received
- `set-bpm`: Sets the BPM to a specific value
- `reset-bpm`: Resets BPM to default value (120)

### State Integration
- Reads from global state: `bpm()` getter
- Updates global state: `setBpm()` setter

## Outputs

### Events Dispatched
- `bpm-changed`: Dispatched when BPM value changes
  - **Event Detail**: `{ bpm: number, previousBpm: number }`

### Visual Elements
- BPM display text field
- Plus (+) button for increment
- Minus (-) button for decrement
- Input validation and error feedback

## Expected Behaviour

### Display
- Shows current BPM value in a text input field
- BPM value is always displayed as a number
- Input field is read-only by default, becomes editable on click

### Plus Button
- Increases BPM by configured step size
- Respects maximum BPM limit
- Dispatches `bpm-changed` event on successful change
- Provides visual feedback on click

### Minus Button
- Decreases BPM by configured step size
- Respects minimum BPM limit
- Dispatches `bpm-changed` event on successful change
- Provides visual feedback on click

### Text Input
- Click to edit mode: input field becomes editable
- Direct BPM entry: type desired BPM value
- Validation: ensures BPM is within min/max bounds
- Enter key or blur: commits changes and exits edit mode
- Escape key: cancels changes and exits edit mode
- Dispatches `bpm-changed` event on successful change

### Integration
- Updates Tone.js Transport.bpm.value when BPM changes
- Maintains sync with global application state
- Provides real-time tempo updates for playback

## Data Structures

### BPM Change Event
```javascript
{
  bpm: 120,           // New BPM value
  previousBpm: 115    // Previous BPM value
}
```

### Component Configuration
```javascript
{
  initialBpm: 120,    // Default BPM
  minBpm: 60,         // Minimum allowed BPM
  maxBpm: 200,        // Maximum allowed BPM
  stepSize: 5         // Increment/decrement step
}
```

## Styling

### Visual Design
- Clean, minimalist interface matching Gigso design system
- Consistent with transport control buttons
- Clear visual hierarchy with BPM display as primary element
- Responsive design for different screen sizes

### Interactive States
- **Default**: Standard button and input styling
- **Hover**: Subtle highlight effects
- **Active**: Pressed state for buttons
- **Focus**: Clear focus indicators for accessibility
- **Edit Mode**: Input field styling changes when editable

### Typography
- BPM display: Larger, bold font for visibility
- Button labels: Clear, readable symbols
- Error messages: Distinct styling for validation feedback

## Keyboard Support

### Keyboard Shortcuts
- **Tab**: Navigate between plus button, input field, and minus button
- **Enter**: Commit input field changes
- **Escape**: Cancel input field changes
- **Arrow Up**: Increment BPM (when input is focused)
- **Arrow Down**: Decrement BPM (when input is focused)

### Accessibility
- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management between interactive elements
- Clear visual feedback for all interactions

## Error Handling

### Input Validation
- BPM must be a positive number
- BPM must be within min/max bounds
- Invalid input reverts to previous valid value
- Clear error messages for invalid entries

### Edge Cases
- Handles non-numeric input gracefully
- Prevents BPM changes during playback conflicts
- Maintains state consistency across component updates

## Performance Considerations

### Efficiency
- Minimal DOM manipulation during updates
- Efficient event handling with proper cleanup
- Debounced input validation to prevent excessive updates

### Audio Integration
- Smooth tempo transitions in Tone.js
- Prevents audio glitches during BPM changes
- Maintains timing accuracy for playback

## Integration Patterns

### With Transport Controls
- Coordinates with play/pause/stop functionality
- Maintains tempo consistency during playback
- Updates in real-time with transport state changes

### With Piano Roll
- Affects timeline playback speed
- Updates visual playhead movement
- Synchronises with chord timing

### With State Management
- Integrates with global BPM state
- Persists BPM across component lifecycle
- Maintains consistency with saved songs

## Testing Requirements

### Unit Tests
- Component initialisation with default values
- Plus/minus button functionality
- Text input validation and editing
- Event dispatching and handling
- State integration and updates
- Error handling and edge cases

### Integration Tests
- Interaction with Tone.js Transport
- Coordination with other transport controls
- State management integration
- Event communication with other components

### Accessibility Tests
- Keyboard navigation functionality
- Screen reader compatibility
- Focus management
- ARIA label accuracy

## Future Enhancements

### Planned Features
- Tap tempo functionality (tap to set BPM)
- BPM presets for common tempos
- Visual metronome integration
- BPM automation for tempo changes during playback

### Advanced Features
- Swing/shuffle feel adjustments
- Tempo curve editing
- BPM sync with external MIDI clock
- Tempo mapping for different song sections

## Usage Examples

### Basic Implementation
```html
<bpm-controller></bpm-controller>
```

### With Custom Configuration
```html
<bpm-controller 
  initial-bpm="140" 
  min-bpm="80" 
  max-bpm="180" 
  step-size="10">
</bpm-controller>
```

### JavaScript Integration
```javascript
// Listen for BPM changes
document.addEventListener('bpm-changed', (event) => {
  console.log(`BPM changed to ${event.detail.bpm}`);
});

// Programmatically set BPM
const bpmController = document.querySelector('bpm-controller');
bpmController.dispatchEvent(new CustomEvent('set-bpm', { 
  detail: { bpm: 150 } 
}));
```

## Related Components

- **TransportControls**: Container for playback controls
- **PianoRoll**: Timeline affected by BPM changes
- **PlayButton**: Initiates playback at current BPM
- **State Management**: Global BPM state coordination

---

**Last Updated**: [Current Date]  
**Version**: 1.0.0  
**Component**: BPM Controller
