import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import { VNode, VNodeChildrenArrayContents } from 'vue'
import mixins from '../../util/mixins'
import VSelect from '../VSelect/VSelect'
import VChip from '../VChip'
import header from './mixins/header'
import { wrapInArray } from '../../util/helpers'
export const VDataTableHeaderMobileProps = {
    sortByText: {
      type: String,
      default: '$vuetify.dataTable.sortBy',
    },
}

export function useVDataTableHeaderMobile(props: ExtractPropTypes<typeof VDataTableHeaderMobileProps>, context: SetupContext) {


  function genSortChip (props: any) {
      const children: VNodeChildrenArrayContents = [props.item.text]

      const sortIndex = props.options.sortBy.findIndex(k => k === props.item.value)
      const beingSorted = sortIndex >= 0
      const isDesc = props.options.sortDesc[sortIndex]

      children.push(context.createElement('div', {
        staticClass: 'v-chip__close',
        class: {
          sortable: true,
          active: beingSorted,
          asc: beingSorted && !isDesc,
          desc: beingSorted && isDesc,
        },
      }, [props.genSortIcon()]))

      return context.createElement(VChip, {
        staticClass: 'sortable',
        on: {
          click: (e: MouseEvent) => {
            e.stopPropagation()
            context.emit('sort', props.item.value)
          },
        },
      }, children)
    }
  function genSortSelect (items: any[]) {
      return context.createElement(VSelect, {
        props: {
          label: context.vuetify.lang.t(props.sortByText),
          items,
          hideDetails: true,
          multiple: props.options.multiSort,
          value: props.options.multiSort ? props.options.sortBy : props.options.sortBy[0],
          menuProps: { closeOnContentClick: true },
        },
        on: {
          change: (v: string | string[]) => context.emit('sort', v),
        },
        scopedSlots: {
          selection: props => genSortChip(props),
        },
      })
    }

  return {
    genSortChip,
    genSortSelect,
  }
}
const VDataTableHeaderMobile = defineComponent({
  name: 'v-data-table-header-mobile',
  props: VDataTableHeaderMobileProps,
  setup(props, context) {
    const {} = useVDataTableHeaderMobile(props, context)
    const children: VNodeChildrenArrayContents = []

    const header = props.headers.find(h => h.value === 'data-table-select')
    if (header && !props.singleSelect) {
      children.push(context.createElement('div', {
        class: [
          'v-data-table-header-mobile__select',
          ...wrapInArray(header.class),
        ],
        attrs: {
          width: header.width,
        },
      }, [props.genSelectAll()]))
    }

    const sortHeaders = props.headers
      .filter(h => h.sortable !== false && h.value !== 'data-table-select')
      .map(h => ({
        text: h.text,
        value: h.value,
      }))

    if (!props.disableSort && sortHeaders.length) {
      children.push(genSortSelect(sortHeaders))
    }

    const th = h('th', [h('div', { staticClass: 'v-data-table-header-mobile__wrapper' }, children)])

    const tr = h('tr', [th])

    return h('thead', {
      staticClass: 'v-data-table-header v-data-table-header-mobile',
    }, [tr])
  },
})

export default VDataTableHeaderMobile

