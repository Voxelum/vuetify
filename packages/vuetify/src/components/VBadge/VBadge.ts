import { useVuetify } from '@framework'
import { positionableProps } from '@mixins/positionable'
import useThemeable, { themeableProps } from '@mixins/themeable'
import { toggableProps, useToggleableFactory } from '@mixins/toggleable'
import { transitionableProps } from '@mixins/transitionable'
import { computed, defineComponent, ExtractPropTypes, h, Ref, SetupContext } from 'vue'
// Mixins
import useColorable, { colorableProps } from '../../mixins/colorable'
import {
  convertToUnit,
  getSlot
} from '../../util/helpers'
// Components
import VIcon from '../VIcon/VIcon'
// Styles
import './VBadge.sass'

export const VBadgeProps = {
  ...colorableProps,
  ...positionableProps(['left', 'bottom']),
  ...themeableProps,
  ...toggableProps('value'),
  ...transitionableProps,
  avatar: Boolean,
  bordered: Boolean,
  color: {
    type: String,
    default: 'primary',
  },
  content: { required: false },
  dot: Boolean,
  label: {
    type: String,
    default: '$vuetify.badge',
  },
  icon: String,
  inline: Boolean,
  offsetX: [Number, String],
  offsetY: [Number, String],
  overlap: Boolean,
  tile: Boolean,
  transition: {
    type: String,
    default: 'scale-rotate-transition',
  },
  value: { default: true },
}

const useToggleable = useToggleableFactory('value')
// export default mixins(
//   Colorable,
//   PositionableFactory(['left', 'bottom']),
//   Themeable,
//   Toggleable,
//   Transitionable,
/* @vue/component */
export function useVBadge(props: ExtractPropTypes<typeof VBadgeProps>, context: SetupContext) {
  const { themeClasses } = useThemeable(props)
  const { isActive } = useToggleable(props, context)
  const { setBackgroundColor } = useColorable(context)
  const vuetify = useVuetify()
  const classes: Ref<object> = computed(() => {
    return {
      'v-badge--avatar': props.avatar,
      'v-badge--bordered': props.bordered,
      'v-badge--bottom': props.bottom,
      'v-badge--dot': props.dot,
      'v-badge--icon': props.icon != null,
      'v-badge--inline': props.inline,
      'v-badge--left': props.left,
      'v-badge--overlap': props.overlap,
      'v-badge--tile': props.tile,
      ...themeClasses.value,
    }
  })
  const computedBottom: Ref<string> = computed(() => {
    return props.bottom ? 'auto' : computedYOffset.value
  })
  const computedLeft: Ref<string> = computed(() => {
    if (isRtl.value) {
      return props.left ? computedXOffset.value : 'auto'
    }

    return props.left ? 'auto' : computedXOffset.value
  })
  const computedRight: Ref<string> = computed(() => {
    if (isRtl.value) {
      return props.left ? 'auto' : computedXOffset.value
    }

    return !props.left ? 'auto' : computedXOffset.value
  })
  const computedTop: Ref<string> = computed(() => {
    return props.bottom ? computedYOffset.value : 'auto'
  })
  const computedXOffset: Ref<string> = computed(() => {
    return calcPosition(props.offsetX)
  })
  const computedYOffset: Ref<string> = computed(() => {
    return calcPosition(props.offsetY)
  })
  const isRtl: Ref<boolean> = computed(() => {
    return vuetify.rtl
  })
  const offset: Ref<number> = computed(() => {
    if (props.overlap) return props.dot ? 8 : 12
    return props.dot ? 2 : 4
  })
  const styles: Ref<object> = computed(() => {
    if (props.inline) return {}

    return {
      bottom: computedBottom.value,
      left: computedLeft.value,
      right: computedRight.value,
      top: computedTop.value,
    }
  })

  function calcPosition(offset: string | number | undefined | null): string {
    return `calc(100% - ${convertToUnit(offset)})`
  }
  function genBadge() {
    const lang = vuetify.lang
    const label = context.attrs['aria-label'] || lang.t(props.label)

    const data = setBackgroundColor(props.color, {
      staticClass: 'v-badge__badge',
      style: styles.value,
      attrs: {
        'aria-atomic': context.attrs['aria-atomic'] || 'true',
        'aria-label': label,
        'aria-live': context.attrs['aria-live'] || 'polite',
        title: context.attrs.title,
        role: context.attrs.role || 'status',
      },
      directives: [{
        name: 'show',
        value: isActive.value,
      }],
    })

    const badge = h('span', data, [genBadgeContent()])

    if (!props.transition) return badge

    return h('transition', {
      props: {
        name: props.transition,
        origin: props.origin,
        mode: props.mode,
      },
    }, [badge])
  }
  function genBadgeContent() {
    // Dot prop shows no content
    if (props.dot) return undefined

    const slot = getSlot(context, 'badge')

    if (slot) return slot?.()
    if (props.content) return String(props.content)
    if (props.icon) return h(VIcon, props.icon)

    return undefined
  }
  function genBadgeWrapper() {
    return h('span', {
      staticClass: 'v-badge__wrapper',
    }, [genBadge()])
  }

  return {
    classes,
    computedBottom,
    computedLeft,
    computedRight,
    computedTop,
    computedXOffset,
    computedYOffset,
    isRtl,
    offset,
    styles,
    getSlot,
    calcPosition,
    genBadge,
    genBadgeContent,
    genBadgeWrapper,
  }
}

const VBadge = defineComponent({
  name: 'v-badge',
  props: VBadgeProps,
  setup(props, context) {
    const { genBadgeWrapper, getSlot, classes } = useVBadge(props, context)
    return () => {
      const badge = [genBadgeWrapper()]
      const children = [getSlot(context)?.()]
      const {
        'aria-atomic': _x,
        'aria-label': _y,
        'aria-live': _z,
        role,
        title,
        ...attrs
      } = context.attrs

      if (props.inline && props.left) children.unshift(badge)
      else children.push(badge)

      return h('span', {
        staticClass: 'v-badge',
        attrs,
        class: classes.value,
      }, children)
    }
  }
})

export default VBadge
