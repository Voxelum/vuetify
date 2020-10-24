import { useToggleableFactory } from '@mixins/toggleable'
import { defineComponent, ExtractPropTypes, VNode, VNodeArrayChildren } from 'vue'
// Types
import useDelayable, { delayableProps } from '../../mixins/delayable'
import { consoleWarn } from '../../util/console'

export const VHoverProps = {
  ...delayableProps,
  disabled: {
    type: Boolean,
    default: false,
  },
  value: {
    type: Boolean,
    default: undefined,
  },
}

export function useVHover(props: ExtractPropTypes<typeof VHoverProps>) {
  const { runDelay } = useDelayable(props)
  function onMouseEnter() {
    runDelay('open')
  }
  function onMouseLeave() {
    runDelay('close')
  }
  return {
    onMouseEnter,
    onMouseLeave,
  }
}

const useToggable = useToggleableFactory()

const VHover = defineComponent({
  name: 'v-hover',
  props: VHoverProps,
  setup(props, context) {
    const { onMouseEnter, onMouseLeave } = useVHover(props)
    const { isActive } = useToggable(props, context)
    return () => {
      if (!context.slots.default && props.value === undefined) {
        consoleWarn('v-hover is missing a default scopedSlot or bound value', this)

        return null as any
      }

      let element: VNode | VNodeArrayChildren | undefined

      /* istanbul ignore else */
      if (context.slots.default) {
        element = context.slots.default({ hover: isActive })
      }

      if (Array.isArray(element) && element.length === 1) {
        element = element[0]
      }

      if (!element || Array.isArray(element) || !element.tag) {
        consoleWarn('v-hover should only contain a single element', this)

        return element as any
      }

      if (!props.disabled) {
        element.props = element.props || {}
        element.props.onMouseEnter = onMouseEnter
        element.props.onMouseLeave = onMouseLeave
      }

      return element
    }
  }
})

export default VHover
