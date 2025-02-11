import BaseComponent from '../base-component.js';
import EventHandlers from '../../helpers/eventHandlers.js';

export default class PlayButton extends HTMLElement {
    constructor() {
      super();
      this.initialised = false;
    }
    
    connectedCallback() {
      if (this.initialised) return;
      this.initialised = true;

      const template = `
        <style>
          #play-button-svg {
            width: 30px;
          }
          #pause-button-svg {
            width: 20px;
          }
        </style>
        <button id="play-button" data-testid="play-button" class="transport-button"></button>`;
      this.innerHTML = template;
      this.button = this.querySelector('#play-button');

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

      this.playButton = `
        <svg id="play-button-svg" viewBox="0 0 54 54.5">
          ${this.svgEffects}
          <path
            fill="url(#playGradient)"
            filter="url(#inset-shadow)"
            d="m 0.5189934,0.54365297 c 3.9145,0 7.00459,-0.0582 11.3807096,-0.0582 8.88064,5.09227803 32.73214,18.68505703 41.63763,23.68989703 -0.0328,1.43109 -0.002,3.82164 -0.002,5.24176 -12.77743,7.61353 -30.51808,18.05927 -41.62723,24.57973 -6.3624596,0 -5.7749096,-0.0735 -11.3572896,-0.0735 0.13386,-7.8974 0.0274,-0.86796 0.0922,-3.8505 1.19961,-0.62351 1.395,-0.85251 2.98657,-2.07106 0,-14.29295 -0.0197,-33.78542 -0.0197,-41.53874 -1.23575,-1.044827 -1.68532,-1.296636 -3.04897,-2.083941 0,-1.57322 -0.0414,-1.69301 -0.0414,-3.83540703 z"
          />
        </svg>`;

      this.button.innerHTML = this.playButton;

      this.pauseButton = `
        <svg id="pause-button-svg" viewBox="6 1 42 54">
          ${this.svgEffects}
          <path
            fill="url(#playGradient)"
            filter="url(#inset-shadow)"
            d="M 6.1680849,0.76383443 H 24.763311 V 4.8296306 L 21.085603,6.9529562 V 48.41162 l 3.590398,1.971235 0.06747,3.490227 H 6.2075989 l -0.06746,-3.62476 3.497861,-2.013624 -0.03396,-41.4334354 -3.388744,-2.094512 z"
          />
          <path
            fill="url(#playGradient)"
            filter="url(#inset-shadow)"
            d="m 29.901562,0.76383443 h 18.59522 V 4.8296306 l -3.6777,2.1233256 V 48.41162 l 3.59039,1.971235 0.0675,3.490227 h -18.53587 l -0.0675,-3.62476 3.49786,-2.013624 -0.034,-41.4334354 -3.38874,-2.094512 z"
          />
        </svg>`;

      EventHandlers.addEventListeners([
          { selector: 'button', event: 'click', handler: () => this.handleClick() },
          { selector: this, event: 'activate', handler: () => this.activate() },
          { selector: this, event: 'deactivate', handler: () => this.deactivate() }
      ]);
    }

    handleClick() {
      if (this.button.classList.contains('active')) {
        this.dispatchEvent(new CustomEvent('pause-clicked', { bubbles: true, composed: true }));
        this.deactivate();
      } else {
        this.dispatchEvent(new CustomEvent('play-clicked', { bubbles: true, composed: true }));
        this.activate();
      }
    }

    activate() {
        this.button.classList.add('active');
        this.button.innerHTML = this.pauseButton;
    }

    deactivate() {
        this.button.classList.remove('active');
        this.button.innerHTML = this.playButton;
    }
}

customElements.define('play-button', PlayButton); 