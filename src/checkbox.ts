const sharedStyles = new CSSStyleSheet();
sharedStyles.replaceSync(`
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
`)



class MyCheckbox extends HTMLElement {
    static formAssociated = true; // Explicitly mark as form-associated

    constructor() {
        super();
        this._internals = this.attachInternals();
        this._internals.role = 'checkbox'; // Set ARIA role
        this._internals.ariaChecked = 'false'; // Initial ARIA checked state


        // Attach a shadow root to the custom element
        const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });

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

        // Append style to the shadow root
        shadow.adoptedStyleSheets = [sharedStyles];

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

        // Update ARIA checked attribute
        this._internals.ariaChecked = isChecked ? 'true' : 'false';
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

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(value) {
        const isDisabled = Boolean(value);
        this._input.disabled = isDisabled;
        this.toggleAttribute('disabled', isDisabled);

        // Update ARIA disabled attribute
        this._internals.ariaDisabled = isDisabled ? 'true' : 'false';
    }

    // Optionally, if you want to observe attribute changes
    static get observedAttributes() {
        return ['value', 'name', 'disabled', 'readonly'];
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
