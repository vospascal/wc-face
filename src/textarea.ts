const sharedStyles = new CSSStyleSheet();
sharedStyles.replaceSync(`
textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1em;
    color: #333;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
  textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }
`)

class MyTextarea extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'textbox'; // Accessibility: Role as textbox

    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });


    // Internal textarea
    this._textarea = document.createElement('textarea');
    this._textarea.addEventListener('input', () => {
      this.value = this._textarea.value; // Sync the value
    });

    // Append the style to the shadow root
    shadow.adoptedStyleSheets = [sharedStyles];
    shadow.appendChild(this._textarea);
  }

  get form() {
    return this._internals.form;
  }

  get name() {
    return this.getAttribute('name');
  }

  get type() {
    return 'textarea'; // Type is always textarea for this element
  }

  get value() {
    return this._textarea.value;
  }

  set value(val) {
    this._textarea.value = val;
    this._internals.setFormValue(val);
  }

  get readOnly() {
    return this.hasAttribute('readonly');
  }

  set readOnly(val) {
    if (val) {
      this.setAttribute('readonly', '');
      this._textarea.readOnly = true;
    } else {
      this.removeAttribute('readonly');
      this._textarea.readOnly = false;
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
}

set disabled(value) {
    const isDisabled = Boolean(value);
    this._textarea.disabled = isDisabled;
    this.toggleAttribute('disabled', isDisabled);

    // Update ARIA disabled attribute
    this._textarea.ariaDisabled = isDisabled ? 'true' : 'false';
}

  static get observedAttributes() {
    return ['value', 'name', 'disabled','readonly'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value') {
      this.value = newValue;
    } else if (name === 'name') {
      this._textarea.name = newValue;
    } else if (name === 'disabled') {
      this._textarea.disabled = this.hasAttribute('disabled');
    } else if (name === 'readonly') {
      this._textarea.readOnly = this.hasAttribute('readonly');
    }
  
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

  _onSubmit(event) {
    if(this.value){
      this._internals.setFormValue(this.value);
    }else {
      this._internals.setFormValue(null);
    }
  }

  _onReset(event) {
    this.value = this.getAttribute('value');
  }
}

customElements.define('my-textarea', MyTextarea);
