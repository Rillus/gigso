/**
 * Centralized Audio Manager for Gigso
 * Handles audio context management, synth pooling, and prevents audio dropouts
 */

class AudioManager {
    constructor() {
        this.initialized = false;
        this.synthPool = new Map(); // Reusable synths by type
        this.activeSynths = new Set(); // Track active synths for cleanup
        this.maxPolyphony = 16; // Maximum simultaneous voices
        this.audioContext = null;
        this.masterVolume = null;
        this.masterAnalyser = null;
        this.reverbBus = null;
        this.chorusBus = null;

        // Level monitoring
        this.instrumentAnalysers = new Map(); // Individual instrument analysers
        this.levelMonitoringInterval = null;
        this.levelUpdateCallbacks = new Map(); // Callbacks for level updates
        
        // Performance monitoring
        this.activeVoices = 0;
        this.lastCleanup = Date.now();
        this.cleanupInterval = 5000; // Cleanup every 5 seconds

        // Volume controls for mixer integration
        this.instrumentVolumes = {
            'piano-roll': 0.6,
            'gigso-keyboard': 0.6,
            'hand-pan': 0.8
        };
        this.instrumentMuted = {
            'piano-roll': false,
            'gigso-keyboard': false,
            'hand-pan': false
        };
        this.globalMasterVolume = 0.7;
        this.globalMasterMuted = false;
    }

    /**
     * Initialize the audio system
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            // Check if Tone.js is available
            if (typeof window.Tone === 'undefined') {
                console.error('AudioManager: Tone.js not available');
                return false;
            }

            // Start Tone.js context
            if (window.Tone.context.state !== 'running') {
                await window.Tone.start();
            }

            this.audioContext = window.Tone.context;

            // Create master volume control
            this.masterVolume = new window.Tone.Volume(-6);

            // Create master analyser for overall level monitoring
            this.masterAnalyser = new window.Tone.Analyser('waveform', 512);

            // Chain: masterVolume → masterAnalyser → destination
            this.masterVolume.connect(this.masterAnalyser);
            this.masterAnalyser.toDestination();

            // Create shared effect buses to reduce resource usage
            this.reverbBus = new window.Tone.Reverb({
                roomSize: 0.3,
                decay: 1.5,
                wet: 0.2
            }).connect(this.masterVolume);

            this.chorusBus = new window.Tone.Chorus({
                frequency: 0.5,
                delayTime: 3.5,
                depth: 0.7,
                spread: 180,
                wet: 0.1
            }).connect(this.reverbBus);

            // Pre-create synth pool
            this.createSynthPool();

            // Set up periodic cleanup
            this.startCleanupInterval();

            // Start level monitoring
            this.startLevelMonitoring();

            this.initialized = true;
            console.log('AudioManager: Initialized successfully');
            return true;

        } catch (error) {
            console.error('AudioManager: Failed to initialize:', error);
            return false;
        }
    }

    /**
     * Create a pool of reusable synths to prevent constant allocation
     */
    createSynthPool() {
        const synthTypes = {
            'poly': () => new window.Tone.PolySynth(window.Tone.Synth),
            'mono': () => new window.Tone.Synth(),
            'handpan': () => new window.Tone.Synth({
                oscillator: {
                    type: "triangle"
                },
                envelope: {
                    attack: 0.02,
                    decay: 0.4,
                    sustain: 0.1,
                    release: 1.4
                }
            })
        };

        Object.entries(synthTypes).forEach(([type, factory]) => {
            const synthArray = [];
            
            // Create 4 synths of each type for polyphony
            for (let i = 0; i < 4; i++) {
                const synth = factory();

                // Create individual analyser for this synth
                const analyser = new window.Tone.Analyser('waveform', 256);

                // Chain: synth → analyser → chorusBus
                synth.connect(analyser);
                analyser.connect(this.chorusBus);

                synth._type = type;
                synth._inUse = false;
                synth._lastUsed = Date.now();
                synth._analyser = analyser; // Store reference to analyser
                synthArray.push(synth);
            }
            
            this.synthPool.set(type, synthArray);
        });
    }

    /**
     * Get an available synth from the pool
     */
    getSynth(type = 'poly') {
        if (!this.initialized) {
            console.warn('AudioManager: Not initialized, attempting to initialize...');
            this.initialize();
            return null;
        }

        const pool = this.synthPool.get(type);
        if (!pool) {
            console.warn(`AudioManager: Unknown synth type: ${type}`);
            return null;
        }

        // Find an available synth
        let availableSynth = pool.find(synth => !synth._inUse);

        // If no available synth, force-free the oldest one
        if (!availableSynth) {
            console.warn(`AudioManager: No available ${type} synths, reusing oldest`);
            availableSynth = pool.reduce((oldest, current) => 
                current._lastUsed < oldest._lastUsed ? current : oldest
            );
            this.releaseSynth(availableSynth);
        }

        // Mark as in use
        availableSynth._inUse = true;
        availableSynth._lastUsed = Date.now();
        this.activeSynths.add(availableSynth);
        this.activeVoices++;

        return availableSynth;
    }

    /**
     * Release a synth back to the pool
     */
    releaseSynth(synth) {
        if (!synth) return;

        // Stop all voices on this synth
        try {
            if (synth.releaseAll) {
                synth.releaseAll();
            } else if (synth.triggerRelease) {
                synth.triggerRelease();
            }
        } catch (error) {
            console.warn('AudioManager: Error releasing synth:', error);
        }

        synth._inUse = false;
        synth._lastUsed = Date.now();
        this.activeSynths.delete(synth);
        this.activeVoices = Math.max(0, this.activeVoices - 1);
    }

    /**
     * Play a chord with automatic synth management
     */
    playChord(chord, duration = '4n', synthType = 'poly', instrumentId = 'piano-roll') {
        if (!chord || !chord.notes || chord.notes.length === 0) {
            console.warn('AudioManager: Invalid chord data');
            return null;
        }

        const synth = this.getSynth(synthType);
        if (!synth) return null;

        try {
            // Check if instrument or master is muted
            if (this.isInstrumentMuted(instrumentId) || this.globalMasterMuted) {
                console.log(`AudioManager: Playback muted for ${instrumentId}`);
                this.releaseSynth(synth);
                return null;
            }

            // Apply individual instrument volume to this synth
            const instrumentVolume = this.getInstrumentVolume(instrumentId);
            if (synth.volume) {
                const volumeDb = instrumentVolume === 0 ? -60 : Math.log10(instrumentVolume) * 20;
                synth.volume.value = volumeDb;
            }

            const time = window.Tone.now();

            if (synth.triggerAttackRelease) {
                synth.triggerAttackRelease(chord.notes, duration, time);
            } else {
                console.warn('AudioManager: Synth does not support triggerAttackRelease');
                this.releaseSynth(synth);
                return null;
            }

            // Auto-release synth after duration
            const durationMs = this.toneDurationToMs(duration);
            setTimeout(() => {
                this.releaseSynth(synth);
            }, durationMs + 100); // Small buffer

            return synth;

        } catch (error) {
            console.error('AudioManager: Error playing chord:', error);
            this.releaseSynth(synth);
            return null;
        }
    }

    /**
     * Play a single note
     */
    playNote(note, duration = '8n', synthType = 'mono') {
        if (!note) {
            console.warn('AudioManager: Invalid note data');
            return null;
        }

        const synth = this.getSynth(synthType);
        if (!synth) return null;

        try {
            const time = window.Tone.now();
            synth.triggerAttackRelease(note, duration, time);

            // Auto-release synth after duration
            const durationMs = this.toneDurationToMs(duration);
            setTimeout(() => {
                this.releaseSynth(synth);
            }, durationMs + 100);

            return synth;

        } catch (error) {
            console.error('AudioManager: Error playing note:', error);
            this.releaseSynth(synth);
            return null;
        }
    }

    /**
     * Convert Tone.js duration notation to milliseconds
     */
    toneDurationToMs(duration) {
        if (typeof duration === 'number') return duration * 1000;
        
        const durations = {
            '1n': 4000,   // Whole note at 60 BPM
            '2n': 2000,   // Half note
            '4n': 1000,   // Quarter note
            '8n': 500,    // Eighth note
            '16n': 250,   // Sixteenth note
            '32n': 125    // Thirty-second note
        };

        return durations[duration] || 1000;
    }

    /**
     * Emergency cleanup - stop all audio
     */
    stopAll() {
        console.log('AudioManager: Emergency stop - cleaning up all audio');
        
        this.activeSynths.forEach(synth => {
            try {
                if (synth.releaseAll) {
                    synth.releaseAll();
                } else if (synth.triggerRelease) {
                    synth.triggerRelease();
                }
                synth._inUse = false;
            } catch (error) {
                console.warn('AudioManager: Error during emergency cleanup:', error);
            }
        });

        this.activeSynths.clear();
        this.activeVoices = 0;
    }

    /**
     * Periodic cleanup of unused resources
     */
    performCleanup() {
        const now = Date.now();
        const maxIdleTime = 10000; // 10 seconds

        this.synthPool.forEach((pool, type) => {
            pool.forEach(synth => {
                if (!synth._inUse && (now - synth._lastUsed) > maxIdleTime) {
                    try {
                        if (synth.releaseAll) synth.releaseAll();
                        if (synth.triggerRelease) synth.triggerRelease();
                    } catch (error) {
                        // Silent cleanup
                    }
                }
            });
        });

        this.lastCleanup = now;
    }

    /**
     * Start periodic cleanup interval
     */
    startCleanupInterval() {
        setInterval(() => {
            this.performCleanup();
        }, this.cleanupInterval);
    }

    /**
     * Get audio system status for debugging
     */
    getStatus() {
        return {
            initialized: this.initialized,
            activeVoices: this.activeVoices,
            activeSynths: this.activeSynths.size,
            contextState: this.audioContext?.state,
            lastCleanup: new Date(this.lastCleanup).toISOString()
        };
    }

    /**
     * Set master volume (dB)
     */
    setVolume(volumeDb) {
        if (this.masterVolume) {
            this.masterVolume.volume.value = Math.max(-60, Math.min(6, volumeDb));
        }
    }

    /**
     * Level Monitoring Methods
     */
    startLevelMonitoring() {
        if (this.levelMonitoringInterval) return;

        // Update levels at 60fps for smooth meter animation
        this.levelMonitoringInterval = setInterval(() => {
            this.updateAudioLevels();
        }, 1000 / 60);

        console.log('AudioManager: Level monitoring started');
    }

    stopLevelMonitoring() {
        if (this.levelMonitoringInterval) {
            clearInterval(this.levelMonitoringInterval);
            this.levelMonitoringInterval = null;
            console.log('AudioManager: Level monitoring stopped');
        }
    }

    updateAudioLevels() {
        try {
            // Update master level
            if (this.masterAnalyser) {
                const masterLevel = this.getAudioLevel(this.masterAnalyser);
                this.notifyLevelUpdate('master', masterLevel);
            }

            // Update individual instrument levels by tracking active synths
            const instrumentLevels = { 'piano-roll': 0, 'gigso-keyboard': 0, 'hand-pan': 0 };

            // Check all synths in all pools for activity
            this.synthPool.forEach((synthArray, synthType) => {
                synthArray.forEach(synth => {
                    if (synth._inUse && synth._analyser) {
                        const level = this.getAudioLevel(synth._analyser);

                        // Map synth activity to instruments based on usage patterns
                        if (synthType === 'poly') {
                            instrumentLevels['piano-roll'] = Math.max(instrumentLevels['piano-roll'], level);
                        } else if (synthType === 'mono') {
                            instrumentLevels['gigso-keyboard'] = Math.max(instrumentLevels['gigso-keyboard'], level);
                        } else if (synthType === 'handpan') {
                            instrumentLevels['hand-pan'] = Math.max(instrumentLevels['hand-pan'], level);
                        }
                    }
                });
            });

            // Notify for each instrument
            Object.entries(instrumentLevels).forEach(([instrumentId, level]) => {
                this.notifyLevelUpdate(instrumentId, level);
            });

        } catch (error) {
            console.warn('AudioManager: Error updating audio levels:', error);
        }
    }

    getAudioLevel(analyser) {
        const bufferLength = analyser.size;
        const dataArray = analyser.getValue();

        // Calculate RMS (Root Mean Square) for more accurate level representation
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            const sample = Array.isArray(dataArray) ? dataArray[i] : dataArray[i] || 0;
            sum += sample * sample;
        }

        const rms = Math.sqrt(sum / bufferLength);

        // Convert to a 0-1 range with some scaling for better visual representation
        const level = Math.min(rms * 10, 1.0); // Scale and clamp to 0-1

        return level;
    }

    registerLevelCallback(instrumentId, callback) {
        this.levelUpdateCallbacks.set(instrumentId, callback);
        console.log(`AudioManager: Registered level callback for ${instrumentId}`);
    }

    unregisterLevelCallback(instrumentId) {
        this.levelUpdateCallbacks.delete(instrumentId);
        console.log(`AudioManager: Unregistered level callback for ${instrumentId}`);
    }

    notifyLevelUpdate(instrumentId, level) {
        const callback = this.levelUpdateCallbacks.get(instrumentId);
        if (callback) {
            callback(level);
        }
    }

    /**
     * Mixer Integration Methods
     */
    setInstrumentVolume(instrumentId, volume) {
        this.instrumentVolumes[instrumentId] = Math.max(0, Math.min(1, volume));
        this.updateMasterVolume();
        console.log(`AudioManager: Set ${instrumentId} volume to ${volume}`);
    }

    setGlobalMasterVolume(volume) {
        this.globalMasterVolume = Math.max(0, Math.min(1, volume));
        this.updateMasterVolume();
        console.log(`AudioManager: Set global master volume to ${volume}`);
    }

    updateMasterVolume() {
        if (this.masterVolume) {
            // Combine global master volume - affects the entire audio output
            const finalVolume = this.globalMasterVolume;
            const volumeDb = finalVolume === 0 ? -60 : Math.log10(finalVolume) * 20;
            this.masterVolume.volume.value = Math.max(-60, Math.min(6, volumeDb));

            console.log('AudioManager: Master volume updated - Global:', this.globalMasterVolume, 'dB:', volumeDb);
        }
    }

    setInstrumentMute(instrumentId, muted) {
        this.instrumentMuted[instrumentId] = muted;
        console.log(`AudioManager: Set ${instrumentId} mute to ${muted}`);
    }

    setGlobalMasterMute(muted) {
        this.globalMasterMuted = muted;
        console.log(`AudioManager: Set global master mute to ${muted}`);
    }

    getInstrumentVolume(instrumentId) {
        return this.instrumentVolumes[instrumentId] || 0.6;
    }

    isInstrumentMuted(instrumentId) {
        return this.instrumentMuted[instrumentId] || false;
    }
}

// Create singleton instance
const audioManager = new AudioManager();

// Auto-initialize on first user interaction
let autoInitialized = false;
const autoInit = async () => {
    if (!autoInitialized) {
        autoInitialized = true;
        await audioManager.initialize();
        
        // Remove listeners after first initialization
        document.removeEventListener('click', autoInit);
        document.removeEventListener('keydown', autoInit);
        document.removeEventListener('touchstart', autoInit);
    }
};

// Set up auto-initialization listeners
document.addEventListener('click', autoInit, { once: true });
document.addEventListener('keydown', autoInit, { once: true });
document.addEventListener('touchstart', autoInit, { once: true });

export default audioManager;