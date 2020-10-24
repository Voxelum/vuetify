import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VDataTable.sass'

// Types
import { VNode, VNodeChildrenArrayContents, VNodeChildren } from 'vue'
import { PropValidator } from 'vue/types/options'
import {
  DataTableHeader,
  DataTableFilterFunction,
  DataScopeProps,
  DataOptions,
  DataPagination,
  DataTableCompareFunction,
  DataItemsPerPageOption,
  ItemGroup,
  RowClassFunction,
  DataTableItemProps,
} from 'vuetify/types'

// Components
import { VData } from '../VData'
import { VDataFooter, VDataIterator } from '../VDataIterator'
import VBtn from '../VBtn'
import VDataTableHeader from './VDataTableHeader'
// import VVirtualTable from './VVirtualTable'
import VIcon from '../VIcon'
import Row from './Row'
import RowGroup from './RowGroup'
import VSimpleCheckbox from '../VCheckbox/VSimpleCheckbox'
import VSimpleTable from './VSimpleTable'
import MobileRow from './MobileRow'

// Mixins
import Loadable from '../../mixins/loadable'

// Directives
import ripple from '../../directives/ripple'

// Helpers
import mixins from '../../util/mixins'
import { deepEqual, getObjectValueByPath, getPrefixedScopedSlots, getSlot, defaultFilter, camelizeObjectKeys, getPropertyFromItem } from '../../util/helpers'
import { breaking } from '../../util/console'
import { mergeClasses } from '../../util/mergeData'
export const VDataTableProps = {
    headers: {
      type: Array,
      default: () => [],
    } as PropValidator<DataTableHeader[]>,
    showSelect: Boolean,
    showExpand: Boolean,
    showGroupBy: Boolean,
    // TODO: Fix
    // virtualRows: Boolean,
    height: [Number, String],
    hideDefaultHeader: Boolean,
    caption: String,
    dense: Boolean,
    headerProps: Object,
    calculateWidths: Boolean,
    fixedHeader: Boolean,
    headersLength: Number,
    expandIcon: {
      type: String,
      default: '$expand',
    },
    customFilter: {
      type: Function,
      default: defaultFilter,
    } as PropValidator<typeof defaultFilter>,
    itemClass: {
      type: [String, Function],
      default: () => '',
    } as PropValidator<RowClassFunction | string>,
    loaderHeight: {
      type: [Number, String],
      default: 4,
    },
}

function filterFn (item: any, search: string | null, filter: DataTableFilterFunction) {
  return (header: DataTableHeader) => {
    const value = getObjectValueByPath(item, header.value)
    return header.filter ? header.filter(value, search, item) : filter(value, search, item)
  }
}

function searchTableItems (
  items: any[],
  search: string | null,
  headersWithCustomFilters: DataTableHeader[],
  headersWithoutCustomFilters: DataTableHeader[],
  customFilter: DataTableFilterFunction
) {
  search = typeof search === 'string' ? search.trim() : null

  return items.filter(item => {
    // Headers with custom filters are evaluated whether or not a search term has been provided.
    // We need to match every filter to be included in the results.
    const matchesColumnFilters = headersWithCustomFilters.every(filterFn(item, search, defaultFilter))

    // Headers without custom filters are only filtered by the `search` property if it is defined.
    // We only need a single column to match the search term to be included in the results.
    const matchesSearchTerm = !search || headersWithoutCustomFilters.some(filterFn(item, search, customFilter))

    return matchesColumnFilters && matchesSearchTerm
  })
}

/* @vue/component */
  VDataIterator,
  Loadable,
export function useVDataTable(props: ExtractPropTypes<typeof VDataTableProps>, context: SetupContext) {



  const data = reactive({
      internalGroupBy: [] as string[],
      openCache: {} as { [key: string]: boolean },
      widths: [] as number[],
    }
)

    const computedHeaders: Ref<DataTableHeader[]> = computed(() => {
      if (!props.headers) return []
      const headers = props.headers.filter(h => h.value === undefined || !data.internalGroupBy.find(v => v === h.value))
      const defaultHeader = { text: '', sortable: false, width: '1px' }

      if (props.showSelect) {
        const index = headers.findIndex(h => h.value === 'data-table-select')
        if (index < 0) headers.unshift({ ...defaultHeader, value: 'data-table-select' })
        else headers.splice(index, 1, { ...defaultHeader, ...headers[index] })
      }

      if (props.showExpand) {
        const index = headers.findIndex(h => h.value === 'data-table-expand')
        if (index < 0) headers.unshift({ ...defaultHeader, value: 'data-table-expand' })
        else headers.splice(index, 1, { ...defaultHeader, ...headers[index] })
      }

      return headers
    })
    const colspanAttrs: Ref<object | undefined> = computed(() => {
      return props.isMobile ? undefined : {
        colspan: props.headersLength || computedHeaders.value.length,
      }
    })
    const columnSorters: Ref<Record<string, DataTableCompareFunction>> = computed(() => {
      return computedHeaders.value.reduce<Record<string, DataTableCompareFunction>>((acc, header) => {
        if (header.sort) acc[header.value] = header.sort
        return acc
      }, {})
    })
    const headersWithCustomFilters: Ref<DataTableHeader[]> = computed(() => {
      return props.headers.filter(header => header.filter && (!header.hasOwnProperty('filterable') || header.filterable === true))
    })
    const headersWithoutCustomFilters: Ref<DataTableHeader[]> = computed(() => {
      return props.headers.filter(header => !header.filter && (!header.hasOwnProperty('filterable') || header.filterable === true))
    })
    const sanitizedHeaderProps: Ref<Record<string, any>> = computed(() => {
      return camelizeObjectKeys(props.headerProps)
    })
    const computedItemsPerPage: Ref<number> = computed(() => {
      const itemsPerPage = props.options && props.options.itemsPerPage ? props.options.itemsPerPage : props.itemsPerPage
      const itemsPerPageOptions: DataItemsPerPageOption[] | undefined = props.sanitizedFooterProps.itemsPerPageOptions

      if (
        itemsPerPageOptions &&
        !itemsPerPageOptions.find(item => typeof item === 'number' ? item === itemsPerPage : item.value === itemsPerPage)
      ) {
        const firstOption = itemsPerPageOptions[0]
        return typeof firstOption === 'object' ? firstOption.value : firstOption
      }

      return itemsPerPage
    })

    const breakingProps = [
      ['sort-icon', 'header-props.sort-icon'],
      ['hide-headers', 'hide-default-header'],
      ['select-all', 'show-select'],
    ]

    /* istanbul ignore next */
    breakingProps.forEach(([original, replacement]) => {
      if (context.attrs.hasOwnProperty(original)) breaking(original, replacement, this)
    })

  onMounted(() => {
    // if ((!props.sortBy || !props.sortBy.length) && (!props.options.sortBy || !props.options.sortBy.length)) {
    //   const firstSortable = props.headers.find(h => !('sortable' in h) || !!h.sortable)
    //   if (firstSortable) props.updateOptions({ sortBy: [firstSortable.value], sortDesc: [false] })
    // }

    if (props.calculateWidths) {
      window.addEventListener('resize', calcWidths)
      calcWidths()
    }
  })

  onBeforeUnmount(() => {
    if (props.calculateWidths) {
      window.removeEventListener('resize', calcWidths)
    }
  })

  function calcWidths () {
      data.widths = Array.from(context.el.querySelectorAll('th')).map(e => e.clientWidth)
    }
  function customFilterWithColumns (items: any[], search: string) {
      return searchTableItems(items, search, headersWithCustomFilters.value, headersWithoutCustomFilters.value, props.customFilter)
    }
  function customSortWithHeaders (items: any[], sortBy: string[], sortDesc: boolean[], locale: string) {
      return props.customSort(items, sortBy, sortDesc, locale, columnSorters.value)
    }
  function createItemProps (item: any): DataTableItemProps {
      const props = VDataIterator.options.methods.createItemProps.call(this, item)

      return Object.assign(props, { headers: computedHeaders.value })
    }
  function genCaption (props: DataScopeProps) {
      if (props.caption) return [context.createElement('caption', [props.caption])]

      return getSlot(this, 'caption', props, true)
    }
  function genColgroup (props: DataScopeProps) {
      return context.createElement('colgroup', computedHeaders.value.map(header => {
        return context.createElement('col', {
          class: {
            divider: header.divider,
          },
        })
      }))
    }
  function genLoading () {
      const th = context.createElement('th', {
        staticClass: 'column',
        attrs: colspanAttrs.value,
      }, [props.genProgress()])

      const tr = context.createElement('tr', {
        staticClass: 'v-data-table__progress',
      }, [th])

      return context.createElement('thead', [tr])
    }
  function genHeaders (props: DataScopeProps) {
      const data = {
        props: {
          ...sanitizedHeaderProps.value,
          headers: computedHeaders.value,
          options: props.options,
          mobile: props.isMobile,
          showGroupBy: props.showGroupBy,
          someItems: props.someItems,
          everyItem: props.everyItem,
          singleSelect: props.singleSelect,
          disableSort: props.disableSort,
        },
        on: {
          sort: props.sort,
          group: props.group,
          'toggle-select-all': props.toggleSelectAll,
        },
      }

      const children: VNodeChildrenArrayContents = [getSlot(this, 'header', data)]

      if (!props.hideDefaultHeader) {
        const scopedSlots = getPrefixedScopedSlots('header.', context.scopedSlots)
        children.push(context.createElement(VDataTableHeader, {
          ...data,
          scopedSlots,
        }))
      }

      if (props.loading) children.push(genLoading())

      return children
    }
  function genEmptyWrapper (content: VNodeChildrenArrayContents) {
      return context.createElement('tr', {
        staticClass: 'v-data-table__empty-wrapper',
      }, [
        context.createElement('td', {
          attrs: colspanAttrs.value,
        }, content),
      ])
    }
  function genItems (items: any[], props: DataScopeProps) {
      const empty = props.genEmpty(props.originalItemsLength, props.pagination.itemsLength)
      if (empty) return [empty]

      return props.groupedItems
        ? genGroupedRows(props.groupedItems, props)
        : genRows(items, props)
    }
  function genGroupedRows (groupedItems: ItemGroup<any>[], props: DataScopeProps) {
      return groupedItems.map(group => {
        if (!data.openCache.hasOwnProperty(group.name)) context.set(data.openCache, group.name, true)

        if (context.scopedSlots.group) {
          return context.scopedSlots.group({
            group: group.name,
            options: props.options,
            items: group.items,
            headers: computedHeaders.value,
          })
        } else {
          return genDefaultGroupedRow(group.name, group.items, props)
        }
      })
    }
  function genDefaultGroupedRow (group: string, items: any[], props: DataScopeProps) {
      const isOpen = !!data.openCache[group]
      const children: VNodeChildren = [
        context.createElement('template', { slot: 'row.content' }, genRows(items, props)),
      ]
      const toggleFn = () => context.set(data.openCache, group, !data.openCache[group])
      const removeFn = () => props.updateOptions({ groupBy: [], groupDesc: [] })

      if (context.scopedSlots['group.header']) {
        children.unshift(context.createElement('template', { slot: 'column.header' }, [
          context.scopedSlots['group.header']!({ group, groupBy: props.options.groupBy, items, headers: computedHeaders.value, isOpen, toggle: toggleFn, remove: removeFn }),
        ]))
      } else {
        const toggle = context.createElement(VBtn, {
          staticClass: 'ma-0',
          props: {
            icon: true,
            small: true,
          },
          on: {
            click: toggleFn,
          },
        }, [context.createElement(VIcon, [isOpen ? '$minus' : '$plus'])])

        const remove = context.createElement(VBtn, {
          staticClass: 'ma-0',
          props: {
            icon: true,
            small: true,
          },
          on: {
            click: removeFn,
          },
        }, [context.createElement(VIcon, ['$close'])])

        const column = context.createElement('td', {
          staticClass: 'text-start',
          attrs: colspanAttrs.value,
        }, [toggle, `${props.options.groupBy[0]}: ${group}`, remove])

        children.unshift(context.createElement('template', { slot: 'column.header' }, [column]))
      }

      if (context.scopedSlots['group.summary']) {
        children.push(context.createElement('template', { slot: 'column.summary' }, [
          context.scopedSlots['group.summary']!({ group, groupBy: props.options.groupBy, items, headers: computedHeaders.value, isOpen, toggle: toggleFn }),
        ]))
      }

      return context.createElement(RowGroup, {
        key: group,
        props: {
          value: isOpen,
        },
      }, children)
    }
  function genRows (items: any[], props: DataScopeProps) {
      return context.scopedSlots.item ? genScopedRows(items, props) : genDefaultRows(items, props)
    }
  function genScopedRows (items: any[], props: DataScopeProps) {
      const rows = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        rows.push(context.scopedSlots.item!({
          ...createItemProps(item),
          index: i,
        }))

        if (props.isExpanded(item)) {
          rows.push(context.scopedSlots['expanded-item']!({ item, headers: computedHeaders.value }))
        }
      }

      return rows
    }
  function genDefaultRows (items: any[], props: DataScopeProps) {
      return context.scopedSlots['expanded-item']
        ? items.map(item => genDefaultExpandedRow(item))
        : items.map(item => genDefaultSimpleRow(item))
    }
  function genDefaultExpandedRow (item: any): VNode {
      const isExpanded = props.isExpanded(item)
      const classes = {
        'v-data-table__expanded v-data-table__expanded__row': isExpanded,
      }
      const headerRow = genDefaultSimpleRow(item, classes)
      const expandedRow = context.createElement('tr', {
        staticClass: 'v-data-table__expanded v-data-table__expanded__content',
      }, [context.scopedSlots['expanded-item']!({ item, headers: computedHeaders.value })])

      return context.createElement(RowGroup, {
        props: {
          value: isExpanded,
        },
      }, [
        context.createElement('template', { slot: 'row.header' }, [headerRow]),
        context.createElement('template', { slot: 'row.content' }, [expandedRow]),
      ])
    }
  function genDefaultSimpleRow (item: any, classes: Record<string, boolean> = {}): VNode {
      const scopedSlots = getPrefixedScopedSlots('item.', context.scopedSlots)

      const data = createItemProps(item)

      if (props.showSelect) {
        const slot = scopedSlots['data-table-select']
        scopedSlots['data-table-select'] = slot ? () => slot(data) : () => context.createElement(VSimpleCheckbox, {
          staticClass: 'v-data-table__checkbox',
          props: {
            value: data.isSelected,
            disabled: !props.isSelectable(item),
          },
          on: {
            input: (val: boolean) => data.select(val),
          },
        })
      }

      if (props.showExpand) {
        const slot = scopedSlots['data-table-expand']
        scopedSlots['data-table-expand'] = slot ? () => slot(data) : () => context.createElement(VIcon, {
          staticClass: 'v-data-table__expand-icon',
          class: {
            'v-data-table__expand-icon--active': data.isExpanded,
          },
          on: {
            click: (e: MouseEvent) => {
              e.stopPropagation()
              data.expand(!data.isExpanded)
            },
          },
        }, [props.expandIcon])
      }

      return context.createElement(props.isMobile ? MobileRow : Row, {
        key: getObjectValueByPath(item, props.itemKey),
        class: mergeClasses(
          { ...classes, 'v-data-table__selected': data.isSelected },
          getPropertyFromItem(item, props.itemClass)
        ),
        props: {
          headers: computedHeaders.value,
          hideDefaultHeader: props.hideDefaultHeader,
          item,
          rtl: context.vuetify.rtl,
        },
        scopedSlots,
        on: {
          // TODO: for click, the first argument should be the event, and the second argument should be data,
          // but this is a breaking change so it's for v3
          click: () => context.emit('click:row', item, data),
          contextmenu: (event: MouseEvent) => context.emit('contextmenu:row', event, data),
          dblclick: (event: MouseEvent) => context.emit('dblclick:row', event, data),
        },
      })
    }
  function genBody (props: DataScopeProps): VNode | string | VNodeChildren {
      const data = {
        ...props,
        expand: props.expand,
        headers: computedHeaders.value,
        isExpanded: props.isExpanded,
        isMobile: props.isMobile,
        isSelected: props.isSelected,
        select: props.select,
      }

      if (context.scopedSlots.body) {
        return context.scopedSlots.body!(data)
      }

      return context.createElement('tbody', [
        getSlot(this, 'body.prepend', data, true),
        genItems(props.items, props),
        getSlot(this, 'body.append', data, true),
      ])
    }
  function genFooters (props: DataScopeProps) {
      const data = {
        props: {
          options: props.options,
          pagination: props.pagination,
          itemsPerPageText: '$vuetify.dataTable.itemsPerPageText',
          ...props.sanitizedFooterProps,
        },
        on: {
          'update:options': (value: any) => props.updateOptions(value),
        },
        widths: data.widths,
        headers: computedHeaders.value,
      }

      const children: VNodeChildren = [
        getSlot(this, 'footer', data, true),
      ]

      if (!props.hideDefaultFooter) {
        children.push(context.createElement(VDataFooter, {
          ...data,
          scopedSlots: getPrefixedScopedSlots('footer.', context.scopedSlots),
        }))
      }

      return children
    }
  function genDefaultScopedSlot (props: DataScopeProps): VNode {
      const simpleProps = {
        height: props.height,
        fixedHeader: props.fixedHeader,
        dense: props.dense,
      }

      // if (props.virtualRows) {
      //   return context.createElement(VVirtualTable, {
      //     props: Object.assign(simpleProps, {
      //       items: props.items,
      //       height: props.height,
      //       rowHeight: props.dense ? 24 : 48,
      //       headerHeight: props.dense ? 32 : 48,
      //       // TODO: expose rest of props from virtual table?
      //     }),
      //     scopedSlots: {
      //       items: ({ items }) => genItems(items, props) as any,
      //     },
      //   }, [
      //     proxySlot('body.before', [genCaption(props), genHeaders(props)]),
      //     proxySlot('bottom', genFooters(props)),
      //   ])
      // }

      return context.createElement(VSimpleTable, {
        props: simpleProps,
      }, [
        proxySlot('top', getSlot(this, 'top', props, true)),
        genCaption(props),
        genColgroup(props),
        genHeaders(props),
        genBody(props),
        proxySlot('bottom', genFooters(props)),
      ])
    }
  function proxySlot (slot: string, content: VNodeChildren) {
      return context.createElement('template', { slot }, content)
    }

  return {
    computedHeaders,
    colspanAttrs,
    columnSorters,
    headersWithCustomFilters,
    headersWithoutCustomFilters,
    sanitizedHeaderProps,
    computedItemsPerPage,
    calcWidths,
    customFilterWithColumns,
    customSortWithHeaders,
    createItemProps,
    genCaption,
    genColgroup,
    genLoading,
    genHeaders,
    genEmptyWrapper,
    genItems,
    genGroupedRows,
    genDefaultGroupedRow,
    genRows,
    genScopedRows,
    genDefaultRows,
    genDefaultExpandedRow,
    genDefaultSimpleRow,
    genBody,
    genFooters,
    genDefaultScopedSlot,
    proxySlot,
  }
}
const VDataTable = defineComponent({
  name: 'v-data-table',
  props: VDataTableProps,
  setup(props, context) {
    const {} = useVDataTable(props, context)
  },
})

export default VDataTable

