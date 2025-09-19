import MobileUkulele from '../mobile-ukulele.js';

// Mock Tone.js
global.Tone = {
    context: {
        state: 'running'
    },
    start: jest.fn(() => Promise.resolve()),
    PolySynth: jest.fn(() => ({
        triggerAttackRelease: jest.fn(),
        connect: jest.fn(),
        toDestination: jest.fn(),
        volume: { value: 0 }
    })),
    Reverb: jest.fn(() => ({
        connect: jest.fn(),
        toDestination: jest.fn()
    })),
    PingPongDelay: jest.fn(() => ({
        connect: jest.fn(),
        toDestination: jest.fn()
    })),
    Analyser: jest.fn(() => ({
        connect: jest.fn(),
        toDestination: jest.fn(),
        getValue: jest.fn(() => new Array(256).fill(0)),
        size: 256
    }))
};

// Mock audio utilities
jest.mock('../../../helpers/audioUtils.js', () => ({
    checkToneJsStatus: jest.fn(() => ({ available: true })),
    getAudioErrorMessage: jest.fn(() => 'Audio error'),
    logAudioStatus: jest.fn()
}));

// Mock audio manager
jest.mock('../../../helpers/audioManager.js', () => ({
    default: {
        playNote: jest.fn(),
        playChord: jest.fn()
    }
}));

// Mock state
jest.mock('../../../state/state.js', () => ({
    default: {
        isKeySet: jest.fn(() => false),
        songKey: jest.fn(() => 'C'),
        songScale: jest.fn(() => 'major')
    }
}));

describe('MobileUkulele', () => {
    let mobileUkulele;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Reset DOM
        document.body.innerHTML = '';

        // Create new instance
        mobileUkulele = new MobileUkulele();
        document.body.appendChild(mobileUkulele);
    });

    afterEach(() => {
        // Clean up
        if (mobileUkulele && mobileUkulele.parentNode) {
            mobileUkulele.parentNode.removeChild(mobileUkulele);
        }
    });

    describe('Initialization', () => {
        test('should create MobileUkulele instance', () => {
            expect(mobileUkulele).toBeInstanceOf(MobileUkulele);
            expect(mobileUkulele.tagName.toLowerCase()).toBe('mobile-ukulele');
        });

        test('should initialize with default properties', () => {
            expect(mobileUkulele.tuning).toBe('standard');
            expect(mobileUkulele.size).toBe('mobile');
            expect(mobileUkulele.frets).toBe(6);
            expect(mobileUkulele.showNotes).toBe(false);
            expect(mobileUkulele.isMuted).toBe(false);
        });

        test('should have shadow DOM', () => {
            expect(mobileUkulele.shadowRoot).not.toBeNull();
        });

        test('should initialize with standard tuning strings', () => {
            expect(mobileUkulele.strings).toEqual(['A4', 'E4', 'C4', 'G4']);
        });

        test('should initialize empty pressed frets map', () => {
            expect(mobileUkulele.pressedFrets).toBeInstanceOf(Map);
            expect(mobileUkulele.pressedFrets.size).toBe(0);
        });
    });

    describe('Attributes', () => {
        test('should observe tuning, size, frets, and show-notes attributes', () => {
            expect(MobileUkulele.observedAttributes).toEqual(['tuning', 'size', 'frets', 'show-notes']);
        });

        test('should update tuning when tuning attribute changes', () => {
            mobileUkulele.setAttribute('tuning', 'low-g');
            expect(mobileUkulele.tuning).toBe('low-g');
            expect(mobileUkulele.strings).toEqual(['A4', 'E4', 'C4', 'G3']);
        });

        test('should update size when size attribute changes', () => {
            mobileUkulele.setAttribute('size', 'tablet');
            expect(mobileUkulele.size).toBe('tablet');
        });

        test('should update frets when frets attribute changes', () => {
            mobileUkulele.setAttribute('frets', '12');
            expect(mobileUkulele.frets).toBe(12);
        });

        test('should update showNotes when show-notes attribute changes', () => {
            mobileUkulele.setAttribute('show-notes', 'true');
            expect(mobileUkulele.showNotes).toBe(true);
        });

        test('should handle invalid tuning gracefully', () => {
            const originalTuning = mobileUkulele.tuning;
            mobileUkulele.setAttribute('tuning', 'invalid');
            expect(mobileUkulele.tuning).toBe(originalTuning); // Should keep original
        });
    });

    describe('Tuning Configurations', () => {
        test('should have correct standard tuning', () => {
            mobileUkulele.changeTuning('standard');
            expect(mobileUkulele.strings).toEqual(['A4', 'E4', 'C4', 'G4']);
        });

        test('should have correct low-g tuning', () => {
            mobileUkulele.changeTuning('low-g');
            expect(mobileUkulele.strings).toEqual(['A4', 'E4', 'C4', 'G3']);
        });

        test('should have correct baritone tuning', () => {
            mobileUkulele.changeTuning('baritone');
            expect(mobileUkulele.strings).toEqual(['E4', 'B3', 'G3', 'D3']);
        });

        test('should dispatch tuning-changed event when tuning changes', () => {
            const tuningChangedSpy = jest.fn();
            mobileUkulele.addEventListener('tuning-changed', tuningChangedSpy);

            mobileUkulele.changeTuning('low-g');

            expect(tuningChangedSpy).toHaveBeenCalled();
            expect(tuningChangedSpy.mock.calls[0][0].detail).toEqual({
                tuning: 'low-g',
                strings: ['A4', 'E4', 'C4', 'G3']
            });
        });
    });

    describe('Rendering', () => {
        test('should render mobile ukulele container', () => {
            const ukuleleElement = mobileUkulele.shadowRoot.querySelector('.mobile-ukulele');
            expect(ukuleleElement).not.toBeNull();
        });

        test('should render fretboard', () => {
            const fretboard = mobileUkulele.shadowRoot.querySelector('.fretboard');
            expect(fretboard).not.toBeNull();
        });

        test('should render strum area', () => {
            const strumArea = mobileUkulele.shadowRoot.querySelector('.strum-area');
            expect(strumArea).not.toBeNull();
        });

        test('should render correct number of strings', () => {
            const strings = mobileUkulele.shadowRoot.querySelectorAll('.string');
            expect(strings.length).toBe(4); // Ukulele has 4 strings
        });

        test('should render fret buttons for each string', () => {
            const fretButtons = mobileUkulele.shadowRoot.querySelectorAll('.fret-button');
            expect(fretButtons.length).toBe(4 * (mobileUkulele.frets + 1)); // 4 strings * (frets + open)
        });

        test('should render strum zones for each string', () => {
            const strumZones = mobileUkulele.shadowRoot.querySelectorAll('.strum-zone');
            expect(strumZones.length).toBe(4); // 4 strings
        });

        test('should apply size classes correctly', () => {
            mobileUkulele.setAttribute('size', 'tablet');
            const ukuleleElement = mobileUkulele.shadowRoot.querySelector('.mobile-ukulele');
            expect(ukuleleElement.classList.contains('tablet')).toBe(true);
        });

        test('should show note labels when show-notes is true', () => {
            mobileUkulele.setAttribute('show-notes', 'true');
            const noteLabels = mobileUkulele.shadowRoot.querySelectorAll('.note-label');
            expect(noteLabels.length).toBeGreaterThan(0);
        });

        test('should hide note labels when show-notes is false', () => {
            mobileUkulele.setAttribute('show-notes', 'false');
            const noteLabels = mobileUkulele.shadowRoot.querySelectorAll('.note-label');
            expect(noteLabels.length).toBe(0);
        });
    });

    describe('Note Calculation', () => {
        test('should calculate open string notes correctly', () => {
            expect(mobileUkulele.calculateNote(0, 0)).toBe('A4'); // String 1, open
            expect(mobileUkulele.calculateNote(1, 0)).toBe('E4'); // String 2, open
            expect(mobileUkulele.calculateNote(2, 0)).toBe('C4'); // String 3, open
            expect(mobileUkulele.calculateNote(3, 0)).toBe('G4'); // String 4, open
        });

        test('should calculate fretted notes correctly', () => {
            expect(mobileUkulele.calculateNote(0, 1)).toBe('A#4'); // String 1, fret 1 (A4 + 1)
            expect(mobileUkulele.calculateNote(1, 2)).toBe('F#4');  // String 2, fret 2 (E4 + 2)
            expect(mobileUkulele.calculateNote(2, 3)).toBe('D#4');  // String 3, fret 3 (C4 + 3 semitones)
            expect(mobileUkulele.calculateNote(3, 5)).toBe('C5');  // String 4, fret 5 (G4 + 5)
        });

        test('should handle octave changes correctly', () => {
            expect(mobileUkulele.calculateNote(0, 12)).toBe('A5'); // String 1, fret 12 (octave up)
            expect(mobileUkulele.calculateNote(1, 12)).toBe('E5'); // String 2, fret 12 (octave up)
        });

        test('should calculate notes correctly for different tunings', () => {
            mobileUkulele.changeTuning('low-g');
            expect(mobileUkulele.calculateNote(0, 0)).toBe('A4'); // Low G tuning - string 0 is still A4

            mobileUkulele.changeTuning('baritone');
            expect(mobileUkulele.calculateNote(0, 0)).toBe('E4'); // Baritone tuning - string 0 is E4
        });
    });

    describe('Frequency Calculation', () => {
        test('should calculate A4 frequency correctly', () => {
            const frequency = mobileUkulele.noteToFrequency('A4');
            expect(frequency).toBeCloseTo(440, 1);
        });

        test('should calculate other note frequencies correctly', () => {
            const cFreq = mobileUkulele.noteToFrequency('C4');
            expect(cFreq).toBeCloseTo(261.63, 1);

            const gFreq = mobileUkulele.noteToFrequency('G4');
            expect(gFreq).toBeCloseTo(392, 1);
        });

        test('should handle octave changes in frequency calculation', () => {
            const a4Freq = mobileUkulele.noteToFrequency('A4');
            const a5Freq = mobileUkulele.noteToFrequency('A5');
            expect(a5Freq).toBeCloseTo(a4Freq * 2, 1); // Octave doubles frequency
        });
    });

    describe('Fret Interaction', () => {
        test('should handle fret press correctly', () => {
            const fretButton = mobileUkulele.shadowRoot.querySelector('.fret-button[data-string="0"][data-fret="2"]');
            const mockEvent = new MouseEvent('mousedown');
            Object.defineProperty(mockEvent, 'target', { value: fretButton });

            const fretPressedSpy = jest.fn();
            mobileUkulele.addEventListener('fret-pressed', fretPressedSpy);

            mobileUkulele.handleFretPress(mockEvent, 0, 2);

            // Should store pressed fret
            expect(mobileUkulele.pressedFrets.get(0)).toBe(2);

            // Should add visual feedback
            expect(fretButton.classList.contains('pressed')).toBe(true);
            expect(fretButton.getAttribute('aria-pressed')).toBe('true');

            // Should dispatch event
            expect(fretPressedSpy).toHaveBeenCalled();
            expect(fretPressedSpy.mock.calls[0][0].detail).toEqual({
                string: 0,
                fret: 2,
                note: 'B4'
            });
        });

        test('should handle fret release correctly', () => {
            const fretButton = mobileUkulele.shadowRoot.querySelector('.fret-button[data-string="0"][data-fret="2"]');
            const mockEvent = new MouseEvent('mouseup');
            Object.defineProperty(mockEvent, 'target', { value: fretButton });

            // First press the fret
            mobileUkulele.handleFretPress(mockEvent, 0, 2);

            const fretReleasedSpy = jest.fn();
            mobileUkulele.addEventListener('fret-released', fretReleasedSpy);

            mobileUkulele.handleFretRelease(mockEvent, 0, 2);

            // Should remove pressed fret
            expect(mobileUkulele.pressedFrets.has(0)).toBe(false);

            // Should remove visual feedback
            expect(fretButton.classList.contains('pressed')).toBe(false);
            expect(fretButton.getAttribute('aria-pressed')).toBe('false');

            // Should dispatch event
            expect(fretReleasedSpy).toHaveBeenCalled();
        });

        test('should handle multiple fret presses for chords', () => {
            // Press multiple frets
            mobileUkulele.handleFretPress({target: {}}, 0, 2);
            mobileUkulele.handleFretPress({target: {}}, 1, 0);
            mobileUkulele.handleFretPress({target: {}}, 2, 1);
            mobileUkulele.handleFretPress({target: {}}, 3, 3);

            expect(mobileUkulele.pressedFrets.size).toBe(4);
            expect(mobileUkulele.pressedFrets.get(0)).toBe(2);
            expect(mobileUkulele.pressedFrets.get(1)).toBe(0);
            expect(mobileUkulele.pressedFrets.get(2)).toBe(1);
            expect(mobileUkulele.pressedFrets.get(3)).toBe(3);
        });
    });

    describe('Strum Interaction', () => {
        test('should handle strum correctly', async () => {
            const strumZone = mobileUkulele.shadowRoot.querySelector('.strum-zone[data-string="0"]');
            const mockEvent = new MouseEvent('mousedown');
            Object.defineProperty(mockEvent, 'target', { value: strumZone });

            const notePlayedSpy = jest.fn();
            mobileUkulele.addEventListener('note-played', notePlayedSpy);

            await mobileUkulele.handleStrum(mockEvent, 0);

            // Should add visual feedback
            expect(strumZone.classList.contains('active')).toBe(true);

            // Should dispatch note-played event
            expect(notePlayedSpy).toHaveBeenCalled();
            expect(notePlayedSpy.mock.calls[0][0].detail).toEqual({
                note: 'A4',
                string: 0,
                fret: 0,
                frequency: expect.any(Number)
            });
        });

        test('should play fretted note when fret is pressed', async () => {
            // Press a fret
            mobileUkulele.handleFretPress({target: {}}, 0, 3);

            const strumZone = mobileUkulele.shadowRoot.querySelector('.strum-zone[data-string="0"]');
            const mockEvent = new MouseEvent('mousedown');
            Object.defineProperty(mockEvent, 'target', { value: strumZone });

            const notePlayedSpy = jest.fn();
            mobileUkulele.addEventListener('note-played', notePlayedSpy);

            await mobileUkulele.handleStrum(mockEvent, 0);

            // Should play the fretted note (G4 + 3 semitones = A#4)
            expect(notePlayedSpy.mock.calls[0][0].detail.note).toBe('A#4');
            expect(notePlayedSpy.mock.calls[0][0].detail.fret).toBe(3);
        });

        test('should dispatch chord-played event for multiple pressed frets', async () => {
            // Press multiple frets (simulate a chord)
            mobileUkulele.handleFretPress({target: {}}, 0, 0);
            mobileUkulele.handleFretPress({target: {}}, 1, 0);
            mobileUkulele.handleFretPress({target: {}}, 2, 1);
            mobileUkulele.handleFretPress({target: {}}, 3, 3);

            const strumZone = mobileUkulele.shadowRoot.querySelector('.strum-zone[data-string="0"]');
            const mockEvent = new MouseEvent('mousedown');
            Object.defineProperty(mockEvent, 'target', { value: strumZone });

            const chordPlayedSpy = jest.fn();
            mobileUkulele.addEventListener('chord-played', chordPlayedSpy);

            await mobileUkulele.handleStrum(mockEvent, 0);

            // Should dispatch chord-played event
            expect(chordPlayedSpy).toHaveBeenCalled();
            expect(chordPlayedSpy.mock.calls[0][0].detail).toEqual({
                chord: expect.any(String),
                notes: expect.any(Array),
                frets: expect.any(Array)
            });
        });

        test('should not play when muted', async () => {
            mobileUkulele.isMuted = true;

            const strumZone = mobileUkulele.shadowRoot.querySelector('.strum-zone[data-string="0"]');
            const mockEvent = new MouseEvent('mousedown');
            Object.defineProperty(mockEvent, 'target', { value: strumZone });

            const notePlayedSpy = jest.fn();
            mobileUkulele.addEventListener('note-played', notePlayedSpy);

            await mobileUkulele.handleStrum(mockEvent, 0);

            // Should not dispatch note-played event when muted
            expect(notePlayedSpy).not.toHaveBeenCalled();
        });
    });

    describe('Audio Integration', () => {
        test('should create ukulele synthesiser', () => {
            expect(mobileUkulele.synth).toBeDefined();
            expect(mobileUkulele.audioEffects).toBeDefined();
        });

        test('should play note when requested', async () => {
            await mobileUkulele.playNote(0, 2, '4n');

            expect(mobileUkulele.synth.triggerAttackRelease).toHaveBeenCalledWith('A4', '4n');
        });

        test('should play chord when requested', async () => {
            const frets = [0, 0, 1, 3]; // C major chord on ukulele
            await mobileUkulele.playChord(frets, '2n');

            const expectedNotes = ['A4', 'E4', 'F4', 'C5'];
            expect(mobileUkulele.synth.triggerAttackRelease).toHaveBeenCalledWith(expectedNotes, '2n');
        });

        test('should not play when muted', async () => {
            mobileUkulele.isMuted = true;

            await mobileUkulele.playNote(0, 0, '4n');

            expect(mobileUkulele.synth.triggerAttackRelease).not.toHaveBeenCalled();
        });

        test('should debounce rapid note triggers', async () => {
            // Trigger multiple rapid calls
            await mobileUkulele.playNote(0, 0, '4n');
            await mobileUkulele.playNote(0, 0, '4n');
            await mobileUkulele.playNote(0, 0, '4n');

            // Should only call once due to debouncing
            expect(mobileUkulele.synth.triggerAttackRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('Chord Identification', () => {
        test('should identify simple chords', () => {
            expect(mobileUkulele.identifyChord(['C4', 'E4', 'G4'])).toBe('C');
            expect(mobileUkulele.identifyChord(['G4', 'B4', 'D4'])).toBe('G');
        });

        test('should handle single notes', () => {
            expect(mobileUkulele.identifyChord(['C4'])).toBe('C');
        });

        test('should handle unknown chord patterns', () => {
            expect(mobileUkulele.identifyChord(['C4', 'D4', 'F#4'])).toBe('Unknown');
        });

        test('should handle duplicate notes in different octaves', () => {
            expect(mobileUkulele.identifyChord(['C4', 'E4', 'G4', 'C5'])).toBe('C');
        });
    });

    describe('Chord Highlighting', () => {
        test('should highlight chord frets correctly', () => {
            const frets = [0, 0, 1, 3]; // Example chord
            mobileUkulele.highlightChord('C', frets);

            // Check that correct fret buttons are highlighted
            const highlightedButtons = mobileUkulele.shadowRoot.querySelectorAll('.fret-button.highlighted');
            expect(highlightedButtons.length).toBe(4); // One for each string
        });

        test('should clear existing highlights before highlighting new chord', () => {
            // Highlight first chord
            mobileUkulele.highlightChord('C', [0, 0, 1, 3]);
            let highlighted = mobileUkulele.shadowRoot.querySelectorAll('.fret-button.highlighted');
            expect(highlighted.length).toBe(4);

            // Highlight different chord
            mobileUkulele.highlightChord('G', [3, 2, 0, 3]);
            highlighted = mobileUkulele.shadowRoot.querySelectorAll('.fret-button.highlighted');
            expect(highlighted.length).toBe(4); // Should still be 4, but different buttons
        });

        test('should handle negative frets in chord highlighting', () => {
            const frets = [-1, 0, 1, 3]; // -1 means don't play that string
            mobileUkulele.highlightChord('Partial', frets);

            const highlightedButtons = mobileUkulele.shadowRoot.querySelectorAll('.fret-button.highlighted');
            expect(highlightedButtons.length).toBe(3); // Only 3 strings played
        });
    });

    describe('Touch Event Handling', () => {
        test('should handle touch start events', () => {
            const fretButton = mobileUkulele.shadowRoot.querySelector('.fret-button[data-string="0"][data-fret="1"]');
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ identifier: 0, clientX: 100, clientY: 100 }]
            });

            Object.defineProperty(touchEvent, 'target', { value: fretButton });

            const fretPressedSpy = jest.fn();
            mobileUkulele.addEventListener('fret-pressed', fretPressedSpy);

            mobileUkulele.handleFretPress(touchEvent, 0, 1);

            // Should track the touch
            expect(mobileUkulele.activeTouches.size).toBe(1);
            expect(fretPressedSpy).toHaveBeenCalled();
        });

        test('should handle touch end events', () => {
            const fretButton = mobileUkulele.shadowRoot.querySelector('.fret-button[data-string="0"][data-fret="1"]');

            // Simulate touchstart first
            const touchStartEvent = new TouchEvent('touchstart', {
                touches: [{ identifier: 0, clientX: 100, clientY: 100 }]
            });
            Object.defineProperty(touchStartEvent, 'target', { value: fretButton });
            mobileUkulele.handleFretPress(touchStartEvent, 0, 1);

            // Now simulate touchend
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{ identifier: 0 }]
            });
            Object.defineProperty(touchEndEvent, 'target', { value: fretButton });

            mobileUkulele.handleFretRelease(touchEndEvent, 0, 1);

            // Should remove the touch tracking
            expect(mobileUkulele.activeTouches.size).toBe(0);
        });

        test('should handle multiple simultaneous touches', () => {
            const fretButton1 = mobileUkulele.shadowRoot.querySelector('.fret-button[data-string="0"][data-fret="1"]');
            const fretButton2 = mobileUkulele.shadowRoot.querySelector('.fret-button[data-string="1"][data-fret="2"]');

            // Simulate multiple touches
            const touch1Event = new TouchEvent('touchstart', {
                touches: [{ identifier: 0, clientX: 100, clientY: 100 }]
            });
            const touch2Event = new TouchEvent('touchstart', {
                touches: [{ identifier: 1, clientX: 200, clientY: 100 }]
            });

            Object.defineProperty(touch1Event, 'target', { value: fretButton1 });
            Object.defineProperty(touch2Event, 'target', { value: fretButton2 });

            mobileUkulele.handleFretPress(touch1Event, 0, 1);
            mobileUkulele.handleFretPress(touch2Event, 1, 2);

            // Should track both touches
            expect(mobileUkulele.activeTouches.size).toBe(2);
            expect(mobileUkulele.pressedFrets.size).toBe(2);
        });
    });

    describe('External Events', () => {
        test('should handle set-tuning events', () => {
            const changeTuningSpy = jest.spyOn(mobileUkulele, 'changeTuning');

            const setTuningEvent = new CustomEvent('set-tuning', {
                detail: { tuning: 'baritone' }
            });

            mobileUkulele.dispatchEvent(setTuningEvent);

            expect(changeTuningSpy).toHaveBeenCalledWith('baritone');
        });

        test('should handle mute events', () => {
            const muteEvent = new CustomEvent('mute');
            mobileUkulele.dispatchEvent(muteEvent);

            expect(mobileUkulele.isMuted).toBe(true);
        });

        test('should handle unmute events', () => {
            mobileUkulele.isMuted = true;
            const unmuteEvent = new CustomEvent('unmute');
            mobileUkulele.dispatchEvent(unmuteEvent);

            expect(mobileUkulele.isMuted).toBe(false);
        });

        test('should handle highlight-chord events', () => {
            const highlightChordSpy = jest.spyOn(mobileUkulele, 'highlightChord');

            const highlightEvent = new CustomEvent('highlight-chord', {
                detail: { chord: 'C', frets: [0, 0, 1, 3] }
            });

            mobileUkulele.dispatchEvent(highlightEvent);

            expect(highlightChordSpy).toHaveBeenCalledWith('C', [0, 0, 1, 3]);
        });
    });

    describe('Accessibility', () => {
        test('should have proper ARIA attributes on fret buttons', () => {
            const fretButtons = mobileUkulele.shadowRoot.querySelectorAll('.fret-button');

            fretButtons.forEach(button => {
                expect(button.getAttribute('role')).toBe('button');
                expect(button.getAttribute('tabindex')).toBe('0');
                expect(button.getAttribute('aria-label')).toContain('Play');
                expect(button.getAttribute('aria-pressed')).toBe('false');
            });
        });

        test('should have proper ARIA attributes on strum zones', () => {
            const strumZones = mobileUkulele.shadowRoot.querySelectorAll('.strum-zone');

            strumZones.forEach(zone => {
                expect(zone.getAttribute('role')).toBe('button');
                expect(zone.getAttribute('tabindex')).toBe('0');
                expect(zone.getAttribute('aria-label')).toContain('Strum');
            });
        });

        test('should update aria-pressed on fret button activation', () => {
            const fretButton = mobileUkulele.shadowRoot.querySelector('.fret-button[data-string="0"][data-fret="1"]');
            const mockEvent = new MouseEvent('mousedown');
            Object.defineProperty(mockEvent, 'target', { value: fretButton });

            mobileUkulele.handleFretPress(mockEvent, 0, 1);

            expect(fretButton.getAttribute('aria-pressed')).toBe('true');

            mobileUkulele.handleFretRelease(mockEvent, 0, 1);

            expect(fretButton.getAttribute('aria-pressed')).toBe('false');
        });
    });

    describe('Cleanup', () => {
        test('should cleanup properly when disconnected', () => {
            const stopLevelMonitoringSpy = jest.spyOn(mobileUkulele, 'stopLevelMonitoring');
            const cleanupSpy = jest.spyOn(mobileUkulele, 'cleanup');

            mobileUkulele.disconnectedCallback();

            expect(stopLevelMonitoringSpy).toHaveBeenCalled();
            expect(cleanupSpy).toHaveBeenCalled();
        });

        test('should clear pressed frets and active touches on cleanup', () => {
            // Add some pressed frets and active touches
            mobileUkulele.pressedFrets.set(0, 2);
            mobileUkulele.pressedFrets.set(1, 1);
            mobileUkulele.activeTouches.set('touch1', { type: 'fret', string: 0, fret: 2 });

            mobileUkulele.cleanup();

            expect(mobileUkulele.pressedFrets.size).toBe(0);
            expect(mobileUkulele.activeTouches.size).toBe(0);
        });

        test('should dispose audio effects on cleanup', () => {
            const mockEffect = { dispose: jest.fn() };
            mobileUkulele.audioEffects = { reverb: mockEffect, delay: mockEffect };

            mobileUkulele.cleanup();

            expect(mockEffect.dispose).toHaveBeenCalledTimes(2);
        });
    });

    describe('Error Handling', () => {
        test('should handle missing synth gracefully', async () => {
            mobileUkulele.synth = null;

            // Should not throw error
            await expect(mobileUkulele.playNote(0, 0, '4n')).resolves.toBeUndefined();
        });

        test('should handle invalid note calculations gracefully', () => {
            // Test with invalid string index
            const note = mobileUkulele.calculateNote(10, 0);
            expect(note).toBe('undefined');
        });

        test('should handle audio context errors gracefully', async () => {
            // Mock audio context failure
            global.Tone.context.state = 'suspended';
            global.Tone.start = jest.fn(() => Promise.reject(new Error('Audio context error')));

            const result = await mobileUkulele.ensureAudioContextRunning();

            expect(result).toBe(false);
        });
    });

    describe('Responsive Design', () => {
        test('should apply mobile size class correctly', () => {
            mobileUkulele.setAttribute('size', 'mobile');
            const ukuleleElement = mobileUkulele.shadowRoot.querySelector('.mobile-ukulele');
            expect(ukuleleElement.classList.contains('mobile')).toBe(true);
        });

        test('should apply tablet size class correctly', () => {
            mobileUkulele.setAttribute('size', 'tablet');
            const ukuleleElement = mobileUkulele.shadowRoot.querySelector('.mobile-ukulele');
            expect(ukuleleElement.classList.contains('tablet')).toBe(true);
        });

        test('should apply desktop size class correctly', () => {
            mobileUkulele.setAttribute('size', 'desktop');
            const ukuleleElement = mobileUkulele.shadowRoot.querySelector('.mobile-ukulele');
            expect(ukuleleElement.classList.contains('desktop')).toBe(true);
        });
    });
});