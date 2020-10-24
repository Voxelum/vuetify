import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Components
import VTimePickerTitle from './VTimePickerTitle'
import VTimePickerClock from './VTimePickerClock'

// Mixins
import Picker from '../../mixins/picker'
import PickerButton from '../../mixins/picker-button'

// Utils
import { createRange } from '../../util/helpers'
import pad from '../VDatePicker/util/pad'
import mixins from '../../util/mixins'

// Types
import { VNode, PropType } from 'vue'
import { SelectingTimes } from './SelectingTimes'
export const VTimePickerProps = {
    allowedHours: [Function, Array] as PropType<AllowFunction | number[]>,
    allowedMinutes: [Function, Array] as PropType<AllowFunction | number[]>,
    allowedSeconds: [Function, Array] as PropType<AllowFunction | number[]>,
    disabled: Boolean,
    format: {
      type: String as PropType<'ampm' | '24hr'>,
      default: 'ampm',
      validator (val) {
        return ['ampm', '24hr'].includes(val)
      },
    },
    min: String,
    max: String,
    readonly: Boolean,
    scrollable: Boolean,
    useSeconds: Boolean,
    value: null as any as PropType<any>,
    ampmInTitle: Boolean,
}

const rangeHours24 = createRange(24)
const rangeHours12am = createRange(12)
const rangeHours12pm = rangeHours12am.map(v => v + 12)
const range60 = createRange(60)
const selectingNames = { 1: 'hour', 2: 'minute', 3: 'second' }
export { SelectingTimes }

type Period = 'am' | 'pm'
type AllowFunction = (val: number) => boolean

  Picker,
  PickerButton
/* @vue/component */
export function useVTimePicker(props: ExtractPropTypes<typeof VTimePickerProps>, context: SetupContext) {


  const data = reactive({
      inputHour: null as number | null,
      inputMinute: null as number | null,
      inputSecond: null as number | null,
      lazyInputHour: null as number | null,
      lazyInputMinute: null as number | null,
      lazyInputSecond: null as number | null,
      period: 'am' as Period,
      selecting: SelectingTimes.Hour,
    }
)

    const selectingHour = computed({
      get (): boolean {
        return data.selecting === SelectingTimes.Hour
      },
      set (v: boolean) {
        data.selecting = SelectingTimes.Hour
      },
    })
    const selectingMinute = computed({
      get (): boolean {
        return data.selecting === SelectingTimes.Minute
      },
      set (v: boolean) {
        data.selecting = SelectingTimes.Minute
      },
    })
    const selectingSecond = computed({
      get (): boolean {
        return data.selecting === SelectingTimes.Second
      },
      set (v: boolean) {
        data.selecting = SelectingTimes.Second
      },
    })
    const isAllowedHourCb: Ref<AllowFunction> = computed(() => {
      let cb: AllowFunction

      if (props.allowedHours instanceof Array) {
        cb = (val: number) => (props.allowedHours as number[]).includes(val)
      } else {
        cb = props.allowedHours
      }

      if (!props.min && !props.max) return cb

      const minHour = props.min ? Number(props.min.split(':')[0]) : 0
      const maxHour = props.max ? Number(props.max.split(':')[0]) : 23

      return (val: number) => {
        return val >= minHour * 1 &&
          val <= maxHour * 1 &&
          (!cb || cb(val))
      }
    })
    const isAllowedMinuteCb: Ref<AllowFunction> = computed(() => {
      let cb: AllowFunction

      const isHourAllowed = !isAllowedHourCb.value || data.inputHour === null || isAllowedHourCb.value(data.inputHour)
      if (props.allowedMinutes instanceof Array) {
        cb = (val: number) => (props.allowedMinutes as number[]).includes(val)
      } else {
        cb = props.allowedMinutes
      }

      if (!props.min && !props.max) {
        return isHourAllowed ? cb : () => false
      }

      const [minHour, minMinute] = props.min ? props.min.split(':').map(Number) : [0, 0]
      const [maxHour, maxMinute] = props.max ? props.max.split(':').map(Number) : [23, 59]
      const minTime = minHour * 60 + minMinute * 1
      const maxTime = maxHour * 60 + maxMinute * 1

      return (val: number) => {
        const time = 60 * data.inputHour! + val
        return time >= minTime &&
          time <= maxTime &&
          isHourAllowed &&
          (!cb || cb(val))
      }
    })
    const isAllowedSecondCb: Ref<AllowFunction> = computed(() => {
      let cb: AllowFunction

      const isHourAllowed = !isAllowedHourCb.value || data.inputHour === null || isAllowedHourCb.value(data.inputHour)
      const isMinuteAllowed = isHourAllowed &&
        (!isAllowedMinuteCb.value ||
          data.inputMinute === null ||
          isAllowedMinuteCb.value(data.inputMinute)
        )

      if (props.allowedSeconds instanceof Array) {
        cb = (val: number) => (props.allowedSeconds as number[]).includes(val)
      } else {
        cb = props.allowedSeconds
      }

      if (!props.min && !props.max) {
        return isMinuteAllowed ? cb : () => false
      }

      const [minHour, minMinute, minSecond] = props.min ? props.min.split(':').map(Number) : [0, 0, 0]
      const [maxHour, maxMinute, maxSecond] = props.max ? props.max.split(':').map(Number) : [23, 59, 59]
      const minTime = minHour * 3600 + minMinute * 60 + (minSecond || 0) * 1
      const maxTime = maxHour * 3600 + maxMinute * 60 + (maxSecond || 0) * 1

      return (val: number) => {
        const time = 3600 * data.inputHour! + 60 * data.inputMinute! + val
        return time >= minTime &&
          time <= maxTime &&
          isMinuteAllowed &&
          (!cb || cb(val))
      }
    })
    const isAmPm: Ref<boolean> = computed(() => {
      return props.format === 'ampm'
    })

watch(props, undefined => {
{

  onMounted(() => {
    setInputData(props.value)
    context.on('update:period', setPeriod)
  })

  function genValue () {
      if (data.inputHour != null && data.inputMinute != null && (!props.useSeconds || data.inputSecond != null)) {
        return `${pad(data.inputHour)}:${pad(data.inputMinute)}` + (props.useSeconds ? `:${pad(data.inputSecond!)}` : '')
      }

      return null
    }
  function emitValue () {
      const value = genValue()
      if (value !== null) context.emit('input', value)
    }
  function setPeriod (period: Period) {
      data.period = period
      if (data.inputHour != null) {
        const newHour = data.inputHour! + (period === 'am' ? -12 : 12)
        data.inputHour = firstAllowed('hour', newHour)
        emitValue()
      }
    }
  function setInputData (value: string | null | Date) {
      if (value == null || value === '') {
        data.inputHour = null
        data.inputMinute = null
        data.inputSecond = null
      } else if (value instanceof Date) {
        data.inputHour = value.getHours()
        data.inputMinute = value.getMinutes()
        data.inputSecond = value.getSeconds()
      } else {
        const [, hour, minute, , second, period] = value.trim().toLowerCase().match(/^(\d+):(\d+)(:(\d+))?([ap]m)?$/) || new Array(6)

        data.inputHour = period ? convert12to24(parseInt(hour, 10), period as Period) : parseInt(hour, 10)
        data.inputMinute = parseInt(minute, 10)
        data.inputSecond = parseInt(second || 0, 10)
      }

      data.period = (data.inputHour == null || data.inputHour < 12) ? 'am' : 'pm'
    }
  function convert24to12 (hour: number) {
      return hour ? ((hour - 1) % 12 + 1) : 12
    }
  function convert12to24 (hour: number, period: Period) {
      return hour % 12 + (period === 'pm' ? 12 : 0)
    }
  function onInput (value: number) {
      if (data.selecting === SelectingTimes.Hour) {
        data.inputHour = isAmPm.value ? convert12to24(value, data.period) : value
      } else if (data.selecting === SelectingTimes.Minute) {
        data.inputMinute = value
      } else {
        data.inputSecond = value
      }
      emitValue()
    }
  function onChange (value: number) {
      context.emit(`click:${selectingNames[data.selecting]}`, value)

      const emitChange = data.selecting === (props.useSeconds ? SelectingTimes.Second : SelectingTimes.Minute)

      if (data.selecting === SelectingTimes.Hour) {
        data.selecting = SelectingTimes.Minute
      } else if (props.useSeconds && data.selecting === SelectingTimes.Minute) {
        data.selecting = SelectingTimes.Second
      }

      if (data.inputHour === data.lazyInputHour &&
        data.inputMinute === data.lazyInputMinute &&
        (!props.useSeconds || data.inputSecond === data.lazyInputSecond)
      ) return

      const time = genValue()
      if (time === null) return

      data.lazyInputHour = data.inputHour
      data.lazyInputMinute = data.inputMinute
      props.useSeconds && (data.lazyInputSecond = data.inputSecond)

      emitChange && context.emit('change', time)
    }
  function firstAllowed (type: 'hour' | 'minute' | 'second', value: number) {
      const allowedFn = type === 'hour' ? isAllowedHourCb.value : (type === 'minute' ? isAllowedMinuteCb.value : isAllowedSecondCb.value)
      if (!allowedFn) return value

      // TODO: clean up
      const range = type === 'minute'
        ? range60
        : (type === 'second'
          ? range60
          : (isAmPm.value
            ? (value < 12
              ? rangeHours12am
              : rangeHours12pm)
            : rangeHours24))
      const first = range.find(v => allowedFn((v + value) % range.length + range[0]))
      return ((first || 0) + value) % range.length + range[0]
    }
  function genClock () {
      return context.createElement(VTimePickerClock, {
        props: {
          allowedValues:
            data.selecting === SelectingTimes.Hour
              ? isAllowedHourCb.value
              : (data.selecting === SelectingTimes.Minute
                ? isAllowedMinuteCb.value
                : isAllowedSecondCb.value),
          color: props.color,
          dark: props.dark,
          disabled: props.disabled,
          double: data.selecting === SelectingTimes.Hour && !isAmPm.value,
          format: data.selecting === SelectingTimes.Hour
            ? (isAmPm.value ? convert24to12 : (val: number) => val)
            : (val: number) => pad(val, 2),
          light: props.light,
          max: data.selecting === SelectingTimes.Hour ? (isAmPm.value && data.period === 'am' ? 11 : 23) : 59,
          min: data.selecting === SelectingTimes.Hour && isAmPm.value && data.period === 'pm' ? 12 : 0,
          readonly: props.readonly,
          scrollable: props.scrollable,
          size: Number(props.width) - ((!props.fullWidth && props.landscape) ? 80 : 20),
          step: data.selecting === SelectingTimes.Hour ? 1 : 5,
          value: data.selecting === SelectingTimes.Hour
            ? data.inputHour
            : (data.selecting === SelectingTimes.Minute
              ? data.inputMinute
              : data.inputSecond),
        },
        on: {
          input: onInput,
          change: onChange,
        },
        ref: 'clock',
      })
    }
  function genClockAmPm () {
      return context.createElement('div', props.setTextColor(props.color || 'primary', {
        staticClass: 'v-time-picker-clock__ampm',
      }), [
        props.genPickerButton('period', 'am', context.vuetify.lang.t('$vuetify.timePicker.am'), props.disabled || props.readonly),
        props.genPickerButton('period', 'pm', context.vuetify.lang.t('$vuetify.timePicker.pm'), props.disabled || props.readonly),
      ])
    }
  function genPickerBody () {
      return context.createElement('div', {
        staticClass: 'v-time-picker-clock__container',
        key: data.selecting,
      }, [
        !props.ampmInTitle && isAmPm.value && genClockAmPm(),
        genClock(),
      ])
    }
  function genPickerTitle () {
      return context.createElement(VTimePickerTitle, {
        props: {
          ampm: isAmPm.value,
          ampmReadonly: isAmPm.value && !props.ampmInTitle,
          disabled: props.disabled,
          hour: data.inputHour,
          minute: data.inputMinute,
          second: data.inputSecond,
          period: data.period,
          readonly: props.readonly,
          useSeconds: props.useSeconds,
          selecting: data.selecting,
        },
        on: {
          'update:selecting': (value: 1 | 2 | 3) => (data.selecting = value),
          'update:period': (period: string) => context.emit('update:period', period),
        },
        ref: 'title',
        slot: 'title',
      })
    }

  return {
    selectingHour,
    selectingMinute,
    selectingSecond,
    isAllowedHourCb,
    isAllowedMinuteCb,
    isAllowedSecondCb,
    isAmPm,
    genValue,
    emitValue,
    setPeriod,
    setInputData,
    convert24to12,
    convert12to24,
    onInput,
    onChange,
    firstAllowed,
    genClock,
    genClockAmPm,
    genPickerBody,
    genPickerTitle,
  }
}
const VTimePicker = defineComponent({
  name: 'v-time-picker',
  props: VTimePickerProps,
  setup(props, context) {
    const {} = useVTimePicker(props, context)
  },
})

export default VTimePicker

