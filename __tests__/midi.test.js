// Mock the Web MIDI API
const mockMidiAccess = {
  inputs: new Map([
    ['K.O.II', {
      name: 'K.O.II',
      onmidimessage: null
    }]
  ]),
  outputs: new Map([
    ['K.O.II', {
      name: 'K.O.II',
      send: jest.fn()
    }]
  ])
};

import midiInterface from '../helpers/midiInterface.js';

describe('MIDI Interface', () => {
  beforeAll(() => {
    // Set up the navigator mock
    Object.defineProperty(global, 'navigator', {
      value: {
        requestMIDIAccess: jest.fn().mockResolvedValue(mockMidiAccess)
      },
      writable: true
    });
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('should initialise MIDI interface', async () => {
    await midiInterface.init();
    expect(navigator.requestMIDIAccess).toHaveBeenCalled();
    expect(mockMidiAccess.inputs.size).toBe(1);
    expect(mockMidiAccess.outputs.size).toBe(1);
  });

  test('should handle MIDI input messages', async () => {
    const mockCallback = jest.fn();
    await midiInterface.init();
    midiInterface.onNoteReceived(mockCallback);

    // Get the input device
    const inputDevice = mockMidiAccess.inputs.get('K.O.II');
    
    // Simulate a MIDI note on message
    const mockEvent = {
      data: [0x90, 60, 100] // Note on, middle C, velocity 100
    };
    
    // Trigger the MIDI input handler
    inputDevice.onmidimessage(mockEvent);
    
    expect(mockCallback).toHaveBeenCalledWith({
      note: 60,
      velocity: 100,
      type: 'noteon'
    });
  });

  test('should handle MIDI note off messages', async () => {
    const mockCallback = jest.fn();
    await midiInterface.init();
    midiInterface.onNoteReceived(mockCallback);

    // Get the input device
    const inputDevice = mockMidiAccess.inputs.get('K.O.II');
    
    // Simulate a MIDI note off message
    const mockEvent = {
      data: [0x80, 60, 0] // Note off, middle C
    };
    
    // Trigger the MIDI input handler
    inputDevice.onmidimessage(mockEvent);
    
    expect(mockCallback).toHaveBeenCalledWith({
      note: 60,
      velocity: 0,
      type: 'noteoff'
    });
  });

  test('should send MIDI output messages', async () => {
    await midiInterface.init();
    
    // Send a note
    midiInterface.sendNote(60, 100);
    
    // Get the output device
    const outputDevice = mockMidiAccess.outputs.get('K.O.II');
    expect(outputDevice.send).toHaveBeenCalledWith([0x90, 60, 100]);
  });

  test('should send MIDI note off messages', async () => {
    await midiInterface.init();
    
    // Send a note off
    midiInterface.sendNoteOff(60);
    
    // Get the output device
    const outputDevice = mockMidiAccess.outputs.get('K.O.II');
    expect(outputDevice.send).toHaveBeenCalledWith([0x80, 60, 0]);
  });
}); 