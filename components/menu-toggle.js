class MenuToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .menu {
                    display: flex;
                    flex-direction: column;
                    margin: 10px;
                }
                button {
                    margin: 5px 0;
                    padding: 10px;
                    font-size: 16px;
                    cursor: pointer;
                }
            </style>
            <div class="menu">
                <button data-target="current-chord-display">Toggle Chord Display</button>
                <button data-target="gigso-keyboard">Toggle Keyboard</button>
            </div>
        `;
    }

    connectedCallback() {
        this.shadowRoot.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-target');
                const element = document.querySelector(target);
                if (element) {
                    element.style.display = element.style.display === 'none' ? 'block' : 'none';
                }
            });
        });
    }
}

customElements.define('menu-toggle', MenuToggle); 