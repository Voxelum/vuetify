import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VSystemBar.sass'

// Mixins
import Applicationable from '../../mixins/applicationable'
import Colorable from '../../mixins/colorable'
import Themeable from '../../mixins/themeable'

// Utilities
import mixins from '../../util/mixins'
import { convertToUnit, getSlot } from '../../util/helpers'

// Types
import { VNode } from 'vue/types'
export const VSystemBarProps = {
    height: [Number, String],
    lightsOut: Boolean,
    window: Boolean,
}

  Applicationable('bar', [
    'height',
    'window',
  ]),
  Colorable,
  Themeable
/* @vue/component */
export function useVSystemBar(props: ExtractPropTypes<typeof VSystemBarProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        'v-system-bar--lights-out': props.lightsOut,
        'v-system-bar--absolute': props.absolute,
        'v-system-bar--fixed': !props.absolute && (props.app || props.fixed),
        'v-system-bar--window': props.window,
        ...props.themeClasses,
      }
    })
    const computedHeight: Ref<number | string> = computed(() => {
      if (props.height) {
        return isNaN(parseInt(props.height)) ? props.height : parseInt(props.height)
      }

      return props.window ? 32 : 24
    })
    const styles: Ref<object> = computed(() => {
      return {
        height: convertToUnit(computedHeight.value),
      }
    })

  function updateApplication () {
      return context.el
        ? context.el.clientHeight
        : computedHeight.value
    }

  return {
    classes,
    computedHeight,
    styles,
    updateApplication,
  }
}
const VSystemBar = defineComponent({
  name: 'v-system-bar',
  props: VSystemBarProps,
  setup(props, context) {
    const {} = useVSystemBar(props, context)
    const data = {
      staticClass: 'v-system-bar',
      class: classes.value,
      style: styles.value,
      on: context.listeners,
    }

    return h('div', props.setBackgroundColor(props.color, data), getSlot(this))
  },
})

export default VSystemBar

