import BaseComponent from './base-component.js';

class PlayButton extends BaseComponent {
    constructor() {
      const template = `
          <button id="play-button" class="transport-button">&#9654;</button>
      `;
      super(template, null, false);
      this.button = this.querySelector('#play-button');
    }

    connectedCallback() {
      this.addEventListeners([
          { selector: 'button', event: 'click', handler: () => this.handleClick() },
          { selector: null, event: 'activate', handler: () => this.activate() },
          { selector: null, event: 'deactivate', handler: () => this.deactivate() }
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