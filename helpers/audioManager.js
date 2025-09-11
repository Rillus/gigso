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
        this.reverbBus = null;
        this.chorusBus = null;
        
        // Performance monitoring
        this.activeVoices = 0;
        this.lastCleanup = Date.now();
        this.cleanupInterval = 5000; // Cleanup every 5 seconds
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
            this.masterVolume = new window.Tone.Volume(-6).toDestination();

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
                synth.connect(this.chorusBus);
                synth._type = type;
                synth._inUse = false;
                synth._lastUsed = Date.now();
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
    playChord(chord, duration = '4n', synthType = 'poly') {
        if (!chord || !chord.notes || chord.notes.length === 0) {
            console.warn('AudioManager: Invalid chord data');
            return null;
        }

        const synth = this.getSynth(synthType);
        if (!synth) return null;

        try {
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