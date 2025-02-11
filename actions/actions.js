import EventHandlers from '../helpers/eventHandlers.js';
const { dispatchComponentEvent } = EventHandlers;
import State from '../state/state.js';
const { isPlaying, setIsPlaying } = State;

export default class Actions {
  static playChord({chord, duration}) {
    const synth = new Tone.PolySynth(window.Tone.Synth).toDestination();
    const time = Tone.now();    
    synth.triggerAttackRelease(chord.notes, duration, time);
    dispatchComponentEvent('current-chord', 'set-chord', chord.name);
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

  static playSong() {
    if (isPlaying()) return;
    setIsPlaying(true);
    dispatchComponentEvent('piano-roll', 'play');
    dispatchComponentEvent('play-button', 'activate');
    dispatchComponentEvent('stop-button', 'deactivate');
    dispatchComponentEvent('gigso-logo', 'start');
  }

  static stopSong() {
    dispatchComponentEvent('piano-roll', 'stop');
    dispatchComponentEvent('chord-diagram', 'set-chord', null);
    dispatchComponentEvent('current-chord', 'set-chord', null);
    dispatchComponentEvent('gigso-logo', 'stop');
    if (!isPlaying()) return;
    setIsPlaying(false);
    dispatchComponentEvent('play-button', 'deactivate');
    dispatchComponentEvent('stop-button', 'activate');
  }
  
  static pauseSong() {
    if (!isPlaying()) return;
    setIsPlaying(false);
    dispatchComponentEvent('piano-roll', 'pause');
    dispatchComponentEvent('play-button', 'deactivate');
    dispatchComponentEvent('gigso-logo', 'pause');
  }
}