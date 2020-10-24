import { defineComponent, h, mergeProps } from 'vue'
import './_grid.sass'

const VSpacer = defineComponent({
    name: 'v-spacer',
    setup(props, context) {
        return () => h('div', mergeProps({
            staticClass: `spacer ${context.attrs.staticClass || ''}`
        }, context.attrs), context.slots)
    },
})

export default VSpacer
