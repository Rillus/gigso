import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import ChordChartParser from '../chord-chart-parser.js';

describe('ChordChartParser Component', () => {
    let parser;

    beforeEach(() => {
        document.body.innerHTML = '';
        parser = document.createElement('chord-chart-parser');
        document.body.appendChild(parser);
    });

    afterEach(() => {
        if (parser && parser.parentNode) {
            parser.parentNode.removeChild(parser);
        }
    });

    describe('Initialization', () => {
        test('should render parser interface', () => {
            const inputSection = parser.shadowRoot.querySelector('.input-section');
            const outputSection = parser.shadowRoot.querySelector('.output-section');
            const textarea = parser.shadowRoot.getElementById('chord-chart-input');
            
            expect(inputSection).toBeTruthy();
            expect(outputSection).toBeTruthy();
            expect(textarea).toBeTruthy();
        });

        test('should render metadata input fields', () => {
            const titleInput = parser.shadowRoot.getElementById('song-title');
            const artistInput = parser.shadowRoot.getElementById('artist');
            const keyInput = parser.shadowRoot.getElementById('key');
            const difficultySelect = parser.shadowRoot.getElementById('difficulty');
            const genreInput = parser.shadowRoot.getElementById('genre');
            const tempoInput = parser.shadowRoot.getElementById('tempo');
            
            expect(titleInput).toBeTruthy();
            expect(artistInput).toBeTruthy();
            expect(keyInput).toBeTruthy();
            expect(difficultySelect).toBeTruthy();
            expect(genreInput).toBeTruthy();
            expect(tempoInput).toBeTruthy();
        });

        test('should render control buttons', () => {
            const parseBtn = parser.shadowRoot.getElementById('parse-btn');
            const clearBtn = parser.shadowRoot.getElementById('clear-btn');
            const copyBtn = parser.shadowRoot.getElementById('copy-json');
            
            expect(parseBtn).toBeTruthy();
            expect(clearBtn).toBeTruthy();
            expect(copyBtn).toBeTruthy();
        });
    });

    describe('Chord Detection', () => {
        test('should detect chord lines correctly', () => {
            expect(parser.isChordLine('C    G    Am   F')).toBe(true);
            expect(parser.isChordLine('Am      F       C       G')).toBe(true);
            expect(parser.isChordLine('G7sus4 C#dim')).toBe(true);
            expect(parser.isChordLine('This is just lyrics')).toBe(false);
            expect(parser.isChordLine('Some lyrics with no chords')).toBe(false);
        });

        test('should handle complex chord notation', () => {
            expect(parser.isChordLine('Cmaj7 F#dim Bbsus2 D7')).toBe(true);
            expect(parser.isChordLine('C#m7b5 Fadd9')).toBe(true);
            expect(parser.isChordLine('D/F# G/B')).toBe(false); // Slash chords not in basic pattern
        });
    });

    describe('Chord Line Conversion', () => {
        test('should convert chord-only lines', () => {
            const input = 'C    G    Am   F';
            const result = parser.convertChordOnlyLine(input);
            expect(result).toBe('{C}    {G}    {Am}   {F}');
        });

        test('should handle mixed content in chord lines', () => {
            const input = 'C major  G  Am  F';
            const result = parser.convertChordOnlyLine(input);
            expect(result).toBe('{C} major  {G}  {Am}  {F}');
        });
    });

    describe('Chord and Lyric Merging', () => {
        test('should merge chord and lyric lines correctly', () => {
            const chordLine = 'C       G       Am      F';
            const lyricLine = 'Amazing grace how sweet the sound';
            const result = parser.mergeChordAndLyricLine(chordLine, lyricLine);
            
            expect(result).toContain('{C}');
            expect(result).toContain('{G}');
            expect(result).toContain('{Am}');
            expect(result).toContain('{F}');
            expect(result).toContain('Amazing');
            expect(result).toContain('grace');
        });

        test('should handle chords at different positions', () => {
            const chordLine = 'C               F';
            const lyricLine = 'Hello           world';
            const result = parser.mergeChordAndLyricLine(chordLine, lyricLine);
            
            expect(result.indexOf('{C}')).toBeLessThan(result.indexOf('{F}'));
        });
    });

    describe('Chord Progression Extraction', () => {
        test('should extract unique chords in order', () => {
            const input = `C  G  Am F
                          C  G  F  G
                          Am F  C  G`;
            const progression = parser.extractChordProgression(input);
            
            expect(progression).toEqual(['C', 'G', 'Am', 'F']);
        });

        test('should handle complex chord types', () => {
            const input = 'Cmaj7 F#dim Gsus4 Am7';
            const progression = parser.extractChordProgression(input);
            
            expect(progression).toContain('Cmaj7');
            expect(progression).toContain('F#dim');
            expect(progression).toContain('Gsus4');
            expect(progression).toContain('Am7');
        });
    });

    describe('Full Chart Parsing', () => {
        test('should parse complete chord chart', () => {
            const input = `[Verse 1]
C       G       Am      F
Amazing grace how sweet the sound
C       G       F       G
That saved a wretch like me

[Chorus]
C       F       G       Am
I once was lost but now am found`;

            const textarea = parser.shadowRoot.getElementById('chord-chart-input');
            textarea.value = input;
            
            parser.parseChordChart();
            
            const output = parser.shadowRoot.getElementById('parsed-output').value;
            expect(output).toContain('[Verse 1]');
            expect(output).toContain('[Chorus]');
            expect(output).toContain('{C}');
            expect(output).toContain('Amazing');
        });

        test('should handle empty input gracefully', () => {
            const textarea = parser.shadowRoot.getElementById('chord-chart-input');
            textarea.value = '';
            
            parser.parseChordChart();
            
            const output = parser.shadowRoot.getElementById('parsed-output').value;
            expect(output).toBe('');
        });
    });

    describe('Song Object Generation', () => {
        test('should generate valid song object', () => {
            // Set up metadata
            parser.shadowRoot.getElementById('song-title').value = 'Test Song';
            parser.shadowRoot.getElementById('artist').value = 'Test Artist';
            parser.shadowRoot.getElementById('key').value = 'G';
            parser.shadowRoot.getElementById('difficulty').value = 'intermediate';
            parser.shadowRoot.getElementById('genre').value = 'folk';
            parser.shadowRoot.getElementById('tempo').value = '140';
            
            const lyrics = 'Test lyrics with {G} chord';
            const chordProgression = ['G', 'C', 'D'];
            
            const songObj = parser.generateSongObject(lyrics, chordProgression);
            
            expect(songObj.title).toBe('Test Song');
            expect(songObj.artist).toBe('Test Artist');
            expect(songObj.key).toBe('G');
            expect(songObj.difficulty).toBe('intermediate');
            expect(songObj.genre).toBe('folk');
            expect(songObj.tempo).toBe(140);
            expect(songObj.chordProgression).toEqual(['G', 'C', 'D']);
            expect(songObj.lyrics).toBe('Test lyrics with {G} chord');
        });

        test('should generate ID from title', () => {
            parser.shadowRoot.getElementById('song-title').value = 'Amazing Grace!';
            
            const songObj = parser.generateSongObject('test lyrics', ['C']);
            expect(songObj.id).toBe('amazing-grace');
        });

        test('should use default values for empty fields', () => {
            const songObj = parser.generateSongObject('test lyrics', ['C']);
            
            expect(songObj.title).toBe('Untitled Song');
            expect(songObj.artist).toBe('Unknown Artist');
            expect(songObj.key).toBe('C');
            expect(songObj.difficulty).toBe('beginner');
            expect(songObj.genre).toBe('folk');
            expect(songObj.tempo).toBe(120);
        });
    });

    describe('User Interactions', () => {
        test('should parse on button click', () => {
            const textarea = parser.shadowRoot.getElementById('chord-chart-input');
            const parseBtn = parser.shadowRoot.getElementById('parse-btn');
            
            textarea.value = 'C G Am F\nTest lyrics here';
            fireEvent.click(parseBtn);
            
            const output = parser.shadowRoot.getElementById('parsed-output').value;
            expect(output).toContain('{C}');
        });

        test('should clear all inputs', () => {
            // Set some values
            parser.shadowRoot.getElementById('chord-chart-input').value = 'test';
            parser.shadowRoot.getElementById('song-title').value = 'test';
            parser.shadowRoot.getElementById('parsed-output').value = 'test';
            
            const clearBtn = parser.shadowRoot.getElementById('clear-btn');
            fireEvent.click(clearBtn);
            
            expect(parser.shadowRoot.getElementById('chord-chart-input').value).toBe('');
            expect(parser.shadowRoot.getElementById('song-title').value).toBe('');
            expect(parser.shadowRoot.getElementById('parsed-output').value).toBe('');
        });

        test('should handle copy JSON functionality', async () => {
            // Mock clipboard API
            const mockWriteText = jest.fn(() => Promise.resolve());
            Object.assign(navigator, {
                clipboard: {
                    writeText: mockWriteText
                }
            });

            parser.shadowRoot.getElementById('json-output').value = '{"test": "data"}';
            
            const copyBtn = parser.shadowRoot.getElementById('copy-json');
            await parser.copyJson();
            
            expect(mockWriteText).toHaveBeenCalledWith('{"test": "data"}');
        });

        test('should provide visual feedback on copy', async () => {
            // Mock clipboard API
            Object.assign(navigator, {
                clipboard: {
                    writeText: jest.fn(() => Promise.resolve())
                }
            });

            parser.shadowRoot.getElementById('json-output').value = '{"test": "data"}';
            
            const copyBtn = parser.shadowRoot.getElementById('copy-json');
            const originalText = copyBtn.textContent;
            
            await parser.copyJson();
            
            expect(copyBtn.textContent).toBe('Copied!');
            expect(copyBtn.style.background).toBe('rgb(40, 167, 69)');
        });
    });

    describe('Edge Cases', () => {
        test('should handle malformed chord charts', () => {
            const input = `Random text
                          More random text
                          [Section Header`;
            
            expect(() => {
                parser.convertToUkuleleFormat(input);
            }).not.toThrow();
        });

        test('should handle chord charts with no chords', () => {
            const input = `Just some lyrics
                          Without any chords
                          At all`;
            
            const result = parser.convertToUkuleleFormat(input);
            expect(result).toContain('Just some lyrics');
            expect(result).not.toContain('{');
        });

        test('should handle chord charts with only chords', () => {
            const input = `C G Am F
                          G Am F C`;
            
            const result = parser.convertToUkuleleFormat(input);
            expect(result).toContain('{C}');
            expect(result).toContain('{G}');
            expect(result).toContain('{Am}');
            expect(result).toContain('{F}');
        });
    });

    describe('Responsive Design', () => {
        test('should have responsive styles', () => {
            const styles = parser.shadowRoot.querySelector('style');
            expect(styles.textContent).toContain('@media (max-width: 900px)');
            expect(styles.textContent).toContain('grid-template-columns: 1fr');
        });
    });
});