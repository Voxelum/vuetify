import { useVSheet, VSheetProps } from '@components/VSheet/VSheet'
import { computed, defineComponent, ExtractPropTypes, h, Ref, SetupContext } from 'vue'
import useLoadable, { loadableProps } from '../../mixins/loadable'
import useRoutable, { routableProps } from '../../mixins/routable'
// Styles
import './VCard.sass'

const cardProps = {
  flat: Boolean,
  hover: Boolean,
  img: String,
  link: Boolean,
  loaderHeight: {
    type: [Number, String],
    default: 4,
  },
  raised: Boolean,
}

export const VCardProps = {
  ...loadableProps,
  ...routableProps,
  ...VSheetProps,
  ...cardProps,
}

/* @vue/component */
export function useVCard(props: ExtractPropTypes<typeof VCardProps>, context: SetupContext) {
  const { classes: routableClasses, generateRouteLink, isClickable } = useRoutable(props, context)
  const { classes: sheetClasses, styles: sheetStyles } = useVSheet(props, context)
  const { genProgress: loadableGenProgress } = useLoadable(props, context)
  const classes: Ref<object> = computed(() => {
    return {
      'v-card': true,
      ...routableClasses.value,
      'v-card--flat': props.flat,
      'v-card--hover': props.hover,
      'v-card--link': isClickable.value,
      'v-card--loading': props.loading,
      'v-card--disabled': props.disabled,
      'v-card--raised': props.raised,
      ...sheetClasses.value,
    }
  })
  const styles: Ref<object> = computed(() => {
    const style: Dictionary<string> = {
      ...sheetStyles.value,
    }

    if (props.img) {
      style.background = `url("${props.img}") center center / cover no-repeat`
    }

    return style
  })

  function genProgress() {
    const render = loadableGenProgress()

    if (!render) return null

    return h('div', {
      class: 'v-card__progress',
      key: 'progress',
    }, [render])
  }

  return {
    classes,
    styles,
    isClickable,
    genProgress,
    generateRouteLink,
  }
}

export default defineComponent({
  name: 'v-card',
  props: VCardProps,
  setup(props, context) {
    const { generateRouteLink, styles, isClickable, genProgress } = useVCard(props, context)
    return () => {
      const { tag, data } = generateRouteLink()

      data.style = styles.value

      if (isClickable.value) {
        data.attrs = data.attrs || {}
        data.attrs.tabindex = 0
      }

      return h(tag, setBackgroundColor(props.color, data), [
        genProgress(),
        context.slots.default?.(),
      ])
    }
  },
})