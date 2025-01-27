import BaseComponent from "../base-component.js";

class GigsoMenu extends BaseComponent {
    constructor() {
        const template = `
            <div class="menu"></div>
        `;

        const styles = `
          .menu {
            display: flex;
            flex-direction: row;
            flex-wrap: no-wrap;
            gap: 10px;
          }
          button {
              margin: 5px 0;
              padding: 10px;
              font-size: 16px;
              cursor: pointer;
              width: auto;
          }
          .isOff {
            opacity: 0.5;
          }
          .isOn {
            opacity: 1;
          }
        `;

        super(template, styles);
    }

    connectedCallback() {
      const buttonList = [
        {
          target: "current-chord-display",
          name: "Current Chord Display"
        },
        {
          target: "gigso-keyboard",
          name: "Keyboard"
        },
        {
          target: "add-chord-form",
          name: "Add Chord"
        },
      ];

      const menuElement = this.shadowRoot.querySelector('.menu');

      buttonList.forEach((button) => {
        const newButton = document.createElement('button');
        newButton.setAttribute('data-target', button.target);
        newButton.textContent = `Toggle ${button.name}`;
        newButton.classList.add('isOn');
        newButton.addEventListener('click', () => {
          const element = document.querySelector(button.target);
          if (element) {

            if (element.style.display === 'none') {
              element.style.display = 'block';
              newButton.classList.remove('isOff');
              newButton.classList.add('isOn');
            } else {
              element.style.display = 'none';
              newButton.classList.remove('isOn');
              newButton.classList.add('isOff');
            }
          }
        });
        menuElement.appendChild(newButton);
      })
    }
}

customElements.define('gigso-menu', GigsoMenu);
