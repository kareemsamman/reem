import { $4, $$4, fetchConfig, shimmer, resetShimmer } from '@theme/utilities';
import { ThemeEvents } from '@theme/events';
import { inView, frame } from "@theme/m";
const  { cartUpdate, loadingStart, loadingEnd } = ThemeEvents;
class QuickOrderListComponent extends HTMLElement {
  #controller;
  #controller2;
  #controller3;
  #variantRows;
  #successContainer;
  #successText;
  #errorContainer;
  #errorText;
  #paginationNav;
  #cart;
  #inView;
  #pendingPromises = new Map();
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.#cart = $4('[ref="hdt-cart"]');
    this.#refs();

    const { signal } = this.#controller;
    this.addEventListener('change', this.#handleQuantityUpdate, { signal });
    document.addEventListener('cart:live', this.#handleCartUpdate, { signal });
    document.addEventListener('cart:tab', this.#handleCartUpdate, { signal });

    const backTop = $4('hdt-back-to-top');
    this.#inView = inView(this,
      (element, enterInfo) => {
        if (backTop) backTop.shouldHidden = true;
        // console.log('inView')
        // This will fire when the element leaves the viewport
        return (leaveInfo) => {
          if (backTop) backTop.shouldHidden = false;
          // console.log('outView')
        }
      },
      { margin: "-200px 0px 0px 0px" }
    )
  }
  #refs() {
    this.#controller3?.abort();
    this.#controller3 = new AbortController();
    const { signal } = this.#controller3;

    this.#variantRows = $$4('[ref="variantRows[]"]', this);
    this.#paginationNav = $4('.hdt-pagination', this);
    this.#successContainer = $4('[ref="successContainer"]', this);
    this.#successText = $4('[ref="successText"]', this);
    this.#errorContainer = $4('[ref="errorContainer"]', this);
    this.#errorText = $4('[ref="errorText"]', this);
    //events
    if (this.#paginationNav) $$4('a', this.#paginationNav).forEach(link => link.addEventListener('click', (evt)=> this.#onPaginationControlClick(evt, link), { signal }));
    $$4('[ref="itemRemove"]', this).forEach(item => item.addEventListener('click', (evt)=> this.#onLineItemRemove(evt, item), { signal }));
    $4('button[data-action="confirm"]', this)?.addEventListener('click', (event) => this.#toggleConfirm(event), { signal });
    $4('button[data-action="cancel"]', this)?.addEventListener('click', (event) => this.#toggleConfirm(event, true), { signal });
    $4('button[data-action="remove"]', this)?.addEventListener('click', this.#onRemoveAll, { signal });
  }
  disconnectedCallback() {
    this.#inView();
    this.#controller.abort();
    this.#controller2?.abort();
    this.#controller3?.abort();
  }
  #handleUpdate = async (updates, variantId = null, quantityAdded = 0) => {
    this.#toggleLoading();
    this.#controller2?.abort();
    this.#controller2 = new AbortController();
    const { signal } = this.#controller2;

    try {
      document.dispatchEvent(new CustomEvent(loadingStart));
      $$4(`.hdt-shimmer[data-variant-id="${variantId}"], .hdt-shimmer[ref="totalPrice"]`, this).forEach( (el) => shimmer(el) );
      const sectionsUrl = new URL(window.location.pathname, window.location.origin);
      sectionsUrl.searchParams.set('page', this.#currentPage.toString());

      const { pathname, search } = sectionsUrl,
      {sectionId} = this.dataset,
      body = JSON.stringify({
        updates,
        sections: (this.#cart?.sectionsToRender?.map(s => s.id) ?? ['cart-json']).concat(sectionId),
        sections_url: pathname + search
      }),
      customt4 = JSON.stringify({
        source: 'quick-order-list',
        sectionId: sectionId
      }),
      response = await fetch(`${Shopify.routes.root}cart/update.js`, {
       ...fetchConfig('json', { body, customt4 }),
        signal
      }),
      data = await response.json();
      document.dispatchEvent(new CustomEvent(loadingEnd));
      resetShimmer(this);

      if (data.errors) {
        // errors
        this.#showErrorMessage(data.errors);
      } else if (data.sections && data.sections[sectionId]) {
        await this.#updateHTML(data.sections[sectionId]);
        if (quantityAdded > 0) this.#showSuccessMessage(quantityAdded);
        this.#toggleLoading(false);
        const cartData = Object.assign({}, data, JSON.parse(data.sections['cart-json'].split('[split_94]')[1] || '{}'));
        this.dispatchEvent(new CustomEvent(cartUpdate, {
          bubbles: true,
          detail: {
            source: variantId ? 'quick-order-quantity' : 'quick-order-remove-all',
            variantId,
            cartData,
            sectionId
          }
        }));
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        this.#toggleLoading(false);
        //resetShimmer(this);
        throw error;
      }
    }
  }
  #handleQuantityUpdate = async (event) => {
    const variantId = event.target.parentElement?.dataset.variantId;
    if (!variantId) return;

    this.#clearMessage();
    const quantity = event.target.value,
    currentCartQuantity = event.target ? parseInt(event.target.dataset.cartQuantity || '0') || 0 : 0;

    if (currentCartQuantity === quantity) return;
    const updates = {};
    updates[variantId] = quantity;
    this.#handleUpdate(updates, variantId, quantity - currentCartQuantity);
  }
  async #renderSection(url) {
    this.#toggleLoading();
    this.#controller2?.abort();
    this.#controller2 = new AbortController();
    const { signal } = this.#controller2;
    url.searchParams.set('section_id', this.dataset.sectionId);
    url.searchParams.sort();
    const sectionUrl = url.toString();
    let pendingPromise = this.#pendingPromises.get(sectionUrl);
    if (pendingPromise) return pendingPromise;
    pendingPromise = fetch(sectionUrl, {signal}).then((response) => {
      return response.text();
    });

    this.#pendingPromises.set(sectionUrl, pendingPromise);
    const sectionHTML = await pendingPromise;
    this.#pendingPromises.delete(sectionUrl);

    this.#updateHTML(sectionHTML);
    this.#toggleLoading(false);
  }
  #handleCartUpdate = async (event) => {
    // Don't process our own events to avoid double updates
    // Check if this event came from our own quantity update
    if (event.detail?.source === 'quick-order-list' && event.detail?.sectionId === this.dataset.sectionId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', this.#currentPage.toString());
    this.#renderSection(url);
  }

  #onPaginationControlClick = async (event, link) => {
    event.preventDefault();
    await this.#renderSection(new URL(link.href));
    this.#scrollToTopOfSection();
  }

  #scrollToTopOfSection() {
    // Defer layout read until scroll action to batch with other layout work
    frame.render(() => {
      const top = this.getBoundingClientRect().top;
      window.scrollTo({ top: top + window.scrollY, behavior: 'smooth' });
    });
  }

  #onLineItemRemove = async (event, item) => {
    event.preventDefault();
    const {variantId} = item.dataset;
    const targetRow = this.#variantRows.find((row) => row.dataset.variantId === String(variantId));
    if (!(targetRow instanceof HTMLElement)) return;
    const quantityInput = $4('input[type="number"]', targetRow);
    if (quantityInput instanceof HTMLInputElement) {
      quantityInput.value = '0',
      quantityInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
  #onRemoveAll = async (event) => {
    event.preventDefault();

    this.#clearMessage();

    const idsToRemove = this.#cartVariantIds,
    updates = {};

    if (idsToRemove.length > 0) {
      for (const variantId of idsToRemove) {
        updates[String(variantId)] = 0;
      }
    }

    this.#clearMessage();
    this.#handleUpdate(updates);
  }
  #toggleConfirm(event, cancel = false) {
    event.preventDefault();
    $4('.hdt-quick-order-list-total', this)?.toggleAttribute('confirmation-visible', !cancel);
  }
  #toggleLoading(loading = true) {
    this.classList.toggle('hdt-quick-order-list-disabled', loading);
  }
  #clearMessage() {
    this.#errorContainer.setAttribute('hidden', '');
    this.#successContainer.setAttribute('hidden', '');
  }
    /**
   * Shows success message in the success container
   * @param {number} quantityAdded - The number of items added
   */
  #showSuccessMessage(quantityAdded) {
    this.#clearMessage();

    const oneItemText = themeHDN?.strings?.cart?.items_added_to_cart_one || '1 item added to cart';
    const itemsText = themeHDN?.strings?.cart?.items_added_to_cart_other || '{{ count }} items added to cart';

    const message = quantityAdded === 1 ? oneItemText : itemsText.replace('{{ count }}', quantityAdded.toString());

    this.#successText.textContent = message;
    this.#successContainer.removeAttribute('hidden');
  }

  /**
   * Shows an error message in the error container
   * @param {string} message - The error message to display
   */
  #showErrorMessage(message) {
    this.#errorText.textContent = message;
    this.#errorContainer.removeAttribute('hidden');
  }

  async #updateHTML(html) {
    this.#controller3?.abort();
    const fragment = new DOMParser().parseFromString(html, 'text/html');
    this.innerHTML = $4('.hdt-quick-order-list', fragment).innerHTML;
    this.setAttribute('data-cart-variant-ids', $4('.hdt-quick-order-list', fragment).dataset.cartVariantIds);
    await new Promise((resolve) => {
      frame.render(() => {
        this.#refs();
        resolve();
      });
    });
  }

  /**
   * Gets the current page number from pagination controls
   * @returns {number}
   */
  get #currentPage() {
    if (this.#paginationNav && this.#paginationNav.dataset.current_page) {
      const pageNum = parseInt(this.#paginationNav.dataset.current_page, 10);
      if (!isNaN(pageNum)) {
        return pageNum;
      }
    }
    return 1;
  }

  /**
   * Gets all cart variant IDs for the product from the data attribute
   * @returns {number[]}
   */
  get #cartVariantIds() {
    const data = this.dataset.cartVariantIds;
    if (!data) return [];

    return JSON.parse(data);
  }
}

if (!customElements.get('quick-order-list-component')) {
  customElements.define('quick-order-list-component', QuickOrderListComponent);
}