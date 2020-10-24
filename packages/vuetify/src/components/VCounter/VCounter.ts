import { defineComponent, h } from 'vue'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Styles
import './VCounter.sass'


export const VCounterProps = {
  ...themeableProps,
  value: {
    type: [Number, String],
    default: '',
  },
  max: [Number, String],
}

/* @vue/component */
const VCounter = defineComponent({
  name: 'v-counter',
  props: VCounterProps,
  setup(props, context) {
    const { themeClasses } = useThemeable(props)
    return () => {
      const max = typeof props.max === 'string' ? parseInt(props.max, 10) : props.max ?? ''
      const value = parseInt(props.value, 10)
      const content = max ? `${value} / ${max}` : String(props.value)
      const isGreater = max && (value > max)

      return h('div', {
        staticClass: 'v-counter',
        class: {
          'error--text': isGreater,
          ...themeClasses.value,
        },
      }, content)
    }
  }
})

export default VCounter

