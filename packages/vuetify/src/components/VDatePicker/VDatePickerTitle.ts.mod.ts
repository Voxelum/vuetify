import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VDatePickerTitle.sass'

// Components
import VIcon from '../VIcon'

// Mixins
import PickerButton from '../../mixins/picker-button'

// Utils
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue'
export const VDatePickerTitleProps = {
    date: {
      type: String,
      default: '',
    },
    disabled: Boolean,
    readonly: Boolean,
    selectingYear: Boolean,
    value: {
      type: String,
    },
    year: {
      type: [Number, String],
      default: '',
    },
    yearIcon: {
      type: String,
    },
}

  PickerButton
/* @vue/component */
export function useVDatePickerTitle(props: ExtractPropTypes<typeof VDatePickerTitleProps>, context: SetupContext) {


  const data = reactive({
    isReversing: false,
  })

    const computedTransition: Ref<string> = computed(() => {
      return data.isReversing ? 'picker-reverse-transition' : 'picker-transition'
    })

watch(props, (val: string, prev: string) => {
      data.isReversing = val < prev
})

  function genYearIcon (): VNode {
      return context.createElement(VIcon, {
        props: {
          dark: true,
        },
      }, props.yearIcon)
    }
  function getYearBtn (): VNode {
      return props.genPickerButton('selectingYear', true, [
        String(props.year),
        props.yearIcon ? genYearIcon() : null,
      ], false, 'v-date-picker-title__year')
    }
  function genTitleText (): VNode {
      return context.createElement('transition', {
        props: {
          name: computedTransition.value,
        },
      }, [
        context.createElement('div', {
          domProps: { innerHTML: props.date || '&nbsp;' },
          key: props.value,
        }),
      ])
    }
  function genTitleDate (): VNode {
      return props.genPickerButton('selectingYear', false, [genTitleText()], false, 'v-date-picker-title__date')
    }

  return {
    computedTransition,
    genYearIcon,
    getYearBtn,
    genTitleText,
    genTitleDate,
  }
}
const VDatePickerTitle = defineComponent({
  name: 'v-date-picker-title',
  props: VDatePickerTitleProps,
  setup(props, context) {
    const {} = useVDatePickerTitle(props, context)
    return h('div', {
      staticClass: 'v-date-picker-title',
      class: {
        'v-date-picker-title--disabled': props.disabled,
      },
    }, [
      getYearBtn(),
      genTitleDate(),
    ])
  },
})

export default VDatePickerTitle

