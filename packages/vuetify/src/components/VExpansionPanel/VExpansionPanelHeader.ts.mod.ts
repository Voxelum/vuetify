import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Components
import { VFadeTransition } from '../transitions'
import VExpansionPanel from './VExpansionPanel'
import VIcon from '../VIcon'

// Mixins
import Colorable from '../../mixins/colorable'
import { inject as RegistrableInject } from '../../mixins/registrable'

// Directives
import ripple from '../../directives/ripple'

// Utilities
import { getSlot } from '../../util/helpers'
import mixins, { ExtractVue } from '../../util/mixins'

// Types
import Vue, { VNode, VueConstructor } from 'vue'
export const VExpansionPanelHeaderProps = {
}

const baseMixins = mixins(
  Colorable,
  RegistrableInject<'expansionPanel', VueConstructor<Vue>>('expansionPanel', 'v-expansion-panel-header', 'v-expansion-panel')
)

interface options extends ExtractVue<typeof baseMixins> {
  $el: HTMLElement
  expansionPanel: InstanceType<typeof VExpansionPanel>
}

export function useVExpansionPanelHeader(props: ExtractPropTypes<typeof VExpansionPanelHeaderProps>, context: SetupContext) {


  const data = reactive({
    hasMousedown: false,
  })

    const classes: Ref<object> = computed(() => {
      return {
        'v-expansion-panel-header--active': isActive.value,
        'v-expansion-panel-header--mousedown': data.hasMousedown,
      }
    })
    const isActive: Ref<boolean> = computed(() => {
      return props.expansionPanel.isActive
    })
    const isDisabled: Ref<boolean> = computed(() => {
      return props.expansionPanel.isDisabled
    })
    const isReadonly: Ref<boolean> = computed(() => {
      return props.expansionPanel.isReadonly
    })

    props.expansionPanel.registerHeader(this)

  onBeforeUnmount(() => {
    props.expansionPanel.unregisterHeader()
  })

  function onClick (e: MouseEvent) {
      context.emit('click', e)
    }
  function genIcon () {
      const icon = getSlot(this, 'actions') ||
        [context.createElement(VIcon, props.expandIcon)]

      return context.createElement(VFadeTransition, [
        context.createElement('div', {
          staticClass: 'v-expansion-panel-header__icon',
          class: {
            'v-expansion-panel-header__icon--disable-rotate': props.disableIconRotate,
          },
          directives: [{
            name: 'show',
            value: !isDisabled.value,
          }],
        }, icon),
      ])
    }

  return {
    classes,
    isActive,
    isDisabled,
    isReadonly,
    onClick,
    genIcon,
  }
}
const VExpansionPanelHeader = defineComponent({
  name: 'v-expansion-panel-header',
  props: VExpansionPanelHeaderProps,
  setup(props, context) {
    const {} = useVExpansionPanelHeader(props, context)
    return h('button', props.setBackgroundColor(props.color, {
      staticClass: 'v-expansion-panel-header',
      class: classes.value,
      attrs: {
        tabindex: isDisabled.value ? -1 : null,
        type: 'button',
      },
      directives: [{
        name: 'ripple',
        value: props.ripple,
      }],
      on: {
        ...context.listeners,
        click: onClick,
        mousedown: () => (data.hasMousedown = true),
        mouseup: () => (data.hasMousedown = false),
      },
    }), [
      getSlot(this, 'default', { open: isActive.value }, true),
      props.hideActions || genIcon(),
    ])
  },
})

export default VExpansionPanelHeader

