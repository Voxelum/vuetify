import { SelectItemKey } from 'types'
import { computed, defineComponent, ExtractPropTypes, h, PropType, Ref, SetupContext, VNode, VNodeArrayChildren } from 'vue'
import useColorable, { colorableProps } from '../../mixins/colorable'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Helpers
import {
  escapeHTML,
  getPropertyFromItem
} from '../../util/helpers'
// Components
import VSimpleCheckbox from '../VCheckbox/VSimpleCheckbox'
import VDivider from '../VDivider'
import {
  VList,
  VListItem,
  VListItemAction,
  VListItemContent,
  VListItemTitle
} from '../VList'
import VSubheader from '../VSubheader'





export const VSelectListProps = {
  ...colorableProps,
  ...themeableProps,
  action: Boolean,
  dense: Boolean,
  hideSelected: Boolean,
  items: {
    type: Array as PropType<any[]>,
    default: () => [],
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
  noDataText: String,
  noFilter: Boolean,
  searchInput: null as unknown as PropType<any>,
  selectedItems: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
}

type ListTile = { item: any, disabled?: null | boolean, value?: boolean, index: number };

/* @vue/component */
export function useVSelectList(props: ExtractPropTypes<typeof VSelectListProps>, context: SetupContext) {
  const { setTextColor } = useColorable(context)
  const { themeClasses } = useThemeable(props)

  const parsedItems: Ref<any[]> = computed(() => {
    return props.selectedItems.map(item => getValue(item))
  })
  const tileActiveClass: Ref<string> = computed(() => {
    return Object.keys(setTextColor(props.color).class || {}).join(' ')
  })
  const staticNoDataTile: Ref<VNode> = computed(() => {
    const tile = {
      role: undefined,
      onMousedown: (e: Event) => e.preventDefault(), // Prevent onBlur from being called
    }

    return h(VListItem, tile, [
      genTileContent(props.noDataText),
    ])
  })

  function genAction(item: object, inputValue: any): VNode {
    return h(VListItemAction, [
      h(VSimpleCheckbox, {
        props: {
          color: props.color,
          value: inputValue,
        },
        onInput: () => context.emit('select', item),
      }),
    ])
  }
  function genDivider(props: { [key: string]: any }) {
    return h(VDivider, { props })
  }
  function genFilteredText(text: string) {
    text = text || ''

    if (!props.searchInput || props.noFilter) return escapeHTML(text)

    const { start, middle, end } = getMaskedCharacters(text)

    return `${escapeHTML(start)}${genHighlight(middle)}${escapeHTML(end)}`
  }
  function genHeader(props: { [key: string]: any }): VNode {
    return h(VSubheader, { props }, props.header)
  }
  function genHighlight(text: string): string {
    return `<span class="v-list-item__mask">${escapeHTML(text)}</span>`
  }
  function getMaskedCharacters(text: string): {
    start: string
    middle: string
    end: string
  } {
    const searchInput = (props.searchInput || '').toString().toLocaleLowerCase()
    const index = text.toLocaleLowerCase().indexOf(searchInput)

    if (index < 0) return { start: '', middle: text, end: '' }

    const start = text.slice(0, index)
    const middle = text.slice(index, index + searchInput.length)
    const end = text.slice(index + searchInput.length)
    return { start, middle, end }
  }
  function genTile({
    item,
    index,
    disabled = null,
    value = false,
  }: ListTile): VNode | VNode[] | undefined {
    if (!value) value = hasItem(item)

    if (item === Object(item)) {
      disabled = disabled !== null
        ? disabled
        : getDisabled(item)
    }

    const tile = {
      attrs: {
        // Default behavior in list does not
        // contain aria-selected by default
        'aria-selected': String(value),
        id: `list-item-${props._uid}-${index}`,
        role: 'option',
      },
      on: {
        mousedown: (e: Event) => {
          // Prevent onBlur from being called
          e.preventDefault()
        },
        click: () => disabled || context.emit('select', item),
      },
      props: {
        activeClass: tileActiveClass.value,
        disabled,
        ripple: true,
        inputValue: value,
      },
    }

    if (!context.slots.item) {
      return h(VListItem, tile, [
        props.action && !props.hideSelected && props.items.length > 0
          ? genAction(item, value)
          : null,
        genTileContent(item, index),
      ])
    }

    const parent = this
    const scopedSlot = context.slots.item({
      parent,
      item,
      ...tile.attrs,
    })

    return needsTile(scopedSlot)
      ? h(VListItem, tile, scopedSlot)
      : scopedSlot
  }
  function genTileContent(item: any, index = 0): VNode {
    const innerHTML = genFilteredText(getText(item))

    return h(VListItemContent,
      [h(VListItemTitle, {
        domProps: { innerHTML },
      })]
    )
  }
  function hasItem(item: object) {
    return parsedItems.value.indexOf(getValue(item)) > -1
  }
  function needsTile(slot: VNode[] | undefined) {
    return slot!.length !== 1 ||
      slot![0].component == null ||
      slot![0].component.Ctor.options.name !== 'v-list-item'
  }
  function getDisabled(item: object) {
    return Boolean(getPropertyFromItem(item, props.itemDisabled, false))
  }
  function getText(item: object) {
    return String(getPropertyFromItem(item, props.itemText, item))
  }
  function getValue(item: object) {
    return getPropertyFromItem(item, props.itemValue, getText(item))
  }

  return {
    parsedItems,
    tileActiveClass,
    staticNoDataTile,
    genAction,
    genDivider,
    genFilteredText,
    genHeader,
    genHighlight,
    getMaskedCharacters,
    genTile,
    genTileContent,
    hasItem,
    needsTile,
    getDisabled,
    getText,
    getValue,
    themeClasses,
  }
}
const VSelectList = defineComponent({
  name: 'v-select-list',
  props: VSelectListProps,
  setup(props, context) {
    const { 
      themeClasses,
      genTile,
      genHeader,
      genDivider,
      hasItem,
      staticNoDataTile,
    } = useVSelectList(props, context)
    return () => {
      const children: VNodeArrayChildren = []
      const itemsLength = props.items?.length ?? 0
      for (let index = 0; index < itemsLength; index++) {
        const item = props.items[index]

        if (props.hideSelected &&
          hasItem(item)
        ) continue

        if (item == null) children.push(genTile({ item, index }))
        else if (item.header) children.push(genHeader(item))
        else if (item.divider) children.push(genDivider(item))
        else children.push(genTile({ item, index }))
      }

      children.length || children.push(context.slots['no-data']?.() || staticNoDataTile.value)

      context.slots['prepend-item'] && children.unshift(context.slots['prepend-item']?.())

      context.slots['append-item'] && children.push(context.slots['append-item']?.())

      return h(VList, {
        staticClass: 'v-select-list',
        class: themeClasses.value,
        role: 'listbox',
        tabindex: -1,
        dense: props.dense,
      }, children)
    }
  },
})

export default VSelectList

