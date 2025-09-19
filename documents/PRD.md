# Gigso - Product Requirements Document (PRD)

## Project Overview

**Project Name:** Gigso (Songstructor)  
**Version:** 1.0.0  
**Description:** A web-based music creation application that allows users to compose, play, and record chord progressions and songs using a visual piano roll interface.

## Core Features

### 1. Music Composition Interface
- **Piano Roll Component**: Visual timeline-based interface for arranging chords and notes
- **Chord Palette**: Pre-defined chord library with common chord types
- **Add Chord Component**: Interface for creating custom chords
- **Current Chord Display**: Shows the currently selected/playing chord
- **Chord Diagram**: Visual representation of chord fingerings

### 2. Playback Controls
- **Transport Controls**: Play, pause, stop functionality
- **Loop Button**: Toggle loop playback for selected sections
- **BPM Controller**: Adjust tempo with plus/minus buttons and text input
- **Keyboard Shortcuts**:
  - Spacebar: Play/pause
  - Escape: Stop
  - Arrow Right: Next chord
  - Arrow Left: Previous chord

### 3. Virtual Instruments
- **Gigso Keyboard**: Interactive piano keyboard interface
- **Hand Pan**: Touch-screen hand pan (hang drum) instrument with soothing tones
  - **HandPan Wrapper**: Complete drop-in component with audio management, key selection, and size controls
  - **Multi-touch Support**: Simultaneous note playing on touch devices
  - **Authentic Timbre**: Triangle oscillator with reverb for authentic hand pan sound
  - **Visual Feedback**: Pulse animations and ripple effects
  - **Complete Scale Support**: All 12 major and 12 minor scales with no repeated notes in any single key
- **Mobile Ukulele**: Touch-optimised ukulele instrument for mobile phones
  - **Landscape Mobile Design**: Optimised for mobile phones in landscape orientation
  - **Fret Button Interface**: Pressable fret buttons for holding down strings
  - **Strum Area**: Touch area for strumming individual strings or chords
  - **Swipe Support**: Swipe through strings in strum area for fluid playing
  - **Ukulele Tuning**: Standard G-C-E-A tuning with support for low-G and baritone
  - **Multi-touch Chords**: Support for playing chords with multiple simultaneous touches
  - **Authentic Ukulele Sound**: Bright, plucky timbre with string resonance
- **Note Highlighting**: Visual feedback for currently playing notes
- **MIDI-like Interaction**: Click to play individual notes

### 4. Song Management
- **Record Collection**: Save and load song projects
- **Song Library**: Built-in collection of example songs
- **Export/Import**: Save songs in JSON format

### 5. Menu System
- **Gigso Menu**: Main navigation and settings interface

## Technical Architecture

### Component Structure
All components extend `BaseComponent` class and use Web Components architecture:

```javascript
export default class ComponentName extends BaseComponent {
  constructor() {
    super(template, styles, isolatedStyles);
    this.addEventListeners(eventListeners);
  }
}
```

**HandPan Wrapper Component**: A special wrapper component that combines multiple features:
- Audio context management with user interaction
- Key and scale selection controls
- Size adjustment controls
- Event logging and debugging
- Complete drop-in solution for easy integration

### State Management
Centralised state management in `state/state.js`:
- `isPlaying`: Boolean - playback status
- `loopActive`: Boolean - loop mode status  
- `currentChord`: Object - currently selected chord
- `song`: Object - current song data
- `bpm`: Number - beats per minute (tempo)

### Event System
Custom event-driven architecture:
- Components communicate via `CustomEvent`
- `EventHandlers.dispatchComponentEvent()` for cross-component communication
- Event listeners defined in component registration

### Audio Engine
- **Tone.js**: Web Audio API wrapper for synthesis and playback
- **PolySynth**: Polyphonic synthesiser for chord playback
- **Transport**: Timeline-based playback control
- **Audio Context Management**: Proper initialization from user interaction (browser requirement)
- **Debouncing**: Prevents rapid note triggering conflicts
- **Error Handling**: Graceful handling of audio timing issues

## Coding Standards

### File Organisation
```
gigso/
├── components/          # Web Components
│   ├── component-name/
│   │   ├── __tests__/   # Component tests
│   │   ├── component-name.js
│   │   └── component-name.css
│   └── hand-pan-wrapper/ # Special wrapper component
│       ├── hand-pan-wrapper.js
│       └── hand-pan-wrapper.css
├── actions/            # Business logic
├── state/              # State management
├── helpers/            # Utility functions
├── __tests__/          # Integration tests
├── documents/          # Documentation
└── *.html              # Demo and test pages
```

### Naming Conventions
- **Files**: kebab-case (e.g., `piano-roll.js`)
- **Classes**: PascalCase (e.g., `PianoRoll`)
- **Functions**: camelCase (e.g., `playChord`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_DURATION`)
- **Events**: kebab-case (e.g., `play-clicked`)

### Component Structure
```javascript
// Template and styles
const template = `<div class="component">...</div>`;
const styles = `/* Component styles */`;

// Event listeners
const eventListeners = [
  { selector: '.button', event: 'click', handler: this.handleClick.bind(this) }
];

// Component class
export default class ComponentName extends BaseComponent {
  constructor() {
    super(template, styles);
    this.addEventListeners(eventListeners);
  }
  
  // Methods
  handleClick(event) {
    // Handle event
  }
}
```

### Testing Standards
- **Test-Driven Development (TDD)**: Write tests before implementation
- **Jest**: Testing framework with jsdom environment
- **Testing Library**: DOM testing utilities
- **Test Files**: Co-located with components in `__tests__/` folders
- **Test Naming**: `component-name.test.js`

### Code Quality
- **ES6 Modules**: Use import/export syntax
- **Arrow Functions**: For callbacks and short functions
- **Template Literals**: For string interpolation
- **Destructuring**: For object/array assignment
- **Async/Await**: For asynchronous operations
- **Error Handling**: Try-catch blocks for async operations

### Documentation
- **JSDoc**: For function documentation
- **Inline Comments**: For complex logic
- **README**: Project setup and usage
- **PRD**: This document for requirements
- **Component Specifications**: `documents/COMPONENT-SPECIFICATIONS.md` for detailed component documentation

## Data Structures

### Chord Object
```javascript
{
  name: "C",           // Chord name (string)
  notes: ["C4", "E4", "G4"], // Array of note names
  duration: 1,         // Duration in beats (number)
  delay: 0,           // Delay before play (number)
  startPosition: 0    // Position in timeline (number)
}
```

### Song Object
```javascript
{
  name: "Song Name",   // Song title
  chords: [/* array of chord objects */],
  tempo: 120,         // BPM (legacy field)
  bpm: 120,           // Current BPM value
  timeSignature: "4/4" // Time signature
}
```

## User Interface Guidelines

### Design Principles
- **Minimalist**: Clean, uncluttered interface
- **Intuitive**: Music creation should feel natural
- **Responsive**: Works on desktop and tablet
- **Accessible**: Keyboard navigation and screen reader support

### Colour Scheme
- **Primary**: #007bff (Blue)
- **Secondary**: #6c757d (Grey)
- **Success**: #28a745 (Green)
- **Warning**: #ffc107 (Yellow)
- **Danger**: #dc3545 (Red)

### Typography
- **Font Family**: System fonts (Arial, Helvetica, sans-serif)
- **Font Sizes**: 14px base, 16px for headings
- **Line Height**: 1.5 for readability

## Performance Requirements

### Audio Performance
- **Latency**: < 50ms audio response time
- **Polyphony**: Support for 8+ simultaneous notes
- **Sample Rate**: 44.1kHz minimum

### UI Performance
- **Frame Rate**: 60fps for animations
- **Load Time**: < 2 seconds initial load
- **Responsiveness**: < 100ms UI response time

## Browser Support
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## Development Workflow

### Setup
```bash
npm install
npm test
```

### Testing
```bash
npm test          # Run tests in watch mode
npm test -- --coverage  # Generate coverage report
```

### Building
```bash
# Currently using ES6 modules directly
# Future: Add build process for production
```

## Future Enhancements

### Phase 2 Features
- **MIDI Support**: Import/export MIDI files
- **Audio Recording**: Record audio output
- **Effects**: Reverb, delay, filters
- **Collaboration**: Real-time collaborative editing
- **Mobile App**: Native mobile application

### Phase 3 Features
- **AI Composition**: AI-assisted chord suggestions
- **Advanced Synthesis**: More synthesiser types
- **Score Export**: PDF sheet music export
- **Plugin System**: Third-party plugin support

## Maintenance and Updates

### Version Control
- **Git Flow**: Feature branches, release branches
- **Commit Messages**: Conventional commits format
- **Pull Requests**: Required for all changes

### Deployment
- **Environment**: Node.js server
- **Static Assets**: Served from public directory
- **Caching**: Browser caching for static assets

---

## Key Files to Reference
- `documents/PRD.md` - Complete project specification
- `documents/COMPONENT-SPECIFICATIONS.md` - Detailed component documentation
- `components/base-component.js` - Base component architecture
- `state/state.js` - State management patterns
- `actions/actions.js` - Business logic examples
- `main.js` - Application entry point and component registration

---

**Last Updated:** [Current Date]  
**Version:** 1.0.0  
**Maintainer:** Development Team 