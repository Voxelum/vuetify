import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VDatePickerHeader.sass'

// Components
import VBtn from '../VBtn'
import VIcon from '../VIcon'

// Mixins
import Colorable from '../../mixins/colorable'
import Localable from '../../mixins/localable'
import Themeable from '../../mixins/themeable'

// Utils
import { createNativeLocaleFormatter, monthChange } from './util'
import mixins from '../../util/mixins'

// Types
import { VNode, PropType } from 'vue'
import { DatePickerFormatter } from 'vuetify/types'
export const VDatePickerHeaderProps = {
    disabled: Boolean,
    format: Function as PropType<DatePickerFormatter | undefined>,
    min: String,
    max: String,
    nextAriaLabel: String,
    nextIcon: {
      type: String,
      default: '$next',
    },
    prevAriaLabel: String,
    prevIcon: {
      type: String,
      default: '$prev',
    },
    readonly: Boolean,
    value: {
      type: [Number, String],
      required: true,
    },
}

  Colorable,
  Localable,
  Themeable
/* @vue/component */
export function useVDatePickerHeader(props: ExtractPropTypes<typeof VDatePickerHeaderProps>, context: SetupContext) {


  const data = reactive({
      isReversing: false,
    }
)

    const formatter: Ref<DatePickerFormatter> = computed(() => {
      if (props.format) {
        return props.format
      } else if (String(props.value).split('-')[1]) {
        return createNativeLocaleFormatter(props.currentLocale, { month: 'long', year: 'numeric', timeZone: 'UTC' }, { length: 7 })
      } else {
        return createNativeLocaleFormatter(props.currentLocale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 })
      }
    })

watch(props, (newVal, oldVal) => {
      data.isReversing = newVal < oldVal
})

  function genBtn (change: number) {
      const ariaLabelId = change > 0 ? props.nextAriaLabel : props.prevAriaLabel
      const ariaLabel = ariaLabelId ? context.vuetify.lang.t(ariaLabelId) : undefined
      const disabled = props.disabled ||
        (change < 0 && props.min && calculateChange(change) < props.min) ||
        (change > 0 && props.max && calculateChange(change) > props.max)

      return context.createElement(VBtn, {
        attrs: { 'aria-label': ariaLabel },
        props: {
          dark: props.dark,
          disabled,
          icon: true,
          light: props.light,
        },
        on: {
          click: (e: Event) => {
            e.stopPropagation()
            context.emit('input', calculateChange(change))
          },
        },
      }, [
        context.createElement(VIcon, ((change < 0) === !context.vuetify.rtl) ? props.prevIcon : props.nextIcon),
      ])
    }
  function calculateChange (sign: number) {
      const [year, month] = String(props.value).split('-').map(Number)

      if (month == null) {
        return `${year + sign}`
      } else {
        return monthChange(String(props.value), sign)
      }
    }
  function genHeader () {
      const color = !props.disabled && (props.color || 'accent')
      const header = context.createElement('div', props.setTextColor(color, {
        key: String(props.value),
      }), [context.createElement('button', {
        attrs: {
          type: 'button',
        },
        on: {
          click: () => context.emit('toggle'),
        },
      }, [context.slots.default || formatter.value(String(props.value))])])

      const transition = context.createElement('transition', {
        props: {
          name: (data.isReversing === !context.vuetify.rtl) ? 'tab-reverse-transition' : 'tab-transition',
        },
      }, [header])

      return context.createElement('div', {
        staticClass: 'v-date-picker-header__value',
        class: {
          'v-date-picker-header__value--disabled': props.disabled,
        },
      }, [transition])
    }

  return {
    formatter,
    genBtn,
    calculateChange,
    genHeader,
  }
}
const VDatePickerHeader = defineComponent({
  name: 'v-date-picker-header',
  props: VDatePickerHeaderProps,
  setup(props, context) {
    const {} = useVDatePickerHeader(props, context)
  },
})

export default VDatePickerHeader

