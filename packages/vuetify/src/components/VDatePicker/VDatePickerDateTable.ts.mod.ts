import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Mixins
import DatePickerTable from './mixins/date-picker-table'

// Utils
import { weekNumber } from '../../util/dateTimeUtils'
import { pad, createNativeLocaleFormatter, monthChange } from './util'
import { createRange } from '../../util/helpers'
import mixins from '../../util/mixins'

// Types
import { VNode, VNodeChildren, PropType } from 'vue'
import { DatePickerFormatter } from 'vuetify/types'
export const VDatePickerDateTableProps = {
    firstDayOfWeek: {
      type: [String, Number],
      default: 0,
    },
    localeFirstDayOfYear: {
      type: [String, Number],
      default: 0,
    },
    showWeek: Boolean,
    weekdayFormat: Function as PropType<DatePickerFormatter | undefined>,
}

  DatePickerTable
/* @vue/component */
export function useVDatePickerDateTable(props: ExtractPropTypes<typeof VDatePickerDateTableProps>, context: SetupContext) {


    const formatter: Ref<DatePickerFormatter> = computed(() => {
      return props.format || createNativeLocaleFormatter(props.currentLocale, { day: 'numeric', timeZone: 'UTC' }, { start: 8, length: 2 })
    })
    const weekdayFormatter: Ref<DatePickerFormatter | undefined> = computed(() => {
      return props.weekdayFormat || createNativeLocaleFormatter(props.currentLocale, { weekday: 'narrow', timeZone: 'UTC' })
    })
    const weekDays: Ref<string[]> = computed(() => {
      const first = parseInt(props.firstDayOfWeek, 10)

      return weekdayFormatter.value
        ? createRange(7).map(i => weekdayFormatter.value!(`2017-01-${first + i + 15}`)) // 2017-01-15 is Sunday
        : createRange(7).map(i => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][(i + first) % 7])
    })

  function calculateTableDate (delta: number) {
      return monthChange(props.tableDate, Math.sign(delta || 1))
    }
  function genTHead () {
      const days = weekDays.value.map(day => context.createElement('th', day))
      if (props.showWeek) {
        days.unshift(context.createElement('th'))
      }

      return context.createElement('thead', genTR(days))
    }
    // Returns number of the days from the firstDayOfWeek to the first day of the current month
  function weekDaysBeforeFirstDayOfTheMonth () {
      const firstDayOfTheMonth = new Date(`${props.displayedYear}-${pad(props.displayedMonth + 1)}-01T00:00:00+00:00`)
      const weekDay = firstDayOfTheMonth.getUTCDay()

      return (weekDay - parseInt(props.firstDayOfWeek) + 7) % 7
    }
  function getWeekNumber (dayInMonth: number) {
      return weekNumber(
        props.displayedYear,
        props.displayedMonth,
        dayInMonth,
        parseInt(props.firstDayOfWeek),
        parseInt(props.localeFirstDayOfYear)
      )
    }
  function genWeekNumber (weekNumber: number) {
      return context.createElement('td', [
        context.createElement('small', {
          staticClass: 'v-date-picker-table--date__week',
        }, String(weekNumber).padStart(2, '0')),
      ])
    }
  function genTBody () {
      const children = []
      const daysInMonth = new Date(props.displayedYear, props.displayedMonth + 1, 0).getDate()
      let rows = []
      let day = weekDaysBeforeFirstDayOfTheMonth()

      if (props.showWeek) {
        rows.push(genWeekNumber(getWeekNumber(1)))
      }

      while (day--) rows.push(context.createElement('td'))
      for (day = 1; day <= daysInMonth; day++) {
        const date = `${props.displayedYear}-${pad(props.displayedMonth + 1)}-${pad(day)}`

        rows.push(context.createElement('td', [
          props.genButton(date, true, 'date', formatter.value),
        ]))

        if (rows.length % (props.showWeek ? 8 : 7) === 0) {
          children.push(genTR(rows))
          rows = []
          if (props.showWeek && (day < daysInMonth)) {
            rows.push(genWeekNumber(getWeekNumber(day + 7)))
          }
        }
      }

      if (rows.length) {
        children.push(genTR(rows))
      }

      return context.createElement('tbody', children)
    }
  function genTR (children: VNodeChildren) {
      return [context.createElement('tr', children)]
    }

  return {
    formatter,
    weekdayFormatter,
    weekDays,
    calculateTableDate,
    genTHead,
    ,
    weekDaysBeforeFirstDayOfTheMonth,
    getWeekNumber,
    genWeekNumber,
    genTBody,
    genTR,
  }
}
const VDatePickerDateTable = defineComponent({
  name: 'v-date-picker-date-table',
  props: VDatePickerDateTableProps,
  setup(props, context) {
    const {} = useVDatePickerDateTable(props, context)
  },
})

export default VDatePickerDateTable

