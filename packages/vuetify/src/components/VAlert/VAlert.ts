import { useVSheet, VSheetProps } from '@components/VSheet/VSheet'
import { useVuetify } from '@framework'
import { backgroundColor, textColor } from '@mixins/colorable'
import { VNodeData } from '@util/vnodeData'
import { computed, defineComponent, ExtractPropTypes, h, mergeProps, Ref, resolveDirective, SetupContext, VNode, withDirectives } from 'vue'
// Mixins
import useToggleable from '../../mixins/toggleable'
import { transitionableProps } from '../../mixins/transitionable'
import { breaking } from '../../util/console'
// Components
import VBtn from '../VBtn'
import VIcon from '../VIcon'
// Styles
import './VAlert.sass'

export const VAlertProps = {
  border: {
    type: String,
    validator(val: string) {
      return [
        'top',
        'right',
        'bottom',
        'left',
      ].includes(val)
    },
  },
  closeLabel: {
    type: String,
    default: '$vuetify.close',
  },
  coloredBorder: Boolean,
  dense: Boolean,
  dismissible: Boolean,
  closeIcon: {
    type: String,
    default: '$cancel',
  },
  icon: {
    default: '',
    type: [Boolean, String],
    validator(val: boolean | string) {
      return typeof val === 'string' || val === false
    },
  },
  // outlined: Boolean,
  prominent: Boolean,
  text: Boolean,
  type: {
    type: String,
    validator(val: string) {
      return [
        'info',
        'error',
        'success',
        'warning',
      ].includes(val)
    },
  },
  value: {
    type: Boolean,
    default: true,
  },
  ...VSheetProps,
  // ...toggableProps,
  ...transitionableProps,
}

// VSheet,
// Toggleable,
// Transitionable

export function useVAlert(props: ExtractPropTypes<typeof VAlertProps>, context: SetupContext) {
  const { styles, classes: sheetClasses, isDark: themeIsDark } = useVSheet(props, context)
  const { isActive } = useToggleable(props, context)
  const vuetify = useVuetify()
  const vshow = resolveDirective('show')
  const __cachedBorder: Ref<VNode | null> = computed(() => {
    if (!props.border) return null

    let data: VNodeData = {
      class: {
        'v-alert__border': true,
        [`v-alert__border--${props.border}`]: true,
      },
    }

    if (props.coloredBorder) {
      data.class['v-alert__border--has-color'] = true
    }

    return h('div', mergeProps(data, backgroundColor(computedColor.value)))
  })
  const __cachedDismissible: Ref<VNode | null> = computed(() => {
    if (!props.dismissible) return null

    const color = iconColor.value

    return h(VBtn, {
      class: 'v-alert__dismissible',
      color,
      icon: true,
      small: true,
      'aria-label': vuetify.lang.t(props.closeLabel),
      onClick: () => (isActive.value = false),
    }, [
      h(VIcon, {
        color
      }, props.closeIcon),
    ])
  })
  const __cachedIcon: Ref<VNode | null> = computed(() => {
    if (!computedIcon.value) return null

    return h(VIcon, {
      class: 'v-alert__icon',
      color: iconColor.value,
    }, computedIcon.value)
  })
  const classes: Ref<object> = computed(() => {
    const classes: Record<string, boolean> = {
      ...sheetClasses.value,
      'v-alert': true,
      'v-alert--border': Boolean(props.border),
      'v-alert--dense': props.dense ?? false,
      'v-alert--outlined': props.outlined ?? false,
      'v-alert--prominent': props.prominent ?? false,
      'v-alert--text': props.text ?? false,
    }

    if (props.border) {
      classes[`v-alert--border-${props.border}`] = true
    }

    return classes
  })
  const computedColor: Ref<string> = computed(() => {
    return props.color || props.type || ''
  })
  const computedIcon: Ref<string | boolean> = computed(() => {
    if (props.icon === false) return false
    if (typeof props.icon === 'string' && props.icon) return props.icon
    if (!['error', 'info', 'success', 'warning'].includes(props.type ?? '')) return false

    return `$${props.type}`
  })
  const hasColoredIcon: Ref<boolean> = computed(() => {
    return (
      hasText.value ||
      (Boolean(props.border) && props.coloredBorder)
      || false
    )
  })
  const hasText: Ref<boolean> = computed(() => {
    return props.text || props.outlined || false
  })
  const iconColor: Ref<string | undefined> = computed(() => {
    return hasColoredIcon.value ? computedColor.value : undefined
  })
  const isDark: Ref<boolean> = computed(() => {
    if (
      props.type &&
      !props.coloredBorder &&
      !props.outlined
    ) return true

    return themeIsDark.value
  })

  /* istanbul ignore next */
  if (context.attrs.hasOwnProperty('outline')) {
    breaking('outline', 'outlined', context)
  }

  function genWrapper(): VNode {
    const children = [
      context.slots.prepend?.() || __cachedIcon.value,
      genContent(),
      __cachedBorder.value,
      context.slots.append?.(),
      context.slots.close
        ? context.slots.close({ toggle: toggle })
        : __cachedDismissible.value,
    ]

    const data: VNodeData = {
      class: 'v-alert__wrapper',
    }

    return h('div', data, children)
  }
  function genContent(): VNode {
    return h('div', {
      class: 'v-alert__content',
    }, context.slots.default)
  }
  function genAlert(): VNode {
    let data: VNodeData = {
      role: 'alert',
      ...context.attrs,
      class: classes.value,
      style: styles.value,
      // directives: [{
      //   name: 'show',
      //   value: isActive.value,
      // }],
    }

    let extra = {}
    if (!props.coloredBorder) {
      const setColor = hasText.value ? textColor : backgroundColor
      extra = setColor(computedColor.value)
    }


    return withDirectives(h('div', mergeProps(data, extra), [genWrapper()]), [[vshow!, isActive]])
  }
  /** @public */
  function toggle() {
    isActive.value = !isActive.value
  }

  return {
    __cachedBorder,
    __cachedDismissible,
    __cachedIcon,
    classes,
    computedColor,
    computedIcon,
    hasColoredIcon,
    hasText,
    iconColor,
    isDark,
    genWrapper,
    genContent,
    genAlert,
    toggle,
  }
}

export default defineComponent({
  props: VAlertProps,
  setup(props, context) {
    const { genAlert } = useVAlert(props, context)
    return () => {
      const render = genAlert()

      if (!props.transition) return render

      return h('transition', {
        props: {
          name: props.transition,
          origin: props.origin,
          mode: props.mode,
        },
      }, [render])
    }
  },
})
