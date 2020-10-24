import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import '../../styles/components/_selection-controls.sass'
import './VSwitch.sass'

// Mixins
import Selectable from '../../mixins/selectable'
import VInput from '../VInput'

// Directives
import Touch from '../../directives/touch'

// Components
import { VFabTransition } from '../transitions'
import VProgressCircular from '../VProgressCircular/VProgressCircular'

// Helpers
import { keyCodes } from '../../util/helpers'

// Types
import { VNode } from 'vue'
import { useVInput } from '@components/VInput/VInput'
import { selectableProps } from '@mixins/selectable/index.ts.mod'

export const VSwitchProps = {
  ...selectableProps,
  inset: Boolean,
  loading: {
    type: [Boolean, String],
    default: false,
  },
  flat: {
    type: Boolean,
    default: false,
  },
}

/* @vue/component */
export function useVSwitch(props: ExtractPropTypes<typeof VSwitchProps>, context: SetupContext) {
  const {} = useVInput(props),

  const classes: Ref<object> = computed(() => {
    return {
      ...VInput.options.computed.classes.call(this),
      'v-input--selection-controls v-input--switch': true,
      'v-input--switch--flat': props.flat,
      'v-input--switch--inset': props.inset,
    }
  })
  const attrs: Ref<object> = computed(() => {
    return {
      'aria-checked': String(props.isActive),
      'aria-disabled': String(props.isDisabled),
      role: 'switch',
    }
  })
  const validationState: Ref<string | undefined> = computed(() => {
    if (props.hasError && props.shouldValidate) return 'error'
    if (props.hasSuccess) return 'success'
    if (props.hasColor !== null) return props.computedColor
    return undefined
  })
  const switchData: Ref<VNodeData> = computed(() => {
    return props.setTextColor(props.loading ? undefined : validationState.value, {
      class: props.themeClasses,
    })
  })

  function genDefaultSlot(): (VNode | null)[] {
    return [
      genSwitch(),
      props.genLabel(),
    ]
  }
  function genSwitch(): VNode {
    return context.createElement('div', {
      staticClass: 'v-input--selection-controls__input',
    }, [
      props.genInput('checkbox', {
        ...attrs.value,
        ...props.attrs$,
      }),
      props.genRipple(props.setTextColor(validationState.value, {
        directives: [{
          name: 'touch',
          value: {
            left: onSwipeLeft,
            right: onSwipeRight,
          },
        }],
      })),
      context.createElement('div', {
        staticClass: 'v-input--switch__track',
        ...switchData.value,
      }),
      context.createElement('div', {
        staticClass: 'v-input--switch__thumb',
        ...switchData.value,
      }, [genProgress()]),
    ])
  }
  function genProgress(): VNode {
    return context.createElement(VFabTransition, {}, [
      props.loading === false
        ? null
        : context.slots.progress || context.createElement(VProgressCircular, {
          props: {
            color: (props.loading === true || props.loading === '')
              ? (props.color || 'primary')
              : props.loading,
            size: 16,
            width: 2,
            indeterminate: true,
          },
        }),
    ])
  }
  function onSwipeLeft() {
    if (props.isActive) props.onChange()
  }
  function onSwipeRight() {
    if (!props.isActive) props.onChange()
  }
  function onKeydown(e: KeyboardEvent) {
    if (
      (e.keyCode === keyCodes.left && props.isActive) ||
      (e.keyCode === keyCodes.right && !props.isActive)
    ) props.onChange()
  }
  return {
    classes,
    attrs,
    validationState,
    switchData,
    genDefaultSlot,
    genSwitch,
    genProgress,
    onSwipeLeft,
    onSwipeRight,
    onKeydown,
  }
}
const VSwitch = defineComponent({
  name: 'v-switch',
  props: VSwitchProps,
  setup(props, context) {
    const { } = useVSwitch(props, context)
  },
})

export default VSwitch

