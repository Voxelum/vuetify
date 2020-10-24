import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VAutocomplete.sass'

// Extensions
import VSelect, { defaultMenuProps as VSelectMenuProps } from '../VSelect/VSelect'
import VTextField from '../VTextField/VTextField'

// Utilities
import mergeData from '../../util/mergeData'
import {
  getObjectValueByPath,
  getPropertyFromItem,
  keyCodes,
} from '../../util/helpers'

// Types
import { PropType, VNode } from 'vue'
import { PropValidator } from 'vue/types/options'
export const VAutocompleteProps = {
    allowOverflow: {
      type: Boolean,
      default: true,
    },
    autoSelectFirst: {
      type: Boolean,
      default: false,
    },
    filter: {
      type: Function,
      default: (item: any, queryText: string, itemText: string) => {
        return itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
      },
    } as PropValidator<(item: any, queryText: string, itemText: string) => boolean>,
    hideNoData: Boolean,
    menuProps: {
      type: VSelect.options.props.menuProps.type,
      default: () => defaultMenuProps,
    },
    noFilter: Boolean,
    searchInput: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
}

const defaultMenuProps = {
  ...VSelectMenuProps,
  offsetY: true,
  offsetOverflow: true,
  transition: false,
}

/* @vue/component */
export function useVAutocomplete(props: ExtractPropTypes<typeof VAutocompleteProps>, context: SetupContext) {


  const data = reactive({
      lazySearch: props.searchInput,
    }
)

    const classes: Ref<object> = computed(() => {
      return {
        ...VSelect.options.computed.classes.call(this),
        'v-autocomplete': true,
        'v-autocomplete--is-selecting-index': props.selectedIndex > -1,
      }
    })
    const computedItems: Ref<object[]> = computed(() => {
      return filteredItems.value
    })
    const selectedValues: Ref<object[]> = computed(() => {
      return props.selectedItems.map(item => props.getValue(item))
    })
    const hasDisplayedItems: Ref<boolean> = computed(() => {
      return props.hideSelected
        ? filteredItems.value.some(item => !hasItem(item))
        : filteredItems.value.length > 0
    })
    const currentRange: Ref<number> = computed(() => {
      if (selectedItem.value == null) return 0

      return String(props.getText(selectedItem.value)).length
    })
    const filteredItems: Ref<object[]> = computed(() => {
      if (!isSearching.value || props.noFilter || internalSearch.value == null) return props.allItems

      return props.allItems.filter(item => {
        const value = getPropertyFromItem(item, props.itemText)
        const text = value != null ? String(value) : ''

        return props.filter(item, String(internalSearch.value), text)
      })
    })
    const internalSearch = computed({
      get (): string | undefined {
        return data.lazySearch
      },
      set (val: any) {
        data.lazySearch = val

        context.emit('update:search-input', val)
      },
    })
    const isAnyValueAllowed: Ref<boolean> = computed(() => {
      return false
    })
    const isDirty: Ref<boolean> = computed(() => {
      return searchIsDirty.value || props.selectedItems.length > 0
    })
    const isSearching: Ref<boolean> = computed(() => {
      return (
        props.multiple &&
        searchIsDirty.value
      ) || (
        searchIsDirty.value &&
        internalSearch.value !== props.getText(selectedItem.value)
      )
    })
    const menuCanShow: Ref<boolean> = computed(() => {
      if (!props.isFocused) return false

      return hasDisplayedItems.value || !props.hideNoData
    })
    const $_menuProps: Ref<object> = computed(() => {
      const props = VSelect.options.computed.$_menuProps.call(this);
      (props as any).contentClass = `v-autocomplete__content ${(props as any).contentClass || ''}`.trim()
      return {
        ...defaultMenuProps,
        ...props,
      }
    })
    const searchIsDirty: Ref<boolean> = computed(() => {
      return internalSearch.value != null &&
        internalSearch.value !== ''
    })
    const selectedItem: Ref<any> = computed(() => {
      if (props.multiple) return null

      return props.selectedItems.find(i => {
        return props.valueComparator(props.getValue(i), props.getValue(props.internalValue))
      })
    })
    const listData: Ref<listData ()> = computed(() => {
      const data = VSelect.options.computed.listData.call(this) as any

      data.props = {
        ...data.props,
        items: props.virtualizedItems,
        noFilter: (
          props.noFilter ||
          !isSearching.value ||
          !filteredItems.value.length
        ),
        searchInput: internalSearch.value,
      }

      return data
    })

watch(filteredItems, undefined => {
    internalValue: 'setSearch',
    isFocused (val) {
      if (val) {
        document.addEventListener('copy', onCopy)
        context.refs.input && context.refs.input.select()
      } else {
        document.removeEventListener('copy', onCopy)
        updateSelf()
      }
    },
    isMenuActive (val) {
      if (val || !props.hasSlot) return
{
    isMenuActive (val) {
      if (val || !props.hasSlot) return

      data.lazySearch = undefined
})
      // If we are focused, the menu
      // is not active, hide no data is enabled,
      // and items change
      // User is probably async loading
      // items, try to activate the menu
      if (
        !(oldVal && oldVal.length) &&
        props.hideNoData &&
        props.isFocused &&
        !props.isMenuActive &&
        val.length
      ) props.activateMenu()
})
watch(() => props.searchInput, (val: string) => {
      data.lazySearch = val
})
watch(internalSearch, undefined => {
{

    setSearch()

  onUnmounted(() => {
    document.removeEventListener('copy', onCopy)
  })

  function onFilteredItemsChanged (val: never[], oldVal: never[]) {
      // TODO: How is the watcher triggered
      // for duplicate items? no idea
      if (val === oldVal) return

      props.setMenuIndex(-1)

      context.nextTick(() => {
        if (
          !internalSearch.value ||
          (val.length !== 1 &&
            !props.autoSelectFirst)
        ) return

        context.refs.menu.getTiles()
        props.setMenuIndex(0)
      })
    }
  function onInternalSearchChanged () {
      updateMenuDimensions()
    }
  function updateMenuDimensions () {
      // Type from menuable is not making it through
      props.isMenuActive && context.refs.menu && context.refs.menu.updateDimensions()
    }
  function changeSelectedIndex (keyCode: number) {
      // Do not allow changing of selectedIndex
      // when search is dirty
      if (searchIsDirty.value) return

      if (props.multiple && keyCode === keyCodes.left) {
        if (props.selectedIndex === -1) {
          props.selectedIndex = props.selectedItems.length - 1
        } else {
          props.selectedIndex--
        }
      } else if (props.multiple && keyCode === keyCodes.right) {
        if (props.selectedIndex >= props.selectedItems.length - 1) {
          props.selectedIndex = -1
        } else {
          props.selectedIndex++
        }
      } else if (keyCode === keyCodes.backspace || keyCode === keyCodes.delete) {
        deleteCurrentItem()
      }
    }
  function deleteCurrentItem () {
      const curIndex = props.selectedIndex
      const curItem = props.selectedItems[curIndex]

      // Do nothing if input or item is disabled
      if (
        !props.isInteractive ||
        props.getDisabled(curItem)
      ) return

      const lastIndex = props.selectedItems.length - 1

      // Select the last item if
      // there is no selection
      if (
        props.selectedIndex === -1 &&
        lastIndex !== 0
      ) {
        props.selectedIndex = lastIndex

        return
      }

      const length = props.selectedItems.length
      const nextIndex = curIndex !== length - 1
        ? curIndex
        : curIndex - 1
      const nextItem = props.selectedItems[nextIndex]

      if (!nextItem) {
        props.setValue(props.multiple ? [] : undefined)
      } else {
        selectItem(curItem)
      }

      props.selectedIndex = nextIndex
    }
  function clearableCallback () {
      internalSearch.value = undefined

      VSelect.options.methods.clearableCallback.call(this)
    }
  function genInput () {
      const input = VTextField.options.methods.genInput.call(this)

      input.data = mergeData(input.data!, {
        attrs: {
          'aria-activedescendant': getObjectValueByPath(context.refs.menu, 'activeTile.id'),
          autocomplete: getObjectValueByPath(input.data!, 'attrs.autocomplete', 'off'),
        },
        domProps: { value: internalSearch.value },
      })

      return input
    }
  function genInputSlot () {
      const slot = VSelect.options.methods.genInputSlot.call(this)

      slot.data!.attrs!.role = 'combobox'

      return slot
    }
  function genSelections (): VNode | never[] {
      return props.hasSlot || props.multiple
        ? VSelect.options.methods.genSelections.call(this)
        : []
    }
  function onClick (e: MouseEvent) {
      if (!props.isInteractive) return

      props.selectedIndex > -1
        ? (props.selectedIndex = -1)
        : props.onFocus()

      if (!props.isAppendInner(e.target)) props.activateMenu()
    }
  function onInput (e: Event) {
      if (
        props.selectedIndex > -1 ||
        !e.target
      ) return

      const target = e.target as HTMLInputElement
      const value = target.value

      // If typing and menu is not currently active
      if (target.value) props.activateMenu()

      internalSearch.value = value
      props.badInput = target.validity && target.validity.badInput
    }
  function onKeyDown (e: KeyboardEvent) {
      const keyCode = e.keyCode

      VSelect.options.methods.onKeyDown.call(this, e)

      // The ordering is important here
      // allows new value to be updated
      // and then moves the index to the
      // proper location
      changeSelectedIndex(keyCode)
    }
  function onSpaceDown (e: KeyboardEvent) { /* noop */ },
  function onTabDown (e: KeyboardEvent) {
      VSelect.options.methods.onTabDown.call(this, e)
      updateSelf()
    }
  function onUpDown (e: Event) {
      // Prevent screen from scrolling
      e.preventDefault()

      // For autocomplete / combobox, cycling
      // interfers with native up/down behavior
      // instead activate the menu
      props.activateMenu()
    }
  function selectItem (item: object) {
      VSelect.options.methods.selectItem.call(this, item)
      setSearch()
    }
  function setSelectedItems () {
      VSelect.options.methods.setSelectedItems.call(this)

      // #4273 Don't replace if searching
      // #4403 Don't replace if focused
      if (!props.isFocused) setSearch()
    }
  function setSearch () {
      // Wait for nextTick so selectedItem
      // has had time to update
      context.nextTick(() => {
        if (
          !props.multiple ||
          !internalSearch.value ||
          !props.isMenuActive
        ) {
          internalSearch.value = (
            !props.selectedItems.length ||
            props.multiple ||
            props.hasSlot
          )
            ? null
            : props.getText(selectedItem.value)
        }
      })
    }
  function updateSelf () {
      if (!searchIsDirty.value &&
        !props.internalValue
      ) return

      if (!props.valueComparator(
        internalSearch.value,
        props.getValue(props.internalValue)
      )) {
        setSearch()
      }
    }
  function hasItem (item: any): boolean {
      return selectedValues.value.indexOf(props.getValue(item)) > -1
    }
  function onCopy (event: ClipboardEvent) {
      if (props.selectedIndex === -1) return

      const currentItem = props.selectedItems[props.selectedIndex]
      const currentItemText = props.getText(currentItem)
      event.clipboardData!.setData('text/plain', currentItemText)
      event.clipboardData!.setData('text/vnd.vuetify.autocomplete.item+plain', currentItemText)
      event.preventDefault()
    }
  return {
    classes,
    computedItems,
    selectedValues,
    hasDisplayedItems,
    currentRange,
    filteredItems,
    internalSearch,
    isAnyValueAllowed,
    isDirty,
    isSearching,
    menuCanShow,
    $_menuProps,
    searchIsDirty,
    selectedItem,
    listData,
    onFilteredItemsChanged,
    onInternalSearchChanged,
    updateMenuDimensions,
    changeSelectedIndex,
    deleteCurrentItem,
    clearableCallback,
    genInput,
    genInputSlot,
    genSelections,
    onClick,
    onInput,
    onKeyDown,
    onSpaceDown,
    onTabDown,
    onUpDown,
    selectItem,
    setSelectedItems,
    setSearch,
    updateSelf,
    hasItem,
    onCopy,
  }
}
const VAutocomplete = defineComponent({
  name: 'v-autocomplete',
  props: VAutocompleteProps,
  setup(props, context) {
    const {} = useVAutocomplete(props, context)
  },
})

export default VAutocomplete

