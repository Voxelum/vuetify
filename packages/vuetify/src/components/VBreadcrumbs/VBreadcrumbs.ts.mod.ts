import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VBreadcrumbs.sass'

// Types
import { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'

// Components
import VBreadcrumbsItem from './VBreadcrumbsItem'
import VBreadcrumbsDivider from './VBreadcrumbsDivider'

// Mixins
import Themeable from '../../mixins/themeable'

// Utils
import mixins from '../../util/mixins'
export const VBreadcrumbsProps = {
    divider: {
      type: String,
      default: '/',
    },
    items: {
      type: Array,
      default: () => ([]),
    } as PropValidator<any[]>,
    large: Boolean,
}

  Themeable
  /* @vue/component */
export function useVBreadcrumbs(props: ExtractPropTypes<typeof VBreadcrumbsProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        'v-breadcrumbs--large': props.large,
        ...props.themeClasses,
      }
    })

  function genDivider () {
      return context.createElement(VBreadcrumbsDivider, context.slots.divider ? context.slots.divider : props.divider)
    }
  function genItems () {
      const items = []
      const hasSlot = !!context.scopedSlots.item
      const keys = []

      for (let i = 0; i < props.items.length; i++) {
        const item = props.items[i]

        keys.push(item.text)

        if (hasSlot) items.push(context.scopedSlots.item!({ item }))
        else items.push(context.createElement(VBreadcrumbsItem, { key: keys.join('.'), props: item }, [item.text]))

        if (i < props.items.length - 1) items.push(genDivider())
      }

      return items
    }

  return {
    classes,
    genDivider,
    genItems,
  }
}
const VBreadcrumbs = defineComponent({
  name: 'v-breadcrumbs',
  props: VBreadcrumbsProps,
  setup(props, context) {
    const {} = useVBreadcrumbs(props, context)
    const children = context.slots.default || genItems()

    return h('ul', {
      staticClass: 'v-breadcrumbs',
      class: classes.value,
    }, children)
  },
})

export default VBreadcrumbs

