import { ExtractPropTypes, h, onBeforeUnmount, reactive, Ref, render, watch } from 'vue'
// Components
import VOverlay from '../../components/VOverlay'
// Utilities
import {
  addOnceEventListener,
  addPassiveEventListener,
  getZIndex, keyCodes
} from '../../util/helpers'


export const overlayableProps = {
  hideOverlay: Boolean,
  overlayColor: String,
  overlayOpacity: [Number, String],
  isActive: Boolean,
  activeZIndex: { type: Number, required: true },
  absolute: Boolean,
}

/* @vue/component */
export default function useOverlayable(elRef: Ref<Element>, dialogRef: Ref<HTMLElement | undefined>, contentRef: Ref<HTMLElement | undefined>, props: ExtractPropTypes<typeof overlayableProps>) {
  const data = reactive({
    animationFrame: 0,
    overlay: null as InstanceType<typeof VOverlay> | null,
  })

  watch(() => props.hideOverlay, (value) => {
    if (!props.isActive) return

    if (value) removeOverlay()
    else genOverlay()
  })

  onBeforeUnmount(() => {
    removeOverlay()
  })

  function createOverlay() {
    const overlay = h(VOverlay, {
      absolute: props.absolute,
      value: false,
      color: props.overlayColor,
      opacity: props.overlayOpacity,
    })

    const parent = props.absolute
      ? elRef.value.parentNode
      : document.querySelector('[data-app]')


    if (parent) {
      render(overlay, parent as Element)
    }

    data.overlay = overlay.component!.proxy
  }
  function genOverlay() {
    hideScroll()

    if (props.hideOverlay) return

    if (!data.overlay) createOverlay()

    data.animationFrame = requestAnimationFrame(() => {
      if (!data.overlay) return

      if (props.activeZIndex !== undefined) {
        data.overlay.zIndex = String(props.activeZIndex - 1)
      } else if (elRef.value) {
        data.overlay.zIndex = getZIndex(elRef.value)
      }

      data.overlay.value = true
    })

    return true
  }
  /** removeOverlay(false) will not restore the scollbar afterwards */
  function removeOverlay(_showScroll = true) {
    if (data.overlay) {
      addOnceEventListener(data.overlay.$el, 'transitionend', () => {
        if (
          !data.overlay ||
          !data.overlay.$el ||
          !data.overlay.$el.parentNode ||
          data.overlay.value
        ) return

        data.overlay.$el.parentNode.removeChild(data.overlay.$el)
        data.overlay.$destroy()
        data.overlay = null
      })

      // Cancel animation frame in case
      // overlay is removed before it
      // has finished its animation
      cancelAnimationFrame(data.animationFrame)

      data.overlay.value = false
    }

    _showScroll && showScroll()
  }
  function scrollListener(e: WheelEvent & KeyboardEvent) {
    if (e.type === 'keydown') {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as Element).tagName) ||
        // https://github.com/vuetifyjs/vuetify/issues/4715
        (e.target as HTMLElement).isContentEditable
      ) return

      const up = [keyCodes.up, keyCodes.pageup]
      const down = [keyCodes.down, keyCodes.pagedown]

      if (up.includes(e.keyCode)) {
        (e as any).deltaY = -1
      } else if (down.includes(e.keyCode)) {
        (e as any).deltaY = 1
      } else {
        return
      }
    }

    if (e.target === data.overlay ||
      (e.type !== 'keydown' && e.target === document.body) ||
      checkPath(e)) e.preventDefault()
  }
  function hasScrollbar(el?: Element) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false

    const style = window.getComputedStyle(el)
    return ['auto', 'scroll'].includes(style.overflowY!) && el.scrollHeight > el.clientHeight
  }
  function shouldScroll(el: Element, delta: number) {
    if (el.scrollTop === 0 && delta < 0) return true
    return el.scrollTop + el.clientHeight === el.scrollHeight && delta > 0
  }
  function isInside(el: Element, parent: Element): boolean {
    if (el === parent) {
      return true
    } else if (el === null || el === document.body) {
      return false
    } else {
      return isInside(el.parentNode as Element, parent)
    }
  }
  function checkPath(e: WheelEvent) {
    const path = e.path || composedPath(e)
    const delta = e.deltaY

    if (e.type === 'keydown' && path[0] === document.body) {
      const dialog = dialogRef.value
      // getSelection returns null in firefox in some edge cases, can be ignored
      const selected = window.getSelection()!.anchorNode as Element
      if (dialog && hasScrollbar(dialog) && isInside(selected, dialog)) {
        return shouldScroll(dialog, delta)
      }
      return true
    }

    for (let index = 0; index < path.length; index++) {
      const el = path[index]

      if (el === document) return true
      if (el === document.documentElement) return true
      if (el === contentRef.value) return true

      if (hasScrollbar(el as Element)) return shouldScroll(el as Element, delta)
    }

    return true
  }
  /**
   * Polyfill for Event.prototype.composedPath
   */
  function composedPath(e: WheelEvent): EventTarget[] {
    if (e.composedPath) return e.composedPath()

    const path = []
    let el = e.target as Element

    while (el) {
      path.push(el)

      if (el.tagName === 'HTML') {
        path.push(document)
        path.push(window)

        return path
      }

      el = el.parentElement!
    }
    return path
  }
  function hideScroll() {
    // if (context.vuetify.breakpoint.smAndDown) {
    //   document.documentElement!.classList.add('overflow-y-hidden')
    // } else {
    // TODO: check this
    addPassiveEventListener(window, 'wheel', scrollListener as EventHandlerNonNull, { passive: false })
    window.addEventListener('keydown', scrollListener as EventHandlerNonNull)
    // }
  }
  function showScroll() {
    document.documentElement!.classList.remove('overflow-y-hidden')
    window.removeEventListener('wheel', scrollListener as EventHandlerNonNull)
    window.removeEventListener('keydown', scrollListener as EventHandlerNonNull)
  }
  return {
    createOverlay,
    genOverlay,
    removeOverlay,
    scrollListener,
    hasScrollbar,
    shouldScroll,
    isInside,
    checkPath,
    composedPath,
    hideScroll,
    showScroll,
  }
}
