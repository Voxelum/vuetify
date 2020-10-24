import { VNodeData } from '@util/vnodeData'
import { ExtractPropTypes, h, VNode, withDirectives } from 'vue'
import { Ripple } from '../../directives/ripple'

export const rippleableProps = {
  ripple: {
    type: [Boolean, Object],
    default: true,
  },
}

export default function useRippleable(props: ExtractPropTypes<typeof rippleableProps>) {
  function genRipple(data: VNodeData = {}): VNode | null {
    if (!props.ripple) return null

    data.class = 'v-input--selection-controls__ripple'

    return withDirectives(h('div', data), [[Ripple]])
  }
  return {
    genRipple,
  }
}
