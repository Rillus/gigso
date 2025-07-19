# PRD Quick Reference Guide

## 🎯 Core Purpose
Gigso is a web-based music creation app using Web Components + Tone.js for chord progression composition and playback.

## 📁 Key Files
- `documents/PRD.md` - Complete specification
- `components/base-component.js` - Base component architecture
- `state/state.js` - Centralised state management
- `actions/actions.js` - Business logic
- `main.js` - App entry point

## 🏗️ Architecture Patterns

### Component Structure
```javascript
export default class ComponentName extends BaseComponent {
  constructor() {
    super(template, styles);
    this.addEventListeners(eventListeners);
  }
}
```

### State Management
```javascript
// Getters
const isPlaying = () => state.isPlaying;
// Setters  
const setIsPlaying = (value) => { state.isPlaying = value; }
```

### Event Communication
```javascript
// Dispatch events
dispatchComponentEvent('component-name', 'event-name', data);
// Listen for events
document.body.addEventListener('event-name', handler);
```

## 📊 Data Structures

### Chord Object
```javascript
{
  name: "C",
  notes: ["C4", "E4", "G4"],
  duration: 1,
  delay: 0,
  startPosition: 0
}
```

### Song Object
```javascript
{
  name: "Song Name",
  chords: [/* chord objects */],
  tempo: 120,
  timeSignature: "4/4"
}
```

## 🎨 UI Components
- **Piano Roll**: Timeline-based chord arrangement
- **Chord Palette**: Pre-defined chord library
- **Gigso Keyboard**: Interactive piano interface
- **Transport Controls**: Play/pause/stop
- **Current Chord**: Display active chord
- **Record Collection**: Save/load songs

## ⌨️ Keyboard Shortcuts
- `Space`: Play/pause
- `Escape`: Stop
- `Arrow Right`: Next chord
- `Arrow Left`: Previous chord

## 🧪 Testing (TDD)
- Write tests before implementation
- Use Jest + jsdom
- Test files: `__tests__/component-name.test.js`
- High coverage required

## 🇬🇧 British English Standards
- Use British spelling (colour, centre, etc.)
- British terminology in comments
- Follow established naming conventions

## 🚀 Performance Targets
- Audio latency: < 50ms
- UI response: < 100ms
- Frame rate: 60fps
- Load time: < 2s

## 🔄 Development Workflow
1. Check PRD for specifications
2. Update PRD if incomplete
3. Write tests first (TDD)
4. Implement feature
5. Follow British English conventions

## 📝 When Adding Features
1. **Always** check `documents/PRD.md` first
2. Update PRD if specs are missing
3. Follow TDD approach
4. Use established patterns
5. Maintain British English throughout 