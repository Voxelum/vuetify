import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VVirtualScroll.sass'

// Mixins
import Measurable from '../../mixins/measurable'

// Directives
import Scroll from '../../directives/scroll'

// Utilities
import {
  convertToUnit,
  getSlot,
} from '../../util/helpers'

// Types
import { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'
export const VVirtualScrollProps = {
}

export function useVVirtualScroll(props: ExtractPropTypes<typeof VVirtualScrollProps>, context: SetupContext) {


  const data = reactive({
    first: 0,
    last: 0,
    scrollTop: 0,
  })

    const __bench: Ref<number> = computed(() => {
      return parseInt(props.bench, 10)
    })
    const __itemHeight: Ref<number> = computed(() => {
      return parseInt(props.itemHeight, 10)
    })
    const firstToRender: Ref<number> = computed(() => {
      return Math.max(0, data.first - __bench.value)
    })
    const lastToRender: Ref<number> = computed(() => {
      return Math.min(props.items.length, data.last + __bench.value)
    })

{

  onMounted(() => {
    data.last = getLast(0)
  })

  function getChildren (): VNode[] {
      return props.items.slice(
        firstToRender.value,
        lastToRender.value,
      ).map(genChild)
    }
  function genChild (item: any, index: number) {
      index += firstToRender.value

      const top = convertToUnit(index * __itemHeight.value)

      return context.createElement('div', {
        staticClass: 'v-virtual-scroll__item',
        style: { top },
        key: index,
      }, getSlot(this, 'default', { index, item }))
    }
  function getFirst (): number {
      return Math.floor(data.scrollTop / __itemHeight.value)
    }
  function getLast (first: number): number {
      const height = parseInt(props.height || 0, 10) || context.el.clientHeight

      return first + Math.ceil(height / __itemHeight.value)
    }
  function onScroll () {
      data.scrollTop = context.el.scrollTop
      data.first = getFirst()
      data.last = getLast(data.first)
    }

  return {
    __bench,
    __itemHeight,
    firstToRender,
    lastToRender,
    getChildren,
    genChild,
    getFirst,
    getLast,
    onScroll,
  }
}
const VVirtualScroll = defineComponent({
  name: 'v-virtual-scroll',
  props: VVirtualScrollProps,
  setup(props, context) {
    const {} = useVVirtualScroll(props, context)
    const content = h('div', {
      staticClass: 'v-virtual-scroll__container',
      style: {
        height: convertToUnit((props.items.length * __itemHeight.value)),
      },
    }, getChildren())

    return h('div', {
      staticClass: 'v-virtual-scroll',
      style: props.measurableStyles,
      directives: [{
        name: 'scroll',
        modifiers: { self: true },
        value: onScroll,
      }],
    }, [content])
  },
})

export default VVirtualScroll

