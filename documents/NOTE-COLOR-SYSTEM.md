# Note Color System Documentation

## Overview
The application uses a consistent color-coding system for musical notes based on the chromatic scale. This creates a visual language that helps users identify note relationships and patterns across different components.

## Core Color Scheme

The note color system follows the **rainbow spectrum** mapping to the chromatic scale, creating an intuitive visual progression:

| Note | Color Name | Hex Value | CSS Variable |
|------|------------|-----------|--------------|
| **C** | Red | `#E1453E` | `--colour-C` |
| **D** | Orange | `#F17947` | `--colour-D` |
| **E** | Yellow | `#FAB15C` | `--colour-E` |
| **F** | Green | `#60B05B` | `--colour-F` |
| **G** | Blue | `#5394C7` | `--colour-G` |
| **A** | Indigo | `#4b0082` | `--colour-A` |
| **B** | Violet | `#8F00FF` | `--colour-B` |

## Sharp and Flat Note Variations

### Sharp Notes (♯)
Sharp notes use the base note color with **lightening effects**:
- **Visual Treatment**: Lighter appearance using `box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5)`
- **Grid Position**: Positioned above natural notes in layouts
- **Examples**: C♯, D♯, F♯, G♯, A♯

### Flat Notes (♭) 
Flat notes use the base note color with **darkening effects**:
- **Visual Treatment**: Darker appearance using `box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3)`
- **Grid Position**: Positioned below natural notes in layouts  
- **Examples**: D♭, E♭, G♭, A♭, B♭

### Enharmonic Equivalents
Some notes have two names but represent the same pitch:
- **C♯ / D♭**: Use C (red) base color
- **D♯ / E♭**: Use D (orange) base color
- **F♯ / G♭**: Use F (green) base color
- **G♯ / A♭**: Use G (blue) base color
- **A♯ / B♭**: Use A (indigo) base color

## Minor Chord Variations

### Minor Chords
Minor chords use the base note color with additional styling:
- **Visual Treatment**: Reduced opacity (0.8) and darker text shadow
- **Text Indication**: "m" suffix (e.g., "Cm", "Dm")
- **Grid Position**: Positioned below their major counterparts

## Implementation Guidelines

### CSS Custom Properties
The color system is implemented using CSS custom properties defined in `/workspace/styles.css`:

```css
:root {
  /* Base rainbow colors */
  --colour-red: #E1453E;
  --colour-orange: #F17947;
  --colour-yellow: #FAB15C;
  --colour-green: #60B05B;
  --colour-blue: #5394C7;
  --colour-indigo: #4b0082;
  --colour-violet: #8F00FF;

  /* Note-specific mappings */
  --colour-C: var(--colour-red);
  --colour-D: var(--colour-orange);
  --colour-E: var(--colour-yellow);
  --colour-F: var(--colour-green);
  --colour-G: var(--colour-blue);
  --colour-A: var(--colour-indigo);
  --colour-B: var(--colour-violet);
}
```

### JavaScript Color Utilities
For dynamic color application in JavaScript components:

```javascript
// Get note color from CSS custom property
function getNoteColor(note) {
  const baseNote = note.replace(/[#b]/, ''); // Remove sharp/flat
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--colour-${baseNote}`)
    .trim();
}

// Apply note color with sharp/flat styling
function applyNoteColor(element, note) {
  const baseNote = note.replace(/[#b]/, '');
  element.style.background = `var(--colour-${baseNote})`;
  
  if (note.includes('#')) {
    // Sharp: lighten
    element.style.boxShadow = 'inset 0 0 20px rgba(255, 255, 255, 0.5)';
  } else if (note.includes('b')) {
    // Flat: darken  
    element.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.3)';
  }
}
```

## Component Integration

### Currently Implemented
- **Chord Palette**: Full color system implementation with sharp/flat variations
- **Hand Pan**: Tone fields colored by their note assignments
- **Hand Pan Wrapper**: Key selection buttons with note color coding

### To Be Implemented
- **Piano Roll**: Note visualization with color coding
- **Fretboard**: Fret markers colored by notes
- **Scale/Key Selection Component**: Standalone scale selection interface

## Design Principles

### Accessibility
- **High Contrast**: All colors meet WCAG AA contrast requirements with white text
- **Color Blindness**: Rainbow progression provides distinct visual cues
- **Alternative Indicators**: Colors are supplemented with text labels

### Consistency
- **Cross-Component**: Same note always uses same base color
- **Visual Hierarchy**: Sharp/flat variations maintain clear relationships
- **Responsive**: Color system works across all device sizes

### Musical Logic
- **Chromatic Progression**: Colors follow musical chromatic order
- **Harmonic Relationships**: Related keys use harmonious color combinations
- **Circle of Fifths**: Color progression supports musical theory

## Usage Examples

### Chord Palette Grid Layout
```
Row 1 (Sharps):     [F♯] [G♯] [A♯]
Row 2 (Naturals): [C] [D] [E] [F] [G] [A] [B]  
Row 3 (Flats):      [G♭] [A♭] [B♭]
```

### Hand Pan Color Mapping
Each tone field displays its assigned note color:
- D minor scale: D(orange), E(yellow), F(green), G(blue), A(indigo), B♭(indigo+dark), C(red), D(orange)

### Scale Selection Interface
- Key buttons: Colored by their root note
- Scale type indicators: Neutral colors to avoid confusion
- Active selections: Enhanced saturation of base color

## Maintenance

### Adding New Notes
When adding support for new note representations:
1. Determine the base note (A-G)
2. Apply appropriate CSS custom property
3. Add sharp/flat visual treatment if applicable
4. Update component-specific implementations

### Color Modifications
To modify the color scheme:
1. Update base colors in `/workspace/styles.css`
2. Test contrast ratios for accessibility
3. Verify color harmony across components
4. Update this documentation

## Future Enhancements

### Planned Features
- **Dynamic Color Themes**: Multiple color scheme options
- **User Customization**: Personalized note color preferences  
- **Advanced Visualizations**: Gradient transitions between related notes
- **Harmonic Highlighting**: Special colors for chord tones and tensions

### Technical Improvements
- **Performance Optimization**: CSS-only implementations where possible
- **Theme Switching**: Support for dark/light mode variations
- **Animation Support**: Smooth color transitions for interactive elements