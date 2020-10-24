import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Extensions
import VWindowItem from '../VWindow/VWindowItem'

// Components
import { VImg } from '../VImg'

// Utilities
import mixins from '../../util/mixins'
import { getSlot } from '../../util/helpers'
import Routable from '../../mixins/routable'
export const VCarouselItemProps = {
}

// Types
const baseMixins = mixins(
  VWindowItem,
  Routable
)

/* @vue/component */
export function useVCarouselItem(props: ExtractPropTypes<typeof VCarouselItemProps>, context: SetupContext) {

  return {
  }
}
const VCarouselItem = defineComponent({
  name: 'v-carousel-item',
  props: VCarouselItemProps,
  setup(props, context) {
    const {} = useVCarouselItem(props, context)
  },
})

export default VCarouselItem

