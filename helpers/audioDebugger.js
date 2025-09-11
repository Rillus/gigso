/**
 * Audio Debugging Utility for Gigso
 * Helps identify audio dropouts and performance issues
 */

class AudioDebugger {
    constructor() {
        this.enabled = false;
        this.events = [];
        this.maxEvents = 1000;
        this.startTime = Date.now();
        this.audioContextMonitor = null;
        this.performanceWarnings = [];
    }

    /**
     * Enable audio debugging
     */
    enable() {
        this.enabled = true;
        this.startMonitoring();
        console.log('🎵 AudioDebugger: Enabled - monitoring audio performance');
        
        // Add debug controls to page
        this.addDebugControls();
    }

    /**
     * Disable audio debugging
     */
    disable() {
        this.enabled = false;
        this.stopMonitoring();
        this.removeDebugControls();
        console.log('🎵 AudioDebugger: Disabled');
    }

    /**
     * Log an audio event
     */
    logEvent(type, data) {
        if (!this.enabled) return;

        const event = {
            timestamp: Date.now() - this.startTime,
            type,
            data,
            contextState: window.Tone?.context?.state || 'unknown',
            activeVoices: this.getActiveVoiceCount()
        };

        this.events.push(event);

        // Keep events array manageable
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        // Check for performance issues
        this.checkPerformance(event);

        // Log to console if critical
        if (type === 'error' || type === 'warning') {
            console.warn('🎵 AudioDebugger:', type, data);
        }
    }

    /**
     * Check for performance issues
     */
    checkPerformance(event) {
        // Check for too many simultaneous events
        const recentEvents = this.events.filter(e => 
            (event.timestamp - e.timestamp) < 100 && 
            (e.type === 'note_start' || e.type === 'chord_start')
        );

        if (recentEvents.length > 8) {
            this.addWarning('High note density detected - possible audio overload');
        }

        // Check for audio context state changes
        if (event.contextState !== 'running') {
            this.addWarning(`Audio context state: ${event.contextState}`);
        }

        // Check for excessive active voices
        if (event.activeVoices > 16) {
            this.addWarning(`High voice count: ${event.activeVoices} active voices`);
        }
    }

    /**
     * Add a performance warning
     */
    addWarning(message) {
        const warning = {
            timestamp: Date.now() - this.startTime,
            message
        };

        this.performanceWarnings.push(warning);

        // Keep warnings list manageable
        if (this.performanceWarnings.length > 50) {
            this.performanceWarnings.shift();
        }

        console.warn('🎵 AudioDebugger WARNING:', message);
        this.updateDebugDisplay();
    }

    /**
     * Get estimated active voice count
     */
    getActiveVoiceCount() {
        if (!window.Tone?.context) return 0;

        try {
            // Estimate based on recent events
            const now = Date.now() - this.startTime;
            const activeEvents = this.events.filter(e => {
                const age = now - e.timestamp;
                return age < 2000 && (e.type === 'note_start' || e.type === 'chord_start');
            });

            return activeEvents.length;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Start monitoring audio context
     */
    startMonitoring() {
        if (this.audioContextMonitor) return;

        this.audioContextMonitor = setInterval(() => {
            if (window.Tone?.context) {
                const state = window.Tone.context.state;
                if (state !== 'running') {
                    this.logEvent('context_state', { state });
                }
            }
        }, 1000);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.audioContextMonitor) {
            clearInterval(this.audioContextMonitor);
            this.audioContextMonitor = null;
        }
    }

    /**
     * Add debug controls to page
     */
    addDebugControls() {
        if (document.getElementById('audio-debugger-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'audio-debugger-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
            border: 1px solid #444;
        `;

        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">🎵 Audio Debug</div>
            <div id="audio-debug-stats"></div>
            <div id="audio-debug-warnings"></div>
            <div style="margin-top: 8px;">
                <button onclick="audioDebugger.exportReport()" style="font-size: 10px; padding: 4px 8px;">Export Report</button>
                <button onclick="audioDebugger.clear()" style="font-size: 10px; padding: 4px 8px; margin-left: 4px;">Clear</button>
                <button onclick="audioDebugger.disable()" style="font-size: 10px; padding: 4px 8px; margin-left: 4px;">Close</button>
            </div>
        `;

        document.body.appendChild(panel);
        this.updateDebugDisplay();
    }

    /**
     * Remove debug controls
     */
    removeDebugControls() {
        const panel = document.getElementById('audio-debugger-panel');
        if (panel) {
            panel.remove();
        }
    }

    /**
     * Update debug display
     */
    updateDebugDisplay() {
        const statsEl = document.getElementById('audio-debug-stats');
        const warningsEl = document.getElementById('audio-debug-warnings');

        if (!statsEl || !warningsEl) return;

        // Update stats
        const contextState = window.Tone?.context?.state || 'unknown';
        const activeVoices = this.getActiveVoiceCount();
        const recentEvents = this.events.filter(e => 
            (Date.now() - this.startTime - e.timestamp) < 5000
        ).length;

        statsEl.innerHTML = `
            Context: ${contextState}<br>
            Active Voices: ${activeVoices}<br>
            Recent Events: ${recentEvents}<br>
            Total Events: ${this.events.length}
        `;

        // Update warnings
        const recentWarnings = this.performanceWarnings.slice(-3);
        warningsEl.innerHTML = recentWarnings.length > 0 
            ? '<div style="color: #ff6b6b; margin-top: 8px;">Warnings:</div>' + 
              recentWarnings.map(w => `<div style="font-size: 10px; color: #ffaa66;">${w.message}</div>`).join('')
            : '<div style="color: #66ff66; margin-top: 8px;">No issues detected</div>';
    }

    /**
     * Clear debug data
     */
    clear() {
        this.events = [];
        this.performanceWarnings = [];
        this.startTime = Date.now();
        this.updateDebugDisplay();
        console.log('🎵 AudioDebugger: Data cleared');
    }

    /**
     * Export debug report
     */
    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            sessionDuration: Date.now() - this.startTime,
            events: this.events,
            warnings: this.performanceWarnings,
            contextState: window.Tone?.context?.state,
            userAgent: navigator.userAgent
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gigso-audio-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('🎵 AudioDebugger: Report exported');
    }

    /**
     * Get summary report
     */
    getSummary() {
        return {
            enabled: this.enabled,
            totalEvents: this.events.length,
            warnings: this.performanceWarnings.length,
            sessionDuration: Date.now() - this.startTime,
            contextState: window.Tone?.context?.state,
            activeVoices: this.getActiveVoiceCount()
        };
    }
}

// Create global instance
const audioDebugger = new AudioDebugger();

// Make available globally for debugging
window.audioDebugger = audioDebugger;

// Auto-enable in development (when localhost detected)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Add keyboard shortcut to toggle debugging
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+A to toggle audio debugging
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            if (audioDebugger.enabled) {
                audioDebugger.disable();
            } else {
                audioDebugger.enable();
            }
        }
    });
    
    console.log('🎵 AudioDebugger: Press Ctrl+Shift+A to toggle audio debugging');
}

export default audioDebugger;