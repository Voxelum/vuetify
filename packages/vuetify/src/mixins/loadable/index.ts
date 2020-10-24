import { colorableProps } from '@mixins/colorable'
import { ExtractPropTypes, h, SetupContext, VNode } from 'vue'
import VProgressLinear from '../../components/VProgressLinear'
export const loadableProps = {
  ...colorableProps,
  loading: {
    type: [Boolean, String],
    default: false,
  },
  loaderHeight: {
    type: [Number, String],
    default: 2,
  },
}

/**
 * Loadable
 *
 * @mixin
 *
 * Used to add linear progress bar to components
 * Can use a default bar with a specific color
 * or designate a custom progress linear bar
 */
/* @vue/component */
export default function useLoadable(props: ExtractPropTypes<typeof loadableProps>, context: SetupContext) {
  function genProgress(): VNode | VNode[] | null {
    if (props.loading === false) return null
    return context.slots.progress?.() || h(VProgressLinear, {
      absolute: true,
      color: (props.loading === true || props.loading === '')
        ? (props.color || 'primary')
        : props.loading,
      height: props.loaderHeight,
      indeterminate: true,
    })
  }
  return {
    genProgress,
  }
}
