# HandPan Wrapper Component

## Purpose
Complete drop-in wrapper component that combines HandPan with audio management, key selection, size controls, and event logging. Provides a self-contained solution for integrating HandPan instruments into any web application.

## Inputs

### Attributes
- `key` (string): Initial musical key of the hand pan
  - **Values**: "D", "F", "G"
  - **Default**: "D"
- `scale` (string): Initial scale type
  - **Values**: "minor", "major"
  - **Default**: "minor"
- `size` (string): Initial visual size of the hand pan
  - **Values**: "small", "medium", "large"
  - **Default**: "medium"
- `audio-enabled` (boolean): Whether audio should be enabled by default
  - **Values**: "true", "false"
  - **Default**: "false"

### User Interactions
- **Audio Toggle Button**: Click to enable/disable audio context
- **Key Selection**: Dropdown to change musical key (D, F, G)
- **Scale Selection**: Dropdown to change scale type (minor, major)
- **Size Buttons**: Click to change hand pan size (small, medium, large)
- **Clear Log Button**: Click to clear the event log

### Events Received
- `note-played`: From HandPan component when notes are played
- `key-changed`: From HandPan component when key/scale changes

## Outputs

### Events Dispatched
- `audio-enabled`: When audio context is successfully started
  ```javascript
  {
    detail: { enabled: true }
  }
  ```
- `audio-disabled`: When audio is disabled
  ```javascript
  {
    detail: { enabled: false }
  }
  ```

### UI Elements
- **Audio Control Section**: Toggle button and status indicator
- **Key Selection Section**: Dropdown controls for key and scale
- **Size Selection Section**: Button group for size selection
- **HandPan Container**: The actual HandPan component
- **Event Log Section**: Real-time event logging with timestamps

## Expected Behaviour

### Audio Management
- **Initial State**: Audio disabled by default (browser requirement)
- **User Activation**: One-click audio context initialization from user interaction
- **Dynamic Loading**: Tone.js loaded only when needed
- **Error Handling**: Graceful handling of audio initialization failures
- **Visual Feedback**: Clear indication of audio status (enabled/disabled)

### Key and Scale Selection
- **Dropdown Controls**: Intuitive selection of key (D, F, G) and scale (minor, major)
- **Real-time Updates**: HandPan immediately reflects key/scale changes
- **Visual Feedback**: Selected options clearly highlighted
- **Event Logging**: All key changes logged with timestamps

### Size Controls
- **Button Group**: Three buttons for small, medium, large sizes
- **Active State**: Current size clearly indicated
- **Immediate Updates**: HandPan size changes instantly
- **Responsive Design**: Works on all screen sizes

### Event Logging
- **Real-time Capture**: All HandPan events automatically logged
- **Timestamped Entries**: Each log entry includes time
- **Auto-scroll**: Log automatically scrolls to show latest entries
- **Clear Function**: Button to clear all log entries
- **Persistent Display**: Log visible throughout component lifecycle

### Responsive Design
- **Mobile Optimized**: Controls stack vertically on small screens
- **Touch Friendly**: Large touch targets for mobile devices
- **Flexible Layout**: Adapts to different screen sizes
- **Consistent Styling**: Maintains visual hierarchy across devices

## Integration Patterns

### With HandPan Component
- **Direct Integration**: Wraps HandPan component internally
- **Event Forwarding**: Captures and logs all HandPan events
- **Attribute Synchronization**: Keeps HandPan attributes in sync with controls
- **Method Access**: Provides access to underlying HandPan via `getHandPan()`

### With External Applications
- **Drop-in Usage**: Single HTML tag provides complete functionality
- **JavaScript API**: Public methods for programmatic control
- **Event Listening**: External apps can listen for audio state changes
- **Customization**: Attributes allow initial configuration

### With Tone.js
- **Dynamic Loading**: Loads Tone.js only when audio is enabled
- **Context Management**: Handles audio context initialization properly
- **Error Recovery**: Graceful handling of audio context issues
- **Resource Management**: Proper cleanup when audio is disabled

## Public Methods

### `enableAudio()`
Enables the audio context and starts Tone.js.
- **Returns**: Promise that resolves when audio is ready
- **Throws**: Error if audio initialization fails

### `disableAudio()`
Disables the audio context.
- **Returns**: void
- **Side Effects**: Stops all audio playback

### `setKey(key, scale)`
Changes the HandPan's key and scale.
- **Parameters**:
  - `key` (string): Musical key ("D", "F", "G")
  - `scale` (string): Scale type ("minor", "major")
- **Returns**: void
- **Side Effects**: Updates HandPan and logs the change

### `setSize(size)`
Changes the HandPan's visual size.
- **Parameters**:
  - `size` (string): Size ("small", "medium", "large")
- **Returns**: void
- **Side Effects**: Updates HandPan and UI controls

### `getHandPan()`
Returns the underlying HandPan component for advanced control.
- **Returns**: HandPan component instance
- **Usage**: For direct access to HandPan methods and properties

## Testing Requirements

### Unit Tests
- **Audio Management**: Test enable/disable audio functionality
- **Key Selection**: Test key and scale dropdown interactions
- **Size Controls**: Test size button interactions
- **Event Logging**: Test log capture and clearing
- **Public Methods**: Test all public API methods

### Integration Tests
- **HandPan Integration**: Test proper HandPan wrapping and event forwarding
- **Tone.js Integration**: Test audio context management
- **Event System**: Test custom event dispatching
- **Responsive Design**: Test layout on different screen sizes

### Visual Tests
- **Control States**: Test visual feedback for all control states
- **Animations**: Test smooth transitions and hover effects
- **Accessibility**: Test keyboard navigation and screen reader support
- **Mobile Experience**: Test touch interactions and mobile layout

## Performance Considerations

### Audio Performance
- **Lazy Loading**: Tone.js loaded only when needed
- **Context Management**: Proper audio context lifecycle management
- **Resource Cleanup**: Audio resources released when disabled
- **Error Recovery**: Graceful handling of audio failures

### UI Performance
- **Efficient Rendering**: Minimal DOM updates during state changes
- **Event Debouncing**: Prevents excessive event handling
- **Memory Management**: Proper cleanup of event listeners
- **Responsive Updates**: Smooth animations without performance impact

### Mobile Performance
- **Touch Optimization**: Efficient touch event handling
- **Battery Consideration**: Audio disabled by default to save battery
- **Network Efficiency**: Minimal external dependencies
- **Memory Usage**: Lightweight component with minimal memory footprint

## Future Enhancements

### Planned Features
- **Additional Keys**: Support for more musical keys (A, C, etc.)
- **Custom Scales**: Support for pentatonic, harmonic minor, etc.
- **Preset Management**: Save and load custom key/scale combinations
- **Advanced Audio**: Additional audio effects and processing
- **Recording**: Record and playback HandPan performances
- **Export**: Export HandPan performances as audio files

### UI Improvements
- **Theme Support**: Light/dark theme switching
- **Customization**: User-configurable control layouts
- **Accessibility**: Enhanced screen reader and keyboard support
- **Internationalization**: Multi-language support for labels

### Integration Enhancements
- **MIDI Support**: MIDI input/output capabilities
- **Web Audio API**: Direct Web Audio API integration
- **Plugin System**: Extensible architecture for custom features
- **Cloud Sync**: Save settings and performances to cloud

## Usage Examples

### Basic Usage
```html
<hand-pan-wrapper></hand-pan-wrapper>
```

### With Custom Settings
```html
<hand-pan-wrapper 
    key="F" 
    scale="major" 
    size="large" 
    audio-enabled="true">
</hand-pan-wrapper>
```

### JavaScript API Usage
```javascript
// Get wrapper instance
const wrapper = document.getElementById('myHandPan');

// Enable audio
wrapper.enableAudio();

// Change key and scale
wrapper.setKey('G', 'minor');

// Change size
wrapper.setSize('large');

// Get underlying HandPan for advanced control
const handPan = wrapper.getHandPan();

// Listen for audio events
wrapper.addEventListener('audio-enabled', (event) => {
    console.log('Audio ready:', event.detail);
});
```

### Event Handling
```javascript
// Listen for audio state changes
wrapper.addEventListener('audio-enabled', (event) => {
    console.log('Audio context started');
});

wrapper.addEventListener('audio-disabled', (event) => {
    console.log('Audio context stopped');
});

// Listen for HandPan events (logged internally)
wrapper.addEventListener('note-played', (event) => {
    console.log('Note played:', event.detail);
});
```

## Related Components
- **HandPan**: The underlying hand pan instrument component
- **BaseComponent**: Foundation class for Web Components
- **Tone.js**: Audio synthesis library for sound generation 