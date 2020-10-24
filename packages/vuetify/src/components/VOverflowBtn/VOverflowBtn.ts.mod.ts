import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VOverflowBtn.sass'

// Extensions
import VSelect from '../VSelect/VSelect'
import VAutocomplete from '../VAutocomplete'
import VTextField from '../VTextField/VTextField'

// Components
import VBtn from '../VBtn'

// Utilities
import { consoleWarn } from '../../util/console'
export const VOverflowBtnProps = {
  editable: Boolean,
  segmented: Boolean,
}

/* @vue/component */
export function useVOverflowBtn(props: ExtractPropTypes<typeof VOverflowBtnProps>, context: SetupContext) {
  
  const classes: Ref<object> = computed(() => {
    return {
      ...VAutocomplete.options.computed.classes.call(this),
      'v-overflow-btn': true,
      'v-overflow-btn--segmented': props.segmented,
      'v-overflow-btn--editable': props.editable,
    }
  })
  const isAnyValueAllowed: Ref<boolean> = computed(() => {
    return props.editable ||
      VAutocomplete.options.computed.isAnyValueAllowed.call(this)
  })
  const isSingle: Ref<true> = computed(() => {
    return true
  })
  const computedItems: Ref<object[]> = computed(() => {
    return props.segmented ? props.allItems : props.filteredItems
  })

  function genSelections() {
    return props.editable
      ? VAutocomplete.options.methods.genSelections.call(this)
      : VSelect.options.methods.genSelections.call(this) // Override v-autocomplete's override
  }
  function genCommaSelection(item: any, index: number, last: boolean) {
    return props.segmented
      ? genSegmentedBtn(item)
      : VSelect.options.methods.genCommaSelection.call(this, item, index, last)
  }
  function genInput() {
    const input = VTextField.options.methods.genInput.call(this)

    input.data = input.data || {}
    input.data.domProps!.value = props.editable ? props.internalSearch : ''
    input.data.attrs!.readonly = !isAnyValueAllowed.value

    return input
  }
  function genLabel() {
    if (props.editable && props.isFocused) return null

    const label = VTextField.options.methods.genLabel.call(this)

    if (!label) return label

    label.data = label.data || {}

    // Reset previously set styles from parent
    label.data.style = {}

    return label
  }
  function genSegmentedBtn(item: any) {
    const itemValue = props.getValue(item)
    const itemObj = computedItems.value.find(i => props.getValue(i) === itemValue) || item

    if (!itemObj.text || !itemObj.callback) {
      consoleWarn('When using \'segmented\' prop without a selection slot, items must contain both a text and callback property', this)
      return null
    }

    return context.createElement(VBtn, {
      props: { text: true },
      on: {
        click(e: Event) {
          e.stopPropagation()
          itemObj.callback(e)
        },
      },
    }, [itemObj.text])
  }
  function updateValue(val: boolean) {
    if (val) {
      props.initialValue = props.lazyValue
    } else if (props.initialValue !== props.lazyValue) {
      context.emit('change', props.lazyValue)
    }
  }
  return {
    classes,
    isAnyValueAllowed,
    isSingle,
    computedItems,
    genSelections,
    genCommaSelection,
    genInput,
    genLabel,
    genSegmentedBtn,
    updateValue,
  }
}
const VOverflowBtn = defineComponent({
  name: 'v-overflow-btn',
  props: VOverflowBtnProps,
  setup(props, context) {
    const { } = useVOverflowBtn(props, context)
  },
})

export default VOverflowBtn

