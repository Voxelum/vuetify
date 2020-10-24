import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Mixins
import { factory as GroupableFactory } from '../../mixins/groupable'
import Routable from '../../mixins/routable'
import Themeable from '../../mixins/themeable'

// Utilities
import { keyCodes } from './../../util/helpers'
import mixins from '../../util/mixins'
import { ExtractVue } from './../../util/mixins'

// Types
import { VNode } from 'vue/types'
export const VTabProps = {
    ripple: {
      type: [Boolean, Object],
      default: true,
    },
}

const baseMixins = mixins(
  Routable,
  // Must be after routable
  // to overwrite activeClass
  GroupableFactory('tabsBar'),
  Themeable
)

interface options extends ExtractVue<typeof baseMixins> {
  $el: HTMLElement
}

  /* @vue/component */
export function useVTab(props: ExtractPropTypes<typeof VTabProps>, context: SetupContext) {


  const data = reactive({
    proxyClass: 'v-tab--active',
  })

    const classes: Ref<object> = computed(() => {
      return {
        'v-tab': true,
        ...Routable.options.computed.classes.call(this),
        'v-tab--disabled': props.disabled,
        ...props.groupClasses,
      }
    })
    const value: Ref<any> = computed(() => {
      let to = props.to || props.href || ''

      if (context.router &&
        props.to === Object(props.to)
      ) {
        const resolve = context.router.resolve(
          props.to,
          context.route,
          props.append
        )

        to = resolve.href
      }

      return to.replace('#', '')
    })

  onMounted(() => {
    props.onRouteChange()
  })

  function click (e: KeyboardEvent | MouseEvent): void {
      // If user provides an
      // actual link, do not
      // prevent default
      if (props.href &&
        props.href.indexOf('#') > -1
      ) e.preventDefault()

      if (e.detail) context.el.blur()

      context.emit('click', e)

      props.to || props.toggle()
    }

  return {
    classes,
    value,
    click,
  }
}
const VTab = defineComponent({
  name: 'v-tab',
  props: VTabProps,
  setup(props, context) {
    const {} = useVTab(props, context)
    const { tag, data } = props.generateRouteLink()

    data.attrs = {
      ...data.attrs,
      'aria-selected': String(props.isActive),
      role: 'tab',
      tabindex: 0,
    }
    data.on = {
      ...data.on,
      keydown: (e: KeyboardEvent) => {
        if (e.keyCode === keyCodes.enter) click(e)

        context.emit('keydown', e)
      },
    }

    return h(tag, data, context.slots.default)
  },
})

export default VTab

