// Store references to our event handlers so we can remove them.
/** @type {Record<string, (event: Event) => void>} */
const trapFocusHandlers = {};

/**
 * Get all focusable elements within a container.
 * @param {HTMLElement} container - The container to get focusable elements from.
 * @returns {HTMLElement[]} An array of focusable elements.
 */
function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']):not([unless-el]), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  ).filter(el => el.offsetParent !== null && el.tabIndex >= 0 && !el.disabled && !el.classList.contains('hidden'));
}

/**
 * Trap focus within the given container.
 * @param {HTMLElement} container - The container to trap focus within.
 * @param {HTMLElement} [elementToFocus=container] - The element to focus when trapping focus.
 */
export function trapFocus(container, elementToFocus = container) {
  // Clean up any previously set traps.
  removeTrapFocus();

  // Gather focusable elements.
  const focusable = getFocusableElements(container);
  if (!focusable.length) {
    // If nothing is focusable, just abort—no need to trap.
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  // Keydown handler for cycling focus with Tab and Shift+Tab
  /** @type {(event: KeyboardEvent) => void} */
  trapFocusHandlers.keydown = (event) => {
    if (event.key !== 'Tab') return;

    const activeEl = document.activeElement;

    // If on the last focusable and tabbing forward, go to first
    if (!event.shiftKey && activeEl === last) {
      event.preventDefault();
      first?.focus();
    }
    // If on the first (or the container) and shift-tabbing, go to last
    else if (event.shiftKey && (activeEl === first || activeEl === container)) {
      event.preventDefault();
      last?.focus();
    }
  };

  // Focusin (capturing) handler to forcibly keep focus in the container
  /** @type {(event: FocusEvent) => void} */
  trapFocusHandlers.focusin = (event) => {
    // If the newly focused element isn't inside the container, redirect focus back.
    if (event.target instanceof Node && !container.contains(event.target)) {
      event.stopPropagation();
      // E.g., refocus the first focusable element:
      first?.focus();
    }
  };

  // Attach the handlers
  document.addEventListener('keydown', trapFocusHandlers.keydown, true);
  // Use capture phase for focusin so we can catch it before it lands outside
  document.addEventListener('focusin', trapFocusHandlers.focusin, true);

  // Finally, put focus where you want it.
  elementToFocus?.focus({ focusVisible: false });
}

/**
 * Remove focus trap and optionally refocus another element.
 */
export function removeTrapFocus(elementToFocus = null) {
  trapFocusHandlers.keydown && document.removeEventListener('keydown', trapFocusHandlers.keydown, true);
  trapFocusHandlers.focusin && document.removeEventListener('focusin', trapFocusHandlers.focusin, true);
  elementToFocus?.focus();
}

/**
 * Cycle focus to the next or previous link
 *
 * @param {HTMLElement[]} items
 * @param {number} increment
 */
export function cycleFocus(items, increment) {
  const currentIndex = items.findIndex((item) => item.matches(':focus'));
  let targetIndex = currentIndex + increment;

  if (targetIndex >= items.length) {
    targetIndex = 0;
  } else if (targetIndex < 0) {
    targetIndex = items.length - 1;
  }

  const targetItem = items[targetIndex];

  if (!targetItem) return;

  targetItem.focus();
}
export function elFocus(element, focusVisible = true, preventScroll = false) {
  element?.focus({ focusVisible, preventScroll });
}

/**
 * Adds 'hdt-a11y' class to <body> ONCE when Tab key is pressed (Desktop)
 */
if (!('ontouchstart' in window) && !(navigator.maxTouchPoints > 0)) {
  const controller  = new AbortController();
  // Detect Tab key (Desktop) - AUTO-REMOVE after trigger success
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('hdt-a11y');
      controller.abort();
    }
  }, { capture: true, signal: controller.signal });
}