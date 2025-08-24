/**
 * Audio Utilities for Gigso Components
 * Provides helper functions for managing audio dependencies and context
 */

/**
 * Check if Tone.js is available and provide helpful error messages
 * @returns {Object} Status object with available, error, and message properties
 */
export function checkToneJsStatus() {
    if (typeof Tone === 'undefined') {
        return {
            available: false,
            error: 'TONE_JS_MISSING',
            message: 'Tone.js library is not loaded. Please ensure Tone.js is included in your page.',
            solution: 'Add <script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script> to your HTML head section.'
        };
    }
    
    if (!Tone.context) {
        return {
            available: false,
            error: 'TONE_CONTEXT_MISSING',
            message: 'Tone.js context is not available.',
            solution: 'Tone.js may not be fully initialized. Try refreshing the page.'
        };
    }
    
    return {
        available: true,
        error: null,
        message: 'Tone.js is available and ready.',
        solution: null
    };
}

/**
 * Attempt to initialize Tone.js audio context
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function initializeToneJs() {
    const status = checkToneJsStatus();
    
    if (!status.available) {
        console.error('AudioUtils: Cannot initialize Tone.js:', status.message);
        return false;
    }
    
    try {
        // Check if audio context is already running
        if (Tone.context.state === 'running') {
            console.log('AudioUtils: Tone.js context already running');
            return true;
        }
        
        // Start the audio context
        await Tone.start();
        console.log('AudioUtils: Tone.js context started successfully');
        return true;
    } catch (error) {
        console.error('AudioUtils: Error starting Tone.js context:', error);
        return false;
    }
}

/**
 * Get a user-friendly error message for audio-related issues
 * @param {string} componentName - Name of the component experiencing the issue
 * @param {string} errorType - Type of error (e.g., 'TONE_JS_MISSING', 'AUDIO_CONTEXT_FAILED')
 * @returns {string} User-friendly error message
 */
export function getAudioErrorMessage(componentName, errorType) {
    const messages = {
        'TONE_JS_MISSING': `${componentName}: Audio functionality requires Tone.js library. Please ensure the page includes the Tone.js script.`,
        'TONE_CONTEXT_MISSING': `${componentName}: Audio context is not available. Try refreshing the page or clicking to enable audio.`,
        'AUDIO_CONTEXT_FAILED': `${componentName}: Failed to start audio context. This may be due to browser restrictions or user interaction requirements.`,
        'AUDIO_NOT_SUPPORTED': `${componentName}: Audio is not supported in this browser or context.`,
        'USER_INTERACTION_REQUIRED': `${componentName}: Audio requires user interaction. Click or tap to enable audio functionality.`
    };
    
    return messages[errorType] || `${componentName}: Unknown audio error occurred.`;
}

/**
 * Create a fallback audio element for when Tone.js is not available
 * @param {string} componentName - Name of the component
 * @returns {HTMLElement} Fallback element with error message
 */
export function createAudioFallbackElement(componentName) {
    const fallback = document.createElement('div');
    fallback.className = 'audio-fallback';
    fallback.innerHTML = `
        <div style="
            padding: 20px;
            text-align: center;
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            color: #6c757d;
        ">
            <div style="font-size: 24px; margin-bottom: 10px;">🔇</div>
            <div style="font-weight: 600; margin-bottom: 8px;">Audio Not Available</div>
            <div style="font-size: 14px; line-height: 1.4;">
                The ${componentName} component requires Tone.js for audio functionality.<br>
                Please ensure your page includes: <br>
                <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                    &lt;script src="https://unpkg.com/tone@14.7.77/build/Tone.js"&gt;&lt;/script&gt;
                </code>
            </div>
        </div>
    `;
    
    return fallback;
}

/**
 * Check if the current context supports audio (browser compatibility check)
 * @returns {boolean} True if audio is supported
 */
export function isAudioSupported() {
    return typeof AudioContext !== 'undefined' || 
           typeof webkitAudioContext !== 'undefined' || 
           typeof Tone !== 'undefined';
}

/**
 * Log audio status for debugging purposes
 * @param {string} componentName - Name of the component
 */
export function logAudioStatus(componentName) {
    const status = checkToneJsStatus();
    const audioSupported = isAudioSupported();
    
    console.group(`${componentName} - Audio Status Check`);
    console.log('Audio Support:', audioSupported);
    console.log('Tone.js Status:', status);
    
    if (typeof Tone !== 'undefined') {
        console.log('Tone.js Version:', Tone.version);
        console.log('Tone Context State:', Tone.context?.state);
    }
    
    console.groupEnd();
    
    return { status, audioSupported };
}
