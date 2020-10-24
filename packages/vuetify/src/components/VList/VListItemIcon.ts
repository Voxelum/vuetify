import { defineComponent, h, mergeProps } from 'vue'

/* @vue/component */
const VListItemIcon = defineComponent({
  name: 'v-list-item-icon',
  setup(props, context) {
    return () => {
      h('div', mergeProps(context.attrs, {
        class: 'v-list-item__icon',
      }), context.slots)
    }
  },
})

export default VListItemIcon

