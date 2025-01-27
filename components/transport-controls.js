import BaseComponent from './base-component.js';

class TransportControls extends BaseComponent {
    constructor() {
        const template = `
            <div class="transport-controls">
                <play-button></play-button>
                <stop-button></stop-button>
                <loop-button></loop-button>
            </div>
        `;
        const styles = `
            .transport-controls {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 10px;

                *:first-child {
                  button {
                    border-radius: 5px 0 0 5px;
                  }
                }

                *:last-child {
                  button {
                    border-radius: 0 5px 5px 0;
                  }
                }
            }
        `;
        super(template, styles, false);
    }
}

customElements.define('transport-controls', TransportControls); 