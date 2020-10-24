import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Mixins
import Colorable from '../../mixins/colorable'

// Utilities
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue/types'
export const VTabsSliderProps = {
}

/* @vue/component */
export function useVTabsSlider(props: ExtractPropTypes<typeof VTabsSliderProps>, context: SetupContext) {

  return {
  }
}
const VTabsSlider = defineComponent({
  name: 'v-tabs-slider',
  props: VTabsSliderProps,
  setup(props, context) {
    const {} = useVTabsSlider(props, context)
    return h('div', props.setBackgroundColor(props.color, {
      staticClass: 'v-tabs-slider',
    }))
  },
})

export default VTabsSlider

