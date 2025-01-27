import BaseComponent from './base-component.js';

class LoopButton extends BaseComponent {
    constructor() {
        const template = `
            <button id="loop-button" class="transport-button">&#x21BB;</button>
        `;
        const styles = `
            #loop-button {
                font-size: 18px;
                line-height: 17px;
            }
        `;
        super(template, styles, false);
        this.button = this.querySelector('button');
    }

    connectedCallback() {
        this.button.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('loop-clicked', { bubbles: true, composed: true }));
        });

        // Listen for custom events to update button state
        this.addEventListener('activate', () => this.activate());
        this.addEventListener('deactivate', () => this.deactivate());
    }

    activate() {
        this.button.classList.add('active');
    }

    deactivate() {
        this.button.classList.remove('active');
    }
}

customElements.define('loop-button', LoopButton); 