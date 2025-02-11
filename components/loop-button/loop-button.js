import BaseComponent from '../base-component.js';

export default class LoopButton extends HTMLElement {
    constructor() {
        super();
        this.initialised = false;
    }
    
    connectedCallback() {
        if (this.initialised) return;
        this.initialised = true;

        this.svgEffects = `
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
            <button id="loop-button" class="transport-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -2 54 54.5">
                    <path 
                        fill="url(#playGradient)"
                        filter="url(#inset-shadow)"
                        d="M 1.5526467,0.15640907 H 52.645611 V 3.9998111 L 49.169077,6.0069956 V 29.190824 l 3.393999,1.863407 0.0638,5.30021 H 24.912009 l -9.471348,0.469921 8.491892,6.882749 6.641632,-0.04197 0.04034,4.332894 -5.681051,6.306266 C 17.197085,48.251392 8.9075327,41.844452 1.5900206,36.354487 l -0.063806,-5.42738 C 8.7241663,25.303464 17.09553,18.821538 24.913723,12.226251 l 4.727731,5.104058 0.08356,4.20834 -5.362441,0.06477 -8.946306,7.241801 26.742672,0.156815 0.154809,-23.1592262 -31.03312,0.092022 0.03301,9.3439452 L 4.0983428,20.907601 4.0605439,5.8576636 1.5568503,3.6837637 Z" 
                    />
                </svg>
            </button>
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