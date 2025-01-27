import BaseComponent from '../base-component.js';

export default class TransportControls extends BaseComponent {
    constructor() {
        const template = `
            <div class="transport-controls" data-testid="transport-controls">
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
            }

            .transport-controls > *:first-child button {
                border-radius: 5px 0 0 5px;
            }

            .transport-controls > *:last-child button {
                border-radius: 0 5px 5px 0;
            }
        `;
        super(template, styles, false);
    }
}

customElements.define('transport-controls', TransportControls); 