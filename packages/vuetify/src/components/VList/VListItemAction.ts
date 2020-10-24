import { defineComponent, h, mergeProps } from 'vue'

/* @vue/component */
const VListItemAction = defineComponent({
  name: 'v-list-item-action',
  setup(props, context) {
    return () => {
      const children = context.slots.default?.() ?? []
      const filteredChild = children/* .filter(node => {
        return node.isComment === false && node.text !== ' '
      }) */
      const classes = {
        'v-list-item__action': true,
        'v-list-item__action--stack': filteredChild.length > 0
      }
      return h('div', mergeProps({
        class: classes
      }, context.attrs), children)
    }
  },
})

export default VListItemAction

