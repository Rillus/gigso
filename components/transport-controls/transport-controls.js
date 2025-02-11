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
                position: relative;
                width: 156px;
                margin: 0 auto;
                perspective: 1000px;
                transform: translateZ(0);
                transform-style: preserve-3d;
                transform-origin: center;
            }
    
            .transport-controls play-button .transport-button {
                border-radius: 5px 0 0 5px;
                border-left-width: 2px;
            }

            .transport-controls loop-button .transport-button {
                border-radius: 0 5px 5px 0;
                border-right-width: 2px;
            }

            .transport-button {
                background-color: var(--colour-primary);
                background-image: linear-gradient(0deg, rgba(2,0,36,1) 0%, rgb(84, 65, 30) 65%, rgb(88, 88, 88) 66%, rgb(80, 80, 80) 68%, rgb(0, 68, 89) 100%);
                border: 2px solid #a6a6a6;
                border-width: 2px 1px;
                border-top-color: #cccccc;
                border-left-color: #aaaaaa;
                border-right-color: #666666;
                border-bottom-color: #666666;
                padding: 5px 10px;
                cursor: pointer;
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.6);
                transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
                font-size: 0;
                line-height: 0;
                position: relative;
                width: 52px;
                height: 45px;
            }

            .transport-button:hover {
                background-color: #d6d6d6;
            }

            .transport-button.active {
                background-color: #b6b6b6;
                box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2),
                    inset 2px 2px 1px rgba(0, 0, 0, 0.5);
                border-top-color: #666666;
                border-left-color: #666666;
                border-right-color: #aaaaaa;
                border-bottom-color: #cccccc;
                transform: scale(0.95);
            }

            .transport-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                margin: 1px 1px 0;
                border-radius: 0;
                width: calc(100% - 2px);
                height: 15%;
                background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.6) 15%, rgba(255, 255, 255, 0.8) 18%, rgba(255, 255, 255, 0) 100%);
                pointer-events: none;
                z-index: 1;
            }

            .transport-controls play-button .transport-button::before {
                border-radius: 2px 0 0 0;
            }

            .transport-controls loop-button .transport-button::before {
                border-radius: 0 2px 0 0;
                width: calc(100% - 2px);
                margin-left: 1px;
                margin-right: 1px;
            }
            
            .transport-button::after {
                border-radius: 0;
                content: '';
                position: absolute;
                left: 0;
                bottom: 0;
                margin: 1px 1px;
                width: calc(100% - 2px);
                height: 10%;
                background: linear-gradient(to top, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%);
                pointer-events: none;
                z-index: 1;
            }

            .transport-controls play-button .transport-button::after {
                border-radius: 0 0 0 2px;
            }

            .transport-controls loop-button .transport-button::after {
                border-radius: 0 0 2px 0;
                width: calc(100% - 2px);
                margin-left: 1px;
                margin-right: 1px;
            }

            .lens-flare-container {
                position: absolute;
                top: 2px;
                left: 2px;
                border-radius: 3px;
                width: calc(100% - 4px);
                height: calc(100% - 4px);
                overflow: hidden;
            }

            .lens-flare {
                position: absolute;
                top: 2%;
                left: 0;
                width: 50px;
                height: 50px;
                background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 20%, rgba(255,255,255,0) 60%);
                pointer-events: none;
                z-index: 2;
                transform: translate(0px, -50%);
                transition: transform 0.2s ease, opacity 0.2s ease;
                opacity: 0;
            }

            .lens-flare::after {
                content: '';
                position: absolute;
                top: 110%;
                left: -100%;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 20%, rgba(255,255,255,0) 60%);
            }
        `;
        
        this.innerHTML = `<style>${styles}</style>
            <div class="transport-controls" data-testid="transport-controls">
                <div class="lens-flare-container">
                    <div class="lens-flare"></div>
                </div>
            </div>`;

        this.playButton = new PlayButton();
        this.stopButton = new StopButton();
        this.loopButton = new LoopButton();

        this.querySelector('.transport-controls').append(this.playButton, this.stopButton, this.loopButton);

        const lensFlare = this.querySelector('.lens-flare');
        const transportControls = this.querySelector('.transport-controls');

        transportControls.addEventListener('mousemove', (event) => {
            const rect = transportControls.getBoundingClientRect();
            const x = event.clientX - rect.left;
            lensFlare.style.transform = `translate(calc(${x}px - 50%), -50%)`;
        });

        transportControls.addEventListener('mouseleave', () => {
            lensFlare.style.opacity = '0';
            lensFlare.style.transform = `translate(0px, -50%)`;
        });
        
        transportControls.addEventListener('mouseenter', () => {
            lensFlare.style.opacity = '1';
        });
    }
}

customElements.define('transport-controls', TransportControls); 