import { 
    generateScaleNotes, 
    getAllKeys, 
    getAllScaleTypes, 
    validateKeyAndScale, 
    getNoteFrequency,
    getScaleInfo 
} from '../helpers/scaleUtils.js';

describe('Scale Utilities', () => {
    describe('getAllKeys', () => {
        test('should return all 12 chromatic keys', () => {
            const keys = getAllKeys();
            expect(keys).toHaveLength(12);
            expect(keys).toEqual(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']);
        });
    });

    describe('getAllScaleTypes', () => {
        test('should return all scale types', () => {
            const scales = getAllScaleTypes();
            expect(scales).toHaveLength(2);
            expect(scales).toContain('major');
            expect(scales).toContain('minor');
        });
    });

    describe('validateKeyAndScale', () => {
        test('should validate correct key and scale combinations', () => {
            expect(validateKeyAndScale('C', 'major')).toBe(true);
            expect(validateKeyAndScale('D', 'minor')).toBe(true);
            expect(validateKeyAndScale('F#', 'major')).toBe(true);
            expect(validateKeyAndScale('A#', 'minor')).toBe(true);
        });

        test('should reject invalid keys', () => {
            expect(validateKeyAndScale('H', 'major')).toBe(false);
            expect(validateKeyAndScale('X', 'minor')).toBe(false);
        });

        test('should reject invalid scales', () => {
            expect(validateKeyAndScale('C', 'pentatonic')).toBe(false);
            expect(validateKeyAndScale('D', 'blues')).toBe(false);
        });
    });

    describe('generateScaleNotes', () => {
        describe('Major Scales', () => {
            test('should generate C major scale correctly', () => {
                const notes = generateScaleNotes('C', 'major');
                expect(notes).toHaveLength(8);
                // C major: C, D, E, F, G, A, B, C# (9th) - ascending from root
                expect(notes).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'D5']);
            });

            test('should generate D major scale correctly', () => {
                const notes = generateScaleNotes('D', 'major');
                expect(notes).toHaveLength(8);
                // D major: D, E, F#, G, A, B, C#, D# (9th) - ascending from root
                expect(notes).toEqual(['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#4', 'E5']);
            });

            test('should generate F major scale correctly', () => {
                const notes = generateScaleNotes('F', 'major');
                expect(notes).toHaveLength(8);
                // F major: F, G, A, Bb, C, D, E, F# (9th) - ascending from root
                expect(notes).toEqual(['F4', 'G4', 'A4', 'A#4', 'C4', 'D4', 'E4', 'G5']);
            });

            test('should generate G major scale correctly', () => {
                const notes = generateScaleNotes('G', 'major');
                expect(notes).toHaveLength(8);
                // G major: G, A, B, C, D, E, F#, G# (9th) - ascending from root
                expect(notes).toEqual(['G4', 'A4', 'B4', 'C4', 'D4', 'E4', 'F#4', 'A5']);
            });
        });

        describe('Minor Scales', () => {
            test('should generate C minor scale correctly', () => {
                const notes = generateScaleNotes('C', 'minor');
                expect(notes).toHaveLength(8);
                // C minor: C, D, Eb, F, G, Ab, Bb, C# (9th) - ascending from root
                expect(notes).toEqual(['C4', 'D4', 'D#4', 'F4', 'G4', 'G#4', 'A#4', 'D5']);
            });

            test('should generate D minor scale correctly', () => {
                const notes = generateScaleNotes('D', 'minor');
                expect(notes).toHaveLength(8);
                // D minor: D, E, F, G, A, Bb, C, D# (9th) - ascending from root
                expect(notes).toEqual(['D4', 'E4', 'F4', 'G4', 'A4', 'A#4', 'C4', 'E5']);
            });

            test('should generate F minor scale correctly', () => {
                const notes = generateScaleNotes('F', 'minor');
                expect(notes).toHaveLength(8);
                // F minor: F, G, Ab, Bb, C, Db, Eb, F# (9th) - ascending from root
                expect(notes).toEqual(['F4', 'G4', 'G#4', 'A#4', 'C4', 'C#4', 'D#4', 'G5']);
            });

            test('should generate G minor scale correctly', () => {
                const notes = generateScaleNotes('G', 'minor');
                expect(notes).toHaveLength(8);
                // G minor: G, A, Bb, C, D, Eb, F, G# (9th) - ascending from root
                expect(notes).toEqual(['G4', 'A4', 'A#4', 'C4', 'D4', 'D#4', 'F4', 'A5']);
            });
        });

        describe('Sharp and Flat Keys', () => {
            test('should generate F# major scale correctly', () => {
                const notes = generateScaleNotes('F#', 'major');
                expect(notes).toHaveLength(8);
                // F# major: F#, G#, A#, B, C#, D#, E#, F# (9th) - ascending from root
                expect(notes).toEqual(['F#4', 'G#4', 'A#4', 'B4', 'C#4', 'D#4', 'F4', 'G#5']);
            });

            test('should generate Bb major scale correctly', () => {
                const notes = generateScaleNotes('Bb', 'major');
                expect(notes).toHaveLength(8);
                // Bb major: Bb, C, D, Eb, F, G, A, Bb (9th) - ascending from root
                expect(notes).toEqual(['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#4', 'E5']);
            });

            test('should generate C# minor scale correctly', () => {
                const notes = generateScaleNotes('C#', 'minor');
                expect(notes).toHaveLength(8);
                // C# minor: C#, D#, E, F#, G#, A, B, C# (9th) - ascending from root
                expect(notes).toEqual(['C#4', 'D#4', 'E4', 'F#4', 'G#4', 'A4', 'B4', 'D#5']);
            });
        });

        describe('No Repeated Notes', () => {
            test('should not have repeated notes in any major scale', () => {
                const keys = getAllKeys();
                keys.forEach(key => {
                    const notes = generateScaleNotes(key, 'major');
                    const noteNames = notes.map(note => note.slice(0, -1)); // Remove octave
                    const uniqueNotes = new Set(noteNames);
                    // 7 unique notes because the 9th note is the same as the 2nd note (octave higher)
                    expect(uniqueNotes.size).toBe(7);
                });
            });

            test('should not have repeated notes in any minor scale', () => {
                const keys = getAllKeys();
                keys.forEach(key => {
                    const notes = generateScaleNotes(key, 'minor');
                    const noteNames = notes.map(note => note.slice(0, -1)); // Remove octave
                    const uniqueNotes = new Set(noteNames);
                    // 7 unique notes because the 9th note is the same as the 2nd note (octave higher)
                    expect(uniqueNotes.size).toBe(7);
                });
            });
        });

        describe('Error Handling', () => {
            test('should handle invalid key gracefully', () => {
                const notes = generateScaleNotes('H', 'major');
                expect(notes).toHaveLength(8);
                // Should default to D major
                expect(notes[0]).toBe('D4');
            });

            test('should handle invalid scale gracefully', () => {
                const notes = generateScaleNotes('C', 'invalid');
                expect(notes).toHaveLength(8);
                // Should default to C minor
                expect(notes[0]).toBe('C4');
            });
        });
    });

    describe('getNoteFrequency', () => {
        test('should calculate A4 frequency correctly', () => {
            const frequency = getNoteFrequency('A4');
            expect(frequency).toBe(440);
        });

        test('should calculate C4 frequency correctly', () => {
            const frequency = getNoteFrequency('C4');
            expect(frequency).toBeCloseTo(261.63, 1);
        });

        test('should calculate D4 frequency correctly', () => {
            const frequency = getNoteFrequency('D4');
            expect(frequency).toBeCloseTo(293.66, 1);
        });

        test('should calculate sharp notes correctly', () => {
            const frequency = getNoteFrequency('C#4');
            expect(frequency).toBeCloseTo(277.18, 1);
        });
    });

    describe('getScaleInfo', () => {
        test('should return complete scale information', () => {
            const info = getScaleInfo('C', 'major');
            expect(info).toHaveProperty('key', 'C');
            expect(info).toHaveProperty('scale', 'major');
            expect(info).toHaveProperty('notes');
            expect(info).toHaveProperty('pattern');
            expect(info).toHaveProperty('displayName', 'C major');
            expect(info.notes).toHaveLength(8);
        });

        test('should return correct display name', () => {
            const info = getScaleInfo('F#', 'minor');
            expect(info.displayName).toBe('F# minor');
        });
    });
}); 