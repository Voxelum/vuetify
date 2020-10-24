import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Components
import VIcon from '../VIcon'

// Mixins
import Colorable from '../../mixins/colorable'
import { inject as RegistrableInject } from '../../mixins/registrable'

// Directives
import ripple from '../../directives/ripple'

// Utilities
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'
export const VStepperStepProps = {
}

type VuetifyStepperRuleValidator = () => string | boolean

const baseMixins = mixins(
  Colorable,
  RegistrableInject('stepper', 'v-stepper-step', 'v-stepper')
)

interface options extends InstanceType<typeof baseMixins> {
  stepClick: (step: number | string) => void
}
/* @vue/component */
export function useVStepperStep(props: ExtractPropTypes<typeof VStepperStepProps>, context: SetupContext) {


  const data = reactive({
      isActive: false,
      isInactive: true,
    }
)

    const classes: Ref<object> = computed(() => {
      return {
        'v-stepper__step--active': data.isActive,
        'v-stepper__step--editable': props.editable,
        'v-stepper__step--inactive': data.isInactive,
        'v-stepper__step--error error--text': hasError.value,
        'v-stepper__step--complete': props.complete,
      }
    })
    const hasError: Ref<boolean> = computed(() => {
      return props.rules.some(validate => validate() !== true)
    })

  onMounted(() => {
    props.stepper && props.stepper.register(this)
  })

  onBeforeUnmount(() => {
    props.stepper && props.stepper.unregister(this)
  })

  function click (e: MouseEvent) {
      e.stopPropagation()

      context.emit('click', e)

      if (props.editable) {
        props.stepClick(props.step)
      }
    }
  function genIcon (icon: string) {
      return context.createElement(VIcon, icon)
    }
  function genLabel () {
      return context.createElement('div', {
        staticClass: 'v-stepper__label',
      }, context.slots.default)
    }
  function genStep () {
      const color = (!hasError.value && (props.complete || data.isActive)) ? props.color : false

      return context.createElement('span', props.setBackgroundColor(color, {
        staticClass: 'v-stepper__step__step',
      }), genStepContent())
    }
  function genStepContent () {
      const children = []

      if (hasError.value) {
        children.push(genIcon(props.errorIcon))
      } else if (props.complete) {
        if (props.editable) {
          children.push(genIcon(props.editIcon))
        } else {
          children.push(genIcon(props.completeIcon))
        }
      } else {
        children.push(String(props.step))
      }

      return children
    }
  function toggle (step: number | string) {
      data.isActive = step.toString() === props.step.toString()
      data.isInactive = Number(step) < Number(props.step)
    }

  return {
    classes,
    hasError,
    click,
    genIcon,
    genLabel,
    genStep,
    genStepContent,
    toggle,
  }
}
const VStepperStep = defineComponent({
  name: 'v-stepper-step',
  props: VStepperStepProps,
  setup(props, context) {
    const {} = useVStepperStep(props, context)
    return h('div', {
      staticClass: 'v-stepper__step',
      class: classes.value,
      directives: [{
        name: 'ripple',
        value: props.editable,
      }],
      on: { click: click },
    }, [
      genStep(),
      genLabel(),
    ])
  },
})

export default VStepperStep

