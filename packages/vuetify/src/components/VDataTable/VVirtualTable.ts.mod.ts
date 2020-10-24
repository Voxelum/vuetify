import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VVirtualTable.sass'

// Components
import VSimpleTable from './VSimpleTable'

// Types
import { VNode, VNodeChildren } from 'vue'
import { PropValidator } from 'vue/types/options'
import mixins from '../../util/mixins'

// Utiltiies
import { convertToUnit, debounce } from '../../util/helpers'
export const VVirtualTableProps = {
    chunkSize: {
      type: Number,
      default: 25,
    },
    headerHeight: {
      type: Number,
      default: 48,
    },
    items: {
      type: Array,
      default: () => ([]),
    } as PropValidator<any[]>,
    rowHeight: {
      type: Number,
      default: 48,
    },
}

// Types
const baseMixins = mixins(VSimpleTable)

interface options extends InstanceType<typeof baseMixins> {
  $refs: {
    table: HTMLElement
  }
  cachedItems: VNodeChildren
}

export function useVVirtualTable(props: ExtractPropTypes<typeof VVirtualTableProps>, context: SetupContext) {


  const data = reactive({
    scrollTop: 0,
    oldChunk: 0,
    scrollDebounce: null as any,
    invalidateCache: false,
  })

    const itemsLength: Ref<number> = computed(() => {
      return props.items.length
    })
    const totalHeight: Ref<number> = computed(() => {
      return (itemsLength.value * props.rowHeight) + props.headerHeight
    })
    const topIndex: Ref<number> = computed(() => {
      return Math.floor(data.scrollTop / props.rowHeight)
    })
    const chunkIndex: Ref<number> = computed(() => {
      return Math.floor(topIndex.value / props.chunkSize)
    })
    const startIndex: Ref<number> = computed(() => {
      return Math.max(0, (chunkIndex.value * props.chunkSize) - props.chunkSize)
    })
    const offsetTop: Ref<number> = computed(() => {
      return Math.max(0, startIndex.value * props.rowHeight)
    })
    const stopIndex: Ref<number> = computed(() => {
      return Math.min(startIndex.value + (props.chunkSize * 3), itemsLength.value)
    })
    const offsetBottom: Ref<number> = computed(() => {
      return Math.max(0, (itemsLength.value - stopIndex.value - startIndex.value) * props.rowHeight)
    })

watch(chunkIndex, (newValue, oldValue) => {
      data.oldChunk = oldValue
})
watch(() => props.items, () => {
      props.cachedItems = null
      context.refs.table.scrollTop = 0
})

    props.cachedItems = null

  onMounted(() => {
    data.scrollDebounce = debounce(onScroll, 50)

    context.refs.table.addEventListener('scroll', data.scrollDebounce, { passive: true })
  })

  onBeforeUnmount(() => {
    context.refs.table.removeEventListener('scroll', data.scrollDebounce)
  })

  function createStyleHeight (height: number) {
      return {
        height: `${height}px`,
      }
    }
  function genBody () {
      if (props.cachedItems === null || chunkIndex.value !== data.oldChunk) {
        props.cachedItems = genItems()
        data.oldChunk = chunkIndex.value
      }

      return context.createElement('tbody', [
        context.createElement('tr', { style: createStyleHeight(offsetTop.value) }),
        props.cachedItems,
        context.createElement('tr', { style: createStyleHeight(offsetBottom.value) }),
      ])
    }
  function genItems () {
      return context.scopedSlots.items!({ items: props.items.slice(startIndex.value, stopIndex.value) })
    }
  function onScroll (e: Event) {
      const target = e.target as Element
      data.scrollTop = target.scrollTop
    }
  function genTable () {
      return context.createElement('div', {
        ref: 'table',
        staticClass: 'v-virtual-table__table',
      }, [
        context.createElement('table', [
          context.slots['body.before'],
          genBody(),
          context.slots['body.after'],
        ]),
      ])
    }
  function genWrapper () {
      return context.createElement('div', {
        staticClass: 'v-virtual-table__wrapper',
        style: {
          height: convertToUnit(props.height),
        },
      }, [
        genTable(),
      ])
    }

  return {
    itemsLength,
    totalHeight,
    topIndex,
    chunkIndex,
    startIndex,
    offsetTop,
    stopIndex,
    offsetBottom,
    createStyleHeight,
    genBody,
    genItems,
    onScroll,
    genTable,
    genWrapper,
  }
}
const VVirtualTable = defineComponent({
  name: 'v-virtual-table',
  props: VVirtualTableProps,
  setup(props, context) {
    const {} = useVVirtualTable(props, context)
    return h('div', {
      staticClass: 'v-data-table v-virtual-table',
      class: props.classes,
    }, [
      context.slots.top,
      genWrapper(),
      context.slots.bottom,
    ])
  },
})

export default VVirtualTable

