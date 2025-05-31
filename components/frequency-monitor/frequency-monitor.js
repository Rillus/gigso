export default class FrequencyMonitor extends HTMLElement {
    constructor() {
        super();
        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.isAnalyzing = false;
        this.animationFrame = null;
        this._boundAnalyseFrequency = this.analyseFrequency.bind(this);

        // Reusable buffers to prevent garbage collection
        this.timeDataBuffer = new Float32Array(2048);
        this.freqDataBuffer = new Float32Array(1024);
        this.correlationBuffer = new Float32Array(2048);
        this.downsampledBuffer = new Float32Array(32);

        // Frame rate limiting
        this.lastUpdateTime = 0;
        this.updateInterval = 1000 / 30; // Target 30 FPS

        // Create button
        const button = document.createElement('button');
        button.textContent = 'Start Listening';
        this._boundButtonClick = () => {
            if (this.isAnalyzing) {
                this.stop();
                button.textContent = 'Start Listening';
            } else {
                this.start();
                button.textContent = 'Stop Listening';
            }
        };
        button.addEventListener('click', this._boundButtonClick);
        this.appendChild(button);
    }

    connectedCallback() {
        // Optionally auto-start
        // this.start();
    }

    disconnectedCallback() {
        // Clean up when element is removed from DOM
        this.stop();
        this.cleanup();
    }

    cleanup() {
        // Clear all buffers
        this.timeDataBuffer.fill(0);
        this.freqDataBuffer.fill(0);
        this.correlationBuffer.fill(0);
        this.downsampledBuffer.fill(0);

        // Remove event listeners
        if (this.button) {
            this.button.removeEventListener('click', this._boundButtonClick);
        }

        // Clear references
        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.isAnalyzing = false;
        this.animationFrame = null;
    }

    async start() {
        if (this.isAnalyzing) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8; // Add smoothing

            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.analyser);

            this.isAnalyzing = true;
            this.analyseFrequency();
        } catch (error) {
            this.dispatchEvent(new CustomEvent('error', { 
                detail: { message: 'Could not access microphone', error }
            }));
            this.cleanup();
        }
    }

    stop() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            this.mediaStream = null;
        }
        if (this.audioContext) {
            this.audioContext.close().catch(console.error);
            this.audioContext = null;
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.isAnalyzing = false;
    }

    analyseFrequency() {
        if (!this.isAnalyzing) return;

        const now = performance.now();
        if (now - this.lastUpdateTime < this.updateInterval) {
            this.animationFrame = requestAnimationFrame(this._boundAnalyseFrequency);
            return;
        }
        this.lastUpdateTime = now;

        try {
            // Get time domain data
            this.analyser.getFloatTimeDomainData(this.timeDataBuffer);

            // Calculate RMS (volume)
            let sum = 0;
            for (let i = 0; i < this.timeDataBuffer.length; i++) {
                sum += this.timeDataBuffer[i] * this.timeDataBuffer[i];
            }
            const rms = Math.sqrt(sum / this.timeDataBuffer.length);

            // Get frequency data
            this.analyser.getFloatFrequencyData(this.freqDataBuffer);

            // Downsample frequency data to 32 bands
            const pointsPerBand = Math.floor(this.freqDataBuffer.length / 32);
            for (let i = 0; i < 32; i++) {
                let sum = 0;
                const start = i * pointsPerBand;
                const end = start + pointsPerBand;
                for (let j = start; j < end; j++) {
                    sum += this.freqDataBuffer[j];
                }
                this.downsampledBuffer[i] = sum / pointsPerBand;
            }

            // Emit volume-detected event
            this.dispatchEvent(new CustomEvent('volume-detected', { 
                detail: { rms },
                bubbles: true,
                composed: true
            }));

            // Emit frequency data for EQ display
            this.dispatchEvent(new CustomEvent('frequency-data', {
                detail: { 
                    frequencyData: this.downsampledBuffer,
                    frequencyDataFull: this.freqDataBuffer 
                },
                bubbles: true,
                composed: true
            }));

            // Find the dominant frequency using optimized autocorrelation
            const dominantFrequency = this.findDominantFrequency(this.timeDataBuffer, this.audioContext.sampleRate);
            if (dominantFrequency > 0 && isFinite(dominantFrequency)) {
                const note = this.frequencyToNote(dominantFrequency);
                const cents = this.getCents(dominantFrequency, note.frequency);
                this.dispatchEvent(new CustomEvent('frequency-detected', {
                    detail: {
                        frequency: dominantFrequency,
                        note: note.name,
                        cents: cents
                    }
                }));
            }
        } catch (error) {
            console.error('Error in frequency analysis:', error);
            this.stop();
            return;
        }

        this.animationFrame = requestAnimationFrame(this._boundAnalyseFrequency);
    }

    findDominantFrequency(buffer, sampleRate) {
        // Optimized autocorrelation with early exit
        let maxCorrelation = 0;
        let maxIndex = 0;
        const minLag = Math.floor(sampleRate / 2000); // Skip very high frequencies
        const maxLag = Math.floor(sampleRate / 20);   // Skip very low frequencies

        for (let lag = minLag; lag < maxLag; lag++) {
            let sum = 0;
            let count = 0;
            // Use a smaller window for correlation
            const windowSize = Math.min(1024, buffer.length - lag);
            for (let i = 0; i < windowSize; i++) {
                sum += buffer[i] * buffer[i + lag];
                count++;
            }
            const correlation = sum / count;
            if (correlation > maxCorrelation) {
                maxCorrelation = correlation;
                maxIndex = lag;
            }
        }

        return maxIndex > 0 ? sampleRate / maxIndex : 0;
    }

    frequencyToNote(frequency) {
        const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const a4 = 440;
        const c0 = a4 * Math.pow(2, -4.75);
        if (frequency < c0) return { name: '--', frequency: 0 };
        const halfStepsFromC0 = Math.round(12 * Math.log2(frequency / c0));
        const octave = Math.floor(halfStepsFromC0 / 12);
        const noteIndex = halfStepsFromC0 % 12;
        const noteName = noteStrings[noteIndex] + octave;
        const noteFrequency = c0 * Math.pow(2, halfStepsFromC0 / 12);
        return { name: noteName, frequency: noteFrequency };
    }

    getCents(frequency, targetFrequency) {
        return 1200 * Math.log2(frequency / targetFrequency);
    }
}

customElements.define('frequency-monitor', FrequencyMonitor); 