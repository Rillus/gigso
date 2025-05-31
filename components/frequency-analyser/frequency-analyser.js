import BaseComponent from "../base-component.js";

export default class FrequencyAnalyser extends BaseComponent {
    constructor() {
        const template = `
            <div class="frequency-analyser">
                <div class="frequency-display">
                    <div class="vu-meter">
                        <div class="vu-face">
                            <span class="current-frequency">-- Hz</span>
                            <span class="current-note">--</span>
                            <div class="vu-ticks"></div>
                            <div class="vu-needle"></div>
                        </div>
                        <div class="vu-screws vu-screw-tl"></div>
                        <div class="vu-screws vu-screw-tr"></div>
                        <div class="vu-screws vu-screw-bl"></div>
                        <div class="vu-screws vu-screw-br"></div>
                        <button class="start-button">Start Analysis</button>
                    </div>
                </div>
            </div>
        `;

        const styles = `
            .vu-meter {
                position: relative;
                width: 220px;
                height: 180px;
                background: #222;
                border-radius: 18px;
                box-shadow: 0 4px 16px #000a;
                border: 4px solid #111;
                overflow: hidden;
            }
            .vu-face {
                position: absolute;
                left: 10px; top: 10px; right: 10px; bottom: 10px;
                background: radial-gradient(ellipse at 60% 80%, #ffe066 60%, #ffb300 100%);
                border-radius: 0 0 120px 120px/0 0 100px 100px;
                box-shadow: 0 2px 8px #0008 inset;
                z-index: 1;
            }
            .vu-label {
                position: absolute;
                left: 0; right: 0; bottom: 28px;
                text-align: center;
                font-family: 'Arial Black', Arial, sans-serif;
                font-size: 2rem;
                color: #222;
                letter-spacing: 0.1em;
                z-index: 3;
            }
            .vu-ticks {
                position: absolute;
                left: 0; top: 0; width: 100%; height: 100%;
                z-index: 2;
                pointer-events: none;
            }
            .vu-tick {
                position: absolute;
                width: 3px;
                height: 28px;
                background: #222;
                top: 50%;
                left: 50%;
                transform-origin: bottom center;
            }
            .vu-tick-label {
                position: absolute;
                font-size: 1rem;
                color: #222;
                font-family: Arial, sans-serif;
                top: 50%;
                left: 50%;
                transform-origin: bottom center;
                text-align: center;
                width: 40px;
                margin-left: -20px;
                font-weight: bold;
                pointer-events: none;
            }
            .vu-needle {
                position: absolute;
                left: 50%; bottom: 30px;
                width: 4px; height: 90px;
                background: linear-gradient(to top, #c00 60%, #fff 100%);
                border-radius: 2px;
                transform-origin: 50% 90%;
                box-shadow: 0 0 4px #c00a;
                z-index: 4;
                transition: transform 0.15s cubic-bezier(.4,2,.6,1);
            }
            .vu-screws {
                position: absolute;
                width: 22px; height: 22px;
                background: radial-gradient(circle at 30% 30%, #eee 70%, #888 100%);
                border: 2px solid #444;
                border-radius: 50%;
                z-index: 10;
                box-shadow: 0 2px 4px #0008;
            }
            .vu-screw-tl { left: -8px; top: -8px; }
            .vu-screw-tr { right: -8px; top: -8px; }
            .vu-screw-bl { left: -8px; bottom: -8px; }
            .vu-screw-br { right: -8px; bottom: -8px; }
            .start-button {
                position: absolute;
                left: 50%;
                bottom: 10px;
                transform: translateX(-50%);
                padding: 0.5rem 1rem;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                z-index: 20;
            }
            .start-button:hover {
                background: #45a049;
            }
        `;

        super(template, styles);

        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.isAnalyzing = false;
        this.animationFrame = null;

        // Bind methods
        this.startAnalysis = this.startAnalysis.bind(this);
        this.stopAnalysis = this.stopAnalysis.bind(this);
        this.analyzeFrequency = this.analyzeFrequency.bind(this);

        // Add event listeners
        this.shadowRoot.querySelector('.start-button').addEventListener('click', () => {
            if (this.isAnalyzing) {
                this.stopAnalysis();
            } else {
                this.startAnalysis();
            }
        });
    }

    connectedCallback() {
        if (this.initialised) return;
        this.initialised = true;
        this.renderTicks();
    }

    renderTicks() {
        // Arc settings
        const radius = 70; // distance from centre to tick base
        const labelRadius = 90; // distance from centre to label
        const centreX = 110; // half of .vu-meter width (220px)
        const centreY = 120; // a bit below half for the arc

        // Main ticks and labels
        const ticks = [
            { value: -20, label: '-20' },
            { value: -10, label: '-10' },
            { value: 0, label: '0' },
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
        ];
        const tickCount = 13;
        const minAngle = -50;
        const maxAngle = 50;
        const ticksContainer = this.shadowRoot.querySelector('.vu-ticks');
        ticksContainer.innerHTML = '';

        // Draw main ticks
        for (let i = 0; i < tickCount; i++) {
            const angle = minAngle + (i / (tickCount - 1)) * (maxAngle - minAngle);
            const rad = (angle - 90) * Math.PI / 180;
            const x = centreX + radius * Math.cos(rad);
            const y = centreY + radius * Math.sin(rad);

            const tick = document.createElement('div');
            tick.className = 'vu-tick';
            tick.style.height = i % 2 === 0 ? '28px' : '18px'; // longer for major ticks
            tick.style.background = i % 2 === 0 ? '#222' : '#444';
            tick.style.left = `${x}px`;
            tick.style.top = `${y}px`;
            tick.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
            ticksContainer.appendChild(tick);
        }

        // Draw labels
        ticks.forEach((tick, idx) => {
            // Map -20..3 to arc
            const angle = minAngle + ((tick.value + 20) / 43) * (maxAngle - minAngle);
            const rad = (angle - 90) * Math.PI / 180;
            const x = centreX + labelRadius * Math.cos(rad);
            const y = centreY + labelRadius * Math.sin(rad);

            const label = document.createElement('div');
            label.className = 'vu-tick-label';
            label.textContent = tick.label;
            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
            label.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            ticksContainer.appendChild(label);
        });
    }

    async startAnalysis() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;

            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.analyser);

            this.isAnalyzing = true;
            this.shadowRoot.querySelector('.start-button').textContent = 'Stop Analysis';
            this.analyzeFrequency();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.dispatchEvent(new CustomEvent('error', { 
                detail: { message: 'Could not access microphone' }
            }));
        }
    }

    stopAnalysis() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.isAnalyzing = false;
        this.shadowRoot.querySelector('.start-button').textContent = 'Start Analysis';
        this.shadowRoot.querySelector('.current-frequency').textContent = '-- Hz';
        this.shadowRoot.querySelector('.current-note').textContent = '--';
        this.setNeedleAngle(-50);
    }

    analyzeFrequency() {
        if (!this.isAnalyzing) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(dataArray);

        // Find the dominant frequency using autocorrelation
        const dominantFrequency = this.findDominantFrequency(dataArray, this.audioContext.sampleRate);
        
        if (dominantFrequency > 0 && isFinite(dominantFrequency)) {
            const note = this.frequencyToNote(dominantFrequency);
            const cents = this.getCents(dominantFrequency, note.frequency);

            // Update display
            this.shadowRoot.querySelector('.current-frequency').textContent = `${Math.round(dominantFrequency)} Hz`;
            this.shadowRoot.querySelector('.current-note').textContent = note.name;
            
            // Map cents to angle (-50 to +50 degrees)
            let angle = Math.max(-50, Math.min(50, cents / 2));
            this.setNeedleAngle(angle);

            // Dispatch event with frequency data
            this.dispatchEvent(new CustomEvent('frequency-detected', {
                detail: {
                    frequency: dominantFrequency,
                    note: note.name,
                    cents: cents
                }
            }));
        } else {
            this.setNeedleAngle(-50); // Rest position
        }

        this.animationFrame = requestAnimationFrame(() => this.analyzeFrequency());
    }

    setNeedleAngle(angle) {
        const needle = this.shadowRoot.querySelector('.vu-needle');
        if (needle) {
            needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        }
    }

    findDominantFrequency(buffer, sampleRate) {
        // Simple autocorrelation to find the dominant frequency
        const correlation = new Float32Array(buffer.length);
        let maxCorrelation = 0;
        let maxIndex = 0;

        for (let lag = 0; lag < buffer.length; lag++) {
            let sum = 0;
            for (let i = 0; i < buffer.length - lag; i++) {
                sum += buffer[i] * buffer[i + lag];
            }
            correlation[lag] = sum;
            if (sum > maxCorrelation) {
                maxCorrelation = sum;
                maxIndex = lag;
            }
        }

        // Find the first peak after the initial correlation
        let peakIndex = maxIndex;
        for (let i = maxIndex + 1; i < correlation.length - 1; i++) {
            if (correlation[i] > correlation[i - 1] && correlation[i] > correlation[i + 1]) {
                peakIndex = i;
                break;
            }
        }

        return peakIndex > 0 ? sampleRate / peakIndex : 0;
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

customElements.define('frequency-analyser', FrequencyAnalyser); 