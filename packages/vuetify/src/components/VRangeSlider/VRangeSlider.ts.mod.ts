import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VRangeSlider.sass'

// Components
import VSlider from '../VSlider'

// Helpers
import {
  createRange,
  deepEqual,
} from '../../util/helpers'

// Types
import { PropValidator } from 'vue/types/options'
export const VRangeSliderProps = {
    value: {
      type: Array,
      default: () => ([0, 0]),
    } as unknown as PropValidator<[number, number]>,
}

/* @vue/component */
export function useVRangeSlider(props: ExtractPropTypes<typeof VRangeSliderProps>, context: SetupContext) {


  const data = reactive({
      activeThumb: null as null | number,
      lazyValue: props.value,
    }
)

    const classes: Ref<object> = computed(() => {
      return {
        ...VSlider.options.computed.classes.call(this),
        'v-input--range-slider': true,
      }
    })
    const internalValue = computed({
      get (): number[] {
        return data.lazyValue
      },
      set (val: number[]) {
        // Round value to ensure the
        // entire slider range can
        // be selected with step
        let value = val.map((v = 0) => props.roundValue(Math.min(Math.max(v, props.minValue), props.maxValue)))

        // Switch values if range and wrong order
        if (value[0] > value[1] || value[1] < value[0]) {
          if (data.activeThumb !== null) {
            const toFocus = data.activeThumb === 1 ? 0 : 1
            const el = context.refs[`thumb_${toFocus}`] as HTMLElement
            el.focus()
          }
          value = [value[1], value[0]]
        }

        data.lazyValue = value
        if (!deepEqual(value, props.value)) context.emit('input', value)

        props.validate()
      },
    })
    const inputWidth: Ref<number[]> = computed(() => {
      return internalValue.value.map((v: number) => (
        props.roundValue(v) - props.minValue) / (props.maxValue - props.minValue) * 100
      )
    })

  function getTrackStyle (startLength: number, endLength: number, startPadding = 0, endPadding = 0) {
      const startDir = props.vertical ? context.vuetify.rtl ? 'top' : 'bottom' : context.vuetify.rtl ? 'right' : 'left'
      const endDir = props.vertical ? 'height' : 'width'

      const start = `calc(${startLength}% + ${startPadding}px)`
      const end = `calc(${endLength}% + ${endPadding}px)`

      return {
        transition: props.trackTransition,
        [startDir]: start,
        [endDir]: end,
      }
    }
  function getIndexOfClosestValue (arr: number[], v: number) {
      if (Math.abs(arr[0] - v) < Math.abs(arr[1] - v)) return 0
      else return 1
    }
  function genInput () {
      return createRange(2).map(i => {
        const input = VSlider.options.methods.genInput.call(this)

        input.data = input.data || {}
        input.data.attrs = input.data.attrs || {}
        input.data.attrs.value = internalValue.value[i]
        input.data.attrs.id = `input-${i ? 'max' : 'min'}-${props._uid}`

        return input
      })
    }
  function genTrackContainer () {
      const children = []

      const padding = props.isDisabled ? 10 : 0
      const sections: { class: string, color: string | undefined, styles: [number, number, number, number] }[] = [
        {
          class: 'v-slider__track-background',
          color: props.computedTrackColor,
          styles: [0, inputWidth.value[0], 0, -padding],
        },
        {
          class: props.isDisabled ? 'v-slider__track-background' : 'v-slider__track-fill',
          color: props.isDisabled ? props.computedTrackColor : props.computedColor,
          styles: [inputWidth.value[0], Math.abs(inputWidth.value[1] - inputWidth.value[0]), padding, padding * -2],
        },
        {
          class: 'v-slider__track-background',
          color: props.computedTrackColor,
          styles: [inputWidth.value[1], Math.abs(100 - inputWidth.value[1]), padding, -padding],
        },
      ]

      if (context.vuetify.rtl) sections.reverse()

      children.push(...sections.map(section => context.createElement('div', props.setBackgroundColor(section.color, {
        staticClass: section.class,
        style: getTrackStyle(...section.styles),
      }))))

      return context.createElement('div', {
        staticClass: 'v-slider__track-container',
        ref: 'track',
      }, children)
    }
  function genChildren () {
      return [
        genInput(),
        genTrackContainer(),
        props.genSteps(),
        createRange(2).map(index => {
          const value = internalValue.value[index]
          const onDrag = (e: MouseEvent) => {
            props.isActive = true
            data.activeThumb = index
            props.onThumbMouseDown(e)
          }
          const onFocus = (e: Event) => {
            props.isFocused = true
            data.activeThumb = index

            context.emit('focus', e)
          }

          const onBlur = (e: Event) => {
            props.isFocused = false
            data.activeThumb = null

            context.emit('blur', e)
          }

          const valueWidth = inputWidth.value[index]
          const isActive = props.isActive && data.activeThumb === index
          const isFocused = props.isFocused && data.activeThumb === index

          return props.genThumbContainer(value, valueWidth, isActive, isFocused, onDrag, onFocus, onBlur, `thumb_${index}`)
        }),
      ]
    }
  function onSliderClick (e: MouseEvent) {
      if (!props.isActive) {
        if (props.noClick) {
          props.noClick = false
          return
        }

        const { value, isInsideTrack } = props.parseMouseMove(e)

        if (isInsideTrack) {
          data.activeThumb = getIndexOfClosestValue(internalValue.value, value)
          const refName = `thumb_${data.activeThumb}`
          const thumbRef = context.refs[refName] as HTMLElement
          thumbRef.focus()
        }

        setInternalValue(value)

        context.emit('change', internalValue.value)
      }
    }
  function onMouseMove (e: MouseEvent) {
      const { value, isInsideTrack } = props.parseMouseMove(e)

      if (isInsideTrack && data.activeThumb === null) {
        data.activeThumb = getIndexOfClosestValue(internalValue.value, value)
      }

      setInternalValue(value)
    }
  function onKeyDown (e: KeyboardEvent) {
      if (data.activeThumb === null) return

      const value = props.parseKeyDown(e, internalValue.value[data.activeThumb])

      if (value == null) return

      setInternalValue(value)
      context.emit('change', internalValue.value)
    }
  function setInternalValue (value: number) {
      internalValue.value = internalValue.value.map((v: number, i: number) => {
        if (i === data.activeThumb) return value
        else return Number(v)
      })
    }
  return {
    classes,
    internalValue,
    inputWidth,
    getTrackStyle,
    getIndexOfClosestValue,
    genInput,
    genTrackContainer,
    genChildren,
    onSliderClick,
    onMouseMove,
    onKeyDown,
    setInternalValue,
  }
}
const VRangeSlider = defineComponent({
  name: 'v-range-slider',
  props: VRangeSliderProps,
  setup(props, context) {
    const {} = useVRangeSlider(props, context)
  },
})

export default VRangeSlider

