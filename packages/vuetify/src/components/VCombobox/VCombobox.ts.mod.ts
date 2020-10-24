import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import '../VAutocomplete/VAutocomplete.sass'

// Extensions
import VSelect from '../VSelect/VSelect'
import VAutocomplete from '../VAutocomplete/VAutocomplete'

// Utils
import { keyCodes } from '../../util/helpers'

// Types
import { PropValidator } from 'vue/types/options'
export const VComboboxProps = {
  delimiters: {
    type: Array,
    default: () => ([]),
  } as PropValidator<string[]>,
  returnObject: {
    type: Boolean,
    default: true,
  },
}

/* @vue/component */
export function useVCombobox(props: ExtractPropTypes<typeof VComboboxProps>, context: SetupContext) {
  const data = reactive({
    editingIndex: -1,
  })
  const computedCounterValue: Ref<number> = computed(() => {
    return props.multiple
      ? props.selectedItems.length
      : (props.internalSearch || '').toString().length
  })
  const hasSlot: Ref<boolean> = computed(() => {
    return VSelect.options.computed.hasSlot.call(this) || props.multiple
  })
  const isAnyValueAllowed: Ref<boolean> = computed(() => {
    return true
  })
  const menuCanShow: Ref<boolean> = computed(() => {
    if (!props.isFocused) return false

    return props.hasDisplayedItems ||
      (!!context.slots['no-data'] && !props.hideNoData)
  })

  function onInternalSearchChanged(val: any) {
    if (
      val &&
      props.multiple &&
      props.delimiters.length
    ) {
      const delimiter = props.delimiters.find(d => val.endsWith(d))
      if (delimiter != null) {
        props.internalSearch = val.slice(0, val.length - delimiter.length)
        updateTags()
      }
    }

    props.updateMenuDimensions()
  }
  function genInput() {
    const input = VAutocomplete.options.methods.genInput.call(this)

    delete input.data!.attrs!.name
    input.data!.on!.paste = onPaste

    return input
  }
  function genChipSelection(item: object, index: number) {
    const chip = VSelect.options.methods.genChipSelection.call(this, item, index)

    // Allow user to update an existing value
    if (props.multiple) {
      chip.componentOptions!.listeners! = {
        ...chip.componentOptions!.listeners!,
        dblclick: () => {
          data.editingIndex = index
          props.internalSearch = props.getText(item)
          props.selectedIndex = -1
        },
      }
    }

    return chip
  }
  function onChipInput(item: object) {
    VSelect.options.methods.onChipInput.call(this, item)

    data.editingIndex = -1
  }
  // Requires a manual definition
  // to overwrite removal in v-autocomplete
  function onEnterDown(e: Event) {
    e.preventDefault()
    // If has menu index, let v-select-list handle
    if (props.getMenuIndex() > -1) return

    context.nextTick(updateSelf)
  }
  function onFilteredItemsChanged(val: never[], oldVal: never[]) {
    if (!props.autoSelectFirst) return

    VAutocomplete.options.methods.onFilteredItemsChanged.call(this, val, oldVal)
  }
  function onKeyDown(e: KeyboardEvent) {
    const keyCode = e.keyCode

    VSelect.options.methods.onKeyDown.call(this, e)

    // If user is at selection index of 0
    // create a new tag
    if (props.multiple &&
      keyCode === keyCodes.left &&
      context.refs.input.selectionStart === 0
    ) {
      updateSelf()
    } else if (keyCode === keyCodes.enter) {
      onEnterDown(e)
    }

    // The ordering is important here
    // allows new value to be updated
    // and then moves the index to the
    // proper location
    props.changeSelectedIndex(keyCode)
  }
  function onTabDown(e: KeyboardEvent) {
    // When adding tags, if searching and
    // there is not a filtered options,
    // add the value to the tags list
    if (props.multiple &&
      props.internalSearch &&
      props.getMenuIndex() === -1
    ) {
      e.preventDefault()
      e.stopPropagation()

      return updateTags()
    }

    VAutocomplete.options.methods.onTabDown.call(this, e)
  }
  function selectItem(item: object) {
    // Currently only supports items:<string[]>
    if (data.editingIndex > -1) {
      updateEditing()
    } else {
      VAutocomplete.options.methods.selectItem.call(this, item)
    }
  }
  function setSelectedItems() {
    if (props.internalValue == null ||
      props.internalValue === ''
    ) {
      props.selectedItems = []
    } else {
      props.selectedItems = props.multiple ? props.internalValue : [props.internalValue]
    }
  }
  function setValue(value?: any) {
    VSelect.options.methods.setValue.call(this, value ?? props.internalSearch)
  }
  function updateEditing() {
    const value = props.internalValue.slice()
    value[data.editingIndex] = props.internalSearch

    setValue(value)

    data.editingIndex = -1
  }
  function updateCombobox() {
    const isUsingSlot = Boolean(context.scopedSlots.selection) || props.hasChips

    // If search is not dirty and is
    // using slot, do nothing
    if (isUsingSlot && !props.searchIsDirty) return

    // The internal search is not matching
    // the internal value, update the input
    if (props.internalSearch !== props.getText(props.internalValue)) setValue()

    // Reset search if using slot
    // to avoid a double input
    if (isUsingSlot) props.internalSearch = undefined
  }
  function updateSelf() {
    props.multiple ? updateTags() : updateCombobox()
  }
  function updateTags() {
    const menuIndex = props.getMenuIndex()

    // If the user is not searching
    // and no menu item is selected
    // do nothing
    if (menuIndex < 0 &&
      !props.searchIsDirty
    ) return

    if (data.editingIndex > -1) {
      return updateEditing()
    }

    const index = props.selectedItems.indexOf(props.internalSearch)
    // If it already exists, do nothing
    // this might need to change to bring
    // the duplicated item to the last entered
    if (index > -1) {
      const internalValue = props.internalValue.slice()
      internalValue.splice(index, 1)

      setValue(internalValue)
    }

    // If menu index is greater than 1
    // the selection is handled elsewhere
    // TODO: find out where
    if (menuIndex > -1) return (props.internalSearch = null)

    selectItem(props.internalSearch)
    props.internalSearch = null
  }
  function onPaste(event: ClipboardEvent) {
    if (!props.multiple || props.searchIsDirty) return

    const pastedItemText = event.clipboardData!.getData('text/vnd.vuetify.autocomplete.item+plain')
    if (pastedItemText && props.findExistingIndex(pastedItemText as any) === -1) {
      event.preventDefault()
      VSelect.options.methods.selectItem.call(this, pastedItemText as any)
    }
  }
  return {
    computedCounterValue,
    hasSlot,
    isAnyValueAllowed,
    menuCanShow,
    onInternalSearchChanged,
    genInput,
    genChipSelection,
    onChipInput,
    ,
    ,
    onEnterDown,
    onFilteredItemsChanged,
    onKeyDown,
    onTabDown,
    selectItem,
    setSelectedItems,
    setValue,
    updateEditing,
    updateCombobox,
    updateSelf,
    updateTags,
    onPaste,
  }
}
const VCombobox = defineComponent({
  name: 'v-combobox',
  props: VComboboxProps,
  setup(props, context) {
    const { } = useVCombobox(props, context)
  },
})

export default VCombobox

