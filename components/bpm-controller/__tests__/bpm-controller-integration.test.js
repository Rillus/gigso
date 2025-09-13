import { fireEvent, getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import '../bpm-controller.js';
import State from '../../../state/state.js';

describe('BpmController Integration Tests', () => {
  let bpmController;
  let bpmInput;

  beforeEach(() => {
    document.body.innerHTML = '<bpm-controller></bpm-controller>';
    bpmController = document.querySelector('bpm-controller');
    bpmInput = getByTestId(bpmController, 'bpm-input');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    // Reset state to defaults
    State.setBpm(120);
  });

  describe('State Management Integration', () => {
    test('should read initial BPM from state', () => {
      State.setBpm(140);
      
      // Re-create component to test state reading
      document.body.innerHTML = '<bpm-controller></bpm-controller>';
      bpmController = document.querySelector('bpm-controller');
      bpmInput = getByTestId(bpmController, 'bpm-input');
      
      expect(bpmInput).toHaveValue('140');
    });

    test('should update state when BPM changes', () => {
      const plusButton = bpmController.querySelector('[data-testid="plus-button"]');
      
      fireEvent.click(plusButton);
      
      expect(State.bpm()).toBe(125);
    });

    test('should maintain state consistency across multiple components', () => {
      // Create multiple BPM controllers
      document.body.innerHTML = `
        <bpm-controller id="controller1"></bpm-controller>
        <bpm-controller id="controller2"></bpm-controller>
      `;
      
      const controller1 = document.getElementById('controller1');
      const controller2 = document.getElementById('controller2');
      const input1 = getByTestId(controller1, 'bpm-input');
      const input2 = getByTestId(controller2, 'bpm-input');
      
      // Change BPM on first controller
      const plusButton1 = controller1.querySelector('[data-testid="plus-button"]');
      fireEvent.click(plusButton1);
      
      // Both should reflect the same BPM
      expect(input1).toHaveValue('125');
      expect(input2).toHaveValue('125');
      expect(State.bpm()).toBe(125);
    });
  });

  describe('Tone.js Transport Integration', () => {
    let mockTransport;

    beforeEach(() => {
      mockTransport = {
        bpm: { value: 120 },
        set: jest.fn(),
        get: jest.fn()
      };
      
      global.Tone = {
        Transport: mockTransport
      };
    });

    test('should update Transport BPM when BPM changes', () => {
      const plusButton = bpmController.querySelector('[data-testid="plus-button"]');
      
      fireEvent.click(plusButton);
      
      expect(mockTransport.bpm.value).toBe(125);
    });

    test('should sync with Transport BPM on initialisation', () => {
      mockTransport.bpm.value = 140;
      
      // Re-create component to test Transport sync
      document.body.innerHTML = '<bpm-controller></bpm-controller>';
      bpmController = document.querySelector('bpm-controller');
      bpmInput = getByTestId(bpmController, 'bpm-input');
      
      expect(bpmInput).toHaveValue('140');
    });

    test('should handle Transport BPM changes from external sources', () => {
      // Simulate external BPM change
      mockTransport.bpm.value = 160;
      
      // Trigger a sync event
      const syncEvent = new CustomEvent('transport-bpm-changed', {
        detail: { bpm: 160 }
      });
      bpmController.dispatchEvent(syncEvent);
      
      expect(bpmInput).toHaveValue('160');
    });
  });

  describe('Cross-Component Communication', () => {
    test('should respond to BPM changes from other components', () => {
      const externalBpmEvent = new CustomEvent('set-bpm', {
        detail: { bpm: 150 }
      });
      
      bpmController.dispatchEvent(externalBpmEvent);
      
      expect(bpmInput).toHaveValue('150');
      expect(State.bpm()).toBe(150);
    });

    test('should notify other components of BPM changes', () => {
      const listener = jest.fn();
      document.addEventListener('bpm-changed', listener);
      
      const plusButton = bpmController.querySelector('[data-testid="plus-button"]');
      fireEvent.click(plusButton);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            bpm: 125,
            previousBpm: 120
          })
        })
      );
      
      document.removeEventListener('bpm-changed', listener);
    });

    test('should work with transport controls', () => {
      // Create transport controls alongside BPM controller
      document.body.innerHTML = `
        <bpm-controller></bpm-controller>
        <play-button></play-button>
        <stop-button></stop-button>
      `;
      
      const playButton = document.querySelector('play-button');
      const stopButton = document.querySelector('stop-button');
      const bpmController = document.querySelector('bpm-controller');
      
      // Change BPM
      const plusButton = bpmController.querySelector('[data-testid="plus-button"]');
      fireEvent.click(plusButton);
      
      // Transport controls should be aware of BPM change
      const playEvent = new CustomEvent('play-clicked');
      expect(() => playButton.dispatchEvent(playEvent)).not.toThrow();
    });
  });

  describe('Piano Roll Integration', () => {
    test('should affect piano roll playback speed', () => {
      // Create piano roll component
      document.body.innerHTML = `
        <bpm-controller></bpm-controller>
        <piano-roll></piano-roll>
      `;
      
      const pianoRoll = document.querySelector('piano-roll');
      const bpmController = document.querySelector('bpm-controller');
      
      // Mock piano roll BPM change handler
      const pianoRollHandler = jest.fn();
      pianoRoll.addEventListener('bpm-changed', pianoRollHandler);
      
      // Change BPM
      const plusButton = bpmController.querySelector('[data-testid="plus-button"]');
      fireEvent.click(plusButton);
      
      expect(pianoRollHandler).toHaveBeenCalled();
    });

    test('should maintain timing accuracy during playback', async () => {
      const bpmController = document.querySelector('bpm-controller');
      const plusButton = bpmController.querySelector('[data-testid="plus-button"]');
      
      // Start playback
      const playEvent = new CustomEvent('play-clicked');
      document.dispatchEvent(playEvent);
      
      // Change BPM during playback
      fireEvent.click(plusButton);
      
      // Should not cause timing issues
      expect(State.isPlaying()).toBe(true);
      expect(State.bpm()).toBe(125);
    });
  });

  describe('Song Loading Integration', () => {
    test('should load BPM from song data', () => {
      const songData = {
        name: 'Test Song',
        bpm: 140,
        chords: []
      };
      
      State.setSong(songData);
      
      // Trigger song load
      const loadSongEvent = new CustomEvent('load-song', {
        detail: songData
      });
      bpmController.dispatchEvent(loadSongEvent);
      
      expect(bpmInput).toHaveValue('140');
      expect(State.bpm()).toBe(140);
    });

    test('should save BPM to song data', () => {
      const songData = {
        name: 'Test Song',
        bpm: 120,
        chords: []
      };
      
      State.setSong(songData);
      
      // Change BPM
      const plusButton = bpmController.querySelector('[data-testid="plus-button"]');
      fireEvent.click(plusButton);
      
      // Song data should be updated
      const updatedSong = State.song();
      expect(updatedSong.bpm).toBe(125);
    });
  });

  describe('Error Recovery', () => {
    test('should recover from state corruption', () => {
      // Corrupt state
      State.setBpm(null);
      
      // Component should handle gracefully
      expect(bpmInput).toHaveValue('120'); // Should fall back to default
    });

    test('should recover from Transport errors', () => {
      // Mock Transport error
      global.Tone = {
        Transport: {
          bpm: {
            get value() { throw new Error('Transport error'); },
            set value(val) { throw new Error('Transport error'); }
          }
        }
      };
      
      // Should not crash the component
      const plusButton = bpmController.querySelector('[data-testid="plus-button"]');
      expect(() => fireEvent.click(plusButton)).not.toThrow();
    });

    test('should maintain functionality after component reconnection', () => {
      const plusButton = bpmController.querySelector('[data-testid="plus-button"]');
      
      // Remove and re-add component
      bpmController.remove();
      document.body.appendChild(bpmController);
      
      // Should still work
      fireEvent.click(plusButton);
      expect(State.bpm()).toBe(125);
    });
  });
});
