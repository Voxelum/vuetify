import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VCalendarDaily.sass'

// Types
import { VNode } from 'vue'

// Directives
import Resize from '../../directives/resize'

// Components
import VBtn from '../VBtn'

// Mixins
import CalendarWithIntervals from './mixins/calendar-with-intervals'

// Util
import { convertToUnit, getSlot } from '../../util/helpers'
import { CalendarTimestamp } from 'vuetify/types'
export const VCalendarDailyProps = {
}

/* @vue/component */
export function useVCalendarDaily(props: ExtractPropTypes<typeof VCalendarDailyProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        'v-calendar-daily': true,
        ...props.themeClasses,
      }
    })

  onMounted(() => {
    init()
  })

  function init () {
      context.nextTick(onResize)
    }
  function onResize () {
      props.scrollPush = getScrollPush()
    }
  function getScrollPush (): number {
      const area = context.refs.scrollArea as HTMLElement
      const pane = context.refs.pane as HTMLElement

      return area && pane ? (area.offsetWidth - pane.offsetWidth) : 0
    }
  function genHead (): VNode {
      return context.createElement('div', {
        staticClass: 'v-calendar-daily__head',
        style: {
          marginRight: props.scrollPush + 'px',
        },
      }, [
        genHeadIntervals(),
        ...genHeadDays(),
      ])
    }
  function genHeadIntervals (): VNode {
      const width: string | undefined = convertToUnit(props.intervalWidth)

      return context.createElement('div', {
        staticClass: 'v-calendar-daily__intervals-head',
        style: {
          width,
        },
      }, getSlot(this, 'interval-header'))
    }
  function genHeadDays (): VNode[] {
      return props.days.map(genHeadDay)
    }
  function genHeadDay (day: CalendarTimestamp, index: number): VNode {
      return context.createElement('div', {
        key: day.date,
        staticClass: 'v-calendar-daily_head-day',
        class: props.getRelativeClasses(day),
        on: props.getDefaultMouseEventHandlers(':day', _e => {
          return props.getSlotScope(day)
        }),
      }, [
        genHeadWeekday(day),
        genHeadDayLabel(day),
        ...genDayHeader(day, index),
      ])
    }
  function genDayHeader (day: CalendarTimestamp, index: number): VNode[] {
      return getSlot(this, 'day-header', () => ({
        week: props.days, ...day, index,
      })) || []
    }
  function genHeadWeekday (day: CalendarTimestamp): VNode {
      const color = day.present ? props.color : undefined

      return context.createElement('div', props.setTextColor(color, {
        staticClass: 'v-calendar-daily_head-weekday',
      }), props.weekdayFormatter(day, props.shortWeekdays))
    }
  function genHeadDayLabel (day: CalendarTimestamp): VNode {
      return context.createElement('div', {
        staticClass: 'v-calendar-daily_head-day-label',
      }, getSlot(this, 'day-label-header', day) || [genHeadDayButton(day)])
    }
  function genHeadDayButton (day: CalendarTimestamp): VNode {
      const color = day.present ? props.color : 'transparent'

      return context.createElement(VBtn, {
        props: {
          color,
          fab: true,
          depressed: true,
        },
        on: props.getMouseEventHandlers({
          'click:date': { event: 'click', stop: true },
          'contextmenu:date': { event: 'contextmenu', stop: true, prevent: true, result: false },
        }, _e => {
          return day
        }),
      }, props.dayFormatter(day, false))
    }
  function genBody (): VNode {
      return context.createElement('div', {
        staticClass: 'v-calendar-daily__body',
      }, [
        genScrollArea(),
      ])
    }
  function genScrollArea (): VNode {
      return context.createElement('div', {
        ref: 'scrollArea',
        staticClass: 'v-calendar-daily__scroll-area',
      }, [
        genPane(),
      ])
    }
  function genPane (): VNode {
      return context.createElement('div', {
        ref: 'pane',
        staticClass: 'v-calendar-daily__pane',
        style: {
          height: convertToUnit(props.bodyHeight),
        },
      }, [
        genDayContainer(),
      ])
    }
  function genDayContainer (): VNode {
      return context.createElement('div', {
        staticClass: 'v-calendar-daily__day-container',
      }, [
        genBodyIntervals(),
        ...genDays(),
      ])
    }
  function genDays (): VNode[] {
      return props.days.map(genDay)
    }
  function genDay (day: CalendarTimestamp, index: number): VNode {
      return context.createElement('div', {
        key: day.date,
        staticClass: 'v-calendar-daily__day',
        class: props.getRelativeClasses(day),
        on: props.getDefaultMouseEventHandlers(':time', e => {
          return props.getSlotScope(props.getTimestampAtEvent(e, day))
        }),
      }, [
        ...genDayIntervals(index),
        ...genDayBody(day),
      ])
    }
  function genDayBody (day: CalendarTimestamp): VNode[] {
      return getSlot(this, 'day-body', () => props.getSlotScope(day)) || []
    }
  function genDayIntervals (index: number): VNode[] {
      return props.intervals[index].map(genDayInterval)
    }
  function genDayInterval (interval: CalendarTimestamp): VNode {
      const height: string | undefined = convertToUnit(props.intervalHeight)
      const styler = props.intervalStyle || props.intervalStyleDefault

      const data = {
        key: interval.time,
        staticClass: 'v-calendar-daily__day-interval',
        style: {
          height,
          ...styler(interval),
        },
      }

      const children = getSlot(this, 'interval', () => props.getSlotScope(interval))

      return context.createElement('div', data, children)
    }
  function genBodyIntervals (): VNode {
      const width: string | undefined = convertToUnit(props.intervalWidth)
      const data = {
        staticClass: 'v-calendar-daily__intervals-body',
        style: {
          width,
        },
        on: props.getDefaultMouseEventHandlers(':interval', e => {
          return props.getTimestampAtEvent(e, props.parsedStart)
        }),
      }

      return context.createElement('div', data, genIntervalLabels())
    }
  function genIntervalLabels (): VNode[] | null {
      if (!props.intervals.length) return null

      return props.intervals[0].map(genIntervalLabel)
    }
  function genIntervalLabel (interval: CalendarTimestamp): VNode {
      const height: string | undefined = convertToUnit(props.intervalHeight)
      const short: boolean = props.shortIntervals
      const shower = props.showIntervalLabel || props.showIntervalLabelDefault
      const show = shower(interval)
      const label = show ? props.intervalFormatter(interval, short) : undefined

      return context.createElement('div', {
        key: interval.time,
        staticClass: 'v-calendar-daily__interval',
        style: {
          height,
        },
      }, [
        context.createElement('div', {
          staticClass: 'v-calendar-daily__interval-text',
        }, label),
      ])
    }

  return {
    classes,
    init,
    onResize,
    getScrollPush,
    genHead,
    genHeadIntervals,
    genHeadDays,
    genHeadDay,
    genDayHeader,
    genHeadWeekday,
    genHeadDayLabel,
    genHeadDayButton,
    genBody,
    genScrollArea,
    genPane,
    genDayContainer,
    genDays,
    genDay,
    genDayBody,
    genDayIntervals,
    genDayInterval,
    genBodyIntervals,
    genIntervalLabels,
    genIntervalLabel,
  }
}
const VCalendarDaily = defineComponent({
  name: 'v-calendar-daily',
  props: VCalendarDailyProps,
  setup(props, context) {
    const {} = useVCalendarDaily(props, context)
    return h('div', {
      class: classes.value,
      on: {
        dragstart: (e: MouseEvent) => {
          e.preventDefault()
        },
      },
      directives: [{
        modifiers: { quiet: true },
        name: 'resize',
        value: onResize,
      }],
    }, [
      !props.hideHeader ? genHead() : '',
      genBody(),
    ])
  },
})

export default VCalendarDaily

