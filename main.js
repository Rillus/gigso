import { initializeApp } from './app.js';
import EventHandlers from './helpers/eventHandlers.js';
const { dispatchComponentEvent } = EventHandlers;

import Actions from './actions/actions.js';
const { playChord } = Actions;

import State from './state/state.js';
const { setInstrument } = State;

const toneScript = document.createElement('script');
toneScript.src = '/node_modules/tone/build/Tone.js';
document.head.appendChild(toneScript);

import GigsoMenu from './components/gigso-menu/gigso-menu.js';
import GigsoLogo from './components/gigso-logo/gigso-logo.js';
import TransportControls from './components/transport-controls/transport-controls.js';
import CurrentChord from './components/current-chord/current-chord.js';
import GigsoKeyboard from './components/gigso-keyboard/gigso-keyboard.js';
import PianoRoll from './components/piano-roll/piano-roll.js';
import AddChord from './components/add-chord/add-chord.js';
import ChordPalette from './components/chord-palette/chord-palette.js';
import ChordDiagram from './components/chord-diagram/chord-diagram.js';
import RecordCollection from './components/record-collection/record-collection.js';

import HandPan from './components/hand-pan/hand-pan.js';
import InstrumentSelect from './instrument-select/instrument-select.js';
import VUMeter from './components/vu-meter/vu-meter.js';
import FrequencyMonitor from './components/frequency-monitor/frequency-monitor.js';
import EQDisplay from './components/eq-display/eq-display.js';
import Tuner from './components/chromatic-tuner/chromatic-tuner.js';
const appContainer = document.getElementById('app');

const elementsToAdd = [
    {
        tag: GigsoLogo,
    },
    {
        tag: GigsoMenu,
    },
    // {
    //     tag: CurrentChord,
    // },
        {
            tag: ChordPalette,
            emittedEvents: [
                {
                    name: 'add-chord',
                    function: (event) => {
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
        tag: GigsoKeyboard,
    },
    {
        tag: RecordCollection,
        emittedEvents: [
            {
                name: 'load-song',
                function: (event) => {
                    const song = event.detail;
                    dispatchComponentEvent('piano-roll', 'load-song', song);
                }
            }
        ]
    },
    {  
        tag: TransportControls,
    },
    {
        tag: InstrumentSelect,
        emittedEvents: [
            {
                name: 'instrument-selected',
                function: (event) => {
                    console.log('event', event)
                    setInstrument(event.detail);
                }
            }
        ]
    },
    {
        tag: PianoRoll,
        emittedEvents: [
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
        tag: AddChord,
        emittedEvents: [
            {
                name: 'add-chord',
                function: (event) => {
                    const chord = event.detail;
                    dispatchComponentEvent('piano-roll', 'add-chord', chord);
                }
            }
        ]
    },
    {
        tag: HandPan,
        emittedEvents: [
            {
                name: 'note-played',
                function: (event) => {
                    console.log('HandPan note played:', event.detail);
                }
            },
            {
                name: 'key-changed',
                function: (event) => {
                    console.log('HandPan key changed:', event.detail);
                }
            }
        ]
    },
    {
        tag: Tuner,
    },
    {
        tag: VUMeter,
    },
    {
        tag: FrequencyMonitor,
    },
    {
        tag: EQDisplay,
    }
];

document.addEventListener('DOMContentLoaded', async () => {
  while (window.Tone === undefined) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  initializeApp(elementsToAdd);
}); 