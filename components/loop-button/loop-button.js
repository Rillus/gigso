import BaseComponent from '../base-component.js';

export default class LoopButton extends HTMLElement {
    constructor() {
        super();
        this.initialised = false;
    }
    
    connectedCallback() {
        if (this.initialised) return;
        this.initialised = true;

        const template = `
            <button id="loop-button" class="transport-button">&#x21BB;</button>
        `;
        const styles = `
            <style>
                #loop-button {
                    font-size: 18px;
                    line-height: 17px;
                }
            </style>
        `;
        this.innerHTML = styles + template;
        this.button = this.querySelector('button');

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