import BaseComponent from './base-component.js';

class StopButton extends BaseComponent {
    constructor() {
        const template = `
            <button id="stop-button" class="transport-button">&#9632;</button>
        `;
        const styles = `
            #stop-button {
                font-size: 18px;
                line-height: 17px;
            }
        `;

        super(template, styles, false);
        this.button = this.querySelector('button');
    }

    connectedCallback() {
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