import FrequencyAnalyser from './frequency-analyser.js';

describe('FrequencyAnalyser', () => {
    let component;

    beforeEach(() => {
        // Mock the Web Audio API
        window.AudioContext = jest.fn().mockImplementation(() => ({
            createAnalyser: jest.fn().mockReturnValue({
                fftSize: 2048,
                frequencyBinCount: 1024,
                getFloatTimeDomainData: jest.fn()
            }),
            createMediaStreamSource: jest.fn().mockReturnValue({
                connect: jest.fn()
            }),
            sampleRate: 44100,
            close: jest.fn()
        }));

        // Mock getUserMedia
        navigator.mediaDevices = {
            getUserMedia: jest.fn().mockResolvedValue({
                getTracks: () => [{
                    stop: jest.fn()
                }]
            })
        };

        // Mock requestAnimationFrame
        window.requestAnimationFrame = jest.fn().mockReturnValue(1);
        window.cancelAnimationFrame = jest.fn();

        component = new FrequencyAnalyser();
        document.body.appendChild(component);
    });

    afterEach(() => {
        document.body.removeChild(component);
        jest.clearAllMocks();
    });

    it('should initialize with correct default state', () => {
        expect(component.audioContext).toBeNull();
        expect(component.analyser).toBeNull();
        expect(component.mediaStream).toBeNull();
        expect(component.isAnalyzing).toBe(false);
    });

    it('should start analysis when start button is clicked', async () => {
        const startButton = component.shadowRoot.querySelector('.start-button');
        startButton.click();
        
        await Promise.resolve();
        
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
        expect(component.isAnalyzing).toBe(true);
        expect(startButton.textContent).toBe('Stop Analysis');
    });

    it('should stop analysis when stop button is clicked', async () => {
        // Start analysis first
        const startButton = component.shadowRoot.querySelector('.start-button');
        startButton.click();
        await Promise.resolve();

        // Then stop it
        startButton.click();
        
        expect(component.isAnalyzing).toBe(false);
        expect(startButton.textContent).toBe('Start Analysis');
        expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should convert frequency to note correctly', () => {
        const a4 = component.frequencyToNote(440);
        expect(a4.name).toBe('A4');
        expect(a4.frequency).toBeCloseTo(440);

        const c4 = component.frequencyToNote(261.63);
        expect(c4.name).toBe('C4');
        expect(c4.frequency).toBeCloseTo(261.63);
    });

    it('should calculate cents correctly', () => {
        const cents = component.getCents(442, 440);
        expect(cents).toBeCloseTo(7.85, 1); // A4 + 7.85 cents
    });

    it('should dispatch frequency-detected event with correct data', async () => {
        const mockFrequency = 440;
        const mockNote = { name: 'A4', frequency: 440 };
        
        // Start analysis first to create the analyser
        const startButton = component.shadowRoot.querySelector('.start-button');
        startButton.click();
        await Promise.resolve();

        // Create and fill the mock data array
        const mockDataArray = new Float32Array(1024);
        for (let i = 0; i < mockDataArray.length; i++) {
            mockDataArray[i] = Math.sin(2 * Math.PI * mockFrequency * i / 44100);
        }

        // Mock getFloatTimeDomainData to use our mock data
        component.analyser.getFloatTimeDomainData.mockImplementation((array) => {
            array.set(mockDataArray);
        });

        const eventSpy = jest.fn();
        component.addEventListener('frequency-detected', eventSpy);

        // Manually trigger the frequency analysis
        component.analyseFrequency();
        await Promise.resolve();

        expect(eventSpy).toHaveBeenCalled();
        const eventData = eventSpy.mock.calls[0][0].detail;
        expect(eventData.frequency).toBeCloseTo(mockFrequency, -0.5);
        expect(eventData.note).toBe(mockNote.name);
    });
}); 