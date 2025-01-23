class LoopButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                button {
                    font-size: 24px;
                    background: none;
                    border: none;
                    cursor: pointer;
                }
                button.active {
                    color: blue; /* Change this to your desired active color */
                }
            </style>
            <button>&#x21BB;</button> <!-- Unicode for clockwise open circle arrow -->
        `;
        this.button = this.shadowRoot.querySelector('button');
    }

    connectedCallback() {
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