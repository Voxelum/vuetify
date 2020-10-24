import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import '../../styles/components/_selection-controls.sass'
import './VRadioGroup.sass'

// Extensions
import VInput from '../VInput'
import { BaseItemGroup } from '../VItemGroup/VItemGroup'

// Mixins
import Comparable from '../../mixins/comparable'

// Types
import mixins from '../../util/mixins'
import { PropType } from 'vue'
export const VRadioGroupProps = {
    column: {
      type: Boolean,
      default: true,
    },
    height: {
      type: [Number, String],
      default: 'auto',
    },
    name: String,
    row: Boolean,
    // If no value set on VRadio
    // will match valueComparator
    // force default to null
    value: null as unknown as PropType<any>,
}

const baseMixins = mixins(
  Comparable,
  BaseItemGroup,
  VInput
)

/* @vue/component */
export function useVRadioGroup(props: ExtractPropTypes<typeof VRadioGroupProps>, context: SetupContext) {



    const classes: Ref<object> = computed(() => {
      return {
        ...VInput.options.computed.classes.call(this),
        'v-input--selection-controls v-input--radio-group': true,
        'v-input--radio-group--column': props.column && !props.row,
        'v-input--radio-group--row': props.row,
      }
    })

  function genDefaultSlot () {
      return context.createElement('div', {
        staticClass: 'v-input--radio-group__input',
        attrs: {
          id: props.id,
          role: 'radiogroup',
          'aria-labelledby': props.computedId,
        },
      }, VInput.options.methods.genDefaultSlot.call(this))
    }
  function genInputSlot () {
      const render = VInput.options.methods.genInputSlot.call(this)

      delete render.data!.on!.click

      return render
    }
  function genLabel () {
      const label = VInput.options.methods.genLabel.call(this)

      if (!label) return null

      label.data!.attrs!.id = props.computedId
      // WAI considers this an orphaned label
      delete label.data!.attrs!.for
      label.tag = 'legend'

      return label
    }
  function onClick: BaseItemGroup.options.methods.onClick,
  return {
    classes,
    genDefaultSlot,
    genInputSlot,
    genLabel,
    ,
  }
}
const VRadioGroup = defineComponent({
  name: 'v-radio-group',
  props: VRadioGroupProps,
  setup(props, context) {
    const {} = useVRadioGroup(props, context)
  },
})

export default VRadioGroup

