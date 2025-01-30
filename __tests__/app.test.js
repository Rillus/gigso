// app.test.js
import { jest } from '@jest/globals';
import ElementHandlers from '../helpers/elementHandlers.js';
const { addElement } = ElementHandlers;
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

// Now we can import our modules
import { playChord, playSong, stopSong, pauseSong, dispatchComponentEvent } from '../app.js';

let appContainer;

describe('app.js', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="app"></div>';
        appContainer = document.getElementById('app');
    });


    test('addElement should append a new element to the app container', () => {
        const TestElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
        };
        // Register the custom element
        customElements.define('test-element', TestElement);
        
        const element = { tag: TestElement }; // Use the tag name as a string
        addElement(element, appContainer);
        expect(appContainer.querySelector('test-element')).not.toBeNull();
    });
});