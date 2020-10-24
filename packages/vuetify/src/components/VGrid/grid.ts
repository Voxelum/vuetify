import { defineComponent, h } from 'vue'
export const gridProps = {
  id: String,
  tag: {
    type: String,
    default: 'div',
  },
}

export function defineGridComponent(name: string) {
  /* @vue/component */
  return defineComponent({
    name: `v-${name}`,

    props: {
      id: String,
      tag: {
        type: String,
        default: 'div',
      },
    },

    setup(props, context) {
      return () => {
        const attrs = { ...context.attrs }
        // reset attrs to extract utility clases like pa-3
        const classes = Object.keys(attrs).filter(key => {
          // TODO: Remove once resolved
          // https://github.com/vuejs/vue/issues/7841
          if (key === 'slot') return false

          const value = attrs[key]

          // add back data attributes like data-test="foo" but do not
          // add them as classes
          if (key.startsWith('data-')) {
            attrs![key] = value
            return false
          }

          return value || typeof value === 'string'
        })

        attrs.staticClass = (`${name} ${attrs.staticClass || ''}`).trim()

        if (classes.length) attrs.staticClass += ` ${classes.join(' ')}`

        if (props.id) {
          attrs.id = props.id
        }

        return h(props.tag, attrs, context.slots)
      }
    }
  })
}
