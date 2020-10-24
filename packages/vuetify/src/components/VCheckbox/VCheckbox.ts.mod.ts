import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VCheckbox.sass'
import '../../styles/components/_selection-controls.sass'

// Components
import VIcon from '../VIcon'
import VInput from '../VInput'

// Mixins
import Selectable from '../../mixins/selectable'
export const VCheckboxProps = {
    indeterminate: Boolean,
    indeterminateIcon: {
      type: String,
      default: '$checkboxIndeterminate',
    },
    offIcon: {
      type: String,
      default: '$checkboxOff',
    },
    onIcon: {
      type: String,
      default: '$checkboxOn',
    },
}

/* @vue/component */
export function useVCheckbox(props: ExtractPropTypes<typeof VCheckboxProps>, context: SetupContext) {


  const data = reactive({
      inputIndeterminate: props.indeterminate,
    }
)

    const classes: Ref<object> = computed(() => {
      return {
        ...VInput.options.computed.classes.call(this),
        'v-input--selection-controls': true,
        'v-input--checkbox': true,
        'v-input--indeterminate': data.inputIndeterminate,
      }
    })
    const computedIcon: Ref<string> = computed(() => {
      if (data.inputIndeterminate) {
        return props.indeterminateIcon
      } else if (props.isActive) {
        return props.onIcon
      } else {
        return props.offIcon
      }
    })
    const validationState: Ref<string | undefined> = computed(() => {
      if (props.isDisabled && !data.inputIndeterminate) return undefined
      if (props.hasError && props.shouldValidate) return 'error'
      if (props.hasSuccess) return 'success'
      if (props.hasColor !== null) return props.computedColor
      return undefined
    })

watch(() => props.indeterminate, (val) => {
      // https://github.com/vuetifyjs/vuetify/issues/8270
      context.nextTick(() => (data.inputIndeterminate = val))
})
watch(() => data.inputIndeterminate, (val) => {
      context.emit('update:indeterminate', val)
})
      if (!props.indeterminate) return
      data.inputIndeterminate = false
})

  function genCheckbox () {
      return context.createElement('div', {
        staticClass: 'v-input--selection-controls__input',
      }, [
        context.createElement(VIcon, props.setTextColor(validationState.value, {
          props: {
            dense: props.dense,
            dark: props.dark,
            light: props.light,
          },
        }), computedIcon.value),
        props.genInput('checkbox', {
          ...props.attrs$,
          'aria-checked': data.inputIndeterminate
            ? 'mixed'
            : props.isActive.toString(),
        }),
        props.genRipple(props.setTextColor(props.rippleState)),
      ])
    }
  function genDefaultSlot () {
      return [
        genCheckbox(),
        props.genLabel(),
      ]
    }
  return {
    classes,
    computedIcon,
    validationState,
    genCheckbox,
    genDefaultSlot,
  }
}
const VCheckbox = defineComponent({
  name: 'v-checkbox',
  props: VCheckboxProps,
  setup(props, context) {
    const {} = useVCheckbox(props, context)
  },
})

export default VCheckbox

