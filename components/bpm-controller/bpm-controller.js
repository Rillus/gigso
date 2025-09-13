import State from '../../state/state.js';

export default class BpmController extends HTMLElement {
    constructor() {
        super();
        this.initialised = false;
        
        // Configuration with defaults
        this.minBpm = 60;
        this.maxBpm = 200;
        this.stepSize = 5;
        this.defaultBpm = 120;
        
        // Internal state
        this.isEditing = false;
        this.previousValue = null;
    }
    
    connectedCallback() {
        if (this.initialised) {
            // Re-initialise if already connected (for testing)
            this.initialiseBpm();
            return;
        }
        this.initialised = true;

        this.parseAttributes();
        this.createTemplate();
        this.setupEventListeners();
        this.initialiseBpm();
    }

    parseAttributes() {
        // Parse configuration from attributes
        if (this.hasAttribute('initial-bpm')) {
            const value = parseInt(this.getAttribute('initial-bpm'), 10);
            this.defaultBpm = isNaN(value) ? this.defaultBpm : value;
        }
        if (this.hasAttribute('min-bpm')) {
            const value = parseInt(this.getAttribute('min-bpm'), 10);
            this.minBpm = isNaN(value) ? this.minBpm : value;
        }
        if (this.hasAttribute('max-bpm')) {
            const value = parseInt(this.getAttribute('max-bpm'), 10);
            this.maxBpm = isNaN(value) ? this.maxBpm : value;
        }
        if (this.hasAttribute('step-size')) {
            const value = parseInt(this.getAttribute('step-size'), 10);
            this.stepSize = isNaN(value) ? this.stepSize : value;
        }
    }

    createTemplate() {
        const template = `
            <div class="bpm-controller">
                <button 
                    class="bpm-button bpm-minus" 
                    data-testid="minus-button"
                    role="button"
                    aria-label="Decrement BPM by ${this.stepSize}"
                    title="Decrease BPM by ${this.stepSize}">
                    −
                </button>
                
                <input 
                    id="bpm-input"
                    type="number" 
                    class="bpm-input" 
                    data-testid="bpm-input"
                    aria-label="BPM (Beats Per Minute)"
                    aria-valuemin="${this.minBpm}"
                    aria-valuemax="${this.maxBpm}"
                    role="spinbutton"
                    min="${this.minBpm}"
                    max="${this.maxBpm}"
                    readonly>
                
                <button 
                    class="bpm-button bpm-plus" 
                    data-testid="plus-button"
                    role="button"
                    aria-label="Increment BPM by ${this.stepSize}"
                    title="Increase BPM by ${this.stepSize}">
                    +
                </button>
                
                <div aria-live="polite" class="sr-only" data-testid="bpm-announcer"></div>
                <div class="error-message" data-testid="error-message" style="display: none;"></div>
            </div>
        `;

        const styles = `
            <style>
                .bpm-controller {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 14px;
                }

                .bpm-button {
                    width: 32px;
                    height: 32px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: #f8f9fa;
                    color: #333;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    min-width: 44px;
                    min-height: 44px;
                }

                .bpm-button:hover {
                    background: #e9ecef;
                    border-color: #007bff;
                }

                .bpm-button:active {
                    background: #dee2e6;
                    transform: translateY(1px);
                }

                .bpm-button:focus {
                    outline: 2px solid #007bff;
                    outline-offset: 2px;
                }

                .bpm-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #f8f9fa;
                }

                .bpm-input {
                    width: 60px;
                    height: 32px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    color: #333;
                    background: #fff;
                    min-width: 44px;
                    min-height: 44px;
                    padding: 0 8px;
                    touch-action: manipulation;
                }

                .bpm-input:focus {
                    outline: 2px solid #007bff;
                    outline-offset: 2px;
                    border-color: #007bff;
                }

                .bpm-input:read-only {
                    background: #f8f9fa;
                    cursor: pointer;
                }

                .bpm-input:read-only:hover {
                    background: #e9ecef;
                    border-color: #007bff;
                }

                .error-message {
                    color: #dc3545;
                    font-size: 12px;
                    margin-top: 4px;
                    text-align: center;
                    width: 100%;
                }

                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }

                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .bpm-button, .bpm-input {
                        border: 2px solid;
                    }
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .bpm-button {
                        transition: none;
                    }
                    
                    .bpm-button:active {
                        transform: none;
                    }
                }
            </style>
        `;

        this.innerHTML = styles + template;
        
        // Get references to elements
        this.minusButton = this.querySelector('[data-testid="minus-button"]');
        this.plusButton = this.querySelector('[data-testid="plus-button"]');
        this.bpmInput = this.querySelector('[data-testid="bpm-input"]');
        this.announcer = this.querySelector('[data-testid="bpm-announcer"]');
        this.errorMessage = this.querySelector('[data-testid="error-message"]');
    }

    setupEventListeners() {
        // Button click handlers
        this.minusButton.addEventListener('click', () => this.decrementBpm());
        this.plusButton.addEventListener('click', () => this.incrementBpm());
        
        // Button keyboard handlers
        this.minusButton.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.decrementBpm();
            }
        });
        this.plusButton.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.incrementBpm();
            }
        });

        // Input handlers
        this.bpmInput.addEventListener('click', () => this.enterEditMode());
        this.bpmInput.addEventListener('blur', () => this.exitEditMode());
        this.bpmInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.bpmInput.addEventListener('input', () => this.handleInput());

        // Custom event handlers
        this.addEventListener('set-bpm', (e) => this.setBpmFromEvent(e.detail.bpm));
        this.addEventListener('reset-bpm', () => this.resetBpm());
        this.addEventListener('transport-bpm-changed', (e) => this.syncWithTransport(e.detail.bpm));
        
        // Listen for BPM changes from other components (for multi-component sync)
        document.addEventListener('bpm-changed', (e) => {
            // Only sync if the event didn't come from this component
            if (e.target !== this) {
                this.syncBpmDisplay(e.detail.bpm);
            }
        });
    }

    initialiseBpm() {
        // Priority order:
        // 1. Custom initial BPM from attributes
        // 2. Tone.js Transport BPM (if available)
        // 3. State BPM
        // 4. Default BPM
        
        const hasCustomInitialBpm = this.hasAttribute('initial-bpm');
        let initialBpm = this.defaultBpm;
        
        if (hasCustomInitialBpm) {
            // Use attribute value
            initialBpm = this.defaultBpm;
        } else {
            // Try to sync with Transport BPM
            let transportBpm = null;
            try {
                if (window.Tone && window.Tone.Transport) {
                    transportBpm = window.Tone.Transport.bpm.value;
                }
            } catch (error) {
                console.warn('Failed to read Tone.js Transport BPM:', error);
            }
            
            const stateBpm = State.bpm();
            
            // Use Transport BPM if available, otherwise state BPM, otherwise default
            initialBpm = transportBpm || stateBpm || this.defaultBpm;
        }
        
        // Set the input value directly first
        this.bpmInput.value = initialBpm.toString();
        this.bpmInput.setAttribute('aria-valuenow', initialBpm);
        
        // Update state if it's different
        const currentStateBpm = State.bpm();
        if (currentStateBpm !== initialBpm) {
            State.setBpm(initialBpm);
        }
        
        this.updateButtonStates();
    }

    incrementBpm() {
        const currentBpm = this.getCurrentBpm();
        const newBpm = Math.min(currentBpm + this.stepSize, this.maxBpm);
        
        if (newBpm !== currentBpm) {
            this.setBpmValue(newBpm);
        } else {
            this.announce(`Maximum BPM of ${this.maxBpm} reached`);
        }
    }

    decrementBpm() {
        const currentBpm = this.getCurrentBpm();
        const newBpm = Math.max(currentBpm - this.stepSize, this.minBpm);
        
        if (newBpm !== currentBpm) {
            this.setBpmValue(newBpm);
        } else {
            this.announce(`Minimum BPM of ${this.minBpm} reached`);
        }
    }

    enterEditMode() {
        if (this.bpmInput.readOnly) {
            this.isEditing = true;
            this.previousValue = this.getCurrentBpm();
            this.bpmInput.readOnly = false;
            this.bpmInput.focus();
            this.bpmInput.select();
        }
    }

    exitEditMode() {
        if (this.isEditing) {
            this.commitInput();
        }
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.commitInput();
                break;
            case 'Escape':
                e.preventDefault();
                this.cancelInput();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.incrementBpm();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.decrementBpm();
                break;
        }
    }

    handleInput() {
        // Clear any existing error message
        this.clearError();
    }

    commitInput() {
        const inputValue = this.bpmInput.value.trim();
        const newBpm = this.validateAndClampBpm(inputValue);
        
        if (newBpm !== null) {
            this.setBpmValue(newBpm);
            this.isEditing = false;
            this.bpmInput.readOnly = true;
        } else {
            this.showError('Please enter a valid BPM between ' + this.minBpm + ' and ' + this.maxBpm);
            // Revert to previous value
            this.bpmInput.value = this.previousValue.toString();
            this.isEditing = false;
            this.bpmInput.readOnly = true;
        }
    }

    cancelInput() {
        this.bpmInput.value = this.previousValue;
        this.isEditing = false;
        this.bpmInput.readOnly = true;
        this.clearError();
    }

    validateAndClampBpm(value) {
        const numValue = parseInt(value, 10);
        
        if (isNaN(numValue) || value === '' || value === null) {
            return null;
        }
        
        return Math.max(this.minBpm, Math.min(numValue, this.maxBpm));
    }

    setBpmValue(bpm, updateState = true) {
        const previousBpm = this.getCurrentBpm();
        
        // Update UI
        this.bpmInput.value = bpm.toString();
        this.bpmInput.setAttribute('aria-valuenow', bpm);
        
        // Update state
        if (updateState) {
            State.setBpm(bpm);
        }
        
        // Update Tone.js Transport if available
        this.updateTransportBpm(bpm);
        
        // Update button states
        this.updateButtonStates();
        
        // Dispatch change event
        this.dispatchBpmChangedEvent(bpm, previousBpm);
        
        // Announce change
        this.announce(`BPM changed to ${bpm}`);
    }

    updateTransportBpm(bpm) {
        try {
            if (window.Tone && window.Tone.Transport) {
                window.Tone.Transport.bpm.value = bpm;
            }
        } catch (error) {
            console.warn('Failed to update Tone.js Transport BPM:', error);
        }
    }

    updateButtonStates() {
        const currentBpm = this.getCurrentBpm();
        
        this.minusButton.disabled = currentBpm <= this.minBpm;
        this.plusButton.disabled = currentBpm >= this.maxBpm;
    }

    dispatchBpmChangedEvent(newBpm, previousBpm) {
        const event = new CustomEvent('bpm-changed', {
            detail: {
                bpm: newBpm,
                previousBpm: previousBpm
            },
            bubbles: true,
            composed: true
        });
        
        this.dispatchEvent(event);
    }

    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
            // Clear after a short delay to allow screen readers to announce
            setTimeout(() => {
                this.announcer.textContent = '';
            }, 1000);
        }
    }

    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
            this.errorMessage.id = 'bpm-error-' + Date.now();
            this.bpmInput.setAttribute('aria-describedby', this.errorMessage.id);
            this.announce(message);
        }
    }

    clearError() {
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
            this.errorMessage.textContent = '';
            this.bpmInput.removeAttribute('aria-describedby');
        }
    }

    setBpmFromEvent(bpm) {
        const validatedBpm = this.validateAndClampBpm(bpm);
        if (validatedBpm !== null) {
            this.setBpmValue(validatedBpm);
        }
    }

    resetBpm() {
        this.setBpmValue(this.defaultBpm);
    }

    syncWithTransport(bpm) {
        this.setBpmValue(bpm, false);
    }
    
    syncBpmDisplay(bpm) {
        // Update display only, don't update state or trigger events
        const validatedBpm = this.validateAndClampBpm(bpm);
        if (validatedBpm !== null) {
            this.bpmInput.value = validatedBpm.toString();
            this.bpmInput.setAttribute('aria-valuenow', validatedBpm);
            this.updateButtonStates();
        }
    }

    getCurrentBpm() {
        return parseInt(this.bpmInput.value, 10) || this.defaultBpm;
    }

    // Public API methods
    getBpm() {
        return this.getCurrentBpm();
    }

    setBpm(bpm) {
        this.setBpmValue(bpm);
    }
}

customElements.define('bpm-controller', BpmController);
