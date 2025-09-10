# Chord Palette Key Selection Feature Specification

## Overview
Enhance the existing chord palette component to automatically set the song key when the first chord is selected. This creates an intuitive workflow where users can quickly establish the key of their song by simply clicking the first chord they want to use.

## Current State Analysis

### Existing Components
- **ChordPalette**: Displays chromatic chord grid with major/minor chords
- **SongSheet**: Displays song metadata including current key
- **ScaleKey**: Provides transposition and musical theory functionality
- **State Management**: Basic state for current song, chord, and instrument

### Current Chord Palette Functionality
- Displays 12 chromatic major chords (C, C#, D, etc.)
- Displays 12 chromatic minor chords (Cm, C#m, Dm, etc.)
- Dispatches `add-chord` and `chord-selected` events when chords are clicked
- Uses colour coding for different chord types

## Feature Requirements

### 1. Key Detection Logic
- **First Chord Selection**: When a chord is selected and no song key is currently set, automatically set that chord as the song key
- **Key Format**: Extract root note from chord (e.g., "C" from "C", "C#" from "C#m", "Bb" from "Bbm")
- **Scale Type Detection**: 
  - Major chords (C, D, E, etc.) → Major key
  - Minor chords (Cm, Dm, Em, etc.) → Minor key
  - Default to major if ambiguous

### 2. State Management Updates
- Add `songKey` to state management
- Add `songScale` to state management (major/minor)
- Add `isKeySet` boolean to track if key has been established
- Update state when first chord is selected

### 3. Chord Palette Enhancements
- **Visual Feedback**: Highlight the key chord when set
- **Key Indicator**: Show current key in palette header
- **Reset Functionality**: Allow users to change the key by selecting a different chord
- **Confirmation**: Optional confirmation dialog for key changes

### 4. Song Sheet Integration
- Update song metadata display to show the dynamically set key
- Update chord colour coding to reflect the new key
- Maintain existing chord progression display

### 5. Hand-Pan Integration
- **Automatic Key Sync**: When song key is set via chord palette, automatically update hand-pan to match
- **Key Validation**: Check if the selected key is available for hand-pan (all 12 chromatic keys supported)
- **Scale Mapping**: Map song scale to hand-pan scale (major/minor)
- **Visual Feedback**: Update hand-pan display to show new key and scale
- **Event Communication**: Hand-pan listens for key changes and updates accordingly

### 6. Fretboard Integration
- **Automatic Scale Display**: When song key is set, automatically display the scale on the fretboard
- **Key-Appropriate Highlighting**: Highlight scale notes that belong to the song's key
- **Multi-Instrument Support**: Update fretboard for guitar, ukulele, and mandolin
- **Scale Pattern Visualization**: Show the complete scale pattern with root note emphasis
- **Interactive Scale Notes**: Allow users to click on scale notes for audio feedback

### 7. Transposition Support
- Use existing ScaleKey component for chord transposition
- When key changes, transpose all existing chords in the song
- Update chord diagrams and inline chord notation

## Hand-Pan Integration Details

### Supported Keys and Scales
The hand-pan component supports all 12 chromatic keys:
- **Keys**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- **Scales**: Major and Minor (from `helpers/scaleUtils.js`)

### Key Validation Logic
```javascript
// All keys from chord palette are supported by hand-pan
const isKeySupported = (key) => {
    const supportedKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return supportedKeys.includes(key);
};
```

### Scale Mapping
The hand-pan uses a simplified scale system compared to the full ScaleKey component:
- **Song Scale → Hand-Pan Scale**:
  - `major` → `major`
  - `minor` → `minor`
  - `naturalMinor` → `minor`
  - `harmonicMinor` → `minor` (default)
  - `melodicMinor` → `minor` (default)

### Event Flow
1. User selects chord in chord palette
2. Chord palette dispatches `key-changed` event
3. Hand-pan listens for `key-changed` event
4. Hand-pan validates key is supported
5. Hand-pan maps scale type
6. Hand-pan calls `changeKey(key, scale)`
7. Hand-pan re-renders with new notes
8. Hand-pan dispatches `hand-pan-key-updated` event

### Error Handling
- If key is not supported, hand-pan logs warning and keeps current key
- If scale mapping fails, defaults to minor scale
- Graceful fallback to current hand-pan state

## Fretboard Integration Details

### Supported Instruments and Keys
The fretboard component supports multiple instruments and all 12 chromatic keys:
- **Instruments**: Guitar (6-string), Ukulele (4-string), Mandolin (8-string/4-course)
- **Keys**: All 12 chromatic keys (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- **Scales**: Major, minor, pentatonic, and other scale types via ScaleKey component

### Scale Display Features
- **Root Note Highlighting**: Emphasizes the root note of the scale
- **Interval Color Coding**: Different colors for thirds, fifths, sevenths
- **Scale Pattern Visualization**: Shows complete scale pattern across fretboard
- **Interactive Notes**: Clickable scale notes with audio feedback
- **Key Signature Display**: Shows sharps/flats for the selected key

### Event Flow for Fretboard
1. User selects chord in chord palette
2. Chord palette dispatches `key-changed` event
3. Fretboard listens for `key-changed` event
4. Fretboard extracts key and scale from event
5. Fretboard calls `displayScale(key, scale)`
6. Fretboard highlights scale notes and root
7. Fretboard dispatches `fretboard-scale-updated` event

### Scale Mapping for Fretboard
The fretboard uses the full ScaleKey component capabilities:
- **Song Scale → Fretboard Scale**:
  - `major` → `major`
  - `minor` → `minor`
  - `naturalMinor` → `minor`
  - `harmonicMinor` → `harmonicMinor`
  - `melodicMinor` → `melodicMinor`
  - `pentatonic` → `pentatonic`
  - All other scales supported by ScaleKey

### Visual Enhancements
- **Scale Note Highlighting**: Color-coded scale notes on fretboard
- **Root Note Emphasis**: Larger, highlighted root note
- **Interval Markers**: Visual indicators for scale degrees
- **Key Signature**: Display sharps/flats for the key
- **Responsive Design**: Adapts to different screen sizes

## Technical Implementation

### 1. State Management Updates
```javascript
// Add to state/state.js
const state = {
    // ... existing state
    songKey: null,
    songScale: 'major',
    isKeySet: false
}

// Add getters and setters
const songKey = () => state.songKey;
const setSongKey = (key) => {
    state.songKey = key;
    state.isKeySet = true;
};
```

### 2. Chord Palette Modifications
```javascript
// Add to chord-palette.js
setKeyFromChord(chordName) {
    const rootNote = this.extractRootNote(chordName);
    const scaleType = this.determineScaleType(chordName);
    
    // Update state
    state.setSongKey(rootNote);
    state.setSongScale(scaleType);
    
    // Update visual feedback
    this.highlightKeyChord(chordName);
    
    // Dispatch key change event
    this.dispatchEvent(new CustomEvent('key-changed', {
        detail: { key: rootNote, scale: scaleType }
    }));
}

extractRootNote(chordName) {
    // Extract root note from chord (C from C, C# from C#m, etc.)
    return chordName.replace(/m$/, '');
}

determineScaleType(chordName) {
    return chordName.endsWith('m') ? 'minor' : 'major';
}
```

### 3. Song Sheet Integration
```javascript
// Add to song-sheet.js
updateSongKey(newKey, newScale) {
    if (!this.currentSong) return;
    
    // Update song metadata
    this.currentSong.key = newKey;
    this.currentSong.scale = newScale;
    
    // Transpose chords if needed
    this.transposeSongChords(newKey);
    
    // Re-render song
    this.renderSong();
}

transposeSongChords(newKey) {
    // Use ScaleKey component for transposition
    const scaleKey = new ScaleKey();
    const originalKey = this.currentSong.originalKey || this.currentSong.key;
    
    // Transpose chord progression
    if (this.currentSong.chordProgression) {
        this.currentSong.chordProgression = scaleKey.transposeKey(
            originalKey, 
            newKey, 
            this.currentSong.chordProgression
        );
    }
    
    // Transpose inline chords in lyrics
    this.currentSong.lyrics = this.transposeInlineChords(
        this.currentSong.lyrics, 
        originalKey, 
        newKey
    );
}
```

### 4. Hand-Pan Integration
```javascript
// Add to hand-pan.js
connectedCallback() {
    // ... existing code ...
    
    // Listen for key changes from chord palette
    document.addEventListener('key-changed', (event) => {
        this.handleKeyChange(event.detail);
    });
}

handleKeyChange(keyData) {
    const { key, scale } = keyData;
    
    // Validate key is supported by hand-pan
    if (this.isKeySupported(key)) {
        // Map song scale to hand-pan scale
        const handPanScale = this.mapToHandPanScale(scale);
        
        // Update hand-pan key and scale
        this.changeKey(key, handPanScale);
        
        console.log(`HandPan: Updated to ${key} ${handPanScale} from song key change`);
    } else {
        console.warn(`HandPan: Key ${key} not supported, keeping current key`);
    }
}

isKeySupported(key) {
    // All 12 chromatic keys are supported
    const supportedKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return supportedKeys.includes(key);
}

mapToHandPanScale(songScale) {
    // Map song scale types to hand-pan scale types
    const scaleMapping = {
        'major': 'major',
        'minor': 'minor',
        'naturalMinor': 'minor',
        'harmonicMinor': 'minor', // Default to minor for hand-pan
        'melodicMinor': 'minor'   // Default to minor for hand-pan
    };
    
    return scaleMapping[songScale] || 'minor';
}
```

### 5. Fretboard Integration
```javascript
// Add to fretboard.js
connectedCallback() {
    // ... existing code ...
    
    // Listen for key changes from chord palette
    document.addEventListener('key-changed', (event) => {
        this.handleKeyChange(event.detail);
    });
}

handleKeyChange(keyData) {
    const { key, scale } = keyData;
    
    // Validate key is supported by fretboard
    if (this.isKeySupported(key)) {
        // Map song scale to fretboard scale
        const fretboardScale = this.mapToFretboardScale(scale);
        
        // Display scale on fretboard
        this.displayScale(key, fretboardScale, key);
        
        console.log(`Fretboard: Updated to ${key} ${fretboardScale} from song key change`);
    } else {
        console.warn(`Fretboard: Key ${key} not supported, keeping current scale`);
    }
}

isKeySupported(key) {
    // All 12 chromatic keys are supported
    const supportedKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return supportedKeys.includes(key);
}

mapToFretboardScale(songScale) {
    // Map song scale types to fretboard scale types
    // Fretboard supports full ScaleKey capabilities
    const scaleMapping = {
        'major': 'major',
        'minor': 'minor',
        'naturalMinor': 'minor',
        'harmonicMinor': 'harmonicMinor',
        'melodicMinor': 'melodicMinor',
        'pentatonic': 'pentatonic',
        'majorPentatonic': 'majorPentatonic',
        'minorPentatonic': 'minorPentatonic',
        'dorian': 'dorian',
        'mixolydian': 'mixolydian'
    };
    
    return scaleMapping[songScale] || songScale; // Pass through if not mapped
}

// Enhanced scale display with key highlighting
displayScaleWithKeyHighlighting(rootNote, scaleType, key) {
    // Display the scale
    this.displayScale(rootNote, scaleType, key);
    
    // Add key-specific highlighting
    this.highlightKeyNotes(rootNote, scaleType);
    
    // Show key signature
    this.displayKeySignature(rootNote, scaleType);
}

highlightKeyNotes(rootNote, scaleType) {
    // Use existing fretboard highlighting system
    const scalePositions = this.calculator.getEnhancedScalePositions(
        this.instrument,
        rootNote,
        scaleType
    );
    
    // Apply enhanced highlighting for key notes
    this.renderer.highlightKeyNotes(scalePositions, rootNote);
}

displayKeySignature(rootNote, scaleType) {
    // Get key signature from calculator
    const keySignature = this.calculator.getKeySignature(rootNote);
    
    // Render key signature on fretboard
    this.renderer.renderKeySignature({ 
        ...keySignature, 
        key: rootNote,
        scale: scaleType 
    });
}
```

### 6. Visual Enhancements
```css
/* Add to chord-palette styles */
.key-indicator {
    background: var(--unclelele-accent, #F7931E);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
}

.chord-button.key-chord {
    border: 3px solid var(--unclelele-accent, #F7931E);
    box-shadow: 0 0 10px rgba(247, 147, 30, 0.5);
    transform: scale(1.05);
}

.chord-button.key-chord:hover {
    transform: scale(1.1);
}
```

## User Experience Flow

### 1. Initial State
- User opens song sheet or starts new song
- Chord palette shows all available chords
- No key is set initially

### 2. Key Selection
- User clicks first chord in chord palette
- System automatically sets that chord as the song key
- Chord palette highlights the selected key chord
- Song sheet updates to show new key
- Key indicator appears in chord palette header
- **Hand-pan automatically switches to match the new key**
- **Fretboard displays the scale pattern for the new key**

### 3. Key Changes
- User clicks different chord in palette
- System prompts for confirmation (optional)
- If confirmed, transposes all existing chords
- Updates visual indicators and song display
- **Hand-pan updates to match the new key (if supported)**
- **Fretboard updates to show the new scale pattern**

### 4. Visual Feedback
- Key chord is highlighted with accent colour
- Key indicator shows current key and scale
- **Fretboard highlights scale notes and root**
- **Hand-pan shows new key and scale**
- Smooth transitions for visual changes
- Clear indication of key changes

## Event System

### New Events
- `key-changed`: Dispatched when song key changes
- `key-set`: Dispatched when key is first established
- `transposition-complete`: Dispatched when chord transposition finishes
- `hand-pan-key-updated`: Dispatched when hand-pan key is successfully updated
- `fretboard-scale-updated`: Dispatched when fretboard scale is successfully updated

### Event Listeners
- Song sheet listens for key changes
- **Hand-pan listens for key changes and updates accordingly**
- **Fretboard listens for key changes and displays scale**
- Other components can listen for key changes
- Chord palette listens for external key changes

## Testing Requirements

### Unit Tests
- Key extraction from chord names
- Scale type detection
- State management updates
- Chord transposition accuracy

### Integration Tests
- Chord palette to song sheet communication
- **Chord palette to hand-pan key synchronization**
- **Chord palette to fretboard scale synchronization**
- State consistency across components
- Visual feedback updates
- Event dispatching and handling
- **Hand-pan key validation and scale mapping**
- **Fretboard scale display and highlighting**

### User Acceptance Tests
- First chord selection sets key
- Key changes update song display
- **Hand-pan automatically updates to match song key**
- **Fretboard displays scale pattern for selected key**
- Visual feedback is clear and intuitive
- Transposition maintains chord relationships
- **Hand-pan remains in sync with song key changes**
- **Fretboard highlights appropriate scale notes**

## Implementation Phases

### Phase 1: Core Functionality
- Update state management
- Modify chord palette for key detection
- Basic key setting on first chord selection

### Phase 2: Visual Enhancements
- Add key indicator to chord palette
- Highlight key chord
- Update song sheet key display

### Phase 3: Hand-Pan Integration
- **Add hand-pan key change listeners**
- **Implement key validation for hand-pan**
- **Add scale mapping between song and hand-pan**
- **Update hand-pan visual feedback**

### Phase 4: Fretboard Integration
- **Add fretboard key change listeners**
- **Implement scale display for song key**
- **Add key highlighting and root note emphasis**
- **Update fretboard visual feedback**

### Phase 5: Transposition
- Integrate ScaleKey component
- Implement chord transposition
- Update inline chord notation

### Phase 6: Polish & Testing
- Add confirmation dialogs
- Comprehensive testing
- Performance optimization
- User experience refinements

## Success Criteria

### Functional Requirements
- ✅ First chord selection automatically sets song key
- ✅ Key changes transpose existing chords
- ✅ **Hand-pan automatically syncs to song key**
- ✅ **Fretboard displays scale pattern for song key**
- ✅ Visual feedback clearly indicates current key
- ✅ State remains consistent across components

### User Experience Requirements
- ✅ Intuitive workflow for key selection
- ✅ Clear visual indicators
- ✅ Smooth transitions and animations
- ✅ Responsive design maintained

### Technical Requirements
- ✅ Maintains existing functionality
- ✅ Follows established patterns
- ✅ Comprehensive test coverage
- ✅ Performance impact minimal

## Future Enhancements

### Potential Additions
- **Key Signature Display**: Show key signature in song sheet
- **Scale Mode Selection**: Allow users to choose between major/minor modes
- **Chord Suggestions**: Suggest chords that fit the selected key
- **Key History**: Allow users to revert to previous keys
- **Batch Key Changes**: Change key for multiple songs at once

### Integration Opportunities
- **HandPan Component**: ✅ **Already integrated** - Sync key changes with hand-pan scale
- **Fretboard Component**: ✅ **Already integrated** - Display scale patterns for song key
- **Piano Roll**: Highlight key notes in piano roll interface
- **Gigso Keyboard**: Sync keyboard to match song key

## Dependencies

### Existing Components
- ChordPalette (modification)
- SongSheet (modification)
- **HandPan (modification for key sync)**
- **Fretboard (modification for scale display)**
- ScaleKey (integration)
- State management (extension)

### External Libraries
- No new external dependencies required
- Uses existing Tone.js and musical theory components

## Risk Assessment

### Low Risk
- State management updates
- Visual enhancements
- Event system additions

### Medium Risk
- Chord transposition accuracy
- Performance with large songs
- Cross-component communication

### High Risk
- Complex chord notation parsing
- Edge cases in key detection
- Maintaining backward compatibility

## Conclusion

This feature will significantly improve the user experience by making key selection intuitive and automatic. By leveraging the existing chord palette and ScaleKey components, we can implement this feature efficiently while maintaining the established architecture patterns.

The implementation should be done in phases to ensure stability and allow for iterative improvements based on user feedback.
