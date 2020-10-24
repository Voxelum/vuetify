import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VCalendarWeekly.sass'

// Types
import { VNode } from 'vue'

// Components
import VBtn from '../VBtn'

// Mixins
import CalendarBase from './mixins/calendar-base'

// Util
import { getSlot } from '../../util/helpers'
import { weekNumber } from '../../util/dateTimeUtils'
import props from './util/props'
import {
  createDayList,
  getDayIdentifier,
  createNativeLocaleFormatter,
} from './util/timestamp'
import { CalendarTimestamp, CalendarFormatter } from 'vuetify/types'
export const VCalendarWeeklyProps = {
}

/* @vue/component */
export function useVCalendarWeekly(props: ExtractPropTypes<typeof VCalendarWeeklyProps>, context: SetupContext) {


  function isOutside (day: CalendarTimestamp): boolean {
      const dayIdentifier = getDayIdentifier(day)

      return dayIdentifier < getDayIdentifier(props.parsedStart) ||
             dayIdentifier > getDayIdentifier(props.parsedEnd)
    }
  function genHead (): VNode {
      return context.createElement('div', {
        staticClass: 'v-calendar-weekly__head',
      }, genHeadDays())
    }
  function genHeadDays (): VNode[] {
      const header = props.todayWeek.map(genHeadDay)

      if (props.showWeek) {
        header.unshift(context.createElement('div', {
          staticClass: 'v-calendar-weekly__head-weeknumber',
        }))
      }

      return header
    }
  function genHeadDay (day: CalendarTimestamp, index: number): VNode {
      const outside = isOutside(props.days[index])
      const color = day.present ? props.color : undefined

      return context.createElement('div', props.setTextColor(color, {
        key: day.date,
        staticClass: 'v-calendar-weekly__head-weekday',
        class: props.getRelativeClasses(day, outside),
      }), props.weekdayFormatter(day, props.shortWeekdays))
    }
  function genWeeks (): VNode[] {
      const days = props.days
      const weekDays = props.parsedWeekdays.length
      const weeks: VNode[] = []

      for (let i = 0; i < days.length; i += weekDays) {
        weeks.push(genWeek(days.slice(i, i + weekDays), getWeekNumber(days[i])))
      }

      return weeks
    }
  function genWeek (week: CalendarTimestamp[], weekNumber: number): VNode {
      const weekNodes = week.map((day, index) => genDay(day, index, week))

      if (props.showWeek) {
        weekNodes.unshift(genWeekNumber(weekNumber))
      }

      return context.createElement('div', {
        key: week[0].date,
        staticClass: 'v-calendar-weekly__week',
      }, weekNodes)
    }
  function getWeekNumber (determineDay: CalendarTimestamp) {
      return weekNumber(
        determineDay.year,
        determineDay.month - 1,
        determineDay.day,
        props.parsedWeekdays[0],
        parseInt(props.localeFirstDayOfYear)
      )
    }
  function genWeekNumber (weekNumber: number) {
      return context.createElement('div', {
        staticClass: 'v-calendar-weekly__weeknumber',
      }, [
        context.createElement('small', String(weekNumber)),
      ])
    }
  function genDay (day: CalendarTimestamp, index: number, week: CalendarTimestamp[]): VNode {
      const outside = isOutside(day)

      return context.createElement('div', {
        key: day.date,
        staticClass: 'v-calendar-weekly__day',
        class: props.getRelativeClasses(day, outside),
        on: props.getDefaultMouseEventHandlers(':day', _e => day),
      }, [
        genDayLabel(day),
        ...(getSlot(this, 'day', () => ({ outside, index, week, ...day })) || []),
      ])
    }
  function genDayLabel (day: CalendarTimestamp): VNode {
      return context.createElement('div', {
        staticClass: 'v-calendar-weekly__day-label',
      }, getSlot(this, 'day-label', day) || [genDayLabelButton(day)])
    }
  function genDayLabelButton (day: CalendarTimestamp): VNode {
      const color = day.present ? props.color : 'transparent'
      const hasMonth = day.day === 1 && props.showMonthOnFirst

      return context.createElement(VBtn, {
        props: {
          color,
          fab: true,
          depressed: true,
          small: true,
        },
        on: props.getMouseEventHandlers({
          'click:date': { event: 'click', stop: true },
          'contextmenu:date': { event: 'contextmenu', stop: true, prevent: true, result: false },
        }, _e => day),
      }, hasMonth
        ? props.monthFormatter(day, props.shortMonths) + ' ' + props.dayFormatter(day, false)
        : props.dayFormatter(day, false)
      )
    }
  function genDayMonth (day: CalendarTimestamp): VNode | string {
      const color = day.present ? props.color : undefined

      return context.createElement('div', props.setTextColor(color, {
        staticClass: 'v-calendar-weekly__day-month',
      }), getSlot(this, 'day-month', day) || props.monthFormatter(day, props.shortMonths))
    }

  return {
    isOutside,
    genHead,
    genHeadDays,
    genHeadDay,
    genWeeks,
    genWeek,
    getWeekNumber,
    genWeekNumber,
    genDay,
    genDayLabel,
    genDayLabelButton,
    genDayMonth,
  }
}
const VCalendarWeekly = defineComponent({
  name: 'v-calendar-weekly',
  props: VCalendarWeeklyProps,
  setup(props, context) {
    const {} = useVCalendarWeekly(props, context)
    return h('div', {
      staticClass: props.staticClass,
      class: props.classes,
      on: {
        dragstart: (e: MouseEvent) => {
          e.preventDefault()
        },
      },
    }, [
      !props.hideHeader ? genHead() : '',
      ...genWeeks(),
    ])
  },
})

export default VCalendarWeekly

