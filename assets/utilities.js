/**
 * fetchCache
 * hasInFetchCache
 * normalizeSectionId
 * fetchConfig
 * debounce
 * throttle
 * formatMoney
 * $4 $$4 $id4
 * matchMediaQuery
 * onMediaQueryChange
 * createImg
 * renderSrcset
 * requestIdleCallback
 * yieldToMainThread
 * waitForEvent
 * checkImagesLoaded
 * sleep
 * getArrVisible
 * AutoplayElement
 * expiresManager
 * announce
 */

// In-memory cache Map
const genericCache = new Map();

/**
 * Fetch with in-memory cache and custom options.
 * @param {string} url - The URL to fetch.
 * @param {string} prefix
 * @param {object} [options={}] - Fetch options (method, headers, body, etc).
 * @returns {Promise<Response>} - Cached or fetched Response.
 */
export async function fetchCache(url, prefix = '', options = {}) {
  // console.log(genericCache)
  // Use JSON.stringify of both URL and options to uniquely cache
  const cacheKey = url + prefix;
  if (genericCache.has(cacheKey)) {
    const { body, headers } = genericCache.get(cacheKey);
    return Promise.resolve(new Response(body, { headers }));
  }

  const res = await fetch(url, options);
  if (res.status === 200) {
    const clone = res.clone();

    const body = await clone.text(); // safe for most content types
    const headersObj = {};
    for (const [key, value] of clone.headers.entries()) {
      headersObj[key] = value;
    }

    genericCache.set(cacheKey, { body, headers: headersObj });
  }
  return res;
}

export function hasInFetchCache(urlPrefix) {
  return genericCache.has(urlPrefix)
}

// const SECTION_ID_PREFIX = 'shopify-section-';
/**
 * Builds a section selector
 * @param {string} sectionId - The section ID
 * @returns {string} The section selector
 */
// export function buildSectionSelector(sectionId) {
//   return `${SECTION_ID_PREFIX}${sectionId}`;
// }

/**
 * Normalizes a section ID
 * @param {string} sectionId - The section ID
 * @returns {string} The normalized section ID
 */
// export function normalizeSectionId(sectionId) {
//   return sectionId.replace(new RegExp(`^${SECTION_ID_PREFIX}`), '');
// }

/**
 * Creates a fetch configuration object
 * @param {string} [type] The type of response to expect
 * @param {Object} [config] The config of the request
 * @param {FetchConfig['body']} [config.body] The body of the request
 * @param {FetchConfig['headers']} [config.headers] The headers of the request
 * @returns {RequestInit} The fetch configuration object
 */
export function fetchConfig(type = 'json', config = {}) {
  /** @type {Headers} */
  const headers = { 'Content-Type': 'application/json', Accept: `application/${type}`, ...config.headers };

  if (type === 'javascript') {
    headers['X-Requested-With'] = 'XMLHttpRequest';
    delete headers['Content-Type'];
  }

  return {
    method: 'POST',
    headers: /** @type {HeadersInit} */ (headers),
    body: config.body,
    ...(config.customt4 && { customt4: config.customt4 })
  };
}

/**
 * Creates a debounced function that delays calling the provided function (fn)
 * until after wait milliseconds have elapsed since the last time
 * the debounced function was invoked. The returned function has a .cancel()
 * method to cancel any pending calls.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn The function to debounce
 * @param {number} wait The time (in milliseconds) to wait before calling fn
 * @returns {T & { cancel(): void }} A debounced version of fn with a .cancel() method
 */
export function debounce(fn, wait) {
  /** @type {number | undefined} */
  let timeout;

  /** @param {...any} args */
  function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  }

  // Add the .cancel method:
  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return /** @type {T & { cancel(): void }} */ (debounced);
}

/**
 * Creates a throttled function that calls the provided function (fn) at most once per every wait milliseconds
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn The function to throttle
 * @param {number} delay The time (in milliseconds) to wait before calling fn
 * @returns {T & { cancel(): void }} A throttled version of fn with a .cancel() method
 */
export function throttle(callback) {
  let requestId = null;
  let lastArgs = null;

  const throttled = function (...args) {
    lastArgs = args;
    if (requestId === null) {
      requestId = requestAnimationFrame(() => {
        callback.apply(this, lastArgs);
        requestId = null;
        lastArgs = null;
      });
    }
  };

  throttled.cancel = () => {
    if (requestId !== null) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }
  };

  return throttled;
}
// export function throttleWithDelay(fn, delay) {
//   let lastCall = 0;

//   /** @param {...any} args */
//   function throttled(...args) {
//     const now = performance.now();
//     // If the time since the last call exceeds the delay, execute the callback
//     if (now - lastCall >= delay) {
//       lastCall = now;
//       fn.apply(this, args);
//     }
//   }

//   throttled.cancel = () => {
//     lastCall = performance.now();
//   };

//   return /** @type {T & { cancel(): void }} */ (throttled);
// }

/**
 * Format a money value
 * @param {string} cents The cents to format
 * @returns {string} The formatted value
/**
* -----------------------------------------------------------------------------
* https://shopify.dev/docs/storefronts/themes/markets/multiple-currencies-languages
* https://www.npmjs.com/package/@shopify/theme-currency?activeTab=code
*/

const {currencyFormat} = themeHDN.settings,
placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
rate = parseFloat(Shopify.currency.rate) * (themeHDN.settings.currencyFormat.indexOf("with_comma_separator") == -1 ? 100 : 1);
export class currency {
  static getCents(money) {
    if (currencyFormat.indexOf('with_comma_separator') !== -1) {
      money = money.replace(/[,.]/g, (match) => {
        return match === ',' ? '.' : ',';
      });
    }
    //let cents = parseFloat(money.replace(/^[^0-9]+|[^0-9.]/g, '', ''), 10) * 100 / rate;
    let cents = parseFloat(money.replace(/^[^0-9]+|[^0-9.]/g, '', ''), 10) * rate;
    return cents;
  }
  static #formatWithDelimiters(number, precision = 2, thousands = ',', decimal = '.') {
    if (isNaN(number) || number == null) return 0;
    number = (number / 100.0).toFixed(precision);
    //number = (number / 100).toFixed(precision);
    let parts = number.split("."),
    dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
    centsAmount = parts[1] ? decimal + parts[1] : "";
    return dollarsAmount + centsAmount;

  }
  static formatMoney(cents, format = currencyFormat) {
    let value = "";
    if (typeof cents === "string") {
      cents = cents.replace(".", "");
    }
    switch (format.match(placeholderRegex)[1]) {
      case "amount":
        value = this.#formatWithDelimiters(cents, 2);
        break;
      case "amount_no_decimals":
        value = this.#formatWithDelimiters(cents, 0);
        break;
      case "amount_with_space_separator":
        value = this.#formatWithDelimiters(cents, 2, " ", ".");
        break;
      case "amount_with_comma_separator":
        value = this.#formatWithDelimiters(cents, 2, ".", ",");
        break;
      case "amount_with_apostrophe_separator":
        value = this.#formatWithDelimiters(cents, 2, "'", ".");
        break;
      case "amount_no_decimals_with_comma_separator":
        value = this.#formatWithDelimiters(cents, 0, ".", ",");
        break;
      case "amount_no_decimals_with_space_separator":
        value = this.#formatWithDelimiters(cents, 0, " ");
        break;
      case "amount_no_decimals_with_apostrophe_separator":
        value = this.#formatWithDelimiters(cents, 0, "'");
        break;
    }
    return format.replace(placeholderRegex, value);
  }
  static convert(money, format) {
    return this.formatMoney(this.getCents(money), format);
  }
}

// Selector
export function $4(selector, container = document) {
	return container.querySelector(selector);
};
export function $id4(selector) {
  return document.getElementById(selector);
}
export function $$4(selector, container = document) {
  return [...container.querySelectorAll(selector)];
}

/**
 * Map of predefined media queries
 */
const predefinedMediaQueries = {
  mobile: 'screen and (max-width: 767px)',
  tablet: 'screen and (min-width: 768px) and (max-width: 1149px)',
  hover: 'screen and (hover: hover) and (pointer: fine)',
  motion: '(prefers-reduced-motion: no-preference)',
  //motionReduce: '(prefers-reduced-motion: reduce)',
};
/**
 * Check whether a media query matches the current environment
 *
 * @param {string} type - Either a predefined key (e.g. "mobile") or a raw media query string.
 * @returns {boolean} - true if it matches, false otherwise
 */
export function matchMediaQuery(type) {
  return window.matchMedia(predefinedMediaQueries[type] || type).matches;
}
/**
 * Add a listener to media query changes
 *
 * @param {string} type - Predefined key or raw media query string
 * @param {(event: MediaQueryListEvent) => void} callback - Handler function
 * @returns {MediaQueryList} - The MediaQueryList object so you can manage/remove later if needed
 */
// export function onMediaQueryChange(type, callback) {
//   const mql = window.matchMedia(predefinedMediaQueries[type] || type);
//   mql.addEventListener('change', callback);
//   return mql;
// }
// onMediaQueryChange('mobile', (e) => {
//   console.log('Mobile media query changed:', e.matches);
// });

/**
 * Create an <img> element with given width and height
 * @param {Object} imgObj
 * @returns {HTMLImageElement}
 */
export function createImg(imgObj = {}) {
  const img = new Image(),
  attrs = imgObj.attrs || {},
  {alt, src} = imgObj;
  for (const key in attrs) {
    img.setAttribute(key, attrs[key]);
  }
  img.alt = alt || "";
  img.src = src;
  img.srcset = renderSrcset(src, JSON.parse(attrs['data-widths']));

  if (imgObj.onload) {
    img.addEventListener("load", function() {
      const parentImage = img.parentElement || img;
      parentImage.removeAttribute('loading');
      parentImage.setAttribute('loaded', '');
    }, {once : true});
  }
  return img;
}
/**
 * Ensure the image src starts with 'https://'
 * @param {string} src - Original image URL
 * @returns {string} Normalized image URL
 */
function normalizeImageSrc(src) {
  if (/^https?:\/\//.test(src)) {
    return src;
  }
  return `https://${src.replace(/^\/+/, '')}`;
}
export function renderSrcset(baseSrc, widths) {
  const url = new URL(normalizeImageSrc(baseSrc)),
      maxWidth = parseInt( url.searchParams.get("width") || widths[widths.length - 1]);
  return widths
    .filter((w) => w <= maxWidth)
    .map((w) => {
      url.searchParams.set('width', w);
      return `${url.toString()} ${w}w`;
    })
    .join(', ');
}

/**
 * Request an idle callback or fallback to setTimeout
 * @returns {function} The requestIdleCallback function
 */
export const requestIdleCallback = typeof window.requestIdleCallback == 'function' ? window.requestIdleCallback : setTimeout;

/**
 * Returns a promise that resolves after yielding to the main thread.
 * @see https://web.dev/articles/optimize-long-tasks#scheduler-yield
 */
export const yieldToMainThread = () => {
  if (typeof scheduler !== 'undefined' && 'yield' in scheduler) {
    // @ts-ignore - TypeScript doesn't recognize the yield method yet.
    return scheduler.yield();
  }

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  });
};

/**
 * Wait for a specific event on a DOM element, then resolve with the event object.
 *
 * @param {string|Element} target - CSS selector or DOM element
 * @param {string} eventName - Event name (e.g. 'click', 'mouseover', 'submit')
 * @returns {Promise<Event>} Resolves when the event is triggered
 */
// export function waitForEvent(target, eventName) {
//   return new Promise((resolve, reject) => {
//     const el = typeof target === 'string' ? document.querySelector(target) : target;
//     if (!el) {
//       reject(new Error(`Element not found: ${target}`));
//       return;
//     }

//     const handler = (event) => {
//       el.removeEventListener(eventName, handler); // Auto-remove after 1 trigger
//       resolve(event);
//     };

//     el.addEventListener(eventName, handler);
//   });
// }

/**
 * Check that one or multiple images have fully loaded.
 * Accepts a single URL string, an <img> element, or an array of both.
 *
 * @param {string | HTMLImageElement | (string | HTMLImageElement)[]} source
 * @returns {Promise<HTMLImageElement[]>}  Resolves with the loaded <img> elements
 *                                         or rejects on the first error.
 */
export function checkImagesLoaded(source) {
  if (!source) {
    return Promise.resolve();
  }
  // Always work with an array to simplify processing
  const list = Array.isArray(source) ? source : [source];

  // Convert each item into a Promise that resolves when the image loads
  const promises = list.map((item) => new Promise((resolve, reject) => {
    let img;

    // Case 1: item is a URL string → create a new Image object
    if (typeof item === 'string') {
      img = new Image();
      img.src = item;
    }
    // Case 2: item is an existing <img> element already in the DOM
    else if (item instanceof HTMLImageElement) {
      img = item;

      // If the image is already completely loaded, resolve immediately
      if (img.complete && img.naturalWidth !== 0) {
        return resolve(img);
      }
    }
    // Anything else is an invalid input type
    else {
      return reject(new TypeError('Invalid image source'));
    }

    // Listen once for load or error
    img.addEventListener('load',  () => resolve(img), { once: true });
    img.addEventListener('error', () => reject(new Error(`Failed to load ${img.src}`)), { once: true });
  }));

  // Combine all Promises; if any fail, the returned Promise rejects
  return Promise.all(promises);
}
// await imagesloaded(img)
// 1. Single image
// checkImagesLoaded(img)
//   .then(() => console.log('Image loaded'))
//   .catch(console.error);

// 2. Mix of URLs and an existing <img> element

// checkImagesLoaded(checkImgs).then((imgs) => {
//   console.log(`${imgs.length} images loaded successfully`);
// }).catch((err) => {
//   console.warn('At least one image failed:', err.message);
// });

// https://pqina.nl/blog/whats-the-javascript-version-of-sleep/
export function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
// sleep for 1 second
// 1.
// sleep(1000).then(() => {
//     // do this after 1 second
// });
// do this first

// 2.
// // do this first
// await sleep(1000);
// // do this after 1 second


function isVisible(element) {
  // https://stackoverflow.com/questions/1343237/how-to-check-elements-visibility-via-javascript
  return element.offsetWidth > 0 || element.offsetHeight > 0;
}
export function getArrVisible(arrDom) {
  return arrDom.filter((el) => isVisible(el));
}

export const admEvts = {
  select: 'shopify:block:select',
  deselect: 'shopify:block:deselect',
  seSelect: 'shopify:section:select',
  seDeselect: 'shopify:section:deselect',
  seLoad: 'shopify:section:load',
  seUnload: 'shopify:section:unload',
  seReorder: 'shopify:section:reorder'
};

export class AutoplayElement extends HTMLElement {
  #controller;
  constructor() {
    super();
    this.timer = null;
    this.isPlaying = false;
    this.isPaused = this.interval;
    this.timeRemaining = new WeakMap();
    this.startTime = new WeakMap();
    this.timerMap = new WeakMap(); // Store timer in WeakMap
    this.elementSet = new WeakSet();
  }
  get interval() {
    return this._interval = this._interval || parseInt(this.getAttribute('autoplay')) || 0;
  }

  get customPlayFn () {
    return null;
  }
  get customPauseFn () {
    return null;
  }
  get _this () {
    return this.getAttribute('pause-on-hover') ? this.closest(this.getAttribute('pause-on-hover')) || this : this;
  }

  connectedCallback() {
    this.#controller = new AbortController();
    if (!this.interval) return;
    const { signal } = this.#controller,
    _this = this._this;
    this.timeRemaining.set(this, this.interval);

    this.play();
    if (this.hasAttribute('pause-on-hover')) {
      _this.addEventListener('mouseenter', this.pause.bind(this), { signal });
      _this.addEventListener('mouseleave', this.resume.bind(this), { signal });
    }
    this.initObserver();
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), { signal });
    if (Shopify.designMode) {
      // this.addEventListener(admEvts.select, this.pause.bind(this), { signal });
      // this.addEventListener(admEvts.deselect, this.resume.bind(this), { signal });
      this.addEventListener(admEvts.select, ()=> {
        this.forceStop = true;
        this.pause();
      }, { signal });
      this.addEventListener(admEvts.deselect, ()=> {
        this.forceStop = false;
        this.resume();
      }, { signal });
    } else {
      _this.addEventListener('focusin', this.pause.bind(this), { signal });
      _this.addEventListener('focusout', this.resume.bind(this), { signal });
    }
  }

  disconnectedCallback() {
    this.#controller.abort();
    this.stop();
    this.destroy();
  }

  initObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.inView = true;
              this.resume();
            } else {
              this.inView = false;
              this.pause();
            }
        });
    });

    observer.observe(this);
    this.elementSet.add(this);
  }

  handleVisibilityChange() {
    //if (!this.inView) return;
    if (document.hidden) {
        this.pause();
    } else {
      if (this.inView) this.resume();
    }
  }

  play() {
    if (!this.interval || (this.isPlaying && !this.isPaused)) return;
    this.isPlaying = true;
    this.isPaused = false;
    this.startTime.set(this, performance.now());
    const timer = setTimeout(() => {
        this.isPlaying = true;
        this.timeRemaining.set(this, this.interval); // Reset timeRemaining after execution
        this.play(); // Continue playing
        if (this.customPlayFn) this.customPlayFn(this);
    }, this.timeRemaining.get(this) || this.interval);
    this.timerMap.set(this, timer);
    this.updateRemainingState();
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return
    const timer = this.timerMap.get(this);
    clearTimeout(timer);
    this.isPaused = true;
    this.isPlaying = false;
    const elapsed = performance.now() - this.startTime.get(this);
    this.timeRemaining.set(this, Math.max((this.timeRemaining.get(this) || this.interval) - elapsed, 60));
    if (this.customPauseFn) this.customPauseFn(this);
    this.updateRemainingState();
  }

  resume() {
    if (this.isPaused) {
        this.isPaused = false;
        this.play();
    }
  }

  stop() {
      const timer = this.timerMap.get(this);
      clearTimeout(timer);
      this.isPlaying = false;
      this.isPaused = false;
      this.timeRemaining.set(this, this.interval);
      this.updateRemainingState();
  }

  reset() {
    if (this.forceStop) return;
    this.stop();
    this.play();
  }

  destroy() {
      const observer = this.elementSet.has(this) ? this.elementSet.delete(this) : null;
      this.elementSet = null;
      this.timeRemaining = null;
      this.startTime = null;
      this.timerMap = null;
  }

  updateRemainingState() {
    this.style.setProperty('--hdt-play-state', this.isPlaying ? 'running' : 'paused');
    this.dispatchEvent(new CustomEvent('play:state'));
    //this.style.setProperty('--hdt-remaining', `${this.interval}ms`);
  }
}

export const expiresManager = {
  PREFIX: 'theme4:',

  /**
   * @param {string} key
   * @param {interger} minDays
   */
  set(key, minDays) {
    localStorage.setItem(`${this.PREFIX}${key}`, JSON.stringify({ expires: Date.now() + minDays * 864e5 }));
  },

  /**
   */
  check(key) {
    const raw = localStorage.getItem(`${this.PREFIX}${key}`);
    if (!raw) return null;

    try {
      const { expires } = JSON.parse(raw);
      if (Date.now() < expires) {
        return true;
      }

      localStorage.removeItem(`${this.PREFIX}${key}`);
      return false;
    } catch {
      localStorage.removeItem(`${this.PREFIX}${key}`);
      return false;
    }
  }
};

const liveRegion = document.getElementById('hdt-cart-live-region');
export const announce = (message, isError = false) => {
  if (!liveRegion) return;

  liveRegion.setAttribute('aria-live', isError ? 'assertive' : 'polite');
  liveRegion.textContent = '';

  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
}

export function shimmer(el) {
  el?.setAttribute('shimmer', '');
}
/**
 * Resets the shimmer attribute on all elements in the container.
 * @param {Element} [container] - The container to reset the shimmer attribute on.
 */
export function resetShimmer(container = document.body) {
  const shimmer = $$4('[shimmer]', container);
  shimmer.forEach((item) => item.removeAttribute('shimmer'));
}

// Header height CSS variables
// const html = document.documentElement,
// header = document.querySelector('.hdt-section-header--main');

// function calculateHeaderGroupHeight() {
//   let totalHeight = 0;
//   document.querySelectorAll('.shopify-section-group-header-group:not(.hdt-section-header--main)').forEach((section)=> totalHeight += section.offsetHeight);
//   html.style.setProperty('--header-group-height', `${totalHeight}px`);
// }
// window.addEventListener("resize", calculateHeaderGroupHeight);

// calculateHeaderGroupHeight();

// html.style.setProperty('--header-height', `${header.clientHeight.toFixed(2)}px`);