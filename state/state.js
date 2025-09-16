// new state management system
const state = {
    isPlaying: false,
    loopActive: false,
    currentChord: null,
    song: null,
    instrument: 'guitar',
    songKey: 'C',
    songScale: 'major',
    isKeySet: true,
    bpm: 120
}

// getters
const isPlaying = () => state.isPlaying;
const loopActive = () => state.loopActive;
const currentChord = () => state.currentChord;
const song = () => state.song;
const instrument = () => state.instrument;
const songKey = () => state.songKey;
const songScale = () => state.songScale;
const isKeySet = () => state.isKeySet;
const bpm = () => state.bpm;
// setters
const setIsPlaying = (value) => {
    state.isPlaying = value;
}

const setLoopActive = (value) => {
    state.loopActive = value;
}

const setCurrentChord = (value) => {
    state.currentChord = value;
}

const setSong = (value) => {
    state.song = value;
}

const setInstrument = (value) => {
    state.instrument = value;
}

const setSongKey = (value) => {
    state.songKey = value;
}

const setSongScale = (value) => {
    state.songScale = value;
}

const setIsKeySet = (value) => {
    state.isKeySet = value;
}

const setBpm = (value) => {
    state.bpm = value;
}

export default {
    isPlaying,
    setIsPlaying,
    loopActive,
    setLoopActive,
    currentChord,
    setCurrentChord,
    song,
    setSong,
    instrument,
    setInstrument,
    songKey,
    setSongKey,
    songScale,
    setSongScale,
    isKeySet,
    setIsKeySet,
    bpm,
    setBpm
}