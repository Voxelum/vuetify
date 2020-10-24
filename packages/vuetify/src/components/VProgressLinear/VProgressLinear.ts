import { useVuetify } from '@framework'
import { computed, defineComponent, ExtractPropTypes, h, mergeProps, onMounted, reactive, Ref, ref, SetupContext, VNode } from 'vue'
import useColorable, { backgroundColor, colorableProps, textColor } from '../../mixins/colorable'
import { positionableProps } from '../../mixins/positionable'
import { proxyable } from '../../mixins/proxyable'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Utilities
import { convertToUnit, getSlot } from '../../util/helpers'
// Components
import {
  VFadeTransition,
  VSlideXTransition
} from '../transitions'
import './VProgressLinear.sass'

//   Colorable,
//   PositionableFactory(['absolute', 'fixed', 'top', 'bottom']),
//   Proxyable,
//   Themeable

const { useProxyable, proxyableProps } = proxyable()

export const VProgressLinearProps = {
  ...colorableProps,
  ...positionableProps(['absolute', 'fixed', 'top', 'bottom']),
  ...proxyableProps,
  ...themeableProps,
  active: {
    type: Boolean,
    default: true,
  },
  backgroundColor: {
    type: String,
    default: null,
  },
  backgroundOpacity: {
    type: [Number, String],
    default: null,
  },
  bufferValue: {
    type: [Number, String],
    default: 100,
  },
  color: {
    type: String,
    default: 'primary',
  },
  height: {
    type: [Number, String],
    default: 4,
  },
  indeterminate: Boolean,
  query: Boolean,
  reverse: Boolean,
  rounded: Boolean,
  stream: Boolean,
  striped: Boolean,
  value: {
    type: [Number, String],
    default: 0,
  },
}

/* @vue/component */
export function useVProgressLinear(props: ExtractPropTypes<typeof VProgressLinearProps>, context: SetupContext) {
  const { themeClasses } = useThemeable(props)
  const { internalValue } = useProxyable(props, context)
  const vuetify = useVuetify()

  const data = reactive({
    internalLazyValue: props.value || 0,
  })

  const el: Ref<HTMLElement | null> = ref(null)
  const __cachedBackground: Ref<VNode> = computed(() => {
    return h('div', mergeProps({
      class: 'v-progress-linear__background',
      style: backgroundStyle.value,
    }, backgroundColor(props.backgroundColor || props.color)))
  })
  const __cachedBar: Ref<VNode> = computed(() => {
    return h(computedTransition.value, [__cachedBarType.value])
  })
  const __cachedBarType: Ref<VNode> = computed(() => {
    return props.indeterminate ? __cachedIndeterminate.value : __cachedDeterminate.value
  })
  const __cachedBuffer: Ref<VNode> = computed(() => {
    return h('div', {
      class: 'v-progress-linear__buffer',
      style: styles.value,
    })
  })
  const __cachedDeterminate: Ref<VNode> = computed(() => {
    return h('div', mergeProps({
      class: `v-progress-linear__determinate`,
      style: {
        width: convertToUnit(normalizedValue.value, '%'),
      },
    }, backgroundColor(props.color)))
  })
  const __cachedIndeterminate: Ref<VNode> = computed(() => {
    return h('div', {
      class: {
        'v-progress-linear__indeterminate': true,
        'v-progress-linear__indeterminate--active': props.active,
      },
    }, [
      genProgressBar('long'),
      genProgressBar('short'),
    ])
  })
  const __cachedStream: Ref<VNode | null> = computed(() => {
    if (!props.stream) return null

    return h('div', mergeProps({
      class: 'v-progress-linear__stream',
      style: {
        width: convertToUnit(100 - normalizedBuffer.value, '%'),
      },
    }, textColor(props.color)))
  })
  const backgroundStyle: Ref<object> = computed(() => {
    const backgroundOpacity = props.backgroundOpacity == null
      ? (props.backgroundColor ? 1 : 0.3)
      : parseFloat(props.backgroundOpacity)

    return {
      opacity: backgroundOpacity,
      [isReversed.value ? 'right' : 'left']: convertToUnit(normalizedValue.value, '%'),
      width: convertToUnit(normalizedBuffer.value - normalizedValue.value, '%'),
    }
  })
  const classes: Ref<object> = computed(() => {
    return {
      'v-progress-linear': true,
      'v-progress-linear--absolute': props.absolute,
      'v-progress-linear--fixed': props.fixed,
      'v-progress-linear--query': props.query,
      'v-progress-linear--reactive': _reactive.value,
      'v-progress-linear--reverse': isReversed.value,
      'v-progress-linear--rounded': props.rounded,
      'v-progress-linear--striped': props.striped,
      ...themeClasses.value,
    }
  })
  const computedTransition = computed(() => {
    return props.indeterminate ? VFadeTransition : VSlideXTransition
  })
  const isReversed: Ref<boolean> = computed(() => {
    return vuetify.rtl !== props.reverse
  })
  const normalizedBuffer: Ref<number> = computed(() => {
    return normalize(props.bufferValue)
  })
  const normalizedValue: Ref<number> = computed(() => {
    return normalize(data.internalLazyValue)
  })
  const _reactive: Ref<boolean> = computed(() => {
    return Boolean(context.attrs.onChange)
  })
  const styles: Ref<object> = computed(() => {
    const styles: Record<string, any> = {}

    if (!props.active) {
      styles.height = 0
    }

    if (!props.indeterminate && parseFloat(normalizedBuffer.value) !== 100) {
      styles.width = convertToUnit(normalizedBuffer.value, '%')
    }

    return styles
  })

  function genContent() {
    const slot = getSlot(context, 'default', { value: data.internalLazyValue })

    if (!slot) return null

    return h('div', {
      class: 'v-progress-linear__content',
    }, slot)
  }
  function genListeners() {
    const listeners = { ...context.attrs }

    if (_reactive.value) {
      listeners.onClick = onClick
    }

    return listeners
  }
  function genProgressBar(name: 'long' | 'short') {
    return h('div', mergeProps({
      class: {
        'v-progress-linear__indeterminate': true,
        [name]: true,
      },
    }, backgroundColor(props.color)))
  }
  function onClick(e: MouseEvent) {
    if (!_reactive.value) return

    const { width } = el.value!.getBoundingClientRect()

    internalValue.value = e.offsetX / width * 100
  }
  function normalize(value: string | number) {
    if (value < 0) return 0
    if (value > 100) return 100
    return parseFloat(value)
  }

  return {
    __cachedBackground,
    __cachedBar,
    __cachedBarType,
    __cachedBuffer,
    __cachedDeterminate,
    __cachedIndeterminate,
    __cachedStream,
    backgroundStyle,
    classes,
    computedTransition,
    isReversed,
    normalizedBuffer,
    normalizedValue,
    reactive: _reactive,
    styles,
    genContent,
    genListeners,
    genProgressBar,
    onClick,
    normalize,
    el,
  }
}
const VProgressLinear = defineComponent({
  name: 'v-progress-linear',
  props: VProgressLinearProps,
  setup(props, context) {
    const {
      normalizedBuffer, normalizedValue, classes, genListeners,
      __cachedStream, __cachedBackground,
      __cachedBuffer, __cachedBar,
      genContent,
      el,
    } = useVProgressLinear(props, context)

    return () => h('div', {
      role: 'progressbar',
      'aria-valuemin': 0,
      'aria-valuemax': normalizedBuffer.value,
      'aria-valuenow': props.indeterminate ? undefined : normalizedValue.value,
      class: classes.value,
      style: {
        bottom: props.bottom ? 0 : undefined,
        height: props.active ? convertToUnit(props.height) : 0,
        top: props.top ? 0 : undefined,
      },
      ref: el,
      ...genListeners(),
    }, [
      __cachedStream.value,
      __cachedBackground.value,
      __cachedBuffer.value,
      __cachedBar.value,
      genContent(),
    ])
  },
})

export default VProgressLinear

