import { computed, defineComponent, ExtractPropTypes, h, mergeProps, provide, Ref, SetupContext } from 'vue'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Styles
import './VTimeline.sass'

export const VTimelineProps = {
  ...themeableProps,
  alignTop: Boolean,
  dense: Boolean,
  reverse: Boolean,
}

// Themeable
/* @vue/component */
export function useVTimeline(props: ExtractPropTypes<typeof VTimelineProps>, context: SetupContext) {
  const { themeClasses } = useThemeable(props)

  const classes: Ref<{}> = computed(() => {
    return {
      'v-timeline--align-top': props.alignTop,
      'v-timeline--dense': props.dense,
      'v-timeline--reverse': props.reverse,
      ...themeClasses,
    }
  })

  provide('timeline', props)

  return {
    classes,
  }
}
const VTimeline = defineComponent({
  name: 'v-timeline',
  props: VTimelineProps,
  setup(props, context) {
    const { classes } = useVTimeline(props, context)
    return () => h('div', mergeProps({
      class: 'v-timeline',
    }, { class: classes.value }, context.attrs), context.slots.default?.())
  },
})

export default VTimeline
