/**
* -----------------------------------------------------------------------------
0. Base
1. Component carousel
2. Image behavior
3. Image with text
4. Marquee
5. Countdown timer
6. Multimedia player
7. Gallery modal
8. Product media
9. Product card
10. Before after
11. Dialog
12. Accordion
13. Tab player list
14. Copy button and share button
15. Lazy HTML
16. Customer JS
ease = [0.25, 0.1, 0.25, 1.0]
* -----------------------------------------------------------------------------
**/

/**
* 0. Base
* -----------------------------------------------------------------------------
*/
import { $4, $$4, $id4, debounce, throttle, fetchCache, fetchConfig, currency, matchMediaQuery, createImg, renderSrcset, requestIdleCallback, checkImagesLoaded, getArrVisible, AutoplayElement, expiresManager, announce, shimmer, resetShimmer } from '@theme/utilities';
import { ThemeEvents, CartUpdateEvent, CartCountEvent, QuantitySelectorUpdateEvent, MediaStartedPlayingEvent, DiscountUpdateEvent } from '@theme/events';
import { animate, stagger, scroll, inView, frame, resize, delay, motionValue, hover, springValue, styleEffect } from "@theme/m";
import { trapFocus, removeTrapFocus, elFocus } from '@theme/focus';
const  {cartUpdate, cartReload, cartCount, cartTab, cartLive, cartError, currencyUpdate, cartDrawerRender, cartMainRender, loadingStart, loadingEnd, admEvts, dialogAdded, dialogOpening, dialogOpen, dialogClosing, dialogClose, discountUpdate} = ThemeEvents;

const html = document.documentElement,
getDir = html.getAttribute("dir"),
isRTL = ("rtl" == getDir);

// Memory leaks
var getterAdd = (ww, key, value, override = false) => {
  //console.log('override', override );
  if (!override && ww.has(key) ) return;
  //console.log('addd', !override, ww.has(key), value );
  (ww instanceof WeakSet) ? ww.add(key) : ww.set(key, value);
};
var getterGet = (wm, key, value) => {
  if ( !wm.has(key)) {
    if (value) {
      getterAdd(wm, key, value, true);
    } else {
      return null;
    }
  }
  return wm.get(key);
};
var getterRunFn = (ww, key, fn) => {
  if ( !ww.has(key)) throw TypeError(ww + "no exist");
  return fn;
};
var getterDelete = (ww, key) => {
  if ( ww.has(key)) ww.delete(key);
};
// var _thu = { nvt: 1 };
// function isFunction(functionToCheck) {
//   return (typeof functionToCheck === "function");
// }
// function loadScript(src) {
//   return new Promise(function(resolve, reject) {
//   const script = document.createElement('script');
//   script.async = true;
//   script.src = src;
//   script.onload = resolve;
//   script.onerror = reject;
//   document.head.appendChild(script);
//   });
// }

// const JSONProducts = {};
// class getJSONProduct {
//   static load(productHandle) {
//     if (!productHandle) {
//       return;
//     }
//     if (JSONProducts[productHandle]) {
//       return JSONProducts[productHandle];
//     }
//     JSONProducts[productHandle] = new Promise(async (resolve, reject) => {
//       const response = await fetch(`${Shopify.routes.root}products/${productHandle}.js`);
//       if (response.ok) {
//         const responseAsJson = await response.json();
//         resolve(responseAsJson);
//       } else {
//         reject(`${productHandle} not loaded json`);
//       }
//     });
//     return JSONProducts[productHandle];
//   }
// };

// Visibilitychange
// function visibilitychangeFn(options) {
//   if (!options.observes) return;
//   const checkVisibility = () => {
//     if (document.visibilityState === 'visible') {
//       if (isFunction(options.play) && options.observes.isInview) options.play();
//     } else if (isFunction(options.pause)) {
//       options.pause();
//     }
//   }
//   document.addEventListener('visibilitychange', checkVisibility);

// }

/**
 * Wrap tables in a container div to make them scrollable when needed
 */
function rteWrapTable(doc = document) {
  const tables = $$4('.rte table:not(.hdt-wrapper-added)', doc);
  if (tables.length == 0) return
  tables.forEach((table) => {
    table.classList.add('hdt-wrapper-added');
    table.outerHTML = `<div class="hdt-scrollable-wrapper">${table.outerHTML}</div>`;
  });
}

/**
 * Add aria-describedby attribute to external and new window links
 */
function accessibleLinks(doc = document) {
  const { hostname } = window.location,
  links = $$4('a[href]:not([aria-describedby])', doc);
  if (links.length == 0) return;

  links.forEach((link) => {
    const isExternal  = link.hostname !== hostname,
        isTargetBlank = link.getAttribute('target') === '_blank';

    if (isTargetBlank) {
      link.setAttribute('aria-describedby', isExternal ? 'a11y-new-window-external-message' : 'a11y-new-window-message');
      const rel = link.getAttribute('rel');
      if (!rel || rel.indexOf('noopener') === -1) {
        link.setAttribute('rel',`${rel ? rel + ' '  : ''}noopener`);
      }
    } else if (isExternal) {
      link.setAttribute('aria-describedby', 'a11y-external-message');
    }
  });
}

/** Link Mylti Lang **/
function localeUrl(doc = document) {
  const {root} = Shopify.routes,
        {hostname} = window.location;
  if ( root == '/' ) return;
  $$4('a[href="/"]', doc).forEach((el) => el.setAttribute('href', root ));
  $$4(`a[href*="${hostname}/"]:not([href*="${hostname + root}"],[href*="@"],[href*="preview_theme_id="])`, doc).forEach((el) => el.setAttribute('href', el.getAttribute('href').replace( `${hostname}/`, hostname + root ) ));
};

// https://web.dev/articles/declarative-shadow-dom
class attachShadowRoots extends HTMLElement {
  connectedCallback(){
    if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRootMode') ) this.attachShadowRoots();
    if (Shopify.designMode) {
      this.closest('.shopify-section')?.addEventListener(admEvts.seLoad, (evt) => {
        //console.log('attachShadowRoots seLoad', evt);
        this.attachShadowRoots();
      });
      // this.closest('.shopify-section')?.addEventListener(admEvts.seSelect, (evt) => {
      //   console.log('attachShadowRoots seSelect', evt);
      // });
      // this.addEventListener(admEvts.select, (evt) => {
      //   console.log('attachShadowRoots select', evt);
      // });
      // this.addEventListener(admEvts.deselect, (evt) => {
      //   console.log('attachShadowRoots deselect', evt);
      // });
    }
  }
  attachShadowRoots() {
    //console.log('attachShadowRoots', this.shadowRoot);
    if (this.shadowRoot) return;
    const tmp = $4('template[shadowrootmode]', this);
    const shadowRoot = tmp.parentNode.attachShadow({ mode: "open" });
    shadowRoot.appendChild(tmp.content);
    tmp.remove();
  }
}
class DragScroll extends attachShadowRoots {
  #isDown = false;
  #isDragging = false;
  #startX = 0;
  #scrollLeft = 0;
  #velocity = 0;
  #momentumID = null;
  #isBound = false;
  #dragThreshold = 10;
  #controller;

  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
    this.#checkAndBind();
    resize(this, () => this.#checkAndBind);
  }
  disconnectedCallback() {
    this.#controller?.abort();
  }

  get #needsScroll() {
    return this.scrollWidth > this.clientWidth;
  }

  #checkAndBind = () => {
    if (!this.#isBound && this.#needsScroll) {
      this.#isBound = true;
      this.#controller = new AbortController();
      const { signal } = this.#controller;
      this.addEventListener('mousedown', this.#onMouseDown, { signal });
      this.addEventListener('mouseleave', this.#onMouseLeave, { signal });
      this.addEventListener('mouseup', this.#onMouseUp, { signal });
      this.addEventListener('mousemove', this.#onMouseMove, { signal });
      $$4('img, a', this).forEach(img => {
        img.addEventListener('dragstart', e => e.preventDefault(), { signal });
      });
    } else if (this.#isBound && !this.#needsScroll) {
      this.#isBound = false;
      this.#controller?.abort();
    }
  }

  #stopMomentum = () => {
    cancelAnimationFrame(this.#momentumID);
  }

  #startMomentumScroll = () => {
    this.#stopMomentum();
    const momentum = () => {
      this.scrollLeft += this.#velocity;
      this.#velocity *= 0.95; // friction hệ số giảm tốc (0.9–0.98 là hợp lý)
      if (Math.abs(this.#velocity) > 0.5) {
        this.#momentumID = requestAnimationFrame(momentum);
      } else {
        this.removeAttribute('dragging');
      }
    };
    momentum();
  }

  #onMouseDown = (e) => {
    this.#isDown = true;
    this.#isDragging = false;
    this.#startX = e.pageX - this.offsetLeft;
    this.#scrollLeft = this.scrollLeft;
    this.#stopMomentum();
  };

  #onMouseLeave = () => {
    if (!this.#isDown) return;
    this.#isDown = false;
    if (this.#isDragging) {
      this.#isDragging = false;
      this.removeAttribute('dragging');
    }
  };

  #onMouseUp = () => {
    if (!this.#isDown) return;
    this.#isDown = false;
    if (this.#isDragging) {
      this.#isDragging = false;
      this.removeAttribute('dragging');
      this.#startMomentumScroll();
    }
  };

  #onMouseMove = (e) => {
    if (!this.#isDown) return;
    const x = e.pageX - this.offsetLeft;
    const walk = x - this.#startX;
    if (!this.#isDragging && Math.abs(walk) > this.#dragThreshold) {
      this.#isDragging = true;
      this.setAttribute('dragging', '');
    }
    if (this.#isDragging) {
      e.preventDefault();

      const prevScroll = this.scrollLeft;
      this.scrollLeft = this.#scrollLeft - walk;

      // if (this.scrollLeft <= 0 || this.scrollLeft >= this.scrollWidth - this.clientWidth) {
      //   this.#startX = x;
      //   this.#scrollLeft = this.scrollLeft;
      // }

      this.#velocity = this.scrollLeft - prevScroll;
    }
  };
}

customElements.define('hdt-tmp', attachShadowRoots);
customElements.define('hdt-tmp-scroll', DragScroll);

let cartPromise = null;
function getCart() {
  if (!cartPromise) {
    cartPromise = fetch(`${Shopify.routes.root}cart.js`)
    .then(r => r.json())
    .finally(() => {
      // Detete cache after when resolve/reject done
      setTimeout( ()=> {
        cartPromise = null;
      }, 200)
    });
  }
  return cartPromise;
}

class Resize extends HTMLElement {
  constructor() {
    super();
    resize(this, (_, { height }) => {
      frame.render(() => {
        html.style.setProperty(`--${this.getAttribute("prefix")}-height`, `${height.toFixed(2)}px`);
      })
    });
  }
  connectedCallback() {
    if (!window.ResizeObserver) html.style.setProperty(`--${this.getAttribute("prefix")}-height`, `${Math.round(this.clientHeight)}px`);
  }
};
customElements.define("hdt-resize", Resize);

const animationContent = {
  "none": "none",
  'ani0': ["translateY(0)", "translateY(0)"], // Fading
  'ani1': ["translateY(150px)", "translateY(0)"], // slide-from-bottom
  'ani2': ["translateY(-150px)", "translateY(0)"], // slide-from-top
  'ani3': ["translateX(-500px)", "translateX(0)"], // slide-from-left
  'ani4': ["translateX(500px)", "translateX(0)"], // slide-from-right
  'ani5': ["translateX(-150px)", "translateX(0)"], // slide-short-from-right
  'ani6': ["translateX(150px)", "translateX(0)"], // slide-short-from-right
  'ani7': ["scale(0.6)", "scale(1)"], // zoom-in
  'ani8': ["translateY(100px) rotate3d(1, 0, 0, 90deg) scale(0.6)", "perspective(1000px) translateY(0) rotate3d(1, 0, 0, 0deg) scale(1)"], // bottom-flip-x
  'ani9': ["translateY(-100px) rotate3d(1, 0, 0, 90deg) scale(0.6)", "perspective(1000px) translateY(0) rotate3d(1, 0, 0, 0deg) scale(1)"], // top-flip-x
  'ani10': ["translateX(-100px) rotate3d(0, 1, 0, -90deg) scale(0.6)", "perspective(1000px) translateY(0px) rotate3d(0, 1, 0, 0deg) scale(1)"], // left-flip-y
  'ani11': ["translateX(100px) rotate3d(0, 1, 0, 90deg) scale(0.6)", "perspective(1000px) translateY(0px) rotate3d(0, 1, 0, 0deg) scale(1)"]  // right-flip-y
}

var _header = new WeakMap();
class StickyHeader extends Resize {
  #scroll;
  constructor() {
    super();
  }
  get header() {
    return getterGet(_header, this);
  }

  connectedCallback() {
    this.checkTransparent();
    super.connectedCallback();
    this.stickyType = this.getAttribute('sticky-type');
    if (this.stickyType === 'none') return;

    getterAdd(_header, this, this.closest('.hdt-section-header--main'));
    this.headerIsAlwaysSticky = this.stickyType === 'always';
    this.headerBounds = {};

    if (this.headerIsAlwaysSticky) {
      this.header.classList.add('shopify-section-header-sticky');
    };

    this.currentScrollTop = 0;
    this.preventReveal = false;
    this.predictiveSearch = $4('predictive-search', this);

    this.#scroll = this.onScroll.bind(this);
    this.hideHeaderOnScrollUp = () => this.preventReveal = true;

    this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.addEventListener('scroll', this.#scroll, false);

    this.createObserver();
    this.setAttribute('sticky-inted', '');
    // let timeOut;
    // hover(this, () => {
    //   clearTimeout(timeOut);
    //   this.header.classList.add('is--hover');
    //   return () => {
    //     timeOut = setTimeout(() => {
    //       this.header.classList.remove('is--hover');
    //     }, 250);
    //   }
    // });
  }

  disconnectedCallback() {
    this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.removeEventListener('scroll', this.#scroll);
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    this.header.classList.remove('shopify-section-prevent-hide');
    const scrollTop = window.scrollY || html.scrollTop;

    if (this.predictiveSearch && this.predictiveSearch.isOpen) return;
    //console.log(this.headerBounds)
    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      this.header.classList.add('scrolled-past-header');
      if (this.preventHide) return;
      requestAnimationFrame(this.hide.bind(this));
    } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      this.header.classList.add('scrolled-past-header');
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      this.header.classList.remove('scrolled-past-header');
      if (this.preventHide) {
        return this.header.classList.add('shopify-section-prevent-hide');
      }
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  hide() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
    this.closeMenuDisclosure();
    // this.closeSearchModal();
  }

  reveal() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add('shopify-section-header-sticky', 'animate');
    this.header.classList.remove('shopify-section-header-hidden');
  }

  reset() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
  }

  closeMenuDisclosure() {
    //$$4('header-menu > details[open]', this.header).forEach(disclosure => disclosure.parentElement.toggle(false));
  }

  checkTransparent() {
    if ( !this.hasAttribute('transparent') || !$4('main > .section-sp-transparent.hdt-section:first-child') || $4('.hdt-section-header + .shopify-section') ) return;
    html.classList.add('header-transparent-on');
  }
}
customElements.define("hdt-sticky-header", StickyHeader);


class DragCursor extends HTMLElement {
  #controller;
  #x = springValue(0);
  #y = springValue(0);
  #initialX;
  #initialY;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    if (!this.isPointerSupported) return;
    const { top, left, width, height } = this.getBoundingClientRect();
    this.#initialX = left + width / 2;
    this.#initialY = top + height / 2;
    styleEffect(this, { x: this.#x, y: this.#y })
  }
  disconnectedCallback() {
   this.#controller.abort();
  }

  get isPointerSupported() {
    return (
      !('ontouchstart' in window) &&
      !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) &&
      window.matchMedia('(pointer: fine)').matches
    );
  }

  setupCursorElement(parentEl) {
    if (!this.isPointerSupported) return;
    if (!this.inited) {
      document.addEventListener('mousemove', this.handleMouseMove.bind(this), { signal: this.#controller.signal });
      this.inited = true;
    }
    hover(parentEl, () => {
      this.handleCursor(parentEl)
      return () => this.handleCursor(parentEl, false);
    })
    // parentEl.addEventListener('mouseenter', this.handleCursor.bind(this, parentEl));
    // parentEl.addEventListener('mouseleave', this.handleCursor.bind(this, parentEl));
    parentEl.addEventListener('mousemove', this.handleCursor.bind(this, parentEl), { once: true });
    $$4('a:not([unless]), button, [role="button"], [hide-cursor-drag]', parentEl).forEach(element => {
      hover(element, () => {
        this.handleLinkHover(parentEl)
        return () => this.handleLinkHover(parentEl, true);
      })
      // element.addEventListener('mouseenter', this.handleLinkHover.bind(this, parentEl));
      // element.addEventListener('mouseleave', this.handleLinkHover.bind(this, parentEl));
    });
  }

  handleMouseMove(e) {
    this.#x.set(e.clientX - this.#initialX)
    this.#y.set(e.clientY - this.#initialY)
    // requestAnimationFrame(() => {
    //   animate(this, { left: [null, `${e.clientX}px`], top: [null, `${e.clientY}px`] }, { duration: .03, ease: 'easeOut' });
    // });
  }
  // handleCursor(el, e) {
  //   if (!el?.isActive) return;
  //   this.classList.toggle('crs-drag-active', e.type !== 'mouseleave');
  //   el.classList.toggle('crs-drag-active', e.type !== 'mouseleave');
  // }
  handleCursor(el, add = true) {
    if (!el?.isActive) return;
    this.classList.toggle('crs-drag-active', add);
    el.classList.toggle('crs-drag-active', add);
  }
  // handleLinkHover(el, e) {
  //   //console.log(el)
  //   if (!el?.isActive) return;
  //   this.classList.toggle('crs-drag-active', e.type === 'mouseleave');
  //   el.classList.toggle('crs-drag-active', e.type === 'mouseleave');
  // }
  handleLinkHover(el, add = false) {
    //console.log(el)
    if (!el?.isActive) return;
    this.classList.toggle('crs-drag-active', add);
    el.classList.toggle('crs-drag-active', add);
  }
}
customElements.define('hdt-drag-cursor', DragCursor);

/**
* 2. Image behavior
* -----------------------------------------------------------------------------
*/
var _image_behavior = new WeakSet(),
_image_behavior_fn, _img_effect = new WeakMap(),
_behavior_effect  = new WeakMap();
class ImageBehavior extends HTMLElement {
  constructor() {
    super();
    getterAdd(_image_behavior, this);
    getterAdd(_img_effect, this, $4('img[is="img-effect"]', this));
  }
  get imgEffect() {
    return getterGet(_img_effect, this);
  }
  get behaviorEffect() {
    return getterGet(_behavior_effect, this);
  }
  connectedCallback() {
    if (!this.imgEffect) return;
    getterAdd(_behavior_effect, this, this.getAttribute('eff') || this.imgEffect.getAttribute('eff'));
    if (this.behaviorEffect != 'none' && matchMediaQuery("motion")) getterRunFn(_image_behavior, this, _image_behavior_fn).call(this);
  }
};
_image_behavior_fn = function(){
  if ( this.behaviorEffect === 'ambient' ) {
    // ambient
    animate(this.imgEffect, { transform: ["rotate(0deg) translateX(1em) rotate(0deg) scale(1.2)", "rotate(360deg) translateX(1em) rotate(-360deg) scale(1.2)"] }, {
      duration: 30,
      ease: "linear",
      repeat: Infinity
    });
  } else if ( this.behaviorEffect === 'parallax' ) {
    // parallax
    const getScale = parseFloat(this.style.getPropertyValue("--parallax-scale") || 1.3),
    [scale, translate] = [getScale, 0.15 * 100 / getScale],
    isFirstSection = this.closest(".hdt-section")?.matches(":first-child");
    scroll(
      animate(this.imgEffect, { transform: [`scale(${scale}) translateY(-${translate}%)`, `scale(${scale}) translateY(${translate}%)`] }, { ease: "linear" }),
      {
        target: this.imgEffect,
        offset: [isFirstSection ? "start start" : "start end", "end start"]
      }
    );
  }

};
customElements.define("hdt-effect-img", ImageBehavior);

/**
* 4. Marquee
* -----------------------------------------------------------------------------
* https://github.com/ezekielaquino/Marquee3000/tree/master
* https://stackoverflow.com/questions/71165923/how-do-i-make-an-infinite-marquee-with-js
* https://stackoverflow.com/questions/337330/javascript-marquee-to-replace-marquee-tags
*/
// var _marquee_old_width = new WeakMap(),
// _marquee_animation = new WeakMap(),
// _marquee_create_content = new WeakSet(), marquee_create_content_fn,
// _marquee_destroy_content = new WeakSet(), marquee_destroy_content_fn,
// _marquee_enter = new WeakSet(), marquee_enter_fn,
// _marquee_leave = new WeakSet(), marquee_leave_fn;
// class Marquee extends HTMLElement {
//   constructor() {
//     super();
//     this.classes = {
//       enabled  : 'hdt-marquee--enabled',
//       duplicate: 'hdt-marquee--duplicate'
//     };
//     getterAdd(_marquee_old_width, this, 0);
//     getterAdd(_marquee_animation, this, void 0);
//     getterAdd(_marquee_create_content, this);
//     getterAdd(_marquee_destroy_content, this);
//     getterAdd(_marquee_enter, this);
//     getterAdd(_marquee_leave, this);
//     this.attachShadow({ mode: "open" }).appendChild(document.createRange().createContextualFragment("<slot part='wrapper'></slot>"));
//     this.init();
//     let resizeObserver = new ResizeObserver(entries => this.init());
//     resizeObserver.observe(this);
//     this.addEventListener('unobserve', (e)=> {
//       //console.log(e.composed,e.bubbles,e.cancelable);
//       resizeObserver.unobserve(this); resizeObserver = null });

//     if (matchMediaQuery("motion")) {
//       inView(this, (info) => {

//         getterGet(_marquee_animation, this)?.play();
//         this.isInview = true;
//         // console.log('play')
//         return (leaveInfo) =>  {
//           getterGet(_marquee_animation, this)?.pause();
//           this.isInview = false;
//           //console.log('pause')
//         }
//       }, { margin: "250px" })

//       // listen for visibility change event
//       visibilitychangeFn({
//         observes: this,
//         play: getterGet(_marquee_animation, this)?.play(),
//         pause: getterGet(_marquee_animation, this)?.pause()
//       });
//     }
//   }
//   connectedCallback() {
//     if (Shopify.designMode) this.init();
//   }
//   disconnectedCallback() {
//     this.removeEventListener("mouseenter", getterRunFn(_marquee_enter, this, marquee_enter_fn).bind(this));
//     this.removeEventListener("touchstart", getterRunFn(_marquee_enter, this, marquee_enter_fn).bind(this));
//     this.dispatchEvent(new CustomEvent("unobserve"));
//   }
//   init() {
//     if (this.clientWidth < getterGet(_marquee_old_width, this) ) return;
//     getterAdd(_marquee_old_width, this, this.clientWidth, true);
//     getterRunFn(_marquee_destroy_content, this, marquee_destroy_content_fn).call(this);
//     getterRunFn(_marquee_create_content, this, marquee_create_content_fn).call(this);
//   }
//   get wrapper() {
//     return this.shadowRoot.querySelector('[part="wrapper"]');
//   }
// };
// marquee_create_content_fn = function(){
//   let multiply = Math.max((Math.ceil(this.clientWidth / this.firstElementChild.offsetWidth)+1), 2),
//   clone,
//   i;
//   // calc speed
//   // https://stackoverflow.com/questions/38118002/css-marquee-speed
//   // By dividing the width by a certain value (100 in the example), we can adjust the speed of the "marquee" effect

//   // Duplicate content at least once
//   const frag = document.createDocumentFragment();
//   for (i = 0; i < multiply; i++) {
//     clone = this.firstElementChild.cloneNode(true);
//     clone.setAttribute('aria-hidden',true);
//     clone.classList.add(this.classes.duplicate);
//     clone.style.setProperty('--index', i + 1);
//     frag.appendChild(clone);
//   }
//   this.append(frag);

//   // Add holder init class
//   this.classList.add(this.classes.enabled);

//   if (matchMediaQuery("motion")) {
//     getterAdd(
//       _marquee_animation, this,
//       animate(this.wrapper, { transform: ["translateX(0)", `translateX(calc(var(--value-logical-flip) * var(--dir-logical) * 100%))`] }, {
//         duration: 1 / parseFloat(this.getAttribute("speed") || 0.4) * (this.wrapper.clientWidth / 350),
//         ease: "linear",
//         repeat: Infinity
//       })
//     , true);
//     //getterGet(_marquee_animation, this)?.pause();
//     if (this.hasAttribute('pausable')) {
//       this.addEventListener("mouseenter", getterRunFn(_marquee_enter, this, marquee_enter_fn).bind(this));
//       this.addEventListener("touchstart", getterRunFn(_marquee_enter, this, marquee_enter_fn).bind(this));
//     }
//   }
// }
// marquee_destroy_content_fn = function(){
//   // Remove holder init class
//   this.classList.remove(this.classes.enabled);
//   // Remove duplicated content
//   const boxes = $$4('.'+this.classes.duplicate, this);
//   if (boxes.length) boxes.forEach(e => e.remove() );
// }
// marquee_enter_fn = function(){
//   getterGet(_marquee_animation, this)?.pause();
//   this.addEventListener("mouseleave", getterRunFn(_marquee_leave, this, marquee_leave_fn).bind(this));
//   this.addEventListener("touchend", getterRunFn(_marquee_leave, this, marquee_leave_fn).bind(this));
// }
// marquee_leave_fn = function(){
//   getterGet(_marquee_animation, this)?.play();
//   this.removeEventListener("mouseleave", getterRunFn(_marquee_leave, this, marquee_leave_fn).bind(this));
//   this.removeEventListener("touchend", getterRunFn(_marquee_leave, this, marquee_leave_fn).bind(this));
// }
class Marquee extends HTMLElement {
 #resizeObserver;
  constructor() {
    super();
    const rawDirection = this.getAttribute('direction') || 'ltr';
    this._speed = 300 * parseFloat(this.getAttribute('speed-factor') || 0.4); // Move 300px/s
    this._direction = isRTL ? rawDirection === 'ltr' ? 'rtl' : 'ltr' : rawDirection;
    this._animation = null;
    this.#resizeObserver = null,
    this._lastWidth = 0;
  }

  connectedCallback() {
    this._inner = $4('.hdt-marquee-inner', this);
    //console.log(this)
    if (!this._inner) {
      let _originalItem = $4('.hdt-marquee-item', this);
      this.innerHTML = '';
      this._inner = document.createElement('div');
      this._inner.className = 'hdt-marquee-inner';
      this.appendChild(this._inner);
      this._inner.appendChild(_originalItem.cloneNode(true));
    }

    this._setup();
    this.#resizeObserver = resize(this, this._setup.bind(this));
    // this.#resizeObserver = new ResizeObserver(this._setup.bind(this));
    // this.#resizeObserver.observe(this);
    //window.addEventListener('resize', this._setup.bind(this));
    // Hover pause
    if (this.hasAttribute('pausable') && matchMediaQuery("motion")) {
      this.addEventListener('mouseenter', () => this._animation?.pause());
      this.addEventListener('mouseleave', () => this._animation?.play());
    }
  }

  disconnectedCallback() {
    this._lastWidth = 0;
    this._animation?.cancel();
    //window.removeEventListener('resize', this._setup);
    if (this.#resizeObserver) this.#resizeObserver();
  }

  _setup() {
    let firstWidth = this._inner.firstElementChild.offsetWidth;
    if (firstWidth === 0 || this._lastWidth == firstWidth) return;
    this._lastWidth = firstWidth;
    $$4('.hdt-marquee--duplicate', this).forEach(e => e.remove() );
    //this._inner.innerHTML = '';
    //console.log(this._inner?.firstElementChild)
    const clonesNeeded = Math.ceil((this.offsetWidth * 3) / firstWidth);

    const frag = document.createDocumentFragment();
    let i;
    let clone;
    for (i = 0; i < clonesNeeded; i++) {
      clone = this._inner.firstElementChild.cloneNode(true);
      clone.setAttribute('aria-hidden',true);
      clone.classList.add('hdt-marquee--duplicate');
      $$4('a, button', clone).forEach((el) => el.tabIndex = -1);
      frag.appendChild(clone);
    }
    this._inner.append(frag);
    clone = null;

    if (!matchMediaQuery("motion")) return;

    const moveDistance = this._inner.scrollWidth / 3;
    const duration = moveDistance / this._speed; // seconds
    //console.log(duration)

    const from = this._direction === 'rtl' ? '0px' : `-${moveDistance}px`;
    const to = this._direction === 'rtl' ? `-${moveDistance}px` : '0px';
    //console.log(from, to, this._direction)

    this._animation?.stop();
    this._animation = animate(this._inner, {
      transform: [`translateX(${from}) translateZ(0)`, `translateX(${to}) translateZ(0)`]
    }, {
      duration: duration,
      ease: 'linear',
      repeat: Infinity
    });
  }
}

customElements.define('hdt-marquee', Marquee);
/**
* 5. Countdown timer
* -----------------------------------------------------------------------------
*/

const countdown = {
  selectors: {
    "days": "[is='days']",
    "hours": "[is='hours']",
    "minutes": "[is='minutes']",
    "seconds": "[is='seconds']"
  },
  classes: {
    "enabled": "hdt-cd--enabled",
    "hide": "hdt-cd--hide",
    "complete": "hdt-cd--complete"
  },
  defaults: {
    "idTmp": null,
    "hasZero": true,
    "actionElapsed": 'zero'
  }
};
var _ending_date = new WeakMap(),
_timer_frame = new WeakMap(), _timer_playing = new WeakMap(),
_timer_loop = new WeakSet(), timer_loop_fn,
_timer_play = new WeakSet(), timer_play_fn,
_timer_pause = new WeakSet(), timer_pause_fn,
_timer_destroy = new WeakSet(), timer_destroy_fn,
_timer_in_view = new WeakMap(), _timer_doc_hidden = new WeakMap(),
_timer_options = new WeakMap(),
_timer_days_el = new WeakMap(), _timer_hours_el = new WeakMap(), _timer_minutes_el = new WeakMap(), _timer_seconds_el = new WeakMap();
const { daysMax } = themeHDN.settings;
class CountdownTimer extends HTMLElement {
  constructor() {
    super();
    getterAdd(_timer_loop, this);
    getterAdd(_timer_play, this);
    getterAdd(_timer_pause, this);
    getterAdd(_timer_destroy, this);
    getterAdd(_timer_playing, this, false);
    getterAdd(_timer_in_view, this, false);
    getterAdd(_timer_doc_hidden, this, false);

    getterAdd(_timer_options, this, Object.assign({}, countdown.defaults,  JSON.parse(this.getAttribute('config') || '{}')));
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
    // YYYY-MM-DDTHH:mm:ssZ
    //const endingDate = new Date('2024-08-05T00:00:00-04:00');
    const endingDate = new Date(getterGet(_timer_options, this).datetime+(themeHDN.settings.shopTimezone || ""));
    //console.log(endingDate)
    if (isNaN(endingDate)) return;
    getterAdd(_ending_date, this, endingDate);

    if (getterGet(_timer_options, this).idTmp) {
      const idTmp = $id4(getterGet(_timer_options, this).idTmp);
      if (idTmp) this.innerHTML = idTmp.innerHTML;
    }

    getterAdd(_timer_days_el, this, $4(countdown.selectors.days,this));
    getterAdd(_timer_hours_el, this, $4(countdown.selectors.hours,this));
    getterAdd(_timer_minutes_el, this, $4(countdown.selectors.minutes,this));
    getterAdd(_timer_seconds_el, this, $4(countdown.selectors.seconds,this));
    if (this.daysEl) {
      this.daysEl.isDay = true;
      this.daysEl.max = daysMax;
    } else {
      this.hrsEl.isHour = true;
      //this.hrsEl.max = 24 * daysMax;
      this.hrsEl.max = daysMax == 99 ? 99 : 24 * daysMax;
    }

    // int
    // console.log(!getterGet(_timer_frame, this))
    if (!getterGet(_timer_frame, this)) this.classList.add(countdown.classes.enabled);
    getterRunFn(_timer_play, this, timer_play_fn).call(this);

    inView(this, () => {
       getterAdd(_timer_in_view, this, true, true);
      this.isInview = true;
      return () =>  {
       getterAdd(_timer_in_view, this, false, true);
      }
    }, { margin: "444px" });

    // Listen for visibility change event
    document.addEventListener("visibilitychange", () => getterAdd(_timer_doc_hidden, this, document.hidden, true));
  }
  connectedCallback() {
    // Fixed
  }
  disconnectedCallback() {
    //getterRunFn(_timer_destroy, this, timer_destroy_fn).call(this);
    if (typeof _timer_destroy !== 'undefined' && typeof timer_destroy_fn === 'function') {
      try {
        getterRunFn(_timer_destroy, this, timer_destroy_fn).call(this);
      } catch (e) {
        console.warn("Timer cleanup failed", e);
      }
    }
  }
  get daysEl() {
    return getterGet(_timer_days_el, this);
  }
  get hrsEl() {
    return getterGet(_timer_hours_el, this);
  }
};
timer_loop_fn = function(){
  const { actionElapsed, hasZero } = getterGet(_timer_options, this);
  // Get today's date and time
  const nowDate = new Date();
  if (getterGet(_ending_date, this) < nowDate) {
    getterRunFn(_timer_destroy, this, timer_destroy_fn).call(this);

    // If the count down is finished, write some text
    // actionElapsed: hide, hide_cd_show_mess, zero
    this.classList.add(countdown.classes.complete);
    if (actionElapsed == 'hide') {
      const hideEl = this.classList.contains('hide-cd-elapsed') ? this : this.closest('.hide-cd-elapsed');
      if (Shopify.designMode) {
        hideEl?.setAttribute('hidden', '');
      } else {
        hideEl?.remove();
      }
    } else {
      if (actionElapsed == 'hide_cd_show_mess') {
        this.style.opacity = 0;
        this.nextElementSibling?.removeAttribute('hidden');
      }
      return clearInterval(getterGet(_timer_frame, this));
    }
  }

  if (!getterGet(_timer_in_view, this) || getterGet(_timer_doc_hidden, this)) return;

  let diff = Math.abs((getterGet(_ending_date, this).getTime() - nowDate.getTime()) / 1e3);  // Time calculations for days, hours, minutes and seconds

  const totalHours  = Math.floor(diff / 3600);
  const days        = Math.floor(diff / 86400);
        diff       -= days * 86400;
  let   hours       = Math.floor(diff / 3600);
        diff       -= hours * 3600;
  const minutes     = Math.floor(diff / 60);
        diff       -= minutes * 60;
  const seconds     = Math.floor(diff);

  //if (!this.daysEl) hours = totalHours;
  //console.log(hours)
  if (this.daysEl) {
    this.daysEl.updateAttr(days, hasZero);
  } else {
    hours = Math.min(totalHours, this.hrsEl.max); // Limit hours to this.hrsEl.max
  }
  this.hrsEl?.updateAttr(hours, hasZero);
  getterGet(_timer_minutes_el, this)?.updateAttr(minutes, hasZero);
  getterGet(_timer_seconds_el, this)?.updateAttr(seconds, hasZero);
};
timer_play_fn = function(){
  if (getterGet(_timer_playing,this)) return;
  //console.log('play')
  getterAdd(_timer_frame, this, setInterval(getterRunFn(_timer_loop, this, timer_loop_fn).bind(this), 1e3), true);
  getterRunFn(_timer_loop, this, timer_loop_fn).call(this); // Run first when load site
  getterAdd(_timer_playing, this, true, true);
};
timer_pause_fn = function(){
  if (!getterGet(_timer_playing, this)) return;
  //console.log('pause')
  //this.timerInterval && clearInterval(this.timerInterval);
  clearInterval(getterGet(_timer_frame, this));
  getterAdd(_timer_playing, this, false, true);
};
timer_destroy_fn = function(){
  this.classList.remove(countdown.classes.enabled);
  getterRunFn(_timer_pause, this, timer_pause_fn).call(this);
};

var _numlist = new WeakMap();
class CountdownTimeItem extends HTMLElement {
  static observedAttributes = ["numbers"];
  #hasZero = true;
  constructor() {
    super();
  }
  get #max() {
    return this.max || 99;
  }
  get #padded() {
    return this.padded ??= this.isDay ? 3 : this.isHour ? 5 : 2;
  }
  updateAttr(newValue, hasZero) {
    if (this.getAttribute('numbers') == newValue ) return;
    this.#hasZero = hasZero;
    this.setAttribute('numbers', newValue);
  }
  async attributeChangedCallback(name, oldValue, newValue) {
     //console.log('1', oldValue, newValue)
    if (oldValue === newValue) return;

    let num = String(Math.min(this.#max, newValue)),
    numPad = num.padStart(this.#padded, "0");
    if (this.max && (this.isDay || this.isHour)) this.setAttribute('show-el', num.length);
    [...numPad].forEach((num, index) => {
      this.firstElementChild.children[index].setAttribute("num", num);
      //this.children[index].textContent = num;
    });
    // Update Unit
    if (this.childElementCount > 1 && this.lastElementChild.shadowRoot) {
      this.lastElementChild.setAttribute("numbers", numPad);
    }
    // End Update Unit
    //console.log(this.#hasZero, !this.#hasZero)
    if (!this.#hasZero) this.firstElementChild.children[this.isDay ? 1 : this.isHour ? 3 : 0].style.display = (numPad < 10 ) ? 'none' : 'inline-block';
  }
};
class CountdownTimerNumber extends HTMLElement {
  static observedAttributes = ["num"];
  constructor() {
    super();
    let tmp = '', i, limit = parseInt(this.getAttribute('limit')) || 10;
    for (i = 1; i < limit; i++) { tmp += `<span part="num" style="opacity: 0">${i}</span>`; }
    this.attachShadow({ mode: "open" }).appendChild(document.createRange().createContextualFragment(`<span part="numlist"><span part="num">0</span>${tmp}</span>`));
    tmp = ''; // remove cache

    getterAdd(_numlist, this, this.shadowRoot.firstElementChild);
  }
  async attributeChangedCallback(name, oldValue, newValue) {
    //console.log(oldValue, newValue, this)
    if (oldValue == null || oldValue === newValue) return;
    animate(getterGet(_numlist, this).children[parseInt(oldValue)], { opacity: [1, 0], transform: ["translateY(0) scale(1)", "translateY(-100%) scale(.3)"] }, { duration: this.hasAttribute('eff') ? 0.3 : 0, ease: [0.25, 0.1, 0.25, 1.0] }); // .34,.78,.45,.98
    animate(getterGet(_numlist, this).children[parseInt(newValue)], { opacity: [0, 1], transform: ["translateY(100%) scale(.5)", "translateY(0) scale(1)"] }, { duration: this.hasAttribute('eff') ? 0.3 : 0, ease: [0.25, 0.1, 0.25, 1.0] }); // .34,.78,.45,.98
  }
};
// plural singular
class CountdownTimerText extends HTMLElement {
  static observedAttributes = ["numbers"];
  constructor() {
    super();
    if (!this.hasAttribute('singular')) return;
    this.attachShadow({ mode: "open" });
    let i = 0;
    let textHtml = "";
    for (; i < 2; i++) {
      textHtml += `<span part="unit" style="grid-area: 1 / -1; will-change: opacity; opacity: ${ i ? 0 : 1 };">${ i ? this.getAttribute('singular') : this.textContent }</span>`;
    }
    this.shadowRoot.appendChild(document.createRange().createContextualFragment(textHtml));
  }
  async attributeChangedCallback(name, oldValue, newValue) {
    // if (oldValue === null || oldValue === newValue) {
    //   return;
    // }
    if (oldValue === newValue) return;
    this.shadowRoot.children[0].style.opacity = (newValue > 1) ? 1 : 0;
    this.shadowRoot.children[1].style.opacity = (newValue < 2) ? 1 : 0;
  }
};

customElements.define('hdt-countdown-text', CountdownTimerText);
customElements.define('hdt-countdown-number', CountdownTimerNumber);
customElements.define('hdt-countdown-item', CountdownTimeItem);
customElements.define('hdt-countdown', CountdownTimer);


/**
* 6. Multimedia player
* -----------------------------------------------------------------------------
* https://developers.google.com/youtube/iframe_api_reference#Events
* https://developer.vimeo.com/player/sdk/reference
* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
* https://shopify.dev/docs/storefronts/themes/product-merchandising/media/support-media#support-ar-functionality
* https://github.com/archetype-themes/reference-theme/blob/main/assets/base-media.js#L62
*/
class MediaManager extends HTMLElement {
  #controller;
  constructor() {
    super();
    this.isPlayingState = false;
    this.type = this.getAttribute('type');
  }

  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this.media = $4('video, iframe', this);
    if (this.type === "html5") {
      this.dispatchEvent(new CustomEvent('media:ready'));
      if (this.hasAttribute('duration')) this.media.addEventListener("loadedmetadata", () => this.#duration = this.media.duration);
      this.media.addEventListener("play", () => this.#setPlaying(true), { signal });
      this.media.addEventListener("pause", () => this.#setPlaying(false), { signal });
      this.media.addEventListener("ended", () => this.#setPlaying(false), { signal });
    } else if (this.type === "youtube" ) {
      this.media.addEventListener("load", () => this.media.contentWindow.postMessage(JSON.stringify({ event: "listening", id: this.dataset.id }), "*"), { once: true, signal });
    }

    //document.addEventListener(ThemeEvents.mediaStartedPlaying, this.pause.bind(this), { signal });
    document.addEventListener(dialogClose, this.pause.bind(this), { signal });

    if (!this.hasAttribute('media-group')) return;
    document.addEventListener('shopify_xr_launch', this.pause.bind(this), { signal });
    this.addEventListener('media:hidden', this.pause.bind(this), { signal });
    if (this.hasAttribute('autoplay')) this.addEventListener('media:visible', this.play.bind(this), { signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  #setPlaying(state) {
    this.isPlayingState = state;
    if (state) {
      this.setAttribute("playing", "");
      if (this.hasAttribute('media-group')) this.dispatchEvent(new MediaStartedPlayingEvent(this));
      //if (this.hasAttribute('media-group') && !this.closest('hdt-slider-media')?.isActive) this.dispatchEvent(new MediaStartedPlayingEvent(this));
    } else {
      this.removeAttribute("playing");
    }
  }

  #postMessage(msg) {
    this.media?.contentWindow?.postMessage(msg, "*");
  }

  onMessage(data) {
    const { event } = data;
    if (this.type === "youtube") {
      //console.log('Youtube message event: ', event, data)
      //if ( data.id != this.dataset.id) return; // pick only messages for this instance
      if (event === "initialDelivery") {
        if (this.hasAttribute('duration')) this.#duration = data.info.duration;
        this.dispatchEvent(new CustomEvent('media:ready'));
      } else if (event === "infoDelivery" && data.info && "playerState" in data.info) {
        //console.log('duration: ', data.info, data.info.duration)
        switch (data.info.playerState) {
          case 1:
            this.#setPlaying(true); break;   // PLAYING
          case 2:
          case 0:
            this.#setPlaying(false); break;// PAUSED or ENDED
        }
      }
    } else {
      //if ( data.player_id != this.dataset.id) return; // pick only messages for this instance
      //console.log('Vimeo message event: ', event, data)
      switch (event) {
        case "ready":
          ["play", "pause", "ended"].forEach(value => {
            this.media.contentWindow.postMessage({ method: "addEventListener", value }, "*");
          });
          this.dispatchEvent(new CustomEvent('media:ready'));
          //console.log('Vimeo ready');
          if (this.hasAttribute('duration')) this.#postMessage({ method: "getDuration" });
          break;
        case "play":
          this.#setPlaying(true); break;
        case "pause":
        case "ended":
          this.#setPlaying(false); break;
        default:
          // if (data.method === 'play' && !this.hasAttribute('playing')) {
          //   this.#setPlaying(true);
          // } else
          if (data.method === 'getDuration' && typeof data.value === 'number') {
            this.#duration = data.value;
          }
      }
    }
  }

  #stringJson(func) {
    return JSON.stringify({ event: "command", func, args: [] });
  }

  async play() {
    if (this.isPlayingState) return false;
    if (this.type === "html5") {
      this.media.play();
    } else if (this.type === "vimeo") {
      this.#postMessage({ method: "play" });
    } else if (this.type === "youtube") {
      this.#postMessage(this.#stringJson("playVideo"));
    }
    return new Promise((resolve) => {
      let count = 0;
      const checkPlay = () => {
          count++;
          //console.log('checkPlay '+ this.type + ': ', this.hasAttribute('playing'))
          if (this.hasAttribute('playing')) {
            this.#setPlaying(true);
            resolve(true);
          } else if (count > 15) { // 1.5s
            this.#setPlaying(false);
            resolve(false);
          } else {
            setTimeout(checkPlay, 100);
          }
      };
      checkPlay();
    });
  }

  pause() {
    if (!this.isPlayingState) return
    if (this.type === "html5") {
      this.media.pause();
    } else if (this.type === "vimeo") {
      this.#postMessage({ method: "pause" });
    } else if (this.type === "youtube") {
      this.#postMessage(this.#stringJson("pauseVideo"));
    }
    this.#setPlaying(false);
  }

  isPlaying() {
    //if (this.type === "html5") return !(this.media.paused || this.media.ended);
    return this.isPlayingState;
  }

  /**
   * @param {number} second
   */
  set #duration(second) {
    this.style.setProperty('--hdt-media-duration', `${second * 1000}ms`);
  }
}
window.addEventListener("message", (evt) => {
  //console.log(evt)
  if (evt.data && (evt.origin.includes('www.youtube') || evt.origin.includes('vimeo.com')) ) {
    let data;
    try { data = typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data; } catch { return; }
    $4(`hdt-video[data-id="${data.player_id || data.id}"]`)?.onMessage(data);
  }
});

// Video, YouTube, Vimeo
var _size_bg_video = new WeakSet(), size_bg_video_fn,
_setup_play_btn = new WeakSet(), setup_play_btn_fn;
class VideoPlayer extends MediaManager {
  #controller;
  constructor() {
    super();
    getterAdd(_size_bg_video, this);
    getterAdd(_setup_play_btn, this);
  }
  async connectedCallback () {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    const tmp = $4("template:not([is-video])", this);
    tmp?.replaceWith(tmp.content.firstElementChild.cloneNode(true));
    if (this.hasAttribute('background')) {
      getterRunFn(_size_bg_video, this, size_bg_video_fn).call(this);
      // Listen to resize to keep a background-size:cover-like layout
      window.addEventListener('resize', debounce(getterRunFn(_size_bg_video, this, size_bg_video_fn).bind(this), 300), { signal });
    }
    if (this.type === 'html5') inView(this, () => this.media?.setAttribute("preload", "metadata"), { margin: "666px" });
    if (this.hasAttribute('autoplay')) {
      if (this.hasAttribute('media-group')) {
        this.#autoPlay(true);
      } else {
        this.addEventListener("media:ready", () => this.#autoPlay(), { once: true, signal });
      }
    }
    super.connectedCallback();
  };
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller.abort();
  }
  // #waitForIframeLoad(iframe, signal) {
  //   return new Promise((resolve) => {
  //     if (iframe.contentWindow && iframe.contentDocument?.readyState === "complete") {
  //       resolve();
  //     } else {
  //       iframe.addEventListener("load", () => resolve(), { once: true, signal });
  //     }
  //   });
  // }
  #autoPlay(group = false) {
    if (group) {
      this.slider.addEventListener('reInit', ()=> {
        if (this.slider.isActive) {
          if (this.slider.apiS.selectedScrollSnap() === 0 && this.closest('.hdt-product__media-item').classList.contains('is-selected')) {
            this.playHandle();
          }
        } else {
          inView(this, () => {
              this.playHandle();
              return () => this.pause();
            },
            { margin: "15px 0px" }
          )
        }
      }, { once: false});
    } else {
      if (this.hasAttribute('is--lazy')) {
        this.media.addEventListener('lazy:loaded', this.#playHandle2);
      } else {
        this.#playHandle2();
      }
    }
  }
  async playHandle() {
    this.play().then((canPlay) => {
      if (!canPlay) {
        // console.log('Autoplay blocked: ', this.type, canPlay);
        if (this.hasAttribute("show-controls") && !this.hasAttribute("has-controls")) getterRunFn(_setup_play_btn, this, setup_play_btn_fn).call(this);
      } else {
        // console.log('Autoplay allowed: ', this.type, canPlay);
      }
    }).catch(() => {
      // console.log('Autoplay blocked catch: ', this.type);
      // throw new Error("Autoplay blocked: " + this.type);
    });
  }
  get slider () {
    return this._slider ??= this.closest('hdt-slider-media');
  }
  #playHandle2 = () => {
    if (this.hasAttribute('notInView')) {
      this.playHandle();
    } else {
      inView(this, () => {
        this.playHandle();
        return () => {
          this.pause();
        }
      },{ margin: '888px' })
    }
  }
};
size_bg_video_fn = function(){
  var iframeW  ,
  iframeH      ,
  marginLeft   ,
  marginTop    ,
  containerW   = this.clientWidth,
  containerH   = this.clientHeight;

  containerW / containerH < 16 / 9 ?
  (
     iframeW = containerH * (16 / 9),
     iframeH = containerH,
     marginLeft = -Math.round((iframeW - containerW) / 2),
     marginTop = -Math.round((iframeH - containerH) / 2)
  ) : (
     iframeH = (iframeW = containerW) * (9 / 16),
     marginTop = -Math.round((iframeH - containerH) / 2),
     marginLeft = -Math.round((iframeW - containerW) / 2)
  );
  $4("iframe", this).style.cssText = `max-width: 1000%; margin-left: ${marginLeft}px; margin-top: ${marginTop}px; width: ${iframeW}px; height: ${iframeH}px;`;
};
setup_play_btn_fn = function(){
  if (this.shadowRoot) return;
  const videoOrIframe = $4('video, iframe', this);
  this.attachShadow({ mode: "open" }).appendChild($id4("video-play-df").content.cloneNode(true));
  const btnPlay  = this.shadowRoot.lastElementChild,
        playText = btnPlay.getAttribute('aria-label'),
        des      = $4('video', this)?.getAttribute('aria-label') || videoOrIframe.title || videoOrIframe.dataset.title || '';
  btnPlay.setAttribute('aria-label', playText.replace('[description]', des));
  if (!this.hasAttribute("show-controls")) this.removeAttribute('ready');

  //console.log('1', this, this.closest('[data-wrapp-video]'))
  const elClick = this.hasAttribute('sp-toogle-play') ? btnPlay : this.closest('[data-wrapp-video]');
  elClick?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.hasAttribute('playing')) {
      this.pause();
      btnPlay.setAttribute('aria-label', playText.replace('[description]', des));
    } else {
      this.play();
      btnPlay.setAttribute('aria-label', btnPlay.dataset.pause.replace('[description]', des));
    }
    this.setAttribute('ready', '');
  }, { once: !this.hasAttribute('sp-toogle-play'), signal: this.abortController.signal });
};
class ModelPlayer extends MediaManager {
  #controller;
  connectedCallback() {
    this.#controller = new AbortController();
    Shopify.loadFeatures([
      {
        name: 'shopify-xr',
        version: '1.0',
        onLoad: this.#setupShopifyXr.bind(this)
      },
      {
        name: 'model-viewer-ui',
        version: '1.0',
        onLoad: this.#setupModelViewerUI.bind(this),
      },
    ]);
    super.connectedCallback();
  }

  async play() {
    this.modelViewerUI?.play();
  }

  pause() {
    this.modelViewerUI?.pause();
  }
  #setupShopifyXr() {
    if (!window.ShopifyXR) return document.addEventListener('shopify_xr_initialized', this.#setupShopifyXr.bind(this), { once: true, signal: this.#controller.signal });
    const modelJson = $id4('ModelJson-' + this.getAttribute('section-id'));
    window.ShopifyXR.addModels(JSON.parse(modelJson.textContent));
    window.ShopifyXR.setupXRElements();
  }

  /**
   * @param {Error[]} errors
   */
  async #setupModelViewerUI(errors) {
    if (errors) return;

    if (!Shopify.ModelViewerUI) {
      await this.#waitForModelViewerUI();
    }

    if (!Shopify.ModelViewerUI) return;

    const model = $4("model-viewer", this);
    if (!model) return;

    const { signal } = this.#controller;

    this.modelViewerUI = new Shopify.ModelViewerUI(model, { focusOnPlay: false });
    if (!this.modelViewerUI) return;
    $4('.shopify-model-viewer-ui__button', this)?.setAttribute('inert', '');
    // Events: shopify_model_viewer_ui_toggle_play, shopify_model_viewer_ui_toggle_pause
    model.addEventListener("shopify_model_viewer_ui_toggle_play", () => this.setAttribute('playing', ''), { signal });
    model.addEventListener("shopify_model_viewer_ui_toggle_pause", () => this.removeAttribute('playing'), { signal });
    // return;
    // this.play();

    // // Track pointer events to detect taps
    // let pointerStartX = 0;
    // let pointerStartY = 0;

    // model.addEventListener('pointerdown',(/** @type {PointerEvent} */ event) => {
    //   pointerStartX = event.clientX;
    //   pointerStartY = event.clientY;
    // }, { signal });

    // model.addEventListener('click', (/** @type {PointerEvent} */ event) => {
    //   const distanceX = Math.abs(event.clientX - pointerStartX);
    //   const distanceY = Math.abs(event.clientY - pointerStartY);
    //   const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    //   // Try to ensure that this is a tap, not a drag.
    //   if (totalDistance < 10) {
    //     // When the model is paused, it has its own button overlay for playing the model again.
    //     // If we're receiving a click event, it means the model is playing, all we can do is pause it.
    //     this.pause();
    //   }
    // },{ signal });
  }

  /**
   * Waits for Shopify.ModelViewerUI to be defined.
   * This seems to be necessary for Safari since Shopify.ModelViewerUI is always undefined on the first try.
   * @returns {Promise<void>}
   */
  async #waitForModelViewerUI() {
    const maxAttempts = 10;
    const interval = 50;

    for (let i = 0; i < maxAttempts; i++) {
      if (Shopify.ModelViewerUI) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
  // async createPlayer() {
  //   window.Shopify.loadFeatures([
  //     {
  //       name: 'shopify-xr',
  //       version: '1.0',
  //       onLoad: this.setupShopifyXr.bind(this)
  //     },
  //     {
  //       name: 'model-viewer-ui',
  //       version: '1.0',
  //       onLoad: this.setupModelViewerUi.bind(this)
  //     }
  //   ]);
  // }
  // setupShopifyXr() {
  //   if (!window.ShopifyXR) return document.addEventListener('shopify_xr_initialized', this.setupShopifyXr.bind(this), { once: true, signal: this.abortController.signal });
  //   const modelJson = $id4('ModelJson-' + this.getAttribute('section-id'));
  //   window.ShopifyXR.addModels(JSON.parse(modelJson.textContent));
  //   window.ShopifyXR.setupXRElements();
  //   //this.closest('hdt-slider-media')?.reInit()
  // }
  // setupModelViewerUi() {
  //   this.setAttribute('ready', '');
  //   const model = $4("model-viewer", this);
  //   // config: {
  //   //   controls: ["zoom-in", "zoom-out", "fullscreen"],
  //   //   iconUrl: "https://cdn.shopify.com/shopifycloud/model-viewer-ui/".concat("assets/v1.0/sprites.svg"),
  //   //   focusOnPlay: !0
  //   // }
  //   // Events: shopify_model_viewer_ui_toggle_play, shopify_model_viewer_ui_toggle_pause
  //   model.addEventListener("shopify_model_viewer_ui_toggle_play", () => this.setAttribute('playing', ''), { signal: this.abortController.signal });
  //   model.addEventListener("shopify_model_viewer_ui_toggle_pause", () => this.removeAttribute('playing'), { signal: this.abortController.signal });

  //   getterAdd(_media_player, this, new Shopify.ModelViewerUI(model, { focusOnPlay: false }));
  //   this.setAttribute('can-player', '');

  //   // https://shopify.dev/docs/storefronts/themes/product-merchandising/media/support-media#launch-the-display
  //   //document.addEventListener('shopify_xr_launch', ()=> {});

  //   // document.addEventListener('shopify_xr_launch', (event) => {
  //   //   if (this.playing) getterGet(_media_player, this).pause();
  //   // }, { signal: this.abortController.signal });
  // }

};
class BtnVideo extends HTMLElement {
  constructor() {
    super();
    const hdtVideo = this.closest('hdt-video');
    if (!hdtVideo) return;
    const btnPlay   = this.firstElementChild,
          des       = $4('video', hdtVideo)?.getAttribute('aria-label') || $4('iframe, video', hdtVideo).title || '',
          playText  = btnPlay.getAttribute('aria-label').replace('[description]', des),
          pauseText = btnPlay.dataset.pause.replace('[description]', des);

    btnPlay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (hdtVideo.hasAttribute('playing')) {
        hdtVideo.pause();
        btnPlay.setAttribute('aria-label', playText);
      } else {
        hdtVideo.play();
        btnPlay.setAttribute('aria-label', pauseText);
      }
      hdtVideo.setAttribute('ready', '');
    });
  }
}

class videoHover extends VideoPlayer {
  async connectedCallback(){
    let hasVideo = false;
    hover(this, () => {
      if (hasVideo) {
        this.play()
      } else {
        const tmp = $4("template[is-video]", this);
        tmp?.replaceWith(tmp.content.firstElementChild.cloneNode(true));
        super.connectedCallback();
        this.play();
        frame.render(()=> this.play());
        hasVideo = true;
      }
      return () => this.pause()
    })
  }
}

customElements.define('hdt-video', VideoPlayer);
customElements.define('hdt-model', ModelPlayer);
customElements.define('hdt-btn-video', BtnVideo);
customElements.define('hdt-video-hover', videoHover);

// https://tympanus.net/codrops/2016/11/23/tilt-hover-effects/
// https://examples.motion.dev/js/tilt-card
class tiltCard extends HTMLElement {
  #maxTilt;
  #tilt = {
    z: 0,
    rotateX: 0,
    rotateY: 0,
  };
  #controller;
  constructor() {
    super();
    this.#maxTilt = Number(this.getAttribute('max-tilt')) || 15;
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this.addEventListener("pointerenter", this.updateTilt.bind(this), { signal })
    this.addEventListener("pointermove", this.updateTilt.bind(this), { signal })
    this.addEventListener("pointerleave", () => {
        this.#tilt.z = 0
        this.#tilt.rotateX = 0
        this.#tilt.rotateY = 0
        frame.postRender(this.animateToTilt.bind(this))
    }, { signal })
  }
  disconnectedCallback(){
    this.#controller.abort();
  }
  calculateTilt(event) {
    const rect = this.getBoundingClientRect()
    this.#tilt.z = -10
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert coordinates to percentages
    const xPercent = x / rect.width
    const yPercent = y / rect.height

    this.#tilt.rotateX = this.#maxTilt * (0.5 - yPercent)
    this.#tilt.rotateY = this.#maxTilt * (xPercent - 0.5)
  }
  animateToTilt() {
    const {rotateX, rotateY, z} = this.#tilt;
      animate(this, {
        transformPerspective: 500,
        rotateX,
        rotateY,
        z,
      })
  }
  updateTilt(e) {
    this.calculateTilt(e)
    frame.postRender(this.animateToTilt.bind(this))
  }
}
customElements.define('hdt-tilt-card', tiltCard);
class ScrollHint extends HTMLElement {
  #scroll;
  #resize;
  #_axis;
  #_hover;
  connectedCallback() {
    this.#scroll = scroll(
      //(progress) => frame.render(this.#update.bind(this, progress)),
      () => frame.render(this.#update),
      { container: this, axis: this.#axis }
    );
    //this.#resize = resize(this, () => frame.render(this.#update.bind(this, NaN)));
    this.#resize = resize(this, () => frame.render(this.#update));
    if (this.hasAttribute('hover')) this.#hover();
  }

  disconnectedCallback() {
    this.#scroll();
    this.#resize();
    if (this.#_hover) this.#_hover();
  }
  get #axis() {
    return this.#_axis ??= this.getAttribute('axis') || 'y';
  }

  #update = () => {
    //console.log(progress)
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = this,
    //const scrollDirection = scrollWidth > clientWidth ? 'horizontal' : 'vertical';
    progress = this.#axis === 'y' ? scrollTop / (scrollHeight - clientHeight) : scrollLeft / (scrollWidth - clientWidth);
    this.style.maskImage = Number.isNaN(progress) ? '' : `linear-gradient(to ${this.#axis === 'y' ? 'bottom' : 'right'}, transparent ${progress > 0 ? 1 : 0}%, black ${progress < 0.1 ? progress * 100 : 10}%, black ${progress > 0.9 ? progress * 100 : 90}%, transparent 100%)`;
  };

  #hover = () => {
    this.#_hover = hover(this, () => {
      this.scrollTo(this.#scrollTo(isRTL ? -this.scrollWidth : this.scrollWidth));
      return () => {
        this.scrollTo(this.#scrollTo());
      }
    })
  }
  #scrollTo(left = 0) {
    return {
      left,
      behavior: matchMediaQuery("motion") ? 'auto' : 'smooth'
    };
  }
}
customElements.define('hdt-scroll-hint', ScrollHint);


class inviewStagger extends HTMLElement {
  connectedCallback() {
    if (!matchMediaQuery("motion")) return;
    inView(this, () => {
      animate($$4('.hdt-theme-block, .hdt-caption, .hdt-subheading, .hdt-heading, .hdt-description, .hdt-btn', this), {
        y: [20, 0],
        opacity: [0, 1]
      }, {
        duration: 0.6,
        delay: stagger(0.15, { startDelay: 0.2 }),
        //ease: [0, 0, .3, 1]
      }).then(() => {
        this.setAttribute('staggered', '');
      });
    }, {
      margin: "0px 0px -50px 0px"
    })
  }
}
customElements.define('hdt-inview-stagger', inviewStagger);

/**
* 7. Gallery modal
* -----------------------------------------------------------------------------
*/
import { Lightbox, Zoom } from "@theme/zoom-psw";
const svgPath = `<svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.8" fill="none" stroke-linecap="round" stroke-linejoin="round" class="pswp__icn"`;
var _img_lightbox = new WeakSet(), img_lightbox_fn,
_img_lightbox_list = new WeakMap();
class ImageLightbox extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_img_lightbox, this);
  }
  connectedCallback() {
    this.#controller = new AbortController();
    if (!this.dataset.objImg) return;
    getterRunFn(_img_lightbox, this, img_lightbox_fn).call(this);
    this.addEventListener("click", () => this.lightBox?.loadAndOpen(this.dataset.index || 0), { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get lightBox() {
    return getterGet(_img_lightbox_list, this);
  }
  // get objImg() {
  //   return this.getAttribute('obj-img');
  // }
};
img_lightbox_fn = function(){
  let dataSource = null,
   secondaryZoomLevel = parseInt(this.getAttribute("max-zoom")) || 2;
   const {close, zoom, prev, next, errorMsg} = themeHDN.strings.pswp,
    _objImg = JSON.parse(this.dataset.objImg);
    _objImg.srcset = renderSrcset(_objImg.src, JSON.parse(this.dataset.widths || `[246, 493, 600, 713, 823, 990, 1100, 1206, 1346, 1426, 1646, 1946, 2200, 2500, 3000, 3500, 4000, ${_objImg.width}]`));
     dataSource = [_objImg];
  const options = {
    showHideAnimationType: 'fade', // 'zoom', 'fade', 'none
    pswpModule: () => import("@theme/psw"),
    dataSource,
    bgOpacity: 1,
    secondaryZoomLevel,
    maxZoomLevel: ++secondaryZoomLevel,
    closeTitle: close,
    zoomTitle: zoom,
    arrowPrevTitle: prev,
    arrowNextTitle: next,
    errorMsg: errorMsg,
    // UX - https://photoswipe.com/styling/
    closeSVG: `${svgPath} width="28" height="28"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    zoomSVG: `${svgPath} width="22" height="22"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line id="pswp__icn-plus" x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
  };
  getterAdd(_img_lightbox_list, this, new Lightbox(options));
  this.lightBox.init();
  // Clear memory
  dataSource = null;
};

var _lightbox_psw_init = new WeakMap(),
_ui_register = new WeakSet(), ui_register_fn;
class GalleryModal extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_ui_register, this);
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.updateImageClick(true);
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  updateImageClick(firstTime = false) {
    if (this.images.length == 0 || this.hasAttribute('set-disabled') ) return;
    if (!firstTime) {
      getterDelete(_lightbox_psw_init, this);
      this.#controller.abort();
      this.#controller = new AbortController();
    }
    this.images.forEach( (image, index) => image.addEventListener('click', (e) => {
      if (this.imageZoom == 'zoom' && matchMediaQuery("hover")) return;
      e.preventDefault();
      this.openLightBox(index)
    }, { signal: this.#controller.signal }
    ));
  }
  get slider() {
    return $4('hdt-slider', this);
  }
  get images() {
    return $$4( this.getAttribute("selector") || "img", this)
  }
  get lightBox() {
    if (getterGet(_lightbox_psw_init, this)) return getterGet(_lightbox_psw_init, this);
    const {close, zoom, prev, next, errorMsg} = themeHDN.strings.pswp;

    let secondaryZoomLevel = parseInt(this.getAttribute("max-zoom")) || 2,
    dataSource = this.images.map((image) => {
      const {src, currentSrc, alt} = image;
      const srcset = renderSrcset(src, JSON.parse(image.dataset.widths || `[140, 246, 493, 600, 713, 823, 990, 1100, 1206, 1346, 1426, 1646, 1946, 2200, 2500, 3000, 3500, 4000, ${image.getAttribute("width")}]`));
      return {
        thumbnailElement: image,
        src,
        srcset,
        msrc: currentSrc || src,
        width: parseInt(image.getAttribute("width")),
        height: parseInt(image.getAttribute("height")),
        alt,
        thumbCropped: true
      };
    });
    getterAdd(_lightbox_psw_init, this, new Lightbox({
      pswpModule: () => import("@theme/psw"),
     // showHideAnimationType: 'zoom', // 'zoom', 'fade', 'none
      dataSource,
      bgOpacity: 1,
      secondaryZoomLevel,
      maxZoomLevel: ++secondaryZoomLevel,
      closeTitle: close,
      zoomTitle: zoom,
      arrowPrevTitle: prev,
      arrowNextTitle: next,
      errorMsg: errorMsg,
      // UX - https://photoswipe.com/styling/
      arrowPrevSVG: `${svgPath} width="24" height="24"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
      arrowNextSVG: `${svgPath} width="24" height="24"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
      closeSVG: `${svgPath} width="28" height="28"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
      zoomSVG: `${svgPath} width="22" height="22"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line id="pswp__icn-plus" x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
    }));
    getterGet(_lightbox_psw_init, this).addFilter('thumbEl', (thumbEl, data) => thumbEl || data.thumbnailElement);
    getterGet(_lightbox_psw_init, this).on('uiRegister', getterRunFn(_ui_register, this, ui_register_fn).bind(this));
    getterGet(_lightbox_psw_init, this).on('openingAnimationEnd', ()=> getterGet(_lightbox_psw_init, this).pswp.template.classList.add('hdt-psw-animate'));
    getterGet(_lightbox_psw_init, this).on('closingAnimationStart', ()=> getterGet(_lightbox_psw_init, this).pswp.template.classList.remove('hdt-psw-animate'));
    getterGet(_lightbox_psw_init, this).init();
    // Clear memory
    dataSource = null;
    return getterGet(_lightbox_psw_init, this);
  }
  openLightBox(index = 0) {
    this.lightBox.loadAndOpen(index);
  }
};
ui_register_fn = function(){
  if (getterGet(_lightbox_psw_init, this).pswp.options.dataSource.length < 2 || !this.hasAttribute('show-thumb')) return;

  getterGet(_lightbox_psw_init, this).pswp.ui.registerElement({
    name: 'thumbnails',
    className: 'pswp__thumbnails',
    appendTo: 'root',
    //tagName: 'hdt-slider',
    onInit: (el, pswp) => {
      let prevIndex = -1,
      stringHTMl = '',
      i,
      l = pswp.getNumItems();

      for (i = 0; i < l; i++) {
        const { src, srcset, alt } = pswp.options.dataSource[i];
        stringHTMl += `<div class="hdt-slider__slide" reveal><div class="pswp__thumbnail" data-index="${i}"><img src="${src}" srcset="${srcset}" alt="${alt}" loading="lazy" sizes="70px"></div></div>`;
      }
      el.insertAdjacentHTML(
        'beforeend',
        `<hdt-slider-reveal class="hdt-slider" config='{"dragFree": true,"slidesToScroll": 1,"ntCenter": true}'><div class='hdt-slider__viewport'><div class='hdt-slider__container'>${stringHTMl}</div></div></hdt-slider-reveal>`,
      );
      stringHTMl = ''; //reset cache
      pswp.thumbs = $$4('.pswp__thumbnail', el);
      const mediaSelector = '.hdt-product__media-item[data-media-type="image"]:not([hidden])';

      pswp.on('change', () => {
        const {currIndex} = pswp;
        if (prevIndex >= 0) {
          pswp.thumbs[prevIndex].classList.remove('pswp__thumbnail--active');
        }
        pswp.thumbs[currIndex].classList.add('pswp__thumbnail--active');
        prevIndex = currIndex;
        const target = $$4(mediaSelector, this)[pswp.currIndex];
        if (target) this?.slider?.goToTarget(target, true)
      });
      pswp.on('openingAnimationEnd', () => {
        $4('.hdt-slider', el)?.reveal();
      });
      pswp.on('close', () => {
        const target = $$4(mediaSelector, this)[pswp.currIndex];
        if (target) this?.slider?.goToTarget(target, true)
      });
    },
   // when user clicks or taps on element
    onClick: function (e, el, pswp) {
      const {index} = e.target.dataset;
      if (index) pswp.goTo(parseInt(index));
    }
  });
}

customElements.define('hdt-img-psw', ImageLightbox); // wrapp-open-pswp-btn
customElements.define('hdt-gallery-modal', GalleryModal);

/**
* 8. Product media
* -----------------------------------------------------------------------------
*/
class XProgress extends HTMLElement {
  #color;
  static get observedAttributes() {
    return ['value'];
    //return ['value', 'max', 'min', 'colors', 'gradient'];
  }
  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.hasAttribute('max')) this.max = 100;
    if (!this.hasAttribute('min')) this.min = 0;
    if (!this.hasAttribute('value')) this.value = 0;
    //if (!this.hasAttribute('gradient')) this.gradient = false;
    if (this.colors.length > 0) {
      this.#color = motionValue(this.colors[0].color);
      styleEffect(this, { "--progress-bar": this.#color });
    }
    if (this.hasAttribute("reveal-in-view")) {
      inView(this, ()=> this.#update(), { margin: "-10px 0px" });
    } else if (!this.hasAttribute("disable-intial")) {
      this.#update();
    }
  }

  async attributeChangedCallback(_, oldValue, newValue) {
    if (oldValue != null) this.#update(oldValue, newValue);
  }

  get value() { return Number(this.getAttribute('value')) || 0; }
  set value(val) { this.setAttribute('value', val); }

  get min() { return Number(this.getAttribute('min')) || 0; }
  set min(val) { this.setAttribute('min', val); }

  get max() { return Number(this.getAttribute('max')) || 100; }
  // set max(val) { this.setAttribute('max', val); }

  get colors() {
    try {
      return JSON.parse(this.getAttribute('colors')) || [];
    } catch {
      return [];
    }
  }
  // set colors(val) { this.setAttribute('colors', JSON.stringify(val)); }

  get gradient() {
    return this.getAttribute('gradient') === 'true';
  }
  // set gradient(val) {
  //   this.setAttribute('gradient', val ? 'true' : 'false');
  // }

  /** hex → rgb */
  #hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const num = parseInt(hex, 16);
    return [num >> 16 & 255, num >> 8 & 255, num & 255];
  }

  #interpolateHex(hex1, hex2, t) {
    const c1 = this.#hexToRgb(hex1);
    const c2 = this.#hexToRgb(hex2);
    const [r, g, b] = [
      Math.round(c1[0] + (c2[0] - c1[0]) * t),
      Math.round(c1[1] + (c2[1] - c1[1]) * t),
      Math.round(c1[2] + (c2[2] - c1[2]) * t)
    ];
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  #rate(value = this.value) {
    return Math.min(
      100,
      Math.max(0, ((value - this.min) / (this.max - this.min)) * 100)
    );
  }

  #update(oldValue = 0, newValue = this.value) {
    const percent = this.#rate();
    // this.#percent.set(percent/100); // Convert to 0-1 range
    const animation = animate(
      this,
      { "--percent-val": [this.#rate(oldValue)+'%', this.#rate(newValue)+'%'] },
      { duration: 0.6, ease: "easeOut" }
      // { type: "spring", visualDuration: 0.5, bounce: 0.25, onUpdate: latest => {
      //   console.log(latest)
      //   this.#updateColor(parseFloat(latest));
      // }}
      //{ type: "spring", visualDuration: 0.5, bounce: 0.25 }
    );
    if (oldValue === newValue && newValue && this.hasAttribute("disable-intial")) animation.complete();

    this.#updateColor(percent);

    // ARIA
    this.setAttribute('aria-valuenow', this.value);
    this.setAttribute('aria-valuemin', this.min);
    this.setAttribute('aria-valuemax', this.max);
  }
  #updateColor(percent) {
    if (this.colors.length == 0) return;
    const stops = this.colors.sort((a, b) => a.threshold - b.threshold);
    let color = this.colors[0].color; // default color

    if (stops.length) {
      if (this.gradient) {
        let lower = stops[0], upper = stops[stops.length - 1];
        for (let i = 0; i < stops.length - 1; i++) {
          if (percent >= stops[i].threshold && percent <= stops[i + 1].threshold) {
            lower = stops[i];
            upper = stops[i + 1];
            break;
          }
        }
        const range = upper.threshold - lower.threshold || 1;
        const t = Math.min(1, Math.max(0, (percent - lower.threshold) / range));
        color = this.#interpolateHex(lower.color, upper.color, t);
      } else {
        // step mode
        for (let i = 0; i < stops.length; i++) {
          if (percent >= stops[i].threshold) {
            color = stops[i].color;
          }
        }
      }
    }
    this.#color.set(color);
  }
}

var _qty_forms = new WeakMap(),
_qty_labels = new WeakMap(),
_qty_inputs = new WeakMap(),
_update_quantity_rules = new WeakSet(),
_set_quantity_boundries = new WeakSet();
class QuantityWrapp extends HTMLElement {
  #controller;
  constructor() {
    super(...arguments);
    getterAdd(_qty_inputs, this, $4('input', this));
    getterAdd(_update_quantity_rules, this);
    getterAdd(_set_quantity_boundries, this);
  }
  get input() {
    return getterGet(_qty_inputs, this);
  }
  get quantityForm() {
    return $id4(`Quantity-Form-${this.getAttribute('section-id')}`);
  }
  get form() {
    return this._form = this._form || document.forms[this.input.getAttribute("form")];
  }
  get qty() {
    return this.input.value;
  }
  get cart() {
    return $4('[ref="hdt-cart"]');
  }
  set qty(value) {
   this.input.value = value,
   this.input.dispatchEvent(new Event("change"));
  }
  connectedCallback() {
    this.#controller = new AbortController();
    if (!this.input) return;
    const { signal } = this.#controller;
    if (this.hasAttribute('qty-in-cart') && this.input.hasAttribute('form')) {
      getterAdd(_qty_forms, this, document.forms[(this.input.getAttribute("form") || '')]);
      getterAdd(_qty_labels, this, $4(`label[for="${this.input.id}"]`));

      document.addEventListener(cartLive, (evt)=> {
        this.#cartUpdateQty(evt.detail.items);
      }, { signal });

      document.addEventListener(cartTab, (evt)=> {
        this.#cartUpdateQty(evt.detail.items);
      }, { signal });

      if (themeHDN.cartItems && getterGet(_qty_labels, this)) {
        this.#cartUpdateQty(themeHDN.cartItems);
      }
    }
    this.input.addEventListener('change', this.onInputChange.bind(this), { signal });
    $$4('button', this).forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this), { signal })
    );
    this.buttonMinus = $4("[name='minus']", this);
    this.buttonPlus = $4("[name='plus']", this);
    this.validateQtyRules();

    this.debouncedOnChange = debounce(() => {
      this.input.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { target: this.input } }));
    }, 300);
  }
  disconnectedCallback() {
    this.#controller.abort();
  }

  onInputChange(event) {
    this.validateQtyRules();
  }
  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    let value = this.input.value;
    if (previousValue !== value) {
      this.debouncedOnChange();
    }
  }
  validateQtyRules() {
    const value = parseInt(this.input.value),
    _max = this.input.max || 9999,
    max = parseInt(String(_max) != 'null' ? _max : 9999);
    this.input.value = Math.min(value, max);
    if (this.hasAttribute('form')) {
      getterGet(_qty_forms, this)?.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { target: this.input } }));
    }
    if (this.input.min) this.buttonMinus.classList.toggle('disabled', value <= parseInt(this.input.min));
    this.buttonPlus.classList.toggle('disabled', value >= parseInt(max));
  }
  #cartUpdateQty(items) {
    const rulesCart = $4('.hdt-quantity__rules-cart', getterGet(_qty_labels, this));
    if (!rulesCart) return;
    const itemCountForVariant = items.find((item) => item.id == this.dataset.variantId);
    rulesCart.hidden = !itemCountForVariant;
    if (itemCountForVariant) $4('.hdt-quantity-cart', getterGet(_qty_labels, this)).textContent = itemCountForVariant.quantity;
  }
};

var _on_recipient_form_changed = new WeakSet(), on_recipient_form_changed_fn,
_cart_error2 = new WeakSet(), _cart_error2_fn,
_displayErrorMessage = new WeakSet(), displayErrorMessage_fn,
_createErrorListItem = new WeakSet(), createErrorListItem_fn,
_clearErrorMessage = new WeakSet(), clearErrorMessage_fn;
// https://github.com/Shopify/dawn/blob/main/assets/recipient-form.js
class RecipientForm extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_on_recipient_form_changed, this);
    getterAdd(_cart_error2, this);
    getterAdd(_displayErrorMessage, this);
    getterAdd(_createErrorListItem, this);
    getterAdd(_clearErrorMessage, this);
    this.recipientFieldsLiveRegion = $4(`#Recipient-fields-live-region-${this.blockId}`, this);
    this.checkboxInput = $4(`#Recipient-checkbox-${this.blockId}`, this);
    this.checkboxInput.disabled = false;
    this.hiddenControlField = $4(`#Recipient-control-${this.blockId}`, this);
    this.hiddenControlField.disabled = true;

    this.emailInput = $4(`#Recipient-email-${this.blockId}`, this);
    this.nameInput = $4(`#Recipient-name-${this.blockId}`, this);
    this.messageInput = $4(`#Recipient-message-${this.blockId}`, this);
    this.sendonInput = $4(`#Recipient-send_on-${this.blockId}`, this);
    this.offsetProperty = $4(`#Recipient-timezone-offset-${this.blockId}`);
    if (this.offsetProperty) this.offsetProperty.value = new Date().getTimezoneOffset().toString();

    this.errorMessageWrapper = $4('.hdt-form__message-wrapper', this);
    this.errorMessageList = this.errorMessageWrapper?.querySelector('ul');
    this.errorMessage = this.errorMessageWrapper?.querySelector('.hdt-error-message');
    this.defaultErrorHeader = this.errorMessage?.innerText;
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this.checkboxInput.addEventListener('change', getterRunFn(_on_recipient_form_changed, this, on_recipient_form_changed_fn).bind(this), { signal });
    this.form?.addEventListener(cartError, getterRunFn(_cart_error2, this, _cart_error2_fn).bind(this), { signal });
    this.form?.addEventListener(cartUpdate, getterRunFn(_clearErrorMessage, this, clearErrorMessage_fn).bind(this), { signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get form() {
    return this.closest('form');
  }
  get blockId() {
    return this.dataset.blockId;
  }

  get inputFields() {
    return [this.emailInput, this.nameInput, this.messageInput, this.sendonInput];
  }

  get disableableFields() {
    return [...this.inputFields, this.offsetProperty];
  }

  // clearInputFields() {
  //   this.inputFields.forEach((field) => (field.value = ''));
  // }

  enableInputFields() {
    this.disableableFields.forEach((field) => (field.disabled = false));
  }

  disableInputFields() {
    this.disableableFields.forEach((field) => (field.disabled = true));
  }
};
on_recipient_form_changed_fn = function() {
  if (this.checkboxInput.checked) {
    this.enableInputFields();
    this.recipientFieldsLiveRegion.innerText =  this.recipientFieldsLiveRegion.dataset.expanded;
  } else {
    this.disableInputFields();
    this.recipientFieldsLiveRegion.innerText = this.recipientFieldsLiveRegion.dataset.collapsed
  }
};
_cart_error2_fn = function(event) {
  if (event.detail.source === 'product-form') getterRunFn(_displayErrorMessage, this, displayErrorMessage_fn).call(this, event.detail.errors);
};
displayErrorMessage_fn = function(body) {
  getterRunFn(_clearErrorMessage, this, clearErrorMessage_fn).call(this);
  this.errorMessageWrapper.hidden = false;
  if (typeof body === 'object') {
    this.errorMessage.innerText = this.defaultErrorHeader;
    return Object.entries(body).forEach(([key, value]) => {
      const errorMessageId = `RecipientForm-${key}-error-${this.blockId}`;
      const fieldSelector = `#Recipient-${key}-${this.blockId}`;
      const message = `${value.join(', ')}`;
      const errorMessageElement = this.querySelector(`#${errorMessageId}`);
      const errorTextElement = errorMessageElement?.querySelector('.hdt-error-message');
      if (!errorTextElement) return;

      if (this.errorMessageList) {
        this.errorMessageList.appendChild(getterRunFn(_createErrorListItem, this, createErrorListItem_fn).call(this, fieldSelector, message));
      }

      errorTextElement.innerText = `${message}.`;
      errorMessageElement.removeAttribute('hidden');

      const inputElement = this[`${key}Input`];
      if (!inputElement) return;

      inputElement.setAttribute('aria-invalid', true);
      inputElement.setAttribute('aria-describedby', errorMessageId);
    });
  }

  this.errorMessage.innerText = body;
};
createErrorListItem_fn = function(target, message) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.setAttribute('href', target);
  a.innerText = message;
  li.appendChild(a);
  li.className = 'hdt-error-message';
  return li;
};
clearErrorMessage_fn = function() {
  this.errorMessageWrapper.hidden = true;

  if (this.errorMessageList) this.errorMessageList.innerHTML = '';

  $$4('.hdt-recipient-fields .hdt-form__message').forEach((field) => {
    field.setAttribute('hidden', '');
    const textField = $4('.hdt-error-message', field);
    if (textField) textField.innerText = '';
  });

  this.inputFields.forEach((inputElement) => {
    inputElement.setAttribute('aria-invalid', false);
    inputElement.removeAttribute('aria-describedby');
  });
};

var _slider_main_select = new WeakSet(), slider_main_select_fn,
_slide_media_main = new WeakMap(),
_xr_button = new WeakMap(),
_media_image_zoom = new WeakSet, media_image_zoom_fn,
_variants_options = new Map();
class ProductMedia extends GalleryModal {
  #controller;
  #_medias;
  #_thumbnailMedias;
  constructor() {
    super();
    getterAdd(_slider_main_select, this);
    getterAdd(_slide_media_main, this, $4(`hdt-slider-media`, this));
    getterAdd(_xr_button, this, $4('[data-shopify-xr]', this));
    getterAdd(_media_image_zoom, this);
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    getterGet(_slide_media_main, this)?.addEventListener('select', getterRunFn(_slider_main_select, this, slider_main_select_fn).bind(this), { signal });
    this.addEventListener(ThemeEvents.mediaStartedPlaying, (event)=> {
      const { resource } = event.detail;
      $$4('hdt-video[playing], hdt-model[playing]', this).forEach( (media) => {
        if (resource !== media) {
          //console.log(media)
          media.pause();
        }
      });
    }, { signal })

    // Handler for variant change
    // this.closest('hdt-product-observe')?.addEventListener("variant-change", (event) => {
    //   const {variant} = event.detail;
    //   if (!variant) return;
    //   this.#updateGroupMediaFilter(variant);
    //   if (!variant.featured_media) return;
    //   const media = $4(`.hdt-product-media__main [data-media-id="${variant.featured_media.id}"]`, this);
    //   if (!media) return;
    //   frame.render(() => {
    //     //console.log(media, variant)
    //     if (this.slider.isActive) {
    //       this.slider.goToTarget(media, !matchMediaQuery("motion"), true);
    //     } else {
    //       media.scrollIntoView({ block: "start", behavior: "smooth" });
    //     }
    //   })
    // }, { signal });
    document.forms[this.getAttribute("form")]?.addEventListener("product:updateNow", (event) => {
      //console.log('Media: ', event.detail.variant);
      const {variant} = event.detail;
      this.#updateGroupMediaFilter(variant);
      if (!variant.mid) return;
      const media = $4(`.hdt-product-media__main [data-media-id="${variant.mid}"]`, this);
      if (!media) return;
      frame.render(() => {
        //console.log(media, variant)
        if (this.slider.isActive) {
          this.slider.goToTarget(media, !matchMediaQuery("motion"), true);
        } else {
          media.scrollIntoView({ block: "start", behavior: "smooth" });
        }
      })
    }, { signal });

    // Handler for slider
    if (this.hasAttribute('update-image-on-slide-change')) {
      this.slider?.apiS?.on('pointerDown', (event) => {
        this.sliderUseronChange = true;
      });
      this.slider?.apiS?.on('pointerUp', (event) => {
        this.sliderUseronChange = false;
      });
      $4('hdt-slider-thumb', this)?.addEventListener('click', () => {
        this.sliderUseronChange = true;
      }, { signal });
      $4('hdt-slider-thumb', this)?.apiS?.on('select', (event) => {
        this.sliderUseronChange = false;
      });
    }

    // Handler for image zoom, lightBox
    if (this.imageZoom != 'no') super.connectedCallback();
    if ((this.imageZoom == 'zoom' || this.imageZoom == 'zoom_lightbox') && matchMediaQuery("hover")) {
      getterRunFn(_media_image_zoom, this, media_image_zoom_fn).call(this);
    }

    getterGet(_slide_media_main, this)?.addEventListener('reInit', () => {
      $4('.hdt-product-media__zoom', this)?.toggleAttribute('hidden', $4('.hdt-product__media-item.is-selected', this)?.dataset.mediaType != 'image');
    });
  }
  get imageZoom() {
    return this.getAttribute('image-zoom');
  }
  get sectionId() {
    return this.getAttribute('section-id');
  }
  get slider() {
    return $4('hdt-slider-media', this);
  }
  get #sliderThumb() {
    return $4('hdt-slider-thumb', this);
  }
  get images() {
    return $$4('.hdt-product-media__main [data-media-type="image"]:not([hidden]) img[hdt-el]', this)
  }
  get formId() {
    return this.getAttribute("form");
  }
  get form() {
    return document.forms[this.formId];
  }
  get variantPicker() {
    return $4(`hdt-variant-picker[form="${this.formId}"]`);
  }
  get #hasGroupFilter() {
    return this._hasGroupFilter ??= this.hasAttribute('can-has-media-group');
  }
  get #medias() {
    return this.#_medias ??= $$4('.hdt-product__media-item', this);
  }
  get #thumbnailMedias() {
    return this.#_thumbnailMedias ??= $$4('.hdt-thumbnail__media', this);
  }
  #updateGroupMediaFilter(variant){
    if (!this.#hasGroupFilter) return;
    const options = this.getAttribute('can-has-media-group').split('|'),
    values = [];
    //console.log(variant, options);
    options.forEach( (index) => {
      values.push(variant[`option${index}`]);
    });
    const selectedValues = values.join('-');
    // console.log('1: ',selectedValues, values, variant);

    this.#medias.forEach( (mediaItem, index) => {
      let groupValues = mediaItem.dataset.groupValues;
      if (groupValues.includes('*')) {
        //groupValues = groupValues.replace('*0', values[0]).replace('*1', values[1]).replace('*2', values[2]);
        groupValues = groupValues.replace(/\*(\d)/g, (match, index) => {
          return values[index] !== undefined ? values[index] : match;
        });
      }
      //console.log('2: ',groupValues, selectedValues);
      const isMatch = groupValues == selectedValues;
      mediaItem.toggleAttribute('hidden', !isMatch);
      this.#thumbnailMedias[index]?.toggleAttribute('hidden', !isMatch);
    });
    if (this.imageZoom != 'no') this.updateImageClick();
    //console.log(this.slider);
    //console.log(this.#sliderThumb);
    const reInitOptions = variant.featured_media ? { startIndex: this.slider?.getIndexSlide(variant.featured_media.id) } : undefined;
    this.slider?.reInit(reInitOptions);
    this.#sliderThumb?.reInit();
  }
};
slider_main_select_fn = async function(event){
  const { sliderApi } = event.detail,
  selectedSlide = sliderApi.slideNodes()[sliderApi.selectedScrollSnap()],
  prevSlide = sliderApi.slideNodes()[sliderApi.previousScrollSnap()],
  mediaId   = selectedSlide.dataset.mediaId,
  variantId = (selectedSlide.dataset.variantId || this.form.id.value) + '';

  if (this.sliderUseronChange && this.variantPicker && this.hasAttribute('update-image-on-slide-change') && variantId != this.form.id.value) {
    this.sliderUseronChange = false;
    if (!_variants_options.has(variantId)) {
      await fetch(`${this.dataset.url}?variant=${variantId}&view=options`).then((response) => response.text()).then((data) => {
        console.log(JSON.parse(data));
        _variants_options.set(variantId, JSON.parse(data));
      }).catch(() => { });
    }
    var inputChange = null;
    this.variantPicker?.fieldsets.forEach((fieldset, index) => {
      const input = $4(`input[is-value][data-value-id="${_variants_options.get(variantId)[index]}"]`, fieldset);
      if (!input.checked) {
        input.checked = true;
        inputChange = input;
      }
    });
    inputChange?.dispatchEvent(new Event("change", { bubbles: true }));
  }

  $4('hdt-video[playing], hdt-model[playing]', prevSlide)?.dispatchEvent( new CustomEvent('media:hidden', { bubbles: false, cancelable: true }) );
  $4('hdt-video, hdt-model', selectedSlide)?.dispatchEvent( new CustomEvent('media:visible', { bubbles: false, cancelable: true }) );
  // Update attr xr button
  getterGet(_xr_button, this)?.setAttribute('data-shopify-model3d-id', selectedSlide.dataset.mediaType == 'model' ? mediaId : getterGet(_xr_button, this).dataset.defaultId);
  // Update icon zoom
  $4('.hdt-product-media__zoom', this)?.toggleAttribute('hidden', selectedSlide.dataset.mediaType != 'image');
};
media_image_zoom_fn = function(){
  var classFadeMedia = 'zoom_fade_media',
      classFadeInfo  = 'zoom_fade_info',
      options        = JSON.parse( this.getAttribute('zoom-options') ),
      zoomWrapper    = $id4(`product-zoom-${this.sectionId}`),
      info           = $id4(`product-info-${this.sectionId}`),
      zoomType       = options.type,  // external, inner, inner2 zoom
      zoomFactor     = options.magnify,
      isExternal     = zoomType  == 'external';

  if(Shopify.designMode) $4('.drift-zoom-pane, .drift-bounding-box')?.remove();
  html.classList.add(`zoom-type--${zoomType}`);
  $$4('.hdt-product-media__main [data-media-type="image"] img', this).forEach((image) => {
    new Zoom(image, {
      //showWhitespaceAtEdges: false,
      sourceAttribute: 'src',
      zoomFactor,
      inlinePane: !isExternal && zoomType == 'inner2',
      containInline: isExternal,
      paneContainer: isExternal ? zoomWrapper : image.parentElement,
      hoverBoundingBox: isExternal, //false , true
      handleTouch: false,
      onShow: () => {
       this.classList.add(classFadeMedia);
       info.classList.add(classFadeInfo);
      },
      onHide: () => {
       this.classList.remove(classFadeMedia);
       info.classList.remove(classFadeInfo);
      }
    });
  });

};
customElements.define('hdt-product-media', ProductMedia);

var _master_input = new WeakMap(),
_fieldsets = new WeakMap(),
_options_size = new WeakMap();

const _tree = {},
_variants = {},
_product_info_cache = new Map(),
_variantLoadingStates = {};
class VariantLoader {
  constructor(config) {
    this.baseUrl = `${Shopify.routes.root}products/${config.handle}`; // URL cơ bản của product
    this.productId = config.productId; // Product ID để cache
    this.totalVariants = config.totalVariants; // Tổng số variants
    this.sectionId = config.sectionId || 'variants'; // Section ID
    this.triggerElement = config.triggerElement; // Element để theo dõi lazy load
    //this.onProgress = config.onProgress || (() => {}); // Callback khi có tiến trình
    //this.onComplete = config.onComplete || (() => {}); // Callback khi hoàn thành
    this.isLoading = false;
    this.isLoaded = false;
  }

  /**
   * Tải dữ liệu từ một trang
   */
  async fetchPage(pageNumber) {
    try {
      const response = await fetch(`${this.baseUrl}?page=${pageNumber}&section_id=${this.sectionId}`);

      if (!response.ok) {
        throw new Error('error: ', response);
      }
      const htmlText = await response.text();
      const html = new DOMParser().parseFromString(htmlText, "text/html");
      return $4('.hdt-section', html).textContent.trim();
      //return JSON.parse($4('.hdt-section', html).textContent.trim())
    } catch (error) { console.error(error); }
  }

  /**
   * Tải tất cả các trang
   */
  async loadAllPages() {
    // Kiểm tra cache global trước
    if (this.productId && _variants[this.productId]) {
      // console.log(`✓ Product ${this.productId} đã có trong cache`);
      const variants = _variants[this.productId];
      this.isLoaded = true;
      //this.onComplete(variants);
      this.dispatchLoadedEvent(variants);
      return variants;
    }

    // Kiểm tra nếu đã có instance khác đang tải cùng product
    if (this.productId && _variantLoadingStates[this.productId]) {
      // console.log(`Đang chờ instance khác tải product ${this.productId}...`);
      return this.waitForOtherInstanceToComplete();
    }

    if (this.isLoading || this.isLoaded) {
      // console.log('Đang tải hoặc đã tải xong');
      return _variants[this.productId]
    }

    // Đánh dấu đang tải
    this.isLoading = true;
    if (this.productId) {
      _variantLoadingStates[this.productId] = true;
    }

    const totalPages = Math.ceil(this.totalVariants / 250);
    // console.log(`Bắt đầu tải ${totalPages} trang, tổng ${this.totalVariants} variants`);

    try {
      // Tải tuần tự từng trang
      const variants = [];
      for (let page = 1; page <= totalPages; page++) {
        // console.log(`Đang tải trang ${page}/${totalPages}...`);

        const pageData = await this.fetchPage(page);
        variants.push(...JSON.parse(pageData));
        //const array = pageData.split('[nt94]');
        //variants.push(...JSON.parse(array[0]));
        //options.push(...JSON.parse(array[1]));
        // Gộp variants vào mảng chung
        // if (Array.isArray(pageData)) {
        //   variants.push(...pageData);
        // } else {
        //   console.warn(`Dữ liệu trang ${page} không phải array:`, pageData);
        // }

        // Callback tiến trình
        // this.onProgress({
        //   currentPage: page,
        //   totalPages: totalPages,
        //   loadedVariants: variants.length,
        //   totalVariants: this.totalVariants
        // });

        // Delay nhỏ để tránh quá tải server
        if (page < totalPages) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      this.isLoaded = true;
      this.isLoading = false;

      // Lưu vào cache global
      if (this.productId) {
        _variants[this.productId] = variants;
        delete _variantLoadingStates[this.productId];
        // console.log(`✓ Đã lưu ${variants.length} variants vào theme.variants.${this.productId}`);
      } else {
        // console.log(`✓ Đã tải xong ${variants.length} variants`);
      }

      // Dispatch custom event
      this.dispatchLoadedEvent(variants);

      // Callback hoàn thành
      //this.onComplete(variants);

      return variants;

    } catch (error) {
      this.isLoading = false;
      if (this.productId) {
        delete _variantLoadingStates[this.productId];
      }
      // console.error('Lỗi khi tải variants:', error);
      throw error;
    }
  }

  /**
   * Chờ instance khác tải xong
   */
  async waitForOtherInstanceToComplete() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.productId && _variants[this.productId]) {
          clearInterval(checkInterval);
          const variants = _variants[this.productId];
          this.isLoaded = true;
          this.dispatchLoadedEvent(variants);
          //this.onComplete(variants);
          resolve(variants);
        }
      }, 100);
    });
  }

  /**
   * Dispatch custom event khi tải xong
   */
  dispatchLoadedEvent(variants) {

    // Dispatch từ trigger element nếu có, nếu không thì từ document
    this.triggerElement.dispatchEvent(new CustomEvent('variantsLoaded', {
      detail: {
        productId: this.productId,
        variants: variants,
        totalVariants: variants.length
      },
      bubbles: true
    }));
    // console.log(`✓ Đã dispatch event 'variantsLoaded' với ${variants.length} variants`);
  }
}
class VariantPicker extends HTMLElement {
 #controller;
 #controllerFetch;
 #fieldsetsTree = {};
 #is_soldout = false;
 #is_unavailable = false;
 #optionsIndexNeedUpdate = [];
  constructor() {
    super();
    getterAdd(_fieldsets, this, $$4('fieldset', this));
    getterAdd(_options_size, this, this.fieldsets.length);

  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this.abortController = new AbortController();
    getterAdd(_master_input, this, this.masterInput);
    this.#updateUrl();
    this.updateOptions();

    // Init Variants
    if (_variants[this.dataset.id]) {
      this.#variantSmart(_variants[this.dataset.id]);
    } else {
      const loader = new VariantLoader({
        handle: this.handle,
        productId: this.dataset.id,
        totalVariants: parseInt(this.getAttribute('count')),
        triggerElement: this
      });
      inView(this.parentElement, () => loader.loadAllPages(), { margin: "500px" });
      this.addEventListener('variantsLoaded', (e) => {
        this.#variantSmart(e.detail.variants);
      });
    }
    // End Init Variants

    this.addEventListener('change', this.#valueChange, { signal });

    // To trigger when use type dropdown
    //$$4('fieldset[type^="dropdown"]', this).forEach((fieldset) => {
    $$4('fieldset[type^="dropdown"], fieldset[picker-style^="dropdown"]', this).forEach((fieldset) => {
      $4('hdt-popover', fieldset).addEventListener("richlist:change", (e) => {
        //console.log(e)
        const input = $4(`input[type="hidden"][name="option${parseInt(e.target?.dataset.index) + 1}"]`, fieldset);
        if (input.value == e.detail.value) return;
        input.value = e.detail.value;
        input.setAttribute("data-value-id", e.target?.dataset.valueId);
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }, { signal });
    });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get handle() {
    return this._handle ??= this.getAttribute("handle");
  }
  get masterInput() {
    const formId = this.getAttribute("form"),
    tmp = this.nextElementSibling;
    if (!document.forms[formId] && tmp) {
      tmp.replaceWith(tmp.content.firstElementChild.cloneNode(true));
    }
    return document.forms[formId].id;
  }
  get selectedVariant() {
    // const scriptData  = $4('script[data-selected-variant]', this),
    // variant = JSON.parse(scriptData?.textContent || "{}");
    // if (variant) variant.valuesID = JSON.parse(scriptData?.dataset?.selectedVariant || "[]");
    return JSON.parse($4('script[data-selected-variant]', this)?.textContent || "{}");
  }
  get fieldsets() {
    return getterGet(_fieldsets, this);
  }
  get #hideSoldOut() {
    return false;
  }
  get #main() {
    return this._main ??= this.closest(".hdt-main-product");
  }
  get #sectionId() {
    return this._sectionId ??= this.getAttribute("section-id");
  }
  get #form() {
    return this._form ??= document.forms[this.getAttribute("form")];
  }
  // updateOptions() {
  //   this.options = this.fieldsets.map((fieldset) => {
  //     return $$4('input, a', fieldset).find((input) => input.checked || input.type == 'hidden' || input.hasAttribute('selected'))?.dataset.valueId;
  //   }).filter((value)=> {
  //     return value !== undefined && value !== '';
  //   })
  // }
  updateOptions() {
    this.options = this.fieldsets
      .map((fieldset) => {
        const el = $$4('input, a', fieldset).find((input) => input.checked || input.type === 'hidden' || input.hasAttribute('selected'));
        return el?.dataset.valueId
          ? Number(el.dataset.valueId)
          : undefined;
      })
      .filter((value) => Number.isFinite(value));
  }

  #variantSmart(variants) {
    // Remove soldout
    //console.log(variants)
    let total = 1;
    // build fieldsetsTree
    this.fieldsets.forEach((fieldset, index) => {
      this.#fieldsetsTree[index] = $$4('[is-value]', fieldset).map(el => parseInt(el.dataset.valueId));
      const length = this.#fieldsetsTree[index].length;
      total = total * length;
      //if (length > 1) this.#optionsIndexNeedUpdate.push(index);
      this.#optionsIndexNeedUpdate.push(index);
    });
    // console.log('fieldsetsTree: ',this.#fieldsetsTree)
    _tree[this.dataset.id] = this.#buildVariantTree(variants);
    this.#is_unavailable = variants.length < total; // has unavailable
    this.#is_soldout = variants.some(v => v.available === false); // has soldout
    if (this.#is_unavailable || this.#is_soldout ) this.#updateSwatchSelector();

    // Hover
    // $$4('input[is-value] + label, button[is-value]').forEach( (el)=> {
    //   hover(el, () => {
    //     console.log("hover start")
    //     const nextOptions = [...this.options]; // clone
    //     nextOptions[Number(el.dataset.index || el.previousElementSibling.dataset.index)] = Number(el.dataset.valueId || el.previousElementSibling.dataset.valueId);
    //     const selectedOptions = nextOptions.reduce((acc, value, index) => {
    //       acc[`option${index}`] = value;
    //       return acc;
    //     }, {}),
    //     node = this.#findNode(selectedOptions);
    //     console.log(nextOptions, selectedOptions, node);
    //     let currentVariant;
    //     if (node) {
    //       currentVariant = node._variant;
    //     } else {
    //       currentVariant = this.#findClosestVariantOptimized(selectedOptions);
    //     }
    //     if (currentVariant) this.#fetchSection(currentVariant.id, false)
    //   })
    // })
  }
  #valueChange = async (event) => {
    //console.log('valueChange')
    if (!event.target.hasAttribute("is-value") && !event.target.hasAttribute('trigger-value')) return;
    this.updateOptions();
    if (this.options.length < getterGet(_options_size, this)) {
      return;
    }
    this.removeAttribute('no-pick');
    let currentVariant;
    //console.log('valueChange: ', this.options)
    const selectedOptions = this.#selectedOptions;
    //console.log('selectedOptions: ', selectedOptions)
    if (this.#is_unavailable || ( this.hideSoldOut && this.#is_soldout)) {
      // Check is unavailable: this.#is_unavailable || ( this.hideSoldOut && this.#is_soldout)
      // Check has variant match with options selected. if not variant find a variant closest match.
      const node = this.#findNode(selectedOptions);
      if (node) currentVariant = node._variant;
      //console.log('node:', node);
      if (!currentVariant) {
        // Case Unavailable
        currentVariant = this.#findClosestVariantOptimized(selectedOptions);
        if (!currentVariant) {
          //console.log('not find acurrentVariant')
          return;
        }
        // Update option
        const newOptions = Object.entries(currentVariant)
        .filter(([key]) => key.startsWith('option'))
        .map(([_, value]) => value);

        // Update radio checked
        newOptions.forEach( (value, index) => {
          const fieldset = this.fieldsets[index],
          valueEl = $4(`[is-value][data-value-id="${value}"]`, fieldset)
          if (valueEl) {
            if (valueEl.type == 'button') {
              // is Dropdown
              $4('[trigger-value]', fieldset).dataset.valueId = value;
              $4('button[aria-owns]', fieldset).textContent = valueEl.value;
              $4(`button[is-value][aria-selected="true"]`, fieldset).setAttribute('aria-selected', false);
              valueEl.setAttribute('aria-selected', true);
            } else {
              valueEl.checked = true;
            }
          }
        });
        // Update [update-value]
        this.updateOptions();
        //console.log('node2:', currentVariant, newOptions)
      }
      this.#updateSwatchSelector();
    } else {
      const _node = this.#findNode(selectedOptions);
      currentVariant = _node._variant;
      if (this.#is_soldout) this.#updateSwatchSelector();
    }
    //if (!currentVariant) return;
    // UPDATE
    // 1. Update [update-value]
    this.options.forEach( (value, index) => {
      const valueEl = $4(`[is-value][data-value-id="${value}"]`, this.fieldsets[index]);
      if (valueEl) $4('[update-value]', this.fieldsets[index]).textContent = valueEl.value;
    });

    // 2. Update form, buy buttons and media
    this.#form?.dispatchEvent(new CustomEvent("product:updateNow", { detail: { variant: currentVariant } }));

    // 3. Update url
    this.#updateUrl(currentVariant.id);

    // 4. Update product info
    const html = await this.#fetchSection(currentVariant.id);
    //console.log('html: ', html)
    if (!html) return;
    this.#form?.dispatchEvent(new CustomEvent("product:updateInfo", {
      detail: {
        html,
        sectionId: this.#sectionId,
        targetId: event.target.id,
      }
    }));
  }
  #updateSwatchSelector() {
    const CLASS_UNAVAILABLE = 'is-unavailable',
    CLASS_SOLDOUT = this.#hideSoldOut ? 'is-unavailable' : 'is-disabled',
    indexes = this.#optionsIndexNeedUpdate;
    //console.log(this.#fieldsetsTree, this.options)
    indexes.forEach((currentIndex, level) => {
      //console.log(currentIndex,level)
      this.#fieldsetsTree[currentIndex].forEach((value) => {

        const valueEl = $4(`[is-value][data-value-id="${value}"]`, this.fieldsets[currentIndex])

        // ===== Build selectedOptions =====
        const selectedOptions = {}

        // Fill previous selected options
        for (let i = 0; i < level; i++) {
          const idx = indexes[i];
          selectedOptions[`option${idx}`] = this.options[idx]
        }

        // Current option value
        selectedOptions[`option${currentIndex}`] = value

        const nodes = this.#findNode(selectedOptions)

        // ===== Reset state =====
        valueEl.classList.add(CLASS_UNAVAILABLE, CLASS_SOLDOUT);

        if (!nodes) return;

        valueEl.classList.remove(CLASS_UNAVAILABLE)
        if ( this.#collectLeafVariants(nodes)) valueEl.classList.remove(CLASS_SOLDOUT)

      })
    })
  }
  #buildVariantTree(variants) {
    const root = {};

    variants.forEach((variant) => {
      let currentNode = root;

      // Get all option values dynamically
      const optionValues = Object.keys(variant)
        .filter(key => key.startsWith("option") && variant[key])
        .sort() // ensure option1 -> option2 -> option3
        .map(key => variant[key]);

      optionValues.forEach((value, index) => {
        if (!currentNode[value]) {
          currentNode[value] = {};
        }

        // If last level → store variant
        if (index === optionValues.length - 1) {
          currentNode[value]._variant = variant;
          currentNode[value]._available = variant.available;
        }

        currentNode = currentNode[value];
      });
    });

    return root;
  }
  #findNode(selectedOptions) {
    let currentNode = _tree[this.dataset.id];

    const values = Object.keys(selectedOptions)
      .sort()
      .map(key => selectedOptions[key]);
    for (let value of values) {
      if (!currentNode[value]) return null;
      currentNode = currentNode[value];
    }

    return currentNode;
  }
  #collectAllVariants(node, result = []) {
    if (!node) return result;

    // Nếu là leaf node
    if (node._variant) {
      result.push(node._variant);
    }

    // Duyệt các nhánh con
    for (let key in node) {
      if (key.startsWith("_")) continue;

      this.#collectAllVariants(node[key], result);
    }

    return result;
  }
  #getMatchScore(variant, selectedOptions) {
    let score = 0;

    Object.keys(selectedOptions).forEach((key) => {
      if (variant[key] === selectedOptions[key]) {
        score++;
      }
    });

    return score;
  }
  #findClosestVariantOptimized(selectedOptions) {
    let currentNode = _tree[this.dataset.id];
    let lastValidNode = _tree[this.dataset.id];

    const values = Object.keys(selectedOptions)
      .sort()
      .map(key => selectedOptions[key]);

    for (let value of values) {
      if (!currentNode[value]) break;
      currentNode = currentNode[value];
      lastValidNode = currentNode;
    }

    const candidates = this.#collectAllVariants(lastValidNode);

    let bestVariant = null;
    let bestScore = -1;

    for (let variant of candidates) {
      if (!variant.available && this.#hideSoldOut) continue;

      const score = this.#getMatchScore(variant, selectedOptions);

      if (score > bestScore) {
        bestScore = score;
        bestVariant = variant;
      }
    }

    return bestVariant;
  }
  #collectLeafVariants(node, stopOnAvailable = true) {
    // GET 1 variant available
    const result = []
    let found = null

    function traverse(current) {
      for (const key in current) {
        const value = current[key]

        // nếu đã tìm được và muốn dừng
        if (stopOnAvailable && found) {
          return
        }

        // leaf node (variant)
        if (value && value.id !== undefined) {
          if (stopOnAvailable) {
            if (value.available) {
              found = value
              return
            }
          } else {
            result.push(value)
          }
        } else {
          traverse(value)
        }
      }
    }

    traverse(node)

    if (stopOnAvailable) {
      return found
    }

    return result
  }
  async #fetchSection(variantID, loading = true) {
    const key = `${this.#sectionId}:${variantID}`;

    if (_product_info_cache.has(key)) {
      return _product_info_cache.get(key);
    }
    this.#controllerFetch?.abort();
    const controller = new AbortController();
    this.#controllerFetch = controller;

    if (loading) this.#main?.setAttribute('loading-options', '');

    try {
      //console.log('url: ', `${Shopify.routes.root}products/${this.handle}?variant=${variantID}&section_id=${this.#sectionId}`)
      const response = await fetch(`${Shopify.routes.root}products/${this.handle}?variant=${variantID}&section_id=${this.#sectionId}`, { signal: controller.signal });
      const html = await response.text();
      // Save cache
      if (!Shopify.designMode) _product_info_cache.set(key, html);
      return this.#controllerFetch === controller ? html: true;
    }
    catch (error) {
      if (error.name !== 'AbortError') {console.error(error);}
    }
    finally {
      // chỉ remove nếu là request mới nhất
      if (this.#controllerFetch === controller) {
        this.#main?.removeAttribute('loading-options');
      }
    }
    // this.#controllerFetch?.abort();
    // this.#controllerFetch = new AbortController();
    // this.#main?.setAttribute('loading-options', '');
    // const response = await fetch(`${Shopify.routes.root}products/${this.handle}?option_values=${optionValues}&section_id=${this.#sectionId}`, { signal: this.#controllerFetch.signal});
    // const html = await response.text();
    // this.#main?.removeAttribute('loading-options');
    // // Save cache
    // if (!Shopify.designMode) _product_info_cache.set(key, html);

    // return html;
  }
  #updateUrl (id) {
    if (!this.hasAttribute("update-url") || !history.replaceState) return;
    const newUrl = new URL(window.location.href);
    id = id || this.getAttribute("update-url");
    if (id) {
      newUrl.searchParams.set("variant", id);
    } else {
      newUrl.searchParams.delete("variant");
    }
    window.history.replaceState({ path: newUrl.toString() }, "", newUrl.toString());
  }
  get #selectedOptions() {
    return this.options.reduce((acc, value, index) => {
      acc[`option${index}`] = value;
      return acc;
    }, {});
  }
};

var _max_height = new WeakSet(), max_height_fn;
class MaxHeight extends HTMLElement {
  constructor() {
    super();
    getterAdd(_max_height, this);
  }
  connectedCallback() {
    getterRunFn(_max_height, this, max_height_fn).call(this);
    // Add event listener for window resize
    window.addEventListener('resize', getterRunFn(_max_height, this, max_height_fn).bind(this));
    $4('.hdt-read-more', this)?.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleAttribute("open")
    });
  }
};
max_height_fn = function() {
  // Remove the max-height property
  this.removeAttribute("active-mh");
  this.removeAttribute("open");

  if (this.clientHeight >= this.scrollHeight) return;
  this.style.setProperty("--scroll-height", `${this.scrollHeight + ($4('.hdt-read-more', this)?.clientHeight || 0) + 20}px`);
  this.setAttribute("active-mh", "");
};

var _block_required_froms,
_block_required_detect,
_block_required_on_change, block_required_on_change_fn,
_block_required_on_submit, block_required_on_submit_fn;
class BlockRequired extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_block_required_on_submit, this);
    getterAdd(_block_required_on_change, this);
    getterAdd(_block_required_detect, this, this.getAttribute('detect'));
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const arrRequireds = $$4('[required]', this);
    //getterGet(_block_required_froms, this).checkBreak = false;
    if (arrRequireds.length == 0) return;
    getterAdd(_block_required_froms, this, document.forms[this.attrForm]);
    if (!getterGet(_block_required_froms, this)) return;
    arrRequireds.forEach((el) => { el.removeAttribute("required"); this.classList.add("is-required") } );
    //getterGet(_block_required_froms, this).checkBreak = ( $$4(`hdt-block-required [form="${this.attrForm}"]`).length != $$4(`hdt-block-required:not(.is-uncheck, .is-required) [form="${this.attrForm}"]`).length );
    this.updateBreak();
    const { signal } = this.#controller;
    if ( this.getAttribute('event') === 'change') {
      setTimeout(() => this.checked = $4('input:checked', this), 100); // fix when back tab will autocomplete
      this.addEventListener("change", getterRunFn(_block_required_on_change, this, block_required_on_change_fn).bind(this), { signal });
    } else {
      this.addEventListener("input", debounce( getterRunFn(_block_required_on_change, this, block_required_on_change_fn).bind(this), 150, { signal }));
    }
    getterGet(_block_required_froms, this).addEventListener("submit", getterRunFn(_block_required_on_submit, this, block_required_on_submit_fn).bind(this), { signal });
  }
  get attrForm() {
    return this._attrForm = this._attrForm || $4('[form]', this).getAttribute("form");
  }
  updateBreak() {
    getterGet(_block_required_froms, this).checkBreak = ( $$4(`hdt-block-required [form="${this.attrForm}"]`).length != $$4(`hdt-block-required:not(.is-uncheck, .is-required) [form="${this.attrForm}"]`).length );
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  createStyle() {
    const arr = [];
    let i,j = 0;
    for (i = 0; i < 10; i++) {
      arr.push(`translate3d(${arguments[j++]},0,0)`);
      if (j === arguments.length) j = 0;
    }
    return arr
  }
  /**
   * @param {any} value
   */
  set checked(value) {
    this.setChecked = value;
  }
  get checked() {
    return this.setChecked
  }
}
_block_required_froms = new WeakMap();
_block_required_detect = new WeakMap();
_block_required_on_change = new WeakSet();
block_required_on_change_fn = function() {
  this.checked = false;
  // checked, length
  if ( getterGet(_block_required_detect, this ) === 'checked') {
    if ($4('input:checked', this)) this.checked = true;
  } else {
    const element = $4('input[type="text"]', this) || $4('textarea', this) || $4('select', this);
    if (element && element.value.length > 0) this.checked = true;
  }
  // this.classList.remove('is-required');
  // this.classList.toggle('is-uncheck', !this.checked);
  this.classList.remove('is-uncheck');
  this.classList.toggle('is-required', !this.checked);
  this.updateBreak();
};
_block_required_on_submit = new WeakSet();
block_required_on_submit_fn = function(event) {
  if (this.checked) return;
  //if (this.checked || event.target?.getAttribute('id') !== this.attrForm) return;
  event.preventDefault();
  event.stopPropagation();
  this.classList.remove('is-required');
  this.classList.add('is-uncheck');
  //$4('label', this)?.focus();
  $4(`hdt-block-required.is-uncheck [form="${this.attrForm}"]`).focus();
  animate(
    this,
    {
      transform: this.createStyle(0, '-10px', '10px')
    },
    {
      offset: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  );
};
customElements.define("hdt-block-required", BlockRequired);

class buyButtons extends HTMLElement {
  #controller;
  connectedCallback() {
    this.#controller = new AbortController();
    const productForm = this.closest('product-form');
    //quantity = $4('[quantity-selector', this);
    productForm.submitButton = $4('[type="submit"]', this);
    if (productForm.cart) productForm.submitButton.setAttribute('aria-haspopup', 'dialog');
    const {preOrder, addToCart, soldOut} = themeHDN.strings;
    document.forms[this.getAttribute("form")]?.addEventListener("product:updateNow", (event) => {
      const { variant } = event.detail;
      //console.log('Buy button: ', variant)
      // 1.Update id
      productForm.form.id.value = variant.id;
      if (!this.hasAttribute('need-update-atc')) return;
      // 2. Update atc text: Add to cart, Sold out, pre-oder
      productForm.submitButton.toggleAttribute('disabled', !variant.available);
      productForm.submitButton.firstElementChild.textContent = variant.isPreOrder ? preOrder : variant.available ? addToCart : soldOut;
      // Hidden quantity
      // quantity.hidden = !variant.available;
    }, { signal: this.#controller.signal });
    if (this.closest('.hdt-main-product')?.hasAttribute('is-qv')) {
      //console.log('qv')
      Shopify?.PaymentButton?.init();
    }
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
};

var _on_submit_handler = new WeakSet(), on_submit_handler_fn,
_product_form = new WeakMap(), _cart_drawer = new WeakMap(),
_reset_product_form_state = new WeakSet(), reset_product_form_state_fn;
class ProductForm extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_on_submit_handler, this);
    getterAdd(_reset_product_form_state, this);
    getterAdd(_product_form, this, $4('form', this));
    getterAdd(_cart_drawer, this, $4('[ref="hdt-cart"]'));
    this.hideErrors = this.dataset.hideErrors === 'true';
    this.submitButton = $4('[type="submit"]', this);
    if (this.cart) this.submitButton.setAttribute('aria-haspopup', 'dialog');
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    if (typeof this.form.id == 'object') this.form.id.disabled = false;
    this.form?.addEventListener('submit', getterRunFn(_on_submit_handler, this, on_submit_handler_fn).bind(this), { signal });
    this.form?.addEventListener('variant-change', getterRunFn(_reset_product_form_state, this, reset_product_form_state_fn).bind(this), { signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper = this.errorMessageWrapper || $4('.hdt-form__message-wrapper', this);
    //console.log('this.errorMessageWrapper', this.errorMessageWrapper, errorMessage)
    if (!this.errorMessageWrapper) return;
    this.errorMessage = this.errorMessage || $4('.hdt-error-message', this.errorMessageWrapper);

    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);
    if (errorMessage) this.errorMessage.textContent = errorMessage;
  }
  get form() {
    return getterGet(_product_form, this);
  }
  get cart() {
    return getterGet(_cart_drawer, this);
  }
};
on_submit_handler_fn =  async function(event) {
  event.preventDefault();
  if (this.form.checkBreak) return;
  if (!this.form.checkValidity()) {
    this.form.reportValidity();
    return;
  }
  this.submitButton.setAttribute("aria-disabled", true);
  this.submitButton.setAttribute("aria-busy", true);

  document.dispatchEvent(new CustomEvent(loadingStart));

  const formData = new FormData(this.form);
  if (this.cart) {
    formData.append('sections', this.cart?.sectionsToRender?.map(section => section.id) ?? ['cart-json']);
    // formData.append(
    //   'sections',
    //   this.cart.sectionsToRender.map((section) => section.id)
    // );
    //formData.append('sections_url', window.location.pathname);
    //this.cart.focusElement = document.activeElement;
  }
  const fetchCfg = fetchConfig('javascript', { body: formData }),
  response = await fetch(`${Shopify.routes.root}cart/add.js`, {
    ...fetchCfg,
    headers: {
      ...fetchCfg.headers,
      Accept: 'text/html',
    },
  });
  this.submitButton.removeAttribute("aria-disabled");
  this.submitButton.removeAttribute("aria-busy");
  const responseJson = await response.json();
  document.dispatchEvent(new CustomEvent(loadingEnd));
  if (responseJson.status) {
    //if (this.hideErrors) return;
    const {errors, description, message} = responseJson;
    this.form.dispatchEvent(new CustomEvent(cartError, {
      bubbles: true,
      detail: {
        source: 'product-form',
        errors: errors || description,
        message
      }
    }));
    if (!this.hideErrors) this.handleErrorMessage(description);

    // When we add more than the maximum amount of items to the cart, we need to dispatch a cart reload event
    // because our back-end still adds the max allowed amount to the cart.
    document.dispatchEvent(new CustomEvent(cartReload, {
      bubbles: true,
      detail: {
        variantId: formData.get('id')
      }
    }));
  } else {
    if (!this.hideErrors) this.handleErrorMessage();
    const cartData = Object.assign({}, responseJson, JSON.parse(responseJson.sections['cart-json'].split('[split_94]')[1] || '{}'));
    this.form.dispatchEvent(new CustomEvent(cartUpdate, {
      bubbles: true,
      detail: {
        source: 'product-form',
        actionAfterATC: formData.get("action_added"),
        variantId: formData.get('id'),
        cartData,
        formData: Object.fromEntries(formData.entries())
      }
    }));
  }
};
reset_product_form_state_fn = function(even) {
  this.handleErrorMessage();
};

var _onOptionClicked, onOptionClicked_fn, _onKeyDown, onKeyDown_fn;
class Richlist extends HTMLElement {
  constructor() {
    super();
    getterAdd(_onOptionClicked, this);
    getterAdd(_onKeyDown, this);
    this.addEventListener("keydown", getterRunFn(_onKeyDown, this, onKeyDown_fn));
  }
  connectedCallback() {
    $$4('[role="option"]',this).forEach((option) => {
      option.addEventListener("click", getterRunFn(_onOptionClicked, this, onOptionClicked_fn).bind(this));
    });
  }
  static get observedAttributes() {
    return ["selected"];
  }
  /**
   * @param {string} value
   */
  set selected(value) {
    this.setAttribute("selected", value);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "selected" && oldValue !== null && newValue !== oldValue) {
      $$4('[role="option"]',this).forEach((option) => {
        if (option.value === newValue) {
          option.setAttribute("aria-selected", "true");
          if (!this.hasAttribute('off-change-text')) {
            $$4(`[aria-owns="${this.id}"]`).forEach((btnOwn) => {
              const btnText = $4('[change-text]', btnOwn),
              _btnText = btnText || btnOwn;
              _btnText.textContent = $4('[get-text]', option)?.innerText || option.getAttribute("title") || option.innerText || option.value;
            });
          }
          option.dispatchEvent(new CustomEvent("richlist:change", {
            bubbles: true,
            detail: {
              value: option.value
            }
          }));
        } else {
          option.setAttribute("aria-selected", "false");
        }
      });
    }
  }

}
_onOptionClicked = new WeakSet();
onOptionClicked_fn = function(event) {
  //console.log(event)
  const value = event.currentTarget.value;
  this.selected = value;
  event.currentTarget.dispatchEvent(new CustomEvent("richlist:select", {
    bubbles: true,
    detail: { value }
  }));
};
_onKeyDown = new WeakSet();
onKeyDown_fn = function(event) {
  if (event.key === "ArrowUp") {
    event.target.previousElementSibling?.focus();
    event.preventDefault();
  } else if (event.key === "ArrowDown") {
    event.target.nextElementSibling?.focus();
    event.preventDefault();
  }
};
customElements.define("hdt-richlist", Richlist);

// https://web.dev/articles/building/a-loading-bar-component?hl=vi#overview
var _loading_bar_start = new WeakSet(), loading_bar_start_fn,
 _loading_bar_end = new WeakSet(), loading_bar_end_fn;
class LoadingBar extends HTMLElement {
  constructor() {
    super();
    styleEffect(this, {scaleX: motionValue(0) });
    getterAdd(_loading_bar_start, this);
    getterAdd(_loading_bar_end, this);
    document.addEventListener(loadingStart, getterRunFn(_loading_bar_start, this, loading_bar_start_fn).bind(this));
    document.addEventListener(loadingEnd, getterRunFn(_loading_bar_end, this, loading_bar_end_fn).bind(this));
  }
};
loading_bar_start_fn = function() {
  this.showPopover();
  animate([
    [this, { opacity: [0, 1] }, { duration: 0.25, ease: "easeIn" }],
    [this, { scaleX: [0, 0.9] }, { duration: 0.6, at: 0.2, ease: "linear" }]
  ]);
};
loading_bar_end_fn = function() {
  animate([
    [this, { scaleX: 1 }, { duration: 0.25, ease: "linear" }],
    [this, { opacity: 0 }, { duration: 0.25, ease: "easeIn" }]
  ]).then(() => {
    this.hidePopover();
  });
};
class RevealItems extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    if (matchMediaQuery("motion") && this.enabledReveal && $$4(this.selector, this).length > 0) {
    inView(this, this.reveal.bind(this));
    }
  }
  //disconnectedCallback() { }
  get selector() {
    const _selector = this.getAttribute('selector') || '.hdt-card-product';
    return (this.prependEl || '') + _selector + (this.appendEl || '').replaceAll(/nathan/g, _selector);
  }
  get enabledReveal() {
    return this.getAttribute('reveal-on-scroll') === 'true';
  }
  reveal() {
    animate(
      $$4(this.selector, this),
      {
        opacity: [0, 1],
        transform: ["translateY(30px)", "translateY(0)"],
      },
      {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1.0],
        delay: stagger(0.05, { startDelay: 0.3, ease: [0.25, 0.1, 0.25, 1.0] })
      }
  );
    // .then(() => {
    //   this.appendEl = '';
    // });
   // this.setEl = null;
    // .then(() => {
    //   this.setEl = null;
    // });
  }
}

customElements.define("hdt-buy-buttons", buyButtons);
customElements.define('hdt-quantity-wrapp', QuantityWrapp);
customElements.define('hdt-variant-picker', VariantPicker);
customElements.define('hdt-recipient-form', RecipientForm);
customElements.define('hdt-x-progress', XProgress);
customElements.define("hdt-max-height", MaxHeight);
customElements.define("product-form", ProductForm);
customElements.define("hdt-loading-bar", LoadingBar);
customElements.define("hdt-reval-items", RevealItems);

var _update_product_info = new WeakSet(), update_product_info_fn;
class ProductUpdateInfo extends HTMLElement {
  #controller;
    constructor() {
      super();
      getterAdd(_update_product_info, this);
    }
  connectedCallback() {
    this.#controller = new AbortController();
    this.form?.addEventListener("product:updateInfo", getterRunFn(_update_product_info, this, update_product_info_fn).bind(this), { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get form() {
    return document.forms[this.getAttribute("form")];
  }
};
update_product_info_fn = function(event) {
  const { sectionId, html, targetId } = event.detail,
  domFragment = $4(`#shopify-section-${sectionId}`, document.createRange().createContextualFragment(html)),
        scriptData  = $4('[data-type="variant-picker"] script[data-selected-variant]', domFragment),
        variant     = JSON.parse(scriptData?.textContent || "{}"),
        types       = ["price", "badges", "sku", "inventory", "payment-terms", "pickup-availability", "liquid"];
  if (variant) variant.valuesID = JSON.parse(scriptData?.dataset?.selectedVariant || "[]");
  types.forEach((type) => {
    const strBlock = `.hdt-product-info__item[data-type="${type}"]`,
    domBlocksType = $$4(strBlock, domFragment);
    $$4(strBlock, this).forEach((block, index) => {
      const blockReplace = domBlocksType[index];
      if (!blockReplace) return;
      // if (type === "variant-picker" || type === "buy-buttons") {
      //   if (type === "buy-buttons") $4('[name="id"]', block).value = variant.id;
      //   $4(`hdt-${type}`, block).replaceWith($4(`hdt-${type}`, blockReplace));
      //   if (type === "buy-buttons") {
      //     Shopify?.PaymentButton?.init();
      //   }
        // else {
        //   $4('.hdt-modal__size-chart', block)?.parentElement?.replaceWith($4('.hdt-modal__size-chart', blockReplace).parentElement);
        // }
      // } else
      if (type === "hdt-quantity-wrapp") {
        const getQty = block.qty;
        block.replaceWith(blockReplace),
        $4("hdt-quantity-wrapp", blockReplace).qty = getQty;
      } else if (type === "inventory") {
        const newInventoryBlock = $4('.hdt-x-progress', blockReplace),
        inventoryBlock = $4('.hdt-x-progress', block);
        if (newInventoryBlock && inventoryBlock) {
          newInventoryBlock.removeAttribute('reveal-in-view');
          newInventoryBlock.setAttribute('disable-intial', '');
          const valuenow = newInventoryBlock.getAttribute("value");
          newInventoryBlock.setAttribute("value", inventoryBlock.value);
          //console.log(inventoryBlock.getAttribute("value"), valuenow)
          block.replaceWith(blockReplace);
          newInventoryBlock.value = valuenow;
          // setTimeout(() => {
          //   newInventoryBlock.value = valuenow;
          // }, 10);
        } else {
          block.replaceWith(blockReplace)
        }
      } else {
        block.replaceWith(blockReplace)
      }
    });
  });
  // Focus input radio
  //$4(`#${targetId}`)?.focus();
  this.form?.dispatchEvent(new CustomEvent("variant-change", {
    bubbles: true,
    detail: {
      sectionId,
      html,
      variant
    }
  }));
};
customElements.define('hdt-product-observe', ProductUpdateInfo);

/**
* 9. Product card
* -----------------------------------------------------------------------------
*/

var cacheUrlVariant = {};
var UrlWithVariant = class {
  static get(url, id) {
    if (!url || !id)  return;
    if (cacheUrlVariant[id]) {
      return cacheUrlVariant[id];
    }
    url = new URL(url);
    url.searchParams.set("variant", id);
    return cacheUrlVariant[id] = url.toString();
  }
};
var _color_action_all = new WeakSet(), color_action_all_fn,
_color_auto_limit = new WeakSet(), color_auto_limit_fn,
_color_changed_data = new WeakSet(), color_changed_data_fn,
_color_on_hovered = new WeakSet(), color_on_hovered_fn,
_create_img = new WeakSet(), create_img_fn,
_color_slider = new WeakMap(),
_color_links = new WeakMap(),
_color_media_main = new WeakMap();
class Swatches extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_color_action_all, this);
    getterAdd(_color_auto_limit, this);
    getterAdd(_create_img, this);
    getterAdd(_color_changed_data, this);
    getterAdd(_color_on_hovered, this);
    getterAdd(_color_slider, this, this.closest('.hdt-slider'));
    const product = this.closest('hdt-card-product');
    getterAdd(_color_links, this, $$4('[data-pr-url]', product));
    getterAdd(_color_media_main, this, $4('.hdt-card-product__media--main', product));
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;

    if (this.hasAttribute('auto-limit')) {
      this.resize = resize(this, () => {
        frame.render(() => getterRunFn(_color_auto_limit, this, color_auto_limit_fn).call(this))
      });
    }
    if (this.hasAttribute('action-all')) {
      $4('.is--color-link', this)?.addEventListener("click", getterRunFn(_color_action_all, this, color_action_all_fn).bind(this), { signal });
    }
    if ($$4('[type="radio"]:not([disabled])', this).length == 0 ) return;

    // change/preload
    $$4('[type="radio"]', this).forEach( (radio) => {
      radio.addEventListener("change", getterRunFn(_color_changed_data, this, color_changed_data_fn).bind(this), { signal });
    });
    $$4('[type="radio"][data-vimg] + label', this).forEach( (label) => {
      label.addEventListener("pointerover", getterRunFn(_color_on_hovered, this, color_on_hovered_fn).bind(this), { signal });
    });

    // Hover trigger event change
    if (!matchMediaQuery("mobile") && this.getAttribute('event') == 'hover') {
      let timeOut;
      $$4('[type="radio"] + label', this).forEach( (label) => {
        hover(label, () => {
          clearTimeout(timeOut);
          timeOut = setTimeout(() => {
            const radio = label.previousElementSibling;
            radio.checked = true;
            radio.dispatchEvent(new CustomEvent("change", { bubbles: false }))
          }, 100);
        })
      });
    }
  }
  disconnectedCallback() {
    this.#controller.abort();
    if (this.resize) this.resize();
  }
  set mediaMain(value) {
    getterAdd(_color_media_main, this, value, true);
  }
  get mediaMain() {
    return getterGet(_color_media_main, this);
  }
};
color_auto_limit_fn = function() {
  const Linka =  $4('.is--color-link a', this);
  $4('.is--color-limit', this)?.classList.remove('is--color-limit');
  const widthLink = $4('.is--color-link', this)?.clientWidth || 0,
  notNeedLimit = (this.scrollWidth - widthLink ) <= this.clientWidth;
  this.setAttribute('no-limit', notNeedLimit.toString());

  if (notNeedLimit) return;

  const widthColor = $4('.hdt-color-list__item', this).clientWidth,
  colorsCanShow = Math.floor((this.clientWidth  - widthLink) / widthColor);

  $$4('.hdt-color-list__item', this)[colorsCanShow]?.classList.add('is--color-limit');
  if (Linka) Linka.textContent = `+${this.firstElementChild.childElementCount - 2 - colorsCanShow}`; // - is--color-link - legend name ( total -2)

};
color_action_all_fn = async function(e) {
  e.preventDefault();
  this.resize();
  this.firstElementChild.lastElementChild.setAttribute('hidden', '');
  const $colors = $$4('.is--color-limit, .is--color-limit ~ .hdt-color-list__item:not(.is--color-link)', this),
  focusEl = $4('.is--color-limit', this).nextElementSibling;
  this.style.overflow = 'hidden';
  this.style.height = this.clientHeight + 'px';
  focusEl.previousElementSibling.classList.remove('is--color-limit');
  this.removeAttribute('auto-limit');

  animate($colors, { opacity: 0 }, { duration: 0 })
  await animate(this, { height: [`${this.clientHeight}px`, `${this.scrollHeight}px`] }, { duration: getterGet(_color_slider, this) && getterGet(_color_slider, this).isActive ? 0 : 0.25 });

  this.style.height = null;
  this.style.overflow = null;
  // Reint slider
  getterGet(_color_slider, this)?.reInit();
  animate(
    $colors,
    { opacity: [0, 1], transform: ["scale(.5) translateY(10px)", "scale(1) translateY(0)"] },
    { duration: 0.35, at: "-0.1", delay: stagger($colors.length > 25 ? 0 : 0.01, { ease: "easeOut" }), ease: [0.25, 0.1, 0.25, 1.0] }
  ).then(() => {
    //getterGet(_color_slider, this)?.reInit();
  });

  // Focus
  $4('input', focusEl)?.focus();

};
_create_img = new WeakSet();
create_img_fn = function(vimg) {
  return createImg({
    src: vimg,
    width: this.mediaMain.getAttribute('width'),
    height: this.mediaMain.getAttribute('height'),
    alt: this.mediaMain.alt,
    onload: true,
    attrs: {
      class: this.mediaMain.className,
      sizes: this.mediaMain.sizes,
      'data-widths': this.mediaMain.getAttribute('data-widths') || '[]'
    }
  })
};
color_changed_data_fn = function(event) {
  const {vid,vimg,url} = event.target.dataset;
  // Update variant url
  if (getterGet(_color_links, this).length > 0) {
    const newUrl = url || UrlWithVariant.get(getterGet(_color_links, this)[0].href, vid);
    getterGet(_color_links, this).forEach((link) => { link.href = newUrl });
  }

  // Update image
  if (vimg && this.mediaMain && vimg !== this.mediaMain.getAttribute('src')) {
    const newImg = getterRunFn(_create_img, this, create_img_fn).call(this, vimg);
    this.mediaMain.parentElement.removeAttribute('loaded');
    this.mediaMain.parentElement.setAttribute('loading', '');
    this.mediaMain.replaceWith(newImg);
    this.mediaMain = newImg;
  }

};
color_on_hovered_fn = function(event) {
  const radio = event.target.previousElementSibling;
  if (!radio ) return;
  const {vimg} = radio.dataset;
  // Preload image
  if ( vimg !== this.mediaMain.getAttribute('src')) getterRunFn(_create_img, this, create_img_fn).call(this, vimg);
};
customElements.define('wrapp-hdt-swatches', Swatches);

var _btns_tab_collection = new WeakMap(),
_products_tab_collection = new WeakMap(),
_is_ink_bar_tab_collection = new WeakMap(),
_link_tab_collection = new WeakMap(),
_resize_tab_collection = new WeakMap(),
_set_active_tab = new WeakSet(), set_active_tab_fn;
class tabCollection extends ScrollHint {
  #controller;
  constructor() {
    super();
    this.index = 0;
    getterAdd(_btns_tab_collection, this, $$4("button", this));
    getterAdd(_products_tab_collection, this, $$4(".hdt-collections__product", this.closest('.hdt-section')));
    getterAdd(_is_ink_bar_tab_collection, this, this.hasAttribute("ink-bar"));
    getterAdd(_link_tab_collection, this, $4(`#${this.getAttribute('link-id')}`, this.closest('.hdt-section')));
    getterAdd(_set_active_tab, this);


    this.x = springValue('0px');
    this.y = springValue('0px');
    this.w = springValue('0px');
    styleEffect(this, { '--ink-bar-x': this.x, '--ink-bar-y': this.y, '--ink-bar-w': this.w });

    // Set the initial position of the ink bar
    if (getterGet(_is_ink_bar_tab_collection, this)) {
      getterRunFn(_set_active_tab, this, set_active_tab_fn).call(this, null);
      if (window.ResizeObserver) {
        getterAdd(_resize_tab_collection, this, new ResizeObserver(throttle(getterRunFn(_set_active_tab, this, set_active_tab_fn).bind(this, null))) );
        getterGet(_resize_tab_collection, this).observe(this);
      }
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this.btns.forEach((btn, index) => {
      btn.addEventListener("click", getterRunFn(_set_active_tab, this, set_active_tab_fn).bind(this, btn, index), { signal });
    });
    if (Shopify.designMode) {
      //this.addEventListener(admEvts.seLoad, () => { getterRunFn(_set_active_tab, this, set_active_tab_fn).call(this, null) }, { signal });
      this.addEventListener(admEvts.select, (event) => { event?.target?.click(); }, { signal });
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller.abort();
  }
  get selectedReturn() {
    return true
  }
  get tabs() {
    return getterGet(_products_tab_collection, this);
  }
  get btns() {
    return getterGet(_btns_tab_collection, this);
  }
  get linkAll() {
    return getterGet(_link_tab_collection, this);
  }
};
set_active_tab_fn = function(btn, index) {
  if (btn && btn.getAttribute("aria-selected") == 'true' && this.selectedReturn) return;
  if (!btn) {
    btn = this.btns[this.index];
    index = this.index
  }
  this.btns.forEach((btn) => {
    btn.setAttribute("aria-selected", btn === this.btns[index]);
  });
  this.tabs.forEach((item) => {
    item.setAttribute("hidden", "");
    item.classList.remove("is-selected");
  });
  let itemActive = this.tabs[index];
  if (this.index == index) {
    itemActive.removeAttribute("hidden");
    itemActive.classList.add("is-selected");
    //try { $4('.hdt-slider', itemActive)?.reveal(); } catch (error) {}
  } else {
    let itemPrevActive = this.tabs[this.index];
    itemPrevActive.removeAttribute("hidden");
    animate(itemPrevActive, { opacity: [1, 0], y: [0, 30] }, { duration: 0.35, ease: "easeIn" }).then(() => {
      itemPrevActive.setAttribute("hidden", "");
      itemActive.removeAttribute("hidden");
      itemActive.classList.add("is-selected");
      //console.log(itemActive, itemActive.clientHeight, itemActive.scrollHeight)
      //try { $4('.hdt-slider', itemActive)?.reveal(); } catch (error) {}
      animate(itemActive, { opacity: [0, 1], y: [30, 0] }, { duration: 0.35, ease: "easeOut" });
    });

    this.closest('.hdt-section')?.dispatchEvent(new CustomEvent('hdt:tab-changed', {
      bubbles: true,
      detail: { index }
    }));

    if (this.linkAll) {
      this.linkAll.href = btn.dataset.url;
      this.linkAll.setAttribute("aria-label", (this.linkAll.dataset.label || '').replace('[name]', btn.dataset.label));
    }
  }
  this.index = index;

  if (!getterGet(_is_ink_bar_tab_collection, this)) return;
  this.x.set(`${btn.offsetLeft}px`);
  this.y.set(`${btn.offsetTop + btn.offsetHeight - 1}px`);
  this.w.set(`${btn.offsetWidth}px`);
};

var _section_related = new WeakMap();
class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
    getterAdd(_section_related, this, this.closest('.hdt-section'));
  }
  connectedCallback() {
    if (!this.url) return this.nullOrEmpty();
    inView(this, ()=> {
      this.loadProducts();
    }, { margin: '0px 0px 400px 0px' })
  }
  get type() {
    return 'related'
  }
  get url() {
    return this.dataset.url;
  }
  get section() {
    return getterGet(_section_related, this);
  }
  nullOrEmpty() {
    if (this.hasAttribute('inner-group')) {
      this.parentElement?.previousElementSibling?.remove();
      this.parentElement?.remove();
      this.section.setAttribute(`${this.type}-empty-inted`, '');
    } else {
      this.section.hidden = true;
    }
  }
  loadProducts() {
    fetch(`${this.url}`)
    .then((response) => response.text())
    .then((text) => {
      const html = new DOMParser().parseFromString(text, "text/html"),
      inner = $4('.hdt-section', html).innerHTML.trim().replace(/<!--[\s\S]*?-->/g, ''); // clear comment when on admin <!--shopify:rendered_by_section_api-->
      if (inner.includes('no_000') || inner.length == 0) {
        this.nullOrEmpty();
      } else {
        this.section.setAttribute(`${this.type}-inted`, '');
        this.replaceChildren(...$4('.hdt-section', html).children);
        document.dispatchEvent(new CustomEvent("currencyUpdate"));
      }
    }).catch((e) => {console.error(e); });
  }
};

const recentlyKey = 'theme4:recently:id';
class ProductRecently extends ProductRecommendations {
  constructor() {
    super();
  }
  get section() {
    return this.hasAttribute('self') ? this : super.section;
  }
  get type() {
    return 'recently'
  }
  get url() {
    if (this._url) return this._url;
    this._url = null;
    let productsId = localStorage.getItem(recentlyKey);
    let productId = this.dataset.id;
    if (productsId !== null) {
      if (productsId.split(',').some(v => v === '')) {
        productsId = productsId.replace(/,+/g, ',').replace(/^,|,$/g, '');
        localStorage.setItem(recentlyKey, productsId);
      }
      productsId = productsId.split(',');
      this._url = this.dataset.url.replace('q=', `q=id:${productsId.join("%20OR%20id:")}`);
    }
    let arrProducts = productsId || new Array;
    // console.log(arrProducts, productsId)
    if (productId && !arrProducts.includes(productId + '')) {
      if (arrProducts.length >= 10) {
        arrProducts.pop();
      }
      arrProducts.unshift(productId);
      localStorage.setItem(recentlyKey, arrProducts.toString());
    }
    return this._url;
  }
};
class clearAllRecently extends HTMLElement {
  #controller;
  connectedCallback(){
    this.#controller = new AbortController();
    this.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(recentlyKey);
      this.closest('[wrap-clear]')?.setAttribute('hidden', '');
    }, { signal: this.#controller.signal });
  }
  disconnectedCallback(){
    this.#controller.abort();
  }
}

customElements.define('hdt-tab-collection', tabCollection);
customElements.define('product-recommendations', ProductRecommendations);
customElements.define('hdt-product-recently', ProductRecently);
customElements.define('wrapp-recent-clearall', clearAllRecently);


/**
* 10. Before after
* -----------------------------------------------------------------------------
*/
var _range_bf = new WeakMap();
class BeforeAfter extends HTMLElement {
  #controller;
  #percent;
  //#percent = springValue(0, { bounce: 0.5 });
  constructor() {
    super();
    getterAdd(_range_bf, this, $4('.hdt-bf-range',this));
    if (matchMediaQuery("motion") && this.hasAttribute('reveal-on-scroll') ) {
      this.#percent = springValue('0%');
      inView(this, ()=> {
        delay(() => {
        this.#percent.set(this.#range.value+'%')
        }, 0.35)
      }, { margin: "-200px 0px" });
    } else {
      this.#percent = springValue(this.#range.value+'%');
    }
  }

  get #range() {
    return getterGet(_range_bf, this);
  }

  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    styleEffect(this, { "--percent-val": this.#percent });

    this.#range.addEventListener('input', (e) => this.#percent.set(e.target.value+'%'), { signal });

    let dragTimer = null;
    this.#range.addEventListener('pointerdown', e => {
      dragTimer = setTimeout(() => {
        this.setAttribute('dragging', '');
      }, 120); // 60–120ms
    }, { signal });

    this.#range.addEventListener('pointerup', () => {
      clearTimeout(dragTimer);
      this.removeAttribute('dragging');
    }, { signal });
  }
};
customElements.define('hdt-before-after', BeforeAfter);

/**
* 11. Dialog
* -----------------------------------------------------------------------------
*/
/*
 * Declarative shadow DOM is only initialized on the initial render of the page.
 * If the component is mounted after the browser finishes the initial render,
 * the shadow root needs to be manually hydrated.
 */
class DeclarativeShadowElement extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const template = $4(':scope > :where(template[shadowrootmode="open"], template[lazy])', this);

      if (!(template instanceof HTMLTemplateElement)) return;

      const shadow = this.attachShadow({ mode: 'open' });
      shadow.append(template.content.cloneNode(true));
      template.remove();
    }
  }
}

const dialogsOpen = [];
var dialogCurrent;
class DialogComponent extends DeclarativeShadowElement {
  #controller;
  #scrollLock;
  constructor() {
    super();
  }
  connectedCallback() {
    this.dialog = $4('dialog', this);
    this.#scrollLock = this.dialog.hasAttribute('scroll-lock');
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    super.connectedCallback();

    this.dialog.dispatchEvent(new CustomEvent(dialogAdded, { bubbles: true }));
    // Events
    this.dialog.addEventListener('click', (e) => {
      // const rect = this.dialog.getBoundingClientRect();
      // const isClickOutside = (
      //   e.clientX < rect.left || e.clientX > rect.right ||
      //   e.clientY < rect.top || e.clientY > rect.bottom
      // );

      //console.log(isClickOutside, e, this.dialog, dialogsOpen, dialogCurrent, this.dialogId );
      if ((!this.hasAttribute('lock-outside') && this.#isClickOutside(e)) && (this.hasAttribute('nested') ? dialogCurrent === this.dialogId : true)) this.close();
    }, { signal });

    // ESC key to close dialog
    this.dialog.addEventListener('cancel', (e) => {
      e.preventDefault(); // Prevents the default cancel behavior
      //console.log(this)
      this.close();
    }, { signal });

    // Handle focus
    // this.dialog.addEventListener(dialogOpening, () => {
    //   //this.dialog.classList.add('focus-none');
    //   ($4('input[type="search"]', this.dialog) || this.dialog).focus();
    // }, { signal });

    // initial open
    if (this.hasAttribute('initial-open') || (!this.lockOpen && this.hasAttribute('initial-form-open') && location.href.indexOf(this.dataset.formId) > -1)) {
      this.open();
    }

    if (Shopify.designMode && !this.hasAttribute('un-detect')) {
      this.addEventListener(admEvts.select, (event) => this.open(!event.detail.load), { signal });
      this.addEventListener(admEvts.deselect, () => this.close(true), { signal });
      this._shopifySection = this._shopifySection || this.closest(".shopify-section");
      if (this._shopifySection) {
        if (this.hasAttribute("detect-adm-se-evt")) {
          this._shopifySection.addEventListener(admEvts.seSelect, (event) => this.open(event.detail.load), { signal });
          this._shopifySection.addEventListener(admEvts.seDeselect, this.close.bind(this), { signal });
        }
        //this._shopifySection.addEventListener(admEvts.seUnload, () => this.remove(), { signal });
      }
    }
  }
  disconnectedCallback() {
    if (this.dialog?.open) {
      this.#removeDialogId()
      if (this.#scrollLock && this._openedAsModal && dialogsOpen.length == 0) html.removeAttribute('scroll-lock');
    }
    this.dialog = null;
    this.#controller.abort();
  }

  /**
   * Gets the root node of the component, which is either its shadow root or the component itself.
   *
   * @returns {(ShadowRoot | Component<T>)[]} The root nodes.
   */
  // get roots() {
  //   return this.shadowRoot ? [this, this.shadowRoot] : [this];
  // }
  get dialogId() {
    return this.dialog.id;
  }
  get show() {
    this._openedAsModal = true;
    return this.dialog.showModal();
  }
  async open(jump = false) {
    if (this.dialog.open) return;
    // const focusable = $$4('input, button, [tabindex]', this.dialog);
    // focusable.forEach(el => el.setAttribute('tabindex', '-1'));
    this.show;
    elFocus(this.dialog, false, true);
    if (this.#scrollLock && this._openedAsModal) html.setAttribute('scroll-lock', '');
    this.dialog.dispatchEvent(new CustomEvent(dialogOpening));
    this.dialog.classList.add('dialog-opening');
    dialogsOpen.push(this.dialogId);
    dialogCurrent = this.dialogId;
    const animation = this.animateDialogOpen();
    if (jump) animation.complete();
    await animation;
    this.dialog.classList.remove('dialog-opening');
    this.dialog.dispatchEvent(new CustomEvent(dialogOpen));
    this.trapFocus();
  }
  trapFocus() {
    if (this.hasAttribute('un-trapFocus')) return;
    const initiaFocus = this.getAttribute('initia-focus');
    trapFocus(this.dialog, initiaFocus ? initiaFocus === 'false' ? false : $4(initiaFocus, this.dialog) : this.dialog);
  }
  async close(jump = false) {
    if (!this.dialog.open) return;
    // console.log('close', jump)
    // if (this.hasAttribute('dialog-closing')) return;
    this.dialog.dispatchEvent(new CustomEvent(dialogClosing));
    this.dialog.classList.add('dialog-closing');
    this.#removeDialogId();
    const animation = this.animateDialogClose();
    if (jump) animation.complete();
    await animation;
    this.dialog.close();
    this.dialog.classList.remove('dialog-closing');
    if (!this.hasAttribute('un-trapFocus')) removeTrapFocus();
    this.dialog.dispatchEvent(new CustomEvent(dialogClose));
    if (this.#scrollLock && this._openedAsModal && dialogsOpen.length == 0) html.removeAttribute('scroll-lock');
    this.dialog.btnOpening?.setAttribute('aria-expanded', false)
    this.dialog.btnOpening = null;
  }
  // #forceDialogToggle() {
  //   return animate(this, {}, { duration: 0 });
  // }
  animateDialogOpen() {
    return animate(this.dialog, { opacity: [0, 1]}, {
      duration: 0.3,
      ease: 'easeOut'
    });
  }
  animateDialogClose() {
    return animate(this.dialog, { opacity: [1, 0]}, {
      duration: 0.2,
      ease: 'easeIn'
    });
  }
  updateTrap(focusEl) {
    if (!this.hasAttribute('un-trapFocus')) trapFocus(this.dialog, focusEl);
  }
  #isClickOutside(event) {
    const rect = this.dialog.getBoundingClientRect();
    if (event.target instanceof HTMLDialogElement || !(event.target instanceof Element)) {
      return (
        event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom
      );
    }
    return !this.contains(event.target);
  }
  #removeDialogId() {
    const index = dialogsOpen.indexOf(this.dialogId);
    if (index !== -1) dialogsOpen.splice(index, 1);
  }

}
document.addEventListener('click', (event) => {
  if (event.target.hasAttribute('not-dialog') ) return;
  const trigger = event.target.closest('[aria-controls]');
  if (!trigger) return;

  const dialogId = trigger.getAttribute('aria-controls'),
  dialog = $id4(dialogId);

  // if (!dialogComponent || typeof dialogComponent.open !== 'function') {
  //   console.warn(`No dialog-component with id "${dialogId}" found or not a valid component.`);
  //   return;
  // }
  if (!dialog || !(dialog instanceof HTMLDialogElement) || !dialog.className.split(/\s+/).some(cls => cls.startsWith('hdt-')) || (dialog.hasAttribute('nested') && dialogCurrent !== dialog.id)) return;

  event.preventDefault();
  //event.stopPropagation();
  event.stopImmediatePropagation();
  const dialogCloseId = trigger.getAttribute('close-dialog');
  $$4('[data-auto-close] > dialog[open]').forEach( (_dialog)=> {
    if (!_dialog?.parentElement?._openedAsModal && _dialog.id != dialog.id) _dialog.parentElement.close(true);
  });
  if (dialog.open && dialogId == dialogCloseId) {
    dialog.parentElement?.close(true);
    dialog.addEventListener(dialogClose, ()=> {
      dialog.btnOpening = trigger;
      dialog.parentElement?.open();
    }, { once: true });
  } else {
    $id4(dialogCloseId)?.parentElement?.close();
    dialog.btnOpening = trigger;
    let expanded = 'false';
    // Toggle logic
    if (dialog.open) {
      dialog.parentElement.close();
    } else {
      expanded = 'true';
      dialog.parentElement.open();
    }
    $$4(`[aria-controls="${dialogId}"]`).forEach((_btn) => _btn.setAttribute('aria-expanded', 'false'));
    trigger.setAttribute('aria-expanded', expanded);
  }
});

class Drawer extends DialogComponent {
  #indent;
  #clipPath;
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
    this.#indent = this.dialog.classList.contains('hdt-drawer--indent');
  }
  /**
   * @param {string} pos
   */
  set transform(pos) {
    this._transform = ['translate3d(0, 0, 0)'];
    if (pos === 'right') {
      this._transform.push(`translate3d(${isRTL ? '-' : ''}100%, 0, 0)`);
    } else if (pos === 'bottom') {
      this._transform.push('translate3d(0, 100%, 0)');
    } else if (pos === 'top') {
      this._transform.push('translate3d(0, -100%, 0)');
    } else {
      this._transform.push(`translate3d(${isRTL ? '' : '-'}100%, 0, 0)`);
    }
  }
  set clipPath(pos) {
    this.#clipPath = ['inset(0% 0% 0% 0% round var(--rounded-sm))'];
    if (pos === 'right') {
      this.#clipPath.push(`inset(0% ${isRTL ? '100%' : '0%'} 0% ${isRTL ? '0%' : '100%'} round var(--rounded-sm))`);
    } else if (pos === 'bottom') {
      this.#clipPath.push(`inset(0% 0% 100% 0% round var(--rounded-sm))`);
    } else if (pos === 'top') {
      this.#clipPath.push(`inset(100% 0% 0% 0% round var(--rounded-sm))`);
    } else {
      this.#clipPath.push(`inset(0% ${isRTL ? '0%' : '100%'} 0% ${isRTL ? '100%' : '0%'} round var(--rounded-sm))`);
    }
  }
  get pos() {
    const arr = (this.dialog.getAttribute('pos-min-width') || '').split(':');
    return arr[1] && window.innerWidth >= Number(arr[0]) ? arr[1] : this.dialog.getAttribute('pos') || 'left';
  }
  get show() {
    if (this.#indent) {
      this.clipPath = this.pos;
    } else {
      this.transform = this.pos;
    }
    if (!this.hasAttribute('show-min-width')) {
      this._openedAsModal = true;
      return this.dialog.showModal();
    }
    this._openedAsModal = window.innerWidth < this.minWidth;
    const savedScroll = window.scrollY;
    this.dialog.toggleAttribute('open-as-modal', this._openedAsModal);
    this._openedAsModal ? this.dialog.showModal() : this.dialog.show();
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScroll);
    });
    return true;
  }
  get minWidth() {
    return Number(this.getAttribute('show-min-width')) || 768;
  }
  get _children() {
    return Array.from(this.dialog.firstElementChild.children);
  }
  animateDialogOpen() {
    if (this.#indent) {
      return animate([
        [this._children, { visibility: 'hidden', opacity: 0 }, { duration: 0 }],
        [this.dialog.firstElementChild, { clipPath: this.#clipPath.reverse() }, { duration: 0.35, ease: "easeOut" }],
        [this._children, { visibility: ["hidden", "visible"], opacity: [0, 1] }, { duration: 0.15, ease: "ease", at: "-0.15" }],
      ])
    }
    return animate(this.dialog, {
      transform: this._transform.reverse()
    }, {
      duration: 0.5,
      ease: [0.19, 1, 0.22, 1]
    });
  }
  animateDialogClose() {
    if (this.#indent) {
      return animate([
        [this._children, { visibility: ["visible", "hidden"], opacity: [1, 0] }, { duration: 0.15, ease: "ease" }],
        [this.dialog.firstElementChild,{ clipPath: this.#clipPath.reverse() }, { duration: 0.3, ease: "easeOut", at: "-0.05" }],
      ])
    }
    return animate(this.dialog, {
      transform: this._transform.reverse()
    }, {
      duration: 0.4,
      ease: [0.19, 1, 0.22, 1]
    });
  }
}
class Modal extends DialogComponent {
  animateDialogOpen() {
    return animate(this.dialog, {
      opacity: [0, 1],
      x: [-100, 0],
    }, {
      duration: 0.45,
      ease: [0.19, 1, 0.22, 1]
    });
  }
  animateDialogClose() {
    return animate(this.dialog, {
      opacity: [1, 0],
      x: [0, 80]
    }, {
      duration: 0.45,
      ease: [0.19, 1, 0.22, 1]
    });
  }
}

import { computePosition, shift, flip, offset, arrow } from "@theme/floating";
var _translate_by_dpr = new WeakSet(), translate_by_dpr_fn,
_round_by_dpr = new WeakSet(), round_by_dpr_fn,
_dpr = window.devicePixelRatio || 1;
class BaseFloating extends DialogComponent {
  #config;
  constructor() {
    super();
    getterAdd(_translate_by_dpr, this);
    getterAdd(_round_by_dpr, this);
  }
  // connectedCallback() {
  //   super.connectedCallback();
  //   console.log(this.#referenceEl, this.#floatingEl);
  // }
  async updatePos(useTranslate = true) {
    return computePosition(this.#referenceEl, this.#floatingEl, {
      //placement: getPlacement(_placement),
      placement: this.#placement,
      //strategy: 'fixed',
      middleware: [
        offset(this.#offset),
        this.enableFlip && flip({
          fallbackPlacements: ['top', 'bottom', 'left', 'right'],
          //fallbackPlacements: ['top', 'bottom'],
        }),
        shift({padding: 5}),
        this.#arrowEl && arrow({
          element: this.#arrowEl,
        })
      ]
    }).then(({x, y, placement, middlewareData}) => {
      // console.log('placement  :', placement, middlewareData);
      if (this.onlyFlipFirst && this.enableFlip) {
        this._placement = placement;
        this.setAttribute('first-placement', placement);
      }
      this.setAttribute('data-placement', placement);
      if (useTranslate) {
        this.objStyle = {
          top: '0',
          left: '0',
          transform: getterRunFn(_translate_by_dpr, this, translate_by_dpr_fn).call(this, x, y),
        }
      } else {
        this.objStyle = {
          left: `${x}px`,
          top: `${y}px`,
        };
      }
      Object.assign(this.#floatingEl.style, this.objStyle);
      //console.log(middlewareData.arrow)
      if (middlewareData.arrow && this.#arrowEl) {
        const {x: arrowX, y: arrowY} = middlewareData.arrow;
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[placement.split('-')[0]];

        Object.assign(this.#arrowEl.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          right: '',
          bottom: '',
          [staticSide]: this.#staticSide,
        });
      }
      return this.objStyle;
    });
  }
  get config() {
    return this.#config ??= JSON.parse(this.getAttribute("config") || '{}');
  }
  get onlyFlipFirst() {
    return this.hasAttribute('only-flip-first');
  }
  get enableFlip() {
    return !this.hasAttribute('first-placement');
  }
  get #referenceEl() {
    return this.dialog.btnOpening;
  }
  get #floatingEl() {
    return this.dialog;
  }
  get #placement() {
    return this.enableFlip ? this.getAttribute("placement") || 'bottom' : this._placement;
  }
  get #arrowEl() {
    return this._arrowEl ??= $4('.hdt-popover__arrow', this);
  }
  get #offset() {
    return parseInt(this.config.offset || 14);
  }
  get #staticSide() {
    return this.config.staticSide || '-5px';
  }
};
round_by_dpr_fn = function(value) {
  return Math.round(value * _dpr) / _dpr;
};
translate_by_dpr_fn = function(x, y) {
  return _dpr > 1 ? `translate3d(${getterRunFn(_round_by_dpr, this, round_by_dpr_fn).call(this, x)}px,${getterRunFn(_round_by_dpr, this, round_by_dpr_fn).call(this, y)}px,0)` : `translate(${getterRunFn(_round_by_dpr, this, round_by_dpr_fn).call(this, x)}px,${getterRunFn(_round_by_dpr, this, round_by_dpr_fn).call(this, y)}px)`;
};
class Popover extends BaseFloating {
  #controller;
  #clipPath;
  constructor() {
    super();
  }
  get minWidth() {
    return Number(this.getAttribute('popover-active-min-width')) || 768;
  }
  get show() {
    this._openedAsModal = window.innerWidth < this.minWidth;
    const {scrollY} = window;
    this.dialog.toggleAttribute('open-as-modal', this._openedAsModal);
    this._openedAsModal ? this.dialog.showModal() : this.dialog.show();
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
    return true;
  }

  connectedCallback() {
    super.connectedCallback();

    this.#clipPath = ['inset(-5% 0 0 0)', 'inset(100% 0 0 0)'];
    this.dialog.addEventListener(dialogOpen, () => {
      this.#controller = new AbortController();
      const { signal } = this.#controller;
      document.addEventListener('click', (event)=> {
        if (!this._openedAsModal && !this.contains(event.target)) this.close();
      }, { signal });
      this.addEventListener("richlist:select", this.close.bind(this, false), { signal });
      // Add event esc when use method dialog.show
      if (!this._openedAsModal) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.dialog.open) {
            const event = new Event('cancel', { cancelable: true });
            this.dialog.dispatchEvent(event);
            if (!event.defaultPrevented) this.dialog.close();
          }
        }, { signal });
      }
    });
    this.dialog.addEventListener(dialogClosing, ()=> {
      this.#controller?.abort();
    });
    // if (this.hasAttribute('update-pos-when-hover-focus')) {
    //   const btnsOpen = $$4(`[aria-controls="${this.dialog.id}"]`);
    //   btnsOpen.forEach( (btn) => {
    //     hover(btn, () => {
    //       this.dialog.btnOpening = btn;
    //       this.updatePos();
    //     }, { once: true })
    //     btn.addEventListener('focus', () => {
    //       this.dialog.btnOpening = btn;
    //       this.updatePos();
    //     }, { once: true });
    //   });
    // }

    if (Shopify.designMode && !this.hasAttribute('un-detect')) {
      const shopifySection = this.closest(".shopify-section");
        shopifySection?.addEventListener(admEvts.select, (event) => {
          //console.log(event);
          if (event.target.getAttribute('aria-controls') === this.dialog.id) {
            this.dialog.btnOpening = event.target;
            this.open(!event.detail.load);
          }
        });
        shopifySection?.addEventListener(admEvts.deselect, (event) => {
          //console.log(event);
          if (event.target.getAttribute('aria-controls') === this.dialog.id) {
            this.close(true);
          }
        });
      // $4(`button[aria-controls="popover-${event.target.id}"]`).addEventListener(admEvts.select, (event) => this.open(!event.detail.load), { signal });
      // this.addEventListener(admEvts.deselect, () => this.close(true), { signal });
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller?.abort();
  }
  get #children() {
    return Array.from($4('.hdt-popover__body', this).children);
  }
  async animateDialogOpen() {
    if (this._openedAsModal) {
      // Object.assign(this.dialog.style, {
      //   top: null,
      //   left: '0px',
      //   right: null,
      //   bottom: '0px',
      //   transform: null,
      // });
      return animate([
        [this.dialog, { '--opacity': [0, 1] }, { duration: 0.5, ease: [0.19, 1, 0.22, 1] }],
        [this.dialog, { clipPath: this.#clipPath.reverse(), opacity: [0, 1], visibility: ["hidden", "visible"] }, { at: "<", duration: 0.4, ease: "easeOut" }],
        [this.#children, { opacity: [0, 1], y: ["0px", "0px"] }, { at: "-0.08", duration: 0.3, ease: "easeOut" }]
      ]);
    }

    if (this.hasAttribute('un-popover-trapFocus')) document.activeElement?.blur();
      const pos = await this.updatePos(this.dialog.btnOpening, this.dialog, this.arrowEl, this.placement),
      { transform } = pos;
    return animate([
      [this.dialog, { top: ["10px","0"], opacity: [0, 1], visibility: ["hidden", "visible"], transform: [transform, transform] }, { duration: 0.15 }],
      [this.#children, { opacity: 1 }, { at: "<", duration: 0.15 }]
    ]);
  }
  animateDialogClose() {
    if (this._openedAsModal) {
      return animate([
        [this.#children, { opacity: [1, 0], visibility: ["hidden", "visible"] }, { duration: 0.25, ease: "easeOut" }],
        [this.dialog, { clipPath: this.#clipPath.reverse() }, { at: "-0.1", duration: 0.3, ease: "easeOut" }],
        [this.dialog, { '--opacity': [1, 0] }, { at: "<+0.2", duration: 0.5, ease: "easeOut" }]
      ]);
    }
    return animate([
      [this.#children, { opacity: 0 }, { duration: 0.15 }],
      [this.dialog,{ top: ["0","10px"], opacity: [1, 0], visibility: ["visible", "hidden"] }, { at: "<", duration: 0.15 }]
    ]);
  }
  get updateFloating() {
    return this._openedAsModal ? false : this.updatePos();
  }
  trapFocus() {
    if (this.hasAttribute('un-popover-trapFocus') && !this._openedAsModal) return;
    super.trapFocus();
  }
}

class searchDrawer extends DialogComponent {

  connectedCallback() {
    super.connectedCallback();
  }
  animateDialogOpen() {
    if (matchMediaQuery("mobile")) {
      return animate(this, {}, { duration: 0 });
    } else {
      return animate(this.dialog, { opacity: [0, 1], transform: ["translateY(-20px)", "translateY(0px)"] }, { duration: 0.4, ease: "easeOut" });
    }
  }
  animateDialogClose() {
    const animation = animate(this.dialog, { opacity: [1, 0], y: [0, -20] }, { duration: 0.4, ease: "easeOut" });
    animation.then(() => {
      this.dialog.style.opacity = 1;
      this.dialog.style.transform = "translateY(0)";
    });
    return animation;
  }
}
class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = $4('input[type="search"]', this);
    this.resetButton = $4('button[type="reset"]', this);

    if (this.input) {
      this.input.form.addEventListener('reset', this.onFormReset.bind(this));
      this.input.addEventListener('input', debounce((event) => {
        this.onChange(event);
      }, 300).bind(this));

      // Prevent ESC from clearing text from <input type="search"> on Chrome
      // this.input.addEventListener('keydown', (event) => {
      //   if (this.input.value.length > 0 && event.key === 'Escape') event.preventDefault()
      // });
    }
  }

  toggleResetButton() {
    const resetIsHidden = this.resetButton.classList.contains('hidden');
    if (this.input.value.length > 0 && resetIsHidden) {
      this.resetButton.classList.remove('hidden');
    } else if (this.input.value.length === 0 && !resetIsHidden) {
      this.resetButton.classList.add('hidden');
    }
  }

  onChange() {
    this.toggleResetButton();
  }

  shouldResetForm() {
    return !$4('[aria-selected="true"] a', this);
  }

  onFormReset(event) {
    // Prevent default so the form reset doesn't set the value gotten from the url on page load
    event.preventDefault();
    // Don't reset if the user has selected an element on the predictive search dropdown
    if (this.shouldResetForm()) {
      this.input.value = '';
      if (this.hasAttribute('un-trapFocus')) {
        this.input.focus();
      } else {
        trapFocus(this.hasAttribute('as-dialog') ? this.closest('dialog') : this, this.input);
      }
      this.toggleResetButton();
    }
  }
}

class MainSearch extends SearchForm {
  constructor() {
    super();
    this.allSearchInputs = $$4('input[type="search"][name="q"]');
    this.setupEventListeners();
  }

  setupEventListeners() {
    let allSearchForms = [];
    this.allSearchInputs.forEach((input) => allSearchForms.push(input.form));
    this.input.addEventListener('focus', this.#onInputFocus.bind(this));
    this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
    document.body.addEventListener('click', this.onBodyClickEvent);

    if (allSearchForms.length < 2) return;
    allSearchForms.forEach((form) => form.addEventListener('reset', this.onFormReset.bind(this)));
    this.allSearchInputs.forEach((input) => input.addEventListener('input', this.#onInput.bind(this)));
  }

  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.#keepInSync('', this.input);
    }
  }

  #onInput(event) {
    const target = event.target;
    this.#keepInSync(target.value, target);
  }

  #onInputFocus() {
    const isSmallScreen = window.innerWidth < 750;
    if (isSmallScreen) {
      this.scrollIntoView({ behavior: 'smooth' });
    }
  }

  #keepInSync(value, target) {
    this.allSearchInputs.forEach((input) => {
      if (input !== target) input.value = value;
    });
    $$4('.hdt-reset-search__btn[type="reset"]').forEach((btn) => btn.classList.toggle('hidden', !value));
  }

  onBodyClick(event) {
    if (!this.contains(event.target)) this.closest('hdt-predictive-search')?.close(false);
  }
}

var suggestAPI;
class PredictiveSearch extends SearchForm {
  #controller;
  #buttonAllWrap;
  constructor() {
    super();
    suggestAPI = Shopify.locale == 'en';
    this.#supportPredictiveAPI();
    this.cachedResults = {};
    this.predictiveSearchResults = $4('[data-predictive-search]', this);
    this.allPredictiveSearchInstances = $$4('hdt-predictive-search');
    this.#buttonAllWrap = $4('#Drawer-search [all="predictive-search-form"]');
    this.isOpen = false;
    this.#controller = new AbortController();
    this.searchTerm = '';

    this.#setupEventListeners();
    this.predictiveSearchResults.attachShadow({ mode: "open" });
    this.predictiveSearchResults.shadowRoot.appendChild(document.createRange().createContextualFragment(`<slot name="search-results"></slot>`));
  }

  #setupEventListeners() {
    this.input.form.addEventListener('submit', this.#onFormSubmit.bind(this));

    this.input.addEventListener('focus', this.onFocus.bind(this));
    if (this.hasAttribute('un-trapFocus')) {
      this.addEventListener('focusout', this.#onFocusOut.bind(this));
      this.addEventListener('keydown', (evt)=> {
        if ( evt.key === 'Escape') this.close(false, true);
      });
    }
  }
  #supportPredictiveAPI () {
    if (suggestAPI) return;
    fetch(window.Shopify.routes.root + "search/suggest.json?q=nathan417&resources[type]=article&resources[options][fields]=title&resources[limit]=1")
      .then((res) => res.json())
      .then((res) => {
        suggestAPI = res.status != '417';
      }
    );
  }

  get query() {
    return this.input.value.trim();
  }

  get slotResults() {
    return $4('[slot="search-results"]', this);
  }

  onChange() {
    super.onChange();
    const newSearchTerm = this.query;
    if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
      // Remove the results when they are no longer relevant for the new search term
      // so they don't show up when the dropdown opens again
      //$4('#predictive-search-results-groups-wrapper', this)?.remove();
      this.slotResults.innerHTML = "";
    }
    // Update the term asap, don't wait for the predictive search query to finish loading
    // this.updateSearchForTerm(this.searchTerm, newSearchTerm);
    this.searchTerm = newSearchTerm;
    if (!this.searchTerm.length) {
      this.close(true);
      return;
    }

    this.#getSearchResults(this.searchTerm);
  }

  #onFormSubmit(event) {
    if (!this.query.length || $4('[aria-selected="true"] a', this)) event.preventDefault();
  }

  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.searchTerm = '';
      this.#controller.abort();
      this.#controller = new AbortController();

      animate(this.slotResults, { opacity: [1, 0], y: [0, 30] }, { duration: 0.45, ease: "easeIn" }).then(() => {
        this.#closeResults(true);
      });
    }
  }

  onFocus() {
    const currentSearchTerm = this.query;

    if (!currentSearchTerm.length) return;

    if (this.searchTerm !== currentSearchTerm) {
      // Search term was changed from other search input, treat it as a user change
      this.onChange();
    } else if (this.getAttribute('results') === 'true') {
      this.open();
    } else {
      this.#getSearchResults(this.searchTerm);
    }
  }

  #onFocusOut() {
    //console.log('onFocusOut', document.activeElement, event)
    setTimeout(() => {
      if (!this.contains(document.activeElement) ) this.close(false, true);
    });
  }

  #getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(' ', '-').toLowerCase();
    this.#setLiveRegionLoadingState();

    if (this.cachedResults[queryKey]) {
      this.#renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    fetch(`${window.Shopify.routes.root}search${suggestAPI ? '/suggest' : ''}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search${suggestAPI ? '&resources[options][fields]=title,product_type,variants.title,vendor,variants.sku,tag&resources[limit]=10&resources[limit_scope]=each' : '&options[prefix]=last'}`, {
      signal: this.#controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }
        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html');
        // Save bandwidth keeping the cache in all instances synced
        this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
          predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
        });
        this.#renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        if (error?.code === 20) return; // Code 20 means the call was aborted
        this.close();
        throw error;
      });
  }

  #setLiveRegionLoadingState() {
    this.statusElement ??= $4('.hdt-predictive-search-status', this);
    this.loadingText ??= this.getAttribute('data-loading-text');
    this.#setLiveRegionText(this.loadingText);
    this.setAttribute('loading', true);
  }

  #setLiveRegionText(statusText) {
    this.statusElement.setAttribute('aria-hidden', 'false');
    this.statusElement.textContent = statusText;

    setTimeout(() => {
      this.statusElement.setAttribute('aria-hidden', 'true');
    }, 1000);
  }

  #renderSearchResults(resultsMarkup) {
    this.slotResults.replaceChildren(...document.importNode( $4('#shopify-section-predictive-search', resultsMarkup), true).children);
    this.setAttribute('results', true);

    this.#setLiveRegionResults();
    this.open();
    animate(this.slotResults, { opacity: [0, 1], y: [30, 0] }, { duration: 0.45, ease: "easeOut" }).then(() => {
      this.#buttonAllWrap?.toggleAttribute('hidden', !$4('[type="submit"][form="predictive-search-form"]', resultsMarkup));
      if (!this.hasAttribute('un-trapFocus')) trapFocus(this.hasAttribute('as-dialog') ? this.closest('dialog') : this, this.input);
    });
  }

  #setLiveRegionResults() {
    this.removeAttribute('loading');
    this.#setLiveRegionText($4('[search-live-region-count]', this).textContent);
  }

  // #getResultsMaxHeight() {
  //   this.resultsMaxHeight = `${window.innerHeight - 40}px`;
  //   return this.resultsMaxHeight;
  // }

  open() {
    //this.predictiveSearchResults.style.maxHeight = this.resultsMaxHeight || `${this.#getResultsMaxHeight()}px`;
    //this.parentElement?.style.setProperty("--hdt-search-mh", this.resultsMaxHeight || this.#getResultsMaxHeight());
    this.setAttribute('open', true);
    this.input.setAttribute('aria-expanded', true);
    this.isOpen = true;
  }

  close(clearSearchTerm = false, closeDialog = false) {
    this.#closeResults(clearSearchTerm, closeDialog);
    this.isOpen = false;
  }

  #closeResults(clearSearchTerm = false, closeDialog = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('results');
      this.#buttonAllWrap?.setAttribute('hidden', '');
      if (!this.hasAttribute('un-trapFocus')) {
        requestAnimationFrame(() => {
          trapFocus(this.hasAttribute('as-dialog') ? this.closest('dialog') : this, this.input);
        });
      }
    }

    $4('[aria-selected="true"]', this)?.setAttribute('aria-selected', false);
    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('loading');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', false);
    // this.resultsMaxHeight = false;
    //this.predictiveSearchResults.removeAttribute('style');
    //this.parentElement?.style.removeProperty("--hdt-search-mh");
    if (closeDialog && this.hasAttribute('as-dialog')) this.closest('dialog')?.close();
    if (!this.hasAttribute('un-trapFocus')) removeTrapFocus();
  }
}
class appendToBody extends HTMLElement {
  constructor() {
    super();
    if ( window.innerWidth < 768 && this.hasAttribute('desktop')) return;
    if (this.hasAttribute('not-idle')) {
      this.#run();
    } else {
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      idle(this.#run);
    }
  }
  get #target() {
    return this.hasAttribute('host') ? this.parentElement : document.body;
  }
  get #key() {
    return this.getAttribute('key');
  }
  #run = () => {
    //if (!this.hasAttribute('lazy') && document.body === this.firstElementChild.parentNode) return;
    const tpl = $4(':scope > template', this);
    const fragment = document.createDocumentFragment();

    if (tpl) {
      fragment.append(tpl.content.cloneNode(true));
    } else {
      fragment.append(...this.childNodes);
    }
    if (Shopify.designMode && this.#key) {
      $$4(`[data-hdt-key="${this.#key}"]`).forEach(el => el.remove());
      fragment.firstElementChild?.setAttribute('data-hdt-key', this.#key);
    }
    this.#target.appendChild(fragment);
    this.remove();
  }
}
class LazyReplace extends HTMLElement {
  connectedCallback() {
    inView(this.closest('.hdt-section') || this, ()=> {
      const template = $4('template', this);
      if (template) this.replaceWith(template.content.cloneNode(true));
    }, { margin: "300px" })
  }
}

customElements.define('hdt-popover', Popover);
customElements.define("hdt-search-drawer", searchDrawer);
customElements.define('hdt-search-form', SearchForm);
customElements.define('hdt-predictive-search', PredictiveSearch);
customElements.define('hdt-main-search', MainSearch);
customElements.define("hdt-append-body", appendToBody);
customElements.define("hdt-lazy-replace", LazyReplace);
const _resizeObserver_tabs = new WeakMap();
class Tabs extends HTMLElement {
  #selected;
  panels = [];
  tabs = [];
  #controller;
  #supportKeydown;
  #x;
  #y;
  #w;
  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).appendChild($4("template", this).content.cloneNode(true));
    }
    this.index = 0;
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.#supportKeydown = !this.hasAttribute('disable-keydown');
    this.tabs = this.$PartName('hdt-tabs-slot').assignedNodes({ flatten: true }).filter((el) => el.tagName === 'BUTTON');
    this.panels = this.$PartName('hdt-tabs-content-slot').assignedNodes({ flatten: true }).filter((el) => el.nodeType === Node.ELEMENT_NODE && el.tagName !== 'TEMPLATE');
    if (this.tabs.length == 0) return;
    const { signal } = this.#controller;
    this.$PartName('hdt-tabs-slot').addEventListener('click', this.#onTitleClick.bind(this), { signal })
    if (this.#supportKeydown) this.$PartName('hdt-tabs-slot').addEventListener('keydown', this.#onKeyDown.bind(this), { signal });
    if (!this.hasAttribute('not-init')) this.selectTab(0);  // Set the initial position of the ink bar
    var lastWidth = this.offsetWidth;
    getterAdd(_resizeObserver_tabs, this, new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target !== this) continue;
        if (entry.contentRect.width !== lastWidth) {
          lastWidth = entry.contentRect.width;
          this.selectTab(this.index);
        }
      }
    }));
    getterGet(_resizeObserver_tabs, this).observe(this);
    this.#x = springValue('0px');
    this.#y = motionValue('0px');
    this.#w = springValue('0px');
    styleEffect(this, { "--ink-bar-w": this.#w, "--ink-bar-x": this.#x, "--ink-bar-y": this.#y });
  }
  disconnectedCallback() {
    this.#controller.abort();
    getterGet(_resizeObserver_tabs, this)?.disconnect();
  }
  $PartName(name) {
    return this.shadowRoot?.querySelector(`[part="${name}"]`);
  }
  get selected() {
    return this.#selected;
  }
  set selected(idx) {
    this.#selected = idx;
    this.selectTab(idx);

    // Updated the element's selected attribute value when
    // backing property changes.
    this.setAttribute('selected', idx);
  }
  selectTab(idx = null) {
    let oldIndex = this.index;
    const selectedTab = this.tabs[idx];
    if (!selectedTab || idx == oldIndex) return;
    this.#x.set(`${selectedTab.offsetLeft}px`);
    this.#y.set(`${selectedTab.offsetTop + selectedTab.offsetHeight - 1}px`);
    this.#w.set(`${selectedTab.offsetWidth}px`);
    animate(this.panels[oldIndex], { opacity: [1, 0], transform: ["translateY(0px)", `translateY(30px)`] }, { duration: 0.35, ease: "easeIn" }).then(() => {
      this.panels[oldIndex].hidden = true;
      this.panels[idx].hidden = false;
      animate(this.panels[idx], { opacity: [0, 1], transform: [`translateY(20px)`, "translateY(0px)"] }, { duration: 0.45, ease: "easeOut" });
      for (let [i, tab] of this.tabs.entries()) {
        const select = i === idx;
        if (this.#supportKeydown) tab.setAttribute('tabindex', select ? 0 : -1);
        tab.setAttribute('aria-selected', select);
        tab.setAttribute('aria-current', select);
        this.panels[i].setAttribute('aria-hidden', !select);
        this.panels[i].hidden = !select;
      }
    });
    this.index = idx || 0;
  }
  #onTitleClick(e) {
    if (e.target.slot === 'title') {
      this.selected = this.tabs.indexOf(e.target);
      e.target.focus();
    }
  }
  #onKeyDown(e) {
    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        var idx = this.selected - 1;
        idx = idx < 0 ? this.tabs.length - 1 : idx;
        this.tabs[idx].click();
        break;
      case 'ArrowRight':
        e.preventDefault();
        var idx = this.selected + 1;
        this.tabs[idx % this.tabs.length].click();
        break;
      default:
        break;
    }
  }
}
customElements.define('hdt-tabs', Tabs);
class TabsCarousel extends HTMLElement {
  #slider;
  #controller;
  #tabs;
  #panels;
  #oldIndex = 0;
  #x;
  #y;
  #w;
  connectedCallback() {
    this.#slider = $4('hdt-slider', this);
    if (!this.#slider) return;
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this.#tabs = $$4('button[role="tab"]', this.#slider);
    this.#panels = $$4('[role="tabpanel"]', this);

    this.#slider.addEventListener('reInit', () => this.#updateInkBar(true, null, this.#oldIndex), { signal });
    this.#tabs.forEach( (tab, index) => {
      tab.addEventListener('click', () => this.#updateInkBar(false, tab , index), { signal });
    });
    this.#x = springValue('0px');
    this.#y = motionValue('0px');
    this.#w = springValue('0px');
    styleEffect(this, { "--ink-bar-w": this.#w, "--ink-bar-x": this.#x, "--ink-bar-y": this.#y });
  }
  disconnectedCallback() {
    this.#controller?.abort();
  }
  #updateInkBar(init = false, tab = null, index = 0) {
    const selectedTab = tab || this.#tabs[index];
    if (!init && (!selectedTab || index == this.#oldIndex)) return;
    this.#y.set(`${selectedTab.offsetTop + selectedTab.offsetHeight - 1}px`);
    this.#x.set(`${selectedTab.getBoundingClientRect().left - this.#slider.getBoundingClientRect().left}px`);
    this.#w.set(`${selectedTab.offsetWidth}px`);
    if (init) return;

    animate(this.#panels[this.#oldIndex], { opacity: [1, 0], transform: ["translateY(0px)", `translateY(15px)`] }, { duration: 0.35, ease: "easeIn" }).then(() => {
      this.#panels[this.#oldIndex].hidden = true;
      this.#panels[index].hidden = false;
      animate(this.#panels[index], { opacity: [0, 1], transform: [`translateY(15px)`, "translateY(0px)"] }, { duration: 0.45, ease: "easeOut" });
      for (let [i, tab] of this.#tabs.entries()) {
        const select = i === index;
        tab.setAttribute('aria-selected', select);
        tab.setAttribute('aria-current', select);
        this.#panels[i].setAttribute('aria-hidden', !select);
        this.#panels[i].hidden = !select;
      }
    });
    this.#oldIndex = index;
  }
}
customElements.define('hdt-tabs-carousel', TabsCarousel);

// const defaultStickyConfig = {
//   type: 'auto',
//   stretch: false,
//   resize: true,
//   indents: {
//       top: 0,
//       bottom: 0
//   },
//   window: {
//       min: 768,
//       max: null
//   }
// };
// class HdtSticky extends HTMLElement {
//   constructor() {
//       super();
//       this.options = Object.assign({}, defaultStickyConfig, JSON.parse(this.getAttribute('config') || '{}'));
//       this.location = undefined;
//       this.freeplace = 0;
//       this.scroll = 0;
//   }

//   connectedCallback() {
//       this.init();
//   }

//   calcPosition() {
//       this.freeplace = window.innerHeight - this.options.indents.top - this.options.indents.bottom;

//       if (this.options.type === 'auto') {
//           if (this.clientHeight < this.freeplace) {
//               this.location = 'top';
//           } else {
//               this.location = 'bottom';
//           }
//       } else {
//           this.location = this.options.type;
//       }
//       switch (this.location) {
//           case 'top':
//               this.scroll = this.options.indents.top;
//               break;

//           case 'bottom':
//               this.scroll = window.innerHeight - this.clientHeight - this.options.indents.bottom;
//               break;

//           default:
//               console.error(`Invalid position: "${this.options.type}". Available positions: "auto", "top", "bottom".`);
//       }
//   }

//   stickBlock() {
//     this.style.position = 'sticky';
//     this.style.top = `${this.scroll}px`;
//     if (this.options.stretch && this.location === 'top') this.style.minHeight = `${this.freeplace}px`;
//   }

//   windowResize() {
//       if (!this.options.resize) return;
//       let currentWindowHeight = window.innerHeight;
//       window.addEventListener('resize', (e) => {
//           if (this.options.window.min && window.innerWidth < this.options.window.min) return;
//           if (this.options.window.max && window.innerWidth > this.options.window.max) return;

//           if (e.target.innerHeight > currentWindowHeight || e.target.innerHeight < currentWindowHeight) {
//               currentWindowHeight = e.target.innerHeight;
//               this.calcPosition();
//               this.stickBlock();
//           }
//       });
//   }

//   update() {
//       this.calcPosition();
//       this.stickBlock();
//   }

//   init() {
//       this.windowResize();
//       if (this.options.window.min && window.innerWidth < this.options.window.min) return;
//       if (this.options.window.max && window.innerWidth > this.options.window.max) return;
//       this.calcPosition();
//       this.stickBlock();
//   }
// };
// customElements.define('hdt-sticky', HdtSticky);
/**
 * A smart sticky component that handles content longer than the viewport.
 * It automatically calculates a negative 'top' value so that the bottom
 * of the element sticks to the bottom of the screen.
 */
class SafeSticky extends HTMLElement {
  #resize;
  constructor() {
    super();
  }

  connectedCallback() {
    //this.#resize = resize(this, () => this.#recalculatePosition())
    //console.log(this.offsetHeight, window.innerHeight)
    this.#resize = resize(this, () => this.toggleAttribute('is-hdt-safe-bottom', this.offsetHeight > window.innerHeight))
  }

  disconnectedCallback() {
    if (this.#resize) this.#resize();
  }

  /**
   * Recalculates the sticky top position based on element and viewport height.
   */
  // #recalculatePosition() {
  //   frame.render(() => {
  //     const viewportHeight = window.innerHeight;
  //     const elementHeight = this.offsetHeight;
  //     let top = 0;
  //     if (elementHeight > viewportHeight) {
  //       // If content is longer than screen, stick to the bottom
  //       // Formula: top = viewport - element_height
  //      top = viewportHeight - elementHeight;
  //     }
  //     this.style.setProperty('--hdt-safe-top', `${top}px`);
  //     this.style.setProperty('--hdt-safe-logic', top == 0 ? 1 : -1);
  //   })
  // }
}
customElements.define("hdt-safe-sticky", SafeSticky);

/**
* 11.1 Modal
* -----------------------------------------------------------------------------
*/

class MenuDrawer extends Drawer {
  constructor() {
    super();
  }

  animateDialogOpen() {
    const menu = $4(".hdt-menu-drawer__nav:not([hidden]), .hdt-menu-drawer__panel:not([hidden])", this),
    links = $$4("li", menu);
    //console.log('transform open: ', this._transform)
    return animate([
      [this.dialog, { transform: this._transform.reverse() }, { duration: 0.3, at: "<", ease: "easeOut" }],
      [links, { opacity: [0, 1],transform: ["translateX(-10px)", "translateX(0)"] }, { duration: 0.15, delay: stagger(links.length < 15 ? 0.08 : 0.035), ease: "easeOut" }],
      [$4(".hdt-menu-drawer-footer", this), { opacity: [0, 1],transform: ["translateX(-12px)", "translateX(0)"] }, { duration: 0.3, ease: "easeOut" }]
    ]);
  }
  animateDialogClose() {
    const menu = $4(".hdt-menu-drawer__nav:not([hidden]), .hdt-menu-drawer__panel:not([hidden])", this),
    links = $$4("li", menu);
    //console.log('transform close: ', this._transform)
    const delayTotal = 0.15 + (links.length < 10 ? 0.07 : 0.035) * links.length;
    //console.log(delayTotal)
    return animate([
      [links, { opacity: [1, 0],transform: ["translateX(0)", "translateX(-10px)"] }, { duration: 0.15, delay: stagger(links.length < 10 ? 0.07 : 0.035), ease: "easeIn" }],
      [$4(".hdt-menu-drawer-footer", this), { opacity: [1, 0],transform: ["translateX(0)", "translateX(-12px)"] }, {  at: "-0.035", duration: 0.3, ease: "easeIn" }],
      [this.dialog, { transform: this._transform.reverse() }, { at: `-${delayTotal*0.5}`, duration: 0.3, ease: "easeIn"  }],
    ]);
  }
};

var _menu_drawer = new WeakMap(), _menu_drawer_prev = new WeakMap(), _menu_drawer_title = new WeakMap(),
_menu_open_panel = new WeakSet(), menu_open_panel_fn,
_menu_panel_prev = new WeakSet(), menu_close_panel_fn;
class MenuPanel extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_menu_drawer, this, $4('#menu-drawer'));
    getterAdd(_menu_panel_prev, this);
    getterAdd(_menu_open_panel, this);
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    $4(`[panel-id="${this.id}"]`, this.menuDrawer)?.addEventListener('click', getterRunFn(_menu_open_panel, this, menu_open_panel_fn).bind(this), { signal });
    if (!this.hidden) this.btnPrev?.addEventListener('click', getterRunFn(_menu_panel_prev, this, menu_close_panel_fn).bind(this), { once: true, signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
    this.abortController?.abort();
  }
  get menuDrawer() {
    return getterGet(_menu_drawer, this, $4('#menu-drawer'))
  }
  get btnPrev() {
    return getterGet(_menu_drawer_prev, this, $4('.hdt-menu-drawer__prev', this.menuDrawer));
  }
  get title() {
    return getterGet(_menu_drawer_title, this, $4('.hdt-menu-drawer__title', this.menuDrawer));
  }
};
menu_open_panel_fn = async function(e) {
  e.preventDefault();
  const target = e.target.tagName === 'A' ? e.target : e.target.closest('a'),
  linksPrev = $$4("li", target.closest('.hdt-menu-drawer__nav')),
  links = $$4("li,[reveal]", this);
  this.title.textContent = target.textContent;
  animate(this.title, { opacity: [0, 1],transform: ["translateY(-10px)", "translateY(0)"] }, { duration: 0.15, ease: "easeOut" });
  animate(this.btnPrev, { opacity: [0, 1],transform: ["translateY(-10px)", "translateY(0)"] }, { duration: 0.15, ease: "easeOut", at: "-0.15" });
  await animate(linksPrev, { opacity: [1, 0],transform: ["translateX(0)", "translateX(-10px)"] }, { duration: 0.15, at: "-0.15", delay: stagger(linksPrev < 10 ? 0.07 : 0.035), ease: "easeIn" });
  target.closest('.hdt-menu-drawer__nav').setAttribute('hidden', '');
  $4(`#${target.getAttribute('panel-id')}`).removeAttribute('hidden');
  animate(links, { opacity: [0, 1],transform: ["translateX(-10px)", "translateX(0)"] }, { duration: 0.15, delay: stagger(links > 15 ? 0.08 : 0.035), ease: "easeOut" });
  this.abortController = new AbortController();
  this.btnPrev?.addEventListener('click', getterRunFn(_menu_panel_prev, this, menu_close_panel_fn).bind(this), { signal: this.abortController.signal });
};
menu_close_panel_fn = async function() {
  if (this.hidden) return;
  const links = $$4(".hdt-menu-drawer__nav li", this.menuDrawer),
  linksPrev = $$4("li", this);
  animate(this.title, { opacity: [1, 0],transform: ["translateY(0)", "translateY(-10px)"] }, { duration: 0.15, ease: "easeOut" });
  animate(this.btnPrev, { opacity: [1, 0],transform: ["translateY(0)", "translateY(-10px)"] }, { duration: 0.15, ease: "easeOut", at: "-0.15" });
  await animate(linksPrev, { opacity: [1, 0],transform: ["translateX(0)", "translateX(-10px)"] }, { duration: 0.15, delay: stagger(linksPrev < 10 ? 0.07 : 0.035), ease: "easeIn" });
  this.setAttribute('hidden', '');
  $4('.hdt-menu-drawer__nav', this.menuDrawer).removeAttribute('hidden');
  animate(links, { opacity: [0, 1],transform: ["translateX(-10px)", "translateX(0)"] }, { duration: 0.15, delay: stagger(links > 15 ? 0.08 : 0.035), ease: "easeOut" });
  this.abortController?.abort();
};

var _cart_update = new WeakSet(), cart_update_fn,
_cart_reload = new WeakSet(), cart_reload_fn,
_cart_pageshow = new WeakSet(), cart_pageshow_fn,
_cart_section_id = new WeakMap();
function isBackForward() {
  return (typeof window.performance != 'undefined' && window.performance.getEntriesByType("navigation")[0].type === 'back_forward');
};
class CartDrawer extends Drawer {
  #controller;
  constructor() {
    super();
    getterAdd(_cart_update, this);
    getterAdd(_cart_reload, this);
    getterAdd(_cart_pageshow, this);
    getterAdd(_cart_section_id, this, this.getAttribute('section-id'));
  }
  connectedCallback() {
    super.connectedCallback();
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    document.addEventListener(cartUpdate, getterRunFn(_cart_update, this, cart_update_fn).bind(this), { signal });
    document.addEventListener(cartTab, getterRunFn(_cart_reload, this, cart_reload_fn).bind(this), { signal });
    document.addEventListener(cartReload, getterRunFn(_cart_reload, this, cart_reload_fn).bind(this), { signal });
    window.addEventListener("pageshow", getterRunFn(_cart_pageshow, this, cart_pageshow_fn).bind(this), { signal });

    this.dialog.addEventListener(dialogOpening, () => {
      $4('.hdt-marquee', this)?._animation?.play();
    }, { signal });
    this.dialog.addEventListener(dialogClosing, () => {
      $4('.hdt-marquee', this)?._animation?.pause();
    }, { signal });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller.abort();
  }
  get sectionId() {
    return getterGet(_cart_section_id, this) || 'cart-drawer';
  }
  get sectionsToRender() {
    return [
      {
        id: this.sectionId
      },
      {
        id: 'cart-json'
      }
    ];
  }

  /**
   * @param {any} element
   */
  // set focusElement(element) {
  //   this._focusElement = element;
  // }
  // get focusElement() {
  //   return this._focusElement ? this._focusElement : document.activeElement;
  // }
};
cart_update_fn = async function(event) {
  //console.log(cartUpdate, event.detail)
  const {cartData, source, actionAfterATC, name, index} = event.detail,
  {item_count} = cartData,
  cartdrawerDom = new DOMParser().parseFromString(cartData.sections[this.sectionId], "text/html");
  let animation;
  if (item_count == 0) {
    const sequence    = [],
          shippingBar = $4('.hdt-free-shipping-bar', this);
    if (shippingBar) sequence.push([$4('.hdt-free-shipping-bar', this), { opacity: [1, 0] }, { duration: 0.15, ease: "easeIn" }]);
     sequence.push(
      [$4('.hdt-cart-drawer-items', this), { opacity: [1, 0], y: [0, 30] }, { duration: 0.25, ease: "easeIn", ...(shippingBar && { at: "<" }) }],
      [$4('.hdt-cart-drawer__footer', this), { opacity: [1, 0], y: [0, 30] }, { duration: 0.25, ease: "easeIn", at: 0.15 }]);
    animation = animate(sequence);
  } else {
    animation = animate(this, {}, { duration: 0 })
  }
  await animation;
  this.dialog.classList.toggle('is-empty', item_count == 0);

  // update gift wrap
  //$4('[aria-controls="CartDrawer-Gift"]', this)?.toggleAttribute('hidden', $4('.is-gift-wrap', cartdrawerDom));
  const giftWrap = $4('.hdt-cart-gift-wrap', this);
  giftWrap?.toggleAttribute('hidden', $4('.is-gift-wrap', cartdrawerDom));
  if (giftWrap?.hidden) $4('[type="checkbox"]', giftWrap).checked = false;

  const selectors = ['.hdt-free-shipping-bar', '.hdt-cart-drawer-empty', '#CartDrawer-CartItems', '#CartDrawer-complementary', '.hdt-cart__discount', '.js-contents'];
  for (const selector of selectors) {
    const targetElement = $4(selector, this);
    const sourceElement = $4(selector, cartdrawerDom);
    if (!targetElement || !sourceElement) continue;
    if (selector == selectors[0]) {
      const newInventoryBlock = $4('.hdt-x-progress', sourceElement),
      valuenow = newInventoryBlock.getAttribute("value");
      newInventoryBlock.removeAttribute('reveal-in-view');
      newInventoryBlock.setAttribute('disable-intial', '');
      newInventoryBlock.setAttribute("value", $4('.hdt-x-progress', targetElement).value);
      //$4('.hdt-progress-bar', sourceElement).style.setProperty('--progress-rate', $4('.hdt-progress-bar', targetElement).style.getPropertyValue('--progress-rate'));
      targetElement.replaceWith(sourceElement);
      newInventoryBlock.value = valuenow;
      //$4('.hdt-progress-bar', this).now = $4('.hdt-progress-bar', sourceElement).getAttribute('aria-valuenow');
    } else if (selector != selectors[3]) {
      targetElement.replaceWith(sourceElement);
    } else if ( targetElement.dataset.id !== sourceElement.dataset.id ) {
      targetElement.replaceWith(sourceElement);
    }
  }
  if (item_count == 0) {
    this.isEmpty = true;
    animate([
      [$4('.hdt-inner-cart-drawer-empty', this), { opacity: [0, 1], transform: ["translateY(30px)", "translateY(0)"] }, { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }],
    ]);
  } else if (this.isEmpty) {
    this.isEmpty = false;
    const sequence    = [],
          shippingBar = $4('.hdt-free-shipping-bar', this);
    if (shippingBar) sequence.push([$4('.hdt-free-shipping-bar', this), { opacity: [0, 1] }, { duration: 0.15, ease: "easeOut" }]);
    sequence.push(
      [$4('.hdt-cart-drawer-items', this), { opacity: [0, 1], y: [30, 0] }, { duration: 0.25, ease: "easeOut", ...(shippingBar && { at: "<" }) }],
      [$4('.hdt-cart-drawer__footer', this), { opacity: [0, 1], y: [30, 0] }, { duration: 0.25, ease: "easeOut", at: 0.15 }]);
    animate(sequence);
  }
  if ( source === 'product-form') {
    const action = actionAfterATC || themeHDN.settings.actionAfterATC;
    if ( action === 'open_cart_drawer' ) {
      this.open();
    } else if ( action.indexOf('close:') > -1 ) {
      $4(action.split(':')[1]).parentElement?.close();
    }
  }

  // Focus back to the add to cart button
  // console.log(item_count, name, index)
  if (item_count === 0) {
    trapFocus(this.dialog, $4('.hdt-cart-drawer-empty a', this.dialog) || this.dialog);
  } else if (name && index) {
    const lineItem = $id4(`CartDrawer-Item-${index}`);
    const nameLineItem = $4(`[name="${name}"]`, lineItem);
    if (lineItem && nameLineItem) {
      trapFocus(this.dialog, nameLineItem);
    } else if ($4('.hdt-cart-item'), this.dialog) {
      trapFocus(this.dialog, $4('.hdt-cart-item-header a', this.dialog));
    }
  }
};
cart_reload_fn = async function(event) {
  //console.log('cart_reload_fn', event)
  try {
    let cartData;
    if (event && event.type == cartTab && event.detail.sections && event.detail.sections[getterGet(_cart_section_id, this)]) {
      cartData = event.detail
    } else {
      const response = await fetch(`${Shopify.routes.root}?sections=${getterGet(_cart_section_id, this)},cart-json`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseJson = await response.json();
      const cartJson = responseJson['cart-json'].split('[split_94]')[1] || '{}';
      cartData = JSON.parse(cartJson);

      //document.dispatchEvent(new CustomEvent(cartCount, { detail: { item_count: cartData.item_count } }));

      cartData.sections = {};
      cartData.sections[getterGet(_cart_section_id, this)] = responseJson[getterGet(_cart_section_id, this)];
    }

    $4('#CartDrawer-complementary')?.setAttribute('data-id', '1509'); //reset id
    //getterRunFn(_cart_update, this, cart_update_fn).call(this, evtCustom);
    this.dispatchEvent(new CustomEvent(cartUpdate, {
      bubbles: true,
      detail: {
        cartData,
        source: 'reload',
        actionAfterATC: 'no_action'
      }
    }));
  } catch (error) {
    console.error('Failed to reload cart:', error);
  }
}
cart_pageshow_fn = async function(event) {
  if (event.persisted || isBackForward()) {
    //console.log('reload', event.persisted, isBackForward(), historyTraversal)
    getterRunFn(_cart_reload, this, cart_reload_fn).call(this);
  }
}

var _cart_main_update = new WeakSet(), cart_main_update_fn,
_cart_main_reload = new WeakSet(), cart_main_reload_fn,
_cart_main_section_id = new WeakMap();
class CartMain extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_cart_main_update, this);
    getterAdd(_cart_main_reload, this);
    getterAdd(_cart_main_section_id, this, this.getAttribute('section-id'));
    this.prevCount = parseInt(this.getAttribute('cart-count'));
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    document.addEventListener(cartUpdate, getterRunFn(_cart_main_update, this, cart_main_update_fn).bind(this), { signal });
    document.addEventListener(cartTab, getterRunFn(_cart_main_reload, this, cart_main_reload_fn).bind(this), { signal });
    document.addEventListener(cartReload, getterRunFn(_cart_main_reload, this, cart_main_reload_fn).bind(this), { signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get sectionsToRender() {
    return [
      {
        id: this.sectionId
      },
      {
        id: 'cart-json'
      }
    ];
  }
  get sectionId() {
    return getterGet(_cart_main_section_id, this) || 'main-cart';
  }
};
cart_main_update_fn = async function(event) {
  const {cartData, name, index} = event.detail,
  {item_count} = cartData,
  newCartMain = document.createRange().createContextualFragment(cartData.sections[this.sectionId]);
  let animation;

  if (item_count == 0) {
    animation = animate([
      [$4('.hdt-cart-header', this), { opacity: [1, 0], transform: ["translateY(0)", "translateY(30px)"] }, { duration: 0.15 }],
      [$4('cart-items', this), { opacity: [1, 0], transform: ["translateY(0)", "translateY(30px)"] }, { duration: 0.15 }],
      [$$4('.hdt-cart__shipping-estimator, .hdt-cart__blocks', this), { opacity: [1, 0], transform: ["translateY(0)", "translateY(30px)"] }, { duration: 0.15 }]
    ]);
  } else if (this.prevCount == 0 && item_count > 0) {
    animation = animate($4('.hdt-cart-empty', this), { opacity: [1, 0], transform: ["translateY(0)", "translateY(30px)"] }, { duration: 0.25 })
  } else {
    animation = animate(this, {}, { duration: 0 })
  }
  await animation;

  this.classList.toggle('is-empty', item_count == 0);
  // Update gift wrap
  const giftWrap = $4('.hdt-page-cart__add-gift', this);
  giftWrap?.toggleAttribute('hidden', $4('.is-gift-wrap', newCartMain));
  if (giftWrap?.hidden) $4('[type="checkbox"]', giftWrap).checked = false;

  const selectors = ['.hdt-free-shipping-bar', '#main-cart-items', '.js-contents', '#Cart-complementary', '.hdt-cart__discount', '.hdt-cart-empty'];
  for (const selector of selectors) {
    const targetElement = $4(selector, this);
    const sourceElement = $4(selector, newCartMain);
    if (!targetElement || !sourceElement) continue;
    if (selector == selectors[0]) {
      const newInventoryBlock = $4('.hdt-x-progress', sourceElement),
      valuenow = newInventoryBlock.getAttribute("value");
      newInventoryBlock.removeAttribute('reveal-in-view');
      newInventoryBlock.setAttribute('disable-intial', '');
      newInventoryBlock.setAttribute("value", $4('.hdt-x-progress', targetElement).value);
      targetElement.replaceWith(sourceElement);
      newInventoryBlock.value = valuenow;
    } else if (selector != selectors[3]) {
      targetElement.replaceWith(sourceElement);
    } else if ( targetElement.dataset.id !== sourceElement.dataset.id ) {
      targetElement.replaceWith(sourceElement);
    }
  }

  if (item_count == 0) {
    animate($4('.hdt-cart-empty', this), { opacity: [0, 1], transform: ["translateY(30px)", "translateY(0)"] }, { duration: 0.25 })
  } else if (this.prevCount == 0 && item_count > 0) {
    animate([
      [$4('.hdt-cart-header', this), { opacity: [0, 1], transform: ["translateY(30px)", "translateY(0px)"] }, { duration: 0.15 }],
      [$4('cart-items', this), { opacity: [0, 1], transform: ["translateY(30px)", "translateY(0px)"] }, { duration: 0.15 }],
      [$$4('.hdt-cart__shipping-estimator,.hdt-cart__blocks', this), { opacity: [0, 1], transform: ["translateY(30px)", "translateY(0px)"] }, { duration: 0.15 }],
    ]);
  }
  this.prevCount = item_count;

  // Focus back to the add to cart button
  // console.log(item_count, name, index)
  if (item_count === 0) {
    $4('.hdt-cart-empty a', this)?.focus();
  } else if (name && index) {
    const lineItem = $id4(`CartItem-${index}`);
    const nameLineItem = $4(`[name="${name}"]`, lineItem);
    if (lineItem && nameLineItem) {
      nameLineItem.focus();
    } else if ($4('.hdt-main-cart-item'), this) {
      $4('.hdt-main-cart-item__name a', this).focus();
    }
  }
};
cart_main_reload_fn = async function(event) {
  try {
    let cartData;
    if (event && event.type == cartTab && event.detail.sections && event.detail.sections[getterGet(_cart_main_section_id, this)]) {
      cartData = event.detail
    } else {
      const response = await fetch(`${Shopify.routes.root}?sections=${getterGet(_cart_main_section_id, this)},cart-json`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseJson = await response.json();
      const cartJson = responseJson['cart-json'].split('[split_94]')[1] || '{}';
      cartData = JSON.parse(cartJson);

      //document.dispatchEvent(new CustomEvent(cartCount, { detail: { item_count: cartData.item_count } }));

      cartData.sections = {};
      cartData.sections[getterGet(_cart_main_section_id, this)] = responseJson[getterGet(_cart_main_section_id, this)];
    }

    const evtCustom = {
      detail: {
        cartData,
        source: 'reload',
        actionAfterATC: 'no_action'
      }
    };

    $4('#Cart-complementary')?.setAttribute('data-id', '1509'); //reset id
    getterRunFn(_cart_main_update, this, cart_main_update_fn).call(this, evtCustom);
  } catch (error) {
    console.error('Failed to reload cart:', error);
  }
};

var _cart_items_update_qty = new WeakSet(), cart_items_update_qty_fn;
class CartItems extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_cart_items_update_qty, this);
  }

  connectedCallback() {
    this.#controller = new AbortController();
    this.lineItemStatusElement = document.getElementById('CartDrawer-LineItemStatus') || document.getElementById('shopping-cart-line-item-status');
    //this.addEventListener('change', debounce(), { signal: this.#controller.signal });
    this.addEventListener('change', debounce((event) => {
      this.onChange(event);
    }, 100).bind(this), { signal: this.#controller.signal });
  }

  disconnectedCallback() {
    this.#controller.abort();
  }

  resetQuantityInput(id) {
    const input = $4(`#Drawer-quantity-${line}, #Quantity-${line}`, this);
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value),
    { line, index } = event.target.dataset,
    { min_error, max_error, step_error } = themeHDN.strings.cart;
    let message = '';

    if (inputValue < event.target.dataset.min) {
      message = min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = step_error.replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      getterRunFn(_cart_items_update_qty, this, cart_items_update_qty_fn).call(this, event, line, inputValue, document.activeElement.getAttribute('name'), event.target.dataset.variantId, index);
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }
  updateQuantity(event, line, quantity, name, variantId, index) {
    getterRunFn(_cart_items_update_qty, this, cart_items_update_qty_fn).call(this, event, line, quantity, name, variantId, index);
  }

  get sectionsToRender() {
    return [
      {
        id: this.dataset.id
      }
    ];
  }
  get cart() {
    return this._cart ??= this.closest('#CartDrawer, #MainCart');
  }
};
cart_items_update_qty_fn = async function(event, line, quantity, name, variantId, index) {
  // console.log('cart-update-qty: ', this, event, id, quantity, name, variantId);
  // console.log(this.sectionsToRender.map((section) => section.id))
  line = parseInt(line);
  document.dispatchEvent(new CustomEvent(loadingStart));
  $$4(`#CartDrawer-Item-${line} .hdt-shimmer, #CartItem-${line} .hdt-shimmer, [ref="cartTotal"].hdt-shimmer`, this.cart).forEach( (el) => shimmer(el) );
  this.cart?.setAttribute('effect-blur', '');
  const response = await fetch(`${Shopify.routes.root}cart/change.js`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      line,
      quantity,
      sections: this.sectionsToRender.map((section) => section.id),
    })
  });
  const cartData = await response.json();
  document.dispatchEvent(new CustomEvent(loadingEnd));
  resetShimmer(this.cart);
  this.cart?.removeAttribute('effect-blur');
  if (response.ok) {
    document.dispatchEvent(new CustomEvent(cartUpdate, {
      bubbles: true,
      detail: {
        source: 'cart-items',
        variantId,
        cartData,
        name,
        index
      }
    }));
  } else {
    const {description, message} = cartData;
    document.dispatchEvent(new CustomEvent(cartError, {
      bubbles: true,
      detail: {
        source: 'cart-items',
        errors: message || description,
        message
      }
    }));
    const quantityInput = $4(`#Drawer-quantity-${line}, #Quantity-${line}`, this);
    if (quantityInput) quantityInput.value = quantityInput.defaultValue;
    const cartItemError = $4(`#Cart-LineItemError-${line}`, this);
    $4('small', cartItemError).textContent = message || description;
    cartItemError.removeAttribute('hidden');
  }
};
class CartDrawerItems extends CartItems {

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
};
class CartRemoveButton extends HTMLElement {
  #controller;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems?.updateQuantity(event, this.dataset.line, 0, '', this.dataset.variantId);
    }, { signal: this.#controller.signal });
  }
  disconnectedCallback() { this.#controller.abort(); }
}
class CartNote extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('input', debounce((event) => {
        fetch(`${Shopify.routes.root}cart/update.js`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: event.target.value }),
          keepalive: true
        })
        .then(() => {
          //   if (this.dataset.type != 'cart-drawer') return;
          //  const currentText = this.dataset[event.target.value.length ? 'edit' : 'add'],
          //        control     = $4('[aria-controls="CartDrawer-Note"], [for="Cart-Note"]');
          //   $4('label', this).textContent = currentText;
          //   control?.setAttribute('aria-label', currentText)
          const control = $4('[aria-controls="CartDrawer-Note"], [for="Cart-Note"]');
          control?.classList.toggle('has-noted', event.target.value.length);
        });
      }, 300)
    );
  }
};
class CartAction extends DialogComponent {
  #controller;
  #indent;
  #clipPath;
  constructor() {
    super();
  }
  get #children() {
  return Array.from(this.dialog.firstElementChild.children);
}
  connectedCallback () {
    super.connectedCallback();
    const cartDrawer = $4('cart-drawer');
    if (!cartDrawer) return;
    this.#indent = this.dialog.classList.contains('hdt-drawer--indent');
    this.#clipPath = ['inset(0% 0 0 0 round 0 0 var(--rounded-sm) var(--rounded-sm))', 'inset(100% 0 0 0 round 0 0 var(--rounded-sm) var(--rounded-sm))'];
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    let btnOpening;
    document.addEventListener(discountUpdate, () => {
      setTimeout(() => {
        if (this.dialog.open) trapFocus(this.dialog);
      }, 60);
    }, { signal });
    this.dialog.addEventListener(dialogOpening, () => {
      btnOpening = this.dialog.btnOpening;
      cartDrawer.classList.add('is-cart-openabled');
    }, { signal });
    this.dialog.addEventListener(dialogClose, () => {
      cartDrawer.classList.remove('is-cart-openabled');
      trapFocus(cartDrawer.dialog);
      elFocus(btnOpening, false, true);
    }, { signal });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller?.abort();
  }
  animateDialogOpen() {
    if (this.#indent) {
      return animate([
        [this.#children, { visibility: 'hidden', opacity: 0 }, { duration: 0 }],
        [this.dialog.firstElementChild, { clipPath: this.#clipPath.reverse() }, { duration: 0.35, ease: "easeOut" }],
        [this.#children, { visibility: ["hidden", "visible"], opacity: [0, 1] }, { duration: 0.15, ease: "ease", at: "-0.15" }],
      ])
    }
    return animate(this.dialog, {
      transform: ['translate3d(0, 100%, 0)', 'translate3d(0, 0, 0)']
    }, {
      duration: 0.5,
      ease: [0.19, 1, 0.22, 1]
    });
  }
  animateDialogClose() {
    if (this.#indent) {
      return animate([
        [this.#children, { visibility: ["visible", "hidden"], opacity: [1, 0] }, { duration: 0.15, ease: "ease" }],
        [this.dialog.firstElementChild,{ clipPath: this.#clipPath.reverse() }, { duration: 0.3, ease: "easeOut", at: "-0.05" }],
      ])
    }
    return animate(this.dialog, {
      transform: ['translate3d(0, 0, 0)', 'translate3d(0, 100%, 0)']
    }, {
      duration: 0.4,
      ease: [0.19, 1, 0.22, 1]
    });
  }
};

/**
 * https://shopify.dev/docs/themes/ajax-api/reference/cart#generate-shipping-rates
 * https://community.shopify.com/c/shopify-design/cart-add-a-shipping-rates-calculator-to-your-cart/td-p/616554
 */
var _calc_shipping = new WeakSet(), calc_shipping_fn,
_async_shipping_rates = new WeakSet(), async_shipping_rates_fn,
_shipping_rates_ok = new WeakSet(), shipping_rates_ok_fn,
_shipping_rates_error = new WeakSet(), shipping_rates_error_fn;
class ShippingCalculator extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_calc_shipping, this);
    getterAdd(_async_shipping_rates, this);
    getterAdd(_shipping_rates_ok, this);
    getterAdd(_shipping_rates_error, this);
    this.langRates = JSON.parse( $4('template[data-lang-rates]', this).innerHTML );
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.submitButton = $4('[type="button"]', this);
    this.resultsElement = $4('[aria-live="polite"]', this);
    this.submitButton.addEventListener("click", getterRunFn(_calc_shipping, this, calc_shipping_fn).bind(this), { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
};
calc_shipping_fn = async function(event) {
  event.preventDefault();
  const zip = $4('[name="address[zip]"]', this).value,
  country = $4('[name="address[country]"]', this).value,
  $province = $4('[name="address[province]"]', this),
  province = $province.disabled ? '' : $province.value;
  this.submitButton.setAttribute("aria-busy", "true");
  document.dispatchEvent(new CustomEvent(loadingStart));
  const response = await fetch(`${Shopify.routes.root}cart/prepare_shipping_rates.json?shipping_address[zip]=${zip}&shipping_address[country]=${country}&shipping_address[province]=${province}`, { method: "POST" });
  document.dispatchEvent(new CustomEvent(loadingEnd));
  if (response.ok) {
    const shippingRates = await getterRunFn(_async_shipping_rates, this, async_shipping_rates_fn).call(this, zip, country, province);
    getterRunFn(_shipping_rates_ok, this, shipping_rates_ok_fn).call(this, shippingRates);
  } else {
    const jsonError = await response.json();
    getterRunFn(_shipping_rates_error, this, shipping_rates_error_fn).call(this, jsonError);
  }
  this.resultsElement.hidden = false;
  this.submitButton.removeAttribute("aria-busy");
};
async_shipping_rates_fn = async function(zip, country, province) {
  const response = await fetch(`${Shopify.routes.root}cart/async_shipping_rates.json?shipping_address[zip]=${zip}&shipping_address[country]=${country}&shipping_address[province]=${province}`);
  const responseAsText = await response.text();
  if (responseAsText === "null") {
    return getterRunFn(_async_shipping_rates, this, async_shipping_rates_fn).call(this, zip, country, province);
  } else {
    return JSON.parse(responseAsText).shipping_rates;
  }
};
shipping_rates_ok_fn = function(shippingRates) {
  let ratesList = shippingRates.map((shippingRate) => {
    return `<li>${shippingRate.presentment_name}: ${ shippingRate.price == "0.00" ? this.langRates.free : `<span class="hdt-money">${currency.convert(shippingRate.price)}</span>` }</li>`;
  });
  this.resultsElement.innerHTML = `
    <div class="hdt-mess__rates is--rates-success">
      <p>${shippingRates.length === 0 ? this.langRates.no_rates : shippingRates.length === 1 ? this.langRates.one_rate : this.langRates.multiple_rates}</p>
      ${ratesList === "" ? "" : `<ul role="list">${ratesList.join('')}</ul>`}
    </div>
  `;
  document.dispatchEvent(new CustomEvent("currencyUpdate"));
};
shipping_rates_error_fn = function(errors) {
  let errorHtml = Object.keys(errors).map((errorKey) => {
    return `<li><span class="hdt-key__rate">${errorKey}:</span> ${errors[errorKey]}</li>`;
  });
  this.resultsElement.innerHTML = `
      <div class="hdt-mess__rates is--rates-error">
        <p>${this.langRates.errors}</p>
        <ul role="list">${errorHtml.join('')}</ul>
      </div>
    `;
};

class GiftTick extends HTMLElement {
  constructor() {
    super();
    $4('[type="checkbox"]', this)?.addEventListener('change', (e)=> {
      if (e.target.checked) $4('[name="add"]', $id4(this.getAttribute('form'))).click();
    });
  }
};
// cart count
var _get_cart_count = new WeakSet(), get_cart_count_fn,
_car_count_section = new WeakMap();
class HdtCartCount extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_get_cart_count, this);
    getterAdd(_car_count_section, this, $4('[ref="hdt-cart"]'));
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    document.addEventListener(cartLive, (event) => this.itemCount = event.detail.item_count, { signal });
    document.addEventListener(cartTab, (event) => this.itemCount = event.detail.item_count, { signal });
    window.addEventListener("pageshow", getterRunFn(_get_cart_count, this, get_cart_count_fn).bind(this), { signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get cart() {
    return getterGet(_car_count_section, this);
  }
  /**
   * @param {number} count
   */
  set itemCount(count) {
    this.innerText = count;
    this.classList.toggle('is-visible', count > 0);
  }
}
get_cart_count_fn = async function(event) {
  if (event.persisted || isBackForward()) this.itemCount = await getCart().then((data) => data.item_count);
};
// cart dot
class CartDot extends HdtCartCount {
  /**
   * @param {number} count
   */
  set itemCount(count) {
    this.classList.toggle('is-visible', count > 0);
  }
}

class CartDiscount extends HTMLElement {
  #controller;
  #errors;
  #cart
  constructor() {
    super();
  }

  /** @type {AbortController | null} */
  #activeFetch = null;

  #createAbortController() {
    if (this.#activeFetch) {
      this.#activeFetch.abort();
    }

    const abortController = new AbortController();
    this.#activeFetch = abortController;
    return abortController;
  }

  connectedCallback() {
    this.#errors = {
      wrap: $4('[ref="cartDiscountError"]', this),
      discount: $4('[ref="cartDiscountErrorDiscountCode"]', this),
      shipping: $4('[ref="cartDiscountErrorShipping"]', this),
    };
    this.#cart = $4('[ref="hdt-cart"]');

    this.#controller = new AbortController();
    const { signal } = this.#controller;
    $4('form', this).addEventListener('submit', this.#applyDiscount.bind(this), { signal });
    //this.addEventListener('click', this.#removeDiscount, { signal });
  }

  disconnectedCallback() {
    this.#errors = null;
    this.#controller.abort();
    if (this.#activeFetch) {
      this.#activeFetch.abort();
      this.#activeFetch = null;
    }
  }

  /**
   * Handles updates to the cart note.
   * @param {SubmitEvent} event - The submit event on our form.
   */
  #applyDiscount = async (event) => {

    event.preventDefault();
    event.stopPropagation();

    const form = event.target;

    if (!(form instanceof HTMLFormElement)) return;

    const discountCode = $4('input[name="discount"]', form),
    discountCodeValue = discountCode.value;

    if (!(discountCode instanceof HTMLInputElement) || typeof this.dataset.sectionId !== 'string' || discountCodeValue.length === 0) return;

    const abortController = this.#createAbortController();
    try {
      const existingDiscounts = this.#existingDiscounts();
      if (existingDiscounts.includes(discountCodeValue)) return;

      document.dispatchEvent(new CustomEvent(loadingStart));
      const { wrap, discount, shipping } = this.#errors;
      wrap?.setAttribute('hidden', '');
      discount?.setAttribute('hidden', '');
      shipping?.setAttribute('hidden', '');

      const config = fetchConfig('json', {
        body: JSON.stringify({
          discount: [...existingDiscounts, discountCodeValue].join(','),
          sections: this.#cart.sectionsToRender.map((section) => section.id)
        }),
      });

      const response = await fetch(`${Shopify.routes.root}cart/update.js`, {
        ...config,
        signal: abortController.signal,
      }),
      data = await response.json();
      document.dispatchEvent(new CustomEvent(loadingEnd));
      if (
        data.discount_codes.find((/** @type {{ code: string; applicable: boolean; }} */ discount) => {
          return discount.code === discountCodeValue && discount.applicable === false;
        })
      ) {
        discountCode.value = '';
        this.#handleDiscountError('discount_code');
        return;
      }

      const parsedHtml = new DOMParser().parseFromString(data.sections[this.dataset.sectionId], 'text/html'),
      section = parsedHtml.getElementById(`shopify-section-${this.dataset.sectionId}`);

      if (section) {
        const discountCodes = $$4('.hdt-cart-discount__pill', section),
        codes = discountCodes
          .map((element) => (element instanceof HTMLLIElement ? element.dataset.discountCode : null))
          .filter(Boolean);
        // Before morphing, we need to check if the shipping discount is applicable in the UI
        // we check the liquid logic compared to the cart payload to assess whether we leveraged
        // a valid shipping discount code.
        if (
          codes.length === existingDiscounts.length &&
          codes.every((/** @type {string} */ code) => existingDiscounts.includes(code)) &&
          data.discount_codes.find((/** @type {{ code: string; applicable: boolean; }} */ discount) => {
            return discount.code === discountCodeValue && discount.applicable === true;
          })
        ) {
          this.#handleDiscountError('shipping');
          discountCode.value = '';
          return;
        }
      }

      // document.dispatchEvent(new CustomEvent(cartUpdate, {
      //   bubbles: true,
      //   detail: {
      //     source: 'cart-discount',
      //     cartData: data
      //   }
      // }));
      document.dispatchEvent(new CartUpdateEvent(null, null, data, null, 'cart-discount'));
      document.dispatchEvent(new DiscountUpdateEvent(data, this.id));
    } catch (error) {
      document.dispatchEvent(new CustomEvent(loadingEnd));
    } finally {
      this.#activeFetch = null;
    }
  };

  /**
   * Handles removing a discount from the cart.
   * @param {MouseEvent | KeyboardEvent} event - The mouse or keyboard event in our pill.
   */
  removeDiscount = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if ((event instanceof KeyboardEvent && event.key !== 'Enter') || !(event instanceof MouseEvent) || !(event.target instanceof HTMLElement) || typeof this.dataset.sectionId !== 'string') return;

    const pill = event.target.closest('.hdt-cart-discount__pill');
    if (!(pill instanceof HTMLLIElement)) return;

    const discountCode = pill.dataset.discountCode;
    if (!discountCode) return;

    const existingDiscounts = this.#existingDiscounts();
    const index = existingDiscounts.indexOf(discountCode);
    if (index === -1) return;

    existingDiscounts.splice(index, 1);

    const abortController = this.#createAbortController();

    try {
      document.dispatchEvent(new CustomEvent(loadingStart));
      const config = fetchConfig('json', {
        body: JSON.stringify({ discount: existingDiscounts.join(','), sections: this.#cart.sectionsToRender.map((section) => section.id) }),
      }),
      response = await fetch(`${Shopify.routes.root}cart/update.js`, {
        ...config,
        signal: abortController.signal,
      }),
      data = await response.json();

      document.dispatchEvent(new CustomEvent(loadingEnd));
      // document.dispatchEvent(new CustomEvent(cartUpdate, {
      //   bubbles: true,
      //   detail: {
      //     source: 'cart-discount',
      //     cartData: data
      //   }
      // }));
      document.dispatchEvent(new CartUpdateEvent(null, null, data, null, 'cart-discount'));
      document.dispatchEvent(new DiscountUpdateEvent(data, this.id));
    } catch (error) {
    } finally {
      this.#activeFetch = null;
    }
  };

  /**
   * Handles the discount error.
   *
   * @param {'discount_code' | 'shipping'} type - The type of discount error.
   */
  #handleDiscountError(type) {
    const { wrap, discount, shipping } = this.#errors,
    target = type === 'discount_code' ? discount : shipping;
    wrap.removeAttribute('hidden');
    target.removeAttribute('hidden');
  }

  /**
   * Returns an array of existing discount codes.
   * @returns {string[]}
   */
  #existingDiscounts() {
    /** @type {string[]} */
    const discountCodes = [];
    const discountPills = $$4('.hdt-cart-discount__pill', this);
    for (const pill of discountPills) {
      if (pill instanceof HTMLLIElement && typeof pill.dataset.discountCode === 'string') {
        discountCodes.push(pill.dataset.discountCode);
      }
    }
    return discountCodes;
  }
}
class CartDiscountRemove extends HTMLElement {
  #controller;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const discountComponent = this.closest('cart-discount-component');
    this.addEventListener('click', (event) => {
      //event.preventDefault();
      discountComponent?.removeDiscount(event);
    }, { signal: this.#controller.signal });
  }
  disconnectedCallback() { this.#controller.abort();}
}

class AgeModal extends Modal {
  #minAge;
  #expireDays;
  #daySelect;
  #monthSelect;
  #yearSelect;
  #requireDob;
  #controller;
  connectedCallback() {
    //console.log('Age Modal: ', $id4('hdt-age-modal'));
    super.connectedCallback();
    this.#controller = new AbortController();
    const { signal } = this.#controller.signal;
    this.#minAge = Number(this.getAttribute('min-age') || 18);
    this.#expireDays = Number(this.getAttribute('expire-days') || 15);

    if (expiresManager.check(this.#storageKey)) return this.dialog.setAttribute('is-verified', '');
    this.lockOpen = true;
    this.#requireDob = this.hasAttribute('require-dob');
    if (this.#requireDob) {
      this.#daySelect = $id4('hdt-age-day');
      this.#monthSelect = $id4('hdt-age-month');
      this.#yearSelect = $id4('hdt-age-year');
      this.#populateSelects();
    }
    if (!Shopify.designMode) this.open();
    const form = $id4('hdt-age-modal_form');
    form?.addEventListener('submit', this.#handleConfirm, { signal });
    form?.addEventListener('reset', this.#handleCancel, { signal });
    // bind change
    this.#monthSelect.addEventListener('change', this.#updateDays, { signal });
    this.#yearSelect.addEventListener('change', this.#updateDays, { signal });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#controller.abort();
  }
  get #storageKey() {
    return `age:${this.#minAge}`;
  }
  #populate(select, start, end, step = 1) {
    const fragment = document.createDocumentFragment();
    const isDescending = start > end;

    for (let i = start; isDescending ? i >= end : i <= end; i += step) {
      fragment.append(new Option(i, i));
    }
    select.append(fragment);
  }
  #populateSelects() {
    const now = new Date().getFullYear();

    this.#populate(this.#daySelect, 1, 31);
    this.#populate(this.#monthSelect, 1, 12);
    this.#populate(this.#yearSelect, now, now - 100, -1);
  }
  #daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }
  #updateDays = () => {
    const m = Number(this.#monthSelect.value),
    y = Number(this.#yearSelect.value),
    maxDays = (m && y) ? this.#daysInMonth(m, y) : 31,
    current = Number(this.#daySelect.value);

    this.#daySelect.innerHTML = `<option value="">${this.#daySelect.options[0].text}</option>`;
    this.#populate(this.#daySelect, 1, maxDays);
    // Keep the old date if it is still valid.
    if (current && current <= maxDays) this.#daySelect.value = current;
  }
  #calcAgeFromSelects() {
    const d = Number(this.#daySelect.value);
    const m = Number(this.#monthSelect.value);
    const y = Number(this.#yearSelect.value);


    if (!d || !m || !y) return null;


    const today = new Date();
    const dob = new Date(y, m - 1, d);


    // invalid date (VD: 31/02)
    if ( dob.getFullYear() !== y || dob.getMonth() !== m - 1 || dob.getDate() !== d ) return null;


    let age = today.getFullYear() - y;
    const diffMonth = today.getMonth() - (m - 1);


    if (diffMonth < 0 || (diffMonth === 0 && today.getDate() < d)) age--;
    return age;
  }
  #handleConfirm = (event) => {
    event.preventDefault();
    if (this.#requireDob) {
      const age = this.#calcAgeFromSelects();
      //console.log(age);
      if (age === null || age < this.#minAge) return this.#shake;
    }
    if (!Shopify.designMode) expiresManager.set(this.#storageKey, this.#expireDays);
    this.close();
    this.#controller.abort();
    document.dispatchEvent(new CustomEvent('theme4:age:verified'));
  };
  #handleCancel = () => {
    this.#shake;
    if (this.hasAttribute('custom-link') && !Shopify.designMode) window.location.href = this.getAttribute('custom-link');
  };
  get #shake() {
    return animate(
      this.dialog,
      // { x: [0, -8, 8, -6, 6, -4, 4, 0] },
      { transform: ['translateX(0px)', 'translateX(-8px)', 'translateX(8px)', 'translateX(-6px)', 'translateX(6px)', 'translateX(-4px)', 'translateX(4px)', 'translateX(0px)'] },
      {
        duration: 0.4,
        ease: 'easeInOut'
      }
    );
  }
}
class NewsletterPopup extends Modal {
  #options;
  constructor() {
    super();
    if (expiresManager.check(this.#storageKey)) return;
    const ageModal = $id4('hdt-age-modal'),
    awaitAgeVerification = ageModal ? !ageModal.hasAttribute('is-verified') : false;
    //console.log('awaitAgeVerification: ', awaitAgeVerification);
    this.#options = JSON.parse(this.getAttribute('config') || '{}');

    if (awaitAgeVerification) {
      document.addEventListener('theme4:age:verified', this.#int, { once: true });
    } else {
      this.#int();
    }
    this.lockOpen = true;
    if ($4('.hdt-form__alert--success', this)) expiresManager.set(this.#storageKey, this.#options.expiryDays);
  }
  connectedCallback () {
    super.connectedCallback();
    this.dialog.addEventListener(dialogClose, () => expiresManager.set(this.#storageKey, this.#options.expiryDays), { once: true });
  }

  get #storageKey() {
    return 'newsletter_popup';
  }

  #int = () => {
    const { type, timeDelay, scrollDelay } = this.#options;
    if (type == 'time') {
      delay(() => this.open(), timeDelay)
    } else {
      const scroll2 = scroll(progress => {
        if (progress * 100 < scrollDelay) return;
        this.open();
        scroll2();
      });
    }
  }
}

customElements.define("hdt-modal", Modal);
customElements.define("hdt-drawer", Drawer);
customElements.define("hdt-menu-drawer", MenuDrawer);
customElements.define("hdt-menu-panel", MenuPanel);
customElements.define("cart-drawer", CartDrawer);
customElements.define("main-cart", CartMain);
customElements.define('cart-items', CartItems);
customElements.define('cart-drawer-items', CartDrawerItems);
customElements.define('cart-remove-button', CartRemoveButton);
customElements.define('cart-note', CartNote);
customElements.define("hdt-cart-action", CartAction);
customElements.define("hdt-shipping-calculator", ShippingCalculator);
customElements.define("hdt-cart-gift-tick", GiftTick);
customElements.define("hdt-cart-count", HdtCartCount);
customElements.define("hdt-cart-dot", CartDot);
customElements.define('cart-discount-component', CartDiscount);
customElements.define('wrapp-discount-remove', CartDiscountRemove);
customElements.define('hdt-age-modal', AgeModal);
customElements.define("hdt-newsletter-popup", NewsletterPopup);

var _localization_header = new WeakMap(),
_localization_disclosure = new WeakMap();
class LocalizationForm extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_localization_header, this, $4('.hdt-sticky-header'));
    getterAdd(_localization_disclosure, this, this.closest('.hdt-disclosure'));
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    if (this.hasAttribute('get-options') && !this.hasAttribute('added-options')) {
      let optionsDom = document.createRange().createContextualFragment($id4('GlobalCountry-country-results').innerHTML);
      // Append the cloned content to the form
      $4('form', this)?.lastElementChild?.appendChild(optionsDom);
      this.setAttribute('added-options', '');
      optionsDom = null;
    }
    if (this.hasAttribute('on-header')) {
      this.disclosure?.addEventListener(dialogOpening, () => { this.header.preventHide = true }, { signal });
      this.disclosure?.addEventListener(dialogOpen, () => { this.header.preventHide = true }, { signal });
      this.disclosure?.addEventListener(dialogClosing, () => { this.header.preventHide = false }, { signal });
    }

    this.addEventListener('submit', (e) => {
      this.disclosure?.closeDialog();
      if (e.submitter.getAttribute('aria-selected') == 'true') return e.preventDefault();
      document.dispatchEvent(new CustomEvent(loadingStart));
    }, { once: true, signal });
  }
  disconnectedCallback() {
    this.#controller?.abort();
  }
  get header() {
    return getterGet(_localization_header, this);
  }
  get disclosure() {
    return getterGet(_localization_disclosure, this);
  }
};

var _reset_btn_country = new WeakMap(),
_search_country = new WeakMap(),
_disclosure_country = new WeakMap(),
_reset_filter_country = new WeakSet(), reset_filter_country_fn,
_filter_countries = new WeakSet(), filter_countries_fn;
class CountryFilter extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_reset_filter_country, this);
    getterAdd(_filter_countries, this);
    getterAdd(_reset_btn_country, this, $4('[type="reset"]', this));
    getterAdd(_search_country, this, $4('[type="search"]', this));
    getterAdd(_disclosure_country, this, this.closest('.hdt-disclosure'));
  }
  get resetButton() {
    return getterGet(_reset_btn_country, this);
  }
  get search() {
    return getterGet(_search_country, this);
  }
  get disclosure() {
    return getterGet(_disclosure_country, this);
  }
  get popover() {
    return this._popover ??= this.closest('hdt-popover');
  }
  normalizeString(str) {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this.search?.addEventListener('keyup', getterRunFn(_filter_countries, this, filter_countries_fn).bind(this), { signal });
    this.search?.addEventListener('keydown', (event) => { if (event.key === 'Escape') event.preventDefault() }, { signal });
    this.resetButton?.addEventListener('click', getterRunFn(_reset_filter_country, this, reset_filter_country_fn).bind(this), { signal });
    this.resetButton?.addEventListener('mousedown', (event) => event.preventDefault(), { signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
};
reset_filter_country_fn = function(event) {
  event.stopPropagation();
  this.search.value = '';
  getterRunFn(_filter_countries, this, filter_countries_fn).call(this);
  this.disclosure.style.minWidth = null;
  //$4('.hdt-popover__body', this.disclosure).style.minHeight = null;
  //this.search.focus();
  this.popover?.updateTrap(this.search);
  this.popover?.updateFloating;
};
filter_countries_fn = function(e) {
   if (e && e.key === 'Tab') return;
  this.disclosure.style.minWidth = this.disclosure.offsetWidth + 'px';
  //$4('.hdt-popover__body', this.disclosure).style.minHeight = $4('.hdt-popover__inner', this.disclosure).offsetHeight + 'px';
  const searchValue = this.normalizeString(this.search.value);
  const allCountries = $$4('.hdt-disclosure__item', this.disclosure);
  let visibleCountries = allCountries.length;
  this.resetButton.classList.toggle('hidden', !searchValue);
  this.resetButton.tabIndex = searchValue ? 0 : -1;

  allCountries.forEach((item) => {
    const countryName = this.normalizeString($4('[country]',item).textContent);
    if (countryName.indexOf(searchValue) > -1) {
      item.removeAttribute('hidden');
      visibleCountries++;
    } else {
      item.setAttribute('hidden', '');
      visibleCountries--;
    }
  });

  $4('.hdt-country-no-results', this.disclosure)?.toggleAttribute('hidden', visibleCountries);
  if (this.nextElementSibling) this.nextElementSibling.innerHTML = themeHDN.strings.countryCount.replace('[count]', visibleCountries);
  $4('.hdt-disclosure__list', this.disclosure).scrollTop = 0;
  this.popover?.updateTrap(this.search);
  this.popover?.updateFloating;
};
customElements.define("localization-form", LocalizationForm);
customElements.define("hdt-country-filter", CountryFilter);

var _section_ids_modal = new WeakMap();
class LazyModal extends Modal {
  // constructor() {
  //   super();
  //   getterAdd(_section_ids_modal, this, this.getAttribute('section-id'));
  //   this.addEventListener(dialogClose, ()=> {this.innerHTML = ""});
  // }
  // async openDialog(_animate = true, btnOpening) {
  //   const handle = btnOpening ? btnOpening.getAttribute("handle") : this.getAttribute("handle");
  //   if (!handle) return;
  //   document.dispatchEvent(new CustomEvent(loadingStart, { bubbles: true }));
  //   btnOpening?.setAttribute("aria-busy", "true");
  //   const responseSection = await (await fetchCache(`${window.Shopify.routes.root}products/${handle}?section_id=${getterGet(_section_ids_modal, this)}`)).text();
  //   document.dispatchEvent(new CustomEvent(loadingEnd, { bubbles: true }));
  //   btnOpening?.setAttribute("aria-busy", "false");
  //   const domElement = new DOMParser().parseFromString(responseSection, "text/html"),
  //   newSectionModal = document.createRange().createContextualFragment(domElement.getElementById(`shopify-section-${getterGet(_section_ids_modal, this)}`).innerHTML);
  //   this.replaceChildren(...newSectionModal.children);
  //   rteWrapTable(this);
  //   accessibleLinks(this);
  //   localeUrl(this);
  //   Shopify?.PaymentButton?.init();
  //   document.dispatchEvent(new CustomEvent("currencyUpdate"));
  //   return super.openDialog(_animate);
  // }
  constructor() {
    super();
    getterAdd(_section_ids_modal, this, this.getAttribute('section-id'));
    this._inner = $4('.hdt-modal__inner', this);
  }
  async open(jump = false) {
    const handle = this.btnOpening?.getAttribute("handle");
    if (!handle) return;

    document.dispatchEvent(new CustomEvent("theme:loading:start", { bubbles: true }));
    this.btnOpening?.setAttribute("aria-busy", "true");
    const responseSection = await (await fetchCache(`${window.Shopify.routes.root}products/${handle}?section_id=${getterGet(_section_ids_modal, this)}`)).text();
    document.dispatchEvent(new CustomEvent("theme:loading:end", { bubbles: true }));
    this.btnOpening?.setAttribute("aria-busy", "false");
    const domElement = new DOMParser().parseFromString(responseSection, "text/html"),
    newSectionModal = document.createRange().createContextualFragment(domElement.getElementById(`shopify-section-${getterGet(_section_ids_modal, this)}`).innerHTML);
    // Update Product title
    const newPrTitle = $4('[product-title]', newSectionModal),
    prTitle = $4('[product-title]', this);
    if (newPrTitle && prTitle) prTitle.textContent = newPrTitle.getAttribute('product-title');
     // end Update Product title
    this._inner.replaceChildren(...newSectionModal.children);
    rteWrapTable(this);
    accessibleLinks(this);
    localeUrl(this);
    Shopify?.PaymentButton?.init();
    document.dispatchEvent(new CustomEvent(currencyUpdate));

    requestAnimationFrame(() => {
      super.open(jump);
    })
  }
  async close(jump = false) {
    await super.close(jump);
    this._inner.innerHTML = "";
  }
  get btnOpening() {
    return this.dialog?.btnOpening;
  }
};
class liveButton extends HTMLElement {
  constructor() {
    super();
    // $id4(this.firstElementChild.getAttribute('aria-controls'))?.updateBtnOpen(this);
  }
  connectedCallback() {
    $4('hdt-tmp-quick')?.dispatchEvent(new CustomEvent("theme:update:id", { bubbles: false }));
  }
};
class TmpQuick extends HTMLElement {
  constructor() {
    super();
    this.getIDTemp();
    this.addEventListener('theme:update:id', () => this.getIDTemp());
  }
  //connectedCallback() {}
  async getIDTemp() {
    const $btn = $4('[aria-controls="hdt-quick-view-modal"], [aria-controls="hdt-quick-add-modal"]');
    if (!$btn || this.hasID) return;
    this.hasID = true;
    this.removeEventListener('theme:update:id', () => this.getIDTemp());
    let response = '',
    idCache = "themeQuick" + window.Shopify.theme.id;
    if (sessionStorage.getItem(idCache) && !Shopify.designMode ) {
      response = sessionStorage.getItem(idCache);
    } else {
      const responseAsText = await (await fetch(`${window.Shopify.routes.root}products/${$btn.getAttribute('handle')}?view=only_config`, {priority: 'low'})).text();
      const tmpDom = new DOMParser().parseFromString(responseAsText, "text/html");
      $$4('#MainContent .hdt-section-lazy .js-tmp', tmpDom).forEach( (tmp)=> {
        response += tmp.innerHTML;
      });
      sessionStorage.setItem(idCache, response)
    }
    this.insertAdjacentHTML("afterend", response);
    this.remove();
  }
}

customElements.define('hdt-lazy-modal', LazyModal);
customElements.define("wrapp-hdt-open-btn", liveButton);
customElements.define('hdt-tmp-quick', TmpQuick);

var _hotspot_reveal = new WeakSet(),
hotspot_reveal_fn, hotspot_img = new WeakMap();
class hotspotReveal extends HTMLElement {
  constructor() {
    super();
    if (!matchMediaQuery("motion") || !this.hasAttribute('reveal-on-scroll') ) return;
    getterAdd(_hotspot_reveal, this);
    getterAdd(hotspot_img, this, $4('.hdt-media-wrapper > img', this));
    inView(this, getterRunFn(_hotspot_reveal, this, hotspot_reveal_fn).bind(this), { margin: "-50px 0px" });
  }
};
hotspot_reveal_fn = async function() {
  await checkImagesLoaded(getterGet(hotspot_img, this));
  animate(
    $$4('.hdt-hotspot__btn', this),
    { opacity: 1, transform: ["rotate(180deg) scale(0)", "rotate(0deg) scale(1)"] },
    { duration: 0.35, delay: stagger(0.5), ease: [0.25, 0.1, 0.25, 1.0] }
  )
};
customElements.define('hdt-hotspot', hotspotReveal);

/**
* 12. Accordion
* -----------------------------------------------------------------------------
*/
var _details = new WeakMap(),
_summary = new WeakMap(),
_content = new WeakMap(),
_on_keydown = new WeakSet(), on_keydown_fn;
class Accordion extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_details, this, $4('details', this));
    getterAdd(_summary, this, $4('summary', this));
    getterAdd(_content, this, this._summary.nextElementSibling);
    getterAdd(_on_keydown, this);
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this._summary.addEventListener("click", this._onSummaryClicked.bind(this), { signal });
    this._summary.addEventListener("press", this._onSummaryClicked.bind(this), { signal });
    this._details.addEventListener("keydown", getterRunFn(_on_keydown, this, on_keydown_fn).bind(this), { signal });
    if (Shopify.designMode) {
      this.addEventListener(admEvts.select, () => this.toggle(), { signal });
      this.addEventListener(admEvts.deselect, () => this.toggle2(), { signal });
    }
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get open() {
    return this._details.hasAttribute('open');
  }
  get _summary() {
    return getterGet(_summary, this);
  }
  get _details() {
    return getterGet(_details, this);
  }
  get _content() {
    return getterGet(_content, this);
  }
  get break() {
    return false;
  }
  toggle(setOpen = true) {
    if ( (setOpen && !this.open) || (!setOpen && this.open)) {
      this._summary?.dispatchEvent(new CustomEvent("press", { detail: { offClick: true }}));
    }
  }
  toggle2(){
    this.toggle(false);
  }
  _onSummaryClicked(event) {
    event.preventDefault();
    if (!this._content || this.break) return;
    if (this.hasAttribute('only-click-icon') && !event.target.hasAttribute('accordion-icon') && event?.type == 'click' && this._summary.hasAttribute('data-url') ) {
      return window.location.href = this._summary.getAttribute("data-url");
    }
    if ( !this.hasAttribute('only-click-icon') && event?.type == 'click' && this._summary.hasAttribute("data-url") && this.open ) {
      return window.location.href = this._summary.getAttribute("data-url");
    }
    this._summary.setAttribute('aria-expanded', `${!this.open}`);
    // Mobile menu
    if (this.hasAttribute('menu-drawer')) return this.#menuDrawer(event);

    this._details.style.overflow = "hidden";
    if (this.open) {
      animate([
        [this._content, { opacity: 0 }, { duration: 0.15 }],
        [this._details, { height: [`${this._details.clientHeight}px`, `${this._summary.clientHeight}px`] }, { duration: 0.25, at: "<", ease: [0.25, 0.1, 0.25, 1.0] }]
      ]).then(() => {
        this._details.style.height = null;
        this._details.style.overflow = null;
        this._details.removeAttribute('open');
      });
    } else {
      this._details.setAttribute('open', '');
      animate([
        [this._details, { height: [`${this._summary.clientHeight}px`, `${this._details.scrollHeight}px`] }, { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }],
        [this._content, { opacity: [0, 1], y:[4, 0] }, { duration: 0.15, at: "-0.1" }]
      ]).then(() => {
        this._details.style.height = null;
        this._details.style.overflow = null;
      });
    }
  }
  get list() {
    return this._list ??= $4('#MenuDrawer .hdt-menu-drawer-list');
  }
  #menuDrawer(event) {
    //console.log(event.target, event.target.closest('ul'));
    const isChild = this.hasAttribute('menu-drawer--child'),
    li_parent = isChild ? '.hdt-menu-drawer-item--lv2' : '.hdt-menu-drawer-item--lv1',
    li_curent = isChild ? '.hdt-menu-drawer-item' : '.hdt-menu-drawer-item--lv2';
    //if (!isChild) event.target.closest('ul').classList.toggle('hdt-drilldown-hide', !this.open);

    if (this.open) {
      // close action
      if (isChild) {
        this.list.style.height = `${Math.max(this.list.parentElement.clientHeight, this.closest('details').closest('hdt-accordion')._content.clientHeight)}px`;
      } else {
        this.list.style.height = null;
      }
      if (this.currentParentScroll) this.list.parentElement.scrollTop = this.currentParentScroll;
      animate([
        [this._content, { x: ['calc(-100% - 1px)', '0px'], y: [0, 10], opacity: [1, 0] }, { duration: 0.25, opacity: { duration: 0.3 } }],
        [this.closest('ul').querySelectorAll(li_parent), { opacity: [0, 1], x: [-50, 0] }, { at: '<', duration: 0.25, delay: stagger(0.01), opacity: { duration: 0.2 } }],
      ]).then(() => {
        this._details.removeAttribute('open');
      });

    } else {
      // open action
      this.currentParentScroll = this.list.parentElement.scrollTop;
      this._details.setAttribute('open', '');
      this.list.style.height = `${Math.max(this.list.parentElement.clientHeight, this._content.clientHeight)}px`;
      this.list.parentElement.scrollTop = 0;
      animate([
        [this.closest('ul').querySelectorAll(li_parent), { opacity: [1, 0], x: [0, -50] }, { duration: 0.3, delay: stagger(0.01), opacity: { duration: 0.2 } }],
        [this._content, { x: ['0px', 'calc(-100% - 1px)'], opacity: [1, 1], y: [0, 0] }, { at: '<', duration: 0.3 }],
        [this._content.querySelectorAll(li_curent), { opacity: [0, 1], x: [-50, 0] }, { at: '<', duration: 0.3, delay: stagger(0.01), opacity: { duration: 0.2 } }],
      ]);
    }
  }
};
on_keydown_fn = function(e) {
  if (e.key != 'Enter' || !e.target?.hasAttribute('accordion-icon')) return;
  e.preventDefault();
  e.stopPropagation();
  e.target.click();
};
class AccordionBack extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();
      console.log('sssss')
      evt.target?.closest('details')?.querySelector('summary [accordion-icon]')?.click();
    });
  }
}
customElements.define("hdt-accordion", Accordion);
customElements.define("hdt-menu-back-btn", AccordionBack);

class FooterMenu extends Accordion {
  #resize;
  constructor() {
    super();
    // if (!matchMediaQuery("motion")) return;
    // inView(this, () => {
    //   animate(this, { opacity: [0, 1], transform: ["translateY(20px)", "translateY(0)"] }, { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] });
    // }, { margin: "-50px 0px" });
  }
  get break() {
    return matchMediaQuery("mobile") ? this.hasAttribute('break') : true;
  }
  connectedCallback() {
    super.connectedCallback();
    let oldWidth = 0;
    this.#resize = resize(this, (_,{ width }) => {
      if (oldWidth == width) return;
      oldWidth = width;
      this.setAttribute('resized', '');
      this._details.open = (!matchMediaQuery("mobile") || this._summary.clientWidth == 0) || this.hasAttribute('open-default-mobile') || this.hasAttribute('break');
      this._summary.setAttribute('aria-expanded', this._details.open);
      if (this._details.open) animate(this._content, { y: 0, opacity: 1}, { duration: 0 });
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#resize) this.#resize();
  }
  toggle2(){
    if (matchMediaQuery("mobile") && !this.break) this._details.removeAttribute('open')
  }
};
customElements.define("hdt-footer-menu", FooterMenu);

const _headerSticky = $4('.hdt-sticky-header'),
headerBg1 = $4('.hdt-header-bg--1'),
headerBg2 = $4('.hdt-header-bg--2'),
headerBackdrop = $4('.hdt-page-backdrop');
const width = motionValue(window.innerWidth/2),
height = motionValue(50),
left = motionValue(0),
width2 = motionValue(230),
height2 = motionValue(50),
top2 = motionValue(0),
left2 = motionValue(0);
// top = springValue(0),
// left = springValue(0);
if (headerBg1 && headerBg2) {
  styleEffect(headerBg1, { width, height, left });
  styleEffect(headerBg2, { width: width2, height: height2, top: top2, left: left2 });
}
const springHeader = {
  type: "spring",
  stiffness: 500,
  damping: 35,
  // stiffness: 400,
  // damping: 30,
  // restSpeed: 0.01,
  // restDelta: 0.01
};
var headerMenuOpenedCount = 0;
class HeaderMenu extends Accordion {
  #controller;
  #boundary;
  #focusOut = false;
  // timeOut;
  constructor() {
    super();
    this.#boundary = $4('.hdt-header-wrapper');
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.#event == 'click') return;
    // hover(this._summary, (el) => {
    //   clearTimeout(this.#timeOut);
    //   el.dispatchEvent(new CustomEvent("press", { detail: { offClick: true }}));
    //   return () => {
    //     this.#timeOut = setTimeout(() => {
    //       el.dispatchEvent(new CustomEvent("press", { detail: { offClick: true }}));
    //     }, 250)
    //   }
    // })
  }
  disconnectedCallback() {
    this.#controller?.abort();
  }
  _onSummaryClicked(event) {
    event.preventDefault();
    if (event?.type == 'click' && this.open && this._summary.hasAttribute('data-url') ) {
      return window.location.href = this._summary.getAttribute("data-url");
    }
    _headerSticky.preventHide = !this.open;
    if (this.open) {
      this.closeMenu();
    } else {
      this.openMenu();
      this.#controller = new AbortController();
      const { signal } = this.#controller;
      document.addEventListener("keydown", this.#pressEsc, { signal });
      this._details.addEventListener('focusout', this.#onFocusOut.bind(this), { signal });
      document.addEventListener("click", this.#clickOutside, { signal });
      if (this.hasAttribute('pos2')) document.addEventListener("scroll", () => this.closeMenu(), { signal });
    }
  }
  get #event() {
    return this._event ??= !matchMediaQuery("hover") ? "click" : this.getAttribute("event");
  }

  #pressEsc = (event) => {
    if (event.code === "Escape") {
      const details = event.target.closest('details[open]');
      if (details && details == this._details) {
        this.closeMenu();
        event.stopPropagation();
        this._summary.focus()
      }
    }
  }
  #onFocusOut(event) {
    this.#focusOut = true;
    //console.log(event, event.relatedTarget)
    setTimeout(() => {
      if (!this.contains(document.activeElement) && event.relatedTarget) this.closeMenu(event.relatedTarget);
    });
  }
  #clickOutside = (event) => {
    if (this.#event === "hover" || this.#focusOut) {
      this.#focusOut = false;
      return;
    }
    if (!this.contains(event.target)) {
      this.closeMenu();
    }
  }
  get #effect() {
    return 'slide'
    // fade || slide || move_block
  }
  showMenuAnimate(isLevel1, x, y) {
    const selector = isLevel1 ? '[reveal]:not([reveal--lv2])' : '[reveal][reveal--lv2]';
    if (this.#effect == 'move_block') {
      let animation;
      if (isLevel1) {
        animate(width, this._content.offsetWidth);
        animate(height, this._content.offsetHeight);
        animate(left, x, springHeader);
        animation = animate([
          [headerBg1, { opacity: 1 }, { duration: 0 }],
          [this._content, { opacity: 0, y: 0 }, { duration: 0.01 }],
          [this._content, { left: [left.get(), x] }, springHeader],
          // [headerBg1, { width: this._content.offsetWidth, height: this._content.offsetHeight, left: x }, { duration: .4 }],
          // [width, this._content.offsetWidth],
          // [height, this._content.offsetHeight],
          // [left, x, springHeader],
          [this._content, { opacity: 1, }, { duration: 0.01, at: ">" }],
          [$$4(selector, this._content), { opacity: [0, 1], y: [8, 0] }, { ...springHeader, delay: stagger(0.02, { startDelay: 0 }) }],
          [headerBg1, { opacity: 0 }, { duration: 0.01 }],
          [headerBg2, { opacity: 0 }, { duration: 0.01, at: "<" }]
        ]);
        // Update bg2
        animate(width2, this._content.offsetWidth);
        animate(left2, x, springHeader);
        animate(top2, y);
      } else {
        animate(width2, this._content.offsetWidth);
        animate(height2, this._content.offsetHeight);
        animate(left2, x, springHeader);
        animate(top2, y, springHeader);
        animation = animate([
          [headerBg2, { opacity: 1 }, { duration: 0 }],
          [this._content, { opacity: 0, y: 0 }, { duration: 0.01 }],
          [this._content, { left: [left2.get(), x], top: [top2.get(), y] }, springHeader],
          [this._content, { opacity: 1, }, { duration: 0.01, at: ">" }],
          [$$4(selector, this._content), { opacity: [0, 1], y: [8, 0] }, { ...springHeader, delay: stagger(0.02, { startDelay: 0 }) }],
          [headerBg2, { opacity: 0 }, { duration: 0.01 }]
        ]);
      }
      return animation;
    } else {
      return animate([
        [this._content, { opacity: [0, 1], y: [this.#effect == 'slide' ? 20 : 0, 0] }, { duration: .4 }],
        [$$4(selector, this._content), { opacity: [0, 1], y: [8, 0] }, { ...springHeader, delay: stagger(0.02, { startDelay: 0 }), at: "-0.2" }]
      ])
    }
  }
  hideMenuAnimate(instant) {
    --headerMenuOpenedCount;
    const hiddenBackdrop = !instant && headerMenuOpenedCount == 0;
    const sequence = [
      [this._content, { opacity: [1, 0], y: [0, 30] }, { duration: .3 }],
      ...(hiddenBackdrop ? [[headerBackdrop, { opacity: 0 }, { ease: "easeInOut", at: "-0.2", duration: .25 }]] : [])
    ];
    return animate(sequence)
  }
  async closeMenu(nextElFocus = null) {
    // click submenu to submenu
    if (nextElFocus && this.contains(nextElFocus)) return;
    // click summary to summary
    let instant = this.hasAttribute('pos2') || (nextElFocus && nextElFocus.hasAttribute('prevent'));
    this.#controller?.abort();
    const animation = this.hideMenuAnimate(instant);
    if (instant) animation.complete();
    await animation;
    this._details.open = false;
  }
  async openMenu(instant = false) {
    animate(headerBackdrop, { opacity: 1 }, { ease: "easeInOut", duration: .25 });
    this._details.open = true;
    //this._content.focus();
    ++headerMenuOpenedCount;

    if (this.hasAttribute('pos')) {
      this.#updatePosition.then(({ x, y }) => {
        animate(this._content, { left: x }, {duration: 0});
        const animation = this.showMenuAnimate(this.hasAttribute('pos'), x, y);
        if (instant) animation.complete();
      });
    } else {
      this.#updatePosition2.then(({ x, y }) => {
        // calc max-heigh form y
        const availableHeight = window.innerHeight - y - 15;
        this._content.style.maxHeight = `${availableHeight}px`;
        this._content.style.overflowY = 'auto';

        animate(this._content, { left: x, top: y }, { duration: 0 });
        const animation = this.showMenuAnimate(this.hasAttribute('pos'), x, y);
        if (instant) animation.complete();
      });
    }
  }

  get #updatePosition() {
      return computePosition(this._summary, this._content, {
        placement: 'bottom',
        middleware: [
          shift({
            boundary: this.#boundary
          })
        ],
      })
  }
  get #updatePosition2() {
    return computePosition(this._summary, this._content, {
        placement: isRTL ? 'left-start' : 'right-start',
        strategy: 'fixed',
        middleware: [
            flip({
              fallbackPlacements: isRTL ? ['right-start'] : ['left-start'],
            }),
            shift({
              padding: {
                top: -10,
                left: 0,
                right: 0
              }
            })
        ],
    });
  }
}
class HeaderMegaMenu extends HeaderMenu {

}
class menuCols extends HTMLElement {
  constructor() {
    super();
    if (!this.firstElementChild) return;
    const totalGap = 30 * (this.childElementCount - 1);
    resize(this, (_, { width }) => {
      frame.render(() => {
        // 2. Dùng reduce để tính tổng width
        const totalWidth = $$4('[ref="el-minus"]', this).reduce((sum, el) => {
          // Lấy width chính xác (bao gồm cả phần thập phân)
          const rect = el.getBoundingClientRect();
          return sum + rect.width;
        }, 0);
        //console.log(width, totalGap, (width - this.firstElementChild.offsetLeft * 2 - totalWidth - totalGap), Math.floor((width - this.firstElementChild.offsetLeft * 2 - totalWidth - totalGap) / 130) )
        this.style.setProperty('--max-menu-columns', Math.floor((width - this.firstElementChild.offsetLeft * 2 - totalWidth - totalGap) / 150));
        //html.style.setProperty(`--${this.getAttribute("prefix")}-height`, `${height.toFixed(2)}px`);
      })
    });
  }
}
class underlay extends HTMLElement {
  #hover;
  #height;
  #section;
  constructor() {
    super();
  }
  connectedCallback() {
    if (!html.classList.contains('header-transparent-on') || !this.closest('.hdt-sticky-header').classList.contains('hdt-sticky-header--full')) return;
    this.#section = this.closest('.hdt-section');
    this.#height = motionValue(0);
    styleEffect(this, { height: this.#height });

    this.#hover = hover(this.parentElement, (el) => {
      this.#section.classList.add('is--hover', 'is--interaction');
      this.animation(el.offsetHeight);
      return () => {
        this.#section.classList.remove('is--hover');
        if (!$4('.hdt-header-details[open]', el)) {
          this.animation(0).then(() => {
            this.#section.classList.remove('is--interaction');
          })
        }
      }
    })
  }
  disconnectedCallback() {
    if (this.#hover) this.#hover();
  }
  async animation(end) {
    return animate(this.#height, end, { duration: 0.36, ease: [0.33, 1, 0.68, 1] });
  }
}

customElements.define("hdt-header-menu", HeaderMenu);
customElements.define("hdt-header-mega-menu", HeaderMegaMenu);
customElements.define("hdt-menu-cols", menuCols);
customElements.define("hdt-underlay", underlay);

// /**
//  * Global cache to store SVG data or ongoing fetch Promises.
//  * This prevents duplicate network requests for the same SVG URL.
//  */
// const svgCache = new Map();

// class InlineContent extends HTMLElement {
//   constructor() {
//     super();
//     this.isLoaded = false;
//   }

//   /**
//    * Invoked when the component is added to the document.
//    */
//   connectedCallback() {
//     if (this.isLoaded) return;
//     inView(this, () => {
//       this.init();
//     }, { margin: '300px', amount: 0.01 })
//     this.init();
//   }

//   /**
//    * Initializing logic to find the image and trigger the conversion.
//    */
//   async init() {
//     const img = $4('img', this);

//     // Validate if the image exists and has an SVG source
//     if (!img || !img.src.includes('.svg')) return;

//     const url = img.src;

//     try {
//       // Fetch SVG content using the singleton pattern (shared cache)
//       const svgMarkup = await this.fetchSVG(url);

//       if (svgMarkup) {
//         this.replaceImageWithSVG(img, svgMarkup);
//         this.isLoaded = true;
//       }
//     } catch (error) {
//       console.error("SVG:", error);
//     }
//   }

//   /**
//    * Handles SVG fetching with a "Request Pooling" strategy.
//    * If multiple components request the same URL simultaneously,
//    * they will all wait for a single network request.
//    * * @param {string} url - The source URL of the SVG file.
//    * @returns {Promise<string>} - A promise that resolves to the SVG string.
//    */
//   async fetchSVG(url) {
//     // Return cached data or existing Promise if available
//     if (svgCache.has(url)) {
//       return svgCache.get(url);
//     }

//     // Create a new fetch request and store the Promise in the cache
//     const fetchPromise = fetch(url)
//       .then(response => {
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         return response.text();
//       })
//       .then(data => {
//         // Parse the raw text to extract the <svg> element
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(data, 'text/html');
//         const svg = $4('svg', doc);

//         // Return only the outerHTML to store in cache as a string
//         return svg ? svg.outerHTML : null;
//       })
//       .catch(err => {
//         // Remove from cache on failure to allow retry later
//         svgCache.delete(url);
//         throw err;
//       });

//     svgCache.set(url, fetchPromise);
//     return fetchPromise;
//   }

//   /**
//    * Replaces the <img> tag with the inline <svg> element while preserving attributes.
//    * * @param {HTMLImageElement} img - The original image element.
//    * @param {string} svgMarkup - The SVG string to be injected.
//    */
//   replaceImageWithSVG(img, svgMarkup) {
//     const parser = new DOMParser();
//     const svgDoc = parser.parseFromString(svgMarkup, 'text/html');
//     const newSvg = $4('svg', svgDoc);

//     if (!newSvg) return;

//     // Map important attributes from <img> to the new <svg>
//     const attributesToCopy = ['id', 'class', 'width', 'height', 'aria-label'];
//     attributesToCopy.forEach(attr => {
//       const value = img.getAttribute(attr);
//       if (value) newSvg.setAttribute(attr, value);
//     });

//     // Ensure the SVG has a class for styling purposes
//     newSvg.classList.add('hdt-svg-loaded');

//     // Perform the DOM replacement
//     img.replaceWith(newSvg);

//     // Dispatch a custom event for external scripts to react to the load
//     // this.dispatchEvent(new CustomEvent('svg:loaded', {
//     //   detail: { url: img.src },
//     //   bubbles: true
//     // }));
//   }
// }

// // Register the Web Component if it hasn't been defined yet
// customElements.define('hdt-inline-content', InlineContent);


/**
* 13. Tab player list
* -----------------------------------------------------------------------------
*/

var _tabs_player = new WeakMap(),
_content_player = new WeakMap(),
_image_player = new WeakMap(),
_tabs_player_section = new WeakMap(),
_tabs_player_color = new WeakMap(),
_tabs_player_slelect = new WeakSet(), tabs_player_slelect_fn;

class TabPlayerList extends AutoplayElement {
  #controller;
  constructor() {
    super();
    this.currIndex = 0;

    getterAdd(_tabs_player, this, $$4('button', this));
    getterAdd(_content_player, this, $id4(this.getAttribute("aria-controls")));
    getterAdd(_image_player, this, $id4('imgs-' + this.getAttribute("aria-controls")));
    getterAdd(_tabs_player_slelect, this);
    getterAdd(_tabs_player_section, this, this.closest(".hdt-tab-block") || this.closest(".shopify-section"));
    getterAdd(_tabs_player_color, this, $4('[color-scheme]', getterGet(_tabs_player_section, this)));
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    super.connectedCallback();
    if (matchMediaQuery("motion") && this.hasAttribute('reveal-on-scroll')) {
      inView(getterGet(_tabs_player_section, this), () => {
        if (matchMediaQuery("motion") && this.hasAttribute('reveal-on-scroll')) getterRunFn(_tabs_player_slelect, this, tabs_player_slelect_fn).call(this, 0, false);
      }, { margin: "444px" });
    }

    getterGet(_tabs_player, this).forEach((tab, index) => {
      tab.index = index;
      tab.addEventListener('click', ()=> {
        this.stop();
        getterRunFn(_tabs_player_slelect, this, tabs_player_slelect_fn).call(this, index, !matchMediaQuery("motion"));
        this.play();
      }, { signal });
    });

    if (Shopify.designMode) {
      const dtAtrr = 'data-auto_switch',
      autoRotate = $4(`[${dtAtrr}]`, getterGet(_tabs_player_section, this));
      this.addEventListener(admEvts.select, (event) => {
        if (this.interval) autoRotate?.setAttribute(dtAtrr, 'false');
        this.pause();
        getterRunFn(_tabs_player_slelect, this, tabs_player_slelect_fn).call(this, event.target.index)
      }, { signal });
      this.addEventListener(admEvts.deselect, ()=> {
        if (this.interval) autoRotate?.setAttribute(dtAtrr, 'true');
        this.resume();
      }, { signal });
    }

  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  get customPlayFn () {
    return ()=> {
      getterRunFn(_tabs_player_slelect, this, tabs_player_slelect_fn).call(this);
    }
  }
  // get customPauseFn () {
  //   return null;
  // }
  get nextIndex() {
    return (this.currIndex + 1) % getterGet(_tabs_player, this).length;
  }
};
tabs_player_slelect_fn = async function(index = null, instantly = false) {
  //console.log('tabs_player_slelect_fn', index)
  //console.log(index, getterGet(_tabs_player, this))
  this.currIndex = index != null ? index : this.nextIndex;
  const btn = getterGet(_tabs_player, this)[this.currIndex],
  content = getterGet(_content_player, this)?.children[this.currIndex];
  if (content) {
    //getterGet(_tabs_player, this)[this.lastIndex]?.setAttribute('aria-current', 'false');
    getterGet(_tabs_player, this).filter((btn) => btn.getAttribute('aria-current') == 'true').forEach((btn) => {
      btn.setAttribute('aria-current', 'false');
    });
    btn?.setAttribute('aria-current', 'true');
    if (btn?.getAttribute('color')) {
      //console.log(getterGet(_tabs_player_section, this))
      //console.log(getterGet(_tabs_player_color, this))
      getterGet(_tabs_player_color, this)?.setAttribute('color-scheme', btn.getAttribute('color'));
    }
    [...getterGet(_content_player, this)?.children]?.filter((content) => !content.hasAttribute('hidden')).forEach((content) => {
      content.setAttribute('hidden', '');
    });
    getterGet(_content_player, this)?.children
    //getterGet(_content_player, this)?.children[this.lastIndex]?.setAttribute('hidden', '');
    content.removeAttribute('hidden');
    const contentHasAssignImg = $id4(content.getAttribute("assign-img"));
    if (contentHasAssignImg) {
      //getterGet(_image_player, this)?.children[this.lastIndex]?.setAttribute('hidden', '');
      [...getterGet(_image_player, this)?.children]?.filter((img) => !img.hasAttribute('hidden')).forEach((img) => {
        img.setAttribute('hidden', '');
      });
      contentHasAssignImg.removeAttribute('hidden');
    }
    //this.lastIndex = index;
    if (this.hasAttribute('custom-effect')) return;
    await checkImagesLoaded($4('img', contentHasAssignImg));
    const animation = animate([
      [$4('img, svg', contentHasAssignImg), { opacity: [0, 1], transform: ["scale(1.25) translateX(-50px)", "scale(1) translateX(0px)"] }, { ease: [0.19, 1, 0.22, 1], duration: .8 }],
      [$$4('[reveal]', content), { opacity: [0, 1], transform: animationContent['ani1'] }, {
        duration: 0.8,
        delay: stagger(0.1, { startDelay: 0.4, ease: [0.25, 0.1, 0.25, 1.0]}),
          ease: [0, 0.87, 0.58, 1],
          duration: 0.8,
        at: "<"
      }]
    ]);
    //console.log(instantly)
    if (instantly) {
      animation.complete();
    }
  }
};
customElements.define('hdt-tab-player-list', TabPlayerList);

/**
* 14. Copy button and share button
* -----------------------------------------------------------------------------
*/
var _copy_to_clipboard, copy_to_clipboard_fn;
class CopyButton extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_copy_to_clipboard, this);
    this.actionCopy = this.input?.hasAttribute('value') ? 'value' : 'textContent';
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    this.addEventListener("click", getterRunFn(_copy_to_clipboard, this, copy_to_clipboard_fn).bind(this, this.input), { signal });
    if (this.input && this.hasAttribute("get-doc-url")) {
      this.closest('hdt-popover')?.addEventListener(dialogOpening, () => {
        this.input[this.actionCopy] = this.textCopy;
      }, { signal });
    }
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get input() {
    return $id4(this.getAttribute("text-id"));
  }
  get textCopy() {
    return this.hasAttribute("get-doc-url") ? document.location.href : (this.dataset.text || this.input[this.actionCopy] || "");
  }
};
_copy_to_clipboard = new WeakSet();
copy_to_clipboard_fn = async function(input) {
  if (!navigator.clipboard) return;
  await navigator.clipboard.writeText(this.textCopy);
  if (this.hasAttribute("data-success-message")) {
    input = input || this;
    const originalText = input[this.actionCopy];
    input[this.actionCopy] = this.getAttribute("data-success-message");
    setTimeout(() => {
      input[this.actionCopy] = originalText;
    }, 1500);
  }
};

// https://dev.to/timhuang/a-simple-way-to-detect-if-browser-is-on-a-mobile-device-with-javascript-44j3
var _native_share, native_share_fn;
class ShareButton extends HTMLElement {
  #controller;
  constructor() {
    super();
    getterAdd(_native_share, this);
    this.hidden = !navigator.share || window.matchMedia("screen and (pointer: fine)").matches;
  }
  connectedCallback() {
    this.#controller = new AbortController();
    if (!this.hidden) this.addEventListener("click", getterRunFn(_native_share, this, native_share_fn), { signal: this.#controller.signal });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
};
_native_share = new WeakSet();
native_share_fn = function() {
  navigator.share({
    title: this.getAttribute("share-title") || document.title,
    url: this.getAttribute("share-url") || document.location.href
  });
};
customElements.define("wrapp-hdt-copy-btn", CopyButton);
customElements.define("wrapp-hdt-share-btn", ShareButton);

/**
* 15. Lazy HTML
* -----------------------------------------------------------------------------
* https://web.dev/articles/fetch-priority
*/
class LazyHTML extends HTMLElement {
  #controller;
  check = true;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const options = {
      priority: this.getAttribute('priority') || 'low',
      signal: this.#controller.signal
    },
    url = this.url || this.getAttribute('url') || `${Shopify.routes.root}?section_id=${this.getAttribute('section-id')}`;
    if (url) this.lazyFetch(url, options);
  }
  disconnectedCallback() {
    if (this.check) this.#controller.abort();
  }
  async lazyFetch(url, options) {
    const response = await fetchCache(url, '', options),
          tempDiv  = new DOMParser().parseFromString(await response.text(), "text/html");
    this.check = false;
    const formLocal = $4('.shopify-localization-form', tempDiv);
    if (formLocal) {
      const language = $id4('localization_form_language');
      $4('[name="return_to"]', formLocal).value = language && language.return_to ? language.return_to.value : location.pathname;
    }
    this._replace(tempDiv);
  }
  _replace(tempDiv) {
    this.replaceWith(...tempDiv.querySelector('.shopify-section').children);
    this.dispatchEvent(new CustomEvent("lazyhtml:added", { bubbles: true }));
  }
}
customElements.define("hdt-lazy-html", LazyHTML);

/**
* 16. Customer JS
* -----------------------------------------------------------------------------
*/
class ShowPassword extends HTMLElement {
  #controller;
  #input
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.#input = document.getElementById(this.getAttribute('input-id'));
    if (this.#input) this.addEventListener('click', this.toggleType.bind(this), {signal: this.#controller.signal});
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  toggleType() {
    this.#input.type = this.#input.type == 'text' ? 'password' : 'text';
    this.toggleAttribute('display-password', this.#input.type == 'text');
  }
}
customElements.define("hdt-show-password", ShowPassword);

class CountryProvinceSelector extends HTMLElement {
  #controller;
  #countryEl;
  #provinceEl;
  #provinceContainer;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    this.#countryEl        = $4('[name="address[country]"]', this);
    this.#provinceEl       = $4('[name="address[province]"]', this);
    this.#provinceContainer = this.hasAttribute('hide-el') ? $4(this.getAttribute('hide-el'), this) : this.#provinceEl.parentElement;
    this.#countryEl.addEventListener('change', this.#renderProvinces.bind(this), {signal: this.#controller.signal});

    // initCountry
    const countryVal = this.#countryEl.getAttribute('data-default') || this.#countryEl.value,
         value = this.#provinceEl.getAttribute('data-default') || this.#provinceEl.value;
    if (countryVal) {
      this.#setSelectorByValue(this.#countryEl, countryVal);
      this.#countryEl.dispatchEvent(new Event("change"));
    }
    // initProvince
    if (value && this.#provinceEl.options.length > 0) {
      this.#setSelectorByValue(this.#provinceEl, value);
    }
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  #setSelectorByValue(selector, value) {
    selector.selectedIndex = Math.max(0, [...selector.options].findIndex((opt) => value == opt.textContent || value == opt.value));
  }
  #renderProvinces() {
    const optSelected = this.#countryEl.options[this.#countryEl.selectedIndex],
    provinces = JSON.parse(optSelected.getAttribute('data-provinces'));

    this.#provinceContainer.hidden = provinces && provinces.length == 0;
    this.#provinceEl.innerHTML = `${provinces.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;
  }
}
customElements.define("hdt-province", CountryProvinceSelector);

// class CustomerAvatar extends HTMLElement {
//   constructor() {
//     super();
//   }
//   connectedCallback() {
//     document.addEventListener('storefront:signincompleted', this.handleStorefrontSignInCompleted.bind(this), { once: true });
//   }
//   handleStorefrontSignInCompleted(event) {
//     if (event?.detail?.avatar) $4('.hdt-icon', this)?.replaceWith(event.detail.avatar.cloneNode());
//   }
// }
// customElements.define('hdt-customer-avatar', CustomerAvatar);

/**
* Athora start
* -----------------------------------------------------------------------------
*/
class circleBg extends HTMLElement {
  #_maxShirt;
  #controller;
  #hover;
  #xBtn;
  #yBtn;
  connectedCallback() {
    if (!matchMediaQuery("hover")) return;
    const btn = this.closest('[circle-bg-wrap]'),
    mousemove = this.hasAttribute('mousemove'),
    scale = springValue(0),
    x = springValue('-50%'),
    y = springValue('-50%');
    styleEffect(this, { scale, x, y })

    this.#hover = hover(btn, (_, e) => {

      const rect = btn.getBoundingClientRect();
      // Tọa độ click relative tới button
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.style.left = `${x}px`;
      this.style.top = `${y}px`;

      // Tính bán kính ripple tối ưu
      const distances = [
        Math.hypot(x, y), // top-left
        Math.hypot(rect.width - x, y), // top-right
        Math.hypot(x, rect.height - y), // bottom-left
        Math.hypot(rect.width - x, rect.height - y) // bottom-right
      ];
      const maxRadius = Math.max(...distances);
      const scaleTo = maxRadius / 10; // vì ripple đường kính = 20px → radius = 10px
      scale.set(scaleTo);
      return () => {
        scale.set(0);
        if (mousemove) {
          this.#xBtn.set(0);
          this.#yBtn.set(0);
        }
      }
    });
    if (mousemove) {
      this.#controller = new AbortController();
      this.#xBtn = springValue(0),
      this.#yBtn = springValue(0);
      const z = springValue(0.001),
      perspective = springValue('1px');
      styleEffect(btn, { x: this.#xBtn, y: this.#xBtn, z, perspective })
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const moveX = (x / (rect.width / 2)) * this.#maxShift;
        const moveY = (y / (rect.height / 2)) * this.#maxShift;

        this.#xBtn.set(moveX);
        this.#xBtn.set(moveY);
      }, { signal: this.#controller.signal });
    }
  }
  disconnectedCallback() {
    if (this.#hover) this.#hover();
    this.#controller?.abort();
  }
  get #maxShift() {
    // default 6
    // 3: like ios
    return this.#_maxShirt ??= this.getAttribute('mousemove') || 6;
  }
}
customElements.define('hdt-circle-bg', circleBg);
class typing extends HTMLElement {
  #textObj;
  #text;
  #cursor;
  connectedCallback() {
    this.#textObj = JSON.parse(this.dataset.text);
    this.#text = $4('[typing-text]', this);
    this.#cursor = $4('[typing-cursor]', this);
  }
  disconnectedCallback() { }
  typing() {
    //if (!this.#text || this.#text.textContent.length > 0) return;
    if (!this.#textObj) return;
    animate(0, this.#textObj[0].length, {
      duration: 1.5,
      ease: "linear",
      onUpdate: (latest) => {
        this.#text.textContent = this.#textObj[0].slice(0, Math.ceil(latest));
      },
    }).then(() => {
      if (this.#textObj[1] == null) return;
      console.log("Animation complete")
      animate(0, this.#textObj[1].length, {
        duration: 1.5,
        ease: "linear",
        onUpdate: (latest) => {
          this.#text.textContent = this.#textObj[1].slice(0, Math.ceil(latest));
        },
      })
    });
    if (!this.#cursor) return;
    animate(
      this.#cursor,
      {
          opacity: [1, 1, 0, 0],
      },
      {
          duration: 1,
          repeat: Infinity,
          times: [0, 0.5, 0.5, 1],
      }
  );
  }
}
customElements.define('hdt-typing', typing);

class CircularText extends HTMLElement {
  constructor() {
    super();
    //const radius = parseInt(this.dataset.width)/2;
    const text = this.#formartText(this.getAttribute('aria-label')),
    circle = $4(".hdt-circular-text__circle", this),
    chars = [...text],
    //const keyDot = this.getAttribute('dot') || '•';
    fragment = document.createDocumentFragment(),
    totalChars = chars.length,
    angleStep = 360 / totalChars;

    chars.forEach((char, i) => {
      const el = document.createElement("span");
      el.setAttribute('aria-hidden', 'true');

      el.textContent = char === ' ' ? '\u00A0' : char;
      el.style.setProperty('--char-angle', `${(i * angleStep).toFixed(4)}deg`);
      fragment.appendChild(el);
      // el.textContent = char;
      // el.style.setProperty('--char-angle', `${(i * 360) / chars.length}deg`);

      // if (char === '|') {
      //   el.classList.add('hdt-large-dot')
      //   el.textContent = keyDot;
      // } else {
      //   el.textContent = char;
      // }
      // el.style.transform = `rotate(${i * angleStep}deg) translate(${radius}px) rotate(90deg)`;

      fragment.appendChild(el);
    });
    circle.appendChild(fragment);
  }
  #formartText(text) {
    let processedText = text.toUpperCase();
    if (processedText.includes(' ')) {
      //processedText = processedText.replace(/ /g, ' | ') + ' | ';
      processedText = processedText + ' '
    }
    return processedText;
  }
}
customElements.define('hdt-circular-text', CircularText);

// --------------------------
// Inactive tab message
// --------------------------
class inactiveTabMessage extends HTMLElement {
  #intervalId = null;
  #messageIndex = 0;
  #originalTitle = document.title;
  #messages = [];
  #delay;
  #onVisibilityChange;

  constructor() {
    super();
    this.#onVisibilityChange = this.#handleVisibilityChange.bind(this);
  }

  connectedCallback() {
    this.#parseConfig();
    if (!this.#messages.length) return;
    document.addEventListener('visibilitychange', this.#onVisibilityChange);
  }

  disconnectedCallback() {
    this.#stop();
    document.removeEventListener('visibilitychange', this.#onVisibilityChange);
  }

  #parseConfig() {
    let config = {delay: 500, message: ''};
    try {
      config = JSON.parse(this.getAttribute('config') || '{}');
      this.#delay = Number(config.delay);
      this.#messages = config.message.split(';').map(m => m.trim()).filter(Boolean);
    } catch {}
  }

  #handleVisibilityChange() {
    if (document.hidden) {
      this.#start();
    } else {
      this.#stop();
      document.title = this.#originalTitle;
    }
  }

  #start() {
    if (this.#intervalId) return;
    setTimeout(()=> this.#updateTitle(), 10);
    this.#intervalId = setInterval(() => this.#updateTitle(), this.#delay);
  }

  #stop() {
    if (!this.#intervalId) return;
    clearInterval(this.#intervalId);
    this.#intervalId = null;
    this.#messageIndex = 0;
  }

  #updateTitle() {
    document.title = this.#messages[this.#messageIndex];
    this.#messageIndex = (this.#messageIndex + 1) % this.#messages.length;
  }
}
customElements.define('hdt-inactive-tab', inactiveTabMessage);

/**
* Athora end
* -----------------------------------------------------------------------------
*/

(() => {
  /**
   * Scrollbar Width
   * Table, iframe wrapper
   **/

  /* Scrollbar Width */
  // https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript
  function updateScrollbarVar() {
    if (!html.hasAttribute('scroll-lock')) html.style.setProperty('--scrollbar-w', `${Math.max(0, Math.min(20, window.innerWidth - html.clientWidth))}px`);
  }
  updateScrollbarVar();
  window.addEventListener("resize", throttle(updateScrollbarVar));

  /* Table, iframe wrapper */
  // Theme-specific selectors to make tables scrollable
  rteWrapTable();
  accessibleLinks();
  localeUrl();

  // ADDED: Kityfly and Nathan
  // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
  // https://stackoverflow.com/questions/2915833/how-to-check-browser-for-touchstart-support-using-js-jquery
  // https://stackoverflow.com/questions/27173272/300ms-delay-removal-using-fastclick-js-vs-using-ontouchstart
  // if (navigator.userAgent && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
  //   $4('meta[name="viewport"]', document.head).content = "width=device-width, initial-scale=1.0, height=device-height, minimum-scale=1.0, maximum-scale=1.0";
  // } else  if ("ontouchend" in document) {
  //   let indexFixFristClick = 0;
  //   const FixFristClick = () => { ++indexFixFristClick; if( indexFixFristClick > 1) document.removeEventListener('touchend', FixFristClick) };
  //   document.addEventListener('touchend', FixFristClick);
  // }
  if (navigator.userAgent && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    $4('meta[name="viewport"]', document.head).content = "width=device-width, initial-scale=1.0, height=device-height, minimum-scale=1.0, maximum-scale=1.0";
  }
  if ("ontouchend" in document) {
    let indexFixFristClick = 0;
    const FixFristClick = () => { ++indexFixFristClick; if( indexFixFristClick > 1) document.removeEventListener('touchend', FixFristClick) };
    document.addEventListener('touchend', FixFristClick);
  }
  const oneItemText = themeHDN?.strings?.cart?.items_added_to_cart_one || '1 item added to cart',
  itemsText = themeHDN?.strings?.cart?.items_added_to_cart_other || '{{ count }} items added to cart';
  document.addEventListener(cartUpdate, (event)=> {
    if ( event.detail.source !== 'product-form' ) return;
    const quantityAdded = event.detail?.formData?.quantity;
    announce(quantityAdded == 1 ? oneItemText : itemsText.replace('{{ count }}', quantityAdded.toString()));
    if ( !$4('hdt-cart-drawer') && themeHDN.settings.pageType != 'cart') {
      const actionAfterATC = event.detail.actionAfterATC || themeHDN.settings.actionAfterATC;
      if (actionAfterATC.indexOf('go_') > -1) window.location.href = actionAfterATC == 'go_custom_link' ? themeHDN.settings.cartCustomLink : `${Shopify.routes.root}${actionAfterATC == 'go_cart_page' ? 'cart' : 'checkout'}`;
    }
  });
  document.addEventListener(cartError, (event)=> {
    //console.log('cart error: ', event.detail);
    announce(event.detail.message, true);
  });

  // Accessibility focus footer
  const footer = $4('.hdt-section-footer');
  if (footer && !matchMediaQuery("mobile")) {
    const footerHeading = $$4('summary.hdt-footer-block__heading', footer);
    footerHeading.forEach((heading)=> heading.tabIndex = -1);
    resize(({ width }) => {
      footerHeading.forEach((heading)=> heading.tabIndex = width <= 767 ? 0 : -1);
    })
    if ($4('[sticky-footer]', footer) && !Shopify.designMode ) {
      footer.addEventListener('focusin', () => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }

})();

export {
  getterAdd, getterGet, getterRunFn, Modal, Drawer, Popover,
  isRTL,
  currency,
  rteWrapTable, accessibleLinks, localeUrl, Accordion
}
// var myWorker;
// testWorker();
// function testWorker() {
//   if (typeof(Worker) !== "undefined") {
//     if (typeof(myWorker) == "undefined") {
//       myWorker = new Worker(new URL("webworkertest.js", import.meta.url));
//     }
//     myWorker.onmessage = (event) => {
//         console.log(event)
//     }
//   } else {
//     document.getElementById("loopcount2").innerHTML = "Web Worker not supported";
//   }
// }
// function terminateWorker(){
//   myWorker.terminate();
//   myWorker = undefined;
// }