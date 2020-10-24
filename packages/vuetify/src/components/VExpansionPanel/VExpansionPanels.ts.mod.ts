import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VExpansionPanel.sass'

// Components
import { BaseItemGroup, GroupableInstance } from '../VItemGroup/VItemGroup'
import VExpansionPanel from './VExpansionPanel'

// Utilities
import { breaking } from '../../util/console'
export const VExpansionPanelsProps = {
    accordion: Boolean,
    disabled: Boolean,
    flat: Boolean,
    hover: Boolean,
    focusable: Boolean,
    inset: Boolean,
    popout: Boolean,
    readonly: Boolean,
    tile: Boolean,
}

// Types
interface VExpansionPanelInstance extends InstanceType<typeof VExpansionPanel> {}

/* @vue/component */
export function useVExpansionPanels(props: ExtractPropTypes<typeof VExpansionPanelsProps>, context: SetupContext) {



    const classes: Ref<object> = computed(() => {
      return {
        ...BaseItemGroup.options.computed.classes.call(this),
        'v-expansion-panels': true,
        'v-expansion-panels--accordion': props.accordion,
        'v-expansion-panels--flat': props.flat,
        'v-expansion-panels--hover': props.hover,
        'v-expansion-panels--focusable': props.focusable,
        'v-expansion-panels--inset': props.inset,
        'v-expansion-panels--popout': props.popout,
        'v-expansion-panels--tile': props.tile,
      }
    })

    /* istanbul ignore next */
    if (context.attrs.hasOwnProperty('expand')) {
      breaking('expand', 'multiple', this)
    }

    /* istanbul ignore next */
    if (
      Array.isArray(props.value) &&
      props.value.length > 0 &&
      typeof props.value[0] === 'boolean'
    ) {
      breaking(':value="[true, false, true]"', ':value="[0, 2]"', this)
    }

  function updateItem (item: GroupableInstance & VExpansionPanelInstance, index: number) {
      const value = props.getValue(item, index)
      const nextValue = props.getValue(item, index + 1)

      item.isActive = props.toggleMethod(value)
      item.nextIsActive = props.toggleMethod(nextValue)
    }
  return {
    classes,
    updateItem,
  }
}
const VExpansionPanels = defineComponent({
  name: 'v-expansion-panels',
  props: VExpansionPanelsProps,
  setup(props, context) {
    const {} = useVExpansionPanels(props, context)
  },
})

export default VExpansionPanels

