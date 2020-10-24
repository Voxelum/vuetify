import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VSnackbar.sass'

// Components
import VSheet from '../VSheet/VSheet'

// Mixins
import Colorable from '../../mixins/colorable'
import Themeable from '../../mixins/themeable'
import Toggleable from '../../mixins/toggleable'
import { factory as PositionableFactory } from '../../mixins/positionable'

// Utilities
import mixins from '../../util/mixins'
import { convertToUnit, getSlot } from '../../util/helpers'
import { deprecate, removed } from '../../util/console'

// Types
import { PropType, VNode } from 'vue'
export const VSnackbarProps = {
    app: Boolean,
    centered: Boolean,
    contentClass: {
      type: String,
      default: '',
    },
    multiLine: Boolean,
    text: Boolean,
    timeout: {
      type: [Number, String],
      default: 5000,
    },
    transition: {
      type: [Boolean, String] as PropType<false | string>,
      default: 'v-snack-transition',
      validator: v => typeof v === 'string' || v === false,
    },
    vertical: Boolean,
}

  VSheet,
  Colorable,
  Toggleable,
  PositionableFactory([
    'absolute',
    'bottom',
    'left',
    'right',
    'top',
  ])
/* @vue/component */
export function useVSnackbar(props: ExtractPropTypes<typeof VSnackbarProps>, context: SetupContext) {


  const data = reactive({
    activeTimeout: -1,
  })

    const classes: Ref<object> = computed(() => {
      return {
        'v-snack--absolute': props.absolute,
        'v-snack--active': props.isActive,
        'v-snack--bottom': props.bottom || !props.top,
        'v-snack--centered': props.centered,
        'v-snack--has-background': hasBackground.value,
        'v-snack--left': props.left,
        'v-snack--multi-line': props.multiLine && !props.vertical,
        'v-snack--right': props.right,
        'v-snack--text': props.text,
        'v-snack--top': props.top,
        'v-snack--vertical': props.vertical,
      }
    })
    const hasBackground: Ref<boolean> = computed(() => {
      return (
        !props.text &&
        !props.outlined
      )
    })
    const isDark: Ref<boolean> = computed(() => {
      return hasBackground.value
        ? !props.light
        : Themeable.options.computed.isDark.call(this)
    })
    const styles: Ref<object> = computed(() => {
      // Styles are not needed when
      // using the absolute prop.
      if (props.absolute) return {}

      const {
        bar,
        bottom,
        footer,
        insetFooter,
        left,
        right,
        top,
      } = context.vuetify.application

      // Should always move for y-axis
      // applicationable components.
      return {
        paddingBottom: convertToUnit(bottom + footer + insetFooter),
        paddingLeft: !props.app ? undefined : convertToUnit(left),
        paddingRight: !props.app ? undefined : convertToUnit(right),
        paddingTop: convertToUnit(bar + top),
      }
    })

{

  onMounted(() => {
    if (props.isActive) setTimeout()
  })

    /* istanbul ignore next */
    if (context.attrs.hasOwnProperty('auto-height')) {
      removed('auto-height', this)
    }

    /* istanbul ignore next */
    // eslint-disable-next-line eqeqeq
    if (props.timeout == 0) {
      deprecate('timeout="0"', '-1', this)
    }

  function genActions () {
      return context.createElement('div', {
        staticClass: 'v-snack__action ',
      }, [
        getSlot(this, 'action', {
          attrs: { class: 'v-snack__btn' },
        }),
      ])
    }
  function genContent () {
      return context.createElement('div', {
        staticClass: 'v-snack__content',
        class: {
          [props.contentClass]: true,
        },
        attrs: {
          role: 'status',
          'aria-live': 'polite',
        },
      }, [getSlot(this)])
    }
  function genWrapper () {
      const setColor = hasBackground.value
        ? props.setBackgroundColor
        : props.setTextColor

      const data = setColor(props.color, {
        staticClass: 'v-snack__wrapper',
        class: VSheet.options.computed.classes.call(this),
        directives: [{
          name: 'show',
          value: props.isActive,
        }],
      })

      return context.createElement('div', data, [
        genContent(),
        genActions(),
      ])
    }
  function genTransition () {
      return context.createElement('transition', {
        props: { name: props.transition },
      }, [genWrapper()])
    }
  function setTimeout () {
      window.clearTimeout(data.activeTimeout)

      const timeout = Number(props.timeout)

      if (
        !props.isActive ||
        // TODO: remove 0 in v3
        [0, -1].includes(timeout)
      ) {
        return
      }

      data.activeTimeout = window.setTimeout(() => {
        props.isActive = false
      }, timeout)
    }

  return {
    classes,
    hasBackground,
    isDark,
    styles,
    genActions,
    genContent,
    genWrapper,
    genTransition,
    setTimeout,
  }
}
const VSnackbar = defineComponent({
  name: 'v-snackbar',
  props: VSnackbarProps,
  setup(props, context) {
    const {} = useVSnackbar(props, context)
    return h('div', {
      staticClass: 'v-snack',
      class: classes.value,
      style: styles.value,
    }, [
      props.transition !== false
        ? genTransition()
        : genWrapper(),
    ])
  },
})

export default VSnackbar

