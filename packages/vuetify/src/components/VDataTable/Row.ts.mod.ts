import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Types
import Vue, { VNode, PropType } from 'vue'
import { DataTableHeader } from 'vuetify/types'

// Utils
import { getObjectValueByPath } from '../../util/helpers'
export const RowProps = {
}

export default export function useRow(props: ExtractPropTypes<typeof RowProps>, context: SetupContext) {


  return {
  }
}
const Row = defineComponent({
  name: 'row',
  props: RowProps,
  setup(props, context) {
    const {} = useRow(props, context)
    const computedSlots = slots()

    const columns: VNode[] = props.headers.map((header: DataTableHeader) => {
      const children = []
      const value = getObjectValueByPath(props.item, header.value)

      const slotName = header.value
      const scopedSlot = data.scopedSlots && data.scopedSlots[slotName]
      const regularSlot = computedSlots[slotName]

      if (scopedSlot) {
        children.push(scopedSlot({ item: props.item, header, value }))
      } else if (regularSlot) {
        children.push(regularSlot)
      } else {
        children.push(value == null ? value : String(value))
      }

      const textAlign = `text-${header.align || 'start'}`

      return h('td', {
        class: {
          [textAlign]: true,
          'v-data-table__divider': header.divider,
        },
      }, children)
    })

    return h('tr', data, columns)
  },
})

export default Row

