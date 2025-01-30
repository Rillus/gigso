import PlayButton from '../play-button/play-button.js';
import StopButton from '../stop-button/stop-button.js';
import LoopButton from '../loop-button/loop-button.js';
import ElementHandlers from '../../helpers/elementHandlers.js';
const { addElement } = ElementHandlers;

export default class TransportControls extends HTMLElement {
    constructor() {
        super();
        const template = `
        <div>
        </div>
        `;
        
        // super(`<div></div>`, styles, false);
        this.initialised = false;
        // add div to shadow root
    }
    
    connectedCallback() {
        if (this.initialised) return;
        this.initialised = true;
        
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
        
        this.innerHTML = `<style>${styles}</style>
            <div class="transport-controls" data-testid="transport-controls"></div>`;

        this.playButton = new PlayButton();
        this.stopButton = new StopButton();
        this.loopButton = new LoopButton();

        this.querySelector('.transport-controls').append(this.playButton, this.stopButton, this.loopButton);
        // addElement({ tag: 'play-button' }, this.querySelector('.transport-controls'));
        // addElement({ tag: 'stop-button' }, this.querySelector('.transport-controls'));
        // addElement({ tag: 'loop-button' }, this.querySelector('.transport-controls'));
    
        // this.querySelector('.transport-controls').append(this.playButton, this.stopButton, this.loopButton);
    }
}

customElements.define('transport-controls', TransportControls); 