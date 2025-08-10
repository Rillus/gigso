# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Testing
- `npm test` - Run all tests with Jest in watch mode
- `jest --watch` - Alternative test command
- Test files located in `__tests__/` directories throughout the codebase

### Build & Serve
- `npm run build` - Creates dist/ directory with static files (no actual build process required)
- `node serve-demos.js` - Run demo server on http://localhost:8000/demos/
- No build process required - static HTML/JS/CSS files served directly

### Demo System
- View all demos: Open `demos/index.html` in browser
- Individual component demos available in `demos/` directory
- Test pages for specific features: `test-*.html` files in root

## Architecture Overview

### Component System
**Base Architecture**: Web Components with custom element extension
- All components extend `BaseComponent` (`components/base-component.js`)
- Shadow DOM isolation (configurable via `isolatedStyles` parameter)
- Event-driven communication between components
- Custom template + styles pattern

**Key Components**:
- `HandPan` - Multi-touch musical instrument with dynamic key/scale changes
- `Fretboard` - Guitar/string instrument visualization with scale patterns
- `PianoRoll` - MIDI-like sequence editor
- `ChordPalette` - Chord selection and management
- Transport controls for playback (Play/Pause/Stop/Loop buttons)

### State Management
**Centralized State**: `state/state.js`
- Simple getter/setter pattern with closure-based state object
- Key state: `isPlaying`, `loopActive`, `currentChord`, `song`, `instrument`
- No reactive framework - manual state updates

### Event System
**Custom Event Architecture**: `helpers/eventHandlers.js`
- Component-to-component communication via CustomEvents
- Event binding configured in `main.js` via `elementsToAdd` array
- Global keyboard shortcuts handled in `app.js`

### Audio Engine
**Tone.js Integration**:
- Audio synthesis via Tone.js library (CDN loaded)
- Audio actions centralized in `actions/actions.js`
- Components trigger audio via events, not direct Tone.js calls

### Key Technical Patterns

**Component Registration**:
```javascript
const elementsToAdd = [
    {
        tag: ComponentClass,
        emittedEvents: [
            {
                name: 'event-name',
                function: (event) => { /* handler */ }
            }
        ]
    }
];
```

**Component Structure**:
- Constructor: `super(template, styles, isolatedStyles)`
- Event listeners: `addEventListeners()` method
- Custom events: `dispatchComponentEvent()` method

**File Organization**:
- `/components/[component-name]/` - Component files with tests
- `/helpers/` - Utility functions (event handling, element management)
- `/state/` - Global state management
- `/actions/` - Audio/playback actions
- `/documents/` - Technical specifications and development plans

### Testing Strategy
- Jest with jsdom environment
- Component-focused unit tests
- Event system testing
- Audio initialization and interaction testing
- Tests co-located with components in `__tests__/` directories

### Key Development Notes
- Phase-based development approach (documented in `/documents/`)
- HandPan component supports 12 chromatic keys with multiple scale types
- Fretboard component supports multiple instruments (guitar, ukulele, mandolin)
- Performance optimized for 60fps animations and <50ms audio latency
- Accessibility compliant (WCAG 2.1 AA)
- Mobile-responsive design with touch support
- Unclelele section: `/unclelele.html` for ukulele workshops with printable song sheets