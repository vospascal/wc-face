class MyCheckbox extends HTMLElement {
    static formAssociated = true; // Explicitly mark as form-associated

    constructor() {
        super();
        this._internals = this.attachInternals();

        // Attach a shadow root to the custom element
        const shadow = this.attachShadow({ mode: 'open' });

        // Create and append the internal checkbox input
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.style.display = 'none';

        // Create and append a label for custom styling
        const label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.textContent = this.getAttribute('label') || '';

        // Append the input and label to the shadow root
        shadow.appendChild(input);
        shadow.appendChild(label);

        // Styling
        const style = document.createElement('style');
        style.textContent = `
          label {
            /* Example Styling */
            display: inline-block;
            padding: 10px;
            background-color: #eee;
            border: 1px solid #ddd;
            border-radius: 3px;
            cursor: pointer;
          }
          label:hover {
            background-color: #dcdcdc;
          }
          input[type="checkbox"]:checked + label {
            background-color: #bada55;
            border-color: #a5a5a5;
          }
        `;

        // Append style to the shadow root
        shadow.appendChild(style);

        this._input = input;
        this._label = label;

        this.addEventListener('click', () => {
            this.checked = !this.checked;
        });
    }

    get checked() {
        return this._input.checked;
    }

    set checked(value) {
        const isChecked = Boolean(value);
        this._input.checked = isChecked;
        this.toggleAttribute('checked', isChecked);
    }

    get name() {
        return this.getAttribute('name');
    }

    set name(value) {
        this.setAttribute('name', value);
    }

    get value() {
        return this.getAttribute('value') || 'on'; // Default value if none is set
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    // Optionally, if you want to observe attribute changes
    static get observedAttributes() {
        return ['checked'];
    }

    connectedCallback() {
        this._form = this.closest('form');
        if (this._form) {
            this._form.addEventListener('submit', this._onSubmit.bind(this));
            this._form.addEventListener('reset', this._onReset.bind(this));
        }
    }

    disconnectedCallback() {
        if (this._form) {
            this._form.removeEventListener('submit', this._onSubmit.bind(this));
            this._form.removeEventListener('reset', this._onReset.bind(this));
            // Handle disassociation from the form
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'checked') {
            this.checked = this.hasAttribute('checked');
            // Update the form value when checked status changes
            this._internals.setFormValue(this.checked ? this.value : null);
        }
    }

    _onSubmit(event) {
        // Include the value in the form submission if checked
        if (this.checked) {
            const formData = new FormData(this._form);
            formData.append(this.name, this.value);
            // process formData or handle submission
        }
    }

    _onReset(event) {
        // Reset to default state
        this.checked = false;
    }
}

customElements.define('my-checkbox', MyCheckbox);
