import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Components
import { VData } from '../VData'
import VDataFooter from './VDataFooter'

// Mixins
import Mobile from '../../mixins/mobile'
import Themeable from '../../mixins/themeable'

// Helpers
import mixins from '../../util/mixins'
import { deepEqual, getObjectValueByPath, getPrefixedScopedSlots, getSlot, camelizeObjectKeys } from '../../util/helpers'
import { breaking, removed } from '../../util/console'

// Types
import { VNode, VNodeChildren } from 'vue'
import { PropValidator } from 'vue/types/options'
import { DataItemProps, DataScopeProps } from 'vuetify/types'
export const VDataIteratorProps = {
    ...VData.options.props, // TODO: filter out props not used
    itemKey: {
      type: String,
      default: 'id',
    },
    value: {
      type: Array,
      default: () => [],
    } as PropValidator<any[]>,
    singleSelect: Boolean,
    expanded: {
      type: Array,
      default: () => [],
    } as PropValidator<any[]>,
    mobileBreakpoint: {
      ...Mobile.options.props.mobileBreakpoint,
      default: 600,
    },
    singleExpand: Boolean,
    loading: [Boolean, String],
    noResultsText: {
      type: String,
      default: '$vuetify.dataIterator.noResultsText',
    },
    noDataText: {
      type: String,
      default: '$vuetify.noDataText',
    },
    loadingText: {
      type: String,
      default: '$vuetify.dataIterator.loadingText',
    },
    hideDefaultFooter: Boolean,
    footerProps: Object,
    selectableKey: {
      type: String,
      default: 'isSelectable',
    },
}

/* @vue/component */
  Mobile,
  Themeable
export function useVDataIterator(props: ExtractPropTypes<typeof VDataIteratorProps>, context: SetupContext) {


  const data = reactive({
    selection: {} as Record<string, any>,
    expansion: {} as Record<string, boolean>,
    internalCurrentItems: [] as any[],
  })

    const everyItem: Ref<boolean> = computed(() => {
      return !!selectableItems.value.length && selectableItems.value.every((i: any) => isSelected(i))
    })
    const someItems: Ref<boolean> = computed(() => {
      return selectableItems.value.some((i: any) => isSelected(i))
    })
    const sanitizedFooterProps: Ref<Record<string, any>> = computed(() => {
      return camelizeObjectKeys(props.footerProps)
    })
    const selectableItems: Ref<any[]> = computed(() => {
      return data.internalCurrentItems.filter(item => isSelectable(item))
    })

watch(props, (value: any[]) => {
        data.selection = value.reduce((selection, item) => {
          selection[getObjectValueByPath(item, props.itemKey)] = item
          return selection
{
      immediate: true,
})
watch(() => data.selection, (value: Record<string, boolean>, old: Record<string, boolean>) => {
      if (deepEqual(Object.keys(value), Object.keys(old))) return

      context.emit('input', Object.values(value))
})
watch(() => props.expanded, (value: any[]) => {
{
      immediate: true,
})
watch(() => data.expansion, (value: Record<string, boolean>, old: Record<string, boolean>) => {
      if (deepEqual(value, old)) return
      const keys = Object.keys(value).filter(k => value[k])
      const expanded = !keys.length ? [] : props.items.filter(i => keys.includes(String(getObjectValueByPath(i, props.itemKey))))
      context.emit('update:expanded', expanded)
})

    const breakingProps = [
      ['disable-initial-sort', 'sort-by'],
      ['filter', 'custom-filter'],
      ['pagination', 'options'],
      ['total-items', 'server-items-length'],
      ['hide-actions', 'hide-default-footer'],
      ['rows-per-page-items', 'footer-props.items-per-page-options'],
      ['rows-per-page-text', 'footer-props.items-per-page-text'],
      ['prev-icon', 'footer-props.prev-icon'],
      ['next-icon', 'footer-props.next-icon'],
    ]

    /* istanbul ignore next */
    breakingProps.forEach(([original, replacement]) => {
      if (context.attrs.hasOwnProperty(original)) breaking(original, replacement, this)
    })

    const removedProps = [
      'expand',
      'content-class',
      'content-props',
      'content-tag',
    ]

    /* istanbul ignore next */
    removedProps.forEach(prop => {
      if (context.attrs.hasOwnProperty(prop)) removed(prop)
    })

  function toggleSelectAll (value: boolean): void {
      const selection = Object.assign({}, data.selection)

      for (let i = 0; i < selectableItems.value.length; i++) {
        const item = selectableItems.value[i]

        if (!isSelectable(item)) continue

        const key = getObjectValueByPath(item, props.itemKey)
        if (value) selection[key] = item
        else delete selection[key]
      }

      data.selection = selection
      context.emit('toggle-select-all', { items: data.internalCurrentItems, value })
    }
  function isSelectable (item: any): boolean {
      return getObjectValueByPath(item, props.selectableKey) !== false
    }
  function isSelected (item: any): boolean {
      return !!data.selection[getObjectValueByPath(item, props.itemKey)] || false
    }
  function select (item: any, value = true, emit = true): void {
      if (!isSelectable(item)) return

      const selection = props.singleSelect ? {} : Object.assign({}, data.selection)
      const key = getObjectValueByPath(item, props.itemKey)

      if (value) selection[key] = item
      else delete selection[key]

      if (props.singleSelect && emit) {
        const keys = Object.keys(data.selection)
        const old = keys.length && getObjectValueByPath(data.selection[keys[0]], props.itemKey)
        old && old !== key && context.emit('item-selected', { item: data.selection[old], value: false })
      }
      data.selection = selection
      emit && context.emit('item-selected', { item, value })
    }
  function isExpanded (item: any): boolean {
      return data.expansion[getObjectValueByPath(item, props.itemKey)] || false
    }
  function expand (item: any, value = true): void {
      const expansion = props.singleExpand ? {} : Object.assign({}, data.expansion)
      const key = getObjectValueByPath(item, props.itemKey)

      if (value) expansion[key] = true
      else delete expansion[key]

      data.expansion = expansion
      context.emit('item-expanded', { item, value })
    }
  function createItemProps (item: any): DataItemProps {
      return {
        item,
        select: (v: boolean) => select(item, v),
        isSelected: isSelected(item),
        expand: (v: boolean) => expand(item, v),
        isExpanded: isExpanded(item),
        isMobile: props.isMobile,
      }
    }
  function genEmptyWrapper (content: VNodeChildren) {
      return context.createElement('div', content)
    }
  function genEmpty (originalItemsLength: number, filteredItemsLength: number) {
      if (originalItemsLength === 0 && props.loading) {
        const loading = context.slots['loading'] || context.vuetify.lang.t(props.loadingText)
        return genEmptyWrapper(loading)
      } else if (originalItemsLength === 0) {
        const noData = context.slots['no-data'] || context.vuetify.lang.t(props.noDataText)
        return genEmptyWrapper(noData)
      } else if (filteredItemsLength === 0) {
        const noResults = context.slots['no-results'] || context.vuetify.lang.t(props.noResultsText)
        return genEmptyWrapper(noResults)
      }

      return null
    }
  function genItems (props: DataScopeProps) {
      const empty = genEmpty(props.originalItemsLength, props.pagination.itemsLength)
      if (empty) return [empty]

      if (context.scopedSlots.default) {
        return context.scopedSlots.default({
          ...props,
          isSelected: isSelected,
          select: select,
          isExpanded: isExpanded,
          expand: expand,
        })
      }

      if (context.scopedSlots.item) {
        return props.items.map((item: any) => context.scopedSlots.item!(createItemProps(item)))
      }

      return []
    }
  function genFooter (props: DataScopeProps) {
      if (props.hideDefaultFooter) return null

      const data = {
        props: {
          ...sanitizedFooterProps.value,
          options: props.options,
          pagination: props.pagination,
        },
        on: {
          'update:options': (value: any) => props.updateOptions(value),
        },
      }

      const scopedSlots = getPrefixedScopedSlots('footer.', context.scopedSlots)

      return context.createElement(VDataFooter, {
        scopedSlots,
        ...data,
      })
    }
  function genDefaultScopedSlot (props: any) {
      const outerProps = {
        ...props,
        someItems: someItems.value,
        everyItem: everyItem.value,
        toggleSelectAll: toggleSelectAll,
      }

      return context.createElement('div', {
        staticClass: 'v-data-iterator',
      }, [
        getSlot(this, 'header', outerProps, true),
        genItems(props),
        genFooter(props),
        getSlot(this, 'footer', outerProps, true),
      ])
    }

  return {
    everyItem,
    someItems,
    sanitizedFooterProps,
    selectableItems,
    toggleSelectAll,
    isSelectable,
    isSelected,
    select,
    isExpanded,
    expand,
    createItemProps,
    genEmptyWrapper,
    genEmpty,
    genItems,
    genFooter,
    genDefaultScopedSlot,
  }
}
const VDataIterator = defineComponent({
  name: 'v-data-iterator',
  props: VDataIteratorProps,
  setup(props, context) {
    const {} = useVDataIterator(props, context)
  },
})

export default VDataIterator

