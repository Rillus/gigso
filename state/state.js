// new state management system
const state = {
    isPlaying: false,
    loopActive: false,
    currentChord: null,
    song: null,
}

// getters
const isPlaying = () => state.isPlaying;
const loopActive = () => state.loopActive;
const currentChord = () => state.currentChord;
const song = () => state.song;

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

export default {
    isPlaying,
    loopActive,
    currentChord,
    song,
    setIsPlaying,
    setLoopActive,
    setCurrentChord,
    setSong,
}