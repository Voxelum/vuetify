import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
// import '../../stylus/components/_calendar-daily.styl'

// Types
import { VNode, Component } from 'vue'

// Mixins
import CalendarWithEvents from './mixins/calendar-with-events'

// Util
import props from './util/props'
import {
  DAYS_IN_MONTH_MAX,
  DAY_MIN,
  DAYS_IN_WEEK,
  parseTimestamp,
  validateTimestamp,
  relativeDays,
  nextDay,
  prevDay,
  copyTimestamp,
  updateFormatted,
  updateWeekday,
  updateRelative,
  getStartOfMonth,
  getEndOfMonth,
  VTime,
  VTimestampInput,
  timestampToDate,
} from './util/timestamp'

// Calendars
import VCalendarMonthly from './VCalendarMonthly'
import VCalendarDaily from './VCalendarDaily'
import VCalendarWeekly from './VCalendarWeekly'
import VCalendarCategory from './VCalendarCategory'
import { CalendarTimestamp, CalendarFormatter } from 'vuetify/types'
export const VCalendarProps = {
    ...props.calendar,
    ...props.weeks,
    ...props.intervals,
    ...props.category,
}

// Types
interface VCalendarRenderProps {
  start: CalendarTimestamp
  end: CalendarTimestamp
  component: string | Component
  maxDays: number
  weekdays: number[]
  categories: string[]
}

/* @vue/component */
export function useVCalendar(props: ExtractPropTypes<typeof VCalendarProps>, context: SetupContext) {


  const data = reactive({
    lastStart: null as CalendarTimestamp | null,
    lastEnd: null as CalendarTimestamp | null,
  })

    const parsedValue: Ref<CalendarTimestamp> = computed(() => {
      return (validateTimestamp(props.value)
        ? parseTimestamp(props.value, true)
        : (props.parsedStart || props.times.today))
    })
    const parsedCategoryDays: Ref<number> = computed(() => {
      return parseInt(props.categoryDays) || 1
    })
    const renderProps: Ref<VCalendarRenderProps> = computed(() => {
      const around = parsedValue.value
      let component: any = null
      let maxDays = props.maxDays
      let weekdays = props.parsedWeekdays
      let categories = parsedCategories.value
      let start = around
      let end = around
      switch (props.type) {
        case 'month':
          component = VCalendarMonthly
          start = getStartOfMonth(around)
          end = getEndOfMonth(around)
          break
        case 'week':
          component = VCalendarDaily
          start = props.getStartOfWeek(around)
          end = props.getEndOfWeek(around)
          maxDays = 7
          break
        case 'day':
          component = VCalendarDaily
          maxDays = 1
          weekdays = [start.weekday]
          break
        case '4day':
          component = VCalendarDaily
          end = relativeDays(copyTimestamp(end), nextDay, 4)
          updateFormatted(end)
          maxDays = 4
          weekdays = [
            start.weekday,
            (start.weekday + 1) % 7,
            (start.weekday + 2) % 7,
            (start.weekday + 3) % 7,
          ]
          break
        case 'custom-weekly':
          component = VCalendarWeekly
          start = props.parsedStart || around
          end = props.parsedEnd
          break
        case 'custom-daily':
          component = VCalendarDaily
          start = props.parsedStart || around
          end = props.parsedEnd
          break
        case 'category':
          const days = parsedCategoryDays.value

          component = VCalendarCategory
          end = relativeDays(copyTimestamp(end), nextDay, days)
          updateFormatted(end)
          maxDays = days
          weekdays = []

          for (let i = 0; i < days; i++) {
            weekdays.push((start.weekday + i) % 7)
          }

          categories = getCategoryList(categories)
          break
        default:
          throw new Error(props.type + ' is not a valid Calendar type')
      }

      return { component, start, end, maxDays, weekdays, categories }
    })
    const eventWeekdays: Ref<number[]> = computed(() => {
      return renderProps.value.weekdays
    })
    const categoryMode: Ref<boolean> = computed(() => {
      return props.type === 'category'
    })
    const title: Ref<string> = computed(() => {
      const { start, end } = renderProps.value
      const spanYears = start.year !== end.year
      const spanMonths = spanYears || start.month !== end.month

      if (spanYears) {
        return monthShortFormatter.value(start, true) + ' ' + start.year + ' - ' + monthShortFormatter.value(end, true) + ' ' + end.year
      }

      if (spanMonths) {
        return monthShortFormatter.value(start, true) + ' - ' + monthShortFormatter.value(end, true) + ' ' + end.year
      } else {
        return monthLongFormatter.value(start, false) + ' ' + start.year
      }
    })
    const monthLongFormatter: Ref<CalendarFormatter> = computed(() => {
      return props.getFormatter({
        timeZone: 'UTC', month: 'long',
      })
    })
    const monthShortFormatter: Ref<CalendarFormatter> = computed(() => {
      return props.getFormatter({
        timeZone: 'UTC', month: 'short',
      })
    })
    const parsedCategories: Ref<string[]> = computed(() => {
      return typeof props.categories === 'string' && props.categories
        ? props.categories.split(/\s*,\s*/)
        : Array.isArray(props.categories)
          ? props.categories as string[]
          : []
    })

watch(renderProps, undefined => {
{

  onMounted(() => {
    props.updateEventVisibility()
    checkChange()
  })

  onUpdated(() => {
    window.requestAnimationFrame(props.updateEventVisibility)
  })

  function checkChange (): void {
      const { lastStart, lastEnd } = this
      const { start, end } = renderProps.value
      if (!lastStart || !lastEnd ||
        start.date !== lastStart.date ||
        end.date !== lastEnd.date) {
        data.lastStart = start
        data.lastEnd = end
        context.emit('change', { start, end })
      }
    }
  function move (amount = 1): void {
      const moved = copyTimestamp(parsedValue.value)
      const forward = amount > 0
      const mover = forward ? nextDay : prevDay
      const limit = forward ? DAYS_IN_MONTH_MAX : DAY_MIN
      let times = forward ? amount : -amount

      while (--times >= 0) {
        switch (props.type) {
          case 'month':
            moved.day = limit
            mover(moved)
            break
          case 'week':
            relativeDays(moved, mover, DAYS_IN_WEEK)
            break
          case 'day':
            relativeDays(moved, mover, 1)
            break
          case '4day':
            relativeDays(moved, mover, 4)
            break
          case 'category':
            relativeDays(moved, mover, parsedCategoryDays.value)
            break
        }
      }

      updateWeekday(moved)
      updateFormatted(moved)
      updateRelative(moved, props.times.now)

      if (props.value instanceof Date) {
        context.emit('input', timestampToDate(moved))
      } else if (typeof props.value === 'number') {
        context.emit('input', timestampToDate(moved).getTime())
      } else {
        context.emit('input', moved.date)
      }

      context.emit('moved', moved)
    }
  function next (amount = 1): void {
      move(amount)
    }
  function prev (amount = 1): void {
      move(-amount)
    }
  function timeToY (time: VTime, clamp = true): number | false {
      const c = context.children[0] as any

      if (c && c.timeToY) {
        return c.timeToY(time, clamp)
      } else {
        return false
      }
    }
  function timeDelta (time: VTime): number | false {
      const c = context.children[0] as any

      if (c && c.timeDelta) {
        return c.timeDelta(time)
      } else {
        return false
      }
    }
  function minutesToPixels (minutes: number): number {
      const c = context.children[0] as any

      if (c && c.minutesToPixels) {
        return c.minutesToPixels(minutes)
      } else {
        return -1
      }
    }
  function scrollToTime (time: VTime): boolean {
      const c = context.children[0] as any

      if (c && c.scrollToTime) {
        return c.scrollToTime(time)
      } else {
        return false
      }
    }
  function parseTimestamp (input: VTimestampInput, required?: false): CalendarTimestamp | null {
      return parseTimestamp(input, required, props.times.now)
    }
  function timestampToDate (timestamp: CalendarTimestamp): Date {
      return timestampToDate(timestamp)
    }
  function getCategoryList (categories: string[]): string[] {
      if (!props.noEvents) {
        const categoryMap = categories.reduce((map, category, index) => {
          map[category] = { index, count: 0 }

          return map
        }, Object.create(null))

        if (!props.categoryHideDynamic || !props.categoryShowAll) {
          let categoryLength = categories.length

          props.parsedEvents.forEach(ev => {
            let category = ev.category

            if (typeof category !== 'string') {
              category = props.categoryForInvalid
            }

            if (!category) {
              return
            }

            if (category in categoryMap) {
              categoryMap[category].count++
            } else if (!props.categoryHideDynamic) {
              categoryMap[category] = {
                index: categoryLength++,
                count: 1,
              }
            }
          })
        }

        if (!props.categoryShowAll) {
          for (const category in categoryMap) {
            if (categoryMap[category].count === 0) {
              delete categoryMap[category]
            }
          }
        }

        categories = Object.keys(categoryMap)
      }

      return categories
    }

  return {
    parsedValue,
    parsedCategoryDays,
    renderProps,
    eventWeekdays,
    categoryMode,
    title,
    monthLongFormatter,
    monthShortFormatter,
    parsedCategories,
    checkChange,
    move,
    next,
    prev,
    timeToY,
    timeDelta,
    minutesToPixels,
    scrollToTime,
    parseTimestamp,
    timestampToDate,
    getCategoryList,
  }
}
const VCalendar = defineComponent({
  name: 'v-calendar',
  props: VCalendarProps,
  setup(props, context) {
    const {} = useVCalendar(props, context)
    const { start, end, maxDays, component, weekdays, categories } = renderProps.value

    return h(component, {
      staticClass: 'v-calendar',
      class: {
        'v-calendar-events': !props.noEvents,
      },
      props: {
        ...context.props,
        start: start.date,
        end: end.date,
        maxDays,
        weekdays,
        categories,
      },
      directives: [{
        modifiers: { quiet: true },
        name: 'resize',
        value: props.updateEventVisibility,
      }],
      on: {
        ...context.listeners,
        'click:date': (day: CalendarTimestamp) => {
          if (context.listeners['input']) {
            context.emit('input', day.date)
          }
          if (context.listeners['click:date']) {
            context.emit('click:date', day)
          }
        },
      },
      scopedSlots: props.getScopedSlots(),
    })
  },
})

export default VCalendar

