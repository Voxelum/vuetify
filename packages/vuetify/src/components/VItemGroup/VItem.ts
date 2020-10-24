// Mixins
// Types
import { defineComponent, ExtractPropTypes, reactive, SetupContext, toRefs, VNode, VNodeArrayChildren } from 'vue'
import { GroupableKey, groupableProps, useGroupableFactory } from '../../mixins/groupable'
import { consoleWarn } from '../../util/console'

export const VItemProps = {
  ...groupableProps('itemGroup'),
  activeClass: String,
  value: {
    required: false,
  },
}

const useGroupable = useGroupableFactory(GroupableKey, 'v-item', 'v-item-group')

export function useVItem(props: ExtractPropTypes<typeof VItemProps>, context: SetupContext) {
  // TODO: type check
  const { } = useGroupable(props as any, context)
  const data = reactive({
    isActive: false,
  })
  function toggle() {
    data.isActive = !data.isActive
  }

  return {
    ...toRefs(data),
    toggle,
  }
}


// export default mixins(
//   BaseItem,
//   GroupableFactory('itemGroup', 'v-item', 'v-item-group')
// ).extend({
// })

export default defineComponent({
  name: 'v-item',
  props: VItemProps,
  setup(props, context) {
    const { isActive, toggle } = useVItem(props, context)
    if (!context.slots.default) {
      consoleWarn('v-item is missing a default scopedSlot', this)

      return null as any
    }

    let element: VNode | VNodeArrayChildren | undefined

    /* istanbul ignore else */
    if (context.slots.default) {
      element = context.slots.default({
        active: isActive,
        toggle: toggle,
      })
    }

    if (Array.isArray(element) && element.length === 1) {
      element = element[0]
    }

    if (!element || Array.isArray(element) || !element.tag) {
      consoleWarn('v-item should only contain a single element', this)

      return element as any
    }


    // TODO: fix this
    // element.props = this._b(element.props || {}, element.tag!, {
    //   class: { [props.activeClass]: isActive.value },
    // })

    return element
  }
})

