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

const synth = new Tone.PolySynth(Tone.Synth).toDestination();
let loopActive = false;
let songPosition = 0;
let isPlaying = false;

// Render components
const appContainer = document.getElementById('app');

const elementsToAdd = [
    {
        tag: 'menu-toggle'
    },
    {
        tag: 'record-collection',
        eventListeners: [
            {
                name: 'load-song',
                function: (event) => {
                    console.log('load-song to record-collection', event);
                    const song = event.detail;
                    dispatchComponentEvent('piano-roll', 'load-song', song);
                }
            }
        ]
    },
    {  
        tag: 'transport-controls',
    },
    {
        tag: 'current-chord-display',
    },
    {
        tag: 'chord-palette',
        eventListeners: [
            {
                name: 'add-chord',
                function: (event) => {
                    console.log('add-chord to chord-palette')
                    const chord = event.detail;
                    dispatchComponentEvent('piano-roll', 'add-chord', chord);
                }
            }
        ]
    },
    // {
    //     tag: 'chord-diagram',
    // },
    {
        tag: 'gigso-keyboard',
    },
    {
        tag: 'piano-roll',
        eventListeners: [
            {
                name: 'isReady',
                function: () => {
                    const addChordEvent = (chord) => {
                        dispatchComponentEvent('piano-roll', 'add-chord', chord);
                    };
                
                    for (const chord of chords) {
                        addChordEvent(chord);
                    }
                }
            },
            {
                name: 'play-chord',
                function: (event) => {
                    playChord(event.detail);
                }
            }
        ]
    },
    {
        tag: 'add-chord-form',
        eventListeners: [
            {
                name: 'add-chord',
                function: (event) => {
                    console.log('add-chord to chord form', event);
                    const chord = event.detail;
                    dispatchComponentEvent('piano-roll', 'add-chord', chord);
                }
            }
        ]
    },
];

elementsToAdd.forEach(element => {
    addElement(element);
});

// Listen for custom events from the web components
document.body.addEventListener('play-clicked', async () => {
    await Tone.start();
    playSong();
    console.log('Audio is ready');
    dispatchComponentEvent('piano-roll', 'play');
});

document.body.addEventListener('stop-clicked', () => {
    stopSong();
    dispatchComponentEvent('piano-roll', 'stop');
});

document.body.addEventListener('loop-clicked', () => {
    loopActive = !loopActive;
    if (loopActive) {
        dispatchComponentEvent('loop-button', 'activate');
    } else {
        dispatchComponentEvent('loop-button', 'deactivate');
    }
    // Dispatch the loop state to the piano-roll
    dispatchComponentEvent('piano-roll', 'set-loop', loopActive);
});

function playChord({chord, duration}) {
    const time = Tone.now();    
    synth.triggerAttackRelease(chord.notes, duration, time);
    dispatchComponentEvent('current-chord-display', 'set-chord', chord.name);
    dispatchComponentEvent('chord-diagram', 'set-chord', chord.name );
    dispatchComponentEvent(
        'gigso-keyboard', 
        'highlight-notes', 
        { 
            notes: chord.notes, 
            duration: duration
        }
    );
}

function playSong() {
    if (isPlaying) return;
    isPlaying = true;
    dispatchComponentEvent('piano-roll', 'play');
    dispatchComponentEvent('play-button', 'activate');
    dispatchComponentEvent('stop-button', 'deactivate');
}

function stopSong() {
    dispatchComponentEvent('piano-roll', 'stop');
    dispatchComponentEvent('chord-diagram', 'set-chord', null);
    dispatchComponentEvent('current-chord-display', 'set-chord', null);
    if (!isPlaying) return;
    isPlaying = false ;
    dispatchComponentEvent('play-button', 'deactivate');
    dispatchComponentEvent('stop-button', 'activate');
}

function pauseSong() {
    if (!isPlaying) return;
    isPlaying = false;
    dispatchComponentEvent('piano-roll', 'pause');
    dispatchComponentEvent('play-button', 'deactivate');
    dispatchComponentEvent('stop-button', 'activate');
}

function dispatchComponentEvent(selector, eventName, eventDetails) {
    const eleRef = document.querySelector(selector);
    if (eleRef) {
        eleRef.dispatchEvent(new CustomEvent(eventName, { detail: eventDetails }));
    } else {
        console.warn('Element not found', selector, 'when triggering event', eventName);
    }
}

function addElement(element, styles) {
    const newElement = document.createElement(element.tag);
    const eleRef = appContainer.appendChild(newElement);

    if (element.eventListeners) {
        element.eventListeners.forEach((eventListener) => {
            eleRef.addEventListener(eventListener.name, eventListener.function);
        })
    }

    console.debug('Adding new element ', element)
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
        dispatchComponentEvent('piano-roll', new CustomEvent('next-chord'));
    }

    if (event.code === 'ArrowLeft') {
        dispatchComponentEvent('piano-roll', new CustomEvent('previous-chord'));
    }
});