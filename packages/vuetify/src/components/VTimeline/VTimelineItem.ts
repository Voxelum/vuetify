import { computed, defineComponent, ExtractPropTypes, h, inject, mergeProps, Ref, SetupContext, VNode } from 'vue'
import { backgroundColor, colorableProps } from '../../mixins/colorable'
// Mixins
import { default as useThemeable, themeableProps } from '../../mixins/themeable'
import VIcon from '../VIcon'
// Components
import { VTimelineProps } from './VTimeline'

export const VTimelineItemProps = {
  ...colorableProps,
  ...themeableProps,
  color: {
    type: String,
    default: 'primary',
  },
  fillDot: Boolean,
  hideDot: Boolean,
  icon: String,
  iconColor: String,
  large: Boolean,
  left: Boolean,
  right: Boolean,
  small: Boolean,
}

export function useVTimelineItem(props: ExtractPropTypes<typeof VTimelineItemProps>, context: SetupContext) {
  const { themeClasses, isDark } = useThemeable(props)
  const timeline = inject('timeline') as ExtractPropTypes<typeof VTimelineProps>
  const hasIcon: Ref<boolean> = computed(() => {
    return !!props.icon || !!context.slots.icon
  })

  const classes = computed(() => ({
    'v-timeline-item': true,
    'v-timeline-item--fill-dot': props.fillDot,
    'v-timeline-item--before': timeline.reverse ? props.right : props.left,
    'v-timeline-item--after': timeline.reverse ? props.left : props.right,
    ...themeClasses.value,
  }))

  function genBody() {
    return h('div', {
      class: 'v-timeline-item__body',
    }, context.slots.default)
  }
  function genIcon(): VNode | VNode[] {
    if (context.slots.icon) {
      return context.slots.icon?.()
    }

    return h(VIcon, {
      color: props.iconColor,
      dark: !isDark.value,
      small: props.small,
    }, props.icon)
  }
  function genInnerDot() {
    return h('div', mergeProps({
      class: 'v-timeline-item__inner-dot',
    }, backgroundColor(props.color)), [hasIcon.value && genIcon()])
  }
  function genDot() {
    return h('div', {
      class: {
        'v-timeline-item__dot': true,
        'v-timeline-item__dot--small': props.small,
        'v-timeline-item__dot--large': props.large,
      },
    }, [genInnerDot()])
  }
  function genDivider() {
    const children = []

    if (!props.hideDot) children.push(genDot())

    return h('div', {
      class: 'v-timeline-item__divider',
    }, children)
  }
  function genOpposite() {
    return h('div', {
      class: 'v-timeline-item__opposite',
    }, context.slots.opposite)
  }

  return {
    hasIcon,
    classes,
    genBody,
    genIcon,
    genInnerDot,
    genDot,
    genDivider,
    genOpposite,
  }
}
const VTimelineItem = defineComponent({
  name: 'v-timeline-item',
  props: VTimelineItemProps,
  setup(props, context) {
    const { genBody, genDivider, genOpposite, classes } = useVTimelineItem(props, context)
    return () => {
      const children = [
        genBody(),
        genDivider(),
      ]

      if (context.slots.opposite) children.push(genOpposite())

      return h('div', mergeProps({
        class: classes.value,
      }, context.attrs), children)
    }
  },
})

export default VTimelineItem

