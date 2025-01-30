import BaseComponent from '../base-component.js';

export default class StopButton extends HTMLElement {
    constructor() {
        super();
        this.initialised = false;
    }
    
    connectedCallback() {
        if (this.initialised) return;
        this.initialised = true;

        const template = `
            <button id="stop-button" class="transport-button">&#9632;</button>
        `;
        const styles = `
            <style>
                #stop-button {
                    font-size: 18px;
                    line-height: 17px;
                }
            </style>
        `;
        this.innerHTML = styles + template;
        this.button = this.querySelector('button');

        this.button.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('stop-clicked', { bubbles: true, composed: true }));
        });

        // Listen for custom events to update button state
        this.addEventListener('activate', () => this.activate());
        this.addEventListener('deactivate', () => this.deactivate());
    }

    activate() {
        this.button.classList.add('active');

        setTimeout(() => {
            console.log('deactivating stop button');
            this.deactivate();
        }, 300);
    }

    deactivate() {
        this.button.classList.remove('active');
    }
}

customElements.define('stop-button', StopButton); 