import { defineComponent, h, mergeProps } from 'vue'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Styles
import './VDivider.sass'

export const VDividerProps = {
  ...themeableProps,
  inset: Boolean,
  vertical: Boolean,
}

const VDivider = defineComponent({
  name: 'v-divider',
  props: VDividerProps,
  setup(props, context) {
    const { themeClasses } = useThemeable(props)
    return () => {
      // WAI-ARIA attributes
      let orientation
      if (!context.attrs.role || context.attrs.role === 'separator') {
        orientation = props.vertical ? 'vertical' : 'horizontal'
      }
      return h('hr', mergeProps({
        class: {
          'v-divider': true,
          'v-divider--inset': props.inset,
          'v-divider--vertical': props.vertical,
          ...themeClasses.value,
        },
        role: 'separator',
        'aria-orientation': orientation,
      }, context.attrs))
    }
  },
})

export default VDivider

