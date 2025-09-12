# PianoRoll Component Specification

## Overview
The PianoRoll component is a visual sequencer that displays and manages chord progressions in a timeline format. It provides MIDI-like functionality for arranging, editing, and playing back chord sequences.

## Component Architecture

### Class Definition
- **Name**: `PianoRoll`
- **Extends**: `HTMLElement` (Web Component)
- **Custom Element**: `<piano-roll>`
- **Shadow DOM**: Yes (open mode)

### Dependencies
- `EventHandlers` from `../../helpers/eventHandlers.js`
- `State` from `../../state/state.js`

## Core Properties

### Configuration Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `chordWidth` | Number | 100 | Width in pixels for each chord unit |
| `tempo` | Number | 120 | Tempo in beats per minute |
| `timeSignature` | String | '4/4' | Time signature for playback |
| `instrument` | String | `State.instrument()` | Current instrument for chord diagrams |

### Scrolling Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `scrollPosition` | Number | 0 | Current manual scroll offset in pixels |
| `maxScrollLeft` | Number | -200 | Maximum left scroll boundary |
| `maxScrollRight` | Number | 200 | Maximum right scroll boundary |
| `scrollSensitivity` | Number | 0.5 | Scroll sensitivity multiplier |
| `isUserScrolling` | Boolean | false | Whether user is actively scrolling |
| `scrollMomentum` | Number | 0 | Current momentum for smooth scrolling |
| `momentumDecay` | Number | 0.95 | Momentum decay factor per frame |
| `momentumThreshold` | Number | 0.1 | Minimum momentum before stopping |

### Touch/Swipe Properties  
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `touchStartX` | Number | 0 | Initial touch X coordinate |
| `touchStartY` | Number | 0 | Initial touch Y coordinate |
| `isTouching` | Boolean | false | Whether user is currently touching |
| `touchStartTime` | Number | 0 | Touch start timestamp for momentum |
| `lastTouchX` | Number | 0 | Last recorded touch X position |

### State Properties  
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `chords` | Array | [] | Array of chord objects |
| `isPlaying` | Boolean | false | Current playback state |
| `currentPosition` | Number | 0 | Current playback position in pixels |
| `endPosition` | Number | 400 | End position of the reel |
| `chordPlaying` | Number\|null | null | Index of currently playing chord |

### DOM References
| Property | Type | Description |
|----------|------|-------------|
| `reel` | HTMLElement | Main scrolling container for chords |
| `chordDisplay` | HTMLElement | Collapsible chord data display |
| `chordDisplayContent` | HTMLElement | Content area for chord data |

## Chord Object Structure

```javascript
{
    name: String,        // Display name of the chord (e.g., "C Major")
    notes: Array,        // Array of note strings (e.g., ["C4", "E4", "G4"])
    duration: Number,    // Duration in beats (default: 1)
    delay: Number,       // Delay before chord starts (default: 0)
    startPosition: Number // Calculated pixel position (set automatically)
}
```

## Public API Methods

### Core Functionality
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `addChord(chord)` | `chord: Object` | void | Adds a chord to the sequence |
| `removeChord(chordIndex)` | `chordIndex: Number` | void | Removes chord at specified index |
| `loadSong(song)` | `song: {chords: Array}` | void | Loads a complete song with chord sequence |

### Playback Controls
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `play()` | none | void | Starts playback from current position |
| `stop()` | none | void | Stops playback and resets position to 0 |
| `pause()` | none | void | Pauses playback at current position |
| `scrollReel()` | none | void | Internal method handling reel animation |
| `playChord(chord, duration)` | `chord: Object, duration: Number` | void | Triggers chord playback event |

### Configuration Methods
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `setInstrument(instrument)` | `instrument: String` | void | Updates instrument for chord diagrams |
| `setTempo(tempo)` | `tempo: Number` | void | Sets playback tempo |
| `setTimeSignature(timeSignature)` | `timeSignature: String` | void | Sets time signature |
| `getTempo()` | none | Number | Returns current tempo |
| `getTimeSignature()` | none | String | Returns current time signature |

### Scrolling Methods
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `initializeScrolling()` | none | void | Sets up all scroll event listeners |
| `scroll(deltaX)` | `deltaX: Number` | void | Scrolls by deltaX pixels with boundary checking |
| `updateReelPosition()` | none | void | Updates reel transform based on scroll + playback |
| `updateScrollBoundaries()` | none | void | Recalculates scroll boundaries based on content |
| `resetScrollPosition()` | none | void | Resets scroll to center position |
| `scrollToChord(chordIndex)` | `chordIndex: Number` | void | Scrolls to center specified chord in view |
| `getScrollInfo()` | none | Object | Returns comprehensive scroll state information |

### Event Handlers (Internal)
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `handleWheel(e)` | `e: WheelEvent` | void | Processes mouse wheel and touchpad scrolling |
| `handleTouchStart(e)` | `e: TouchEvent` | void | Initiates touch-based scrolling |
| `handleTouchMove(e)` | `e: TouchEvent` | void | Handles touch move for swiping |
| `handleTouchEnd(e)` | `e: TouchEvent` | void | Completes touch interaction with momentum |
| `handleMouseScrollStart(e)` | `e: MouseEvent` | void | Initiates mouse drag scrolling |
| `startMomentumAnimation()` | none | void | Begins momentum animation loop |

### UI Methods
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `showPlaceholder()` | none | void | Shows placeholder when no chords present |
| `renderChords()` | none | void | Renders all chords to the reel |
| `updateChordDisplay()` | none | void | Updates chord data display |
| `toggleChordDisplay()` | none | void | Toggles chord display collapsed/expanded |

### Internal Methods
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `initDrag(e, chordIndex)` | `e: Event, chordIndex: Number` | void | Initializes chord dragging |
| `initResize(e, chordIndex)` | `e: Event, chordIndex: Number` | void | Initializes chord resizing |

## Events

### Incoming Events (addEventListener)
| Event | Source | Detail | Description |
|-------|--------|--------|-------------|
| `add-chord` | External | `chord: Object` | Adds a new chord to sequence |
| `play` | External | none | Starts playback |
| `stop` | External | none | Stops playback |
| `pause` | External | none | Pauses playback |
| `next-chord` | External | none | Moves to next chord |
| `previous-chord` | External | none | Moves to previous chord |
| `load-song` | External | `song: Object` | Loads song data |
| `set-instrument` | EventHandlers | `instrument: String` | Changes instrument |

### Outgoing Events (dispatchEvent)
| Event | Target | Detail | Description |
|-------|--------|--------|-------------|
| `play-chord` | Document | `{chord: Object, duration: Number}` | Triggers chord playback |
| `isReady` | Document | none | Signals component initialization complete |

## User Interactions

### Mouse Interactions
| Action | Target | Behavior |
|--------|--------|----------|
| Click | Chord Display Header | Toggles collapsed/expanded state |
| Click | Remove Button (×) | Removes chord from sequence |
| MouseDown + Drag | Chord Box | Moves chord position (changes delay) |
| MouseDown + Drag | Resize Handle | Changes chord duration |

### Scrolling Interactions
| Action | Target | Behavior |
|--------|--------|----------|
| Mouse Wheel | Piano Roll Container | Horizontal scrolling (deltaX) |
| Shift + Mouse Wheel | Piano Roll Container | Converts vertical scroll to horizontal |
| Vertical Mouse Wheel | Piano Roll Container | Auto-converts to horizontal scroll (50% sensitivity) |
| Touchpad Swipe | Piano Roll Container | Native horizontal scrolling support |
| Middle Mouse Drag | Piano Roll Container | Drag-based scrolling |
| Ctrl + Left Mouse Drag | Piano Roll Container | Alternative drag-based scrolling |

### Touch/Mobile Interactions
| Action | Target | Behavior |
|--------|--------|----------|
| Horizontal Swipe | Piano Roll Container | Touch-based scrolling with momentum |
| Quick Swipe | Piano Roll Container | Adds momentum for smooth deceleration |
| Slow Swipe | Piano Roll Container | Direct scrolling without momentum |
| Vertical Swipe | Piano Roll Container | Ignored (allows page scrolling) |
| Multi-touch | Piano Roll Container | Ignored (prevents interference) |

### Keyboard Shortcuts (When Available)
| Key | Behavior |
|-----|----------|
| ← Arrow | Scroll left |
| → Arrow | Scroll right |
| Home | Scroll to beginning |
| End | Scroll to end |

### Visual Feedback
- **Play Head**: Red vertical line indicating current playback position
- **Chord Boxes**: Visual representation of chords with drag/resize handles
- **Resize Handles**: Visual indicators for resizable elements
- **Remove Buttons**: × buttons for chord deletion

## Visual Layout

### Main Structure
```
.piano-roll
├── .reel (scrolling container)
│   └── .chord-box (multiple)
│       ├── .chordName
│       ├── chord-diagram (if available)
│       ├── .resize-handle
│       └── .remove-button
└── .play-head (fixed position indicator)

.chord-display (collapsible)
├── .chord-display-header
│   ├── "Chord Data" text
│   └── .toggle-arrow
└── .chord-display-content
```

### CSS Classes
| Class | Purpose |
|-------|---------|
| `.piano-roll` | Main container styling with scroll cursors |
| `.reel` | Scrolling chord container |
| `.chord-box` | Individual chord visual |
| `.resize-handle` | Chord duration resize handle |
| `.remove-button` | Chord deletion button |
| `.play-head` | Current position indicator |
| `.chord-display` | Chord data display container |
| `.chord-display-header` | Collapsible header |
| `.chord-display-content` | Chord data content |
| `.toggle-arrow` | Collapse/expand indicator |
| `.collapsed` | Collapsed state modifier |
| `.expanded` | Expanded state modifier |

### Scrolling-Specific CSS Properties
| Property | Value | Purpose |
|----------|-------|---------|
| `cursor` | `grab` / `grabbing` | Visual feedback for draggable interface |
| `user-select` | `none` | Prevents text selection during scrolling |
| `touch-action` | `pan-y pinch-zoom` | Allows vertical scroll, handles horizontal manually |
| `overflow` | `hidden` | Prevents native scrollbars |

### Transform Behavior
The reel element uses CSS transforms for smooth scrolling:
```css
.reel {
    transform: translateX(-{scrollPosition + playbackPosition}px);
    transition: transform 0.1s linear; /* Only during playback */
}
```

## State Management Integration

### State Dependencies
- `State.instrument()`: Current instrument selection
- `State.loopActive()`: Loop playback setting

### State Updates
- Updates instrument when `set-instrument` event received
- Respects loop setting during playback

## Audio Integration

### Audio Events
The component dispatches `play-chord` events containing:
```javascript
{
    chord: {
        name: String,
        notes: Array,
        duration: Number
    },
    duration: Number
}
```

### AudioManager Integration
- Compatible with the new AudioManager system
- Events are handled by Actions.playChord() which uses AudioManager
- No direct audio synthesis in component

### Scrolling-Playback Integration
- **Dual Position System**: Manual scroll + playback position combined
- **Non-Interfering**: User scrolling doesn't affect playback timing
- **Visual Synchronization**: Play head remains fixed while content scrolls
- **State Persistence**: Scroll position maintained during play/pause/stop cycles

#### Position Calculation
```javascript
totalOffset = scrollPosition + (isPlaying ? currentPosition : 0)
reel.style.transform = `translateX(-${totalOffset}px)`
```

## Performance Considerations

### Rendering Optimization
- Uses `requestAnimationFrame` for smooth reel scrolling and momentum
- Batch DOM updates in `renderChords()`
- Efficient event listener management
- CSS transforms for hardware-accelerated scrolling

### Memory Management
- Proper cleanup of event listeners (drag operations)
- No memory leaks from interval timers
- Efficient chord object management
- Momentum animation cleanup when not needed

### Scrolling Performance
- **Hardware Acceleration**: CSS transforms utilize GPU
- **Boundary Checking**: Prevents excessive calculations outside bounds
- **Momentum Decay**: Automatic cleanup of unused momentum
- **Event Throttling**: User scroll state resets prevent excessive updates
- **Touch Optimization**: Smart detection of horizontal vs vertical swipes

#### Scroll Boundaries Optimization
```javascript
// Efficient boundary calculation
maxScrollLeft = -pianoRollWidth * 0.5
maxScrollRight = Math.max(0, contentWidth - pianoRollWidth * 0.5)
```

#### Event Handler Efficiency
- **Passive Event Listeners**: Where appropriate for better performance
- **Smart Event Prevention**: Only preventDefault when actually scrolling
- **Touch Gesture Detection**: Distinguishes scroll intent from other gestures

## Error Handling

### Chord Diagram Fallback
```javascript
try {
    // Create chord-diagram element
} catch (error) {
    // Fallback to text representation
    console.error('PianoRoll: Error creating chord-diagram:', error);
}
```

### Defensive Programming
- Validates chord data before processing
- Graceful handling of missing dependencies
- Safe array operations with bounds checking

## Browser Compatibility

### Web Components Support
- Requires modern browser with Web Components support
- Shadow DOM used for style encapsulation
- Custom Elements v1 API

### Event System
- Uses standard CustomEvent API
- Compatible with modern event delegation patterns

## Testing Requirements

### Unit Tests (Current: 13 tests, 63.97% coverage)
**Covered Functionality:**
- ✅ Basic initialization
- ✅ Chord addition and removal
- ✅ Playback state management
- ✅ Collapsible display functionality
- ✅ Event dispatching

**Missing Coverage (Lines 165,174,178,182,186,190,194,199,241-242,263-268,304-347,402-404,418-437):**
- ❌ Drag and drop functionality
- ❌ Resize functionality
- ❌ Tempo and time signature methods
- ❌ Song loading
- ❌ Error handling paths
- ❌ Animation and scrolling
- ❌ Instrument changes
- ❌ Loop functionality

### Integration Tests Needed
- Event system integration
- AudioManager compatibility
- State management integration
- Chord diagram component integration

### Performance Tests Needed
- Animation smoothness
- Memory usage during long sequences
- Event handler efficiency

## Security Considerations

### Input Validation
- Sanitize chord names for XSS prevention
- Validate numeric inputs (tempo, duration, delay)
- Safe JSON parsing for song data

### DOM Manipulation
- Use safe DOM creation methods
- Prevent script injection through chord data
- Validate event detail objects

## Accessibility Requirements

### Keyboard Navigation
- Tab navigation through interactive elements
- Space/Enter activation for buttons
- Arrow key navigation for chord selection

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for interactive elements
- Live region announcements for playback state

### Visual Accessibility  
- High contrast mode support
- Scalable font sizes
- Focus indicators for interactive elements

## Configuration Options

### Customizable Properties
```javascript
// Default configuration
{
    chordWidth: 100,    // Pixels per beat
    tempo: 120,         // BPM
    timeSignature: '4/4', // Time signature
    endPosition: 400    // Default sequence length
}
```

### Style Customization
- CSS custom properties for theming
- Modifiable dimensions and colors
- Responsive layout support

## Future Enhancement Possibilities

### Advanced Features
- Multi-track support
- Real-time chord editing
- Import/export MIDI compatibility
- Quantization and snap-to-grid
- Velocity and expression controls

### UI Improvements
- Zoom controls for timeline
- Minimap navigation
- Chord suggestion system
- Undo/redo functionality

### Performance Optimizations
- Virtual scrolling for large sequences
- Web Workers for audio processing
- Progressive loading of chord data