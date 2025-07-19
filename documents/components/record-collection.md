# RecordCollection

**File:** `components/record-collection/record-collection.js`  
**Purpose:** Displays and loads songs from the song library.

## Overview
The RecordCollection component provides a grid interface for browsing and loading songs from the built-in song library. It displays song buttons and dispatches events when songs are selected.

## Inputs

### Song Library Integration
- **Imports**: `song-library.js` for song data
- **Static data**: Built-in collection of example songs
- **No external inputs**: Component is self-contained

### Song Library Structure
```javascript
// From song-library.js
const songs = [
  {
    name: "Song Name",
    chords: [/* array of chord objects */],
    tempo: 120,
    timeSignature: "4/4"
  }
];
```

## Outputs

### Events Dispatched
| Event | Data | Description |
|-------|------|-------------|
| `load-song` | `{song}` | Dispatched when a song is selected |

### Song Object Structure
```javascript
{
  name: "Song Name",   // Song title
  chords: [/* array of chord objects */],
  tempo: 120,         // BPM
  timeSignature: "4/4" // Time signature
}
```

## Expected Behaviour

### Visual Display
- Displays grid of song buttons in a flex layout
- Each button shows the song name
- Buttons have hover effects for visual feedback
- Responsive grid that wraps to multiple rows

### User Interaction
- **Click**: Clicking any song button dispatches `load-song` event
- **Hover**: Visual feedback when hovering over buttons
- **Selection**: No persistent selection state (buttons reset after click)

### Song Loading
- Loads songs from the song library on initialisation
- Creates button for each song in the library
- Dispatches complete song data when selected
- Integrates with PianoRoll for song loading

## Key Methods

### `createSongButtons()`
Generates song buttons from the song library:
- Accesses songs from `songLibrary.songs`
- Creates button for each song
- Adds click event listeners
- Appends buttons to collection container

### `loadSong(song)`
Handles song selection:
- Dispatches `load-song` event with song data
- Passes complete song object to event

## Integration Patterns

### With PianoRoll
```javascript
// RecordCollection dispatches load-song event
document.body.addEventListener('load-song', (event) => {
  const song = event.detail;
  // PianoRoll receives and loads the song
  dispatchComponentEvent('piano-roll', 'load-song', song);
});
```

### With Song Library
```javascript
// Imports song data from library
import songLibrary from '../../song-library.js';

// Accesses songs for button creation
const songs = songLibrary.songs;
```

### Event Flow
1. User clicks song button
2. RecordCollection dispatches `load-song` event with song data
3. Main app receives event and forwards to PianoRoll
4. PianoRoll loads song and updates timeline

## Styling

### CSS Classes
- `.collection`: Container for song buttons
- `.song-button`: Individual song button styling
- Hover effects for interactive feedback

### Visual Design
- Light grey background (`#f9f9f9`)
- Button styling with borders and rounded corners
- Consistent spacing and typography
- Responsive grid layout

## Testing Requirements

### Core Functionality
- All song buttons render correctly
- Click events dispatch proper song data
- Song library integration works
- Event data structure is correct

### Event Handling
```javascript
test('should dispatch load-song event with correct data', () => {
  const recordCollection = document.createElement('record-collection');
  const mockHandler = jest.fn();
  
  document.body.addEventListener('load-song', mockHandler);
  
  // Click first song button
  const firstButton = recordCollection.shadowRoot.querySelector('.song-button');
  firstButton.click();
  
  expect(mockHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      detail: expect.objectContaining({
        name: expect.any(String),
        chords: expect.any(Array),
        tempo: expect.any(Number),
        timeSignature: expect.any(String)
      })
    })
  );
});
```

### Song Library Integration
```javascript
test('should create buttons for all songs in library', () => {
  const recordCollection = document.createElement('record-collection');
  document.body.appendChild(recordCollection);
  
  const songButtons = recordCollection.shadowRoot.querySelectorAll('.song-button');
  expect(songButtons.length).toBeGreaterThan(0);
});
```

### Visual Tests
- Button grid layout
- Hover effects
- Responsive design
- Typography consistency

## Performance Considerations

### Rendering
- Static song library (no dynamic loading)
- Efficient button generation
- Minimal DOM manipulation
- Lightweight event dispatching

### Event Handling
- Simple click handlers
- No complex state management
- Efficient song data passing
- Minimal memory usage

## Future Enhancements

### Planned Features
- **Song categories**: Group songs by genre, difficulty, etc.
- **Search/filter**: Find specific songs
- **Favourites**: User's preferred songs
- **Custom songs**: User-defined song library
- **Song metadata**: Additional song information

### UI Improvements
- **Song preview**: Show chord progression on hover
- **Song thumbnails**: Visual representations
- **Sorting options**: Sort by name, difficulty, etc.
- **Keyboard navigation**: Quick song selection
- **Visual indicators**: Show song difficulty or popularity

## Related Components
- **PianoRoll**: Receives songs from collection
- **Song Library**: Provides song data
- **Actions**: Could integrate with song loading 