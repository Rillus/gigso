import Actions from '../actions/actions.js';
const { changeInstrument } = Actions;

export default class InstrumentSelect extends HTMLElement {
  constructor() {
    super();

    // Create a shadow root
    this.attachShadow({ mode: 'open' });

    // Define the instrument options
    this.instruments = [
      'Guitar',
      'Mandolin', 
      'Ukulele' 
    ];

    // Create the select element
    const select = document.createElement('select');
    select.setAttribute('id', 'instrument-select');

    // Create and append options
    this.instruments.forEach(instrument => {
      const option = document.createElement('option');
      option.value = instrument.toLowerCase();
      option.textContent = instrument;
      select.appendChild(option);
    });

    // Create a label
    const label = document.createElement('label');
    label.setAttribute('for', 'instrument-select');
    label.textContent = 'Choose an instrument: ';

    // Add some basic styling
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-block;
        font-family: sans-serif;
      }
      label {
        margin-right: 5px;
      }
      select {
        padding: 5px;
        border-radius: 3px;
        border: 1px solid #ccc;
      }
    `;

    // Append the elements to the shadow root
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(label);
    this.shadowRoot.appendChild(select);

    // Add event listener for changes
    select.addEventListener('change', (event) => {
      const selectedInstrument = event.target.value;
      changeInstrument(selectedInstrument);
      
      // Dispatch instrument-selected event for other components to listen to
      this.dispatchEvent(new CustomEvent('instrument-selected', {
        detail: selectedInstrument,
        bubbles: true,
        composed: true
      }));
    });
  }

  // Optional: Define observed attributes and attributeChangedCallback if needed
  // static get observedAttributes() {
  //   return [/* attribute names */];
  // }

  // attributeChangedCallback(name, oldValue, newValue) {
  //   // Handle attribute changes
  // }

  // Optional: Define connectedCallback and disconnectedCallback if needed
  // connectedCallback() {
  //   // Called when the element is added to the document
  // }

  // disconnectedCallback() {
  //   // Called when the element is removed from the document
  // }

  // Optional: Add methods to interact with the component
  // get value() {
  //   return this.shadowRoot.querySelector('#instrument-select').value;
  // }
}

// Define the new custom element
customElements.define('instrument-select', InstrumentSelect); 