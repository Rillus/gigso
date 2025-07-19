# GigsoMenu

**File:** `components/gigso-menu/gigso-menu.js`  
**Purpose:** Toggle interface for showing/hiding components.

## Overview
The GigsoMenu component provides toggle buttons that allow users to show or hide specific components in the interface. It manages component visibility and provides visual feedback for component states.

## Inputs

### Static Configuration
- **Component targets**: Pre-defined list of components to toggle
- **No external inputs**: Component is self-contained

### Component Targets
```javascript
const buttonList = [
  {
    target: "current-chord-display",
    name: "Current Chord Display"
  },
  {
    target: "gigso-keyboard",
    name: "Keyboard"
  },
  {
    target: "add-chord-form",
    name: "Add Chord"
  }
];
```

## Outputs

### Visual Changes
- **Component visibility**: Shows/hides target components
- **Button states**: Updates button appearance based on component state
- **No events dispatched**: Direct DOM manipulation only

### Button States
- **isOn**: Button shows active state when component is visible
- **isOff**: Button shows inactive state when component is hidden

## Expected Behaviour

### Visual Display
- Displays horizontal row of toggle buttons
- Each button shows "Toggle [Component Name]"
- Buttons have visual states for on/off
- Responsive layout with consistent spacing

### Toggle Functionality
- **Click to toggle**: Clicking button shows/hides target component
- **Visual feedback**: Button appearance changes with component state
- **State persistence**: Component visibility persists until toggled again
- **Direct manipulation**: Uses `element.style.display` for visibility

### Component Management
- **Target selection**: Uses CSS selectors to find target components
- **Display toggle**: Switches between 'block' and 'none' display values
- **State tracking**: Maintains button state based on component visibility
- **Error handling**: Graceful handling of missing components

## Key Methods

### `connectedCallback()`
Initialises the menu:
- Creates toggle buttons for each target component
- Adds click event listeners
- Sets initial button states
- Appends buttons to menu container

### Toggle Handler
Handles button clicks:
- Finds target component by selector
- Toggles component visibility
- Updates button state classes
- Provides visual feedback

## Integration Patterns

### With Target Components
```javascript
// Direct DOM manipulation
const element = document.querySelector(button.target);
if (element) {
  if (element.style.display === 'none') {
    element.style.display = 'block';
    newButton.classList.remove('isOff');
    newButton.classList.add('isOn');
  } else {
    element.style.display = 'none';
    newButton.classList.remove('isOn');
    newButton.classList.add('isOff');
  }
}
```

### Component Visibility
- **Current Chord Display**: Shows/hides chord name display
- **Keyboard**: Shows/hides piano keyboard interface
- **Add Chord Form**: Shows/hides custom chord creation form

## Styling

### CSS Classes
- `.menu`: Main menu container
- `button`: Toggle button styling
- `.isOn`: Active button state
- `.isOff`: Inactive button state

### Visual Design
- Horizontal flex layout
- Consistent button styling
- Clear visual distinction between states
- Responsive design

## Testing Requirements

### Core Functionality
- All toggle buttons render correctly
- Click events toggle component visibility
- Button states update properly
- Target components respond to visibility changes

### Toggle Behaviour
```javascript
test('should toggle component visibility when clicked', () => {
  const menu = document.createElement('gigso-menu');
  document.body.appendChild(menu);
  
  // Create target component
  const targetComponent = document.createElement('div');
  targetComponent.id = 'current-chord-display';
  document.body.appendChild(targetComponent);
  
  // Click toggle button
  const toggleButton = menu.shadowRoot.querySelector('button');
  toggleButton.click();
  
  // Check component is hidden
  expect(targetComponent.style.display).toBe('none');
  
  // Click again to show
  toggleButton.click();
  expect(targetComponent.style.display).toBe('block');
});
```

### Button State Management
```javascript
test('should update button state when toggling', () => {
  const menu = document.createElement('gigso-menu');
  document.body.appendChild(menu);
  
  const toggleButton = menu.shadowRoot.querySelector('button');
  
  // Initial state should be on
  expect(toggleButton.classList.contains('isOn')).toBe(true);
  
  // Click to toggle off
  toggleButton.click();
  expect(toggleButton.classList.contains('isOff')).toBe(true);
  expect(toggleButton.classList.contains('isOn')).toBe(false);
});
```

### Visual Tests
- Button layout and spacing
- State visual feedback
- Responsive design
- Typography consistency

## Performance Considerations

### DOM Manipulation
- Direct style manipulation (efficient)
- Minimal DOM queries
- Simple class changes
- Lightweight event handling

### State Management
- Simple visibility tracking
- No complex state management
- Efficient button updates
- Minimal memory usage

## Future Enhancements

### Planned Features
- **Component groups**: Toggle multiple components at once
- **Layout presets**: Pre-defined component arrangements
- **Persistent settings**: Remember user preferences
- **Keyboard shortcuts**: Quick toggle shortcuts

### UI Improvements
- **Better animations**: Smooth show/hide transitions
- **Component previews**: Show component thumbnails
- **Drag and drop**: Reorder components
- **Accessibility**: Screen reader support
- **Mobile optimisation**: Touch-friendly interface

## Related Components
- **CurrentChord**: Can be toggled by menu
- **GigsoKeyboard**: Can be toggled by menu
- **AddChord**: Can be toggled by menu 