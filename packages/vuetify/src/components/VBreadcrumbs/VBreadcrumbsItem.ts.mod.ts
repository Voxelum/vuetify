import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import Routable from '../../mixins/routable'

import mixins from '../../util/mixins'
import { VNode } from 'vue'
export const VBreadcrumbsItemProps = {
  // In a breadcrumb, the currently
  // active item should be dimmed
  activeClass: {
    type: String,
    default: 'v-breadcrumbs__item--disabled',
  },
  ripple: {
    type: [Boolean, Object],
    default: false,
  },
}

/* @vue/component */
export function useVBreadcrumbsItem(props: ExtractPropTypes<typeof VBreadcrumbsItemProps>, context: SetupContext) {
  const classes: Ref<object> = computed(() => {
    return {
      'v-breadcrumbs__item': true,
      [props.activeClass]: props.disabled,
    }
  })

  return {
    classes,
  }
}
const VBreadcrumbsItem = defineComponent({
  name: 'v-breadcrumbs-item',
  props: VBreadcrumbsItemProps,
  setup(props, context) {
    const { } = useVBreadcrumbsItem(props, context)
    const { tag, data } = props.generateRouteLink()

    return h('li', [
      h(tag, {
        ...data,
        attrs: {
          ...data.attrs,
          'aria-current': props.isActive && props.isLink ? 'page' : undefined,
        },
      }, context.slots.default),
    ])
  },
})

export default VBreadcrumbsItem

