import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VDatePickerYears.sass'

// Mixins
import Colorable from '../../mixins/colorable'
import Localable from '../../mixins/localable'

// Utils
import {
  createItemTypeNativeListeners,
  createNativeLocaleFormatter,
} from './util'
import { mergeListeners } from '../../util/mergeData'
import mixins, { ExtractVue } from '../../util/mixins'

// Types
import Vue, { VNode, PropType } from 'vue'
import { DatePickerFormatter } from 'vuetify/types'
export const VDatePickerYearsProps = {
    format: Function as PropType<DatePickerFormatter | undefined>,
    min: [Number, String],
    max: [Number, String],
    readonly: Boolean,
    value: [Number, String],
}

interface options extends Vue {
  $el: HTMLElement
}

/* eslint-disable indent */
  ExtractVue<[
    typeof Colorable,
    typeof Localable
  ]>
/* eslint-enable indent */
>(
  Colorable,
  Localable
/* @vue/component */
export function useVDatePickerYears(props: ExtractPropTypes<typeof VDatePickerYearsProps>, context: SetupContext) {


  const data = reactive({
      defaultColor: 'primary',
    }
)

    const formatter: Ref<DatePickerFormatter> = computed(() => {
      return props.format || createNativeLocaleFormatter(props.currentLocale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 })
    })

  onMounted(() => {
    setTimeout(() => {
      const activeItem = context.el.getElementsByClassName('active')[0]
      if (activeItem) {
        context.el.scrollTop = activeItem.offsetTop - context.el.offsetHeight / 2 + activeItem.offsetHeight / 2
      } else if (props.min && !props.max) {
        context.el.scrollTop = context.el.scrollHeight
      } else if (!props.min && props.max) {
        context.el.scrollTop = 0
      } else {
        context.el.scrollTop = context.el.scrollHeight / 2 - context.el.offsetHeight / 2
      }
    })
  })

  function genYearItem (year: number): VNode {
      const formatted = formatter.value(`${year}`)
      const active = parseInt(props.value, 10) === year
      const color = active && (props.color || 'primary')

      return context.createElement('li', props.setTextColor(color, {
        key: year,
        class: { active },
        on: mergeListeners({
          click: () => context.emit('input', year),
        }, createItemTypeNativeListeners(this, ':year', year)),
      }), formatted)
    }

  function genYearItems (): VNode[] {
      const children = []
      const selectedYear = props.value ? parseInt(props.value, 10) : new Date().getFullYear()
      const maxYear = props.max ? parseInt(props.max, 10) : (selectedYear + 100)
      const minYear = Math.min(maxYear, props.min ? parseInt(props.min, 10) : (selectedYear - 100))

      for (let year = maxYear; year >= minYear; year--) {
        children.push(genYearItem(year))
      }

      return children
    }

  return {
    formatter,
    genYearItem,
    genYearItems,
  }
}
const VDatePickerYears = defineComponent({
  name: 'v-date-picker-years',
  props: VDatePickerYearsProps,
  setup(props, context) {
    const {} = useVDatePickerYears(props, context)
  },
})

export default VDatePickerYears

