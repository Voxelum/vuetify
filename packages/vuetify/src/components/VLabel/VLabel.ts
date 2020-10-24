import { defineComponent, ExtractPropTypes, h } from 'vue'
import useColorable from '../../mixins/colorable'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Helpers
import { convertToUnit } from '../../util/helpers'
// Styles
import './VLabel.sass'

export const VLabelProps = {
  ...themeableProps,
  absolute: Boolean,
  color: {
    type: String,
    default: 'primary',
  },
  disabled: Boolean,
  focused: Boolean,
  for: String,
  left: {
    type: [Number, String],
    default: 0,
  },
  right: {
    type: [Number, String],
    default: 'auto',
  },
  value: Boolean,
}

/* @vue/component */
export function useVLabel(props: ExtractPropTypes<typeof VLabelProps>) {
  return useThemeable(props)
}

const VLabel = defineComponent({
  name: 'v-label',
  props: VLabelProps,
  setup(props, context) {
    const { themeClasses } = useThemeable(props)
    const { setTextColor } = useColorable(context)
    return () => {
      const data = {
        staticClass: 'v-label',
        class: {
          'v-label--active': props.value,
          'v-label--is-disabled': props.disabled,
          ...themeClasses.value,
        },
        attrs: {
          for: props.for,
          'aria-hidden': !props.for,
        },
        style: {
          left: convertToUnit(props.left),
          right: convertToUnit(props.right),
          position: props.absolute ? 'absolute' : 'relative',
        },
        ref: 'label',
        ...context.attrs,
      }

      return h('label', setTextColor(props.focused && props.color, data), context.slots)
    }
  }
})

export default VLabel
