import useActivatable, { activatableProps } from '@mixins/activatable/index.ts'
import { positionableProps } from '@mixins/positionable/index.ts'
import { computed, ExtractPropTypes, PropType, reactive, Ref, SetupContext, toRefs, watch } from 'vue'
import { convertToUnit } from '../../util/helpers'
import useStackable from '../stackable'

export const menuableProps = {
  ...positionableProps(),
  ...activatableProps,
  allowOverflow: Boolean,
  light: Boolean,
  dark: Boolean,
  maxWidth: {
    type: [Number, String],
    default: 'auto',
  },
  minWidth: [Number, String],
  nudgeBottom: {
    type: [Number, String],
    default: 0,
  },
  nudgeLeft: {
    type: [Number, String],
    default: 0,
  },
  nudgeRight: {
    type: [Number, String],
    default: 0,
  },
  nudgeTop: {
    type: [Number, String],
    default: 0,
  },
  nudgeWidth: {
    type: [Number, String],
    default: 0,
  },
  offsetOverflow: Boolean,
  openOnClick: Boolean,
  positionX: {
    type: Number,
    default: null,
  },
  positionY: {
    type: Number,
    default: null,
  },
  zIndex: {
    type: [Number, String],
    default: null,
  },
  attach: [Boolean, String, Object] as PropType<boolean | string | Element>,
  offsetX: Boolean,
  offsetY: Boolean,
}

// Types
// const baseMixins = mixins(
//   Stackable,
//   Positionable,
//   Activatable
// )

// interface options extends ExtractVue<typeof baseMixins> {
//   attach: boolean | string | Element
//   offsetY: boolean
//   offsetX: boolean
//   $refs: {
//     content: HTMLElement
//     activator: HTMLElement
//   }
// }

/* @vue/component */
export function useMenuable(props: ExtractPropTypes<typeof menuableProps>, context: SetupContext) {
  const stackable = useStackable()
  const activatable = useActivatable(props, context)
  const { content } = stackable
  const { getActivator, genActivatorListeners: _genActivatorListeners } = activatable
  const data = reactive({
    absoluteX: 0,
    absoluteY: 0,
    activatedBy: null as EventTarget | null,
    activatorFixed: false,
    dimensions: {
      activator: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        offsetTop: 0,
        scrollHeight: 0,
        offsetLeft: 0,
      },
      content: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        offsetTop: 0,
        scrollHeight: 0,
      },
    },
    hasJustFocused: false,
    hasWindow: false,
    inputActivator: false,
    isContentActive: false,
    pageWidth: 0,
    pageYOffset: 0,
    stackClass: 'v-menu__content--active',
    stackMinZIndex: 6,
  })

  const computedLeft = computed(() => {
    const a = data.dimensions.activator
    const c = data.dimensions.content
    const activatorLeft = (props.attach !== false ? a.offsetLeft : a.left) || 0
    const minWidth = Math.max(a.width, c.width)
    let left = 0
    left += props.left ? activatorLeft - (minWidth - a.width) : activatorLeft
    if (props.offsetX) {
      const maxWidth = isNaN(Number(props.maxWidth))
        ? a.width
        : Math.min(a.width, Number(props.maxWidth))

      left += props.left ? -maxWidth : a.width
    }
    if (props.nudgeLeft) left -= parseInt(props.nudgeLeft)
    if (props.nudgeRight) left += parseInt(props.nudgeRight)

    return left
  })
  const computedTop = computed(() => {
    const a = data.dimensions.activator
    const c = data.dimensions.content
    let top = 0

    if (props.top) top += a.height - c.height
    if (props.attach !== false) top += a.offsetTop
    else top += a.top + data.pageYOffset
    if (props.offsetY) top += props.top ? -a.height : a.height
    if (props.nudgeTop) top -= parseInt(props.nudgeTop)
    if (props.nudgeBottom) top += parseInt(props.nudgeBottom)

    return top
  })
  const hasActivator: Ref<boolean> = computed(() => {
    return !!context.slots.activator || !!props.activator || !!data.inputActivator
  })

  watch(() => props.disabled, (val) => {
    val && callDeactivate()
  })
  watch(() => props.isActive, (val) => {
    if (props.disabled) return
    val ? callActivate() : callDeactivate()
  })
  watch([() => props.positionX, () => props.positionY], updateDimensions)

  function absolutePosition() {
    return {
      offsetTop: 0,
      offsetLeft: 0,
      scrollHeight: 0,
      top: props.positionY || data.absoluteY,
      bottom: props.positionY || data.absoluteY,
      left: props.positionX || data.absoluteX,
      right: props.positionX || data.absoluteX,
      height: 0,
      width: 0,
    }
  }
  function activate() { }
  function calcLeft(menuWidth: number) {
    return convertToUnit(props.attach !== false
      ? computedLeft.value
      : calcXOverflow(computedLeft.value, menuWidth))
  }
  function calcTop() {
    return convertToUnit(props.attach !== false
      ? computedTop.value
      : calcYOverflow(computedTop.value))
  }
  function calcXOverflow(left: number, menuWidth: number) {
    const xOverflow = left + menuWidth - data.pageWidth + 12

    if ((!props.left || props.right) && xOverflow > 0) {
      left = Math.max(left - xOverflow, 0)
    } else {
      left = Math.max(left, 12)
    }

    return left + getOffsetLeft()
  }
  function calcYOverflow(top: number) {
    const documentHeight = getInnerHeight()
    const toTop = data.pageYOffset + documentHeight
    const activator = data.dimensions.activator
    const contentHeight = data.dimensions.content.height
    const totalHeight = top + contentHeight
    const isOverflowing = toTop < totalHeight

    // If overflowing bottom and offset
    // TODO: set 'bottom' position instead of 'top'
    if (isOverflowing &&
      props.offsetOverflow &&
      // If we don't have enough room to offset
      // the overflow, don't offset
      activator.top > contentHeight
    ) {
      top = data.pageYOffset + (activator.top - contentHeight)
      // If overflowing bottom
    } else if (isOverflowing && !props.allowOverflow) {
      top = toTop - contentHeight - 12
      // If overflowing top
    } else if (top < data.pageYOffset && !props.allowOverflow) {
      top = data.pageYOffset + 12
    }

    return top < 12 ? 12 : top
  }
  function callActivate() {
    if (!data.hasWindow) return

    activate()
  }
  function callDeactivate() {
    data.isContentActive = false

    deactivate()
  }
  function checkForPageYOffset() {
    if (data.hasWindow) {
      data.pageYOffset = data.activatorFixed ? 0 : getOffsetTop()
    }
  }
  function checkActivatorFixed() {
    if (props.attach !== false) return
    let el = getActivator()
    while (el) {
      if (window.getComputedStyle(el).position === 'fixed') {
        data.activatorFixed = true
        return
      }
      el = el.offsetParent as HTMLElement
    }
    data.activatorFixed = false
  }
  function deactivate() { }
  function genActivatorListeners() {
    const listeners = _genActivatorListeners()

    const onClick = listeners.onClick

    listeners.onClick = (e: MouseEvent & KeyboardEvent & FocusEvent) => {
      if (props.openOnClick) {
        onClick && onClick(e)
      }

      data.absoluteX = e.clientX
      data.absoluteY = e.clientY
    }

    return listeners
  }
  function getInnerHeight() {
    if (!data.hasWindow) return 0

    return window.innerHeight ||
      document.documentElement.clientHeight
  }
  function getOffsetLeft() {
    if (!data.hasWindow) return 0

    return window.pageXOffset ||
      document.documentElement.scrollLeft
  }
  function getOffsetTop() {
    if (!data.hasWindow) return 0

    return window.pageYOffset ||
      document.documentElement.scrollTop
  }
  function getRoundedBoundedClientRect(el: Element) {
    const rect = el.getBoundingClientRect()
    return {
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      bottom: Math.round(rect.bottom),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    }
  }
  function measure(el: HTMLElement) {
    if (!el || !data.hasWindow) return null

    const rect = getRoundedBoundedClientRect(el)

    // Account for activator margin
    if (props.attach !== false) {
      const style = window.getComputedStyle(el)

      rect.left = parseInt(style.marginLeft!)
      rect.top = parseInt(style.marginTop!)
    }

    return rect
  }
  function sneakPeek(cb: () => void) {
    requestAnimationFrame(() => {
      const el = content.value

      if (!el || el.style.display !== 'none') {
        cb()
        return
      }

      el.style.display = 'inline-block'
      cb()
      el.style.display = 'none'
    })
  }
  function startTransition() {
    return new Promise<void>(resolve => requestAnimationFrame(() => {
      data.isContentActive = data.hasJustFocused = props.isActive ?? false
      resolve()
    }))
  }
  function updateDimensions() {
    data.hasWindow = typeof window !== 'undefined'
    checkActivatorFixed()
    checkForPageYOffset()
    data.pageWidth = document.documentElement.clientWidth

    const dimensions: any = {
      activator: { ...data.dimensions.activator },
      content: { ...data.dimensions.content },
    }

    // Activator should already be shown
    if (!hasActivator.value || props.absolute) {
      dimensions.activator = absolutePosition()
    } else {
      const activator = getActivator()
      if (!activator) return

      dimensions.activator = measure(activator)
      dimensions.activator.offsetLeft = activator.offsetLeft
      if (props.attach !== false) {
        // account for css padding causing things to not line up
        // this is mostly for v-autocomplete, hopefully it won't break anything
        dimensions.activator.offsetTop = activator.offsetTop
      } else {
        dimensions.activator.offsetTop = 0
      }
    }

    // Display and hide to get dimensions
    sneakPeek(() => {
      content.value && (dimensions.content = measure(content.value))

      data.dimensions = dimensions
    })
  }
  return {
    ...activatable,
    ...stackable,
    ...toRefs(data),
    computedLeft,
    computedTop,
    hasActivator,
    absolutePosition,
    activate,
    calcLeft,
    calcTop,
    calcXOverflow,
    calcYOverflow,
    callActivate,
    callDeactivate,
    checkForPageYOffset,
    checkActivatorFixed,
    deactivate,
    genActivatorListeners,
    getInnerHeight,
    getOffsetLeft,
    getOffsetTop,
    getRoundedBoundedClientRect,
    measure,
    sneakPeek,
    startTransition,
    updateDimensions,
  }
}
