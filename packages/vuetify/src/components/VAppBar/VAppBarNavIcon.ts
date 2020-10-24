import { defineComponent, h } from 'vue'
import VBtn from '../VBtn/VBtn'
// Components
import VIcon from '../VIcon'

/* @vue/component */
const VAppBarNavIcon = defineComponent({
  name: 'v-app-bar-nav-icon',
  setup(props, context) {
    return () => {
      const d = {
        staticClass: (`v-app-bar__nav-icon ${context.attrs.staticClass || ''}`).trim(),
        icon: true,
        ...context.attrs,
      }

      const defaultSlot = context.slots.default?.()

      return h(VBtn, d, defaultSlot || [h(VIcon, '$menu')])
    }
  },
})

export default VAppBarNavIcon


