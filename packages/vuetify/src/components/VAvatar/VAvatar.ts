import { computed, defineComponent, ExtractPropTypes, h, mergeProps, Ref, SetupContext } from 'vue'
import useColorable, { colorableProps } from '../../mixins/colorable'
import useMeasurable, { measurableProps } from '../../mixins/measurable'
import useRoundable, { roundableProps } from '../../mixins/roundable'
// Utilities
import { convertToUnit } from '../../util/helpers'
import './VAvatar.sass'

export const VAvatarProps = {
  ...colorableProps,
  ...measurableProps,
  ...roundableProps,
  left: Boolean,
  right: Boolean,
  size: {
    type: [Number, String],
    default: 48,
  },
}

// export default mixins(
//   Colorable,
//   Measurable,
//   Roundable,
/* @vue/component */
export function useVAvatar(props: ExtractPropTypes<typeof VAvatarProps>, context: SetupContext) {
  const { roundedClasses } = useRoundable(props)
  const { measurableStyles } = useMeasurable(props)
  const { setBackgroundColor } = useColorable(context)
  const classes: Ref<object> = computed(() => {
    return {
      'v-avatar': true,
      'v-avatar--left': props.left,
      'v-avatar--right': props.right,
      ...roundedClasses.value,
    }
  })
  const styles: Ref<object> = computed(() => {
    return {
      height: convertToUnit(props.size),
      minWidth: convertToUnit(props.size),
      width: convertToUnit(props.size),
      ...measurableStyles.value,
    }
  })

  return {
    classes,
    styles,
    setBackgroundColor,
  }
}

export default defineComponent({
  name: 'v-avatar',
  props: VAvatarProps,
  setup(props, context) {
    const { classes, styles, setBackgroundColor } = useVAvatar(props, context)
    return () => {
      return h('div', setBackgroundColor(props.color, mergeProps(context.attrs, {
        class: classes.value,
        style: styles.value,
      })), context.slots.default?.())
    }
  }
})
