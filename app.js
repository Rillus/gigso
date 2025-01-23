// Define a simple chord pattern with names
const chords = [
    { name: 'C', notes: ['C4', 'E4', 'G4'], duration: 1, delay: 0 },
    { name: 'Dm', notes: ['D4', 'F4', 'A4'], duration: 0.5, delay: 0 },
    { name: 'Em', notes: ['E4', 'G4', 'B4'], duration: 0.5, delay: 0 },
    { name: 'F', notes: ['F4', 'A4', 'C5'], duration: 1, delay: 0 }
];

const synth = new Tone.PolySynth(Tone.Synth).toDestination();
let loopActive = false;
let songPosition = 0;
let isPlaying = false;

const song = new Tone.Loop(time => {
    // playChord(chords[songPosition]);
    if (loopActive) {
        songPosition = (songPosition + 1) % chords.length;
    } else {
        if ((songPosition + 1) % chords.length === 0) {
            stopSong();
        } else {
            songPosition = (songPosition + 1) % chords.length;
        }
    }
}, '2n');

// Render components
const appContainer = document.getElementById('app');

const playButton = document.createElement('play-button');
const stopButton = document.createElement('stop-button');
const loopButton = document.createElement('loop-button');
const chordDisplay = document.createElement('current-chord-display');
const keyboard = document.createElement('gigso-keyboard');
const pianoRollEle = document.createElement('piano-roll');

appContainer.appendChild(playButton);
appContainer.appendChild(stopButton);
appContainer.appendChild(loopButton);
appContainer.appendChild(chordDisplay);
appContainer.appendChild(keyboard);
appContainer.appendChild(pianoRollEle);

const pianoRoll = document.querySelector('piano-roll');
const addChordForm = document.querySelector('add-chord-form');

pianoRoll.addEventListener('piano-roll-ready', () => {
    console.log('Piano roll is ready');

    // Dispatch a custom event to add chords
    const addChordEvent = (chord) => {
        const event = new CustomEvent('add-chord', { detail: chord });
        pianoRoll.dispatchEvent(event);
    };

    for (const chord of chords) {
        addChordEvent(chord);
    }
});

addChordForm.addEventListener('add-chord', (event) => {
    const chord = event.detail;
    pianoRoll.dispatchEvent(new CustomEvent('add-chord', { detail: chord }));
});

// Listen for custom events from the web components
document.body.addEventListener('play-clicked', async () => {
    await Tone.start();
    playSong();
    console.log('Audio is ready');
    dispatchEvent('piano-roll', new CustomEvent('play'));
});

document.body.addEventListener('stop-clicked', () => {
    stopSong();
    dispatchEvent('piano-roll', new CustomEvent('stop'));
});

document.body.addEventListener('loop-clicked', () => {
    loopActive = !loopActive;
    if (loopActive) {
        dispatchEvent('loop-button', new CustomEvent('activate'));
    } else {
        dispatchEvent('loop-button', new CustomEvent('deactivate'));
    }
    // Dispatch the loop state to the piano-roll
    dispatchEvent('piano-roll', new CustomEvent('set-loop', { detail: loopActive }));
});

// Listen for the custom 'add-chord' event
document.querySelector('piano-roll').addEventListener('play-chord', (event) => {
    const chord = event.detail;
    playChord(chord);
});

function playChord({chord, duration}) {
    const time = Tone.now();
    console.log('time', time);
    
    synth.triggerAttackRelease(chord.notes, duration, time);
    dispatchEvent('current-chord-display', new CustomEvent('set-chord', { detail: chord.name }));
    dispatchEvent('gigso-keyboard', new CustomEvent('highlight-notes', { detail: {notes: chord.notes, duration: duration} }));
    console.log(`Playing: ${chord.name}`);
}

function playSong() {
    if (isPlaying) return;
    isPlaying = true;
    dispatchEvent('piano-roll', new CustomEvent('play'));
    dispatchEvent('play-button', new CustomEvent('activate'));
    dispatchEvent('stop-button', new CustomEvent('deactivate'));
}

function stopSong() {
    dispatchEvent('piano-roll', new CustomEvent('stop'));
    dispatchEvent('current-chord-display', new CustomEvent('set-chord', { detail: null }));
    if (!isPlaying) return;
    isPlaying = false ;
    dispatchEvent('play-button', new CustomEvent('deactivate'));
    dispatchEvent('stop-button', new CustomEvent('activate'));
}

function pauseSong() {
    if (!isPlaying) return;
    isPlaying = false;
    dispatchEvent('piano-roll', new CustomEvent('pause'));
    dispatchEvent('play-button', new CustomEvent('deactivate'));
    dispatchEvent('stop-button', new CustomEvent('activate'));
}

function dispatchEvent(selector, event) {
    document.querySelector(selector).dispatchEvent(event);
}

document.addEventListener('keydown', async (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        
        if (isPlaying) {
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
        dispatchEvent('piano-roll', new CustomEvent('next-chord'));
    }

    if (event.code === 'ArrowLeft') {
        dispatchEvent('piano-roll', new CustomEvent('previous-chord'));
    }
});