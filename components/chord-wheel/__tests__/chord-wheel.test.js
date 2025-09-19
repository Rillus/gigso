import ChordWheel from '../chord-wheel.js';

// Mock Tone.js
global.Tone = {
    context: {
        state: 'running'
    },
    start: jest.fn(() => Promise.resolve()),
    Synth: jest.fn(() => ({
        triggerAttackRelease: jest.fn(),
        connect: jest.fn(),
        toDestination: jest.fn(),
        volume: { value: 0 }
    })),
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

describe('ChordWheel', () => {
    let chordWheel;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Reset DOM
        document.body.innerHTML = '';

        // Create new instance
        chordWheel = new ChordWheel();
        document.body.appendChild(chordWheel);
    });

    afterEach(() => {
        // Clean up
        if (chordWheel && chordWheel.parentNode) {
            chordWheel.parentNode.removeChild(chordWheel);
        }
    });

    describe('Initialization', () => {
        test('should create ChordWheel instance', () => {
            expect(chordWheel).toBeInstanceOf(ChordWheel);
            expect(chordWheel.tagName.toLowerCase()).toBe('chord-wheel');
        });

        test('should initialize with default properties', () => {
            expect(chordWheel.currentKey).toBe('C');
            expect(chordWheel.currentScale).toBe('major');
            expect(chordWheel.currentMode).toBe('circle-of-fifths');
            expect(chordWheel.isMuted).toBe(false);
            expect(Array.isArray(chordWheel.chords)).toBe(true);
        });

        test('should have shadow DOM', () => {
            expect(chordWheel.shadowRoot).not.toBeNull();
        });

        test('should generate initial chords', () => {
            expect(chordWheel.chords.length).toBeGreaterThan(0);
        });
    });

    describe('Attributes', () => {
        test('should observe key, scale, size, and mode attributes', () => {
            expect(ChordWheel.observedAttributes).toEqual(['key', 'scale', 'size', 'mode']);
        });

        test('should update key and scale when attributes change', () => {
            chordWheel.setAttribute('key', 'G');
            chordWheel.setAttribute('scale', 'minor');

            expect(chordWheel.currentKey).toBe('G');
            expect(chordWheel.currentScale).toBe('minor');
        });

        test('should update mode when mode attribute changes', () => {
            chordWheel.setAttribute('mode', 'diatonic');

            expect(chordWheel.currentMode).toBe('diatonic');
        });

        test('should validate invalid keys and use default', () => {
            chordWheel.setAttribute('key', 'X'); // Invalid key

            expect(chordWheel.currentKey).toBe('C'); // Should default to C
        });

        test('should validate invalid scales and use default', () => {
            chordWheel.setAttribute('scale', 'invalid'); // Invalid scale

            expect(chordWheel.currentScale).toBe('major'); // Should default to major
        });
    });

    describe('Chord Generation', () => {
        test('should generate circle of fifths chords', () => {
            chordWheel.currentMode = 'circle-of-fifths';
            chordWheel.generateChordsForMode();

            expect(chordWheel.chords.length).toBeGreaterThan(0);
            expect(chordWheel.chords[0]).toHaveProperty('name');
            expect(chordWheel.chords[0]).toHaveProperty('notes');
            expect(chordWheel.chords[0]).toHaveProperty('type');
        });

        test('should generate diatonic chords', () => {
            chordWheel.currentMode = 'diatonic';
            chordWheel.generateChordsForMode();

            expect(chordWheel.chords.length).toBeGreaterThan(0);
            expect(chordWheel.chords.some(chord => chord.type === 'major')).toBe(true);
            expect(chordWheel.chords.some(chord => chord.type === 'minor')).toBe(true);
        });

        test('should generate chromatic chords', () => {
            chordWheel.currentMode = 'chromatic';
            chordWheel.generateChordsForMode();

            expect(chordWheel.chords.length).toBe(16); // Should limit to 16 chords
        });

        test('should generate jazz chords', () => {
            chordWheel.currentMode = 'jazz-ii-v-i';
            chordWheel.generateChordsForMode();

            expect(chordWheel.chords.length).toBeGreaterThan(0);
            // Should include some 7th chords
            expect(chordWheel.chords.some(chord => chord.name.includes('7'))).toBe(true);
        });

        test('should generate blues chords', () => {
            chordWheel.currentMode = 'blues';
            chordWheel.generateChordsForMode();

            expect(chordWheel.chords.length).toBe(8); // Blues should have 8 chords
            expect(chordWheel.chords.some(chord => chord.name.includes('7'))).toBe(true);
        });

        test('should create valid chord objects', () => {
            const chord = chordWheel.createChord('C', 'major');

            expect(chord).toHaveProperty('name', 'C');
            expect(chord).toHaveProperty('root', 'C');
            expect(chord).toHaveProperty('type', 'major');
            expect(chord).toHaveProperty('notes');
            expect(Array.isArray(chord.notes)).toBe(true);
            expect(chord.notes.length).toBeGreaterThan(0);
        });

        test('should generate correct chord notes', () => {
            const majorChord = chordWheel.getChordNotes('C', 'major');
            const minorChord = chordWheel.getChordNotes('C', 'minor');

            expect(majorChord).toEqual(['C4', 'E4', 'G4']);
            expect(minorChord).toEqual(['C4', 'D#4', 'G4']);
        });
    });

    describe('Rendering', () => {
        test('should render chord wheel container', () => {
            const chordWheelElement = chordWheel.shadowRoot.querySelector('.chord-wheel');
            expect(chordWheelElement).not.toBeNull();
        });

        test('should render chord buttons', () => {
            const chordButtons = chordWheel.shadowRoot.querySelectorAll('.chord-button');
            expect(chordButtons.length).toBeGreaterThan(0);
        });

        test('should render key indicator', () => {
            const keyIndicator = chordWheel.shadowRoot.querySelector('.key-indicator');
            expect(keyIndicator).not.toBeNull();
            expect(keyIndicator.textContent).toContain('C major');
        });

        test('should apply size classes correctly', () => {
            chordWheel.setAttribute('size', 'large');

            const chordWheelElement = chordWheel.shadowRoot.querySelector('.chord-wheel');
            expect(chordWheelElement.classList.contains('large')).toBe(true);
        });

        test('should create chord buttons with correct data attributes', () => {
            const firstButton = chordWheel.shadowRoot.querySelector('.chord-button');
            expect(firstButton.getAttribute('data-chord')).not.toBeNull();
            expect(firstButton.getAttribute('data-index')).not.toBeNull();
        });

        test('should position chord buttons in circular layout', () => {
            const chordButtons = chordWheel.shadowRoot.querySelectorAll('.chord-button');

            chordButtons.forEach(button => {
                const style = button.getAttribute('style');
                expect(style).toContain('top:');
                expect(style).toContain('left:');
                expect(style).toContain('transform: translate(-50%, -50%)');
            });
        });
    });

    describe('Event Handling', () => {
        test('should handle mouse interactions', async () => {
            const chordButton = chordWheel.shadowRoot.querySelector('.chord-button');
            const mockEvent = new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 100,
                clientY: 100
            });

            // Mock the target's getAttribute method
            Object.defineProperty(mockEvent, 'target', {
                value: chordButton,
                writable: true
            });

            const chordPlayedSpy = jest.fn();
            chordWheel.addEventListener('chord-played', chordPlayedSpy);

            chordWheel.handleMouseInteraction(mockEvent, 0);

            // Should add active class
            expect(chordButton.classList.contains('active')).toBe(true);

            // Should dispatch chord-played event
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(chordPlayedSpy).toHaveBeenCalled();
        });

        test('should handle keyboard interactions', () => {
            const keyEvent = new KeyboardEvent('keydown', { key: '1' });

            const chordPlayedSpy = jest.fn();
            chordWheel.addEventListener('chord-played', chordPlayedSpy);

            chordWheel.handleKeydown(keyEvent);

            // Should add active class to first button
            const firstButton = chordWheel.shadowRoot.querySelector('.chord-button');
            expect(firstButton.classList.contains('active')).toBe(true);
        });

        test('should ignore invalid keyboard keys', () => {
            const keyEvent = new KeyboardEvent('keydown', { key: 'a' });

            const chordPlayedSpy = jest.fn();
            chordWheel.addEventListener('chord-played', chordPlayedSpy);

            chordWheel.handleKeydown(keyEvent);

            // Should not dispatch chord-played event
            expect(chordPlayedSpy).not.toHaveBeenCalled();
        });

        test('should handle touch interactions', async () => {
            const chordButton = chordWheel.shadowRoot.querySelector('.chord-button');
            const mockEvent = new TouchEvent('touchstart', {
                touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
                bubbles: true
            });

            Object.defineProperty(mockEvent, 'target', {
                value: chordButton,
                writable: true
            });

            const chordPlayedSpy = jest.fn();
            chordWheel.addEventListener('chord-played', chordPlayedSpy);

            await chordWheel.handleTouchStart(mockEvent, 0);

            // Should add active class
            expect(chordButton.classList.contains('active')).toBe(true);

            // Should track touch
            expect(chordWheel.activeTouches.size).toBe(1);
        });

        test('should prevent interaction when muted', async () => {
            chordWheel.isMuted = true;

            const chordButton = chordWheel.shadowRoot.querySelector('.chord-button');
            const mockEvent = new MouseEvent('mousedown');
            Object.defineProperty(mockEvent, 'target', {
                value: chordButton,
                writable: true
            });

            const chordPlayedSpy = jest.fn();
            chordWheel.addEventListener('chord-played', chordPlayedSpy);

            await chordWheel.handleMouseInteraction(mockEvent, 0);

            // Should not dispatch chord-played event when muted
            expect(chordPlayedSpy).not.toHaveBeenCalled();
        });
    });

    describe('Audio Integration', () => {
        test('should create chord synthesizer', () => {
            expect(chordWheel.synth).toBeDefined();
            expect(chordWheel.audioEffects).toBeDefined();
        });

        test('should play chord when requested', async () => {
            const chord = { name: 'C', notes: ['C4', 'E4', 'G4'] };

            await chordWheel.playChord(chord, '2n');

            expect(chordWheel.synth.triggerAttackRelease).toHaveBeenCalledWith(chord.notes, '2n');
        });

        test('should not play chord when muted', async () => {
            chordWheel.isMuted = true;
            const chord = { name: 'C', notes: ['C4', 'E4', 'G4'] };

            await chordWheel.playChord(chord, '2n');

            expect(chordWheel.synth.triggerAttackRelease).not.toHaveBeenCalled();
        });

        test('should validate chord before playing', async () => {
            const invalidChord = { name: 'C' }; // Missing notes

            await chordWheel.playChord(invalidChord, '2n');

            expect(chordWheel.synth.triggerAttackRelease).not.toHaveBeenCalled();
        });

        test('should debounce rapid chord triggers', async () => {
            const chord = { name: 'C', notes: ['C4', 'E4', 'G4'] };

            // Trigger multiple rapid calls
            await chordWheel.playChord(chord, '2n');
            await chordWheel.playChord(chord, '2n');
            await chordWheel.playChord(chord, '2n');

            // Should only call once due to debouncing
            expect(chordWheel.synth.triggerAttackRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('Key and Mode Changes', () => {
        test('should change key correctly', () => {
            const keyChangedSpy = jest.fn();
            chordWheel.addEventListener('key-changed', keyChangedSpy);

            chordWheel.changeKey('G', 'minor');

            expect(chordWheel.currentKey).toBe('G');
            expect(chordWheel.currentScale).toBe('minor');
            expect(keyChangedSpy).toHaveBeenCalled();
        });

        test('should change mode correctly', () => {
            const modeChangedSpy = jest.fn();
            chordWheel.addEventListener('mode-changed', modeChangedSpy);

            chordWheel.changeMode('diatonic');

            expect(chordWheel.currentMode).toBe('diatonic');
            expect(modeChangedSpy).toHaveBeenCalled();
        });

        test('should handle external key-changed events', () => {
            const changeKeySpy = jest.spyOn(chordWheel, 'changeKey');

            const keyEvent = new CustomEvent('key-changed', {
                detail: { key: 'F', scale: 'major' }
            });

            document.dispatchEvent(keyEvent);

            expect(changeKeySpy).toHaveBeenCalledWith('F', 'major');
        });

        test('should handle external set-mode events', () => {
            const changeModeeSpy = jest.spyOn(chordWheel, 'changeMode');

            const modeEvent = new CustomEvent('set-mode', {
                detail: { mode: 'blues' }
            });

            chordWheel.dispatchEvent(modeEvent);

            expect(changeModeeSpy).toHaveBeenCalledWith('blues');
        });
    });

    describe('Chord Position Calculation', () => {
        test('should calculate chord positions correctly', () => {
            const position1 = chordWheel.getChordPosition(0, 8);
            const position2 = chordWheel.getChordPosition(4, 8);

            // First position should be at top (y around 15)
            expect(position1.top).toBeLessThan(20);
            expect(position1.left).toBeCloseTo(50, 1);

            // Fifth position should be at bottom (y around 85)
            expect(position2.top).toBeGreaterThan(80);
            expect(position2.left).toBeCloseTo(50, 1);
        });

        test('should distribute positions evenly around circle', () => {
            const total = 12;
            const positions = [];

            for (let i = 0; i < total; i++) {
                positions.push(chordWheel.getChordPosition(i, total));
            }

            // Check that positions are distributed around the circle
            const topPositions = positions.filter(p => p.top < 30).length;
            const bottomPositions = positions.filter(p => p.top > 70).length;
            const leftPositions = positions.filter(p => p.left < 30).length;
            const rightPositions = positions.filter(p => p.left > 70).length;

            expect(topPositions).toBeGreaterThan(0);
            expect(bottomPositions).toBeGreaterThan(0);
            expect(leftPositions).toBeGreaterThan(0);
            expect(rightPositions).toBeGreaterThan(0);
        });
    });

    describe('Helper Methods', () => {
        test('should validate keys correctly', () => {
            expect(chordWheel.validateKey('C')).toBe(true);
            expect(chordWheel.validateKey('F#')).toBe(true);
            expect(chordWheel.validateKey('X')).toBe(false);
            expect(chordWheel.validateKey('H')).toBe(false);
        });

        test('should validate scales correctly', () => {
            expect(chordWheel.validateScale('major')).toBe(true);
            expect(chordWheel.validateScale('minor')).toBe(true);
            expect(chordWheel.validateScale('blues')).toBe(false);
            expect(chordWheel.validateScale('invalid')).toBe(false);
        });

        test('should get scale notes correctly', () => {
            const majorScale = chordWheel.getScaleNotes('C', 'major');
            const minorScale = chordWheel.getScaleNotes('C', 'minor');

            expect(majorScale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
            expect(minorScale).toEqual(['C', 'D', 'D#', 'F', 'G', 'G#', 'A#']);
        });

        test('should get mode display names correctly', () => {
            expect(chordWheel.getModeDisplayName('circle-of-fifths')).toBe('Circle of 5ths');
            expect(chordWheel.getModeDisplayName('diatonic')).toBe('Diatonic');
            expect(chordWheel.getModeDisplayName('unknown')).toBe('unknown');
        });

        test('should get relative keys correctly', () => {
            expect(chordWheel.getRelativeMinor('C')).toBe('A');
            expect(chordWheel.getRelativeMinor('G')).toBe('E');
            expect(chordWheel.getRelativeMajor('A')).toBe('C');
            expect(chordWheel.getRelativeMajor('E')).toBe('G');
        });
    });

    describe('Cleanup', () => {
        test('should cleanup properly when disconnected', () => {
            const stopLevelMonitoringSpy = jest.spyOn(chordWheel, 'stopLevelMonitoring');
            const cleanupSpy = jest.spyOn(chordWheel, 'cleanup');

            chordWheel.disconnectedCallback();

            expect(stopLevelMonitoringSpy).toHaveBeenCalled();
            expect(cleanupSpy).toHaveBeenCalled();
        });

        test('should clear active touches and chords on cleanup', () => {
            chordWheel.activeTouches.set('test', { test: true });
            chordWheel.activeChords.add('test-chord');

            chordWheel.cleanup();

            expect(chordWheel.activeTouches.size).toBe(0);
            expect(chordWheel.activeChords.size).toBe(0);
        });
    });

    describe('Accessibility', () => {
        test('should have proper ARIA attributes', () => {
            const chordButtons = chordWheel.shadowRoot.querySelectorAll('.chord-button');

            chordButtons.forEach(button => {
                expect(button.getAttribute('role')).toBe('button');
                expect(button.getAttribute('tabindex')).toBe('0');
                expect(button.getAttribute('aria-label')).toContain('Play');
                expect(button.getAttribute('aria-pressed')).toBe('false');
            });
        });

        test('should update aria-pressed on activation', () => {
            const firstButton = chordWheel.shadowRoot.querySelector('.chord-button');
            const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });

            Object.defineProperty(keyEvent, 'target', {
                value: firstButton,
                writable: true
            });

            chordWheel.handleKeyboardInteraction(keyEvent, 0);

            expect(firstButton.getAttribute('aria-pressed')).toBe('true');
        });
    });

    describe('Error Handling', () => {
        test('should handle missing chord data gracefully', async () => {
            const button = document.createElement('div');
            button.setAttribute('data-chord', ''); // Empty chord data

            const mockEvent = new MouseEvent('mousedown');
            Object.defineProperty(mockEvent, 'target', {
                value: button,
                writable: true
            });

            // Should not throw error
            expect(() => {
                chordWheel.handleMouseInteraction(mockEvent, 0);
            }).not.toThrow();
        });

        test('should handle invalid chord data gracefully', async () => {
            const button = document.createElement('div');
            button.setAttribute('data-chord', 'invalid-json'); // Invalid JSON

            const mockEvent = new MouseEvent('mousedown');
            Object.defineProperty(mockEvent, 'target', {
                value: button,
                writable: true
            });

            // Should not throw error
            expect(() => {
                chordWheel.handleMouseInteraction(mockEvent, 0);
            }).not.toThrow();
        });

        test('should handle missing event details gracefully', () => {
            const invalidEvent = new CustomEvent('key-changed'); // No detail

            // Should not throw error
            expect(() => {
                chordWheel.handleSongKeyChange(invalidEvent);
            }).not.toThrow();
        });
    });
});