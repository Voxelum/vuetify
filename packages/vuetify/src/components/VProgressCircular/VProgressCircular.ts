import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext, VNodeArrayChildren, mergeProps } from 'vue'
// Styles
import './VProgressCircular.sass'

// Mixins
import Colorable, { colorableProps, textColor } from '../../mixins/colorable'

// Utils
import { convertToUnit } from '../../util/helpers'

// Types
import { VNode } from 'vue'
import useColorable from '../../mixins/colorable'
export const VProgressCircularProps = {
  ...colorableProps,
  button: Boolean,
  indeterminate: Boolean,
  rotate: {
    type: [Number, String],
    default: 0,
  },
  size: {
    type: [Number, String],
    default: 32,
  },
  width: {
    type: [Number, String],
    default: 4,
  },
  value: {
    type: [Number, String],
    default: 0,
  },
}

/* @vue/component */
export function useVProgressCircular(props: ExtractPropTypes<typeof VProgressCircularProps>, context: SetupContext) {
  const data = reactive({
    radius: 20,
  })

  const calculatedSize: Ref<number> = computed(() => {
    return Number(props.size) + (props.button ? 8 : 0)
  })

  const circumference: Ref<number> = computed(() => {
    return 2 * Math.PI * data.radius
  })

  const classes: Ref<object> = computed(() => {
    return {
      'v-progress-circular': true,
      'v-progress-circular--indeterminate': props.indeterminate,
      'v-progress-circular--button': props.button,
    }
  })

  const normalizedValue: Ref<number> = computed(() => {
    if (props.value < 0) {
      return 0
    }

    if (props.value > 100) {
      return 100
    }

    return parseFloat(props.value)
  })

  const strokeDashArray: Ref<number> = computed(() => {
    return Math.round(circumference.value * 1000) / 1000
  })

  const strokeDashOffset: Ref<string> = computed(() => {
    return ((100 - normalizedValue.value) / 100) * circumference.value + 'px'
  })

  const strokeWidth: Ref<number> = computed(() => {
    return Number(props.width) / +props.size * viewBoxSize.value * 2
  })

  const styles: Ref<object> = computed(() => {
    return {
      height: convertToUnit(calculatedSize.value),
      width: convertToUnit(calculatedSize.value),
    }
  })

  const svgStyles: Ref<object> = computed(() => {
    return {
      transform: `rotate(${Number(props.rotate)}deg)`,
    }
  })

  const viewBoxSize: Ref<number> = computed(() => {
    return data.radius / (1 - Number(props.width) / +props.size)
  })

  function genCircle(name: string, offset: string | number): VNode {
    return h('circle', {
      class: `v-progress-circular__${name}`,
      attrs: {
        fill: 'transparent',
        cx: 2 * viewBoxSize.value,
        cy: 2 * viewBoxSize.value,
        r: data.radius,
        'stroke-width': strokeWidth.value,
        'stroke-dasharray': strokeDashArray.value,
        'stroke-dashoffset': offset,
      },
    })
  }
  function genSvg(): VNode {
    const children = [
      props.indeterminate || genCircle('underlay', 0),
      genCircle('overlay', strokeDashOffset.value),
    ] as VNodeArrayChildren

    return h('svg', {
      style: svgStyles.value,
      attrs: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `${viewBoxSize.value} ${viewBoxSize.value} ${2 * viewBoxSize.value} ${2 * viewBoxSize.value}`,
      },
    }, children)
  }
  function genInfo(): VNode {
    return h('div', {
      staticClass: 'v-progress-circular__info',
    }, context.slots.default)
  }

  return {
    calculatedSize,
    circumference,
    classes,
    normalizedValue,
    strokeDashArray,
    strokeDashOffset,
    strokeWidth,
    styles,
    svgStyles,
    viewBoxSize,
    genCircle,
    genSvg,
    genInfo,
  }
}
const VProgressCircular = defineComponent({
  name: 'v-progress-circular',
  props: VProgressCircularProps,
  setup(props, context) {
    const { genSvg, genInfo, classes, styles, normalizedValue } = useVProgressCircular(props, context)

    return () => h('div', mergeProps({
      role: 'progressbar',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': props.indeterminate ? undefined : normalizedValue.value,
      class: classes.value,
      style: styles.value,
      ...context.attrs,
    }, textColor(props.color)), [
      genSvg(),
      genInfo(),
    ])
  },
})

export default VProgressCircular

