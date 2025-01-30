// app.test.js
import { jest } from '@jest/globals';

window.Tone = class Tone {
  Synth = jest.fn().mockImplementation(() => ({
      triggerAttackRelease: jest.fn(),
      toDestination: jest.fn(() => ({
          triggerAttackRelease: jest.fn()
      }))
  }))
  PolySynth = jest.fn().mockImplementation(() => {
      const synthInstance = {
          toDestination: jest.fn().mockReturnThis(),
          triggerAttackRelease: jest.fn()
      };
      return synthInstance;
  })
  start = jest.fn().mockResolvedValue(undefined);
  now = jest.fn(() => 0);
};
console.log(window.Tone);

// Now we can import our modules
import { addElement, playChord, playSong, stopSong, pauseSong, dispatchComponentEvent } from '../app.js';

// Mock document and custom elements
document.body.innerHTML = '<script src="/node_modules/tone/build/Tone.js"></script><div id="app"></div>';
const appContainer = document.getElementById('app');

describe('app.js', () => {
    beforeEach(() => {
      
    });


    test('addElement should append a new element to the app container', () => {
        const element = { tag: 'test-element' };
        addElement(element);
        expect(appContainer.querySelector('test-element')).not.toBeNull();
    });

    test('playChord should trigger synth and dispatch events', () => {
        const chord = { notes: ['C4', 'E4', 'G4'], name: 'C' };
        playChord({ chord, duration: 1 });
        expect(Tone.PolySynth().triggerAttackRelease).toHaveBeenCalledWith(chord.notes, 1, 0);
    });

    test('playSong should dispatch play events and set isPlaying to true', () => {
        playSong();
        expect(dispatchComponentEvent).toHaveBeenCalledWith('piano-roll', 'play');
    });

    test('stopSong should dispatch stop events and set isPlaying to false', () => {
        stopSong();
        expect(dispatchComponentEvent).toHaveBeenCalledWith('piano-roll', 'stop');
    });

    test('pauseSong should dispatch pause events and set isPlaying to false', () => {
        pauseSong();
        expect(dispatchComponentEvent).toHaveBeenCalledWith('piano-roll', 'pause');
    });

    test('dispatchComponentEvent should dispatch a custom event', () => {
        const mockElement = document.createElement('div');
        mockElement.setAttribute('id', 'mock-element');
        document.body.appendChild(mockElement);

        const eventName = 'test-event';
        const eventDetails = { detail: 'test' };
        dispatchComponentEvent('#mock-element', eventName, eventDetails);

        const event = new CustomEvent(eventName, { detail: eventDetails });
        expect(mockElement.dispatchEvent).toHaveBeenCalledWith(event);
    });

    // Add more tests for event listeners and edge cases
});