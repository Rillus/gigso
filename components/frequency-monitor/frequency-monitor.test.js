/**
 * @jest-environment jsdom
 */
import FrequencyMonitor from './frequency-monitor.js';

describe('FrequencyMonitor', () => {
  let monitor;
  let mockAnalyser;
  let mockAudioContext;
  let mockMediaStream;

  beforeEach(() => {
    // Mock AudioContext
    mockAudioContext = {
      createAnalyser: jest.fn(),
      createMediaStreamSource: jest.fn(),
      close: jest.fn(),
      sampleRate: 44100
    };

    // Mock AnalyserNode
    mockAnalyser = {
      fftSize: 2048,
      frequencyBinCount: 1024,
      getFloatTimeDomainData: jest.fn(),
      getFloatFrequencyData: jest.fn()
    };

    // Mock MediaStream
    mockMediaStream = {
      getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }])
    };

    // Mock getUserMedia
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue(mockMediaStream)
    };

    // Mock AudioContext constructor
    global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
    global.webkitAudioContext = jest.fn().mockImplementation(() => mockAudioContext);

    // Setup monitor
    monitor = new FrequencyMonitor();
    document.body.appendChild(monitor);

    // Setup mocks
    mockAudioContext.createAnalyser.mockReturnValue(mockAnalyser);
    mockAudioContext.createMediaStreamSource.mockReturnValue({
      connect: jest.fn()
    });

    console.error = jest.fn();
  });

  afterEach(() => {
    document.body.removeChild(monitor);
    jest.clearAllMocks();
  });

  it('should start listening when start is called', async () => {
    await monitor.start();
    expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    expect(mockAnalyser.fftSize).toBe(2048);
  });

  it('should stop and clean up resources', async () => {
    await monitor.start();
    monitor.stop();
    expect(mockMediaStream.getTracks()[0].stop).toHaveBeenCalled();
    expect(mockAudioContext.close).toHaveBeenCalled();
  });

  it('should emit frequency-detected event with correct data', async () => {
    await monitor.start();
    
    // Ensure the analyser is set properly
    monitor.analyser = mockAnalyser;
    monitor.audioContext = mockAudioContext;
    
    // Reset the lastUpdateTime to ensure frame rate limiting doesn't cause early return
    monitor.lastUpdateTime = 0;
    
    // Create a more realistic mock time domain signal with a clear 440Hz sine wave
    const mockTimeData = new Float32Array(2048);
    const frequency = 440; // A4 note
    const sampleRate = 44100;
    const amplitude = 0.5; // Moderate amplitude
    
    for (let i = 0; i < mockTimeData.length; i++) {
      mockTimeData[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    mockAnalyser.getFloatTimeDomainData.mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = mockTimeData[i];
      }
    });

    // Mock frequency data with a clear peak at 440Hz
    const mockFreqData = new Float32Array(1024).fill(-100);
    const peakIndex = Math.round(440 * 1024 / (sampleRate / 2));
    mockFreqData[peakIndex] = 0; // Set a clear peak at 440Hz
    mockAnalyser.getFloatFrequencyData.mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = mockFreqData[i];
      }
    });

    const frequencyHandler = jest.fn();
    monitor.addEventListener('frequency-detected', frequencyHandler);

    // Call analyseFrequency directly
    monitor.analyseFrequency();

    expect(frequencyHandler).toHaveBeenCalled();
    const event = frequencyHandler.mock.calls[0][0];
    expect(event.detail).toHaveProperty('frequency');
    expect(event.detail).toHaveProperty('note');
    expect(event.detail).toHaveProperty('cents');
    
    // The frequency should be detected (be greater than 0 and finite)
    expect(event.detail.frequency).toBeGreaterThan(0);
    expect(isFinite(event.detail.frequency)).toBe(true);
    
    // The note should be detected (not empty)
    expect(event.detail.note).not.toBe('--');
    expect(event.detail.note).toBeTruthy();
  });

  it('should emit volume-detected event with correct RMS value', async () => {
    await monitor.start();
    
    // Ensure the analyser is set properly
    monitor.analyser = mockAnalyser;
    monitor.audioContext = mockAudioContext;
    
    // Reset the lastUpdateTime to ensure frame rate limiting doesn't cause early return
    monitor.lastUpdateTime = 0;
    
    // Create a mock time domain signal with a clear 440Hz sine wave
    const mockTimeData = new Float32Array(2048);
    const frequency = 440; // A4 note
    const sampleRate = 44100;
    for (let i = 0; i < mockTimeData.length; i++) {
      mockTimeData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    mockAnalyser.getFloatTimeDomainData.mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = mockTimeData[i];
      }
    });

    // Mock frequency data with a clear peak at 440Hz
    const mockFreqData = new Float32Array(1024).fill(-100);
    const peakIndex = Math.round(440 * 1024 / (sampleRate / 2));
    mockFreqData[peakIndex] = 0; // Set a clear peak at 440Hz
    mockAnalyser.getFloatFrequencyData.mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = mockFreqData[i];
      }
    });

    const volumeHandler = jest.fn();
    monitor.addEventListener('volume-detected', volumeHandler);

    // Call analyseFrequency directly
    monitor.analyseFrequency();

    expect(volumeHandler).toHaveBeenCalled();
    const event = volumeHandler.mock.calls[0][0];
    expect(event.detail).toHaveProperty('rms');
    expect(typeof event.detail.rms).toBe('number');
    // RMS value should be between 0 and 1
    expect(event.detail.rms).toBeGreaterThan(0);
    expect(event.detail.rms).toBeLessThanOrEqual(1);
  });

  it('should emit frequency-data event with both downsampled and full data', async () => {
    await monitor.start();
    
    // Ensure the analyser is set properly
    monitor.analyser = mockAnalyser;
    monitor.audioContext = mockAudioContext;
    
    // Reset the lastUpdateTime to ensure frame rate limiting doesn't cause early return
    monitor.lastUpdateTime = 0;
    
    // Create a mock time domain signal with a clear 440Hz sine wave
    const mockTimeData = new Float32Array(2048);
    const frequency = 440; // A4 note
    const sampleRate = 44100;
    for (let i = 0; i < mockTimeData.length; i++) {
      mockTimeData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    mockAnalyser.getFloatTimeDomainData.mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = mockTimeData[i];
      }
    });

    // Mock frequency data with a clear peak at 440Hz
    const mockFreqData = new Float32Array(1024).fill(-100);
    const peakIndex = Math.round(440 * 1024 / (sampleRate / 2));
    mockFreqData[peakIndex] = 0; // Set a clear peak at 440Hz
    mockAnalyser.getFloatFrequencyData.mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = mockFreqData[i];
      }
    });

    const frequencyDataHandler = jest.fn();
    monitor.addEventListener('frequency-data', frequencyDataHandler);

    // Call analyseFrequency directly
    monitor.analyseFrequency();

    expect(frequencyDataHandler).toHaveBeenCalled();
    const event = frequencyDataHandler.mock.calls[0][0];
    expect(event.detail).toHaveProperty('frequencyData');
    expect(event.detail).toHaveProperty('frequencyDataFull');
    expect(event.detail.frequencyData).toBeInstanceOf(Float32Array);
    expect(event.detail.frequencyDataFull).toBeInstanceOf(Float32Array);
    expect(event.detail.frequencyData.length).toBe(32); // Downsampled data should have 32 bands
    expect(event.detail.frequencyDataFull.length).toBe(1024); // Full data should have 1024 bins
  });
}); 