import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VSlider.sass'

// Components
import VInput from '../VInput'
import { VScaleTransition } from '../transitions'

// Mixins
import mixins, { ExtractVue } from '../../util/mixins'
import Loadable from '../../mixins/loadable'

// Directives
import ClickOutside from '../../directives/click-outside'

// Helpers
import { addOnceEventListener, deepEqual, keyCodes, createRange, convertToUnit, passiveSupported } from '../../util/helpers'
import { consoleWarn } from '../../util/console'

// Types
import Vue, { VNode, VNodeChildrenArrayContents, PropType } from 'vue'
import { ScopedSlotChildren } from 'vue/types/vnode'
import { PropValidator } from 'vue/types/options'
export const VSliderProps = {
  disabled: Boolean,
  inverseLabel: Boolean,
  max: {
    type: [Number, String],
    default: 100,
  },
  min: {
    type: [Number, String],
    default: 0,
  },
  step: {
    type: [Number, String],
    default: 1,
  },
  thumbColor: String,
  thumbLabel: {
    type: [Boolean, String] as PropType<boolean | 'always' | undefined>,
    default: undefined,
    validator: v => typeof v === 'boolean' || v === 'always',
  },
  thumbSize: {
    type: [Number, String],
    default: 32,
  },
  tickLabels: {
    type: Array,
    default: () => ([]),
  } as PropValidator<string[]>,
  ticks: {
    type: [Boolean, String] as PropType<boolean | 'always'>,
    default: false,
    validator: v => typeof v === 'boolean' || v === 'always',
  },
  tickSize: {
    type: [Number, String],
    default: 2,
  },
  trackColor: String,
  trackFillColor: String,
  value: [Number, String],
  vertical: Boolean,
}

interface options extends Vue {
  $refs: {
    track: HTMLElement
  }
}

/* eslint-disable indent */
//   ExtractVue<[
//     typeof VInput,
//     typeof Loadable
//   ]>
// /* eslint-enable indent */
// >(
//   VInput,
//   Loadable

/* @vue/component */
export function useVSlider(props: ExtractPropTypes<typeof VSliderProps>, context: SetupContext) {
  const data = reactive({
    app: null as any,
    oldValue: null as any,
    keyPressed: 0,
    isFocused: false,
    isActive: false,
    noClick: false, // Prevent click event if dragging took place, hack for #7915
  })

    const classes: Ref<object> = computed(() => {
      return {
        ...VInput.options.computed.classes.call(this),
        'v-input__slider': true,
        'v-input__slider--vertical': props.vertical,
        'v-input__slider--inverse-label': props.inverseLabel,
      }
    })
    const internalValue = computed({
      get (): number {
        return props.lazyValue
      },
      set (val: number) {
        val = isNaN(val) ? minValue.value : val
        // Round value to ensure the
        // entire slider range can
        // be selected with step
        const value = roundValue(Math.min(Math.max(val, minValue.value), maxValue.value))

        if (value === props.lazyValue) return

        props.lazyValue = value

        context.emit('input', value)
      },
    })
    const trackTransition: Ref<string> = computed(() => {
      return data.keyPressed >= 2 ? 'none' : ''
    })
    const minValue: Ref<number> = computed(() => {
      return parseFloat(props.min)
    })
    const maxValue: Ref<number> = computed(() => {
      return parseFloat(props.max)
    })
    const stepNumeric: Ref<number> = computed(() => {
      return props.step > 0 ? parseFloat(props.step) : 0
    })
    const inputWidth: Ref<number> = computed(() => {
      const value = (roundValue(internalValue.value) - minValue.value) / (maxValue.value - minValue.value) * 100

      return value
    })
    const trackFillStyles: Ref<Partial<CSSStyleDeclaration>> = computed(() => {
      const startDir = props.vertical ? 'bottom' : 'left'
      const endDir = props.vertical ? 'top' : 'right'
      const valueDir = props.vertical ? 'height' : 'width'

      const start = context.vuetify.rtl ? 'auto' : '0'
      const end = context.vuetify.rtl ? '0' : 'auto'
      const value = props.isDisabled ? `calc(${inputWidth.value}% - 10px)` : `${inputWidth.value}%`

      return {
        transition: trackTransition.value,
        [startDir]: start,
        [endDir]: end,
        [valueDir]: value,
      }
    })
    const trackStyles: Ref<Partial<CSSStyleDeclaration>> = computed(() => {
      const startDir = props.vertical ? context.vuetify.rtl ? 'bottom' : 'top' : context.vuetify.rtl ? 'left' : 'right'
      const endDir = props.vertical ? 'height' : 'width'

      const start = '0px'
      const end = props.isDisabled ? `calc(${100 - inputWidth.value}% - 10px)` : `calc(${100 - inputWidth.value}%)`

      return {
        transition: trackTransition.value,
        [startDir]: start,
        [endDir]: end,
      }
    })
    const showTicks: Ref<boolean> = computed(() => {
      return props.tickLabels.length > 0 ||
        !!(!props.isDisabled && stepNumeric.value && props.ticks)
    })
    const numTicks: Ref<number> = computed(() => {
      return Math.ceil((maxValue.value - minValue.value) / stepNumeric.value)
    })
    const showThumbLabel: Ref<boolean> = computed(() => {
      return !props.isDisabled && !!(
        props.thumbLabel ||
        context.scopedSlots['thumb-label']
      )
    })
    const computedTrackColor: Ref<string | undefined> = computed(() => {
      if (props.isDisabled) return undefined
      if (props.trackColor) return props.trackColor
      if (props.isDark) return props.validationState
      return props.validationState || 'primary lighten-3'
    })
    const computedTrackFillColor: Ref<string | undefined> = computed(() => {
      if (props.isDisabled) return undefined
      if (props.trackFillColor) return props.trackFillColor
      return props.validationState || props.computedColor
    })
    const computedThumbColor: Ref<string | undefined> = computed(() => {
      if (props.thumbColor) return props.thumbColor
      return props.validationState || props.computedColor
    })

      const parsed = parseFloat(val)
      parsed > internalValue.value && context.emit('input', parsed)
})
      const parsed = parseFloat(val)
      parsed < internalValue.value && context.emit('input', parsed)
})
{
})


  onMounted(() => {
    // Without a v-app, iOS does not work with body selectors
    data.app = document.querySelector('[data-app]') ||
      consoleWarn('Missing v-app or a non-body wrapping element with the [data-app] attribute', this)
  })

  function genDefaultSlot (): VNodeChildrenArrayContents {
      const children: VNodeChildrenArrayContents = [props.genLabel()]
      const slider = genSlider()
      props.inverseLabel
        ? children.unshift(slider)
        : children.push(slider)

      children.push(props.genProgress())

      return children
    }
  function genSlider (): VNode {
      return context.createElement('div', {
        class: {
          'v-slider': true,
          'v-slider--horizontal': !props.vertical,
          'v-slider--vertical': props.vertical,
          'v-slider--focused': data.isFocused,
          'v-slider--active': data.isActive,
          'v-slider--disabled': props.isDisabled,
          'v-slider--readonly': props.isReadonly,
          ...props.themeClasses,
        },
        directives: [{
          name: 'click-outside',
          value: onBlur,
        }],
        on: {
          click: onSliderClick,
        },
      }, genChildren())
    }
  function genChildren (): VNodeChildrenArrayContents {
      return [
        genInput(),
        genTrackContainer(),
        genSteps(),
        genThumbContainer(
          internalValue.value,
          inputWidth.value,
          data.isActive,
          data.isFocused,
          onThumbMouseDown,
          onFocus,
          onBlur,
        ),
      ]
    }
  function genInput (): VNode {
      return context.createElement('input', {
        attrs: {
          value: internalValue.value,
          id: props.computedId,
          disabled: props.isDisabled,
          readonly: true,
          tabindex: -1,
          ...context.attrs,
        },
        // on: props.genListeners(), // TODO: do we need to attach the listeners to input?
      })
    }
  function genTrackContainer (): VNode {
      const children = [
        context.createElement('div', props.setBackgroundColor(computedTrackColor.value, {
          staticClass: 'v-slider__track-background',
          style: trackStyles.value,
        })),
        context.createElement('div', props.setBackgroundColor(computedTrackFillColor.value, {
          staticClass: 'v-slider__track-fill',
          style: trackFillStyles.value,
        })),
      ]

      return context.createElement('div', {
        staticClass: 'v-slider__track-container',
        ref: 'track',
      }, children)
    }
  function genSteps (): VNode | null {
      if (!props.step || !showTicks.value) return null

      const tickSize = parseFloat(props.tickSize)
      const range = createRange(numTicks.value + 1)
      const direction = props.vertical ? 'bottom' : (context.vuetify.rtl ? 'right' : 'left')
      const offsetDirection = props.vertical ? (context.vuetify.rtl ? 'left' : 'right') : 'top'

      if (props.vertical) range.reverse()

      const ticks = range.map(index => {
        const children = []

        if (props.tickLabels[index]) {
          children.push(context.createElement('div', {
            staticClass: 'v-slider__tick-label',
          }, props.tickLabels[index]))
        }

        const width = index * (100 / numTicks.value)
        const filled = context.vuetify.rtl ? (100 - inputWidth.value) < width : width < inputWidth.value

        return context.createElement('span', {
          key: index,
          staticClass: 'v-slider__tick',
          class: {
            'v-slider__tick--filled': filled,
          },
          style: {
            width: `${tickSize}px`,
            height: `${tickSize}px`,
            [direction]: `calc(${width}% - ${tickSize / 2}px)`,
            [offsetDirection]: `calc(50% - ${tickSize / 2}px)`,
          },
        }, children)
      })

      return context.createElement('div', {
        staticClass: 'v-slider__ticks-container',
        class: {
          'v-slider__ticks-container--always-show': props.ticks === 'always' || props.tickLabels.length > 0,
        },
      }, ticks)
    }
  function genThumbContainer (
      value: number,
      valueWidth: number,
      isActive: boolean,
      isFocused: boolean,
      onDrag: Function,
      onFocus: Function,
      onBlur: Function,
      ref = 'thumb'
    ): VNode {
      const children = [genThumb()]

      const thumbLabelContent = genThumbLabelContent(value)
      showThumbLabel.value && children.push(genThumbLabel(thumbLabelContent))

      return context.createElement('div', props.setTextColor(computedThumbColor.value, {
        ref,
        key: ref,
        staticClass: 'v-slider__thumb-container',
        class: {
          'v-slider__thumb-container--active': isActive,
          'v-slider__thumb-container--focused': isFocused,
          'v-slider__thumb-container--show-label': showThumbLabel.value,
        },
        style: getThumbContainerStyles(valueWidth),
        attrs: {
          role: 'slider',
          tabindex: props.isDisabled ? -1 : context.attrs.tabindex ? context.attrs.tabindex : 0,
          'aria-label': props.label,
          'aria-valuemin': props.min,
          'aria-valuemax': props.max,
          'aria-valuenow': internalValue.value,
          'aria-readonly': String(props.isReadonly),
          'aria-orientation': props.vertical ? 'vertical' : 'horizontal',
          ...context.attrs,
        },
        on: {
          focus: onFocus,
          blur: onBlur,
          keydown: onKeyDown,
          keyup: onKeyUp,
          touchstart: onDrag,
          mousedown: onDrag,
        },
      }), children)
    }
  function genThumbLabelContent (value: number | string): ScopedSlotChildren {
      return context.scopedSlots['thumb-label']
        ? context.scopedSlots['thumb-label']!({ value })
        : [context.createElement('span', [String(value)])]
    }
  function genThumbLabel (content: ScopedSlotChildren): VNode {
      const size = convertToUnit(props.thumbSize)

      const transform = props.vertical
        ? `translateY(20%) translateY(${(Number(props.thumbSize) / 3) - 1}px) translateX(55%) rotate(135deg)`
        : `translateY(-20%) translateY(-12px) translateX(-50%) rotate(45deg)`

      return context.createElement(VScaleTransition, {
        props: { origin: 'bottom center' },
      }, [
        context.createElement('div', {
          staticClass: 'v-slider__thumb-label-container',
          directives: [{
            name: 'show',
            value: data.isFocused || data.isActive || props.thumbLabel === 'always',
          }],
        }, [
          context.createElement('div', props.setBackgroundColor(computedThumbColor.value, {
            staticClass: 'v-slider__thumb-label',
            style: {
              height: size,
              width: size,
              transform,
            },
          }), [context.createElement('div', content)]),
        ]),
      ])
    }
  function genThumb (): VNode {
      return context.createElement('div', props.setBackgroundColor(computedThumbColor.value, {
        staticClass: 'v-slider__thumb',
      }))
    }
  function getThumbContainerStyles (width: number): object {
      const direction = props.vertical ? 'top' : 'left'
      let value = context.vuetify.rtl ? 100 - width : width
      value = props.vertical ? 100 - value : value

      return {
        transition: trackTransition.value,
        [direction]: `${value}%`,
      }
    }
  function onThumbMouseDown (e: MouseEvent) {
      e.preventDefault()

      data.oldValue = internalValue.value
      data.keyPressed = 2
      data.isActive = true

      const mouseUpOptions = passiveSupported ? { passive: true, capture: true } : true
      const mouseMoveOptions = passiveSupported ? { passive: true } : false
      if ('touches' in e) {
        data.app.addEventListener('touchmove', onMouseMove, mouseMoveOptions)
        addOnceEventListener(data.app, 'touchend', onSliderMouseUp, mouseUpOptions)
      } else {
        data.app.addEventListener('mousemove', onMouseMove, mouseMoveOptions)
        addOnceEventListener(data.app, 'mouseup', onSliderMouseUp, mouseUpOptions)
      }

      context.emit('start', internalValue.value)
    }
  function onSliderMouseUp (e: Event) {
      e.stopPropagation()
      data.keyPressed = 0
      const mouseMoveOptions = passiveSupported ? { passive: true } : false
      data.app.removeEventListener('touchmove', onMouseMove, mouseMoveOptions)
      data.app.removeEventListener('mousemove', onMouseMove, mouseMoveOptions)

      context.emit('mouseup', e)
      context.emit('end', internalValue.value)
      if (!deepEqual(data.oldValue, internalValue.value)) {
        context.emit('change', internalValue.value)
        data.noClick = true
      }

      data.isActive = false
    }
  function onMouseMove (e: MouseEvent) {
      const { value } = parseMouseMove(e)
      internalValue.value = value
    }
  function onKeyDown (e: KeyboardEvent) {
      if (!props.isInteractive) return

      const value = parseKeyDown(e, internalValue.value)

      if (
        value == null ||
        value < minValue.value ||
        value > maxValue.value
      ) return

      internalValue.value = value
      context.emit('change', value)
    }
  function onKeyUp () {
      data.keyPressed = 0
    }
  function onSliderClick (e: MouseEvent) {
      if (data.noClick) {
        data.noClick = false
        return
      }
      const thumb = context.refs.thumb as HTMLElement
      thumb.focus()

      onMouseMove(e)
      context.emit('change', internalValue.value)
    }
  function onBlur (e: Event) {
      data.isFocused = false

      context.emit('blur', e)
    }
  function onFocus (e: Event) {
      data.isFocused = true

      context.emit('focus', e)
    }
  function parseMouseMove (e: MouseEvent) {
      const start = props.vertical ? 'top' : 'left'
      const length = props.vertical ? 'height' : 'width'
      const click = props.vertical ? 'clientY' : 'clientX'

      const {
        [start]: trackStart,
        [length]: trackLength,
      } = context.refs.track.getBoundingClientRect() as any
      const clickOffset = 'touches' in e ? (e as any).touches[0][click] : e[click] // Can we get rid of any here?

      // It is possible for left to be NaN, force to number
      let clickPos = Math.min(Math.max((clickOffset - trackStart) / trackLength, 0), 1) || 0

      if (props.vertical) clickPos = 1 - clickPos
      if (context.vuetify.rtl) clickPos = 1 - clickPos

      const isInsideTrack = clickOffset >= trackStart && clickOffset <= trackStart + trackLength
      const value = parseFloat(props.min) + clickPos * (maxValue.value - minValue.value)

      return { value, isInsideTrack }
    }
  function parseKeyDown (e: KeyboardEvent, value: number) {
      if (!props.isInteractive) return

      const { pageup, pagedown, end, home, left, right, down, up } = keyCodes

      if (![pageup, pagedown, end, home, left, right, down, up].includes(e.keyCode)) return

      e.preventDefault()
      const step = stepNumeric.value || 1
      const steps = (maxValue.value - minValue.value) / step
      if ([left, right, down, up].includes(e.keyCode)) {
        data.keyPressed += 1

        const increase = context.vuetify.rtl ? [left, up] : [right, up]
        const direction = increase.includes(e.keyCode) ? 1 : -1
        const multiplier = e.shiftKey ? 3 : (e.ctrlKey ? 2 : 1)

        value = value + (direction * step * multiplier)
      } else if (e.keyCode === home) {
        value = minValue.value
      } else if (e.keyCode === end) {
        value = maxValue.value
      } else {
        const direction = e.keyCode === pagedown ? 1 : -1
        value = value - (direction * step * (steps > 100 ? steps / 10 : 10))
      }

      return value
    }
  function roundValue (value: number): number {
      if (!stepNumeric.value) return value
      // Format input value using the same number
      // of decimals places as in the step prop
      const trimmedStep = props.step.toString().trim()
      const decimals = trimmedStep.indexOf('.') > -1
        ? (trimmedStep.length - trimmedStep.indexOf('.') - 1)
        : 0
      const offset = minValue.value % stepNumeric.value

      const newValue = Math.round((value - offset) / stepNumeric.value) * stepNumeric.value + offset

      return parseFloat(Math.min(newValue, maxValue.value).toFixed(decimals))
    }
  return {
    classes,
    internalValue,
    trackTransition,
    minValue,
    maxValue,
    stepNumeric,
    inputWidth,
    trackFillStyles,
    trackStyles,
    showTicks,
    numTicks,
    showThumbLabel,
    computedTrackColor,
    computedTrackFillColor,
    computedThumbColor,
    genDefaultSlot,
    genSlider,
    genChildren,
    genInput,
    genTrackContainer,
    genSteps,
    genThumbContainer,
    ,
    genThumbLabelContent,
    genThumbLabel,
    genThumb,
    getThumbContainerStyles,
    onThumbMouseDown,
    onSliderMouseUp,
    onMouseMove,
    onKeyDown,
    onKeyUp,
    onSliderClick,
    onBlur,
    onFocus,
    parseMouseMove,
    parseKeyDown,
    roundValue,
  }
}
const VSlider = defineComponent({
  name: 'v-slider',
  props: VSliderProps,
  setup(props, context) {
    const {} = useVSlider(props, context)
  },
})

export default VSlider

