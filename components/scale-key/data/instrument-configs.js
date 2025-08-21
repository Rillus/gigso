/**
 * Instrument-specific configurations for scale adaptation
 */

export const INSTRUMENT_CONFIGS = {
    handPan: {
        noteCount: 8,
        defaultOctave: 4,
        noteLayout: 'circular',
        preferredScales: ['minor', 'naturalMinor', 'majorPentatonic', 'minorPentatonic', 'dorian'],
        octaveRange: [3, 5],
        noteFormatting: (note, octave) => `${note}${octave}`,
        layoutDescription: 'Circular layout with central root note'
    },
    
    fretboard: {
        noteCount: 'variable',
        defaultOctave: 'variable',
        noteLayout: 'linear',
        preferredScales: ['major', 'naturalMinor', 'minor', 'pentatonic', 'blues', 'dorian', 'mixolydian'],
        octaveRange: [2, 6],
        fretRange: [0, 24],
        stringCount: { 
            guitar: 6, 
            ukulele: 4, 
            mandolin: 4, // 4 courses (each with 2 strings)
            bass: 4 
        },
        noteFormatting: (note, octave) => `${note}${octave}`,
        layoutDescription: 'Linear fretboard with multiple strings'
    },
    
    piano: {
        noteCount: 88,
        defaultOctave: 4,
        noteLayout: 'chromatic',
        preferredScales: 'all',
        octaveRange: [0, 8],
        keyLayout: 'traditional',
        noteFormatting: (note, octave) => `${note}${octave}`,
        layoutDescription: 'Traditional piano keyboard layout'
    },
    
    gigsoKeyboard: {
        noteCount: 'variable',
        defaultOctave: 4,
        noteLayout: 'chromatic',
        preferredScales: 'all',
        octaveRange: [2, 6],
        keyLayout: 'digital',
        noteFormatting: (note, octave) => `${note}${octave}`,
        layoutDescription: 'Digital keyboard interface'
    },
    
    chordDiagram: {
        noteCount: 'variable',
        defaultOctave: 'variable',
        noteLayout: 'chord-based',
        preferredScales: ['major', 'naturalMinor', 'minor', 'dorian', 'mixolydian'],
        octaveRange: [2, 6],
        noteFormatting: (note, octave) => `${note}${octave}`,
        layoutDescription: 'Chord-based note representation'
    }
};

export const DEFAULT_INSTRUMENT = 'handPan';