import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VSpeedDial.sass'

// Mixins
import Toggleable from '../../mixins/toggleable'
import Positionable from '../../mixins/positionable'
import Transitionable from '../../mixins/transitionable'

// Directives
import ClickOutside from '../../directives/click-outside'

// Types
import mixins from '../../util/mixins'
import { VNode, VNodeData } from 'vue'
import { Prop } from 'vue/types/options'
export const VSpeedDialProps = {
}

/* @vue/component */
export function useVSpeedDial(props: ExtractPropTypes<typeof VSpeedDialProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        'v-speed-dial': true,
        'v-speed-dial--top': props.top,
        'v-speed-dial--right': props.right,
        'v-speed-dial--bottom': props.bottom,
        'v-speed-dial--left': props.left,
        'v-speed-dial--absolute': props.absolute,
        'v-speed-dial--fixed': props.fixed,
        [`v-speed-dial--direction-${props.direction}`]: true,
        'v-speed-dial--is-active': props.isActive,
      }
    })

  return {
    classes,
  }
}
const VSpeedDial = defineComponent({
  name: 'v-speed-dial',
  props: VSpeedDialProps,
  setup(props, context) {
    const {} = useVSpeedDial(props, context)
    let children: VNode[] = []
    const data: VNodeData = {
      class: classes.value,
      directives: [{
        name: 'click-outside',
        value: () => (props.isActive = false),
      }],
      on: {
        click: () => (props.isActive = !props.isActive),
      },
    }

    if (props.openOnHover) {
      data.on!.mouseenter = () => (props.isActive = true)
      data.on!.mouseleave = () => (props.isActive = false)
    }

    if (props.isActive) {
      let btnCount = 0
      children = (context.slots.default || []).map((b, i) => {
        if (b.tag && typeof b.componentOptions !== 'undefined' && (b.componentOptions.Ctor.options.name === 'v-btn' || b.componentOptions.Ctor.options.name === 'v-tooltip')) {
          btnCount++
          return h('div', {
            style: {
              transitionDelay: btnCount * 0.05 + 's',
            },
            key: i,
          }, [b])
        } else {
          b.key = i
          return b
        }
      })
    }

    const list = h('transition-group', {
      class: 'v-speed-dial__list',
      props: {
        name: props.transition,
        mode: props.mode,
        origin: props.origin,
        tag: 'div',
      },
    }, children)

    return h('div', data, [context.slots.activator, list])
  },
})

export default VSpeedDial

