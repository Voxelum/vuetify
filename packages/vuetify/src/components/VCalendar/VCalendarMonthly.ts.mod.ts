import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VCalendarWeekly.sass'

// Mixins
import VCalendarWeekly from './VCalendarWeekly'

// Util
import { parseTimestamp, getStartOfMonth, getEndOfMonth } from './util/timestamp'
import { CalendarTimestamp } from 'vuetify/types'
export const VCalendarMonthlyProps = {
}

/* @vue/component */
export function useVCalendarMonthly(props: ExtractPropTypes<typeof VCalendarMonthlyProps>, context: SetupContext) {

    const staticClass: Ref<string> = computed(() => {
      return 'v-calendar-monthly v-calendar-weekly'
    })
    const parsedStart: Ref<CalendarTimestamp> = computed(() => {
      return getStartOfMonth(parseTimestamp(props.start, true))
    })
    const parsedEnd: Ref<CalendarTimestamp> = computed(() => {
      return getEndOfMonth(parseTimestamp(props.end, true))
    })

  return {
    staticClass,
    parsedStart,
    parsedEnd,
  }
}
const VCalendarMonthly = defineComponent({
  name: 'v-calendar-monthly',
  props: VCalendarMonthlyProps,
  setup(props, context) {
    const {} = useVCalendarMonthly(props, context)
  },
})

export default VCalendarMonthly

