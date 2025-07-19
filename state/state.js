// new state management system
const state = {
    isPlaying: false,
    loopActive: false,
    currentChord: null,
    song: null,
    instrument: 'guitar'
}

// getters
const isPlaying = () => state.isPlaying;
const loopActive = () => state.loopActive;
const currentChord = () => state.currentChord;
const song = () => state.song;
const instrument = () => state.instrument;
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
    setInstrument
}