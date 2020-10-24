import { computed, defineComponent, ExtractPropTypes, h, mergeProps, Ref, SetupContext, VNode } from 'vue'
import useThemeable, { themeableProps } from '../../mixins/themeable'
import { backgroundColor, colorableProps } from './../../mixins/colorable'
import { toggableFactory } from './../../mixins/toggleable'
// Styles
import './VOverlay.sass'

const { toggableProps, useToggleable } = toggableFactory()

export const VOverlayProps = {
  ...colorableProps,
  ...themeableProps,
  ...toggableProps,
  absolute: Boolean,
  color: {
    type: String,
    default: '#212121',
  },
  dark: {
    type: Boolean,
    default: true,
  },
  opacity: {
    type: [Number, String],
    default: 0.46,
  },
  value: {
    default: true,
  },
  zIndex: {
    type: [Number, String],
    default: 5,
  },
}

/* @vue/component */
// Colorable,
//   Themeable,
//   Toggleable
export function useVOverlay(props: ExtractPropTypes<typeof VOverlayProps>, context: SetupContext) {
  const { isActive } = useToggleable(props, context)
  const { themeClasses } = useThemeable(props)

  const __scrim: Ref<VNode> = computed(() => {
    return h('div', mergeProps(backgroundColor(props.color), {
      class: 'v-overlay__scrim',
      style: {
        opacity: computedOpacity.value,
      },
    }))
  })
  const classes: Ref<object> = computed(() => {
    return {
      'v-overlay': true,
      'v-overlay--absolute': props.absolute,
      'v-overlay--active': isActive.value,
      ...themeClasses.value,
    }
  })
  const computedOpacity: Ref<number> = computed(() => {
    return Number(isActive.value ? props.opacity : 0)
  })
  const styles: Ref<object> = computed(() => {
    return {
      zIndex: props.zIndex,
    }
  })

  function genContent() {
    return h('div', {
      class: 'v-overlay__content',
    }, context.slots.default)
  }

  return {
    __scrim,
    classes,
    computedOpacity,
    styles,
    genContent,
    isActive,
  }
}

const VOverlay = defineComponent({
  name: 'v-overlay',
  props: VOverlayProps,
  setup(props, context) {
    const { __scrim, isActive, genContent, classes, styles } = useVOverlay(props, context)
    return () => {
      const children = [__scrim.value]

      if (isActive.value) children.push(genContent())

      return h('div', mergeProps({
        class: classes.value,
        style: styles.value,
      }, context.attrs), children)
    }
  },
})

export default VOverlay

