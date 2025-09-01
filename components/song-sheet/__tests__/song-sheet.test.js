// Mock dependencies - must be before imports
jest.mock('../../../ukulele-song-library.js', () => ({
    songs: [
        {
            id: 'test-song',
            title: 'Test Song',
            artist: 'Test Artist',
            key: 'C',
            difficulty: 'beginner',
            genre: 'folk',
            tempo: 120,
            chordProgression: ['C', 'G', 'Am', 'F'],
            strummingPattern: 'D-D-U-U-D-U',
            lyrics: `[Verse 1]
{C}Amazing {G}grace how {Am}sweet the {F}sound
{C}That saved a {G}wretch like {F}me

[Chorus]
{C}I once was {F}lost but {G}now am {Am}found`
        }
    ]
}));

jest.mock('../../../chord-library.js', () => ({
    chords: {
        'C': {
            ukulele: {
                frets: [0, 0, 0, 3],
                fingers: [0, 0, 0, 3],
                difficulty: 1,
                positions: [0, 0, 0, 3]
            }
        },
        'G': {
            ukulele: {
                frets: [0, 2, 3, 2],
                fingers: [0, 1, 3, 2],
                difficulty: 2,
                positions: [0, 2, 3, 2]
            }
        },
        'Am': {
            ukulele: {
                frets: [2, 0, 0, 0],
                fingers: [2, 0, 0, 0],
                difficulty: 1,
                positions: [2, 0, 0, 0]
            }
        },
        'F': {
            ukulele: {
                frets: [2, 0, 1, 0],
                fingers: [2, 0, 1, 0],
                difficulty: 2,
                positions: [2, 0, 1, 0]
            }
        }
    }
}));

jest.mock('../../chord-diagram/chord-diagram.js', () => ({}));

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import SongSheet from '../song-sheet.js';

describe('SongSheet Component', () => {
    let songSheet;

    beforeEach(() => {
        // Mock window.print
        window.print = jest.fn();
        
        // Mock document.fullscreenElement and related APIs
        Object.defineProperty(document, 'fullscreenElement', {
            writable: true,
            value: null
        });
        document.requestFullscreen = jest.fn();
        document.exitFullscreen = jest.fn();
        
        // Mock Element.prototype.requestFullscreen
        HTMLElement.prototype.requestFullscreen = jest.fn(() => Promise.resolve());
        
        // Mock navigator.share
        navigator.share = jest.fn(() => Promise.resolve());

        document.body.innerHTML = '';
        songSheet = document.createElement('song-sheet');
        document.body.appendChild(songSheet);
    });

    afterEach(() => {
        if (songSheet && songSheet.parentNode) {
            songSheet.parentNode.removeChild(songSheet);
        }
    });

    describe('Initialization', () => {
        test('should render song sheet structure', () => {
            const container = songSheet.shadowRoot.querySelector('.song-sheet-container');
            const header = songSheet.shadowRoot.querySelector('.sheet-header');
            const content = songSheet.shadowRoot.getElementById('song-content');
            const sidebar = songSheet.shadowRoot.getElementById('chord-sidebar');
            
            expect(container).toBeTruthy();
            expect(header).toBeTruthy();
            expect(content).toBeTruthy();
            expect(sidebar).toBeTruthy();
        });

        test('should render control buttons', () => {
            const backBtn = songSheet.shadowRoot.getElementById('back-search');
            const shareBtn = songSheet.shadowRoot.getElementById('share-btn');
            const printBtn = songSheet.shadowRoot.getElementById('print-btn');
            const fullscreenBtn = songSheet.shadowRoot.getElementById('fullscreen-btn');
            
            expect(backBtn).toBeTruthy();
            expect(shareBtn).toBeTruthy();
            expect(printBtn).toBeTruthy();
            expect(fullscreenBtn).toBeTruthy();
        });
    });

    describe('Song Loading', () => {
        test('should load song by ID', () => {
            songSheet.loadSong('test-song');
            
            expect(songSheet.currentSong).toBeTruthy();
            expect(songSheet.currentSong.title).toBe('Test Song');
            expect(songSheet.currentSong.artist).toBe('Test Artist');
        });

        test('should handle non-existent song ID', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            songSheet.loadSong('non-existent');
            
            expect(consoleSpy).toHaveBeenCalledWith('Song not found:', 'non-existent');
            expect(songSheet.currentSong).toBe(null);
            
            consoleSpy.mockRestore();
        });

        test('should load song via song-id attribute', () => {
            songSheet.setAttribute('song-id', 'test-song');
            
            expect(songSheet.currentSong).toBeTruthy();
            expect(songSheet.currentSong.id).toBe('test-song');
        });
    });

    describe('Song Rendering', () => {
        beforeEach(() => {
            songSheet.loadSong('test-song');
        });

        test('should render song metadata', () => {
            const content = songSheet.shadowRoot.getElementById('song-content');
            
            expect(content.innerHTML).toContain('Test Song');
            expect(content.innerHTML).toContain('Test Artist');
            expect(content.innerHTML).toContain('Key: C');
            expect(content.innerHTML).toContain('beginner');
        });

        test('should render song sections', () => {
            const content = songSheet.shadowRoot.getElementById('song-content');
            
            expect(content.innerHTML).toContain('Verse 1');
            expect(content.innerHTML).toContain('Chorus');
        });

        test('should render strumming pattern', () => {
            const content = songSheet.shadowRoot.getElementById('song-content');
            expect(content.innerHTML).toContain('D-D-U-U-D-U');
        });

        test('should generate chord diagrams in sidebar', () => {
            const sidebar = songSheet.shadowRoot.getElementById('chord-sidebar');
            const chordElements = sidebar.querySelectorAll('.chord-diagram-wrapper');
            
            expect(chordElements.length).toBeGreaterThan(0);
        });
    });

    describe('Chord Processing', () => {
        test('should extract chords from lyrics', () => {
            const lyrics = '{C}Amazing {G}grace how {Am}sweet the {F}sound';
            const chords = songSheet.extractChordsFromLyrics(lyrics);
            
            expect(chords).toEqual(['C', 'G', 'Am', 'F']);
        });

        test('should handle duplicate chords', () => {
            const lyrics = '{C}Test {G}lyrics {C}with {G}repeats';
            const chords = songSheet.extractChordsFromLyrics(lyrics);
            
            expect(chords).toEqual(['C', 'G']);
        });

        test('should convert inline chords to positioned chords', () => {
            const input = 'Amazing {C}grace how {G}sweet';
            const result = songSheet.convertInlineChordsToPositioned(input);
            
            expect(result).toContain('<span class="chord-above');
            expect(result).toContain('Amazing');
            expect(result).toContain('grace');
        });
    });

    describe('User Interactions', () => {
        test('should handle back button click', () => {
            const eventSpy = jest.fn();
            songSheet.addEventListener('navigate-back', eventSpy);
            
            const backBtn = songSheet.shadowRoot.getElementById('back-search');
            fireEvent.click(backBtn);
            
            expect(eventSpy).toHaveBeenCalled();
            expect(eventSpy.mock.calls[0][0].detail.to).toBe('search');
        });

        test('should handle print button click', () => {
            const printBtn = songSheet.shadowRoot.getElementById('print-btn');
            fireEvent.click(printBtn);
            
            expect(window.print).toHaveBeenCalled();
        });

        test('should handle fullscreen toggle', () => {
            const fullscreenBtn = songSheet.shadowRoot.getElementById('fullscreen-btn');
            
            // Test entering fullscreen
            fireEvent.click(fullscreenBtn);
            expect(HTMLElement.prototype.requestFullscreen).toHaveBeenCalled();
            
            // Mock being in fullscreen
            Object.defineProperty(document, 'fullscreenElement', {
                writable: true,
                value: songSheet
            });
            
            // Test exiting fullscreen
            fireEvent.click(fullscreenBtn);
            expect(document.exitFullscreen).toHaveBeenCalled();
        });

        test('should handle share button click', async () => {
            const shareBtn = songSheet.shadowRoot.getElementById('share-btn');
            songSheet.loadSong('test-song');
            
            await songSheet.shareSheet();
            
            expect(navigator.share).toHaveBeenCalledWith({
                title: 'Test Song - Ukulele Song Sheet',
                text: 'Check out this ukulele song sheet for "Test Song" by Test Artist',
                url: expect.stringContaining('test-song')
            });
        });
    });

    describe('Print Functionality', () => {
        test('should have print-specific styles', () => {
            const styles = songSheet.shadowRoot.querySelector('style');
            expect(styles.textContent).toContain('@media print');
            expect(styles.textContent).toContain('.no-print');
            expect(styles.textContent).toContain('.print-only');
        });

        test('should optimize layout for printing', () => {
            const styles = songSheet.shadowRoot.querySelector('style');
            expect(styles.textContent).toContain('page-break-inside: avoid');
            expect(styles.textContent).toContain('-webkit-print-color-adjust: exact');
        });
    });

    describe('Section Processing', () => {
        test('should identify song sections correctly', () => {
            expect(songSheet.getSectionType('[Verse 1]')).toBe('verse');
            expect(songSheet.getSectionType('[Chorus]')).toBe('chorus');
            expect(songSheet.getSectionType('[Bridge]')).toBe('bridge');
            expect(songSheet.getSectionType('[Intro]')).toBe('intro');
            expect(songSheet.getSectionType('[Outro]')).toBe('outro');
        });

        test('should handle custom section labels', () => {
            expect(songSheet.getSectionType('[Pre-Chorus]')).toBe('pre-chorus');
            expect(songSheet.getSectionType('[Instrumental]')).toBe('other');
        });
    });

    describe('Responsive Design', () => {
        test('should have mobile responsive styles', () => {
            const styles = songSheet.shadowRoot.querySelector('style');
            expect(styles.textContent).toContain('@media (max-width: 768px)');
            expect(styles.textContent).toContain('flex-direction: column');
        });
    });

    describe('Error Handling', () => {
        test('should handle missing chord data gracefully', () => {
            const lyrics = '{X}Unknown {Y}chords';
            
            expect(() => {
                songSheet.extractChordsFromLyrics(lyrics);
            }).not.toThrow();
        });

        test('should handle empty song gracefully', () => {
            songSheet.currentSong = null;
            
            expect(() => {
                songSheet.renderSong();
            }).not.toThrow();
        });
    });

    describe('URL Generation', () => {
        test('should generate shareable URL', () => {
            songSheet.loadSong('test-song');
            const url = songSheet.generateShareableUrl();
            
            expect(url).toContain('test-song');
            expect(url).toContain('unclelele.html');
        });
    });
});