class MyRadio extends HTMLElement {
    static formAssociated = true; // Explicitly mark as form-associated

    constructor() {
        super();
        this._internals = this.attachInternals();

        // Shadow DOM attachment
        const shadow = this.attachShadow({ mode: 'open' });

        // Internal radio input
        this._input = document.createElement('input');
        this._input.type = 'radio';
        this._input.style.display = 'none';

        // Label for custom styling
        const label = document.createElement('label');
        label.setAttribute('for', this._input.id);
        label.textContent = this.getAttribute('label') || '';

        // Append elements to the shadow root
        shadow.appendChild(this._input);
        shadow.appendChild(label);

        // Styling
        const style = document.createElement('style');
        style.textContent = `
        label {
          display: inline-block;
          padding: 10px;
          background-color: #f0f0f0;
          border: 2px solid #d0d0d0;
          border-radius: 50%;
          cursor: pointer;
          transition: background-color 0.3s, border-color 0.3s;
        }
        label:hover {
          background-color: #e0e0e0;
        }
        input[type="radio"]:checked + label {
          background-color: #a0e0a0;
          border-color: #70c070;
        }
      `;

        // Append the style to the shadow root
        shadow.appendChild(style);

        // Event listener
        this.addEventListener('click', () => {
            this.checked = !this.checked;
        });
    }

    get checked() {
        return this._input.checked;
    }

    set checked(value) {
        const isChecked = Boolean(value);
        if (isChecked) {
            this.uncheckOtherRadiosInGroup();
        }
        this._input.checked = isChecked;
        this.toggleAttribute('checked', isChecked);
    }

    uncheckOtherRadiosInGroup() {
        const groupName = this.name;
        if (this._form && groupName) {
            const radios = this._form.querySelectorAll('my-radio[name="' + groupName + '"]');
            radios.forEach(radio => {
                if (radio !== this && !radio.disabled) {
                    radio.checked = false;
                }
            });
        }
    }

    get value() {
        return this.getAttribute('value') || ''; // Default value if none is set
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get name() {
        return this.getAttribute('name');
    }

    set name(value) {
        this.setAttribute('name', value);
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(value) {
        const isDisabled = Boolean(value);
        this._input.disabled = isDisabled;
        this.toggleAttribute('disabled', isDisabled);
    }

    // Optionally, to observe attribute changes
    static get observedAttributes() {
        return ['checked', 'name'];
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
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'checked') {
            this.checked = this.hasAttribute('checked');
            // Update the form value when checked status changes
            this._internals.setFormValue(this.checked ? this.value : null);
        } else if (name === 'name' && newValue) {
            this._input.setAttribute('name', newValue);
        }
    }

    _onSubmit(event) {
        // Include the value in the form submission if checked
        if (this.checked) {
            const formData = new FormData(this._form);
            formData.append(this.name, this.value);
        }
    }

    _onReset(event) {
        // Reset to default state
        this.checked = false;
    }
}

customElements.define('my-radio', MyRadio);