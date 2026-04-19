import { animate, stagger, inView } from "@theme/m";
import { $4, $$4, $id4, matchMediaQuery, fetchCache, hasInFetchCache } from '@theme/utilities';
import { getterAdd, getterGet, getterRunFn, Accordion } from "@theme/global";
var currentView = $4('[is="hdt-switch-to-list-view"].is-active') ? ':list' : ':grid';
var prevView = currentView,
ifDiffView = false;
const str_shopify_section = 'shopify-section',
str_layout_sw = 'hdt-view-layout-switch';
function dispatchFacetRender(_detail) {
  this.dispatchEvent(new CustomEvent("facet:render", {
    bubbles: true,
    detail: _detail
  }));
}

const sectionId = $4('[data-hdt-init]').dataset.hdtInit;
var urlPrev = window.location.href;
function getSectionID(el) {
  el = el.classList.contains(str_shopify_section) ? el : el.closest("."+str_shopify_section);
  return el.id.replace(str_shopify_section+"-", "");
}


class AccordionFacet extends Accordion {
  constructor() {
    super();
    this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
    this._details.addEventListener("toggle", () => {
      if (this.open) {
        document.body.addEventListener("click", this.onBodyClickEvent);
      } else {
        document.body.removeEventListener("click", this.onBodyClickEvent);
      }
    });
  }
  _onSummaryClicked(event) {
    event.preventDefault();
    const group__display = $4('.hdt-filter-group__display', this),
    list = $$4('.hdt-filter-group__header, .hdt-filter-group__list, .hdt-filter-availability', group__display);
    //group__display.style.overflow = "hidden";
    this._summary.setAttribute('aria-expanded', `${!this.open}`);
    if (this.open) {
      this.animation = animate([
        [list, { opacity: 0, transform: ["translateY(0)", "translateY(8px)"] }, { duration: 0.15 }],
        [group__display, { opacity: 0, transform: ["translateY(0)", `translateY(10px)`] }, { duration: 0.25 }],
      ]);
      //this.animation = animate(group__display, { opacity: 0, transform: ["translateY(0)", `translateY(10px)`] }, { duration: 0.25 });
      this.animation.then(() => {
        this._details.removeAttribute('open');
      });
    } else {
      $$4('#hdt-facet-filters-form-horizontal details[open]').forEach((item) => item.removeAttribute('open'));
      this._details.setAttribute('open', '');
      this.animation = animate([
        [group__display, { opacity: [0, 1], transform: ["translateY(10px)", `translateY(0)`] }, { duration: 0.25 }],
        [list, { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0)"] }, { duration: 0.15, at: "-0.15", delay: stagger(0.2) }]
      ]);
    }
  }
  onBodyClick(event) {
    if (!this.contains(event.target)) {
      this.animation?.finish();
      this.animation = animate($4('.hdt-filter-group__display', this), { opacity: 0, transform: ["translateY(0)", `translateY(10px)`] }, { duration: 0.2 });
      this.animation.then(() => {
        this._details.removeAttribute('open');
        this._summary.setAttribute('aria-expanded', false);
      });
      //document.body.removeEventListener("click", this.onBodyClickEvent);
    }
  }

};
customElements.define('hdt-accordion-facet', AccordionFacet);


var _is_dirty,
_createSearchParams, createSearchParams_fn,
_on_change, on_change_fn,
_on_submit, on_submit_fn,
_facets_form = new WeakMap();
class FacetsForm extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_is_dirty, this, false);
    getterAdd(_createSearchParams, this);
    getterAdd(_on_change, this);
    getterAdd(_on_submit, this);
    getterAdd(_facets_form, this, $4('form', this));
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;

    getterGet(_facets_form, this).addEventListener("change", getterRunFn(_on_change, this, on_change_fn).bind(this), { signal });
    //this.addEventListener("input", getterRunFn(_on_submit, this, on_submit_fn), { signal });
    getterGet(_facets_form, this).addEventListener("submit", getterRunFn(_on_submit, this, on_submit_fn).bind(this), { signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
}
_is_dirty = new WeakMap();
_createSearchParams = new WeakSet();
createSearchParams_fn = function() {
  const searchParams = new URLSearchParams(new FormData(getterGet(_facets_form, this))),
        url          = new URL(getterGet(_facets_form, this).action);

  searchParams.forEach((value, name) => url.searchParams.append(name, value));
  url.searchParams.delete("page");
  // Clear param_name price if it is emty
  ["filter.v.price.gte", "filter.v.price.lte"].forEach((param_name) => {
    if (url.searchParams.get(param_name) === "")  url.searchParams.delete(param_name);
  });
  url.searchParams.set("section_id", this.getAttribute("section-id"));
  return url;
};
_on_change = new WeakSet();
on_change_fn = function(event) {
  //console.log('change: ', this );
  getterAdd(_is_dirty, this, true, true);
  if (this.hasAttribute("render-on-change") && !event.target?.hasAttribute('disable-change') ) {
    if (HTMLFormElement.prototype.requestSubmit) {
      getterGet(_facets_form, this).requestSubmit();
    } else {
      getterGet(_facets_form, this).dispatchEvent(new Event("submit", { cancelable: true }));
    }
  } else {
    // preload filter page
    fetchCache(getterRunFn(_createSearchParams, this, createSearchParams_fn).call(this).toString(), currentView);
  }
};
_on_submit = new WeakSet();
on_submit_fn = function(event) {
  //console.log('submit: ', this, getterGet(_facets_form, this));
  event.preventDefault();
  if (!getterGet(_is_dirty, this)) return;
  dispatchFacetRender.call( getterGet(_facets_form, this), { url: getterRunFn(_createSearchParams, this, createSearchParams_fn).call(this) } );
  getterAdd(_is_dirty, this, false, true);
};
customElements.define("hdt-facet-filters-form", FacetsForm);

// hdt-popover-sorting
class PopoverSorting extends HTMLElement {
  #controller;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    $4('.hdt-popover', this).addEventListener("richlist:change", (e) => {
      const url = new URL(window.location.href);
      url.searchParams.set("sort_by", e.detail.value);
      url.searchParams.delete("page");
      url.searchParams.set("section_id", this.getAttribute("section-id"));
      dispatchFacetRender.call(this, { url });
    }, { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
}
customElements.define('hdt-popover-sorting', PopoverSorting);

var _facet_click_url = new WeakSet(), facet_click_url_fn, _facet_a = new WeakMap();
class FacetUrl extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_facet_click_url, this);
    getterAdd(_facet_a, this, $4('a', this));
  }
  connectedCallback() {
    this.#controller = new AbortController();
    getterGet(_facet_a, this).addEventListener("click", getterRunFn(_facet_click_url, this, facet_click_url_fn).bind(this), { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
};
facet_click_url_fn = function(event) {
  event.preventDefault();
  const sectionId = getSectionID(event.target),
  url = new URL(getterGet(_facet_a, this).href);
  url.searchParams.set("section_id", sectionId);
  dispatchFacetRender.call(this, { url });
};
customElements.define("wrapp-hdt-facet-url", FacetUrl);

// Load More
var _load_more_url = new WeakSet(), load_more_url_fn,
//_intersectionObserver,
_lm_observe = new WeakSet(), lm_observe_fn,
_lm_render = new WeakSet(), lm_render_fn, _lm_a = new WeakMap();
class LoadMore extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_load_more_url, this);
    getterAdd(_lm_observe, this);
    getterAdd(_lm_render, this);
    getterAdd(_lm_a, this, $4('a', this));
    //if (this.isInfinite) getterAdd(_intersectionObserver, this, new IntersectionObserver(getterRunFn(_lm_observe, this, lm_observe_fn).bind(this), { root: null, rootMargin: '0px', threshold: 0 }));  // 0.25
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.abortController2 = null;
    getterGet(_lm_a, this).addEventListener("click", getterRunFn(_load_more_url, this, load_more_url_fn).bind(this), { signal: this.#controller.signal });
    if (this.isInfinite) {
      inView(getterGet(_lm_a, this), (_, info) => {
        getterRunFn(_lm_observe, this, lm_observe_fn).call(this, info);
      });
    }
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get isInfinite() {
    return this.hasAttribute('render-on-scroll');
  }
  get idcontrol() {
    return '#'+ this.getAttribute("append");
  }
  get action() {
    return this.hasAttribute("prepend") ? "prepend" : "append";
  }
};
load_more_url_fn = function(event) {
  event.preventDefault();

  const url = new URL(getterGet(_lm_a, this).href);
  url.searchParams.set("section_id", this.getAttribute("section-id"));
  // this.dispatchEvent(new CustomEvent("loadmore:render", {
  //   bubbles: true,
  //   detail: { url, id: this.idcontrol, action: this.action }
  // }));
  getterRunFn(_lm_render, this, lm_render_fn).call(this, {detail:{ url, id: this.idcontrol, action: this.action }})
 // if (this.isInfinite) getterGet(_intersectionObserver, this).unobserve(this);
};
//_intersectionObserver = new WeakMap();
// lm_observe_fn = function(entries) {
//   console.log(entries)
//   entries.forEach(function(entry) {
//     if (entry.isIntersecting) entry.target.click();
//   });
// };
lm_observe_fn = function(entry) {
  if (entry.isIntersecting) entry.target.click();
};

lm_render_fn = async function(event) {
  //console.log(event)
  if (this.abortController2) {
    this.abortController2.abort();
  }
  this.abortController2 = new AbortController();
  const url            = event.detail.url,
        section_id     = url.searchParams.get("section_id"),
        page_number    = url.searchParams.get("page"),
        shopifySection = document.getElementById(`${str_shopify_section}-${section_id}`),
        clonedUrl      = new URL(url);
  clonedUrl.searchParams.delete("section_id");

  const mainContent        = $4(event.detail.id, shopifySection),
        $paginationWrapper = $4("[loadmore-btn-wrapp]", shopifySection);
  try {
    $paginationWrapper.setAttribute('loading', '');
    const tempContent = new DOMParser().parseFromString(await (await fetchCache(url.toString(), currentView, { signal: this.abortController2.signal })).text(), "text/html");
    const newMainContent = $4(`.${str_shopify_section} ${event.detail.id}`, tempContent);

    // Array.from(newMainContent.childNodes).forEach((node) => { mainContent.appendChild(node); });
    const isActionAppend = event.detail.action == 'append';
    mainContent[isActionAppend ? 'lastElementChild' : 'firstElementChild'].classList.add(`point-effect-${page_number}`);
    mainContent[event.detail.action](...document.importNode(newMainContent, true).childNodes);
    mainContent.dispatchEvent(new CustomEvent("products:update", { bubbles: true }));
    if (matchMediaQuery("motion")) {
      mainContent.prependEl = isActionAppend ? `.point-effect-${page_number} ~ ` : '';
      mainContent.appendEl =  isActionAppend ? '' : `:not(nathan ~ .point-effect-${page_number}):not(.point-effect-${page_number} ~ nathan)`;
      if (mainContent.reveal) mainContent.reveal();
    }

    const $newPaginationWrapper = $4("[loadmore-btn-wrapp]", tempContent);
    if ($newPaginationWrapper) {
      $paginationWrapper.replaceChildren(...document.importNode($newPaginationWrapper, true).childNodes);
      $paginationWrapper.removeAttribute('loading');
    } else {
      $paginationWrapper.remove();
    }

    // const links = $$4('a', mainContent);
    // links.forEach(link => {
    //     link.addEventListener('click', () => {
    //       const currentScroll = window.scrollY;
    //       sessionStorage.setItem('scrollPos', currentScroll);
    //     });
    // });

  } catch (e) { }
};
customElements.define("wrapp-hdt-lm-main-url", LoadMore);
// document.addEventListener("loadmore:render", async (event) => {
// });
// EndLoad More

class PriceRange extends HTMLElement {
  #controller;
  constructor() {
    super();
    this.rangePriceInputs = $$4(".hdt-filter-group__range-price input", this);
    this.inputPriceInputs = $$4(".hdt-filter-group__input-price input", this);
    this.priceGap = 0;
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this.rangePriceInputs.forEach((element) =>
      element.addEventListener('input', this.onRangeInput.bind(this), { signal })
    );
    let isInteracting = false,
    isFocused = false;
    this.inputPriceInputs.forEach((input) => {
      input.addEventListener('focus', () => {
        isFocused = true;
        input.select();
      }, { signal });
      input.addEventListener('input', () => {
        isInteracting = true;
      }, { signal });
      input.addEventListener('blur', () => {
        setTimeout(() => {
          const anyFocused = this.inputPriceInputs.some(i => i === document.activeElement);
          //console.log(!anyFocused, isInteracting)
          if (isInteracting && isFocused && !anyFocused) {
            isInteracting = false;
            isFocused = false;
            requestAnimationFrame(() => {
              //console.log('dispatch change')
              input.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { unStop: true } }));
              //this.dispatchEvent(new Event("change", { cancelable: true, bubbles: true }));
            });
          }
        }, 10);
      }, { signal });
      input.addEventListener('change', this.onPriceChange.bind(this), { signal })
      //element.addEventListener('input', this.onPriceInput.bind(this), { signal });
      // element.addEventListener("input", debounce(this.onPriceInput.bind(this), 550), { signal });
      // element.addEventListener('change', this.onPriceChange.bind(this), { signal })
      // element.addEventListener('focus', () => { element.select() }, { signal })
    });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }

  onRangeInput(e) {
    const minInput = this.inputPriceInputs[0];
    const maxInput = this.inputPriceInputs[1];
    const minRangeInput = this.rangePriceInputs[0];
    const maxRangeInput = this.rangePriceInputs[1];
    maxRangeInput.style.zIndex = minRangeInput.value >= minRangeInput.max ? '-1' : null;
    let minVal = Number(minRangeInput.value),
    maxVal = Number(maxRangeInput.value);
    if((maxVal - minVal) < this.priceGap){
        if(e.target === minRangeInput){
            minRangeInput.value = maxVal - this.priceGap
        }else{
            maxRangeInput.value = minVal + this.priceGap;
        }
    }else{
        minInput.value = minVal;
        maxInput.value = maxVal;
        this.style.setProperty('--min-progress', ((minVal / minRangeInput.max) * 100) + "%");
        this.style.setProperty('--max-progress', 100 - (maxVal / maxRangeInput.max) * 100 + "%");
    }
  }
  // onPriceInput(e) {
  //   //console.log(e)
  //   const minInput = this.inputPriceInputs[0];
  //   const maxInput = this.inputPriceInputs[1];
  //   const minRangeInput = this.rangePriceInputs[0];
  //   const maxRangeInput = this.rangePriceInputs[1];
  //   let minPrice = Number(minInput.value),
  //   maxPrice = Number(maxInput.value);

  //   // if((maxPrice - minPrice >= this.priceGap) && maxPrice <= maxRangeInput.max){
  //   //     if(e.target.name === "filter.v.price.gte"){
  //   //         minRangeInput.value = Math.max(minPrice, e.target.min);
  //   //         this.style.setProperty('--min-progress', ((minRangeInput.value / minRangeInput.max) * 100) + "%");
  //   //     }else{
  //   //         maxRangeInput.value = Math.min(maxPrice, e.target.max);
  //   //         this.style.setProperty('--max-progress', 100 - ( maxRangeInput.value / maxRangeInput.max) * 100 + "%");
  //   //     }
  //   // }
  //   if(e.target.name === "filter.v.price.gte"){
  //     minRangeInput.value = Math.max(minPrice, e.target.min);
  //     this.style.setProperty('--min-progress', ((minRangeInput.value / minRangeInput.max) * 100) + "%");
  //   }else{
  //     maxRangeInput.value = Math.min(maxPrice, e.target.max);
  //     this.style.setProperty('--max-progress', 100 - ( maxRangeInput.value / maxRangeInput.max) * 100 + "%");
  //   }
  //   this.onPriceChange(e);
  // }
  onPriceChange(e) {
    e.preventDefault();
    if (!e.detail || !e.detail.unStop) e.stopPropagation();
    const index = e.target.name === "filter.v.price.gte" ? 0 : 1;
    e.target.value = !index ? Math.max(Math.min(parseInt(e.target.value), parseInt(this.inputPriceInputs[1].value || e.target.max) - 1), e.target.min) : Math.min(Math.max(parseInt(e.target.value), parseInt(this.inputPriceInputs[0].value || e.target.min) + 1), e.target.max);
    this.rangePriceInputs[index].value = e.target.value;
    this.rangePriceInputs[index].dispatchEvent(new Event("input", { cancelable: true }));
  }
}
class SubmitButtonFilter extends HTMLElement {
  #controller;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.addEventListener("click", (e)=> {
      e.preventDefault();
      e.stopPropagation();
      const form = this.closest('form');
      if (HTMLFormElement.prototype.requestSubmit) {
        form?.requestSubmit();
      } else {
        form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }
    } , { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
}

customElements.define('hdt-price-range', PriceRange);
customElements.define("wrapp-hdt-btn-submit-filter", SubmitButtonFilter);

var _layout_switch = new WeakSet(), layout_switch_fn,
_breakpoint = new WeakMap(),
_layout_prefix = new WeakMap(),
_update_attributes = new WeakSet(), update_attributes_fn,
_layout_changed = new WeakSet(), layout_changed_fn,
objPrefix = {mobile: '', tablet: 'md:', desktop: 'lg:'},
objIndex = {mobile: 0, tablet: 1, desktop: 2},
viewsLayout = $4(str_layout_sw) ? $4(str_layout_sw).getAttribute('views') : '',
currentSwitchSizes,
_switch_to_list_view = new WeakSet(), switch_to_list_view_fn;
class LayoutSwitch extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_layout_switch, this);
    getterAdd(_breakpoint, this, this.getAttribute('breakpoint'));
    getterAdd(_layout_prefix, this, objPrefix[getterGet(_breakpoint, this)] + 'hdt-grid-cols-');
    getterAdd(_update_attributes, this);
    getterAdd(_layout_changed, this);
    getterAdd(_switch_to_list_view, this);
  }
  static get observedAttributes() {
    return ["views"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    // Check If hidden not run func
    if (this.clientHeight) getterRunFn(_layout_changed, this, layout_changed_fn).call(this, name, oldValue, newValue);
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    // :not([is="hdt-switch-to-list-view"])
    $$4('button[type="button"]', this).forEach((btn)=> {
      btn.addEventListener("click", getterRunFn(_layout_switch, this, layout_switch_fn).bind(this), { signal })
    });
    this.addEventListener("update:products_items_per_row", getterRunFn(_switch_to_list_view, this, switch_to_list_view_fn).bind(this), { signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get $control() {
    return $id4(this.getAttribute("aria-controls"));
  }
}
layout_switch_fn = function(e) {
  const target = e.target;
  if (!target || target.classList.contains("is-active")) return;

  // Update cart attr
  const arr = this.getAttribute('views').split('.');
  // if is list swith grid, then convert all breakpoint to grid view
  if (arr.indexOf('0') > -1 && target.value != 0) {
    arr.forEach((value, index) => {
      if (value == 0) arr[index] = index + 2;
    });
  } else if (target.value == 0) {
    // // if is grid swith list, then convert all breakpoint to list view
    arr.forEach((value, index) => arr[index] = 0);
  }
  currentSwitchSizes = target.getAttribute('sizes');
  arr[objIndex[getterGet(_breakpoint, this)]] = target.value;
  getterRunFn(_update_attributes, this, update_attributes_fn).call(this, arr.join('.'), target.hasAttribute('is'));
};
update_attributes_fn = function(newValue, isBtnListView) {

  currentView = isBtnListView ? ':list' : ':grid';
  ifDiffView = prevView != currentView;
  //console.log( prevView, currentView, ifDiffView, hasInFetchCache)
  prevView = currentView;
  // save layout
  viewsLayout = newValue;
  $$4(str_layout_sw).forEach((item) => item.setAttribute('views', newValue) );

  const url = new URL(themeHDN.wisHref ? window.location.origin + themeHDN.wisHref : window.location.href);
  url.searchParams.delete("page");
  url.searchParams.set("section_id", this.getAttribute("section-id"));
  var check = true;
  if ( ifDiffView & hasInFetchCache(url.toString()+currentView) ) {
    check = false;
    dispatchFacetRender.call(this, { url, disableScrollToVIew: true });
  }
  //console.log(check, url.toString()+currentView)
  if (ifDiffView && check) {
    this.closest('.shopify-section').setAttribute('loading', '');
    document.dispatchEvent(new CustomEvent("hdt:loading:start"));

  }
  fetch(`${Shopify.routes.root}cart/update.js`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attributes: {
        ['products_items_per_row']: newValue
      }
    }),
    keepalive: true
    // Allows to make sure the request is fired even when submitting the form
  }).then((response) => {
    if (response.status === 200 && ifDiffView && check) {
      this.dispatchEvent(new CustomEvent("update:products_items_per_row"), { bubbles: true});
    } else if (ifDiffView && check) {
      this.closest('.shopify-section').removeAttribute('loading');
      document.dispatchEvent(new CustomEvent("hdt:loading:end"));
    }
  });
};
layout_changed_fn = function(name, oldValue, newValue) {
  //console.log(oldValue, newValue, viewsLayout)
  if (oldValue !== null && newValue !== oldValue) {
    const arr = oldValue.split('.');
    const NewArr = newValue.split('.'),
    viewValue = arr[objIndex[getterGet(_breakpoint, this)]],
    newViewValue = NewArr[objIndex[getterGet(_breakpoint, this)]];

    $$4("button", this).forEach((item) => item.classList.toggle("is-active", item.value == newViewValue));

    if (ifDiffView || !this.$control) {
      return;
    }
    clearTimeout(this.$control.timeout);
    this.$control.timeout = setTimeout(() => {
      animate(this.$control, { opacity: [1, 0], transform: ["translateY(0px)", `translateY(30px)`] }, { duration: 0.4, easing: "ease-in" }).then(() => {
        this.$control.classList.remove(getterGet(_layout_prefix, this) + viewValue);
        this.$control.classList.add(getterGet(_layout_prefix, this) + newViewValue);
        // update size imgs
        const sizesImg = $4('.is-active', this).getAttribute('sizes');
        $$4('.hdt-card-product__media img', this.$control).forEach((img)=> img.setAttribute('sizes', sizesImg));
        animate(this.$control, { opacity: [0, 1], transform: ["translateY(30px)", `translateY(0px)`] }, { duration: 0.5, easing: "ease-out" });
        if (matchMediaQuery("motion")) this.$control.reveal();
      });
    });
  }
};
switch_to_list_view_fn = function(e) {
  const url = new URL(themeHDN.wisHref ? window.location.origin + themeHDN.wisHref : window.location.href);
  url.searchParams.delete("page");
  url.searchParams.set("section_id", this.getAttribute("section-id"));
  //console.log(url.toString())
  dispatchFacetRender.call(this, { url, disableScrollToVIew: true });
};
customElements.define(str_layout_sw, LayoutSwitch);

// var _switch_to_list_view, switch_to_list_view_fn
// class switchToListView extends HTMLButtonElement {
//   #controller;
//   constructor() {
//     super();
//     getterAdd(_switch_to_list_view, this);
//   }
//   connectedCallback() {
//     this.#controller = new AbortController();
//     this.parentNode.addEventListener("update:products_items_per_row", getterRunFn(_switch_to_list_view, this, switch_to_list_view_fn).bind(this), { signal: this.#controller.signal });
//   }
//   disconnectedCallback() {
//     this.#controller.abort();
//   }
// }
// _switch_to_list_view = new WeakSet();
// switch_to_list_view_fn = function(e) {
//   const url = new URL(window.location.href);
//   url.searchParams.delete("page");
//   url.searchParams.set("section_id", this.parentNode.getAttribute("section-id"));
//   //console.log(url.toString())
//   dispatchFacetRender.call(this, { url, disableScrollToVIew: true });
// }
//customElements.define("hdt-switch-to-list-view", switchToListView, { extends: "button" });

(() => {
  // const onHistoryChange = (event) => {
  //   const newUrl = event.state ? event.state.FacetUrl : window.location.href,
  //   section_id = event.state ? event.state.section_id : sectionId;
  //   //console.log(event, newUrl, urlPrev, urlInitial)
  //   if ( newUrl && newUrl != urlPrev) {
  //     const url = new URL(newUrl);
  //     url.searchParams.set("section_id", section_id);
  //     dispatchFacetRender.call(document, { url, notPushState: true });
  //   }
  // };

  const onHistoryChange = (event) => {
    console.log(event, event.persisted);
    const state = event.state || {FacetUrl: window.location.href, section_id: sectionId};
    if ( state.FacetUrl != urlPrev) {
      const url = new URL(state.FacetUrl);
      url.searchParams.set("section_id", state.section_id);
      dispatchFacetRender.call(document, { url, notPushState: true });
    }
  };
  window.addEventListener('popstate', onHistoryChange);

  const openDetailsIds = new Set(Array.from($$4('hdt-facet-filters-form:not([is--horizontal]) details[open]'), (details) => details.id));
  const onUpdateDetailsEvents = () => {
    $$4('hdt-facet-filters-form:not([is--horizontal]) details').forEach( (details) => {
      details.addEventListener('toggle', ()=> openDetailsIds[details.open ? 'add' : 'delete'](details.id));
    });
  };
  onUpdateDetailsEvents();

  var abortController = null;
  document.addEventListener("facet:render", async (event) => {

    //console.log(event.detail)
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    const url = event.detail.url,
    section_id = url.searchParams.get("section_id"),
    shopifySection = $id4(`${str_shopify_section}-${section_id}`),
    clonedUrl = new URL(url);
    clonedUrl.searchParams.delete("section_id");

    const _shopifySection = $4("[main-content]", shopifySection);
    try {
      shopifySection.setAttribute('loading', '');
      document.dispatchEvent(new CustomEvent("hdt:loading:start"));
      const tempContent = new DOMParser().parseFromString(await (await fetchCache(url.toString(), currentView, { signal: abortController.signal })).text(), "text/html");
      document.dispatchEvent(new CustomEvent("hdt:loading:end"));
      const newShopifySection = $4(`.${str_shopify_section} [main-content]`, tempContent);

      $$4('hdt-facet-filters-form:not([is--horizontal]) details', newShopifySection).forEach((detailsElement) => {
        detailsElement.open = openDetailsIds.has(detailsElement.id);
      });
      const openDetailsId =  $4('#hdt-facet-filters-form-horizontal details[open]')?.id;
      if ($4('#hdt-facet-filters-form-horizontal')?.clientHeight > 0 && openDetailsId ) {
        const openDetails = $4(`#hdt-facet-filters-form-horizontal details#${openDetailsId}`, newShopifySection);
        if (openDetails) openDetails.open = true;
      }

      if ( !event.detail.notPushState) history.pushState({ FacetUrl: clonedUrl.toString(), section_id }, "", clonedUrl.toString());
      urlPrev = clonedUrl.toString();

      if ($4(str_layout_sw, newShopifySection)) {
        const prevViewsLayout = $4(str_layout_sw, newShopifySection).getAttribute('views');
        // Update class cols on products
        if (prevViewsLayout !== viewsLayout) {

          const arrprevViewsLayout = prevViewsLayout.split('.'),
                arrPrefix          = ['','md:','lg:'],
                newProducts        = $4(`#products-${section_id}`, newShopifySection);
          let className = newProducts.className;

          // Update viewsLayout
          const arrViewsLayout = viewsLayout.split('.');
          $$4(str_layout_sw, newShopifySection).forEach((item, index) => {
            item.setAttribute('views', viewsLayout);
            $4('.is-active', item).classList.remove('is-active');
            $4(`button[value="${arrViewsLayout[index]}"]`, item).classList.add('is-active');
            className = className.replace(` ${arrPrefix[index]}hdt-grid-cols-${arrprevViewsLayout[index]}`, ` ${arrPrefix[index]}hdt-grid-cols-${arrViewsLayout[index]}`);
          });
          // arrViewsLayout.forEach((value, index) => {
          //   className = className.replace(` ${arrPrefix[index]}hdt-grid-cols-${arrprevViewsLayout[index]}`, ` ${arrPrefix[index]}hdt-grid-cols-${arrViewsLayout[index]}`);
          // });
          newProducts.className = className;

          // Update size imgs
          $$4('.hdt-card-product__media img', newProducts).forEach((img)=> img.setAttribute('sizes', currentSwitchSizes) );
        }
      }
      const product = $4('.hdt-product-grid-container', shopifySection) || shopifySection;
      await animate(product, { opacity: [1, 0], transform: ["translateY(0px)", `translateY(30px)`] }, { duration: 0.35, easing: "ease-in" });

      _shopifySection.replaceChildren(...document.importNode(newShopifySection, true).childNodes);
      _shopifySection.dispatchEvent(new CustomEvent("products:update", { bubbles: true }));
      onUpdateDetailsEvents();

      // Update viewsLayout
      //$$4(str_layout_sw, shopifySection).forEach((item) => item.setAttribute('views', viewsLayout) );

      // Remove all tooltip
      //$$4('.hdt-tooltip').forEach((item) => item.remove() );

      shopifySection.removeAttribute('loading', '');
      animate(product, { opacity: [0, 1], transform: [`translateY(30px)`, "translateY(0px)"] }, { duration: 0.5, easing: "ease-out" });

      // Scroll
      const $scrollIntoView = $4('[scroll-into-view]', shopifySection),
      form = event.target?.tagName == 'FORM' ? event.target : event.target.closest('form');
      if ( !$scrollIntoView || event.detail.disableScrollToVIew || form?.hasAttribute('disable-scroll-view')) return;

      const scrollToProductList = () => $scrollIntoView.scrollIntoView({ block: "start", behavior: "smooth" });
      if ("requestIdleCallback" in window) {
        requestIdleCallback(scrollToProductList, { timeout: 500 });
      } else {
        requestAnimationFrame(scrollToProductList);
      }
    } catch (e) { }
  });
  window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        const storedScrollPos = sessionStorage.getItem('scrollPos');
        if (storedScrollPos) {
            const scrollY = parseInt(storedScrollPos, 10);
            window.scrollTo(0, scrollY);
            // sessionStorage.removeItem('scrollPos');
        }
      }
  });

})();