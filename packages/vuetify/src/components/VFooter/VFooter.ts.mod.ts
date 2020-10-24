import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VFooter.sass'

// Components
import VSheet from '../VSheet/VSheet'

// Mixins
import Applicationable from '../../mixins/applicationable'
import SSRBootable from '../../mixins/ssr-bootable'

// Utilities
import mixins from '../../util/mixins'
import { convertToUnit } from '../../util/helpers'

// Types
import { VNode } from 'vue/types/vnode'
export const VFooterProps = {
    height: {
      default: 'auto',
      type: [Number, String],
    },
    inset: Boolean,
    padless: Boolean,
    tag: {
      type: String,
      default: 'footer',
    },
}

/* @vue/component */
  VSheet,
  Applicationable('footer', [
    'height',
    'inset',
  ]),
  SSRBootable
export function useVFooter(props: ExtractPropTypes<typeof VFooterProps>, context: SetupContext) {


    const applicationProperty: Ref<string> = computed(() => {
      return props.inset ? 'insetFooter' : 'footer'
    })
    const classes: Ref<object> = computed(() => {
      return {
        ...VSheet.options.computed.classes.call(this),
        'v-footer--absolute': props.absolute,
        'v-footer--fixed': !props.absolute && (props.app || props.fixed),
        'v-footer--padless': props.padless,
        'v-footer--inset': props.inset,
      }
    })
    const computedBottom: Ref<number | undefined> = computed(() => {
      if (!isPositioned.value) return undefined

      return props.app
        ? context.vuetify.application.bottom
        : 0
    })
    const computedLeft: Ref<number | undefined> = computed(() => {
      if (!isPositioned.value) return undefined

      return props.app && props.inset
        ? context.vuetify.application.left
        : 0
    })
    const computedRight: Ref<number | undefined> = computed(() => {
      if (!isPositioned.value) return undefined

      return props.app && props.inset
        ? context.vuetify.application.right
        : 0
    })
    const isPositioned: Ref<boolean> = computed(() => {
      return Boolean(
        props.absolute ||
        props.fixed ||
        props.app
      )
    })
    const styles: Ref<object> = computed(() => {
      const height = parseInt(props.height)

      return {
        ...VSheet.options.computed.styles.call(this),
        height: isNaN(height) ? height : convertToUnit(height),
        left: convertToUnit(computedLeft.value),
        right: convertToUnit(computedRight.value),
        bottom: convertToUnit(computedBottom.value),
      }
    })

  function updateApplication () {
      const height = parseInt(props.height)

      return isNaN(height)
        ? context.el ? context.el.clientHeight : 0
        : height
    }

  return {
    applicationProperty,
    classes,
    computedBottom,
    computedLeft,
    computedRight,
    isPositioned,
    styles,
    updateApplication,
  }
}
const VFooter = defineComponent({
  name: 'v-footer',
  props: VFooterProps,
  setup(props, context) {
    const {} = useVFooter(props, context)
    const data = props.setBackgroundColor(props.color, {
      staticClass: 'v-footer',
      class: classes.value,
      style: styles.value,
    })

    return h(props.tag, data, context.slots.default)
  },
})

export default VFooter

