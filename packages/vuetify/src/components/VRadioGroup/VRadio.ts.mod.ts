import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VRadio.sass'

// Components
import VRadioGroup from './VRadioGroup'
import VLabel from '../VLabel'
import VIcon from '../VIcon'
import VInput from '../VInput'

// Mixins
import BindsAttrs from '../../mixins/binds-attrs'
import Colorable from '../../mixins/colorable'
import { factory as GroupableFactory } from '../../mixins/groupable'
import Rippleable from '../../mixins/rippleable'
import Themeable from '../../mixins/themeable'
import Selectable, { prevent } from '../../mixins/selectable'

// Utilities
import { getSlot } from '../../util/helpers'

// Types
import { VNode, VNodeData } from 'vue'
import mixins from '../../util/mixins'
import { mergeListeners } from '../../util/mergeData'
export const VRadioProps = {
}

const baseMixins = mixins(
  BindsAttrs,
  Colorable,
  Rippleable,
  GroupableFactory('radioGroup'),
  Themeable
)

interface options extends InstanceType<typeof baseMixins> {
  radioGroup: InstanceType<typeof VRadioGroup>
}

/* @vue/component */
export function useVRadio(props: ExtractPropTypes<typeof VRadioProps>, context: SetupContext) {


  const data = reactive({
    isFocused: false,
  })

  const classes: Ref<object> = computed(() => {
    return {
      'v-radio--is-disabled': isDisabled.value,
      'v-radio--is-focused': data.isFocused,
      ...props.themeClasses,
      ...props.groupClasses,
    }
  })
  const computedColor: Ref<string | undefined> = computed(() => {
    return Selectable.options.computed.computedColor.call(this)
  })
  const computedIcon: Ref<string> = computed(() => {
    return props.isActive
      ? props.onIcon
      : props.offIcon
  })
  const computedId: Ref<string> = computed(() => {
    return VInput.options.computed.computedId.call(this)
  })
  const hasLabel = computed({
    hasState(): boolean {
      return (props.radioGroup || {}).hasState
    })
  const isDisabled: Ref<boolean> = computed(() => {
    return props.disabled || (
      !!props.radioGroup &&
      props.radioGroup.isDisabled
    )
  })
  const isReadonly: Ref<boolean> = computed(() => {
    return props.readonly || (
      !!props.radioGroup &&
      props.radioGroup.isReadonly
    )
  })
  const computedName: Ref<string> = computed(() => {
    if (props.name || !props.radioGroup) {
      return props.name
    }

    return props.radioGroup.name || `radio-${props.radioGroup._uid}`
  })
  const rippleState: Ref<string | undefined> = computed(() => {
    return Selectable.options.computed.rippleState.call(this)
  })
  const validationState: Ref<string | undefined> = computed(() => {
    return (props.radioGroup || {}).validationState || computedColor.value
  })

  function genInput(args: any) {
    // We can't actually use the mixin directly because
    // it's made for standalone components, but its
    // genInput method is exactly what we need
    return Selectable.options.methods.genInput.call(this, 'radio', args)
  }
  function genLabel() {
    if (!hasLabel.value) return null

    return context.createElement(VLabel, {
      on: {
        // Label shouldn't cause the input to focus
        click: prevent,
      },
      attrs: {
        for: computedId.value,
      },
      props: {
        color: validationState.value,
        focused: props.hasState,
      },
    }, getSlot(this, 'label') || props.label)
  }
  function genRadio() {
    return context.createElement('div', {
      staticClass: 'v-input--selection-controls__input',
    }, [
      context.createElement(VIcon, props.setTextColor(validationState.value, {
        props: {
          dense: props.radioGroup && props.radioGroup.dense,
        },
      }), computedIcon.value),
      genInput({
        name: computedName.value,
        value: props.value,
        ...props.attrs$,
      }),
      props.genRipple(props.setTextColor(rippleState.value)),
    ])
  }
  function onFocus(e: Event) {
    data.isFocused = true
    context.emit('focus', e)
  }
  function onBlur(e: Event) {
    data.isFocused = false
    context.emit('blur', e)
  }
  function onChange() {
    if (isDisabled.value || isReadonly.value || props.isActive) return

    props.toggle()
  }
  function onKeydown() { } // Override default with noop

  return {
    classes,
    computedColor,
    computedIcon,
    computedId,
    hasLabel,
    isDisabled,
    isReadonly,
    computedName,
    rippleState,
    validationState,
    genInput,
    genLabel,
    genRadio,
    onFocus,
    onBlur,
    onChange,
    onKeydown:,
  }
}
const VRadio = defineComponent({
  name: 'v-radio',
  props: VRadioProps,
  setup(props, context) {
    const { } = useVRadio(props, context)
    const data: VNodeData = {
      staticClass: 'v-radio',
      class: classes.value,
      on: mergeListeners({
        click: onChange,
      }, props.listeners$),
    }

    return h('div', data, [
      genRadio(),
      genLabel(),
    ])
  },
})

export default VRadio

