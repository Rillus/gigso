import EventHandlers from '../helpers/eventHandlers.js';
const { dispatchComponentEvent } = EventHandlers;
import State from '../state/state.js';
const { isPlaying, setIsPlaying } = State;
import audioManager from '../helpers/audioManager.js';

export default class Actions {
  static playChord({chord, duration}) {
    // Use the centralized audio manager instead of creating new synths
    audioManager.playChord(chord, duration || '4n', 'poly');
    
    // Update UI components
    dispatchComponentEvent('current-chord', 'set-chord', chord.name);
    dispatchComponentEvent('chord-diagram', 'set-chord', chord.name );
    dispatchComponentEvent(
      'gigso-keyboard',
      'highlight-notes',
      { 
          notes: chord.notes, 
          duration: duration || '4n'
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
    // Emergency stop all audio
    audioManager.stopAll();
    
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
  
  static changeInstrument(instrument) {
    dispatchComponentEvent('piano-roll', 'set-instrument', instrument);
    // dispatchComponentEvent('chord-diagram', 'set-instrument', instrument);
  }
}