import { computed, defineComponent, ExtractPropTypes, h, PropType, Ref, SetupContext } from 'vue'
import useMeasurable from '../../mixins/measurable'
import { useToggleableFactory } from '../../mixins/toggleable'
import { getSlot } from '../../util/helpers'

export const VLazyProps = {
  options: {
    type: Object,
    // For more information on types, navigate to:
    // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    default: () => ({
      root: undefined,
      rootMargin: undefined,
      threshold: undefined,
    }),
  } as any as PropType<IntersectionObserverInit>,
  tag: {
    type: String,
    default: 'div',
  },
  transition: {
    type: String,
    default: 'fade-transition',
  },
}

const useToggleable = useToggleableFactory()
// Measurable,
// Toggleable
export function useVLazy(props: ExtractPropTypes<typeof VLazyProps>, context: SetupContext) {
  const { measurableStyles } = useMeasurable(props)
  const { isActive } = useToggleable(props, context)

  const styles: Ref<object> = computed(() => {
    return {
      ...measurableStyles.value,
    }
  })

  function genContent() {
    const slot = getSlot(context)

    /* istanbul ignore if */
    if (!props.transition) return slot?.()

    const children = []

    if (isActive.value) children.push(slot?.())

    return h('transition', {
      props: { name: props.transition },
    }, children)
  }
  function onObserve(
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver,
    isIntersecting: boolean,
  ) {
    if (isActive.value) return

    isActive.value = isIntersecting
  }

  return {
    styles,
    genContent,
    onObserve,
  }
}
const VLazy = defineComponent({
  name: 'VLazy',
  props: VLazyProps,
  setup(props, context) {
    const { genContent, onObserve, styles } = useVLazy(props, context)
    return h(props.tag, {
      staticClass: 'v-lazy',
      directives: [{
        name: 'intersect',
        value: {
          handler: onObserve,
          options: props.options,
        },
      }],
      style: styles.value,
      ...context.attrs
    }, [genContent()])
  },
})

export default VLazy

