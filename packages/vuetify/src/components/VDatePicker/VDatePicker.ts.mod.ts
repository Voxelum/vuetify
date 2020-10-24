import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Components
import VDatePickerTitle from './VDatePickerTitle'
import VDatePickerHeader from './VDatePickerHeader'
import VDatePickerDateTable from './VDatePickerDateTable'
import VDatePickerMonthTable from './VDatePickerMonthTable'
import VDatePickerYears from './VDatePickerYears'

// Mixins
import Localable from '../../mixins/localable'
import Picker from '../../mixins/picker'

// Utils
import isDateAllowed from './util/isDateAllowed'
import mixins from '../../util/mixins'
import { wrapInArray } from '../../util/helpers'
import { daysInMonth } from '../VCalendar/util/timestamp'
import { consoleWarn } from '../../util/console'
import {
  createItemTypeListeners,
  createNativeLocaleFormatter,
  pad,
} from './util'

// Types
import {
  PropType,
  PropValidator,
} from 'vue/types/options'
import { VNode } from 'vue'
import {
export const VDatePickerProps = {
    allowedDates: Function as PropType<DatePickerAllowedDatesFunction | undefined>,
    // Function formatting the day in date picker table
    dayFormat: Function as PropType<DatePickerAllowedDatesFunction | undefined>,
    disabled: Boolean,
    events: {
      type: [Array, Function, Object],
      default: () => null,
    } as PropValidator<DatePickerEvents | null>,
    eventColor: {
      type: [Array, Function, Object, String],
      default: () => 'warning',
    } as PropValidator<DatePickerEventColors>,
    firstDayOfWeek: {
      type: [String, Number],
      default: 0,
    },
    // Function formatting the tableDate in the day/month table header
    headerDateFormat: Function as PropType<DatePickerFormatter | undefined>,
    localeFirstDayOfYear: {
      type: [String, Number],
      default: 0,
    },
    max: String,
    min: String,
    // Function formatting month in the months table
    monthFormat: Function as PropType<DatePickerFormatter | undefined>,
    multiple: Boolean,
    nextIcon: {
      type: String,
      default: '$next',
    },
    nextMonthAriaLabel: {
      type: String,
      default: '$vuetify.datePicker.nextMonthAriaLabel',
    },
    nextYearAriaLabel: {
      type: String,
      default: '$vuetify.datePicker.nextYearAriaLabel',
    },
    pickerDate: String,
    prevIcon: {
      type: String,
      default: '$prev',
    },
    prevMonthAriaLabel: {
      type: String,
      default: '$vuetify.datePicker.prevMonthAriaLabel',
    },
    prevYearAriaLabel: {
      type: String,
      default: '$vuetify.datePicker.prevYearAriaLabel',
    },
    range: Boolean,
    reactive: Boolean,
    readonly: Boolean,
    scrollable: Boolean,
    showCurrent: {
      type: [Boolean, String],
      default: true,
    },
    selectedItemsText: {
      type: String,
      default: '$vuetify.datePicker.itemsSelected',
    },
    showWeek: Boolean,
    // Function formatting currently selected date in the picker title
    titleDateFormat: Function as PropType<DatePickerFormatter | DatePickerMultipleFormatter | undefined>,
    type: {
      type: String,
      default: 'date',
      validator: (type: any) => ['date', 'month'].includes(type), // TODO: year
    } as PropValidator<DatePickerType>,
    value: [Array, String] as PropType<DatePickerValue>,
    weekdayFormat: Function as PropType<DatePickerFormatter | undefined>,
    // Function formatting the year in table header and pickup title
    yearFormat: Function as PropType<DatePickerFormatter | undefined>,
    yearIcon: String,
}
  DatePickerFormatter,
  DatePickerMultipleFormatter,
  DatePickerAllowedDatesFunction,
  DatePickerEventColors,
  DatePickerEvents,
  DatePickerType,
} from 'vuetify/types'

type DatePickerValue = string | string[] | undefined
interface Formatters {
  year: DatePickerFormatter
  titleDate: DatePickerFormatter | DatePickerMultipleFormatter
}

// Adds leading zero to month/day if necessary, returns 'YYYY' if type = 'year',
// 'YYYY-MM' if 'month' and 'YYYY-MM-DD' if 'date'
function sanitizeDateString (dateString: string, type: 'date' | 'month' | 'year'): string {
  const [year, month = 1, date = 1] = dateString.split('-')
  return `${year}-${pad(month)}-${pad(date)}`.substr(0, { date: 10, month: 7, year: 4 }[type])
}

  Localable,
  Picker,
/* @vue/component */
export function useVDatePicker(props: ExtractPropTypes<typeof VDatePickerProps>, context: SetupContext) {


  const data = reactive({
    const now = new Date()
      activePicker: props.type.toUpperCase(),
      inputDay: null as number | null,
      inputMonth: null as number | null,
      inputYear: null as number | null,
      isReversing: false,
      now,
      // tableDate is a string in 'YYYY' / 'YYYY-M' format (leading zero for month is not required)
      tableDate: (() => {
        if (props.pickerDate) {
          return props.pickerDate
        }
        const multipleValue = wrapInArray(props.value)
        const date = multipleValue[multipleValue.length - 1] ||
          (typeof props.showCurrent === 'string' ? props.showCurrent : `${now.getFullYear()}-${now.getMonth() + 1}`)
        return sanitizeDateString(date as string, props.type === 'date' ? 'month' : 'year')
      })(),
    }
)

    const multipleValue: Ref<string[]> = computed(() => {
      return wrapInArray(props.value)
    })
    const isMultiple: Ref<boolean> = computed(() => {
      return props.multiple || props.range
    })
    const lastValue: Ref<string | null> = computed(() => {
      return isMultiple.value ? multipleValue.value[multipleValue.value.length - 1] : (props.value as string | null)
    })
    const selectedMonths: Ref<string | string[] | undefined> = computed(() => {
      if (!props.value || props.type === 'month') {
        return props.value
      } else if (isMultiple.value) {
        return multipleValue.value.map(val => val.substr(0, 7))
      } else {
        return (props.value as string).substr(0, 7)
      }
    })
    const current: Ref<string | null> = computed(() => {
      if (props.showCurrent === true) {
        return sanitizeDateString(`${props.now.getFullYear()}-${props.now.getMonth() + 1}-${props.now.getDate()}`, props.type)
      }

      return props.showCurrent || null
    })
    const inputDate: Ref<string> = computed(() => {
      return props.type === 'date'
        ? `${data.inputYear}-${pad(data.inputMonth! + 1)}-${pad(data.inputDay!)}`
        : `${data.inputYear}-${pad(data.inputMonth! + 1)}`
    })
    const tableMonth: Ref<number> = computed(() => {
      return Number((props.pickerDate || data.tableDate).split('-')[1]) - 1
    })
    const tableYear: Ref<number> = computed(() => {
      return Number((props.pickerDate || data.tableDate).split('-')[0])
    })
    const minMonth: Ref<string | null> = computed(() => {
      return props.min ? sanitizeDateString(props.min, 'month') : null
    })
    const maxMonth: Ref<string | null> = computed(() => {
      return props.max ? sanitizeDateString(props.max, 'month') : null
    })
    const minYear: Ref<string | null> = computed(() => {
      return props.min ? sanitizeDateString(props.min, 'year') : null
    })
    const maxYear: Ref<string | null> = computed(() => {
      return props.max ? sanitizeDateString(props.max, 'year') : null
    })
    const formatters: Ref<Formatters> = computed(() => {
      return {
        year: props.yearFormat || createNativeLocaleFormatter(props.currentLocale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 }),
        titleDate: props.titleDateFormat ||
          (isMultiple.value ? defaultTitleMultipleDateFormatter.value : defaultTitleDateFormatter.value),
      }
    })
    const defaultTitleMultipleDateFormatter: Ref<DatePickerMultipleFormatter> = computed(() => {
      return dates => {
        if (!dates.length) {
          return '-'
        }

        if (dates.length === 1) {
          return defaultTitleDateFormatter.value(dates[0])
        }

        return context.vuetify.lang.t(props.selectedItemsText, dates.length)
      }
    })
    const defaultTitleDateFormatter: Ref<DatePickerFormatter> = computed(() => {
      const titleFormats = {
        year: { year: 'numeric', timeZone: 'UTC' },
        month: { month: 'long', timeZone: 'UTC' },
        date: { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' },
      }

      const titleDateFormatter = createNativeLocaleFormatter(props.currentLocale, titleFormats[props.type], {
        start: 0,
        length: { date: 10, month: 7, year: 4 }[props.type],
      })

      const landscapeFormatter = (date: string) => titleDateFormatter(date)
        .replace(/([^\d\s])([\d])/g, (match, nonDigit, digit) => `${nonDigit} ${digit}`)
        .replace(', ', ',<br>')

      return props.landscape ? landscapeFormatter : titleDateFormatter
    })

watch(() => data.tableDate, (val: string, prev: string) => {
      // Make a ISO 8601 strings from val and prev for comparision, otherwise it will incorrectly
      // compare for example '2000-9' and '2000-10'
      const sanitizeType = props.type === 'month' ? 'year' : 'month'
      data.isReversing = sanitizeDateString(val, sanitizeType) < sanitizeDateString(prev, sanitizeType)
      context.emit('update:picker-date', val)
})
watch(() => props.pickerDate, (val: string | null) => {
      if (val) {
        data.tableDate = val
      } else if (lastValue.value && props.type === 'date') {
        data.tableDate = sanitizeDateString(lastValue.value, 'month')
      } else if (lastValue.value && props.type === 'month') {
        data.tableDate = sanitizeDateString(lastValue.value, 'year')
      }
})
watch(props, (newValue: DatePickerValue, oldValue: DatePickerValue) => {
      checkMultipleProp()
      setInputDate()

      if (!isMultiple.value && props.value && !props.pickerDate) {
        data.tableDate = sanitizeDateString(inputDate.value, props.type === 'month' ? 'year' : 'month')
      } else if (isMultiple.value && multipleValue.value.length && (!oldValue || !(oldValue as string[]).length) && !props.pickerDate) {
        data.tableDate = sanitizeDateString(inputDate.value, props.type === 'month' ? 'year' : 'month')
      }
})
watch(() => props.type, (type: DatePickerType) => {
      data.activePicker = type.toUpperCase()

      if (props.value && props.value.length) {
        const output = multipleValue.value
          .map((val: string) => sanitizeDateString(val, type))
          .filter(isDateAllowed)
        context.emit('input', isMultiple.value ? output : output[0])
      }
})

    checkMultipleProp()

    if (props.pickerDate !== data.tableDate) {
      context.emit('update:picker-date', data.tableDate)
    }
    setInputDate()

  function emitInput (newInput: string) {
      if (props.range) {
        if (multipleValue.value.length !== 1) {
          context.emit('input', [newInput])
        } else {
          const output = [multipleValue.value[0], newInput]
          context.emit('input', output)
          context.emit('change', output)
        }
        return
      }

      const output = props.multiple
        ? (
          multipleValue.value.indexOf(newInput) === -1
            ? multipleValue.value.concat([newInput])
            : multipleValue.value.filter(x => x !== newInput)
        )
        : newInput

      context.emit('input', output)
      props.multiple || context.emit('change', newInput)
    }
  function checkMultipleProp () {
      if (props.value == null) return
      const valueType = props.value.constructor.name
      const expected = isMultiple.value ? 'Array' : 'String'
      if (valueType !== expected) {
        consoleWarn(`Value must be ${isMultiple.value ? 'an' : 'a'} ${expected}, got ${valueType}`, this)
      }
    }
  function isDateAllowed (value: string): boolean {
      return isDateAllowed(value, props.min, props.max, props.allowedDates)
    }
  function yearClick (value: number) {
      data.inputYear = value
      if (props.type === 'month') {
        data.tableDate = `${value}`
      } else {
        data.tableDate = `${value}-${pad((tableMonth.value || 0) + 1)}`
      }
      data.activePicker = 'MONTH'
      if (props.reactive && !props.readonly && !isMultiple.value && isDateAllowed(inputDate.value)) {
        context.emit('input', inputDate.value)
      }
    }
  function monthClick (value: string) {
      data.inputYear = parseInt(value.split('-')[0], 10)
      data.inputMonth = parseInt(value.split('-')[1], 10) - 1
      if (props.type === 'date') {
        if (data.inputDay) {
          data.inputDay = Math.min(data.inputDay, daysInMonth(data.inputYear, data.inputMonth + 1))
        }

        data.tableDate = value
        data.activePicker = 'DATE'
        if (props.reactive && !props.readonly && !isMultiple.value && isDateAllowed(inputDate.value)) {
          context.emit('input', inputDate.value)
        }
      } else {
        emitInput(inputDate.value)
      }
    }
  function dateClick (value: string) {
      data.inputYear = parseInt(value.split('-')[0], 10)
      data.inputMonth = parseInt(value.split('-')[1], 10) - 1
      data.inputDay = parseInt(value.split('-')[2], 10)
      emitInput(inputDate.value)
    }
  function genPickerTitle (): VNode {
      return context.createElement(VDatePickerTitle, {
        props: {
          date: props.value ? (formatters.value.titleDate as (value: any) => string)(isMultiple.value ? multipleValue.value : props.value) : '',
          disabled: props.disabled,
          readonly: props.readonly,
          selectingYear: data.activePicker === 'YEAR',
          year: formatters.value.year(multipleValue.value.length ? `${data.inputYear}` : data.tableDate),
          yearIcon: props.yearIcon,
          value: multipleValue.value[0],
        },
        slot: 'title',
        on: {
          'update:selecting-year': (value: boolean) => data.activePicker = value ? 'YEAR' : props.type.toUpperCase(),
        },
      })
    }
  function genTableHeader (): VNode {
      return context.createElement(VDatePickerHeader, {
        props: {
          nextIcon: props.nextIcon,
          color: props.color,
          dark: props.dark,
          disabled: props.disabled,
          format: props.headerDateFormat,
          light: props.light,
          locale: props.locale,
          min: data.activePicker === 'DATE' ? minMonth.value : minYear.value,
          max: data.activePicker === 'DATE' ? maxMonth.value : maxYear.value,
          nextAriaLabel: data.activePicker === 'DATE' ? props.nextMonthAriaLabel : props.nextYearAriaLabel,
          prevAriaLabel: data.activePicker === 'DATE' ? props.prevMonthAriaLabel : props.prevYearAriaLabel,
          prevIcon: props.prevIcon,
          readonly: props.readonly,
          value: data.activePicker === 'DATE' ? `${pad(tableYear.value, 4)}-${pad(tableMonth.value + 1)}` : `${pad(tableYear.value, 4)}`,
        },
        on: {
          toggle: () => data.activePicker = (data.activePicker === 'DATE' ? 'MONTH' : 'YEAR'),
          input: (value: string) => data.tableDate = value,
        },
      })
    }
  function genDateTable (): VNode {
      return context.createElement(VDatePickerDateTable, {
        props: {
          allowedDates: props.allowedDates,
          color: props.color,
          current: current.value,
          dark: props.dark,
          disabled: props.disabled,
          events: props.events,
          eventColor: props.eventColor,
          firstDayOfWeek: props.firstDayOfWeek,
          format: props.dayFormat,
          light: props.light,
          locale: props.locale,
          localeFirstDayOfYear: props.localeFirstDayOfYear,
          min: props.min,
          max: props.max,
          range: props.range,
          readonly: props.readonly,
          scrollable: props.scrollable,
          showWeek: props.showWeek,
          tableDate: `${pad(tableYear.value, 4)}-${pad(tableMonth.value + 1)}`,
          value: props.value,
          weekdayFormat: props.weekdayFormat,
        },
        ref: 'table',
        on: {
          input: dateClick,
          'update:table-date': (value: string) => data.tableDate = value,
          ...createItemTypeListeners(this, ':date'),
        },
      })
    }
  function genMonthTable (): VNode {
      return context.createElement(VDatePickerMonthTable, {
        props: {
          allowedDates: props.type === 'month' ? props.allowedDates : null,
          color: props.color,
          current: current.value ? sanitizeDateString(current.value, 'month') : null,
          dark: props.dark,
          disabled: props.disabled,
          events: props.type === 'month' ? props.events : null,
          eventColor: props.type === 'month' ? props.eventColor : null,
          format: props.monthFormat,
          light: props.light,
          locale: props.locale,
          min: minMonth.value,
          max: maxMonth.value,
          range: props.range,
          readonly: props.readonly && props.type === 'month',
          scrollable: props.scrollable,
          value: selectedMonths.value,
          tableDate: `${pad(tableYear.value, 4)}`,
        },
        ref: 'table',
        on: {
          input: monthClick,
          'update:table-date': (value: string) => data.tableDate = value,
          ...createItemTypeListeners(this, ':month'),
        },
      })
    }
  function genYears (): VNode {
      return context.createElement(VDatePickerYears, {
        props: {
          color: props.color,
          format: props.yearFormat,
          locale: props.locale,
          min: minYear.value,
          max: maxYear.value,
          value: tableYear.value,
        },
        on: {
          input: yearClick,
          ...createItemTypeListeners(this, ':year'),
        },
      })
    }
  function genPickerBody (): VNode {
      const children = data.activePicker === 'YEAR' ? [
        genYears(),
      ] : [
        genTableHeader(),
        data.activePicker === 'DATE' ? genDateTable() : genMonthTable(),
      ]

      return context.createElement('div', {
        key: data.activePicker,
      }, children)
    }
  function setInputDate () {
      if (lastValue.value) {
        const array = lastValue.value.split('-')
        data.inputYear = parseInt(array[0], 10)
        data.inputMonth = parseInt(array[1], 10) - 1
        if (props.type === 'date') {
          data.inputDay = parseInt(array[2], 10)
        }
      } else {
        data.inputYear = data.inputYear || props.now.getFullYear()
        data.inputMonth = data.inputMonth == null ? data.inputMonth : props.now.getMonth()
        data.inputDay = data.inputDay || props.now.getDate()
      }
    }

  return {
    multipleValue,
    isMultiple,
    lastValue,
    selectedMonths,
    current,
    inputDate,
    tableMonth,
    tableYear,
    minMonth,
    maxMonth,
    minYear,
    maxYear,
    formatters,
    defaultTitleMultipleDateFormatter,
    defaultTitleDateFormatter,
    emitInput,
    checkMultipleProp,
    isDateAllowed,
    yearClick,
    monthClick,
    dateClick,
    genPickerTitle,
    genTableHeader,
    genDateTable,
    genMonthTable,
    genYears,
    genPickerBody,
    setInputDate,
  }
}
const VDatePicker = defineComponent({
  name: 'v-date-picker',
  props: VDatePickerProps,
  setup(props, context) {
    const {} = useVDatePicker(props, context)
  },
})

export default VDatePicker

