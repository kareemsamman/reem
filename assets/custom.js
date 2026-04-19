import { animate, inView, scroll, stagger, frame, hover, wrap, resize, motionValue, styleEffect, transformValue } from "@theme/m";
import { $4, $$4, $id4, admEvts } from "@theme/utilities";
import { Modal, Popover, Drawer, getterAdd, getterGet, isRTL } from "@theme/global";
import { ThemeEvents } from '@theme/events';
const { dialogAdded, dialogOpening, dialogOpen, dialogClosing, dialogClose } = ThemeEvents;
import { computePosition, shift, flip, offset, arrow } from "@theme/floating";

// $4 --> singular selector
// $$4 --> plural selector
// $id4 --> id selector

// $4('.aa') == document.querySelector('.aa')
// $4('.aa', section) == section.querySelector('.aa')

// $$(.aa) == document.querySelectorAll('.aa')
// $$(.aa, section) == section.querySelectorAll('.aa')

// $id4('aa') == document.getElementById('aa')

// https://motion.dev/docs/animate
// https://motion.dev/docs/inview
// https://motion.dev/docs/scroll

// Reveal Elements On Scroll
class HdtRevealElementsOnScroll {
    constructor(container, options = {}) {
        this.container = container;
        this.isRevealVertical = false;
        this.elems = $$4('[reveal], [can-reveal]', this.container).filter(elem => !this.isInsideSliderReveal(elem));
        this.defaultDir = this.container.getAttribute('default-reveal') || (isRTL ? 'right' : 'left');
        this.options = Object.assign({
            duration: 0.48,
            delay: 0.09,
            distance: '16px',
            ease: 'easeOut',
            once: true,
            direction: this.defaultDir
        }, options);

        const attrDistance = container.getAttribute('reveal-distance');
        if (attrDistance && !isNaN(parseFloat(attrDistance))) {
            this.distance = attrDistance;
        } else {
            this.distance = this.options.distance; // fallback
        }

        if (container.hasAttribute('reveal-repeat')) {
            this.options.once = false;
        }
        this.init();
    }

    isInsideSliderReveal(elem) {
      let parent = elem.parentElement;
      while (parent) {
          if (
            (parent.tagName && (
              parent.tagName.toLowerCase() === 'hdt-slider-reveal' ||
              parent.tagName.toLowerCase() === 'hdt-reval-items'
            )) ||
            parent.classList.contains('hdt-con-reveal--disabled')
          ) return true;

          if (parent.classList.contains('hdt-con-reveal--vertical')) {
            this.isRevealVertical = true;
          }
          parent = parent.parentElement;
      }
      return false;
    }

    getElemDirection(elem) {
        let dir = elem.getAttribute('reveal');
        if (!dir && elem.hasAttribute('can-reveal')) {
            dir = this.defaultDir;
        }
        dir = dir.trim().toLowerCase();
        if (dir && ['top', 'bottom', 'left', 'right'].includes(dir)) {
          if (this.isRevealVertical && ['left', 'right'].includes(dir)) {
            dir = 'top';
          }
          if (isRTL) {
            dir = dir == 'left' ? 'right' : dir == 'right' ? 'left' : dir;
          }
          return dir;
        }
        return this.options.direction;
    }

    getTransformVals(direction, distance, forInitial = true) {
        const d = parseFloat(distance);
        if (this.isRevealVertical && ['left', 'right'].includes(direction)) {
          direction = 'top';
        }
        switch (direction) {
          case 'top': return { x: 0, y: forInitial ? -d : 0 };
          case 'bottom': return { x: 0, y: forInitial ? d : 0 };
          case 'left': return { x: forInitial ? -d : 0, y: 0 };
          case 'right': return { x: forInitial ? d : 0, y: 0 };
          default: return { x: forInitial ? -d : 0, y: 0 }; // left
        }
    }

    setElemInitialState(elem, i) {
        const direction = this.getElemDirection(elem);
        const { x, y } = this.getTransformVals(direction, this.distance, true);
        elem.style.opacity = '0';
        elem.style.clipPath = '';
        elem.style.transform = `translate(${x}px, ${y}px)`;
    }

    revealElem(elem, i) {
        const direction = this.getElemDirection(elem);
        const { x, y } = this.getTransformVals(direction, this.distance, true);

        let delay = i * this.options.delay;
        if (i > 6) {
          if (i < 10) {
              delay = 6 * this.options.delay + i * 0.2 * this.options.delay;
          } else {
              delay = 8 * this.options.delay;
          }
        }

        let opacityTo = elem.hasAttribute('aria-disabled') ? 0.5 : 1;

        animate(
          elem,
          { opacity: [0, opacityTo], x: [x, 0], y: [y, 0] },
          { duration: this.options.duration, delay: delay, ease: this.options.ease, fill: 'forwards' }
        );
    }

    init() {
        this._stopFns = [];
        this.elems.forEach((elem, i) => {
            this.setElemInitialState(elem, i);
            const stop = inView(
              elem,
              (element, enterInfo) => {
                this.revealElem(element, i);
                if (!this.options.once) {
                  return (leaveInfo) => {
                    this.setElemInitialState(element, i);
                  };
                }
              },
              { amount: 0.1 }
            );

            this._stopFns.push(stop);
        });
    }

    destroy() {
        if (this._stopFns) {
            this._stopFns.forEach(stop => {
              try { stop && stop(); } catch (e) {}
            });
            this._stopFns = [];
        }
    }
}

function hdtInitRevealOnScroll(elem) {
    if (elem._hdtRevealInstance) elem._hdtRevealInstance.destroy();
    elem._hdtRevealInstance = new HdtRevealElementsOnScroll(elem);
}

function hdtInitAllRevealOnScroll(context = document) {
    $$4('[reveal-on-scroll]', context).forEach(hdtInitRevealOnScroll);
}

hdtInitAllRevealOnScroll();

if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(e) {
        hdtInitAllRevealOnScroll(e.target);
    });

    document.addEventListener('shopify:section:unload', function(e) {
        $$4('[reveal-on-scroll]', e.target).forEach(elem => {
            if (elem._hdtRevealInstance) {
                elem._hdtRevealInstance.destroy();
                elem._hdtRevealInstance = null;
            }
        });
    });
}

class HdtAlwaysShowHc extends HTMLElement {
  constructor() {
    super();
    this.hotspots = [];
    this._onClick = this._onClick.bind(this);
    this._onOutsideClick = this._onOutsideClick.bind(this);
    this._observer = null;
    this._active = true;
    this._popoverChecked = false;
    this._onResize = this._onResize.bind(this);
    this._resizeTimer = null;
    this._ro = null;
    this.isLayered = false;
    this.container = null;
    this.hotspotsArea = null;
  }

  connectedCallback() {
    this.hotspots = [...$$4('.hdt-hotspot', this)];
    if (!this.hotspots.length) return;
    this.isLayered = this.classList.contains('hdt-always-show-hc--layered');
    this.container = $4('.hdt-image-hotspots-container', this);
    this.hotspotsArea = $4('.hdt-hotspots-area', this);
    this._updateHotspotsAreaDistance();
    this.hotspots.forEach(hotspot => {
      hotspot.addEventListener('click', this._onClick);
    });
    document.addEventListener('click', this._onOutsideClick);
    this._observer = new IntersectionObserver(this._onVisibilityChange.bind(this), {
      threshold: 0,
    });
    this._observer.observe(this);
    this._updateMetricsForAll();
    window.addEventListener('resize', this._onResize, { passive: true });
    this._ro = new ResizeObserver(() => {
      this._updateHotspotsAreaDistance();
      this._updateMetricsForAll();
    });
    this._ro.observe(this);
    if (this.container) this._ro.observe(this.container);
    if (this.hotspotsArea) this._ro.observe(this.hotspotsArea);

    if (window.Shopify && Shopify.designMode) {
      this._setupShopifyBlockSelection();
    }
  }

  disconnectedCallback() {
    this.hotspots.forEach(hotspot => {
      hotspot.removeEventListener('click', this._onClick);
    });
    document.removeEventListener('click', this._onOutsideClick);
    if (this._observer) this._observer.disconnect();
    if (this._ro) this._ro.disconnect();
    window.removeEventListener('resize', this._onResize);
  }

  _updateHotspotsAreaDistance() {
    if (!this.container || !this.hotspotsArea) return;
    const restoreContainer = this._ensureMeasurable(this.container);
    const restoreArea = this._ensureMeasurable(this.hotspotsArea);
    const cW = this.container.getBoundingClientRect().width;
    const aW = this.hotspotsArea.getBoundingClientRect().width;
    const distance = Math.max(0, (cW - aW) / 2);
    this.style.setProperty('--hsa-distance', `${distance.toFixed(2)}px`);
    if (restoreArea) restoreArea();
    if (restoreContainer) restoreContainer();
  }

  _onClick(e) {
    if (!this._active) return;
    const clicked = e.currentTarget;
    this.hotspots.forEach(h => h.classList.remove('hdt-hotspot--active'));
    clicked.classList.add('hdt-hotspot--active');
  }

  _onOutsideClick(e) {
    if (!this._active) return;
    const isInside = this.hotspots.some(hotspot => hotspot.contains(e.target));
    if (!isInside) {
      this.hotspots.forEach(h => h.classList.remove('hdt-hotspot--active'));
    }
  }

  _onResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      this._updateHotspotsAreaDistance();
      this._updateMetricsForAll();
    }, 60);
  }

  _onVisibilityChange(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!this._popoverChecked) {
          this._checkAllPopoverOverflow();
          this._popoverChecked = true;
        }
        this._updateMetricsForAll();
        this._reactivate();
      } else {
        this._deactivate();
      }
    });
  }

  _reactivate() {
    if (this._active) return;
    this.hotspots.forEach(hotspot => {
      hotspot.addEventListener('click', this._onClick);
    });
    this._active = true;
  }

  _deactivate() {
    if (!this._active) return;
    this.hotspots.forEach(hotspot => {
      hotspot.removeEventListener('click', this._onClick);
      hotspot.classList.remove('hdt-hotspot--active');
    });
    this._active = false;
  }

  _updateMetricsForAll() {
    if (!this.hotspots?.length) return;
    this.hotspots.forEach(h => this._updateMetrics(h));
  }

  _updateMetrics(hotspot) {
    const btn = $4('.hdt-hotspot__btn', hotspot)
    const popover = $4('.hdt-hotspot__popover', hotspot);
    if (!btn || !popover) return;
    const restore = this._ensureMeasurable(popover);
    const btnRect = btn.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    const btnCx = btnRect.left + btnRect.width / 2;
    const btnCy = btnRect.top + btnRect.height / 2;
    const popCx = popRect.left + popRect.width / 2;
    const popCy = popRect.top + popRect.height / 2;
    const dxRaw = popCx - btnCx;
    const dy = popCy - btnCy;
    const dxRawAbs = Math.abs(dxRaw);
    const sign = dxRaw < 0 ? -1 : 1;
    const minAbs = btnRect.width;
    const dxAbs = Math.max(dxRawAbs, minAbs);
    const dx = sign * dxAbs;
    const dyAbs = Math.abs(dy);

    hotspot.style.setProperty('--hs-dx', `${dx.toFixed(2)}px`);
    hotspot.style.setProperty('--hs-dy', `${dy.toFixed(2)}px`);
    hotspot.style.setProperty('--hs-dx-abs', `${dxAbs.toFixed(2)}px`);
    hotspot.style.setProperty('--hs-dy-abs', `${dyAbs.toFixed(2)}px`);
    hotspot.style.setProperty('--hs-popover-w', `${popRect.width.toFixed(2)}px`);
    hotspot.style.setProperty('--hs-popover-h', `${popRect.height.toFixed(2)}px`);

    if (dxAbs < btnRect.width + btnRect.width) {
      hotspot.classList.add('hdt-small-line-1');
    } else {
      hotspot.classList.remove('hdt-small-line-1');
    }

    if (sign < 0) {
      hotspot.classList.add('hdt-negative-dir-line-1');
      hotspot.classList.remove('hdt-positive-dir-line-1');
    } else {
      hotspot.classList.add('hdt-positive-dir-line-1');
      hotspot.classList.remove('hdt-negative-dir-line-1');
    }

    if (restore) restore();
  }

  _ensureMeasurable(el) {
    const cs = window.getComputedStyle(el);
    if (cs.display !== 'none' && cs.visibility !== 'hidden') return null;
    const prev = {
      display: el.style.display,
      visibility: el.style.visibility,
      transform: el.style.transform,
      position: el.style.position,
    };
    el.style.display = 'block';
    el.style.visibility = 'hidden';
    el.style.transform = 'translateZ(0)';
    if (cs.position === 'static') el.style.position = 'relative';
    return () => {
      el.style.display = prev.display;
      el.style.visibility = prev.visibility;
      el.style.transform = prev.transform;
      el.style.position = prev.position;
    };
  }

  _checkAllPopoverOverflow() {
    if (!this.hotspotsArea) return;
    const hotspotsAreaRect = this.hotspotsArea.getBoundingClientRect();
    this.hotspots.forEach(hotspot => {
      const popover = $4('.hdt-hotspot__popover', hotspot);
      if (!popover) return;
      const popoverRect = popover.getBoundingClientRect();
      if (popoverRect.top < hotspotsAreaRect.top) {
        popover.classList.add('hdt-is-over-top');
      }
      if (popoverRect.bottom > hotspotsAreaRect.bottom) {
        popover.classList.add('hdt-is-over-bottom');
      }
    });
  }

  _setupShopifyBlockSelection() {
    document.addEventListener('shopify:block:select', event => {
      const block = event.target;
      const hotspot = block.closest('.hdt-hotspot');
      if (hotspot) {
        hotspot.classList.add('hdt-hotspot--active');
      }
    });
    document.addEventListener('shopify:block:deselect', event => {
      const block = event.target;
      const hotspot = block.closest('.hdt-hotspot');
      if (hotspot) {
        hotspot.classList.remove('hdt-hotspot--active');
      }
    });
  }
}

customElements.define('hdt-always-show-hc', HdtAlwaysShowHc);

class PopoverAnimate extends Popover {
  animateDialogOpen() {
    if (this._openedAsModal) {
      return super.animateDialogOpen();
    } else {
      this.updatePos(this.dialog.btnOpening, this.dialog, this.arrowEl, this.placement);
      const sequence = [
        [ this.dialog, { top: ["10px","0"],  opacity: [0, 1], visibility: ["hidden", "visible"], clipPath: [`inset(50px round var(--rounded-sm))`, `inset(0 round var(--rounded-sm))`] }, { duration: 0.4 } ],
        [ $4('.hdt-popover__body', this).children, { clipPath: [`inset(100% round 0)`, `inset(0 round var(--rounded-sm))`] }, { at: "<", duration: 0.4, } ],
        [ $4('.hdt-popover__arrow', this), { opacity: [0, 1], transform: [`rotate(45deg) translateY(15px)`, `rotate(45deg) translateY(0)`] }, { at: ">", duration: 0.1 } ],
      ];
      return animate(sequence);
    }
  }

  animateDialogClose() {
    if (this._openedAsModal) {
      return super.animateDialogClose();
    } else {
      const sequence = [
        [$4('.hdt-popover__body', this).children, { opacity: 0 }, { duration: 0.15 }],
        [this.dialog,{ top: ["0","10px"], opacity: [1, 0], visibility: ["visible", "hidden"] }, { at: "<", duration: 0.15 }]
      ];
      return animate(sequence);
    }
  }
}

customElements.define("hdt-popover-animate", PopoverAnimate);

class ModalStory extends Modal {
  constructor() {
    super();
    this._animating = false;
    this._phase = null;
    this._ghost = null;
    this._openTriggerEl = null;
    this._openPsiEl = null;
    this._openPsiRectSnapshot = null;
    this._openToken = null;
    this._openSeq = 0;
    this._productsStorySlider = null;
    this._radiusCache = new Map();
    this._marqueeCompensationPx = 25.5;
    this._marqueeAutoConfigured = null;
    this._marqueeHold = false;
    this._marqueeGuardAbort = null;
  }

  wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  _lock(phase) { if (this._animating) return false; this._animating = true; this._phase = phase; return true; }
  _unlock() { this._animating = false; this._phase = null; }
  _rect(el) { return el.getBoundingClientRect(); }

  _getStopMarqueeFlag() {
    const val = this.getAttribute('data-stop-marquee-on-open');
    if (val == null) return true;
    const v = String(val).toLowerCase();
    return !(v === 'false' || v === '0' || v === 'no' || v === 'off');
  }

  _getPsiInner(trigger) {
    if (!trigger) return null;
    try { return $4(':scope > .hdt-psi-inner', trigger) || $4('.hdt-psi-inner', trigger); }
    catch { return $4('.hdt-psi-inner', trigger); }
  }

  async _waitForJustClicked(maxMs = 5, stepMs = 16) {
    const sel = `.hdt-just-clicked[data-target="#${this.dialog?.id}"]`;
    const t0 = performance.now();
    let el = $4(sel, document);
    while (!el && (performance.now() - t0) < maxMs) {
      await this.wait(stepMs);
      el = $4(sel, document);
    }
    return el || null;
  }

  _calcTargetSizeFromPsiRect(psiRect) {
    const w0 = Math.max(1, Math.round(psiRect.width));
    const h0 = Math.max(1, Math.round(psiRect.height));
    const viewportW = Math.max(1, document.documentElement?.clientWidth || window.innerWidth || 1);
    const vwLimit = Math.max(1, viewportW - 30);
    const maxW = Math.min(580, vwLimit);
    const targetW = Math.min(Math.round(w0 * 2), Math.round(maxW));
    const k = targetW / w0;
    const targetH = Math.max(1, Math.round(h0 * k));
    return { targetW, targetH };
  }

  _applyDialogFixedSize(targetW, targetH) {
    const dlg = this.dialog;
    const prev = { w: dlg.style.width, h: dlg.style.height, opacity: dlg.style.opacity, visibility: dlg.style.visibility };
    dlg.style.width = `${targetW}px`;
    dlg.style.height = `${targetH}px`;
    return prev;
  }

  _resolveVarPx(varName, fallback = 12) {
    if (this._radiusCache.has(varName)) return this._radiusCache.get(varName);
    const tmp = document.createElement('div');
    tmp.style.position = 'absolute';
    tmp.style.visibility = 'hidden';
    tmp.style.borderTopLeftRadius = `var(${varName})`;
    document.body.appendChild(tmp);
    const px = parseFloat(getComputedStyle(tmp).borderTopLeftRadius) || fallback;
    tmp.remove();
    this._radiusCache.set(varName, px);
    return px;
  }

  _getOrCreateGhost() {
    if (!this._ghost) {
      const ghost = document.createElement('div');
      ghost.className = 'hdt-story-ghost';
      Object.assign(ghost.style, {
        position: 'fixed',
        transformOrigin: 'top left',
        pointerEvents: 'none',
        zIndex: '11',
        overflow: 'hidden'
      });
      document.body.appendChild(ghost);
      this._ghost = ghost;
    }
    return this._ghost;
  }

  _resetGhost(ghost, startRect, radiusPxStart, psi) {
    Object.assign(ghost.style, {
      left: `${startRect.left}px`,
      top: `${startRect.top}px`,
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      clipPath: `inset(0 0 0 0 round ${radiusPxStart}px)`,
      transform: 'translate(0,0) scale(1,1)'
    });

    ghost.replaceChildren();
    const img = psi?.querySelector?.('img');
    if (img) {
      const gImg = img.cloneNode(false);
      gImg.src = img.currentSrc || img.src;
      gImg.alt = img.alt || '';
      const cs = getComputedStyle(img);
      Object.assign(gImg.style, {
        width: '100%',
        height: '100%',
        display: 'block',
        objectFit: cs.objectFit || 'cover',
        objectPosition: cs.objectPosition || 'center'
      });
      ghost.appendChild(gImg);
    } else {
      const div = document.createElement('div');
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.background = psi ? getComputedStyle(psi).backgroundColor || '#000' : '#000';
      ghost.appendChild(div);
    }
  }

  _destroyGhost() {
    if (this._ghost) {
      const img = $4('img', this._ghost);
      if (img) { try { img.src = ''; } catch(e) {} }
      this._ghost.replaceChildren();
      this._ghost.remove();
      this._ghost = null;
    }
  }

  _calcTransform(startRect, endRect) {
    const dx = endRect.left - startRect.left;
    const dy = endRect.top  - startRect.top;
    const sx = Math.max(0.01, endRect.width  / Math.max(1, startRect.width));
    const sy = Math.max(0.01, endRect.height / Math.max(1, startRect.height));
    return { dx, dy, sx, sy };
  }

  _animateGhost(ghost, startRect, endRect, { duration = 0.48, easing = [0.19, 1, 0.22, 1], radiusFromPx, radiusToPx } = {}) {
    const { dx, dy, sx, sy } = this._calcTransform(startRect, endRect);
    return animate(
      ghost,
      {
        transform: [ 'translate(0px, 0px) scale(1, 1)', `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` ],
        clipPath: [ `inset(0 0 0 0 round ${radiusFromPx}px)`, `inset(0 0 0 0 round ${radiusToPx}px)` ]
      },
      { duration, easing }
    );
  }

  _ensureSliderFromTrigger(trigger) {
    if (this._productsStorySlider && this._productsStorySlider.isConnected) return this._productsStorySlider;
    this._productsStorySlider = trigger?.closest?.('.hdt-slider--products-story') || null;

    if (this._productsStorySlider && this._marqueeAutoConfigured === null) {
      this._snapshotMarqueeAutoConfigured();
    }
    return this._productsStorySlider;
  }

  _getSliderApi() {
    const el = this._productsStorySlider;
    if (!el) return null;
    return el.apiS || el.api || el.slider || null;
  }

  _getAutoScrollPlugin() {
    const api = this._getSliderApi();
    if (!api) return null;
    try {
      const plugs = typeof api.plugins === 'function' ? api.plugins() : api.plugins;
      return plugs?.autoScroll || null;
    } catch {
      return null;
    }
  }

  _snapshotMarqueeAutoConfigured() {
    let configured = !!this._getAutoScrollPlugin();
    if (!configured) {
      const cfg = this._getSliderConfig();
      if (cfg && Object.prototype.hasOwnProperty.call(cfg, 'marquee')) {
        configured = Number(cfg.marquee) !== 0;
      }
    }
    this._marqueeAutoConfigured = !!configured;
  }

  async _isMarqueePlaying(delayMs = 1) {
    if (!this._productsStorySlider) return false;
    if (delayMs > 0) await this.wait(delayMs);
    try {
      return this._productsStorySlider.apiS.plugins()?.autoScroll.isPlaying();
    } catch {
      return false;
    }
  }

  async _stopMarquee(delayMs = 1) {
    if (!this._productsStorySlider) return false;
    if (delayMs > 0) await this.wait(delayMs);
    try {
      this._productsStorySlider.apiS.plugins()?.autoScroll.stop();
      return true;
    } catch {
      return false;
    }
  }

  _playMarquee() {
    if (!this._productsStorySlider) return false;
    try {
      this._productsStorySlider.apiS.plugins()?.autoScroll.play();
      return true;
    } catch {
      return false;
    }
  }

  _getSliderConfig() {
    const el = this._productsStorySlider;
    if (!el) return null;
    let cfg = null;
    try { cfg = el.config && typeof el.config === 'object' ? el.config : null; } catch {}
    if (!cfg) {
      const attr = el.getAttribute && el.getAttribute('config');
      if (attr) { try { cfg = JSON.parse(attr); } catch {} }
    }
    return cfg && typeof cfg === 'object' ? cfg : null;
  }

  _shouldApplyMarqueeCompensation() {
    const vp = Math.max(1, document.documentElement?.clientWidth || window.innerWidth || 1);
    if (vp < 1025) return false;
    const cfg = this._getSliderConfig();
    if (!cfg || !Object.prototype.hasOwnProperty.call(cfg, 'marquee')) return false;
    const m = Number(cfg.marquee) || 0;
    if (m === 0) return false;
    const stopFlag = this._getStopMarqueeFlag();
    if (stopFlag) return false;
    return true;
  }

  _compensateRectForMarquee(rect) {
    if (!this._shouldApplyMarqueeCompensation()) return rect;
    const cfg = this._getSliderConfig();
    const m = Number(cfg.marquee) || 0;
    const dir = m > 0 ? -1 : 1;
    const comp = Number(this._marqueeCompensationPx || 0);
    if (!comp) return rect;
    const left = rect.left + dir * comp;
    return { left, top: rect.top, width: rect.width, height: rect.height };
  }

  _enableMarqueeHoldGuards() {
    if (!this._productsStorySlider || this._marqueeGuardAbort) return;
    this._marqueeGuardAbort = new AbortController();
    const { signal } = this._marqueeGuardAbort;
    const reStop = () => { if (this._marqueeHold) { this._stopMarquee(0); } };
    const slider = this._productsStorySlider;
    slider.addEventListener('pointerenter', reStop, { signal, passive: true, capture: true });
    slider.addEventListener('pointerleave', reStop, { signal, passive: true, capture: true });
    slider.addEventListener('pointerup',    reStop, { signal, passive: true, capture: true });
    window.addEventListener('mouseup',      reStop, { signal, passive: true, capture: true });
    window.addEventListener('touchend',     reStop, { signal, passive: true, capture: true });
    setTimeout(() => reStop(), 0);
    setTimeout(() => reStop(), 60);
  }

  _disableMarqueeHoldGuards() {
    if (this._marqueeGuardAbort) {
      try { this._marqueeGuardAbort.abort(); } catch {}
      this._marqueeGuardAbort = null;
    }
  }
  async animateDialogOpen() {
    if (!this._lock('opening')) return animate(document.body, {}, { duration: 0 });
    const dlg = this.dialog;
    if (!dlg) { this._unlock(); return animate(document.body, {}, { duration: 0 }); }
    const token = ++this._openSeq;
    this._openToken = token;
    const prevVis = dlg.style.visibility;
    const prevOpacity = dlg.style.opacity;
    dlg.style.visibility = 'hidden';
    dlg.style.opacity = '0';
    const trigger = await this._waitForJustClicked(5, 16);
    if (!trigger) {
      dlg.style.visibility = prevVis || '';
      const ctrl = animate(
        dlg,
        { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0)'] },
        { duration: 0.3, easing: [0.19, 1, 0.22, 1] }
      );
      ctrl.finished.finally(() => { dlg.style.opacity = prevOpacity || ''; this._unlock(); });
      return ctrl;
    }

    const psi = this._getPsiInner(trigger);
    if (!psi) {
      dlg.style.visibility = prevVis || '';
      const ctrl = animate(
        dlg,
        { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0)'] },
        { duration: 0.3, easing: [0.19, 1, 0.22, 1] }
      );
      ctrl.finished.finally(() => { dlg.style.opacity = prevOpacity || ''; this._unlock(); });
      return ctrl;
    }
    this._openTriggerEl = trigger;
    this._openPsiEl = psi;
    this._ensureSliderFromTrigger(trigger);
    const stopFlag = this._getStopMarqueeFlag();
    if (stopFlag && this._marqueeAutoConfigured) {
      this._marqueeHold = true;
      await this._stopMarquee(0);
      this._enableMarqueeHoldGuards();
    }
    const startRect = this._rect(psi);
    this._openPsiRectSnapshot = { left: startRect.left, top: startRect.top, width: startRect.width, height: startRect.height };
    const { targetW, targetH } = this._calcTargetSizeFromPsiRect(startRect);
    const prevDlg = this._applyDialogFixedSize(targetW, targetH);
    dlg.getBoundingClientRect();
    const endRect = this._rect(dlg);
    const rStart = this._resolveVarPx('--rounded-product-card', 12);
    const rEnd   = this._resolveVarPx('--rounded', 16);
    const ghost = this._getOrCreateGhost();
    this._resetGhost(ghost, startRect, rStart, psi);
    dlg.style.visibility = prevVis || 'visible';
    const ghostControls = this._animateGhost(ghost, startRect, endRect, {
      duration: 0.5, easing: [0.19, 1, 0.22, 1], radiusFromPx: rStart, radiusToPx: rEnd
    });
    const fadeInDlg = animate(
      dlg, { opacity: [0, 1] },
      { duration: 0.16, delay: 0.34, easing: [0.19, 1, 0.22, 1] }
    );
    Promise.all([ghostControls.finished, fadeInDlg.finished])
      .catch(() => {})
      .finally(() => {
        if (this._marqueeHold) { this._stopMarquee(0); }
        this._destroyGhost();
        dlg.style.opacity = prevOpacity || '';
        this._unlock();
      });
    return ghostControls;
  }

  async animateDialogClose() {
    if (!this._lock('closing')) return animate(document.body, {}, { duration: 0 });
    const dlg = this.dialog;
    if (!dlg) { this._unlock(); return animate(document.body, {}, { duration: 0 }); }
    const tokenAtClose = this._openToken;
    const dlgRect = this._rect(dlg);
    let psi = (this._openPsiEl && this._openPsiEl.isConnected) ? this._openPsiEl : null;
    let endRect;
    if (psi) {
      endRect = this._rect(psi);
    } else if (this._openPsiRectSnapshot) {
      endRect = this._openPsiRectSnapshot;
    } else {
      const ctrl = animate(
        dlg,
        { opacity: [1, 0], transform: ['translateY(0)', 'translateY(12px)'] },
        { duration: 0.25, easing: [0.19, 1, 0.22, 1] }
      );
      ctrl.finished.finally(() => {
        this._marqueeHold = false;
        this._disableMarqueeHoldGuards();

        const stopFlag = this._getStopMarqueeFlag();
        const shouldResume = stopFlag && !!this._marqueeAutoConfigured;
        if (shouldResume && tokenAtClose === this._openToken) {
          this._playMarquee();
        }
        this._unlock();
      });
      return ctrl;
    }
    endRect = this._compensateRectForMarquee(endRect);
    const rStart = this._resolveVarPx('--rounded', 16);
    const rEnd   = this._resolveVarPx('--rounded-product-card', 12);
    const ghost = this._getOrCreateGhost();
    this._resetGhost(ghost, dlgRect, rStart, psi);
    const fadeOutDlg = animate(
      dlg, { opacity: [1, 0] },
      { duration: 0.16, easing: [0.19, 1, 0.22, 1] }
    );
    const ghostControls = this._animateGhost(ghost, dlgRect, endRect, {
      duration: 0.4, easing: [0.19, 1, 0.22, 1], radiusFromPx: rStart, radiusToPx: rEnd
    });
    Promise.all([ghostControls.finished, fadeOutDlg.finished])
      .catch(() => {})
      .finally(() => {
        this._destroyGhost();
        this._openTriggerEl = null;
        this._openPsiEl = null;
        this._openPsiRectSnapshot = null;
        this._marqueeHold = false;
        this._disableMarqueeHoldGuards();
        if (!(this._productsStorySlider?.isConnected)) this._productsStorySlider = null;
        const stopFlag = this._getStopMarqueeFlag();
        const shouldResume = stopFlag && !!this._marqueeAutoConfigured;
        if (shouldResume && tokenAtClose === this._openToken) {
          this._playMarquee();
        }
        this._unlock();
      });

    return ghostControls;
  }
}

customElements.define('hdt-modal-story', ModalStory);

class ControlModalStory extends HTMLElement {
    constructor() {
        super();
        this._observer = null;
        this._onClick = this._onClick.bind(this);
        this.modal = null;
    }

    connectedCallback() {
        const targetSelector = this.dataset.target;
        this.modal = $4(targetSelector);
        this._initObserver();
    }

    disconnectedCallback() {
        this._disconnectObserver();
        this._removeClickHandler();
        this.classList.remove('hdt-just-clicked');
    }

    _initObserver() {
        this._observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                this._addClickHandler();
            } else {
                this._removeClickHandler();
                this._resetTargetWidth();
            }
        });
        this._observer.observe(this);
    }

    _disconnectObserver() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }

    _addClickHandler() {
        this.addEventListener('click', this._onClick);
    }

    _removeClickHandler() {
        this.removeEventListener('click', this._onClick);
    }

    _onClick(e) {
        const _this = this;
        if (!_this.contains(e.target)) return;
        const targetSelector = _this.dataset.target;
        if (!targetSelector) return;
        const targetEl = $4(targetSelector);
        if (!targetEl) return;
        const width = _this.offsetWidth;
        targetEl.style.setProperty('--item-width', `${width}px`);
        const sliderSelector = _this.dataset.slider;
        if (sliderSelector) {
            const slider = $4(sliderSelector);
            const parentSloder = _this.closest('.hdt-slider--products-story');
            const clickedSiblings = $$4('.hdt-product-story-item.hdt-just-clicked', parentSloder);
            clickedSiblings.forEach(el => {
                if (el !== _this) el.classList.remove('hdt-just-clicked');
            });
            _this.classList.add('hdt-just-clicked');
            const sliderButtons = $$4('.hdt-indicators--products-story button', targetEl);
            const slideIndex = _this.dataset.index;
            setTimeout(() => {
                sliderButtons.forEach(btn => {
                    btn.setAttribute('aria-current', false);
                });
                slider.goToIndex(slideIndex, true);
                const currentBtn = $4(`.hdt-indicators--products-story button[value="${slideIndex}"]`, targetEl);
                if (currentBtn) currentBtn.setAttribute('aria-current', true);
            }, 10);
        }
    }

    _resetTargetWidth() {
        const targetSelector = this.dataset.target;
        if (!targetSelector) return;

        const targetEl = $4(targetSelector);
        if (targetEl) {
            targetEl.style.removeProperty('--item-width');
        }
    }
}
customElements.define('hdt-control-modal-story', ControlModalStory);

class HdtShrinkOnSroll extends HTMLElement {
  constructor() {
    super();
    this.inner = null;
    this.cleanupFns = [];
    this._onResize = this._onResize.bind(this);
  }

  connectedCallback() {
    this.inner = $4('.hdt-shrink-on-sroll-inner', this);
    window.addEventListener('resize', this._onResize);
    this._setupScrollEffect();
  }

  disconnectedCallback() {
    this._cleanup();
    window.removeEventListener('resize', this._onResize);
  }

  _cleanup() {
    this.cleanupFns.forEach(fn => fn && fn());
    this.cleanupFns = [];
  }

  _isMobile() {
    return window.innerWidth < 768;
  }

  _setupScrollEffect() {
    this._cleanup();
    const isExpand = this.dataset.expand === 'true';
    const expandFromBottom = this.dataset.expandFromBottom === 'true';
    const removeRoundOnExpand = this.dataset.expandRemoveRound !== 'false';
    if (this.getAttribute('mobile') === 'false' && this._isMobile()) {
      if (this.inner) this.inner.style.clipPath = '';
      return;
    }
    if (isExpand && expandFromBottom) {
      this._setupBottomExpandEffect(removeRoundOnExpand);
      return;
    }
    if (this.inner) {
      const fromClip = isExpand ? `inset(0 var(--clip-x) 0 var(--clip-x) round var(--rounded-lg))` : `inset(0 round 0)`;
      const toClip = isExpand ? (removeRoundOnExpand ? `inset(0 round 0)` : `inset(0 round var(--rounded-lg))`) : `inset(0 var(--clip-x) 0 var(--clip-x) round var(--rounded-lg))`;
      const offsets = isExpand ? ['0 1', '1 0.7'] : ['1 0.8', '1 0.1'];
      this.cleanupFns.push(
        scroll( animate(this.inner, { clipPath: [fromClip, toClip] }), { offset: offsets, target: this } )
      );
    }
    this._setupTranslateEffects(isExpand);
  }

  _setupBottomExpandEffect(removeRoundOnExpand = true) {
    const el = this;
    const inner = this.inner;
    if (!inner) return;
    const START_GAP = 60;
    const END_GAP = 80;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const bottom = rect.bottom;
      let progress;
      const start = vh - START_GAP;
      const end = END_GAP;
      if (bottom >= start) {
        progress = 0;
      } else if (bottom <= end) {
        progress = 1;
      } else {
        progress = (start - bottom) / (start - end);
      }
      this._applyExpandProgress(progress, removeRoundOnExpand);
      this._applyTranslateProgress(progress);
    };

    // onScroll();
    // window.addEventListener('scroll', onScroll, { passive: true });
    // this.cleanupFns.push(() => window.removeEventListener('scroll', onScroll));
    this.cleanupFns.push(scroll(onScroll));
  }

  _applyExpandProgress(progress, removeRoundOnExpand = true) {
    const p = Math.min(Math.max(progress, 0), 1);
    if (removeRoundOnExpand) {
      this.inner.style.clipPath = `inset(0 calc(var(--clip-x) * ${1 - p}) 0 calc(var(--clip-x) * ${1 - p}) round calc(var(--rounded-lg) * ${1 - p}))`;
    } else {
      this.inner.style.clipPath = `inset(0 calc(var(--clip-x) * ${1 - p}) 0 calc(var(--clip-x) * ${1 - p}) round var(--rounded-lg))`;
    }
  }

  _applyTranslateProgress(progress) {
    const isMobile = this._isMobile();
    const candidates = $$4('[data-shrink-translate], [data-shrink-translate_mb]', this);
    const p = Math.min(Math.max(progress, 0), 1);
    candidates.forEach(el => {
      const attrName = isMobile ? 'data-shrink-translate_mb' : 'data-shrink-translate';
      if (!el.hasAttribute(attrName)) return;
      const dir = (el.getAttribute(attrName) || '').trim();
      if (!dir) return;
      const base = dir === 'start' ? 'var(--clip-x)' : dir === 'end' ? 'calc(var(--clip-x) * -1)' : '0px';
      el.style.transform = `translateX(calc(${base} * ${1 - p}))`;
    });
  }

  _setupTranslateEffects(isExpand = false) {
    const isMobile = this._isMobile();
    const candidates = $$4('[data-shrink-translate], [data-shrink-translate_mb]', this);
    candidates.forEach(el => {
      const attrName = isMobile ? 'data-shrink-translate_mb' : 'data-shrink-translate';
      if (!el.hasAttribute(attrName)) return;
      let dir = (el.getAttribute(attrName) || '').trim(); // "start" | "end"
      if (!dir) return;
      dir = isRTL ? dir == 'start' ? 'end': 'start': dir;
      let fromVal = dir === 'start' ? 'calc(var(--clip-x) * 1)' : dir === 'end' ? 'calc(var(--clip-x) * -1)' : '0px';
      let toVal = '0px';
      if (!isExpand) {
        fromVal = '0px';
        toVal = dir === 'start' ? 'calc(var(--clip-x) * 1)' : dir === 'end' ? 'calc(var(--clip-x) * -1)' : '0px';
      }
      const offsets = isExpand ? ['0 1', '1 0.7'] : ['1 0.8', '1 0.1'];
      const stop = scroll(
        animate(el, { transform: [`translateX(${fromVal})`, `translateX(${toVal})`] }),
        { offset: offsets, target: this }
      );
      this.cleanupFns.push(stop);
    });
  }

  _onResize() {
    this._setupScrollEffect();
  }
}

customElements.define('hdt-shrink-on-sroll', HdtShrinkOnSroll);

class HDTPausePlaySlider extends HTMLElement {
  connectedCallback() {
    this.btn    = $4('.hdt-btn-control_media', this);
    this.wPlay  = $4('.hdt-ic-play-wrap', this)
    this.wPause = $4('.hdt-ic-pause-wrap', this);
    const id = this.btn.getAttribute('aria-controls');
    const esc = (CSS && CSS.escape) ? CSS.escape(id) : id;
    this.slider = document.querySelector(`#${esc}`);
    this.slider.autoScrollActive && this.slider.autoScrollActive();
    this.auto = this.slider.apiS.plugins()?.autoScroll;
    const hoverDelay = 20;
    const hovIn  = () => { setTimeout(() => this._sync('hover-in'),  hoverDelay); };
    const hovOut = () => { setTimeout(() => this._sync('hover-out'), hoverDelay); };
    this.slider.addEventListener('pointerenter', hovIn);
    this.slider.addEventListener('pointerleave', hovOut);
    this.slider.addEventListener('mouseenter',   hovIn);
    this.slider.addEventListener('mouseleave',   hovOut);
    this.slider.addEventListener('click', () => {
      this._sync('slider-click');
    });

    this.btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this._isPlaying()) { this.auto.stop(); }
      else { this.auto.play(); }
      this._sync('after-button');
    });

    this._sync('init');
  }

  _isPlaying() { return !!this.auto.isPlaying(); }

  _sync(tag) {
    const playing = this._isPlaying();
    this.wPlay.toggleAttribute('hidden',  playing);
    this.wPause.toggleAttribute('hidden', !playing);
    this.btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }
}
customElements.define('hdt-pause-play-slider', HDTPausePlaySlider);

class HdtGalleryHero extends HTMLElement {
  constructor() {
    super();
    this._observer = null;
    this._scrollEffects = [];
    this._scrollTarget = null;
    this._heroMain = null;
    this._heroMedia = null;
    this._mediaContent = null;
    this._heroSectionHeader = null;
    this._flyingGrid = null;
  }

  connectedCallback() {
    if (window.Shopify && window.Shopify.designMode) {
        this.classList.add('hdt-is-customizer');
        const grid = $4('.hdt-gallery-flying-grid', this);
        if (grid && !$4('.hdt-grid-toggle', grid)) {
            grid.classList.add('show-grid');
            const toggleBtn = document.createElement('span');
            toggleBtn.className = 'hdt-grid-toggle';
            toggleBtn.textContent = 'GRID';
            grid.appendChild(toggleBtn);
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                grid.classList.toggle('show-grid');
                toggleBtn.classList.toggle('inactive', !grid.classList.contains('show-grid'));
            });
        }
    }
    this._observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.initAnimations();
          this._observer.disconnect();
        }
      }
    }, { threshold: 0 });
    this._observer.observe(this);
  }

  disconnectedCallback() {
    this.cleanupAnimations();
    this._observer?.disconnect();
    this._observer = null;
    if (window.Shopify && window.Shopify.designMode) {
        this.classList.remove('hdt-is-customizer');
        const grid = $4('.hdt-gallery-flying-grid', this);
        if (grid) {
            grid.classList.remove('show-grid');
            const toggleBtn = $4('.hdt-grid-toggle', grid);
            if (toggleBtn) toggleBtn.remove();
        }
    }
  }

  initAnimations() {
    this._scrollTarget = $4('.hdt-hero-gallery-inner', this);
    this._heroMain = $4('.hdt-hero-main', this);
    this._heroMedia = $4('.hdt-media-overlap-content', this);
    this._mediaContent = $4('.hdt-media-content', this);
    this._heroSectionHeader = $4('.hdt-section__header--hero-gallery', this);
    this._flyingGrid = $4('.hdt-gallery-flying-grid', this);
    const items = Array.from($$4('.hdt-hero-gallery-item', this));
    const scrollEnd = 0.8;
    this.style.setProperty("--total-items", items.length);
    const duration = 0.3;
    const animateStagger = Math.min((scrollEnd - duration) / items.length, 0.08);
    if (this._heroSectionHeader) {
      const headerEffect = scroll(
        animate(this._heroSectionHeader, { opacity: [0, 1, 1], scale: [0.2, 1], y: [-300, 0] }),
        { offset: ["0 0.7", 0.1], target: this }
      );
      this._scrollEffects.push(headerEffect);
    }

    items.forEach((item, i) => {
      const rowStart = Number(item.style.getPropertyValue('--row-start'));
      const rowEnd = Number(item.style.getPropertyValue('--row-end'));
      const colStart = Number(item.style.getPropertyValue('--col-start'));
      const colEnd = Number(item.style.getPropertyValue('--col-end'));
      const rowCenter = rowStart <= 3 ? 3 : 4;
      const colCenter = colStart <= 6 ? 6 : 7;
      const rowAlign = 'start';
      const colAlign = 'start';
      item.classList.add(`hdt-align--${rowAlign}-${colAlign}`);
      const itemCenterPos = this.getGridItemPosition(rowCenter, colCenter, null, null, `${rowAlign}-${colAlign}`);
      const itemPos = this.getGridItemPosition(rowStart, colStart, rowEnd, colEnd, `${rowAlign}-${colAlign}`);
      const dx = itemCenterPos.x - itemPos.x;
      const dy = itemCenterPos.y - itemPos.y;
      const appearStart = i * animateStagger;
      const appearEnd = appearStart + duration * 0.4;
      const disappearEnd = appearStart + duration;
      const endPoint = this.getEndPointOnLine(dx, dy);
      if (rowStart >= 5 || colStart >= 10) { endPoint.dx = 0; endPoint.dy = 0; }
      const video = $4('video.hdt-hero-gallery-video', item);
      if (video) {
        video.loop = true;
        video.play().catch(() => {});
        item.classList.add('hdt-video-playing');
      }

      const effect = scroll(
        animate(item, {
          opacity: [0, 1, 1, 1, 0, 0],
          x: [dx, endPoint.dx],
          y: [dy, endPoint.dy],
          width: [ 'calc(var(--item-size-percent) * 25vw)', 'calc(var(--item-size-percent) * 200vw)' ],
        }),
        { offset: [appearStart, appearEnd, disappearEnd], target: this }
      );
      this._scrollEffects.push(effect);
    });
    const lastDisappearEnd = (items.length - 1) * animateStagger + duration;
    const mediaStart = lastDisappearEnd - animateStagger - 0.1;
    const mediaEnd = 0.9;
    const mediaEffect = scroll(
      animate(this._heroMedia, {
        clipPath: [ `inset(50% round calc(var(--rounded) * 0.7))`, `inset(0% round var(--rounded))`, `inset(0% round 0)` ]
      }),
      { offset: [mediaStart, mediaEnd], target: this._scrollTarget }
    );
    this._scrollEffects.push(mediaEffect);
    const contentEffect = scroll(
      animate(this._mediaContent, { opacity: [0, 1, 1, 1, 1, 1], transform: [`scale(0.4)`, `scale(1)`], }),
      { offset: [mediaStart, mediaEnd], target: this._scrollTarget }
    );
    this._scrollEffects.push(contentEffect);
    const containerEffect = scroll(
      animate(this, {
        clipPath: [ `inset(0 round 0)`, `inset(0 var(--pd-container) 0 var(--pd-container) round var(--rounded))` ]
      }),
      { offset: [`${mediaEnd} end`, `end end`], target: this._scrollTarget }
    );
    this._scrollEffects.push(containerEffect);
  }

  cleanupAnimations() {
    this._scrollEffects.forEach(effect => effect?.destroy?.());
    this._scrollEffects = [];
    const items = Array.from($$4('.hdt-hero-gallery-item', this));
    for (const item of items) {
      item.style.opacity = "";
      item.style.transform = "";
      item.style.width = "";
      item.classList.remove(...Array.from(item.classList).filter(cls => cls.startsWith("hdt-align--")));
    }
    if (this._heroMedia) {
      this._heroMedia.style.opacity = "";
      this._heroMedia.style.clipPath = "";
      this._heroMedia.style.paddingInline = "";
    }
    if (this._heroSectionHeader) {
      this._heroSectionHeader.style.opacity = "";
      this._heroSectionHeader.style.scale = "";
      this._heroSectionHeader.style.transform = "";
    }
    this.style.clipPath = "";
  }

  getEndPointOnLine(dx, dy, lengthRatio = 1) {
    return { dx: -dx * lengthRatio, dy: -dy * lengthRatio };
  }

  getGridItemPosition(rowStart, colStart, rowEnd = null, colEnd = null, position = 'start-start') {
    const COLS = 12;
    const ROWS = 6;
    const rect = this._flyingGrid.getBoundingClientRect();
    const gridWidth = rect.width;
    const gridHeight = rect.height;
    if (rowEnd === null) rowEnd = rowStart + 1;
    if (colEnd === null) colEnd = colStart + 1;
    const cellWidth = gridWidth / COLS;
    const cellHeight = gridHeight / ROWS;
    const left = (colStart - 1) * cellWidth;
    const top = (rowStart - 1) * cellHeight;
    const right = (colEnd - 1) * cellWidth;
    const bottom = (rowEnd - 1) * cellHeight;
    switch(position) {
      case 'start-start':
        return { x: left, y: top };
      case 'start-end':
        return { x: right, y: top };
      case 'end-start':
        return { x: left, y: bottom };
      case 'end-end':
        return { x: right, y: bottom };
      case 'center':
        return {
          x: left + (right - left) / 2,
          y: top + (bottom - top) / 2
        };
      default:
        return { x: left, y: top };
    }
  }
}

customElements.define('hdt-gallery-hero', HdtGalleryHero);
class HeroCollections extends HTMLElement {
  constructor() {
    super();
    this._cleanupFns = [];
    this._onResize = this._onResize.bind(this);
    this._focusScrollToken = 0;
    this._focusRecheckTimer = null;
    this._scrollCardIntoView = this._scrollCardIntoView.bind(this);
    this._cancelFocusScroll = this._cancelFocusScroll.bind(this);
  }

  connectedCallback() {
    this._init();
    window.addEventListener('resize', this._onResize);
  }

  disconnectedCallback() {
    this._cleanup();
    window.removeEventListener('resize', this._onResize);
  }

  _onResize() {
    this._cancelFocusScroll();
    this._cleanup();
    this._init();
  }

  _cleanup() {
    this._cancelFocusScroll();
    this._cleanupFns.forEach(fn => fn && fn());
    this._cleanupFns = [];
    if (!this._isDesktop()) {
      this._resetNonDesktopStyles();
    }
  }

  _cancelFocusScroll() {
    this._focusScrollToken++;
    if (this._focusRecheckTimer) {
      clearTimeout(this._focusRecheckTimer);
      this._focusRecheckTimer = null;
    }
  }

  _clamp(v, min = 0, max = 1) {
    return Math.min(max, Math.max(min, v));
  }

  _isDesktop() {
    return window.matchMedia('(pointer: fine)').matches && window.innerWidth > 1024;
  }

  _resetNonDesktopStyles() {
    const collectionsContent = $4('.hdt-hero-collections-content', this);
    const sectionHeaderWrap = $4('.hdt-section__header-wrap', this);
    const collectionsScrollInner = $4('.hdt-collections-tilted-scroll-inner', this);
    const sectionHeader = $4('.hdt-section__header', this);
    const collectionsScroll = $4('.hdt-collections-tilted-scroll', this);
    const titleCards = $$4('.hdt-cl-tilted-card', this);

    this.style.removeProperty('--content-height');

    if (collectionsContent) {
      collectionsContent.style.removeProperty('clip-path');
      collectionsContent.style.removeProperty('transform');
    }

    if (sectionHeaderWrap) {
      sectionHeaderWrap.style.removeProperty('transform');
    }

    if (collectionsScrollInner) {
      collectionsScrollInner.style.removeProperty('transform');
    }

    if (sectionHeader) {
      sectionHeader.style.removeProperty('opacity');
      sectionHeader.style.removeProperty('transform');
    }

    if (collectionsScroll) {
      collectionsScroll.style.removeProperty('--opacity-progress');
    }

    if (titleCards && titleCards.length) {
      titleCards.forEach(card => {
        card.style.removeProperty('--angle-percent');
      });
    }
  }

  _getSectionScrollBounds() {
    const rect = this.getBoundingClientRect();
    const startY = window.scrollY + rect.top;
    const endY = window.scrollY + rect.bottom - window.innerHeight;
    return [startY, endY];
  }

  _getProgress() {
    const [startY, endY] = this._getSectionScrollBounds();
    const denom = Math.max(1, endY - startY);
    return this._clamp((window.scrollY - startY) / denom, 0, 1);
  }

  _scrollCardIntoView(card, attempt = 0, token = this._focusScrollToken) {
    if (token !== this._focusScrollToken) return;
    const collectionsScroll = $4('.hdt-collections-tilted-scroll', this);
    const collectionsScrollInner = $4('.hdt-collections-tilted-scroll-inner', this);
    if (!collectionsScroll || !collectionsScrollInner || !card) return;
    const active = document.activeElement;
    if (!active || !card.contains(active)) return;
    const vwRect = collectionsScroll.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    let overscan = 24;
    if (this.dataset && this.dataset.focusOverscan) {
      const v = parseFloat(this.dataset.focusOverscan);
      if (!Number.isNaN(v)) overscan = v;
    } else {
      const cssVar = getComputedStyle(collectionsScroll).getPropertyValue('--focus-overscan').trim();
      const v = parseFloat(cssVar);
      if (!Number.isNaN(v)) overscan = v;
    }
    const leftInView  = cr.left  - vwRect.left;
    const rightInView = cr.right - vwRect.left;
    const leftThreshold  = isRTL ? overscan : 0;
    const rightThreshold = isRTL ? vwRect.width : (vwRect.width - overscan);
    const fullyVisible = leftInView >= leftThreshold && rightInView <= rightThreshold;
    if (fullyVisible) return;
    let deltaPx = 0;
    if (leftInView < leftThreshold) {
      deltaPx = (leftThreshold - leftInView) + 1;
    } else if (rightInView > rightThreshold) {
      deltaPx = (rightThreshold - rightInView) - 1;
    } else {
      return;
    }

    const containerW = vwRect.width;
    const innerW = collectionsScrollInner.getBoundingClientRect().width;
    const span = Math.max(0, innerW - containerW);
    if (span === 0) return;
    const dir = isRTL ? +1 : -1;
    const dP = (deltaPx * dir) / span;
    const pNow = this._getProgress();
    const pTarget = this._clamp(pNow + dP, 0, 1);
    const [startY, endY] = this._getSectionScrollBounds();
    const totalLen = Math.max(1, endY - startY);
    const targetY = Math.round(startY + pTarget * totalLen);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (token !== this._focusScrollToken) return;
    if (!document.activeElement || !card.contains(document.activeElement)) return;
    window.scrollTo({ top: targetY, behavior: prefersReduced ? 'auto' : 'smooth' });
    if (attempt < 2) {
      this._focusRecheckTimer = setTimeout(() => {
        if (token !== this._focusScrollToken) return;
        const a = document.activeElement;
        if (!a || !card.contains(a)) return;
        this._scrollCardIntoView(card, attempt + 1, token);
      }, prefersReduced ? 0 : 360);
    }
  }

  _init() {
    const isDesktop = this._isDesktop();
    if (!isDesktop) {
      return;
    }

    const collectionsScroll = $4('.hdt-collections-tilted-scroll', this);
    const collectionsScrollInner = $4('.hdt-collections-tilted-scroll-inner', this);
    const titleCards = $$4('.hdt-cl-tilted-card', this);
    const sectionHeaderWrap = $4('.hdt-section__header-wrap', this);
    const sectionHeader = $4('.hdt-section__header', this);
    const n = titleCards.length;
    if (collectionsScrollInner) {
      const bgAnimate = $4('.hdt-hero-bg-animate', this);
      const collectionsContent = $4('.hdt-hero-collections-content', this);
      if (bgAnimate) {
        const height = collectionsContent.getBoundingClientRect().height;
        this.style.setProperty('--content-height', `${height}px`);
        this._cleanupFns.push(
          scroll(
            animate(bgAnimate, {
              clipPath: [ `inset(0 0 0 0 round 0)`, `inset(calc(50vh - var(--content-height) * 0.5) 30px calc(50vh - var(--content-height) * 0.5) var(--clip-x, 3rem) round var(--rounded-lg, 0))` ],
            }),
            { offset: ["start end", "end end"], target: this }
          )
        );
        this._cleanupFns.push(
          scroll(
            (progress) => {
              if (progress >= 1) {
                collectionsContent.classList.add('hdt-show-bg-fade-ani');
              } else {
                collectionsContent.classList.remove('hdt-show-bg-fade-ani');
              }
              if (progress >= 1) {
                bgAnimate.classList.add('hdt-hide-fade-ani');
              } else {
                bgAnimate.classList.remove('hdt-hide-fade-ani');
              }
            },
            {
              offset: ["start end", "end end"],
              target: this,
            }
          )
        );
        this._cleanupFns.push(
          scroll(
            animate(collectionsContent, {
              clipPath: [ `inset(0 0 0 0 round 0)`, `inset(0px 30px 0px 30px round var(--rounded-lg, 0))`, ]
            }),
            { offset: ["start end", "end end"], target: this }
          )
        );
        this._cleanupFns.push(
          scroll(
            animate(sectionHeaderWrap, {
              transform: [ `translateX(0px)`, `translateX(calc(var(--value-logical-flip) * 30px))` ],
            }),
            { offset: ["start end", "end end"], target: this }
          )
        );
      }

      const collectionsScrollWidth = collectionsScroll.getBoundingClientRect().width;
      const collectionsScrollInnerWidth = collectionsScrollInner.getBoundingClientRect().width;
      let translateX = `${collectionsScrollWidth - collectionsScrollInnerWidth}px - var(--scrollbar-w, 0px) - 30px - var(--padding-inline)`;
      if (collectionsScrollWidth > collectionsScrollInnerWidth) {
        this.classList.add('hdt-has-least-items');
        translateX = `${collectionsScrollWidth - collectionsScrollInnerWidth}px - var(--scrollbar-w, 0px) - var(--padding-inline, 15px) - 30px - var(--padding-inline)`;
      }
      else {
        this.classList.remove('hdt-has-least-items');
      }
      if (isRTL) {
        translateX = `-1 * (${translateX})`;
      }
      translateX = `calc(${translateX})`;
      this._cleanupFns.push(
        scroll(
          animate(collectionsScrollInner, {
            transform: [ `translateX(0px)`, `translateX(${translateX})` ],
          }),
          { offset: ["start start", "end end"], target: this }
        )
      );
      if (titleCards) {
        collectionsScroll.classList.add('hdt-has-cards');
        this._cleanupFns.push(
          scroll(
            (progress) => {
              if (progress >= 0.9) {
                const opacityProgress = (progress - 0.9) / 0.1;
                collectionsScroll.style.setProperty('--opacity-progress', opacityProgress);
              } else {
                collectionsScroll.style.setProperty('--opacity-progress', 0);
              }
            },
            {
              offset: ["start start", "end end"],
              target: this,
            }
          )
        );
        this._cleanupFns.push(
          scroll(
            (progress) => {
              const threshold = 0.5;
              titleCards.forEach((card, i) => {
                const start = i / n;
                const end = (i + threshold) / n;
                let anglePercent = 1;
                if (progress <= start) {
                  anglePercent = 1;
                }
                else if (progress >= end) {
                  anglePercent = 0;
                } else {
                  anglePercent = 1 - (progress - start) / (end - start);
                }
                card.style.setProperty('--angle-percent', anglePercent);
              });
            },
            { target: this }
          )
        );

        titleCards.forEach(card => {
          const cardInner = $4('.hdt-collection-card-inner', card);
          if (!cardInner) return;
          if (!cardInner.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(cardInner.tagName)) {
            cardInner.setAttribute('tabindex', '0');
          }
        });
        const onFocusInInside = (e) => {
          const inner = e.target.closest('.hdt-collection-card-inner');
          if (!inner || !collectionsScroll.contains(inner)) return;
          this._cancelFocusScroll();
          const card = inner.closest('.hdt-cl-tilted-card');
          const token = this._focusScrollToken;
          this._scrollCardIntoView(card, 0, token);
        };
        collectionsScroll.addEventListener('focusin', onFocusInInside, true);
        this._cleanupFns.push(() => collectionsScroll.removeEventListener('focusin', onFocusInInside, true));
        const onDocFocusIn = (e) => {
          if (!this.contains(e.target)) {
            this._cancelFocusScroll();
          }
        };
        document.addEventListener('focusin', onDocFocusIn, true);
        this._cleanupFns.push(() => document.removeEventListener('focusin', onDocFocusIn, true));
      }
    }

    if (sectionHeader) {
      this._cleanupFns.push(
        scroll(
          animate(sectionHeader, { opacity: [1, 0], transform: [`scale(1)`, `scale(0.82)`] }),
          { offset: ["start start", "200px"], target: this }
        )
      );
    }
  }
}

customElements.define('hdt-hero-collections', HeroCollections);

// XOAN =============================================

//Counter number
class Counter extends HTMLElement {
  constructor() {
    super();
    this._counterStarted = false;
  }

  connectedCallback() {
    this._initInView();
  }

  _initInView() {
    inView(this, (element) => {
      this._startCounter();
      return () => this._resetCounter();
    }, {amount: 0.5}
    );
  }

  _startCounter() {
    if (this._counterStarted) return;
    const target = parseInt(this.dataset.counter) || 0;
    const duration = parseFloat(this.dataset.duration) || 5;

    animate(0, target, {
      duration,
      ease: "circOut",
      onUpdate: (latest) => {
        this.textContent = Math.round(latest);
      },
    });

    this._counterStarted = true;
  }
  _resetCounter() {
    this.textContent = "0";
    this._counterStarted = false;
  }
}
customElements.define("hdt-counter", Counter);
//Scroll section
class ShirkScroll extends HTMLElement {
    constructor() {
      super();
      this.mediaQueryList = window.matchMedia('(min-width: 768px)');
      this.offsetStart = 0;
      this.scrollInstances = []
      this.minScale = 0;
    }
    connectedCallback() {
        const rect = this.getBoundingClientRect()
        const devHeight = window.innerHeight
        if(rect.height < devHeight){
            this.offsetStart = 0.3
        }
        this.boundAnimateSection = this.animateSection.bind(this);
        this.mediaQueryList.addEventListener('change', this.boundAnimateSection);
        this.boundAnimateSection();
    }
    animateSection(){
      const shouldAnimate = this.mediaQueryList.matches
      if(shouldAnimate == false){
          this.resetTransforms();
          return
      }
      if ( this.hasAttribute('on-shirk-scroll') ) {
        const contentLeft = $$4('[transLeft]', this);
        const contentRight = $$4('[transRight]', this);
        const mediaShirk = $$4('.hdt-media-wrapper:not([unless]) > :is(img, svg), .hdt-media-wrapper:not([unless]) hdt-video > :is(img, video, iframe)', this);
        const scaleMax = parseFloat(getComputedStyle(this).getPropertyValue('--scale-max'));
        let sequence = [];
        sequence =[
          [ this, { clipPath: [`inset(0 0 0 0 round 0)`,`inset(0 var(--clip-path-off) 0 var(--clip-path-off) round var(--rounded-lg, 0))`] }, { ease: 'linear'} ]
        ]
        if(mediaShirk.length){
          sequence.push([
            mediaShirk,
            { transform: [`scale(${scaleMax})`, `scale(1)`] },
            { ease: "linear", at: "<" }
          ])
        }
        if(contentLeft.length){
          sequence.push([
            contentLeft,
            { transform: [`translateX(0px)`, `translateX(calc(1 * var(--value-logical-flip) * var(--clip-path-off)))`] },
            { ease: "linear", at: "<" }
          ]);
        }
        if(contentRight.length){
          sequence.push([
            contentRight,
            { transform: [`translateX(0px)`, `translateX(calc(-1 * var(--value-logical-flip) * var(--clip-path-off)))`] },
            { ease: "linear", at: "<" }
          ]);
        }
        this.currentAnimate = animate(sequence)
        scroll(
          this.currentAnimate,
          {
            target: this,
            offset: ["start end", `end ${this.offsetStart}`]
          }
        )
      }
    }
    resetTransforms() {
      this.currentAnimate?.cancel()
      this.currentAnimate?.stop()
    }
}
customElements.define("hdt-shirk-scroll", ShirkScroll);

//Testimonial image
class TestimonialImage extends ShirkScroll{
    #imagesTes;
    #imageW;
    #zIndexMap;
    connectedCallback(){
        if (this.hasAttribute('on-shirk-scroll')) super.connectedCallback();
        this.#imagesTes = $$4('.hdt-testimonial-image', this);
        this.#imageW = $4('.hdt-inner-list-images-testimonial .hdt-testimonial-image', this).offsetWidth + 40
        this.#zIndexMap = this.#imagesTes.map((img, i) => parseInt(img.style.zIndex || 0) || 0)
        $4('hdt-slider', this)?.addEventListener('select', (event) => {
            const {selectedScrollSnap, previousScrollSnap} = event.detail.sliderApi,
            targetSelect = selectedScrollSnap(),
            targetPrev = previousScrollSnap();
            // console.log(`active: ${targetSelect}`);
            // console.log(`prv: ${targetPrev}`);

            this.#animateAndReorder(targetSelect, targetPrev);
        })
    }
    #animateAndReorder(targetIndex, otherIndex = null) {
        const maxI = this.#imagesTes.length - 1
        let direction = targetIndex < otherIndex ? 'left' : 'right';
        const wrapLeft  = targetIndex < otherIndex && targetIndex === 0    && otherIndex === maxI;
        const wrapRight = targetIndex > otherIndex && targetIndex === maxI && otherIndex === 0;
        if (wrapLeft)  direction = 'right';
        if (wrapRight) direction = 'left';
        const offset = direction === 'left' ? -this.#imageW : this.#imageW;
        let animateTarget;
        if (wrapLeft) {
          animateTarget = this.#imagesTes[otherIndex];
        } else if (wrapRight) {
            animateTarget = this.#imagesTes[targetIndex];
        } else {
            animateTarget = this.#imagesTes[targetIndex < otherIndex ? targetIndex : otherIndex];
        }
        animate(
            animateTarget,
            { x: [0, offset] },
            { duration: 0.25 }
        ).then(() => {
          this.#imagesTes[targetIndex].style.zIndex = this.#imagesTes.length;
          this.#zIndexMap[targetIndex] = this.#imagesTes.length;

          let delta;
          if (wrapLeft) {
              delta = 1;
              this.#imagesTes[otherIndex].style.zIndex = 1;
              this.#zIndexMap[otherIndex] = 1;

          } else if (wrapRight) {
              delta = -1;
              this.#imagesTes[otherIndex].style.zIndex = maxI;
              this.#zIndexMap[otherIndex] = maxI;

          } else {
              const forward = targetIndex < otherIndex;
              delta = forward ? -1 : 1;

              const z = forward ? maxI : 1;
              this.#imagesTes[otherIndex].style.zIndex = z;
              this.#zIndexMap[otherIndex] = z;
          }
          // Update z-index for other image
          this.#imagesTes.forEach((img, idx) => {
            if (idx !== targetIndex && idx !== otherIndex) {
              // const delta = direction === 'left' ? -1 : 1;
              const newZ = (this.#zIndexMap[idx] || 0) + delta;
              img.style.zIndex = newZ;
              this.#zIndexMap[idx] = newZ;
            }
          })
          // Animate to return to the initial/original position
          animate(
              animateTarget,
              { x: [offset, 0] },
              { duration: 0.25 }
          )
        })
    }
}
customElements.define("hdt-testimonial-image", TestimonialImage);

// Scroll stack
class HeroScrollStack extends HTMLElement {
  constructor() {
    super();
    this.scrollControllers = [];
    this._isFocusScrolling = false;
    this._focusScrollTimeout = null;
  }

  connectedCallback() {
    this.groupStackScroll();
    this._bindFocusScroll();
  }

  groupStackScroll() {
    const items = $$4('.hdt-group-stack-scroll .hdt-hero-media', this);
    const groupStack = $4('.hdt-group-stack-scroll', this);
    const offset = items.length - 1;

    if (!items.length) return;
    if (this._isFocusScrolling) return;
    scroll(
      animate(items[0], {
          transform: [
              "scale3d(0.5, 0.5, 1)",
              "scale3d(1, 1, 1)"
          ]
      }),
      {
          target: this,
          offset: ["start end", "start 30vh"]
      }
    )
    scroll(
      animate(
        groupStack,
        {
          transform: [
            'none',
            `translateX(calc((-${offset * 100}% - ${offset} * var(--gap-hero)) * var(--value-logical-flip)))`
          ]
        }
      ),
      {
        target: this
      }
    );
    scroll(progress => {
      const step =  1/(items.length - 1)
      let dir = isRTL ? -1 : 1;
      items.forEach((item, idx) => {
          const wrapper = $4('.hdt-media-wrapper img', item);
          if (!wrapper) return;
          let start;
          let end
          let baseTranslate
          if(idx === 0){
              start = 0
              end = step
              baseTranslate = 10
          }else{
              start = step * (idx - 1);
              if(idx === items.length - 1){
                  end = step * idx;
              }else{
                  end = step * (idx + 0.5);
              }
              baseTranslate = 30
          }
          const localProgress = Math.min(1, Math.max(0, (progress - start) / (end - start)));
          const translateX = (-baseTranslate + baseTranslate * localProgress) * dir;
          wrapper.style.transform = `translateX(${translateX}%)`;
        })
    },
    {
        target: this,
        offset: ["start start", "end end"]
    });
  }

  _bindFocusScroll() {
    const groupStack = $4('.hdt-group-stack-scroll', this);
    const items = $$4('.hdt-group-stack-scroll .hdt-hero-media', this);
    if (!groupStack || !items.length) return;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const getScrollTargetForIndex = (index) => {
      const rect = this.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const sectionTopAbs = window.scrollY + rect.top;
      const sectionHeight = rect.height;
      const scrollStart = sectionTopAbs;
      const scrollEnd = sectionTopAbs + sectionHeight - viewportHeight;
      if (scrollEnd <= scrollStart) {
        return scrollStart;
      }
      const maxStep = Math.max(items.length - 1, 1);
      let logicalIndex = index;
      const progress = maxStep === 0 ? 0 : logicalIndex / maxStep;
      return scrollStart + progress * (scrollEnd - scrollStart);
    };

    const focusableSelector = `.hdt-hero-media button, .hdt-hero-media [role="button"], .hdt-hero-media a[href]:not([tabindex="-1"]), .hdt-hero-media [tabindex]:not([tabindex="-1"])`;
    const getFocusableElements = () => Array.from($$4(focusableSelector, this)) .filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
    const onFocusIn = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const isButtonLike =
        target.tagName === 'BUTTON' ||
        target.getAttribute('role') === 'button' ||
        (target.tagName === 'A' && target.href);

      if (!isButtonLike) return;

      const media = target.closest('.hdt-hero-media');
      if (!media || !this.contains(media)) return;

      const index = Array.prototype.indexOf.call(items, media);
      if (index < 0) return;

      const rawTargetTop = getScrollTargetForIndex(index);
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const maxScrollable = document.documentElement.scrollHeight - viewportHeight;
      const finalTop = Math.min( Math.max(0, rawTargetTop), Math.max(0, maxScrollable) );
      this._isFocusScrolling = true;
      clearTimeout(this._focusScrollTimeout);

      window.requestAnimationFrame(() => {
        window.scrollTo({ top: finalTop, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });

      this._focusScrollTimeout = setTimeout(() => {
        this._isFocusScrolling = false;
      }, prefersReducedMotion ? 0 : 600);
    };

    const onKeyDown = (event) => {
      if (event.key !== 'Tab' || event.defaultPrevented) return;
      const active = document.activeElement;
      if (!active || !this.contains(active)) return;
      const focusables = getFocusableElements();
      if (!focusables.length) return;
      const currentIndex = focusables.indexOf(active);
      const dir = event.shiftKey ? -1 : 1;
      let nextIndex;
      if (currentIndex === -1) {
        nextIndex = dir > 0 ? 0 : focusables.length - 1;
      } else {
        nextIndex = currentIndex + dir;
      }

      if (nextIndex < 0 || nextIndex >= focusables.length) {
        return;
      }

      const next = focusables[nextIndex];
      if (!next) return;
      event.preventDefault();
      try {
        next.focus({ preventScroll: true });
      } catch (e) {
        next.focus();
      }
    };

    this.addEventListener('focusin', onFocusIn);
    this.addEventListener('keydown', onKeyDown);
  }
}

customElements.define('hdt-hero-scrollstack', HeroScrollStack);

//Media with text scroll
class MediaTextScroll extends HTMLElement{
    constructor() {
        super();
        this._isFocusScrolling = false;
        this._focusScrollTimeout = null;
    }
    connectedCallback(){
        this._initScroll();
        this._onResize = () => this._initScroll();
        window.addEventListener('resize', this._onResize);
    }
    _initScroll(){
      if(window.matchMedia('(min-width: 768px)').matches){
        const withContainer = $4('.hdt-slider__container', this).offsetWidth;
        const items = $$4('.hdt-ground-media-text .hdt-item-media-w-text', this)
        const offset = items.length - 1
        const widthItems = items[0].offsetWidth;
        const gapHero = parseFloat(getComputedStyle($4('.hdt-ground-media-text', this)).columnGap);
        const totalW = widthItems * items.length + offset * gapHero

        this.classList.remove('hdt-no-scroll');

        if (totalW <= withContainer){
          this.classList.add('hdt-no-scroll');
          return;
        }
        const mediatextGroup = $4('.hdt-ground-media-text', this)

        if (this._isFocusScrolling) return;
        scroll(
            animate(mediatextGroup, {
                transform: ["none", `translateX(calc((${totalW}px - 100%) * -1 * var(--value-logical-flip)))`],
            }),
            { target: this }
        )

        this._bindFocusScroll();
      }
    }
    _bindFocusScroll(){
      const items = $$4('.hdt-ground-media-text .hdt-item-media-w-text', this);
      // const groupStack = $4('.hdt-ground-media-text', this);
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!items.length) return;
      const getScrollTargetForIndex = (index) => {
        const rect = this.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const startY = window.scrollY + rect.top;
        const sectionHeight = rect.height;
        const scrollStart = startY;
        const scrollEnd = startY + sectionHeight - viewportHeight;
        if (scrollEnd <= scrollStart) {
          return scrollStart;
        }
        const maxStep = Math.max(items.length - 1, 1);
        let logicalIndex = index;
        const progress = maxStep === 0 ? 0 : logicalIndex / maxStep;
        return scrollStart + progress * (scrollEnd - scrollStart);
      };
      const handleFocusIn = (e) => {
        const target = e.target;
        if (!(target instanceof HTMLAnchorElement || target instanceof HTMLButtonElement)) return;
        const item = target.closest('.hdt-item-media-w-text');
        if (!item) return;
        const idx = items.indexOf(item)
        if (idx < 0) return;

        const rawTargetTop = getScrollTargetForIndex(idx);
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const maxScrollable = document.documentElement.scrollHeight - viewportHeight;
        const finalTop = Math.min( Math.max(0, rawTargetTop), Math.max(0, maxScrollable) );
        this._isFocusScrolling = true;
        clearTimeout(this._focusScrollTimeout);

        window.requestAnimationFrame(() => {
          window.scrollTo({ top: finalTop, behavior: prefersReduced ? 'auto' : 'smooth' });
        });

        this._focusScrollTimeout = setTimeout(() => {
          this._isFocusScrolling = false;
        }, prefersReduced ? 0 : 600);
      }
      this.addEventListener('focusin', handleFocusIn);
      //Disable tab defaault
      const focusableSelector = `.hdt-item-media-w-text button, .hdt-item-media-w-text [role="button"], .hdt-item-media-w-text a[href]:not([tabindex="-1"]), .hdt-item-media-w-text [tabindex]:not([tabindex="-1"])`;
      const getFocusableElements = () => Array.from($$4(focusableSelector, this)) .filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
      const handleKeyDown = (e) => {
        if (e.key !== 'Tab' || e.defaultPrevented) return;
        const active = document.activeElement;
        if (!active || !this.contains(active)) return;
        const focusables = getFocusableElements();
        if (!focusables.length) return;
        const currentIndex = focusables.indexOf(active);
        const dir = e.shiftKey ? -1 : 1;
        let nextIndex;
        if (currentIndex === -1) {
          nextIndex = dir > 0 ? 0 : focusables.length - 1;
        } else {
          nextIndex = currentIndex + dir;
        }

        if (nextIndex < 0 || nextIndex >= focusables.length) {
          return;
        }

        const next = focusables[nextIndex];
        if (!next) return;
        e.preventDefault();
        try {
          next.focus({ preventScroll: true });
        } catch (e) {
          next.focus();
        }
      };
      this.addEventListener('keydown', handleKeyDown);
    }

    disconnectedCallback(){
      window.removeEventListener('resize', this._onResize);
    }
}
customElements.define("hdt-mediatext-scroll", MediaTextScroll);

//Media lookbook
class MediaLookbook extends HTMLElement{
    constructor() {
        super();
        this.initialized = false;
        this.tabPlayer = $4("hdt-tab-player-list", this);
        this.buttons = $$4('button', this.tabPlayer)
        // this.prevIndex = this.tabPlayer.currIndex;
        this.prevIndex = this.getActiveIndex();

    }
    connectedCallback(){
      this.pauseOnhover();
      if (this.hasAttribute("reveal-on-scroll")) {
        this.animateOnScrollOnce();
      }
      this.observeTabChange();
      if (window.Shopify && Shopify.designMode) {
        this._setupShopifyBlockSelection();
      }
    }
    getActiveIndex() {
      return [...this.buttons].findIndex(
        btn => btn.getAttribute('aria-current') === 'true'
      );
    }
    observeTabChange() {
      this.mo = new MutationObserver(() => {
        const currIndex = this.getActiveIndex();
        if (currIndex !== -1 && currIndex !== this.prevIndex) {
          this.onTabChange(currIndex, this.prevIndex);
          this.prevIndex = currIndex;
        }
      });

      this.buttons.forEach(btn => {
        this.mo.observe(btn, { attributes: true, attributeFilter: ['aria-current'] });
      });

    }
    onTabChange(currIndex, prevIndex = null) {
      const tabContents = $$4(".hdt-tab-content-wrapper > .hdt-tab-content", this);
      const tabContentShow = tabContents[currIndex];
      const tabMedias = $$4(".hdt-tab-image-holder .hdt-lookbook-media", this);
      const tabMediaShow = $4('.hdt-lb-image', tabMedias[currIndex]);
      const pinItems = $$4(".hdt-pin-item", tabMedias[currIndex]);
      let sequence
      if(prevIndex == null){
        sequence = [
          [ tabContentShow, { opacity: [0,1], y: [30, 0] }, { duration: 0.4, at:"-0.2" } ],
          [ tabMediaShow,      { clipPath: [ "inset(0 100% 0 0 round var(--rounded-lg))", "inset(0 0 0 0 round var(--rounded-lg))"] }, { duration: 0.4, at:"<" } ],
          [ pinItems,   { opacity: [0,1], scale: [0.8,1] }, { duration: 0.5, delay: stagger(0.3) } ]
        ];
      }else{
        const tabContentHide = tabContents[prevIndex];
        sequence = [
          [ tabContentHide, { opacity: [1,0], y: [0, 30] }, { duration: 0.4 } ],
          [ tabContentShow, { opacity: [0,1], y: [30, 0] }, { duration: 0.4, at:"-0.2" } ],
          [ tabMediaShow, { clipPath: [ "inset(0 100% 0 0 round var(--rounded-lg))", "inset(0 0 0 0 round var(--rounded-lg))"] }, { duration: 0.4, at:"<" } ],
          [ pinItems,   { opacity: [0,1], scale: [0.8,1] }, { duration: 0.5, delay: stagger(0.3) } ]
        ];
      }
      return animate(sequence);
    }

    _setupShopifyBlockSelection() {
      document.addEventListener('shopify:block:select', event => {
        const block = event.target;
        if (block.classList.contains('hdt-tab-title')) {
          setTimeout(() => {
            block.click();
          }, 20);
        }
      });
    }

    animateOnScrollOnce(){
        inView(this, () => {
            animate(
                this.buttons,
                { opacity: [0, 1], x: [-30, 0] },
                { duration: 0.3, delay: stagger(0.2) }
            );
            this.onTabChange(this.prevIndex);
        }, { amount: 0.3 })
    }

    pauseOnhover(){
        const tabContent = $4('.hdt-tab-image-holder', this)
        const tabPrContent = $4('.hdt-tab-content-wrapper', this)
        const listTab = $4('hdt-tab-player-list', this)
        if(listTab.hasAttribute("autoplay")){
            const stopOnHover = (el) => {
                el?.addEventListener('mouseenter', () => {
                    listTab.pause();
                });
                el?.addEventListener('mouseleave', () => {
                    listTab.play();
                });
            };
            stopOnHover(tabContent);
            stopOnHover(tabPrContent);
        }
    }
}
customElements.define("hdt-media-lookbook", MediaLookbook);

// Sidebar fillter
class MainCollection extends HTMLElement {
    constructor() {
      super();
      this.observer = null;
    }
    connectedCallback() {
      this.bindFilterButton();
      this.observeDOMChanges();
    }
    disconnectedCallback() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
    bindFilterButton() {
      const btn = $4('.hdt-facets__open', this);
      if (!btn || btn.dataset.bound === 'true') return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('aria-controls');
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !isExpanded);
        const target = $id4(id);
        if (target) {
          target.classList.toggle('hdt-stage-open');
        }
      });
    }
    observeDOMChanges() {
      this.observer = new MutationObserver(() => {
        this.bindFilterButton();
      });

      this.observer.observe(this, {
        childList: true,
        subtree: true
      });
    }
}
customElements.define('hdt-main-collection', MainCollection);

//Footer Clip-path
class MorphFooter extends HTMLElement{
    connectedCallback(){
        if (this._initialized) return;
        this._initialized = true;

        if(this.hasAttribute('reveal-on-scroll')){
            const logoFooter = $4('.hdt-footer__logo', this);
            scroll((progress) => {
                const logoStart = 0.1;
                const logoProgress = Math.max(0, (progress - logoStart) / (1 - logoStart));

                if (logoFooter) {
                    logoFooter.style.opacity = logoProgress;
                    logoFooter.style.transform = `translateX(${(1 - logoProgress) * -100}%)`;
                }
            }, {
                target: this,
                offset: ["start end", "end end"]
            });

        }
    }
}
customElements.define("hdt-morph-footer", MorphFooter);

class PopoverSortby extends Popover{
    get isDesktop() {
      return window.matchMedia('(pointer: fine)').matches || window.innerWidth >= 768;
    }
    connectedCallback() {
        super.connectedCallback();
        this.parentP = this.closest('hdt-popover-sorting')
        this.shortlist = $4('.hdt-sorting-options', this)
        this.listChild = $$4('.hdt-sorting-options button', this)
        this.iconSort = $4('.hdt-icon-sortby', this.parentP)
        this.cirCleTop = $4('.hdt-cricle-top', this.iconSort)
        this.cirCleTbottom = $4('.hdt-cricle-bottom', this.iconSort)
        this.parentP.style.height = "52px";
    }
    animateDialogOpen() {
      if (!this.isDesktop) {
        return super.animateDialogOpen();
      }
      if(!this._openedAsModal){
        if(!this.heightDialog){
          this.heightDialog = this.dialog.scrollHeight;
          this.heightP = this.heightDialog + 52
        }
        this.parentP.classList.add('hdt-open_shortby')
        const sequence = [
            [
                this.dialog,
                { minWidth: [`204px`], opacity: [0, 1], scaleY: [0, 1] },
                { duration: 0.25, ease: "linear" }
            ],
            [
                this.cirCleTop, {y: [0,4,0]},
                {duration: 0.4, at: "<"}
            ],
            [
                this.cirCleTbottom,
                {y: [0,-4,0]},
                {duration: 0.4, at: "<"}
            ],
            [
                this.iconSort,{ rotate: 90}, {duration: 0.3, at: "<-0.2"}
            ],
            [
                this.parentP,
                { borderRadius: ["var(--rounded-button)", "var(--rounded)"], height: [`${this.heightP}px`] },
                { duration: 0.2, ease: 'linear', at: `<-0.25`}
            ],
            [
                this.listChild,
                { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
                {
                    delay: stagger(0.05),
                    duration: 0.25,
                    ease: 'linear',
                    at: '<+0.2'
                }
            ]
        ]
        return animate(sequence)
      }
    }
    animateDialogClose() {
      if (!this.isDesktop) {
        return super.animateDialogClose();
      }
      if (!this._openedAsModal) {
        this.parentP.classList.remove('hdt-open_shortby');
        const reversedList = [...this.listChild].reverse();
        const sequence = [
            [
                reversedList,
                { opacity: [1, 0], transform: [`translateY(-15px)`] },
                {
                    duration: 0.25,
                    ease: 'linear',
                    delay: stagger(0.03),
                }
            ],
            [
                this.parentP,
                {
                    borderRadius: ["var(--rounded)", "var(--rounded-button)"], height: [`52px`],
                },
                { duration: 0.4, ease: 'linear', at: `<-0.2`}
            ],
            [
                this.iconSort,{ rotate: 0}, {duration: 0.3, at: "<-0.2"}
            ],
            [
                this.cirCleTbottom,
                {y: [0,-4,0]},
                {duration: 0.4, at: "<"},
            ],
            [
                this.cirCleTop, {y: [0,4,0]},
                {duration: 0.4, at: "<"},

            ],
            [
                this.dialog,
                { minWidth: [`165px`], opacity: [1, 1, 0], scaleY: [0]},
                { duration: 0.25, ease: `linear`}
            ],
        ]
        return animate(sequence);
      }
    }
}
customElements.define("hdt-popover-sortby", PopoverSortby);

//Collection list dynamic
class CollectionDynamic extends HTMLElement{
    connectedCallback(){
        $4('hdt-slider', this)?.addEventListener('select', (event) => {
            const { selectedScrollSnap, scrollSnapList } = event.detail.sliderApi;

            const currentIndex = selectedScrollSnap();
            const lastIndex = scrollSnapList().length - 1;
            if (currentIndex > 0){
                this.classList.add('hdt-start-slide-selected');
            }else{
                this.classList.remove('hdt-start-slide-selected');
            }
            if (currentIndex === lastIndex) {
                this.classList.add('hdt-last-slide-selected');
            } else {
                this.classList.remove('hdt-last-slide-selected');
            }
        })
    }
}
customElements.define("hdt-collection-dynamic", CollectionDynamic);

const inset = 'inset(0 round 0px)';
class scrollMediaText extends HTMLElement {
    #scroll;
    connectedCallback(){
        const media = $4('.hdt-scroll-media-with-text__media .hdt-media-wrapper', this),
        sequence = [
          //[$4('.hdt-scroll-media-with-text__media .hdt-media-wrapper', this), { width: [fixedStart, width, width, width], height: [fixedStart, height, height, height], borderRadius: [120, 0, 0, 0] }]
          [media, { clipPath: ["inset(calc(50% - var(--media-radius)) calc(50% - var(--media-radius)) round var(--media-radius))", inset, inset, inset]}],
          [$4(':where(hdt-video, svg, img)', media), { scale: [0.5, 1, 1, 1]}, { at: "<" }]
        ];
        const content = $4('.hdt-scroll-media-with-text__content', this);
        if (content) {
          sequence.push(
            [content, { opacity: [0, 0, 1, 1], y: [255, 255, 0, 0] }, { at: "<" }]
          )
        }
        this.#scroll = scroll(
          animate(sequence),
          {
              target: this.parentElement,
              offset: ["start start", "0.4 start", "0.5 start", "end start"],
          }
        );
    }
    disconnectedCallback() {
      this.#scroll();
    }
}
customElements.define("hdt-scroll-media-text", scrollMediaText);

const inset2 = "inset(100% round 200px)";
class scrollMediaHero extends HTMLElement {
  connectedCallback(){
    const sequence = [];
    const is3 = "inset(90% round 100px)";
    const is4 = "inset(50% round 50px)";
    const is5 = "inset(0 round 5px)";
    const content = $4('.hdt-scroll-hero-media__first .hdt-scroll-hero-media__content', this);
    if (content) {
      sequence.push( [content, { opacity: [0, 1, 1, 1, 0, 0, 0], y: [200, 0, 0, 0, 0, 0, 0], scale: [0.6, 1, 1.05] }] )
    }
    const items = $$4('.hdt-scroll-hero-media__item', this);
    if (items) {
      let translate = "translate(calc(-1 * var(--left-start)), calc(-1 * var(--top-start))) scale(0.5)",
      translate2 = "translate( calc(var(--tx-end1, 0) - var(--tx-start1) - (1% * var(--tx-end))), calc(var(--ty-end1, 0) - var(--ty-start1) - (1% * var(--ty-end))) )";
      sequence.push(
        [items, {
          opacity: [0, 1, 0, 0, 0, 0, 0, 0],
          transform: [translate, `${translate2} scale(2)`, `${translate2} scale(2)`, `${translate2} scale(2)`, `${translate2} scale(2)`, `${translate2} scale(2.5)`, `${translate2} scale(3)`]
        }, { at: "<", delay: stagger(0.015) }, { offset: ["start start", "0.15 start", "0.2 start", "0.4 start"] }]
      );
    }
    const second = $4('.hdt-scroll-hero-media__second', this);
    if (second) {
      sequence.push( [second, { clipPath: [inset2, is3, is4, is5, is5, inset] }, { at: "<", delay: 0.08 }] )
    }
    const content2 = $4('.hdt-scroll-hero-media__content', second);
    if (content2) {
      sequence.push( [content2, { opacity: [0, 0, 0, 0, 1, 1, 1], y: [200, 200, 200, 0, 0, 0], scale: [0.4, 1, 1] }, { at: "<" }] )
    }
    scroll( animate(sequence), { target: this.parentElement, offset: ["start start", "0.12 start", "0.33 start", "0.5 start", "0.8 start", "0.9 start", "end start"], } );
    const first = $4('.hdt-scroll-hero-media__media', this);
    scroll( animate(first, { transform: [`scale(1)`, `scale(1.15)`] }), { target: this.parentElement,  offset: ["start end", "0.5 start"], } );
    if (window.Shopify && Shopify.designMode) {
      this._setupShopifyBlockSelection();
    }
  }
  _setupShopifyBlockSelection() {
    document.addEventListener('shopify:block:select', event => {
      event.target.classList.add('hdt-current-block');
    });
    document.addEventListener('shopify:block:deselect', event => {
      event.target.classList.remove('hdt-current-block');
    });
  }
}
customElements.define("hdt-scroll-hero-media", scrollMediaHero);

class sliderPlay extends HTMLElement {
  #id;
  #controller;
  constructor(){
    super();
    this.#id = $4('button', this).getAttribute("aria-controls");
  }
  connectedCallback() {
    this.#controller = new AbortController();
    if (!this.slider || !this.slider.interval) return;
    const { signal } = this.#controller;

    this.slider.addEventListener('reInit', this.#resetProgress.bind(this), { signal });
    this.slider.addEventListener('select', this.#resetProgress.bind(this), { signal });
    this.slider.addEventListener('play:state', () => this.toggleAttribute('playing', this.slider.isPlaying), { signal });
    this.addEventListener('click', this.#tooglePlay.bind(this), { signal });

  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  #resetProgress(event) {
    const { slideNodes, selectedScrollSnap } = event.detail.sliderApi;
    this.parentElement.setAttribute('color-scheme', slideNodes()[selectedScrollSnap()].getAttribute('color-scheme'));

    this.removeAttribute('running');
    this.toggleAttribute('playing', this.slider.isPlaying);
    frame.render(() => {
      this.setAttribute('running', '');
    })
  }
  #tooglePlay() {
    if (this.slider.isPlaying) {
      this.slider.pause();
    } else {
      this.slider.play();
    }
  }
  get slider() {
    return $id4(this.#id);
  }
}
customElements.define("hdt-slider-play", sliderPlay);

class DrawerHotspots extends HTMLElement {
  #controller;
  #needUpdate = false;
  #index = -1;
  #preBtn;
  #nextBtn;
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;
    const tooltip = $4('.hdt-tooltip-des', this);
    this.addEventListener(dialogAdded, ()=> {
      const drawer = $4('hdt-drawer', this),
      slider = $4('hdt-slider', this),
      { dialog } = drawer;
      this.#preBtn = $4('button[name="previous"]', drawer);
      this.#nextBtn = $4('button[name="next"]', drawer);
      if (!this.#preBtn) return;
      dialog?.addEventListener(dialogOpening, ()=> {
        this.#needUpdate = true;
        this.setAttribute('open', '');
      }, { signal });
      dialog?.addEventListener(dialogClose, ()=> {
        this.#needUpdate = false;
        this.removeAttribute('open');
      }, { signal });

      slider?.addEventListener('reInit', (event) => {
        if (!this.#needUpdate) return;
        slider.goToIndex(parseInt(dialog.btnOpening.dataset.index) || 0, true);
        this.#updateNavHeading(event);
      }, { signal });
      slider?.addEventListener('select', this.#updateNavHeading, { signal });
    }, { once: true, signal });
    if (!Shopify.designMode) return;
      const m_x     = motionValue(0),
            m_y     = motionValue(0),
            img     = $4('.hdt-hotspots-with-drawer__hotspos-wrap', this),
            left    = transformValue(() => `${m_x.get()}px`),
            top     = transformValue(() => `${m_y.get()}px`);
      styleEffect(tooltip, { left, top });
      img.addEventListener("mousemove", (e) => {
        const rect = img.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        tooltip.style.opacity = this.hasAttribute('open') ? "0" : "1";
        const percentX = ((x / rect.width) * 100).toFixed(0);
        const percentY = ((y / rect.height) * 100).toFixed(0);
        tooltip.textContent = `X: ${percentX}% Y: ${percentY}%`;
        m_x.set(e.clientX);
        m_y.set(e.clientY);
      }, { signal });
      const cancelHover = hover(img, () => {
        tooltip.style.display = "block";
        tooltip.style.opacity = "1";
        return () => {
          tooltip.style.opacity = "0";
          tooltip.style.display = "none";
        }
      });
      signal.addEventListener('abort', () => cancelHover(), { once: true });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  #updateNavHeading = (event) => {
    if (!this.#needUpdate && event.detail?._getSliderApi) return;
    const { sliderApi } = event.detail,
    index = sliderApi.selectedScrollSnap();

    if (this.#index == index) return;
    const slideNodes = sliderApi.slideNodes(),
    indexPrev = wrap(0, slideNodes.length, index - 1),
    indexNext = wrap(0, slideNodes.length, index + 1);
    // update prev heading
    this.#preBtn.nextElementSibling.textContent = $4('.hdt-hs-drawer-heading', slideNodes[indexPrev])?.textContent || '';
    // update next heading
    this.#nextBtn.nextElementSibling.textContent = $4('.hdt-hs-drawer-heading', slideNodes[indexNext])?.textContent || '';
    // cache current index
    this.#index = index;
  }
}

customElements.define("hdt-hotspots-with-drawer", DrawerHotspots);
class Floating extends HTMLElement {
  #controller;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller,
    reference        = this.previousElementSibling;

    computePosition(reference, this, {
      placement: this.#placement,
      middleware: [
        flip(),
        //offset(20),
        offset({
          mainAxis: 12,
          crossAxis: 1
        }),
        shift({padding: 1}),
        this.#arrowEl && arrow({ element: this.#arrowEl })
      ]
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(this.style, {
        top: `${y}px`,
        left: `${x}px`,
      });
      if (middlewareData.arrow) {
        this.setAttribute('placement-current', placement);
        // Accessing the data
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
          [staticSide]: '-4px',
        });
      }
    });
    const cancelHover = hover(reference, () => {
      this.setAttribute('open', '');
      return () => this.removeAttribute('open');
    })
    signal.addEventListener('abort', () => cancelHover(), { once: true });
  }
  disconnectedCallback() {
    this.#controller.abort();
  }
  get #arrowEl() {
    return this._arrowEl ??= $4('.hdt-floating__arrow', this);
  }
  get #placement() {
    return this.getAttribute("placement") || 'top';
  }
}
customElements.define("hdt-floating", Floating);