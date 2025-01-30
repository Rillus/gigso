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

      const template = `<button id="play-button" data-testid="play-button" class="transport-button">&#9654;</button>`;
      this.innerHTML = template;
      this.button = this.querySelector('#play-button');
      
      EventHandlers.addEventListeners([
          { selector: 'button', event: 'click', handler: () => this.handleClick() },
          { selector: this, event: 'activate', handler: () => this.activate() },
          { selector: this, event: 'deactivate', handler: () => this.deactivate() }
      ]);
    }

    handleClick() {
      this.dispatchEvent(new CustomEvent('play-clicked', { bubbles: true, composed: true }));
    }

    activate() {
        this.button.classList.add('active');
    }

    deactivate() {
        this.button.classList.remove('active');
    }
}

customElements.define('play-button', PlayButton); 