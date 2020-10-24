import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VCalendarCategory.sass'

// Types
import { VNode } from 'vue'

// Mixins
import VCalendarDaily from './VCalendarDaily'

// Util
import { getSlot } from '../../util/helpers'
import { CalendarTimestamp } from 'types'
import props from './util/props'
export const VCalendarCategoryProps = {
}

/* @vue/component */
export function useVCalendarCategory(props: ExtractPropTypes<typeof VCalendarCategoryProps>, context: SetupContext) {


  function genDayHeader (day: CalendarTimestamp, index: number): VNode[] {
      const data = {
        staticClass: 'v-calendar-category__columns',
      }
      const scope = {
        week: props.days, ...day, index,
      }

      const children = props.parsedCategories.map(category => genDayHeaderCategory(day, getCategoryScope(scope, category)))

      return [context.createElement('div', data, children)]
    }
  function getCategoryScope (scope: any, category: string) {
      return {
        ...scope,
        category: category === props.categoryForInvalid ? null : category,
      }
    }
  function genDayHeaderCategory (day: CalendarTimestamp, scope: any): VNode {
      return context.createElement('div', {
        staticClass: 'v-calendar-category__column-header',
        on: props.getDefaultMouseEventHandlers(':day-category', e => {
          return getCategoryScope(props.getSlotScope(day), scope.category)
        }),
      }, [
        getSlot(this, 'category', scope) || genDayHeaderCategoryTitle(scope.category),
        getSlot(this, 'day-header', scope),
      ])
    }
  function genDayHeaderCategoryTitle (category: string) {
      return context.createElement('div', {
        staticClass: 'v-calendar-category__category',
      }, category === null ? props.categoryForInvalid : category)
    }
  function genDayBody (day: CalendarTimestamp): VNode[] {
      const data = {
        staticClass: 'v-calendar-category__columns',
      }

      const children = props.parsedCategories.map(category => genDayBodyCategory(day, category))

      return [context.createElement('div', data, children)]
    }
  function genDayBodyCategory (day: CalendarTimestamp, category: string): VNode {
      const data = {
        staticClass: 'v-calendar-category__column',
        on: props.getDefaultMouseEventHandlers(':time-category', e => {
          return getCategoryScope(props.getSlotScope(props.getTimestampAtEvent(e, day)), category)
        }),
      }

      const children = getSlot(this, 'day-body', () => getCategoryScope(props.getSlotScope(day), category))

      return context.createElement('div', data, children)
    }
  return {
    genDayHeader,
    getCategoryScope,
    genDayHeaderCategory,
    genDayHeaderCategoryTitle,
    genDayBody,
    genDayBodyCategory,
  }
}
const VCalendarCategory = defineComponent({
  name: 'v-calendar-category',
  props: VCalendarCategoryProps,
  setup(props, context) {
    const {} = useVCalendarCategory(props, context)
  },
})

export default VCalendarCategory

