import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Components
import VExpansionPanels from './VExpansionPanels'
import VExpansionPanelHeader from './VExpansionPanelHeader'
import VExpansionPanelContent from './VExpansionPanelContent'

// Mixins
import { factory as GroupableFactory } from '../../mixins/groupable'
import { provide as RegistrableProvide } from '../../mixins/registrable'

// Utilities
import { getSlot } from '../../util/helpers'
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue'
export const VExpansionPanelProps = {
    disabled: Boolean,
    readonly: Boolean,
}

type VExpansionPanelHeaderInstance = InstanceType<typeof VExpansionPanelHeader>
type VExpansionPanelContentInstance = InstanceType<typeof VExpansionPanelContent>

  GroupableFactory<'expansionPanels', typeof VExpansionPanels>('expansionPanels', 'v-expansion-panel', 'v-expansion-panels'),
  RegistrableProvide('expansionPanel', true)
  /* @vue/component */
export function useVExpansionPanel(props: ExtractPropTypes<typeof VExpansionPanelProps>, context: SetupContext) {


  const data = reactive({
      content: null as VExpansionPanelContentInstance | null,
      header: null as VExpansionPanelHeaderInstance | null,
      nextIsActive: false,
    }
)

    const classes: Ref<object> = computed(() => {
      return {
        'v-expansion-panel--active': props.isActive,
        'v-expansion-panel--next-active': data.nextIsActive,
        'v-expansion-panel--disabled': isDisabled.value,
        ...props.groupClasses,
      }
    })
    const isDisabled: Ref<boolean> = computed(() => {
      return props.expansionPanels.disabled || props.disabled
    })
    const isReadonly: Ref<boolean> = computed(() => {
      return props.expansionPanels.readonly || props.readonly
    })

  function registerContent (vm: VExpansionPanelContentInstance) {
      data.content = vm
    }
  function unregisterContent () {
      data.content = null
    }
  function registerHeader (vm: VExpansionPanelHeaderInstance) {
      data.header = vm
      vm.$on('click', onClick)
    }
  function unregisterHeader () {
      data.header = null
    }
  function onClick (e: MouseEvent) {
      if (e.detail) data.header!.$el.blur()

      context.emit('click', e)

      isReadonly.value || isDisabled.value || toggle()
    }
  function toggle () {
      /* istanbul ignore else */
      if (data.content) data.content.isBooted = true
      context.nextTick(() => context.emit('change'))
    }

  return {
    classes,
    isDisabled,
    isReadonly,
    registerContent,
    unregisterContent,
    registerHeader,
    unregisterHeader,
    onClick,
    toggle,
  }
}
const VExpansionPanel = defineComponent({
  name: 'v-expansion-panel',
  props: VExpansionPanelProps,
  setup(props, context) {
    const {} = useVExpansionPanel(props, context)
    return h('div', {
      staticClass: 'v-expansion-panel',
      class: classes.value,
      attrs: {
        'aria-expanded': String(props.isActive),
      },
    }, getSlot(this))
  },
})

export default VExpansionPanel

