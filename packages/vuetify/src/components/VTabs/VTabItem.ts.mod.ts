import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Extensions
import VWindowItem from '../VWindow/VWindowItem'
export const VTabItemProps = {
    id: String,
}

/* @vue/component */
export function useVTabItem(props: ExtractPropTypes<typeof VTabItemProps>, context: SetupContext) {


  function genWindowItem () {
      const item = VWindowItem.options.methods.genWindowItem.call(this)

      item.data!.domProps = item.data!.domProps || {}
      item.data!.domProps.id = props.id || props.value

      return item
    }
  return {
    genWindowItem,
  }
}
const VTabItem = defineComponent({
  name: 'v-tab-item',
  props: VTabItemProps,
  setup(props, context) {
    const {} = useVTabItem(props, context)
  },
})

export default VTabItem

