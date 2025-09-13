# Mixer Component Specification

## Overview
The Mixer component provides a centralised interface for controlling the volume levels of all instruments in the Gigso application. It acts as a master control panel for audio mixing, allowing users to balance the levels of different instruments during playback.

## Component Details

### Component Name
`gigso-mixer` or `mixer-component`

### File Location
`components/mixer/mixer.js`

### Extends
`BaseComponent`

## Visual Design

### Layout
- **Horizontal strip layout** with individual channel strips
- **Compact design** suitable for bottom of screen or dedicated mixer panel
- **Responsive** - adapts to available width
- **Collapsible** - can be minimised to save screen space

### Channel Strip Design
Each instrument gets its own channel strip containing:
- **Instrument label** (with icon)
- **Volume slider** (0-100%)
- **Mute button**
- **Solo button** (optional)
- **Volume level meter** (real-time VU meter)

### Visual Elements
```
┌─────────────────────────────────────────────────────────────┐
│ 🎹 Piano Roll    [===|====] 🔊 60%  [M] [S]  ████░░░░░░    │
│ 🎸 Gigso Keyboard [==|====] 🔊 45%  [M] [S]  ███░░░░░░░    │
│ 🥁 Hand Pan      [===|====] 🔊 80%  [M] [S]  ████░░░░░░    │
│ 🎵 Master        [====|===] 🔊 70%       [S]  ████░░░░░░    │
└─────────────────────────────────────────────────────────────┘
```

## Functionality

### Core Features

#### 1. Volume Control
- **Range**: 0-100% (0-1.0 internally)
- **Precision**: 1% increments
- **Real-time**: Immediate effect on audio output
- **Visual feedback**: Slider position and percentage display

#### 2. Mute Functionality
- **Individual mutes**: Each instrument can be muted independently
- **Visual state**: Muted channels show different styling
- **Quick toggle**: Click to mute/unmute

#### 3. Solo Functionality (Optional)
- **Exclusive solo**: Only one instrument plays at a time
- **Solo override**: Mutes all other instruments when one is soloed
- **Visual indication**: Soloed channel highlighted

#### 4. Master Volume
- **Global control**: Affects all instruments
- **Range**: 0-100%
- **Independent**: Works alongside individual instrument controls

#### 5. Real-time Level Meters
- **VU-style meters**: Show current audio output levels
- **Colour coding**: Green (safe), Yellow (moderate), Red (clipping)
- **Smooth animation**: Updates at 60fps

### Instrument Support

#### Supported Instruments
1. **Piano Roll** (`piano-roll`)
2. **Gigso Keyboard** (`gigso-keyboard`)
3. **Hand Pan** (`hand-pan`)
4. **Master Output** (affects all instruments)

#### Instrument Detection
- **Auto-discovery**: Automatically detects available instruments
- **Dynamic updates**: Adds/removes channels as instruments are created/destroyed
- **Fallback handling**: Graceful degradation if instruments aren't available

## Technical Implementation

### Data Structure

```javascript
const mixerState = {
  instruments: {
    'piano-roll': {
      id: 'piano-roll',
      name: 'Piano Roll',
      icon: '🎹',
      volume: 0.6,
      muted: false,
      soloed: false,
      level: 0.0 // Current output level
    },
    'gigso-keyboard': {
      id: 'gigso-keyboard',
      name: 'Gigso Keyboard',
      icon: '🎸',
      volume: 0.45,
      muted: false,
      soloed: false,
      level: 0.0
    },
    'hand-pan': {
      id: 'hand-pan',
      name: 'Hand Pan',
      icon: '🥁',
      volume: 0.8,
      muted: false,
      soloed: false,
      level: 0.0
    }
  },
  master: {
    volume: 0.7,
    level: 0.0
  }
};
```

### Event System

#### Outgoing Events (Mixer → Instruments)
```javascript
// Volume change
this.dispatchEvent(new CustomEvent('mixer-volume-change', {
  detail: {
    instrumentId: 'piano-roll',
    volume: 0.6,
    muted: false
  }
}));

// Mute toggle
this.dispatchEvent(new CustomEvent('mixer-mute-toggle', {
  detail: {
    instrumentId: 'piano-roll',
    muted: true
  }
}));

// Solo toggle
this.dispatchEvent(new CustomEvent('mixer-solo-toggle', {
  detail: {
    instrumentId: 'piano-roll',
    soloed: true
  }
}));
```

#### Incoming Events (Instruments → Mixer)
```javascript
// Instrument registered
instrument.addEventListener('instrument-registered', (event) => {
  this.addInstrument(event.detail);
});

// Level updates
instrument.addEventListener('audio-level-update', (event) => {
  this.updateLevel(event.detail.instrumentId, event.detail.level);
});
```

### Audio Integration

#### Volume Control
- **Tone.js integration**: Uses `Tone.Volume` nodes
- **Master bus**: All instruments route through master volume
- **Individual buses**: Each instrument has its own volume control
- **Real-time updates**: Volume changes take effect immediately

#### Level Metering
- **Analyser nodes**: Use `Tone.Analyser` for level detection
- **Frequency analysis**: Monitor output levels
- **Smooth updates**: Throttled to 60fps for performance

## API Interface

### Methods

```javascript
// Add instrument to mixer
addInstrument(instrumentConfig)

// Remove instrument from mixer
removeInstrument(instrumentId)

// Set volume for specific instrument
setVolume(instrumentId, volume)

// Set master volume
setMasterVolume(volume)

// Toggle mute for instrument
toggleMute(instrumentId)

// Toggle solo for instrument
toggleSolo(instrumentId)

// Get current mixer state
getMixerState()

// Reset all volumes to default
resetVolumes()
```

### Properties

```javascript
// Current mixer state
this.mixerState

// Available instruments
this.instruments

// Master volume level
this.masterVolume

// Update frequency for level meters
this.levelUpdateInterval
```

## User Experience

### Interaction Patterns

#### Volume Control
- **Click and drag**: Primary interaction method
- **Click to set**: Click anywhere on slider to jump to that value
- **Keyboard support**: Arrow keys for fine adjustment
- **Touch support**: Optimised for mobile devices

#### Visual Feedback
- **Immediate response**: Slider moves as user drags
- **Percentage display**: Shows exact value
- **Level meters**: Real-time audio feedback
- **State indicators**: Clear visual states for mute/solo

#### Accessibility
- **ARIA labels**: Screen reader support
- **Keyboard navigation**: Full keyboard control
- **High contrast**: Clear visual indicators
- **Focus management**: Logical tab order

### Responsive Design

#### Desktop (≥1024px)
- **Full mixer**: All controls visible
- **Horizontal layout**: Side-by-side channel strips
- **Detailed meters**: Full VU meter display

#### Tablet (768px - 1023px)
- **Compact layout**: Reduced spacing
- **Simplified meters**: Basic level indicators
- **Touch optimised**: Larger touch targets

#### Mobile (<768px)
- **Vertical layout**: Stacked channel strips
- **Minimal interface**: Essential controls only
- **Collapsible**: Can be hidden when not needed

## Integration Points

### State Management
- **Centralised state**: Integrates with main application state
- **Persistence**: Remembers volume settings between sessions
- **Synchronisation**: Stays in sync with instrument states

### Component Communication
- **Event-driven**: Uses CustomEvent system
- **Loose coupling**: Instruments don't need direct mixer references
- **Fallback handling**: Works even if some instruments aren't available

### Audio Engine Integration
- **Tone.js compatibility**: Works with existing Tone.js setup
- **Performance optimised**: Minimal impact on audio performance
- **Real-time updates**: Smooth, responsive controls

## Testing Requirements

### Unit Tests
- Volume control accuracy
- Mute/solo functionality
- Event dispatching
- State management

### Integration Tests
- Instrument detection
- Audio level monitoring
- Cross-component communication
- Performance under load

### User Testing
- Usability across devices
- Accessibility compliance
- Performance with multiple instruments
- Visual feedback clarity

## Future Enhancements

### Phase 2 Features
- **EQ controls**: Basic 3-band EQ per channel
- **Effects sends**: Reverb/delay sends
- **Channel grouping**: Group related instruments
- **Preset management**: Save/load mixer configurations

### Phase 3 Features
- **Advanced metering**: Peak/RMS levels, spectrum analysis
- **Automation**: Record and playback volume changes
- **External control**: MIDI controller support
- **Professional features**: Bus routing, sidechain compression

## Implementation Priority

### High Priority (Core Functionality)
1. Basic volume control
2. Mute functionality
3. Master volume
4. Instrument detection
5. Event system

### Medium Priority (Enhanced UX)
1. Real-time level meters
2. Solo functionality
3. Visual feedback improvements
4. Responsive design
5. Accessibility features

### Low Priority (Advanced Features)
1. EQ controls
2. Effects sends
3. Preset management
4. External control support

## Dependencies

### Required
- `BaseComponent` (existing)
- `Tone.js` (existing)
- CSS Grid/Flexbox for layout

### Optional
- Web Audio API for advanced metering
- Canvas API for custom VU meters
- Local Storage for preset persistence

## Performance Considerations

### Audio Performance
- **Minimal latency**: Direct audio routing
- **Efficient updates**: Throttled level meter updates
- **Memory management**: Clean up unused analysers

### UI Performance
- **Smooth animations**: 60fps target for meters
- **Efficient rendering**: Minimal DOM updates
- **Responsive interactions**: Immediate visual feedback

This specification provides a comprehensive foundation for implementing a professional-quality mixer component that will enhance the user experience of the Gigso application.
