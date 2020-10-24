import { defineComponent, h, mergeProps } from 'vue'
import './VGrid.sass'
import './_grid.sass'

export const VContainerProps = {
  id: String,
  tag: {
    type: String,
    default: 'div',
  },
  fluid: {
    type: Boolean,
    default: false,
  },
}

/* @vue/component */
const VContainer = defineComponent({
  name: 'v-container',
  props: VContainerProps,
  setup(props, context) {
    return () => {
      let classes
      const attrs: typeof context.attrs = {
        ...context.attrs
      }

      // reset attrs to extract utility clases like pa-3
      classes = Object.keys(context.attrs).filter(key => {
        // TODO: Remove once resolved
        // https://github.com/vuejs/vue/issues/7841
        if (key === 'slot') return false

        const value = context.attrs[key]

        // add back data attributes like data-test="foo" but do not
        // add them as classes
        if (key.startsWith('data-')) {
          attrs![key] = value
          return false
        }

        return value || typeof value === 'string'
      })

      if (props.id) {
        attrs.id = props.id
      }

      return h(
        props.tag,
        mergeProps(attrs, {
          staticClass: 'container',
          class: Array<any>({
            'container--fluid': props.fluid,
          }).concat(classes || []),
        }),
        context.slots
      )
    }
  },
})

export default VContainer

