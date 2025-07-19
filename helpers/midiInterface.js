class MidiInterface {
  constructor() {
    this.initialised = false;
    this.noteCallbacks = new Set();
    this.midiAccess = null;
  }

  async init() {
    if (this.initialised) return;

    try {
      // Request MIDI access
      this.midiAccess = await navigator.requestMIDIAccess();
      this.initialised = true;
      
      // Set up input listeners for all devices
      this.midiAccess.inputs.forEach(input => {
        input.onmidimessage = (event) => this.handleMidiMessage(event);
      });

      if (process.env.NODE_ENV !== 'test') {
        console.log('MIDI Interface initialised');
        console.log('Available inputs:', Array.from(this.midiAccess.inputs.values()).map(input => input.name));
        console.log('Available outputs:', Array.from(this.midiAccess.outputs.values()).map(output => output.name));
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to initialise MIDI:', error);
      }
      throw error;
    }
  }

  handleMidiMessage(event) {
    const [status, note, velocity] = event.data;
    const type = (status & 0xF0) === 0x90 ? 'noteon' : 'noteoff';
    
    // Note off can be either 0x80 or 0x90 with velocity 0
    if (type === 'noteon' && velocity === 0) {
      this.handleNoteOff({ note, velocity });
    } else if (type === 'noteon') {
      this.handleNoteOn({ note, velocity });
    } else {
      this.handleNoteOff({ note, velocity });
    }
  }

  handleNoteOn({ note, velocity }) {
    this.noteCallbacks.forEach(callback => {
      callback({
        note,
        velocity,
        type: 'noteon'
      });
    });
  }

  handleNoteOff({ note, velocity }) {
    this.noteCallbacks.forEach(callback => {
      callback({
        note,
        velocity,
        type: 'noteoff'
      });
    });
  }

  onNoteReceived(callback) {
    this.noteCallbacks.add(callback);
    return () => this.noteCallbacks.delete(callback);
  }

  sendNote(note, velocity = 100, channel = 0) {
    if (!this.initialised) {
      throw new Error('MIDI Interface not initialised');
    }

    // Send to all available outputs
    this.midiAccess.outputs.forEach(output => {
      output.send([0x90 + channel, note, velocity]);
    });
  }

  sendNoteOff(note, channel = 0) {
    if (!this.initialised) {
      throw new Error('MIDI Interface not initialised');
    }

    // Send note off to all available outputs
    this.midiAccess.outputs.forEach(output => {
      output.send([0x80 + channel, note, 0]);
    });
  }
}

// Create and export a singleton instance
const midiInterface = new MidiInterface();
export default midiInterface; 