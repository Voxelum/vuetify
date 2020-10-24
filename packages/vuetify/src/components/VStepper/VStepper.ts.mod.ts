import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext, watch, nextTick } from 'vue'
// Styles
import './VStepper.sass'

// Components
import VStepperStep from './VStepperStep'
import VStepperContent from './VStepperContent'

// Mixins
import { provide as RegistrableProvide } from '../../mixins/registrable'
import Proxyable from '../../mixins/proxyable'
import Themeable, { themeableProps } from '../../mixins/themeable'

// Utilities
import mixins from '../../util/mixins'
import { breaking } from '../../util/console'

// Types
import { VNode } from 'vue'
import useThemeable from '../../mixins/themeable'
export const VStepperProps = {
  ...themeableProps,
  altLabels: Boolean,
  nonLinear: Boolean,
  vertical: Boolean,
}

const baseMixins = mixins(
  RegistrableProvide('stepper'),
  Proxyable,
  Themeable
)

type VStepperStepInstance = InstanceType<typeof VStepperStep>
type VStepperContentInstance = InstanceType<typeof VStepperContent>

/* @vue/component */
export function useVStepper(props: ExtractPropTypes<typeof VStepperProps>, context: SetupContext) {
  const { themeClasses } = useThemeable(props)
  const data = reactive({
    isBooted: false,
    steps: [] as VStepperStepInstance[],
    content: [] as VStepperContentInstance[],
    isReverse: false,
    internalLazyValue: props.value != null
      ? props.value
      : (data[0] || {}).step || 1,
  })
  const classes: Ref<object> = computed(() => {
    return {
      'v-stepper': true,
      'v-stepper--is-booted': data.isBooted,
      'v-stepper--vertical': props.vertical,
      'v-stepper--alt-labels': props.altLabels,
      'v-stepper--non-linear': props.nonLinear,
      ...themeClasses.value,
    }
  })

  watch(() => data.internalvalue, (val, oldVal) => {
    data.isReverse = Number(val) < Number(oldVal)
    oldVal && (data.isBooted = true)
    updateView()
  })

  /* istanbul ignore next */
  if (context.attrs.onInput) {
    breaking('@input', '@change', context)
  }

  onMounted(() => {
    updateView()
  })

  function register(item: VStepperStepInstance | VStepperContentInstance) {
    if (item.$options.name === 'v-stepper-step') {
      data.steps.push(item as VStepperStepInstance)
    } else if (item.$options.name === 'v-stepper-content') {
      (item as VStepperContentInstance).isVertical = props.vertical
      data.content.push(item as VStepperContentInstance)
    }
  }
  function unregister(item: VStepperStepInstance | VStepperContentInstance) {
    if (item.$options.name === 'v-stepper-step') {
      data.steps = data.steps.filter((i: VStepperStepInstance) => i !== item)
    } else if (item.$options.name === 'v-stepper-content') {
      (item as VStepperContentInstance).isVertical = props.vertical
      data.content = data.content.filter((i: VStepperContentInstance) => i !== item)
    }
  }
  function stepClick(step: string | number) {
    nextTick(() => (props.internalValue = step))
  }
  function updateView() {
    for (let index = data.steps.length; --index >= 0;) {
      data.steps[index].toggle(props.internalValue as any)
    }
    for (let index = data.content.length; --index >= 0;) {
      data.content[index].toggle(props.internalValue as any, data.isReverse)
    }
  }

  return {
    classes,
    register,
    unregister,
    stepClick,
    updateView,
  }
}
const VStepper = defineComponent({
  name: 'v-stepper',
  props: VStepperProps,
  setup(props, context) {
    const { classes} = useVStepper(props, context)
    return h('div', {
      class: classes.value,
    }, context.slots.default)
  },
})

export default VStepper

