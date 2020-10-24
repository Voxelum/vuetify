import useMeasurable, { measurableProps } from '@mixins/measurable'
import { menuableProps, useMenuable } from '@mixins/menuable'
import { computed, defineComponent, ExtractPropTypes, h, onMounted, reactive, Ref, SetupContext } from 'vue'
import useActivatable, { activatableProps } from '../../mixins/activatable'
import useColorable, { colorableProps } from '../../mixins/colorable'
import useDelayable from '../../mixins/delayable'
import { dependentProps, useDependent } from '../../mixins/dependent'
import { detachableProps, useDetachable } from '../../mixins/detachable'
import { toggableFactory } from '../../mixins/toggleable'
import { consoleError } from '../../util/console'
// Helpers
import { convertToUnit, getSlotType, keyCodes } from '../../util/helpers'
import './VTooltip.sass'

// Colorable, Delayable, Dependent, Detachable, Menuable, Toggleable

export const VTooltipProps = {
  ...colorableProps,
  ...dependentProps,
  ...detachableProps,
  ...menuableProps,

  closeDelay: {
    type: [Number, String],
    default: 0,
  },
  disabled: Boolean,
  fixed: {
    type: Boolean,
    default: true,
  },
  openDelay: {
    type: [Number, String],
    default: 0,
  },
  openOnHover: {
    type: Boolean,
    default: true,
  },
  tag: {
    type: String,
    default: 'span',
  },
  transition: String,
}

/* @vue/component */
export function useVTooltip(props: ExtractPropTypes<typeof VTooltipProps>, context: SetupContext) {
  const { setBackgroundColor } = useColorable(context)
  const { getScopeIdAttrs } = useDetachable(props, context)
  const { } = useDependent(props, context)
  const {
    getContentSlot, runDelay,
    isActive, getActivator,
    updateDimensions,
    activatorFixed,
    calcXOverflow,
    isContentActive,
    pageYOffset,
    calcYOverflow,
    activeZIndex,
    dimensions,
    startTransition,
    genActivatorListeners: _genActivatorListeners,
  } = useMenuable(props, context)

  // getContentSlot

  const data = reactive({
    calculatedMinWidth: 0,
    closeDependents: false,
  })

  const calculatedLeft: Ref<string> = computed(() => {
    const { activator, content } = dimensions.value
    const unknown = !props.bottom && !props.left && !props.top && !props.right
    const activatorLeft = props.attach !== false ? activator.offsetLeft : activator.left
    let left = 0

    if (props.top || props.bottom || unknown) {
      left = (
        activatorLeft +
        (activator.width / 2) -
        (content.width / 2)
      )
    } else if (props.left || props.right) {
      left = (
        activatorLeft +
        (props.right ? activator.width : -content.width) +
        (props.right ? 10 : -10)
      )
    }

    if (props.nudgeLeft) left -= parseInt(props.nudgeLeft)
    if (props.nudgeRight) left += parseInt(props.nudgeRight)

    return `${calcXOverflow(left, dimensions.value.content.width)}px`
  })
  const calculatedTop: Ref<string> = computed(() => {
    const { activator, content } = dimensions.value
    const activatorTop = props.attach !== false ? activator.offsetTop : activator.top
    let top = 0

    if (props.top || props.bottom) {
      top = (
        activatorTop +
        (props.bottom ? activator.height : -content.height) +
        (props.bottom ? 10 : -10)
      )
    } else if (props.left || props.right) {
      top = (
        activatorTop +
        (activator.height / 2) -
        (content.height / 2)
      )
    }

    if (props.nudgeTop) top -= parseInt(props.nudgeTop)
    if (props.nudgeBottom) top += parseInt(props.nudgeBottom)

    return `${calcYOverflow(top + pageYOffset.value)}px`
  })
  const classes: Ref<object> = computed(() => {
    return {
      'v-tooltip--top': props.top,
      'v-tooltip--right': props.right,
      'v-tooltip--bottom': props.bottom,
      'v-tooltip--left': props.left,
      'v-tooltip--attached':
        props.attach === '' ||
        props.attach === true ||
        props.attach === 'attach',
    }
  })
  const computedTransition: Ref<string> = computed(() => {
    if (props.transition) return props.transition

    return props.isActive ? 'scale-transition' : 'fade-transition'
  })
  const offsetY: Ref<boolean> = computed(() => {
    return props.top || props.bottom || false
  })
  const offsetX: Ref<boolean> = computed(() => {
    return props.left || props.right || false
  })
  const styles: Ref<object> = computed(() => {
    return {
      left: calculatedLeft.value,
      maxWidth: convertToUnit(props.maxWidth),
      minWidth: convertToUnit(props.minWidth),
      opacity: props.isActive ? 0.9 : 0,
      top: calculatedTop.value,
      zIndex: props.zIndex || activeZIndex.value,
    }
  })


  onMounted(() => {
    if (getSlotType(context, 'activator', true) === 'v-slot') {
      consoleError(`v-tooltip's activator slot must be bound, try '<template #activator="data"><v-btn v-on="data.on>'`, this)
    }
  })

  function activate() {
    // Update coordinates and dimensions of menu
    // and its activator
    updateDimensions()
    // Start the transition
    requestAnimationFrame(startTransition)
  }
  function deactivate() {
    runDelay('close')
  }
  function genActivatorListeners() {
    const listeners = _genActivatorListeners()

    listeners.onFocus = (e: Event) => {
      getActivator(e)
      runDelay('open')
    }
    listeners.onBlur = (e: Event) => {
      getActivator(e)
      runDelay('close')
    }
    listeners.onKeydown = (e: KeyboardEvent) => {
      if (e.keyCode === keyCodes.esc) {
        getActivator(e)
        runDelay('close')
      }
    }

    return listeners
  }
  function genTransition() {
    const content = genContent()

    if (!computedTransition.value) return content

    return h('transition', {
      props: {
        name: computedTransition.value,
      },
    }, [content])
  }
  function genContent() {
    return h(
      'div',
      setBackgroundColor(props.color, {
        staticClass: 'v-tooltip__content',
        class: {
          [props.contentClass]: true,
          menuable__content__active: props.isActive,
          'v-tooltip__content--fixed': activatorFixed.value,
        },
        style: styles.value,
        attrs: getScopeIdAttrs(),
        directives: [{
          name: 'show',
          value: isContentActive.value,
        }],
        ref: 'content',
      }),
      getContentSlot()
    )
  }

  return {
    calculatedLeft,
    calculatedTop,
    classes,
    computedTransition,
    offsetY,
    offsetX,
    styles,
    activate,
    deactivate,
    genActivatorListeners,
    genTransition,
    genContent,
  }
}
const VTooltip = defineComponent({
  name: 'v-tooltip',
  props: VTooltipProps,
  setup(props, context) {
    const { } = useVTooltip(props, context)
    return h(props.tag, {
      staticClass: 'v-tooltip',
      class: classes.value,
    }, [
      props.showLazyContent(() => [genTransition()]),
      props.genActivator(),
    ])
  },
})

export default VTooltip

