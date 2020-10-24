import { defineComponent, h, mergeProps } from 'vue'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Styles
import './VSubheader.sass'


export const VSubheaderProps = {
  ...themeableProps,
  inset: Boolean,
}

const VSubheader = defineComponent({
  name: 'v-subheader',
  props: VSubheaderProps,
  setup(props, context) {
    const { themeClasses } = useThemeable(props)
    return () => {

      return h('div', mergeProps({
        staticClass: 'v-subheader',
        class: {
          'v-subheader--inset': props.inset,
          ...themeClasses.value,
        },
      }, context.attrs), context.slots.default)
    }
  },
})

export default VSubheader

