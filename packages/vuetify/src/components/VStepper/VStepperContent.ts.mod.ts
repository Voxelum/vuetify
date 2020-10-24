import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext, watch, resolveDirective, withDirectives, ref, inject } from 'vue'
// Components
import {
  VTabTransition,
  VTabReverseTransition,
} from '../transitions'

// Mixins
import { inject as RegistrableInject } from '../../mixins/registrable'

// Helpers
import { convertToUnit } from '../../util/helpers'

// Utilities
import mixins from '../../util/mixins'

// Types
import { VNode, FunctionalComponentOptions, VNodeData } from 'vue'
import { useVuetify } from '@framework'
export const VStepperContentProps = {
  step: {
    type: [Number, String],
    required: true,
  },
}

const baseMixins = mixins(
  RegistrableInject('stepper', 'v-stepper-content', 'v-stepper')
)

interface options extends InstanceType<typeof baseMixins> {
  $refs: {
    wrapper: HTMLElement
  }
  isVerticalProvided: boolean
}

/* @vue/component */
export function useVStepperContent(props: ExtractPropTypes<typeof VStepperContentProps>, context: SetupContext) {
  const data = reactive({
    height: 0 as number | string,
    // Must be null to allow
    // previous comparison
    isActive: null as boolean | null,
    isReverse: false,
    isVertical: props.isVerticalProvided,
  })

  const stepper = inject('stepper')
  const vuetify = useVuetify()
  const wrapper: Ref<null | HTMLElement> = ref(null)

  const computedTransition: Ref<FunctionalComponentOptions> = computed(() => {
    // Fix for #8978
    const reverse = vuetify.rtl ? !data.isReverse : data.isReverse

    return reverse
      ? VTabReverseTransition
      : VTabTransition
  })
  const styles: Ref<object> = computed(() => {
    if (!data.isVertical) return {}

    return {
      height: convertToUnit(data.height),
    }
  })

  watch(() => data.isActive, (current, previous) => {
    // If active and the previous state
    // was null, is just booting up
    if (current && previous == null) {
      data.height = 'auto'
      return
    }

    if (!data.isVertical) return

    if (data.isActive) enter()
    else leave()
  })

  onMounted(() => {
    wrapper.value!.addEventListener(
      'transitionend',
      onTransition,
      false
    )
    stepper && stepper.register(this)
  })

  onBeforeUnmount(() => {
    wrapper.value!.removeEventListener(
      'transitionend',
      onTransition,
      false
    )
    stepper && stepper.unregister(this)
  })

  function onTransition(e: TransitionEvent) {
    if (!data.isActive ||
      e.propertyName !== 'height'
    ) return

    data.height = 'auto'
  }
  function enter() {
    let scrollHeight = 0

    // Render bug with height
    requestAnimationFrame(() => {
      scrollHeight = wrapper.value!.scrollHeight
    })

    data.height = 0

    // Give the collapsing element time to collapse
    setTimeout(() => data.isActive && (data.height = (scrollHeight || 'auto')), 450)
  }
  function leave() {
    data.height = wrapper.value!.clientHeight
    setTimeout(() => (data.height = 0), 10)
  }
  function toggle(step: string | number, reverse: boolean) {
    data.isActive = step.toString() === props.step.toString()
    data.isReverse = reverse
  }

  const result = {
    data,
    computedTransition,
    styles,
    onTransition,
    enter,
    leave,
    toggle,
    wrapper,
  }

  return result
}

const VStepperContent = defineComponent({
  name: 'v-stepper-content',
  props: VStepperContentProps,
  setup(props, context) {
    const vshow = resolveDirective('v-show')
    const { styles, data, wrapper, computedTransition } = useVStepperContent(props, context)
    return () => {
      const wrapperNode = h('div', {
        class: 'v-stepper__wrapper',
        style: styles.value,
        ref: wrapper,
      }, [context.slots.default?.()])

      let content = h('div', {
        class: 'v-stepper__content',
      }, [wrapperNode])

      if (!data.isVertical) {
        content = withDirectives(content, [[vshow!, data.isActive]])
      }

      return h(computedTransition.value, context.attrs, [content])
    }
  },
})

export default VStepperContent

