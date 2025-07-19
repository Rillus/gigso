# AddChord

**File:** `components/add-chord/add-chord.js`  
**Purpose:** Form interface for creating custom chords.

## Overview
The AddChord component provides a form interface where users can create custom chords by specifying the chord name, notes, duration, and delay. It extends BaseComponent and provides validation before dispatching chord data.

## Inputs

### Form Fields
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Chord Name | text | empty | Name of the chord (e.g., "C Major") |
| Notes | text | empty | Comma-separated note names (e.g., "C4,E4,G4") |
| Duration | number | 1 | Duration in beats (minimum 0.1) |
| Delay | number | 0 | Delay before play in beats (minimum 0) |

### User Interactions
- **Form submission**: Click "Add Chord" button
- **Input validation**: Real-time validation of form fields
- **Form reset**: Automatic clearing after successful submission

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `add-chord` | `{chord}` | Dispatched when form is submitted with valid data |

### Chord Object Structure
```javascript
{
  name: "C Major",        // Chord name from form
  notes: ["C4", "E4", "G4"], // Array of note names
  duration: 1,            // Duration from form
  delay: 0               // Delay from form
}
```

## Expected Behaviour

### Form Display
- Displays form with four input fields
- Clear labels and placeholders for each field
- Responsive layout with consistent styling
- Form container with border and background

### Input Validation
- **Chord Name**: Must not be empty
- **Notes**: Must contain at least one note
- **Duration**: Must be greater than 0
- **Delay**: Must be 0 or greater
- Shows alert for invalid input

### Data Processing
- Converts comma-separated notes string to array
- Trims whitespace from all inputs
- Validates numeric inputs (duration, delay)
- Creates complete chord object with all properties

### Form Management
- Clears all fields after successful submission
- Resets numeric fields to default values
- Maintains form state during validation
- Provides user feedback for errors

## Key Methods

### `addChord()`
Handles form submission:
- Validates all form fields
- Creates chord object from form data
- Dispatches `add-chord` event
- Clears form on success

### `clearForm()`
Resets form to initial state:
- Clears text inputs
- Resets numeric inputs to defaults
- Prepares form for next entry

## Integration Patterns

### With PianoRoll
```javascript
// AddChord dispatches add-chord event
document.body.addEventListener('add-chord', (event) => {
  const chord = event.detail;
  // PianoRoll receives and adds the chord
  dispatchComponentEvent('piano-roll', 'add-chord', chord);
});
```

### Event Flow
1. User fills out form and clicks "Add Chord"
2. AddChord validates form data
3. If valid, dispatches `add-chord` event with chord object
4. Main app receives event and forwards to PianoRoll
5. PianoRoll adds chord to timeline
6. Form is cleared for next entry

## Styling

### CSS Classes
- `.form-container`: Main form wrapper
- `label`: Form field labels
- `input`: Form input fields
- `button`: Submit button

### Visual Design
- Light grey background (`#f9f9f9`)
- Border and padding for form container
- Consistent spacing between form elements
- Responsive input sizing

## Testing Requirements

### Form Functionality
- All form fields render correctly
- Input validation works properly
- Form submission creates correct chord object
- Form clearing works after submission

### Validation Tests
```javascript
test('should validate required fields', () => {
  const addChord = document.createElement('add-chord');
  document.body.appendChild(addChord);
  
  // Try to submit empty form
  const submitButton = addChord.shadowRoot.querySelector('#add-chord-button');
  submitButton.click();
  
  // Should show alert for invalid input
  expect(window.alert).toHaveBeenCalledWith('Please fill in all fields correctly.');
});
```

### Event Handling
```javascript
test('should dispatch add-chord event with valid data', () => {
  const addChord = document.createElement('add-chord');
  const mockHandler = jest.fn();
  
  document.body.addEventListener('add-chord', mockHandler);
  
  // Fill form with valid data
  const nameInput = addChord.shadowRoot.querySelector('#chord-name');
  const notesInput = addChord.shadowRoot.querySelector('#chord-notes');
  
  nameInput.value = 'C Major';
  notesInput.value = 'C4,E4,G4';
  
  // Submit form
  const submitButton = addChord.shadowRoot.querySelector('#add-chord-button');
  submitButton.click();
  
  expect(mockHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      detail: expect.objectContaining({
        name: 'C Major',
        notes: ['C4', 'E4', 'G4'],
        duration: 1,
        delay: 0
      })
    })
  );
});
```

### Visual Tests
- Form layout and styling
- Input field appearance
- Button styling and interaction
- Responsive design

## Performance Considerations

### Form Processing
- Lightweight validation logic
- Efficient string-to-array conversion
- Minimal DOM manipulation
- Simple event dispatching

### User Experience
- Immediate validation feedback
- Quick form reset after submission
- Responsive input handling
- Clear error messaging

## Future Enhancements

### Planned Features
- **Note picker**: Visual note selection interface
- **Chord templates**: Pre-defined chord patterns
- **Auto-complete**: Suggest chord names
- **Validation feedback**: Inline error messages
- **Form persistence**: Save draft chords

### UI Improvements
- **Real-time validation**: Validate as user types
- **Better error messages**: More specific validation feedback
- **Keyboard shortcuts**: Quick form submission
- **Accessibility**: Screen reader support
- **Mobile optimisation**: Touch-friendly interface

## Related Components
- **PianoRoll**: Receives chords from form
- **ChordPalette**: Alternative way to add pre-defined chords
- **ChordDiagram**: Could show preview of entered chord 