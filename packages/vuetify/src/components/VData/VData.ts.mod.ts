import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Helpers
import { wrapInArray, sortItems, deepEqual, groupItems, searchItems, fillArray } from '../../util/helpers'
import Vue, { VNode } from 'vue'

// Types
import {
  DataOptions,
  DataPagination,
  DataScopeProps,
  DataSortFunction,
  DataGroupFunction,
  DataSearchFunction,
  ItemGroup,
} from 'vuetify/types'
import { PropValidator } from 'vue/types/options'
export const VDataProps = {
}

export default export function useVData(props: ExtractPropTypes<typeof VDataProps>, context: SetupContext) {


  const data = reactive({
    let internalOptions: DataOptions = {
      page: data.page,
      itemsPerPage: data.itemsPerPage,
      sortBy: wrapInArray(data.sortBy),
      sortDesc: wrapInArray(data.sortDesc),
      groupBy: wrapInArray(data.groupBy),
      groupDesc: wrapInArray(data.groupDesc),
      mustSort: data.mustSort,
      multiSort: data.multiSort,
    }
    if (props.options) {
      internalOptions = Object.assign(internalOptions, props.options)
    }
    const { sortBy, sortDesc, groupBy, groupDesc } = internalOptions
    const sortDiff = sortBy.length - sortDesc.length
    const groupDiff = groupBy.length - groupDesc.length
    if (sortDiff > 0) {
      internalOptions.sortDesc.push(...fillArray(sortDiff, false))
    }
    if (groupDiff > 0) {
      internalOptions.groupDesc.push(...fillArray(groupDiff, false))
    }
      internalOptions,
    }
)

    const itemsLength: Ref<number> = computed(() => {
      return props.serverItemsLength >= 0 ? props.serverItemsLength : filteredItems.value.length
    })
    const pageCount: Ref<number> = computed(() => {
      return props.internalOptions.itemsPerPage <= 0
        ? 1
        : Math.ceil(itemsLength.value / props.internalOptions.itemsPerPage)
    })
    const pageStart: Ref<number> = computed(() => {
      if (props.internalOptions.itemsPerPage === -1 || !props.items.length) return 0

      return (props.internalOptions.page - 1) * props.internalOptions.itemsPerPage
    })
    const pageStop: Ref<number> = computed(() => {
      if (props.internalOptions.itemsPerPage === -1) return itemsLength.value
      if (!props.items.length) return 0

      return Math.min(itemsLength.value, props.internalOptions.page * props.internalOptions.itemsPerPage)
    })
    const isGrouped: Ref<boolean> = computed(() => {
      return !!props.internalOptions.groupBy.length
    })
    const pagination: Ref<DataPagination> = computed(() => {
      return {
        page: props.internalOptions.page,
        itemsPerPage: props.internalOptions.itemsPerPage,
        pageStart: pageStart.value,
        pageStop: pageStop.value,
        pageCount: pageCount.value,
        itemsLength: itemsLength.value,
      }
    })
    const filteredItems: Ref<any[]> = computed(() => {
      let items = props.items.slice()

      if (!props.disableFiltering && props.serverItemsLength <= 0) {
        items = props.customFilter(items, props.search)
      }

      return items
    })
    const computedItems: Ref<any[]> = computed(() => {
      let items = filteredItems.value.slice()

      if (!props.disableSort && props.serverItemsLength <= 0) {
        items = sortItems(items)
      }

      if (!props.disablePagination && props.serverItemsLength <= 0) {
        items = paginateItems(items)
      }

      return items
    })
    const groupedItems: Ref<ItemGroup<any>[] | null> = computed(() => {
      return isGrouped.value ? groupItems(computedItems.value) : null
    })
    const scopedProps: Ref<DataScopeProps> = computed(() => {
      const props = {
        sort: sort,
        sortArray: sortArray,
        group: group,
        items: computedItems.value,
        options: props.internalOptions,
        updateOptions: updateOptions,
        pagination: pagination.value,
        groupedItems: groupedItems.value,
        originalItemsLength: props.items.length,
      }

      return props
    })
    const computedOptions: Ref<DataOptions> = computed(() => {
      return { ...props.options } as DataOptions
    })

watch(computedOptions, (options: DataOptions, old: DataOptions) => {
        if (deepEqual(options, old)) return

        updateOptions(options)
      },
      deep: true,
      immediate: true,
    },
    internalOptions: {
      handler (options: DataOptions, old: DataOptions) {
        if (deepEqual(options, old)) return
        context.emit('update:options', options)
      },
      deep: true,
{
      deep: true,
      immediate: true,
})
        if (deepEqual(options, old)) return
        context.emit('update:options', options)
      },
      deep: true,
{
      deep: true,
      immediate: true,
})
watch(() => data.page, (page: number) => {
      updateOptions({ page })
})
      context.emit('update:page', page)
})
watch(() => data.itemsPerPage, (itemsPerPage: number) => {
      updateOptions({ itemsPerPage })
})
      context.emit('update:items-per-page', itemsPerPage)
})
watch(() => data.sortBy, (sortBy: string | string[]) => {
      updateOptions({ sortBy: wrapInArray(sortBy) })
})
      !deepEqual(sortBy, old) && context.emit('update:sort-by', Array.isArray(data.sortBy) ? sortBy : sortBy[0])
})
watch(() => data.sortDesc, (sortDesc: boolean | boolean[]) => {
      updateOptions({ sortDesc: wrapInArray(sortDesc) })
})
      !deepEqual(sortDesc, old) && context.emit('update:sort-desc', Array.isArray(data.sortDesc) ? sortDesc : sortDesc[0])
})
watch(() => data.groupBy, (groupBy: string | string[]) => {
      updateOptions({ groupBy: wrapInArray(groupBy) })
})
      !deepEqual(groupBy, old) && context.emit('update:group-by', Array.isArray(data.groupBy) ? groupBy : groupBy[0])
})
watch(() => data.groupDesc, (groupDesc: boolean | boolean[]) => {
      updateOptions({ groupDesc: wrapInArray(groupDesc) })
})
      !deepEqual(groupDesc, old) && context.emit('update:group-desc', Array.isArray(data.groupDesc) ? groupDesc : groupDesc[0])
})
watch(() => data.multiSort, (multiSort: boolean) => {
      updateOptions({ multiSort })
})
      context.emit('update:multi-sort', multiSort)
})
watch(() => data.mustSort, (mustSort: boolean) => {
      updateOptions({ mustSort })
})
      context.emit('update:must-sort', mustSort)
})
watch(pageCount, (pageCount: number) => {
{
      immediate: true,
})
watch(computedItems, (computedItems: any[]) => {
{
      immediate: true,
})
watch(pagination, (pagination: DataPagination, old: DataPagination) => {
{
      immediate: true,
})

  function toggle (key: string, oldBy: string[], oldDesc: boolean[], page: number, mustSort: boolean, multiSort: boolean) {
      let by = oldBy.slice()
      let desc = oldDesc.slice()
      const byIndex = by.findIndex((k: string) => k === key)

      if (byIndex < 0) {
        if (!multiSort) {
          by = []
          desc = []
        }

        by.push(key)
        desc.push(false)
      } else if (byIndex >= 0 && !desc[byIndex]) {
        desc[byIndex] = true
      } else if (!mustSort) {
        by.splice(byIndex, 1)
        desc.splice(byIndex, 1)
      } else {
        desc[byIndex] = false
      }

      // Reset page to 1 if sortBy or sortDesc have changed
      if (!deepEqual(by, oldBy) || !deepEqual(desc, oldDesc)) {
        page = 1
      }

      return { by, desc, page }
    }
  function group (key: string): void {
      const { by: groupBy, desc: groupDesc, page } = toggle(
        key,
        props.internalOptions.groupBy,
        props.internalOptions.groupDesc,
        props.internalOptions.page,
        true,
        false
      )
      updateOptions({ groupBy, groupDesc, page })
    }
  function sort (key: string | string[]): void {
      if (Array.isArray(key)) return sortArray(key)

      const { by: sortBy, desc: sortDesc, page } = toggle(
        key,
        props.internalOptions.sortBy,
        props.internalOptions.sortDesc,
        props.internalOptions.page,
        props.internalOptions.mustSort,
        props.internalOptions.multiSort
      )
      updateOptions({ sortBy, sortDesc, page })
    }
  function sortArray (sortBy: string[]) {
      const sortDesc = sortBy.map(s => {
        const i = props.internalOptions.sortBy.findIndex((k: string) => k === s)
        return i > -1 ? props.internalOptions.sortDesc[i] : false
      })

      updateOptions({ sortBy, sortDesc })
    }
  function updateOptions (options: any) {
      props.internalOptions = {
        ...props.internalOptions,
        ...options,
        page: props.serverItemsLength < 0
          ? Math.max(1, Math.min(options.page || props.internalOptions.page, pageCount.value))
          : options.page || props.internalOptions.page,
      }
    }
  function sortItems (items: any[]): any[] {
      let sortBy = props.internalOptions.sortBy
      let sortDesc = props.internalOptions.sortDesc

      if (props.internalOptions.groupBy.length) {
        sortBy = [...props.internalOptions.groupBy, ...sortBy]
        sortDesc = [...props.internalOptions.groupDesc, ...sortDesc]
      }

      return props.customSort(items, sortBy, sortDesc, props.locale)
    }
  function groupItems (items: any[]): ItemGroup<any>[] {
      return props.customGroup(items, props.internalOptions.groupBy, props.internalOptions.groupDesc)
    }
  function paginateItems (items: any[]): any[] {
      // Make sure we don't try to display non-existant page if items suddenly change
      // TODO: Could possibly move this to pageStart/pageStop?
      if (props.serverItemsLength === -1 && items.length <= pageStart.value) {
        props.internalOptions.page = Math.max(1, props.internalOptions.page - 1)
      }

      return items.slice(pageStart.value, pageStop.value)
    }

  return {
    itemsLength,
    pageCount,
    pageStart,
    pageStop,
    isGrouped,
    pagination,
    filteredItems,
    computedItems,
    groupedItems,
    scopedProps,
    computedOptions,
    toggle,
    group,
    sort,
    sortArray,
    updateOptions,
    sortItems,
    groupItems,
    paginateItems,
  }
}
const VData = defineComponent({
  name: 'v-data',
  props: VDataProps,
  setup(props, context) {
    const {} = useVData(props, context)
  },
})

export default VData

