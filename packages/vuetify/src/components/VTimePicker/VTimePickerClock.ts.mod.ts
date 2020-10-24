import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VTimePickerClock.sass'

// Mixins
import Colorable from '../../mixins/colorable'
import Themeable from '../../mixins/themeable'

// Types
import mixins, { ExtractVue } from '../../util/mixins'
import Vue, { VNode, PropType, VNodeData } from 'vue'
import { PropValidator } from 'vue/types/options'
export const VTimePickerClockProps = {
    allowedValues: Function as PropType<(value: number) => boolean>,
    ampm: Boolean,
    disabled: Boolean,
    double: Boolean,
    format: {
      type: Function,
      default: (val: string | number) => val,
    } as PropValidator<(val: string | number) => string | number>,
    max: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    scrollable: Boolean,
    readonly: Boolean,
    rotate: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 1,
    },
    value: Number,
}

interface Point {
  x: number
  y: number
}

interface options extends Vue {
  $refs: {
    clock: HTMLElement
    innerClock: HTMLElement
  }
}

/* eslint-disable indent */
  ExtractVue<[
    typeof Colorable,
    typeof Themeable
  ]>
/* eslint-enable indent */
>(
  Colorable,
  Themeable
/* @vue/component */
export function useVTimePickerClock(props: ExtractPropTypes<typeof VTimePickerClockProps>, context: SetupContext) {


  const data = reactive({
      inputValue: props.value,
      isDragging: false,
      valueOnMouseDown: null as number | null,
      valueOnMouseUp: null as number | null,
    }
)

    const count: Ref<number> = computed(() => {
      return props.max - props.min + 1
    })
    const degreesPerUnit: Ref<number> = computed(() => {
      return 360 / roundCount.value
    })
    const degrees: Ref<number> = computed(() => {
      return degreesPerUnit.value * Math.PI / 180
    })
    const displayedValue: Ref<number> = computed(() => {
      return props.value == null ? props.min : props.value
    })
    const innerRadiusScale: Ref<number> = computed(() => {
      return 0.62
    })
    const roundCount: Ref<number> = computed(() => {
      return props.double ? (count.value / 2) : count.value
    })

watch(props, (value) => {
      data.inputValue = value
})

  function wheel (e: WheelEvent) {
      e.preventDefault()

      const delta = Math.sign(-e.deltaY || 1)
      let value = displayedValue.value
      do {
        value = value + delta
        value = (value - props.min + count.value) % count.value + props.min
      } while (!isAllowed(value) && value !== displayedValue.value)

      if (value !== displayedValue.value) {
        update(value)
      }
    }
  function isInner (value: number) {
      return props.double && (value - props.min >= roundCount.value)
    }
  function handScale (value: number) {
      return isInner(value) ? innerRadiusScale.value : 1
    }
  function isAllowed (value: number) {
      return !props.allowedValues || props.allowedValues(value)
    }
  function genValues () {
      const children: VNode[] = []

      for (let value = props.min; value <= props.max; value = value + props.step) {
        const color = value === props.value && (props.color || 'accent')
        children.push(context.createElement('span', props.setBackgroundColor(color, {
          staticClass: 'v-time-picker-clock__item',
          class: {
            'v-time-picker-clock__item--active': value === displayedValue.value,
            'v-time-picker-clock__item--disabled': props.disabled || !isAllowed(value),
          },
          style: getTransform(value),
          domProps: { innerHTML: `<span>${props.format(value)}</span>` },
        })))
      }

      return children
    }
  function genHand () {
      const scale = `scaleY(${handScale(displayedValue.value)})`
      const angle = props.rotate + degreesPerUnit.value * (displayedValue.value - props.min)
      const color = (props.value != null) && (props.color || 'accent')
      return context.createElement('div', props.setBackgroundColor(color, {
        staticClass: 'v-time-picker-clock__hand',
        class: {
          'v-time-picker-clock__hand--inner': isInner(props.value),
        },
        style: {
          transform: `rotate(${angle}deg) ${scale}`,
        },
      }))
    }
  function getTransform (i: number) {
      const { x, y } = getPosition(i)
      return {
        left: `${50 + x * 50}%`,
        top: `${50 + y * 50}%`,
      }
    }
  function getPosition (value: number) {
      const rotateRadians = props.rotate * Math.PI / 180
      return {
        x: Math.sin((value - props.min) * degrees.value + rotateRadians) * handScale(value),
        y: -Math.cos((value - props.min) * degrees.value + rotateRadians) * handScale(value),
      }
    }
  function onMouseDown (e: MouseEvent | TouchEvent) {
      e.preventDefault()

      data.valueOnMouseDown = null
      data.valueOnMouseUp = null
      data.isDragging = true
      onDragMove(e)
    }
  function onMouseUp (e: MouseEvent | TouchEvent) {
      e.stopPropagation()

      data.isDragging = false
      if (data.valueOnMouseUp !== null && isAllowed(data.valueOnMouseUp)) {
        context.emit('change', data.valueOnMouseUp)
      }
    }
  function onDragMove (e: MouseEvent | TouchEvent) {
      e.preventDefault()
      if (!data.isDragging && e.type !== 'click') return

      const { width, top, left } = context.refs.clock.getBoundingClientRect()
      const { width: innerWidth } = context.refs.innerClock.getBoundingClientRect()
      const { clientX, clientY } = 'touches' in e ? e.touches[0] : e
      const center = { x: width / 2, y: -width / 2 }
      const coords = { x: clientX - left, y: top - clientY }
      const handAngle = Math.round(angle(center, coords) - props.rotate + 360) % 360
      const insideClick = props.double && euclidean(center, coords) < (innerWidth + innerWidth * innerRadiusScale.value) / 4
      const checksCount = Math.ceil(15 / degreesPerUnit.value)
      let value

      for (let i = 0; i < checksCount; i++) {
        value = angleToValue(handAngle + i * degreesPerUnit.value, insideClick)
        if (isAllowed(value)) return setMouseDownValue(value)

        value = angleToValue(handAngle - i * degreesPerUnit.value, insideClick)
        if (isAllowed(value)) return setMouseDownValue(value)
      }
    }
  function angleToValue (angle: number, insideClick: boolean): number {
      const value = (
        Math.round(angle / degreesPerUnit.value) +
        (insideClick ? roundCount.value : 0)
      ) % count.value + props.min

      // Necessary to fix edge case when selecting left part of the value(s) at 12 o'clock
      if (angle < (360 - degreesPerUnit.value / 2)) return value

      return insideClick ? props.max - roundCount.value + 1 : props.min
    }
  function setMouseDownValue (value: number) {
      if (data.valueOnMouseDown === null) {
        data.valueOnMouseDown = value
      }

      data.valueOnMouseUp = value
      update(value)
    }
  function update (value: number) {
      if (data.inputValue !== value) {
        data.inputValue = value
        context.emit('input', value)
      }
    }
  function euclidean (p0: Point, p1: Point) {
      const dx = p1.x - p0.x
      const dy = p1.y - p0.y

      return Math.sqrt(dx * dx + dy * dy)
    }
  function angle (center: Point, p1: Point) {
      const value = 2 * Math.atan2(p1.y - center.y - euclidean(center, p1), p1.x - center.x)
      return Math.abs(value * 180 / Math.PI)
    }

  return {
    count,
    degreesPerUnit,
    degrees,
    displayedValue,
    innerRadiusScale,
    roundCount,
    wheel,
    isInner,
    handScale,
    isAllowed,
    genValues,
    genHand,
    getTransform,
    getPosition,
    onMouseDown,
    onMouseUp,
    onDragMove,
    angleToValue,
    setMouseDownValue,
    update,
    euclidean,
    angle,
  }
}
const VTimePickerClock = defineComponent({
  name: 'v-time-picker-clock',
  props: VTimePickerClockProps,
  setup(props, context) {
    const {} = useVTimePickerClock(props, context)
    const data: VNodeData = {
      staticClass: 'v-time-picker-clock',
      class: {
        'v-time-picker-clock--indeterminate': props.value == null,
        ...props.themeClasses,
      },
      on: (props.readonly || props.disabled) ? undefined : {
        mousedown: onMouseDown,
        mouseup: onMouseUp,
        mouseleave: (e: MouseEvent) => (data.isDragging && onMouseUp(e)),
        touchstart: onMouseDown,
        touchend: onMouseUp,
        mousemove: onDragMove,
        touchmove: onDragMove,
      },
      ref: 'clock',
    }

    if (props.scrollable && data.on) {
      data.on.wheel = wheel
    }

    return h('div', data, [
      h('div', {
        staticClass: 'v-time-picker-clock__inner',
        ref: 'innerClock',
      }, [
        genHand(),
        genValues(),
      ]),
    ])
  },
})

export default VTimePickerClock

