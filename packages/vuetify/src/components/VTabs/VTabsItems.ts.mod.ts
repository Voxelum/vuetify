import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Extensions
import VWindow from '../VWindow/VWindow'

// Types & Components
import { BaseItemGroup, GroupableInstance } from './../VItemGroup/VItemGroup'
export const VTabsItemsProps = {
    mandatory: {
      type: Boolean,
      default: false,
    },
}

/* @vue/component */
export function useVTabsItems(props: ExtractPropTypes<typeof VTabsItemsProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        ...VWindow.options.computed.classes.call(this),
        'v-tabs-items': true,
      }
    })
    const isDark: Ref<boolean> = computed(() => {
      return props.rootIsDark
    })

  function getValue (item: GroupableInstance, i: number) {
      return item.id || BaseItemGroup.options.methods.getValue.call(this, item, i)
    }
  return {
    classes,
    isDark,
    getValue,
  }
}
const VTabsItems = defineComponent({
  name: 'v-tabs-items',
  props: VTabsItemsProps,
  setup(props, context) {
    const {} = useVTabsItems(props, context)
  },
})

export default VTabsItems

