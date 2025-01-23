import "./components/gigso-keyboard/gigso-keyboard.js"; // Import the tone-keyboard component

export class TonePiano extends HTMLElement {
    render() {
        return html`
            <style>
                :host {
                    display: block;
                }

                #container {
                    background-color: var(--color-light-gray);
                    position: relative;
                    padding: 5px;
                    display: block;
                }

                tone-keyboard {
                    display: block;
                    clear: both;
                }
            </style>
            <div id="container">
                <tone-keyboard></tone-keyboard>
            </div>
        `;
    }
}
