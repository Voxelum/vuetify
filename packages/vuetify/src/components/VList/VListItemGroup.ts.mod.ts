import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VListItemGroup.sass'

// Extensions
import { BaseItemGroup } from '../VItemGroup/VItemGroup'

// Mixins
import Colorable from '../../mixins/colorable'

// Utilities
import mixins from '../../util/mixins'
export const VListItemGroupProps = {
}

  BaseItemGroup,
  Colorable
export function useVListItemGroup(props: ExtractPropTypes<typeof VListItemGroupProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        ...BaseItemGroup.options.computed.classes.call(this),
        'v-list-item-group': true,
      }
    })

  function genData (): object {
      return props.setTextColor(props.color, {
        ...BaseItemGroup.options.methods.genData.call(this),
        attrs: {
          role: 'listbox',
        },
      })
    }
  return {
    classes,
    genData,
  }
}
const VListItemGroup = defineComponent({
  name: 'v-list-item-group',
  props: VListItemGroupProps,
  setup(props, context) {
    const {} = useVListItemGroup(props, context)
  },
})

export default VListItemGroup

