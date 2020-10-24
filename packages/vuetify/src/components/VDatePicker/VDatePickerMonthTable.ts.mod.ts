import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Mixins
import DatePickerTable from './mixins/date-picker-table'

// Utils
import { pad, createNativeLocaleFormatter } from './util'
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue'
import { DatePickerFormatter } from 'vuetify/types'
export const VDatePickerMonthTableProps = {
}

  DatePickerTable
/* @vue/component */
export function useVDatePickerMonthTable(props: ExtractPropTypes<typeof VDatePickerMonthTableProps>, context: SetupContext) {

    const formatter: Ref<DatePickerFormatter> = computed(() => {
      return props.format || createNativeLocaleFormatter(props.currentLocale, { month: 'short', timeZone: 'UTC' }, { start: 5, length: 2 })
    })

  function calculateTableDate (delta: number) {
      return `${parseInt(props.tableDate, 10) + Math.sign(delta || 1)}`
    }
  function genTBody () {
      const children = []
      const cols = Array(3).fill(null)
      const rows = 12 / cols.length

      for (let row = 0; row < rows; row++) {
        const tds = cols.map((_, col) => {
          const month = row * cols.length + col
          const date = `${props.displayedYear}-${pad(month + 1)}`
          return context.createElement('td', {
            key: month,
          }, [
            props.genButton(date, false, 'month', formatter.value),
          ])
        })

        children.push(context.createElement('tr', {
          key: row,
        }, tds))
      }

      return context.createElement('tbody', children)
    }

  return {
    formatter,
    calculateTableDate,
    genTBody,
  }
}
const VDatePickerMonthTable = defineComponent({
  name: 'v-date-picker-month-table',
  props: VDatePickerMonthTableProps,
  setup(props, context) {
    const {} = useVDatePickerMonthTable(props, context)
  },
})

export default VDatePickerMonthTable

