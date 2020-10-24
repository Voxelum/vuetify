import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VDataTableHeader.sass'

// Components
import VDataTableHeaderMobile from './VDataTableHeaderMobile'
import VDataTableHeaderDesktop from './VDataTableHeaderDesktop'

// Mixins
import header from './mixins/header'

// Utilities
import dedupeModelListeners from '../../util/dedupeModelListeners'
import mergeData from '../../util/mergeData'
import rebuildSlots from '../../util/rebuildFunctionalSlots'

// Types
import Vue from 'vue'
export const VDataTableHeaderProps = {
}

/* @vue/component */
export default export function useVDataTableHeader(props: ExtractPropTypes<typeof VDataTableHeaderProps>, context: SetupContext) {


  return {
  }
}
const VDataTableHeader = defineComponent({
  name: 'v-data-table-header',
  props: VDataTableHeaderProps,
  setup(props, context) {
    const {} = useVDataTableHeader(props, context)
    dedupeModelListeners(data)
    const children = rebuildSlots(slots(), h)

    data = mergeData(data, { props })

    if (props.mobile) {
      return h(VDataTableHeaderMobile, data, children)
    } else {
      return h(VDataTableHeaderDesktop, data, children)
    }
  },
})

export default VDataTableHeader

