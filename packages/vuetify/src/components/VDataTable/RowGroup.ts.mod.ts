import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import Vue, { VNode } from 'vue'
export const RowGroupProps = {
}

export default export function useRowGroup(props: ExtractPropTypes<typeof RowGroupProps>, context: SetupContext) {


  return {
  }
}
const RowGroup = defineComponent({
  name: 'row-group',
  props: RowGroupProps,
  setup(props, context) {
    const {} = useRowGroup(props, context)
    const computedSlots = slots()
    const children = []

    if (computedSlots['column.header']) {
      children.push(h('tr', {
        staticClass: props.headerClass,
      }, computedSlots['column.header']))
    } else if (computedSlots['row.header']) {
      children.push(...computedSlots['row.header'])
    }

    if (computedSlots['row.content'] && props.value) children.push(...computedSlots['row.content'])

    if (computedSlots['column.summary']) {
      children.push(h('tr', {
        staticClass: props.summaryClass,
      }, computedSlots['column.summary']))
    } else if (computedSlots['row.summary']) {
      children.push(...computedSlots['row.summary'])
    }

    return children as any
  },
})

export default RowGroup

