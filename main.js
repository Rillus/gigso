import { initializeApp } from './app.js';
import EventHandlers from './helpers/eventHandlers.js';
const { dispatchComponentEvent } = EventHandlers;

import Actions from './actions/actions.js';
const { playChord, stopAllChords } = Actions;

import State from './state/state.js';
const { setInstrument } = State;

const toneScript = document.createElement('script');
toneScript.src = 'https://unpkg.com/tone@14.7.77/build/Tone.js';
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
import Fretboard from './components/fretboard/fretboard.js';
import BpmController from './components/bpm-controller/bpm-controller.js';
import Mixer from './components/mixer/mixer.js';
import audioDebugger from './helpers/audioDebugger.js';

const appContainer = document.getElementById('app');

const elementsToAdd = [
    {
        tag: GigsoLogo,
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
    // {
    //     tag: GigsoMenu,
    // },
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
        tag: GigsoKeyboard,
    },
    {  
        tag: TransportControls,
    },
    {
        tag: BpmController,
        emittedEvents: [
            {
                name: 'bpm-changed',
                function: (event) => {
                    console.log('BPM changed to:', event.detail.bpm);
                    // The piano roll will automatically listen for this event
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
            },
            {
                name: 'stop-all-chords',
                function: (event) => {
                    stopAllChords();
                }
            }
        ]
    },
    // {
    //     tag: AddChord,
    //     emittedEvents: [
    //         {
    //             name: 'add-chord',
    //             function: (event) => {
    //                 const chord = event.detail;
    //                 dispatchComponentEvent('piano-roll', 'add-chord', chord);
    //             }
    //         }
    //     ]
    // },
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
        tag: EQDisplay,
    },
    {
        tag: FrequencyMonitor,
    },
    {
        tag: Fretboard,
    },
    {
        tag: Mixer,
        emittedEvents: [
            {
                name: 'mixer-volume-change',
                function: (event) => {
                    const { instrumentId, volume, muted } = event.detail;
                    console.log(`Volume change for ${instrumentId}:`, { volume, muted });
                    // Dispatch volume change to the specific instrument
                    dispatchComponentEvent(instrumentId, 'volume-change', { volume, muted });
                }
            },
            {
                name: 'mixer-master-volume-change',
                function: (event) => {
                    const { volume } = event.detail;
                    console.log('Master volume change:', volume);
                    // Dispatch master volume change to all instruments
                    dispatchComponentEvent('piano-roll', 'master-volume-change', { volume });
                    dispatchComponentEvent('gigso-keyboard', 'master-volume-change', { volume });
                    dispatchComponentEvent('hand-pan', 'master-volume-change', { volume });
                }
            },
            {
                name: 'mixer-master-mute-toggle',
                function: (event) => {
                    const { muted } = event.detail;
                    console.log('Master mute toggle:', muted);
                    // Dispatch master mute to all instruments
                    dispatchComponentEvent('piano-roll', 'master-mute-toggle', { muted });
                    dispatchComponentEvent('gigso-keyboard', 'master-mute-toggle', { muted });
                    dispatchComponentEvent('hand-pan', 'master-mute-toggle', { muted });
                }
            },
            {
                name: 'mixer-mute-toggle',
                function: (event) => {
                    const { instrumentId, muted } = event.detail;
                    console.log(`Mute toggle for ${instrumentId}:`, muted);
                    // Dispatch mute toggle to the specific instrument
                    dispatchComponentEvent(instrumentId, 'mute-toggle', { muted });
                }
            },
            {
                name: 'mixer-solo-toggle',
                function: (event) => {
                    const { instrumentId, soloed } = event.detail;
                    console.log(`Solo toggle for ${instrumentId}:`, soloed);
                    // Dispatch solo toggle to the specific instrument
                    dispatchComponentEvent(instrumentId, 'solo-toggle', { soloed });
                }
            }
        ]
    },
];

document.addEventListener('DOMContentLoaded', async () => {
  while (window.Tone === undefined) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  initializeApp(elementsToAdd);
}); 