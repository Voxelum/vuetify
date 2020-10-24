import { computed, defineComponent, ExtractPropTypes, h, Ref, SetupContext, VNode } from 'vue'
// Mixins
import useMeasurable, { measurableProps, NumberOrNumberString } from '../../mixins/measurable'
import './VResponsive.sass'

// Utils

export const VResponsiveProps = {
  ...measurableProps,
  aspectRatio: [String, Number] as NumberOrNumberString,
}

/* @vue/component */
export function useVResponsive(props: ExtractPropTypes<typeof VResponsiveProps>, context: SetupContext) {
  const { measurableStyles } = useMeasurable(props)
  const computedAspectRatio: Ref<number> = computed(() => {
    return Number(props.aspectRatio)
  })
  const aspectStyle: Ref<object | undefined> = computed(() => {
    return computedAspectRatio.value
      ? { paddingBottom: (1 / computedAspectRatio.value) * 100 + '%' }
      : undefined
  })
  const __cachedSizer: Ref<VNode | []> = computed(() => {
    if (!aspectStyle.value) return []

    return h('div', {
      style: aspectStyle.value,
      staticClass: 'v-responsive__sizer',
    })
  })

  function genContent(): VNode {
    return h('div', {
      staticClass: 'v-responsive__content',
    }, context.slots.default)
  }

  return {
    measurableStyles,
    computedAspectRatio,
    aspectStyle,
    __cachedSizer,
    genContent,
  }
}

const VResponsive = defineComponent({
  name: 'v-responsive',
  props: VResponsiveProps,
  setup(props, context) {
    const { genContent, __cachedSizer, measurableStyles } = useVResponsive(props, context)
    return h('div', {
      staticClass: 'v-responsive',
      style: measurableStyles.value,
      ...context.attrs,
    }, [
      __cachedSizer.value,
      genContent(),
    ])
  },
})

export default VResponsive

