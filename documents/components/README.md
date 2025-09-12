# Component Documentation Index

This directory contains individual specification files for each component in the Gigso application.

## Core Music Components

### [BaseComponent](./base-component.md)
Abstract base class for all Web Components providing common functionality.

### [PianoRoll](./piano-roll.md)
Visual timeline interface for arranging and playing chord progressions.

### [ChordPalette](./chord-palette.md)
Pre-defined chord library for quick chord selection.

### [AddChord](./add-chord.md)
Form interface for creating custom chords.

### [GigsoKeyboard](./gigso-keyboard.md)
Interactive piano keyboard for note playback and visual feedback.

### [HandPan](./hand-pan.md)
Interactive hand pan (hang drum) instrument for touch-screen play with soothing synthesized tones.

### [HandPanWrapper](./hand-pan-wrapper.md)
Complete drop-in wrapper component with audio management, key selection, size controls, and event logging.

### [CurrentChord](./current-chord.md)
Displays the currently selected or playing chord.

### [ChordDiagram](./chord-diagram.md)
Visual representation of chord fingerings.

## Transport Controls

### [TransportControls](./transport-controls.md)
Container component for playback control buttons.

### [PlayButton](./play-button.md)
Initiates playback of the current song.

### [StopButton](./stop-button.md)
Stops playback and resets to beginning.

### [LoopButton](./loop-button.md)
Toggles loop playback mode.

### [BpmController](./bpm-controller.md)
Controls tempo (BPM) with plus/minus buttons and text input.

## Song Management

### [RecordCollection](./record-collection.md)
Displays and loads songs from the song library.

## Interface Components

### [GigsoMenu](./gigso-menu.md)
Toggle interface for showing/hiding components.

## Component Categories

### Music Creation
- **PianoRoll**: Main composition interface
- **ChordPalette**: Quick chord selection
- **AddChord**: Custom chord creation
- **GigsoKeyboard**: Note playback and feedback
- **HandPan**: Touch-screen hand pan instrument
- **HandPanWrapper**: Complete HandPan solution with controls

### Playback Control
- **TransportControls**: Container for controls
- **PlayButton**: Start playback
- **StopButton**: Stop playback
- **LoopButton**: Toggle loop mode
- **BpmController**: Control tempo (BPM)

### Visual Feedback
- **CurrentChord**: Display current chord
- **ChordDiagram**: Show chord fingerings

### Song Management
- **RecordCollection**: Load saved songs

### Interface
- **GigsoMenu**: Component visibility toggles

## Quick Reference

### Event Communication
All components communicate via custom events. See individual component specs for:
- Events received (inputs)
- Events dispatched (outputs)
- Event data structures

### State Integration
Components integrate with global state via:
- `state/state.js` for shared state
- `actions/actions.js` for business logic

### Testing
Each component should have:
- Unit tests in `__tests__/` folder
- Event handling tests
- Visual state tests
- Integration tests

## Development Guidelines

### When Adding New Components
1. Create component file in `components/` directory
2. Extend `BaseComponent` class
3. Add component specification to this directory
4. Write tests in `__tests__/` folder
5. Update this index file

### When Modifying Components
1. Check existing specification first
2. Update specification if behaviour changes
3. Update tests to reflect changes
4. Maintain backward compatibility where possible

### Documentation Standards
Each component specification should include:
- **Purpose**: What the component does
- **Inputs**: Events, attributes, data received
- **Outputs**: Events dispatched, visual changes
- **Expected Behaviour**: How it should function
- **Integration Patterns**: How it works with other components
- **Testing Requirements**: What to test
- **Performance Considerations**: Performance notes
- **Future Enhancements**: Planned improvements

## Related Documentation

- [Main PRD](../PRD.md) - Overall project specification
- [Quick Reference](../PRD-QUICK-REFERENCE.md) - Concise project overview
- [Base Component](../base-component.md) - Foundation for all components 