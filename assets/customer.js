/*
* Shopify postLink
* Customer Addresses
*/
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {};
}
Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement('form');
  form.setAttribute('method', method);
  form.setAttribute('action', path);

  for (var key in params) {
    var hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};
const confirmMessage94 = document.getElementById('hdt-addresses-list')?.getAttribute('confirm-message');

class CustomerDeleteAddress extends HTMLElement {
  #controller;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    if (confirmMessage94) this.addEventListener('click', this.#handleDeleteButtonClick.bind(this), { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  #handleDeleteButtonClick() {
    // eslint-disable-next-line no-alert
    if (confirm(confirmMessage94)) {
      Shopify.postLink(this.dataset.target, {
        parameters: { _method: 'delete' },
      });
    }
  }
}
customElements.define("hdt-address-delete", CustomerDeleteAddress);
class CustomerResetAddress extends HTMLElement {
  #controller;
  #modal
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.#modal = this.closest('hdt-modal');
    this.addEventListener('click', ()=> this.#modal?.close(), { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
}
customElements.define("hdt-address-reset", CustomerResetAddress);