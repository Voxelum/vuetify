import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Components
import VExpansionPanel from './VExpansionPanel'
import { VExpandTransition } from '../transitions'

// Mixins
import Bootable from '../../mixins/bootable'
import Colorable from '../../mixins/colorable'
import { inject as RegistrableInject } from '../../mixins/registrable'

// Utilities
import { getSlot } from '../../util/helpers'
import mixins, { ExtractVue } from '../../util/mixins'

// Types
import Vue, { VNode, VueConstructor } from 'vue'
export const VExpansionPanelContentProps = {
}

const baseMixins = mixins(
  Bootable,
  Colorable,
  RegistrableInject<'expansionPanel', VueConstructor<Vue>>('expansionPanel', 'v-expansion-panel-content', 'v-expansion-panel')
)

interface options extends ExtractVue<typeof baseMixins> {
  expansionPanel: InstanceType<typeof VExpansionPanel>
}

/* @vue/component */
export function useVExpansionPanelContent(props: ExtractPropTypes<typeof VExpansionPanelContentProps>, context: SetupContext) {

    const isActive: Ref<boolean> = computed(() => {
      return props.expansionPanel.isActive
    })

    props.expansionPanel.registerContent(this)

  onBeforeUnmount(() => {
    props.expansionPanel.unregisterContent()
  })

  return {
    isActive,
  }
}
const VExpansionPanelContent = defineComponent({
  name: 'v-expansion-panel-content',
  props: VExpansionPanelContentProps,
  setup(props, context) {
    const {} = useVExpansionPanelContent(props, context)
    return h(VExpandTransition, props.showLazyContent(() => [
      h('div', props.setBackgroundColor(props.color, {
        staticClass: 'v-expansion-panel-content',
        directives: [{
          name: 'show',
          value: isActive.value,
        }],
      }), [
        h('div', { class: 'v-expansion-panel-content__wrap' }, getSlot(this)),
      ]),
    ]))
  },
})

export default VExpansionPanelContent

