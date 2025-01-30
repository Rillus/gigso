import EventHandlers from './helpers/eventHandlers.js';
import Actions from './actions/actions.js';
import State from './state/state.js';

import ElementHandlers from './helpers/elementHandlers.js';
const { addElement } = ElementHandlers;

const { dispatchComponentEvent } = EventHandlers;
const {playChord, playSong, stopSong, pauseSong} = Actions;
const { isPlaying, setIsPlaying, loopActive, setLoopActive } = State;

// Define a simple chord pattern with names
const chords = [
    {
      "name": "C",
      "notes": [
        "C4",
        "E4",
        "G4"
      ],
      "duration": 1,
      "delay": 0,
      "startPosition": 0
    },
  ];

// Listen for custom events from the web components
document.body.addEventListener('play-clicked', async () => {
    await Tone.start();
    playSong();
    dispatchComponentEvent('piano-roll', 'play');
});

document.body.addEventListener('stop-clicked', () => {
    stopSong();
    dispatchComponentEvent('piano-roll', 'stop');
});

document.body.addEventListener('loop-clicked', () => {
    const newLoopActive = !loopActive();
    setLoopActive(newLoopActive);
    console.log('loopActive', newLoopActive);
    if (newLoopActive) {
        dispatchComponentEvent('loop-button', 'activate');
    } else {
        dispatchComponentEvent('loop-button', 'deactivate');
    }
});

document.addEventListener('keydown', async (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        
        if (isPlaying()) {
            pauseSong();
        } else {
            await Tone.start();
            playSong();
        }
    }

    if (event.code === 'Escape') {
        stopSong();
    }

    if (event.code === 'ArrowRight') {
        dispatchComponentEvent('piano-roll', new CustomEvent('next-chord'));
    }

    if (event.code === 'ArrowLeft') {
        dispatchComponentEvent('piano-roll', new CustomEvent('previous-chord'));
    }
});

export function initializeApp(elementsToAdd) {
    const appContainer = document.getElementById('app');

    elementsToAdd.forEach(element => {
        addElement(element, appContainer);
    });
}