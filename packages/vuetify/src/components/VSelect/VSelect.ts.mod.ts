import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import '../VTextField/VTextField.sass'
import './VSelect.sass'

// Components
import VChip from '../VChip'
import VMenu from '../VMenu'
import VSelectList from './VSelectList'

// Extensions
import VInput from '../VInput'
import VTextField from '../VTextField/VTextField'

// Mixins
import Comparable, { comparableProps } from '../../mixins/comparable'
import Filterable, { filterableProps } from '../../mixins/filterable'

// Directives
import ClickOutside from '../../directives/click-outside'

// Utilities
import mergeData from '../../util/mergeData'
import { getPropertyFromItem, getObjectValueByPath, keyCodes } from '../../util/helpers'
import { consoleError } from '../../util/console'

// Types
import mixins from '../../util/mixins'
import { VNode, VNodeDirective, PropType, VNodeData } from 'vue'
import { PropValidator } from 'vue/types/options'
import { SelectItemKey } from 'vuetify/types'
export const VSelectProps = {
  ...comparableProps,
  ...filterableProps,
  appendIcon: {
    type: String,
    default: '$dropdown',
  },
  attach: {
    type: null as unknown as PropType<string | boolean | Element | VNode>,
    default: false,
  },
  cacheItems: Boolean,
  chips: Boolean,
  clearable: Boolean,
  deletableChips: Boolean,
  disableLookup: Boolean,
  eager: Boolean,
  hideSelected: Boolean,
  items: {
    type: Array,
    default: () => [],
  } as PropValidator<any[]>,
  itemColor: {
    type: String,
    default: 'primary',
  },
  itemDisabled: {
    type: [String, Array, Function] as PropType<SelectItemKey>,
    default: 'disabled',
  },
  itemText: {
    type: [String, Array, Function] as PropType<SelectItemKey>,
    default: 'text',
  },
  itemValue: {
    type: [String, Array, Function] as PropType<SelectItemKey>,
    default: 'value',
  },
  menuProps: {
    type: [String, Array, Object],
    default: () => defaultMenuProps,
  },
  multiple: Boolean,
  openOnClear: Boolean,
  returnObject: Boolean,
  smallChips: Boolean,
}

export const defaultMenuProps = {
  closeOnClick: false,
  closeOnContentClick: false,
  disableKeys: true,
  openOnClick: false,
  maxHeight: 304,
}

// Types
const baseMixins = mixins(
  VTextField,
  Comparable,
  Filterable
)

interface options extends InstanceType<typeof baseMixins> {
  $refs: {
    menu: InstanceType<typeof VMenu>
    label: HTMLElement
    input: HTMLInputElement
    'prepend-inner': HTMLElement
    'append-inner': HTMLElement
    prefix: HTMLElement
    suffix: HTMLElement
  }
}

/* @vue/component */
export function useVSelect(props: ExtractPropTypes<typeof VSelectProps>, context: SetupContext) {



  const data = reactive({
    cachedItems: props.cacheItems ? props.items : [],
    menuIsBooted: false,
    isMenuActive: false,
    lastItem: 20,
    // As long as a value is defined, show it
    // Otherwise, check if multiple
    // to determine which default to provide
    lazyValue: props.value !== undefined
      ? props.value
      : props.multiple ? [] : undefined,
    selectedIndex: -1,
    selectedItems: [] as any[],
    keyboardLookupPrefix: '',
    keyboardLookupLastTime: 0,
  }
  )

  const allItems: Ref<object[]> = computed(() => {
    return filterDuplicates(data.cachedItems.concat(props.items))
  })
  const classes: Ref<object> = computed(() => {
    return {
      ...VTextField.options.computed.classes.call(this),
      'v-select': true,
      'v-select--chips': hasChips.value,
      'v-select--chips--small': props.smallChips,
      'v-select--is-menu-active': data.isMenuActive,
      'v-select--is-multi': props.multiple,
    }
  })
  const computedItems: Ref<object[]> = computed(() => {
    return allItems.value
  })
  const computedOwns: Ref<string> = computed(() => {
    return `list-${props._uid}`
  })
  const computedCounterValue: Ref<number> = computed(() => {
    return props.multiple
      ? data.selectedItems.length
      : (getText(data.selectedItems[0]) || '').toString().length
  })
  const directives: Ref<VNodeDirective[] | undefined> = computed(() => {
    return props.isFocused ? [{
      name: 'click-outside',
      value: {
        handler: blur,
        closeConditional: closeConditional,
      },
    }] : undefined
  })
  const dynamicHeight: Ref<dynamicHeight () > = computed(() => {
    return 'auto'
  })
  const hasChips: Ref<boolean> = computed(() => {
    return props.chips || props.smallChips
  })
  const hasSlot: Ref<boolean> = computed(() => {
    return Boolean(hasChips.value || context.scopedSlots.selection)
  })
  const isDirty: Ref<boolean> = computed(() => {
    return data.selectedItems.length > 0
  })
  const listData: Ref<object> = computed(() => {
    const scopeId = context.vnode && (context.vnode.context!.$options as { [key: string]: any })._scopeId
    const attrs = scopeId ? {
      [scopeId]: true,
    } : {}

    return {
      attrs: {
        ...attrs,
        id: computedOwns.value,
      },
      props: {
        action: props.multiple,
        color: props.itemColor,
        dense: props.dense,
        hideSelected: props.hideSelected,
        items: virtualizedItems.value,
        itemDisabled: props.itemDisabled,
        itemText: props.itemText,
        itemValue: props.itemValue,
        noDataText: context.vuetify.lang.t(props.noDataText),
        selectedItems: data.selectedItems,
      },
      on: {
        select: selectItem,
      },
      scopedSlots: {
        item: context.scopedSlots.item,
      },
    }
  })
  const staticList: Ref<VNode> = computed(() => {
    if (context.slots['no-data'] || context.slots['prepend-item'] || context.slots['append-item']) {
      consoleError('assert: staticList should not be called if slots are used')
    }

    return context.createElement(VSelectList, listData.value)
  })
  const virtualizedItems: Ref<object[]> = computed(() => {
    return (context._menuProps as any).auto
      ? computedItems.value
      : computedItems.value.slice(0, data.lastItem)
  })
  const menuCanShow:: Ref<menuCanShow:> = computed(() => {
    $_menuProps(): object {
      let normalisedProps = typeof props.menuProps === 'string'
        ? props.menuProps.split(',')
        : props.menuProps

      if (Array.isArray(normalisedProps)) {
        normalisedProps = normalisedProps.reduce((acc, p) => {
          acc[p.trim()] = true
          return acc
        }, {})
      }

      return {
        ...defaultMenuProps,
        eager: props.eager,
        value: props.menuCanShow && data.isMenuActive,
        nudgeBottom: normalisedProps.offsetY ? 1 : 0, // convert to int
        ...normalisedProps,
      }
    })

  props.initialValue = val
  setSelectedItems()
})
watch(() => data.isMenuActive, (val) => {
  window.setTimeout(() => onMenuActiveChange(val))
})
watch(() => props.items, (val) => {
  {
  })

/** @public */
function blur(e?: Event) {
  VTextField.options.methods.blur.call(this, e)
  data.isMenuActive = false
  props.isFocused = false
  data.selectedIndex = -1
}
/** @public */
function activateMenu() {
  if (
    !props.isInteractive ||
    data.isMenuActive
  ) return

  data.isMenuActive = true
}
function clearableCallback() {
  setValue(props.multiple ? [] : undefined)
  setMenuIndex(-1)
  context.nextTick(() => context.refs.input && context.refs.input.focus())

  if (props.openOnClear) data.isMenuActive = true
}
function closeConditional(e: Event) {
  if (!data.isMenuActive) return true

  return (
    !props._isDestroyed &&

    // Click originates from outside the menu content
    // Multiple selects don't close when an item is clicked
    (!getContent() ||
      !getContent().contains(e.target as Node)) &&

    // Click originates from outside the element
    context.el &&
    !context.el.contains(e.target as Node) &&
    e.target !== context.el
  )
}
function filterDuplicates(arr: any[]) {
  const uniqueValues = new Map()
  for (let index = 0; index < arr.length; ++index) {
    const item = arr[index]
    const val = getValue(item)

    // TODO: comparator
    !uniqueValues.has(val) && uniqueValues.set(val, item)
  }
  return Array.from(uniqueValues.values())
}
function findExistingIndex(item: object) {
  const itemValue = getValue(item)

  return (props.internalValue || []).findIndex((i: object) => props.valueComparator(getValue(i), itemValue))
}
function getContent() {
  return context.refs.menu && context.refs.menu.$refs.content
}
function genChipSelection(item: object, index: number) {
  const isDisabled = (
    !props.isInteractive ||
    getDisabled(item)
  )

  return context.createElement(VChip, {
    staticClass: 'v-chip--select',
    attrs: { tabindex: -1 },
    props: {
      close: props.deletableChips && !isDisabled,
      disabled: isDisabled,
      inputValue: index === data.selectedIndex,
      small: props.smallChips,
    },
    on: {
      click: (e: MouseEvent) => {
        if (isDisabled) return

        e.stopPropagation()

        data.selectedIndex = index
      },
      'click:close': () => onChipInput(item),
    },
    key: JSON.stringify(getValue(item)),
  }, getText(item))
}
function genCommaSelection(item: object, index: number, last: boolean) {
  const color = index === data.selectedIndex && props.computedColor
  const isDisabled = (
    !props.isInteractive ||
    getDisabled(item)
  )

  return context.createElement('div', props.setTextColor(color, {
    staticClass: 'v-select__selection v-select__selection--comma',
    class: {
      'v-select__selection--disabled': isDisabled,
    },
    key: JSON.stringify(getValue(item)),
  }), `${getText(item)}${last ? '' : ', '}`)
}
function genDefaultSlot(): (VNode | VNode[] | null)[] {
  const selections = genSelections()
  const input = genInput()

  // If the return is an empty array
  // push the input
  if (Array.isArray(selections)) {
    selections.push(input)
    // Otherwise push it into children
  } else {
    selections.children = selections.children || []
    selections.children.push(input)
  }

  return [
    props.genFieldset(),
    context.createElement('div', {
      staticClass: 'v-select__slot',
      directives: directives.value,
    }, [
      props.genLabel(),
      props.prefix ? props.genAffix('prefix') : null,
      selections,
      props.suffix ? props.genAffix('suffix') : null,
      props.genClearIcon(),
      props.genIconSlot(),
      genHiddenInput(),
    ]),
    genMenu(),
    props.genProgress(),
  ]
}
function genIcon(
  type: string,
  cb?: (e: Event) => void,
  extraData?: VNodeData
) {
  const icon = VInput.options.methods.genIcon.call(this, type, cb, extraData)

  if (type === 'append') {
    // Don't allow the dropdown icon to be focused
    icon.children![0].data = mergeData(icon.children![0].data!, {
      attrs: {
        tabindex: icon.children![0].componentOptions!.listeners && '-1',
        'aria-hidden': 'true',
        'aria-label': undefined,
      },
    })
  }

  return icon
}
function genInput(): VNode {
  const input = VTextField.options.methods.genInput.call(this)

  delete input.data!.attrs!.name

  input.data = mergeData(input.data!, {
    domProps: { value: null },
    attrs: {
      readonly: true,
      type: 'text',
      'aria-readonly': String(props.isReadonly),
      'aria-activedescendant': getObjectValueByPath(context.refs.menu, 'activeTile.id'),
      autocomplete: getObjectValueByPath(input.data!, 'attrs.autocomplete', 'off'),
    },
    on: { keypress: onKeyPress },
  })

  return input
}
function genHiddenInput(): VNode {
  return context.createElement('input', {
    domProps: { value: data.lazyValue },
    attrs: {
      type: 'hidden',
      name: props.attrs$.name,
    },
  })
}
function genInputSlot(): VNode {
  const render = VTextField.options.methods.genInputSlot.call(this)

  render.data!.attrs = {
    ...render.data!.attrs,
    role: 'button',
    'aria-haspopup': 'listbox',
    'aria-expanded': String(data.isMenuActive),
    'aria-owns': computedOwns.value,
  }

  return render
}
function genList(): VNode {
  // If there's no slots, we can use a cached VNode to improve performance
  if (context.slots['no-data'] || context.slots['prepend-item'] || context.slots['append-item']) {
    return genListWithSlot()
  } else {
    return staticList.value
  }
}
function genListWithSlot(): VNode {
  const slots = ['prepend-item', 'no-data', 'append-item']
    .filter(slotName => context.slots[slotName])
    .map(slotName => context.createElement('template', {
      slot: slotName,
    }, context.slots[slotName]))
  // Requires destructuring due to Vue
  // modifying the `on` property when passed
  // as a referenced object
  return context.createElement(VSelectList, {
    ...listData.value,
  }, slots)
}
function genMenu(): VNode {
  const props = context._menuProps as any
  props.activator = context.refs['input-slot']

  // Attach to root el so that
  // menu covers prepend/append icons
  if (
    // TODO: make this a computed property or helper or something
    props.attach === '' || // If used as a boolean prop (<v-menu attach>)
    props.attach === true || // If bound to a boolean (<v-menu :attach="true">)
    props.attach === 'attach' // If bound as boolean prop in pug (v-menu(attach))
  ) {
    props.attach = context.el
  } else {
    props.attach = props.attach
  }

  return context.createElement(VMenu, {
    attrs: { role: undefined },
    props,
    on: {
      input: (val: boolean) => {
        data.isMenuActive = val
        props.isFocused = val
      },
      scroll: onScroll,
    },
    ref: 'menu',
  }, [genList()])
}
function genSelections(): VNode {
  let length = data.selectedItems.length
  const children = new Array(length)

  let genSelection
  if (context.scopedSlots.selection) {
    genSelection = genSlotSelection
  } else if (hasChips.value) {
    genSelection = genChipSelection
  } else {
    genSelection = genCommaSelection
  }

  while (length--) {
    children[length] = genSelection(
      data.selectedItems[length],
      length,
      length === children.length - 1
    )
  }

  return context.createElement('div', {
    staticClass: 'v-select__selections',
  }, children)
}
function genSlotSelection(item: object, index: number): VNode[] | undefined {
  return context.scopedSlots.selection!({
    attrs: {
      class: 'v-chip--select',
    },
    parent: this,
    item,
    index,
    select: (e: Event) => {
      e.stopPropagation()
      data.selectedIndex = index
    },
    selected: index === data.selectedIndex,
    disabled: !props.isInteractive,
  })
}
function getMenuIndex() {
  return context.refs.menu ? (context.refs.menu as { [key: string]: any }).listIndex : -1
}
function getDisabled(item: object) {
  return getPropertyFromItem(item, props.itemDisabled, false)
}
function getText(item: object) {
  return getPropertyFromItem(item, props.itemText, item)
}
function getValue(item: object) {
  return getPropertyFromItem(item, props.itemValue, getText(item))
}
function onBlur(e?: Event) {
  e && context.emit('blur', e)
}
function onChipInput(item: object) {
  if (props.multiple) selectItem(item)
  else setValue(null)
  // If all items have been deleted,
  // open `v-menu`
  if (data.selectedItems.length === 0) {
    data.isMenuActive = true
  } else {
    data.isMenuActive = false
  }
  data.selectedIndex = -1
}
function onClick(e: MouseEvent) {
  if (!props.isInteractive) return

  if (!isAppendInner(e.target)) {
    data.isMenuActive = true
  }

  if (!props.isFocused) {
    props.isFocused = true
    context.emit('focus')
  }

  context.emit('click', e)
}
function onEscDown(e: Event) {
  e.preventDefault()
  if (data.isMenuActive) {
    e.stopPropagation()
    data.isMenuActive = false
  }
}
function onKeyPress(e: KeyboardEvent) {
  if (
    props.multiple ||
    !props.isInteractive ||
    props.disableLookup
  ) return

  const KEYBOARD_LOOKUP_THRESHOLD = 1000 // milliseconds
  const now = performance.now()
  if (now - data.keyboardLookupLastTime > KEYBOARD_LOOKUP_THRESHOLD) {
    data.keyboardLookupPrefix = ''
  }
  data.keyboardLookupPrefix += e.key.toLowerCase()
  data.keyboardLookupLastTime = now

  const index = allItems.value.findIndex(item => {
    const text = (getText(item) || '').toString()

    return text.toLowerCase().startsWith(data.keyboardLookupPrefix)
  })
  const item = allItems.value[index]
  if (index !== -1) {
    data.lastItem = Math.max(data.lastItem, index + 5)
    setValue(props.returnObject ? item : getValue(item))
    context.nextTick(() => context.refs.menu.getTiles())
    setTimeout(() => setMenuIndex(index))
  }
}
function onKeyDown(e: KeyboardEvent) {
  if (props.isReadonly && e.keyCode !== keyCodes.tab) return

  const keyCode = e.keyCode
  const menu = context.refs.menu

  // If enter, space, open menu
  if ([
    keyCodes.enter,
    keyCodes.space,
  ].includes(keyCode)) activateMenu()

  context.emit('keydown', e)

  if (!menu) return

  // If menu is active, allow default
  // listIndex change from menu
  if (data.isMenuActive && keyCode !== keyCodes.tab) {
    context.nextTick(() => {
      menu.changeListIndex(e)
      context.emit('update:list-index', menu.listIndex)
    })
  }

  // If menu is not active, up and down can do
  // one of 2 things. If multiple, opens the
  // menu, if not, will cycle through all
  // available options
  if (
    !data.isMenuActive &&
    [keyCodes.up, keyCodes.down].includes(keyCode)
  ) return onUpDown(e)

  // If escape deactivate the menu
  if (keyCode === keyCodes.esc) return onEscDown(e)

  // If tab - select item or close menu
  if (keyCode === keyCodes.tab) return onTabDown(e)

  // If space preventDefault
  if (keyCode === keyCodes.space) return onSpaceDown(e)
}
function onMenuActiveChange(val: boolean) {
  // If menu is closing and mulitple
  // or menuIndex is already set
  // skip menu index recalculation
  if (
    (props.multiple && !val) ||
    getMenuIndex() > -1
  ) return

  const menu = context.refs.menu

  if (!menu || !isDirty.value) return

  // When menu opens, set index of first active item
  for (let i = 0; i < menu.tiles.length; i++) {
    if (menu.tiles[i].getAttribute('aria-selected') === 'true') {
      setMenuIndex(i)
      break
    }
  }
}
function onMouseUp(e: MouseEvent) {
  if (
    props.hasMouseDown &&
    e.which !== 3 &&
    props.isInteractive
  ) {
    // If append inner is present
    // and the target is itself
    // or inside, toggle menu
    if (isAppendInner(e.target)) {
      context.nextTick(() => (data.isMenuActive = !data.isMenuActive))
      // If user is clicking in the container
      // and field is enclosed, activate it
    } else if (props.isEnclosed) {
      data.isMenuActive = true
    }
  }

  VTextField.options.methods.onMouseUp.call(this, e)
}
function onScroll() {
  if (!data.isMenuActive) {
    requestAnimationFrame(() => (getContent().scrollTop = 0))
  } else {
    if (data.lastItem > computedItems.value.length) return

    const showMoreItems = (
      getContent().scrollHeight -
      (getContent().scrollTop +
        getContent().clientHeight)
    ) < 200

    if (showMoreItems) {
      data.lastItem += 20
    }
  }
}
function onSpaceDown(e: KeyboardEvent) {
  e.preventDefault()
}
function onTabDown(e: KeyboardEvent) {
  const menu = context.refs.menu

  if (!menu) return

  const activeTile = menu.activeTile

  // An item that is selected by
  // menu-index should toggled
  if (
    !props.multiple &&
    activeTile &&
    data.isMenuActive
  ) {
    e.preventDefault()
    e.stopPropagation()

    activeTile.click()
  } else {
    // If we make it here,
    // the user has no selected indexes
    // and is probably tabbing out
    blur(e)
  }
}
function onUpDown(e: KeyboardEvent) {
  const menu = context.refs.menu

  if (!menu) return

  e.preventDefault()

  // Multiple selects do not cycle their value
  // when pressing up or down, instead activate
  // the menu
  if (props.multiple) return activateMenu()

  const keyCode = e.keyCode

  // Cycle through available values to achieve
  // select native behavior
  menu.isBooted = true

  window.requestAnimationFrame(() => {
    menu.getTiles()
    keyCodes.up === keyCode ? menu.prevTile() : menu.nextTile()
    menu.activeTile && menu.activeTile.click()
  })
}
function selectItem(item: object) {
  if (!props.multiple) {
    setValue(props.returnObject ? item : getValue(item))
    data.isMenuActive = false
  } else {
    const internalValue = (props.internalValue || []).slice()
    const i = findExistingIndex(item)

    i !== -1 ? internalValue.splice(i, 1) : internalValue.push(item)
    setValue(internalValue.map((i: object) => {
      return props.returnObject ? i : getValue(i)
    }))

    // When selecting multiple
    // adjust menu after each
    // selection
    context.nextTick(() => {
      context.refs.menu &&
        (context.refs.menu as { [key: string]: any }).updateDimensions()
    })

    // We only need to reset list index for multiple
    // to keep highlight when an item is toggled
    // on and off
    if (!props.multiple) return

    const listIndex = getMenuIndex()

    setMenuIndex(-1)

    // There is no item to re-highlight
    // when selections are hidden
    if (props.hideSelected) return

    context.nextTick(() => setMenuIndex(listIndex))
  }
}
function setMenuIndex(index: number) {
  context.refs.menu && ((context.refs.menu as { [key: string]: any }).listIndex = index)
}
function setSelectedItems() {
  const selectedItems = []
  const values = !props.multiple || !Array.isArray(props.internalValue)
    ? [props.internalValue]
    : props.internalValue

  for (const value of values) {
    const index = allItems.value.findIndex(v => props.valueComparator(
      getValue(v),
      getValue(value)
    ))

    if (index > -1) {
      selectedItems.push(allItems.value[index])
    }
  }

  data.selectedItems = selectedItems
}
function setValue(value: any) {
  const oldValue = props.internalValue
  props.internalValue = value
  value !== oldValue && context.emit('change', value)
}
function isAppendInner(target: any) {
  // return true if append inner is present
  // and the target is itself or inside
  const appendInner = context.refs['append-inner']

  return appendInner && (appendInner === target || appendInner.contains(target))
}
return {
  allItems,
  classes,
  computedItems,
  computedOwns,
  computedCounterValue,
  directives,
  dynamicHeight,
  hasChips,
  hasSlot,
  isDirty,
  listData,
  staticList,
  virtualizedItems,
  menuCanShow:,
  blur,
  activateMenu,
  clearableCallback,
  closeConditional,
  filterDuplicates,
  findExistingIndex,
  getContent,
  genChipSelection,
  genCommaSelection,
  genDefaultSlot,
  genIcon,
    ,
  genInput,
  genHiddenInput,
  genInputSlot,
  genList,
  genListWithSlot,
  genMenu,
  genSelections,
  genSlotSelection,
  getMenuIndex,
  getDisabled,
  getText,
  getValue,
  onBlur,
  onChipInput,
  onClick,
  onEscDown,
  onKeyPress,
  onKeyDown,
  onMenuActiveChange,
  onMouseUp,
  onScroll,
  onSpaceDown,
  onTabDown,
  onUpDown,
  selectItem,
  setMenuIndex,
  setSelectedItems,
  setValue,
  isAppendInner,
}
}
const VSelect = defineComponent({
  name: 'v-select',
  props: VSelectProps,
  setup(props, context) {
    const { } = useVSelect(props, context)
  },
})

export default VSelect

