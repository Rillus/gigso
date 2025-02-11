import BaseComponent from '../base-component.js';

export default class StopButton extends HTMLElement {
    constructor() {
        super();
        this.initialised = false;
    }
    
    connectedCallback() {
        if (this.initialised) return;
        this.initialised = true;

        const svgEffects = `
        <defs>
          <linearGradient id="playGradient" x1="0%" y1="120%" x2="0%" y2="5%">
            <stop offset="0%" style="stop-color:rgb(83, 83, 83);" />
            <stop offset="65%" style="stop-color:rgb(255, 226, 173);" />
            <stop offset="66%" style="stop-color:rgba(255,255,255,1);" />
            <stop offset="68%" style="stop-color:rgba(255,255,255,1);" />
            <stop offset="100%" style="stop-color:rgb(180, 237, 255);" />
          </linearGradient>
          <filter id="inset-shadow">
            <feComponentTransfer in="SourceAlpha">
              <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feOffset dx="1" dy="2" result="offsetblur" />
            <feFlood flood-color="rgba(0,0,0,0.7)" />
            <feComposite in2="offsetblur" operator="in" />
            <feComposite in2="SourceAlpha" operator="in" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode />
            </feMerge>
          </filter>
        </defs>`;

        const template = `
            <button id="stop-button" class="transport-button">
                <svg id="stop-button-svg" viewBox="0 0 54 54.5">
                    ${svgEffects}
                    <path 
                        fill="url(#playGradient)"
                        filter="url(#inset-shadow)"
                        d="M 0.63624263,0.43469638 H 53.453657 V 4.5493635 L 49.859784,6.6982114 V 48.655207 l 3.508553,1.99493 0.06596,3.532179 H 0.67488138 L 0.60891994,50.513986 4.0270513,48.476159 3.9938263,6.5446945 0.68232769,4.4250064 Z" 
                    />
                </svg>
            </button>
        `;
        const styles = `
            <style>
                #stop-button-svg {
                    width: 30px;
                }
            </style>
        `;
        this.innerHTML = styles + template;
        this.button = this.querySelector('button');

        this.button.addEventListener('click', () => {
            this.activate();
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