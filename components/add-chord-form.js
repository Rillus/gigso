import BaseComponent from './base-component.js';

class AddChordForm extends BaseComponent {
    constructor() {
        const template = `
            <div class="form-container">
                <label>
                    Chord Name:
                    <input type="text" id="chord-name" placeholder="e.g., C Major" />
                </label>
                <label>
                    Notes (comma-separated):
                    <input type="text" id="chord-notes" placeholder="e.g., C4,E4,G4" />
                </label>
                <label>
                    Duration (in beats):
                    <input type="number" id="chord-duration" value="1" min="0.1" step="0.1" />
                </label>
                <label>
                    Delay (in beats):
                    <input type="number" id="chord-delay" value="0" min="0" step="0.1" />
                </label>
                <button id="add-chord-button">Add Chord</button>
            </div>
        `;
        const styles = `
          .form-container {
              display: flex;
              flex-direction: column;
              gap: 10px;
              padding: 10px;
              border: 1px solid #ccc;
              background: #f9f9f9;
              margin-bottom: 10px;
          }
          label {
              font-size: 14px;
          }
          input, button {
              padding: 5px;
              font-size: 14px;
          }
        `;
        super(template, styles);
        this.addEventListeners([
            {selector: '#add-chord-button', event: 'click', handler: () => this.addChord()},
        ]);
    }

    addChord() {
        const name = this.shadowRoot.querySelector('#chord-name').value.trim();
        const notes = this.shadowRoot.querySelector('#chord-notes').value.split(',').map(note => note.trim());
        const duration = parseFloat(this.shadowRoot.querySelector('#chord-duration').value);
        const delay = parseFloat(this.shadowRoot.querySelector('#chord-delay').value);

        if (name && notes.length > 0 && duration > 0) {
            const chord = { name, notes, duration, delay };
            this.dispatchComponentEvent(null, 'add-chord', chord);
            this.clearForm();
        } else {
            alert('Please fill in all fields correctly.');
        }
    }

    clearForm() {
        this.shadowRoot.querySelector('#chord-name').value = '';
        this.shadowRoot.querySelector('#chord-notes').value = '';
        this.shadowRoot.querySelector('#chord-duration').value = '1';
        this.shadowRoot.querySelector('#chord-delay').value = '0';
    }
}

customElements.define('add-chord-form', AddChordForm); 