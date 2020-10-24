import { computed, defineComponent, ExtractPropTypes, h, Ref, SetupContext } from 'vue'
import useColorable, { colorableProps } from '../../mixins/colorable'
import useElevatable, { elevatableProps } from '../../mixins/elevatable'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Helpers
import { convertToUnit } from '../../util/helpers'
import '../VCard/VCard.sass'
import './VPicker.sass'

// Colorable,
// Elevatable,
// Themeable

export const VPickerProps = {
  ...colorableProps,
  ...elevatableProps,
  ...themeableProps,
  flat: Boolean,
  fullWidth: Boolean,
  landscape: Boolean,
  noTitle: Boolean,
  transition: {
    type: String,
    default: 'fade-transition',
  },
  width: {
    type: [Number, String],
    default: 290,
  },
}

/* @vue/component */
export function useVPicker(props: ExtractPropTypes<typeof VPickerProps>, context: SetupContext) {
  const { themeClasses, isDark } = useThemeable(props)
  const { setBackgroundColor } = useColorable(context)
  const { elevationClasses } = useElevatable(props)

  const computedTitleColor: Ref<string | false> = computed(() => {
    const defaultTitleColor = isDark.value ? false : (props.color || 'primary')
    return props.color || defaultTitleColor
  })

  function genTitle() {
    return h('div', setBackgroundColor(computedTitleColor.value, {
      class: {
        'v-picker__title': true,
        'v-picker__title--landscape': props.landscape,
      },
    }), context.slots.title)
  }
  function genBodyTransition() {
    return h('transition', {
      name: props.transition,
    }, context.slots.default)
  }
  function genBody() {
    return h('div', {
      class: {
        'v-picker__body': true,
        'v-picker__body--no-title': props.noTitle,
        ...themeClasses.value,
      },
      style: props.fullWidth ? undefined : {
        width: convertToUnit(props.width),
      },
    }, [
      genBodyTransition(),
    ])
  }
  function genActions() {
    return h('div', {
      class: {
        'v-picker__actions v-card__actions': true,
        'v-picker__actions--no-title': props.noTitle,
      },
    }, context.slots.actions)
  }

  return {
    computedTitleColor,
    genTitle,
    genBodyTransition,
    genBody,
    genActions,
    themeClasses,
    elevationClasses,
  }
}

const VPicker = defineComponent({
  name: 'v-picker',
  props: VPickerProps,
  setup(props, context) {
    const { genTitle, genActions, genBody, themeClasses, elevationClasses } = useVPicker(props, context)
    return () => h('div', {
      class: {
        'v-picker': true,
        'v-card': true,
        'v-picker--flat': props.flat,
        'v-picker--landscape': props.landscape,
        'v-picker--full-width': props.fullWidth,
        ...themeClasses.value,
        ...elevationClasses.value,
      },
    }, [
      context.slots.title ? genTitle() : null,
      genBody(),
      context.slots.actions ? genActions() : null,
    ])
  },
})

export default VPicker

