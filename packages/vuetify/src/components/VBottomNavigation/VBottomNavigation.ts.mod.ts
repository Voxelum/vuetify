import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VBottomNavigation.sass'

// Mixins
import Applicationable from '../../mixins/applicationable'
import ButtonGroup from '../../mixins/button-group'
import Colorable from '../../mixins/colorable'
import Measurable from '../../mixins/measurable'
import Proxyable from '../../mixins/proxyable'
import Scrollable from '../../mixins/scrollable'
import Themeable from '../../mixins/themeable'
import { factory as ToggleableFactory } from '../../mixins/toggleable'

// Utilities
import mixins from '../../util/mixins'
import { breaking } from '../../util/console'

// Types
import { VNode } from 'vue'
export const VBottomNavigationProps = {
    activeClass: {
      type: String,
      default: 'v-btn--active',
    },
    backgroundColor: String,
    grow: Boolean,
    height: {
      type: [Number, String],
      default: 56,
    },
    hideOnScroll: Boolean,
    horizontal: Boolean,
    inputValue: {
      type: Boolean,
      default: true,
    },
    mandatory: Boolean,
    shift: Boolean,
}

  Applicationable('bottom', [
    'height',
    'inputValue',
  ]),
  Colorable,
  Measurable,
  ToggleableFactory('inputValue'),
  Proxyable,
  Scrollable,
  Themeable
  /* @vue/component */
export function useVBottomNavigation(props: ExtractPropTypes<typeof VBottomNavigationProps>, context: SetupContext) {


  const data = reactive({
      isActive: props.inputValue,
    }
)

    const canScroll: Ref<boolean> = computed(() => {
      return (
        Scrollable.options.computed.canScroll.call(this) &&
        (
          props.hideOnScroll ||
          !props.inputValue
        )
      )
    })
    const classes: Ref<object> = computed(() => {
      return {
        'v-bottom-navigation--absolute': props.absolute,
        'v-bottom-navigation--grow': props.grow,
        'v-bottom-navigation--fixed': !props.absolute && (props.app || props.fixed),
        'v-bottom-navigation--horizontal': props.horizontal,
        'v-bottom-navigation--shift': props.shift,
      }
    })
    const styles: Ref<object> = computed(() => {
      return {
        ...props.measurableStyles,
        transform: data.isActive ? 'none' : 'translateY(100%)',
      }
    })

    /* istanbul ignore next */
    if (context.attrs.hasOwnProperty('active')) {
      breaking('active.sync', 'value or v-model', this)
    }

  function thresholdMet () {
      data.isActive = !props.isScrollingUp
      context.emit('update:input-value', data.isActive)
    }
  function updateApplication (): number {
      return context.el
        ? context.el.clientHeight
        : 0
    }
  function updateValue (val: any) {
      context.emit('change', val)
    }

  return {
    canScroll,
    classes,
    styles,
    thresholdMet,
    updateApplication,
    updateValue,
  }
}
const VBottomNavigation = defineComponent({
  name: 'v-bottom-navigation',
  props: VBottomNavigationProps,
  setup(props, context) {
    const {} = useVBottomNavigation(props, context)
    const data = props.setBackgroundColor(props.backgroundColor, {
      staticClass: 'v-bottom-navigation',
      class: classes.value,
      style: styles.value,
      props: {
        activeClass: props.activeClass,
        mandatory: Boolean(
          props.mandatory ||
          props.value !== undefined
        ),
        value: props.internalValue,
      },
      on: { change: updateValue },
    })

    if (canScroll.value) {
      data.directives = data.directives || []

      data.directives.push({
        arg: props.scrollTarget,
        name: 'scroll',
        value: props.onScroll,
      })
    }

    return h(ButtonGroup, props.setTextColor(props.color, data), context.slots.default)
  },
})

export default VBottomNavigation

