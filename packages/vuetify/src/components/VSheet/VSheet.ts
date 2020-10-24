import { useElevationClasses } from '@composables/elevation'
import { elevatableProps } from '@mixins/elevatable'
import useMeasurable, { measurableProps } from '@mixins/measurable'
import useRoundable, { roundableProps } from '@mixins/roundable'
import useThemeable, { themeableProps } from '@mixins/themeable'
import { computed, defineComponent, ExtractPropTypes, h, mergeProps, Ref, SetupContext } from 'vue'
import useColorable, { backgroundColor, colorableProps } from '../../mixins/colorable'
// Styles
import './VSheet.sass'

// BindsAttrs,
// Colorable,
// Elevatable,
// Measurable,
// Roundable,
// Themeable
export const VSheetProps = {
  ...colorableProps,
  ...elevatableProps,
  ...measurableProps,
  ...roundableProps,
  ...themeableProps,
  outlined: Boolean,
  shaped: Boolean,
  tag: {
    type: String,
    default: 'div',
  },
  // ...bindsAttrsProps,
}

export function useVSheet(props: ExtractPropTypes<typeof VSheetProps>, context: SetupContext) {
  const { measurableStyles } = useMeasurable(props)
  const { themeClasses, ...themeables } = useThemeable(props)
  const { elevationClasses } = useElevationClasses(props)
  const { roundedClasses } = useRoundable(props)
  const classes: Ref<object> = computed(() => {
    return {
      ...themeClasses.value,
      ...elevationClasses.value,
      ...roundedClasses.value,
      'v-sheet': true,
      'v-sheet--outlined': props.outlined,
      'v-sheet--shaped': props.shaped,
    }
  })
  const styles: Ref<object> = measurableStyles
  return {
    classes,
    styles,
    ...themeables,
  }
}

/* @vue/component */
export default defineComponent({
  props: VSheetProps,
  setup(props, context) {
    const { classes, styles } = useVSheet(props, context)
    return h(
      props.tag,
      mergeProps(backgroundColor(props.color), {
        class: classes.value,
        style: styles.value,
      }, context.attrs),
      context.slots.default
    )
  },
})
