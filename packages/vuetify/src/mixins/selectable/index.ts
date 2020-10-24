import { useVInput, VInputProps } from '@components/VInput/VInput'
import { cloneVNode, computed, ExtractPropTypes, h, mergeProps, reactive, Ref, SetupContext, VNodeProps, watch } from 'vue'
import { comparableProps } from '../comparable'
import useRippleable, { rippleableProps } from '../rippleable'

export const selectableProps = {
  ...VInputProps,
  ...rippleableProps,
  ...comparableProps,
  id: String,
  inputValue: null as any,
  falseValue: null as any,
  trueValue: null as any,
  multiple: {
    type: Boolean,
    default: null,
  },
  label: String,
}

export function prevent(e: Event) {
  e.preventDefault()
}

/* @vue/component */
// export default mixins(
//   VInput,
//   Rippleable,
//   Comparable


// model: {
//   prop: 'inputValue',
//   event: 'change',
// },

export function useSelectable(props: ExtractPropTypes<typeof selectableProps>, context: SetupContext) {
  const input = useVInput(props, context, 'change')
  const {
    appIsDark,
    isDark,
    internalValue,
    isDisabled,
    validationState,
    computedId,
    genLabel: _genLabel,
    isInteractive,
    validate,
    isFocused,
  } = input
  const { } = useRippleable(props)
  const data = reactive({
    hasColor: props.inputValue,
    lazyValue: props.inputValue,
  })

  const computedColor: Ref<string | undefined> = computed(() => {
    if (!isActive.value) return undefined
    if (props.color) return props.color
    if (isDark.value && !appIsDark.value) return 'white'
    return 'primary'
  })
  const isMultiple: Ref<boolean> = computed(() => {
    return props.multiple === true || (props.multiple === null && Array.isArray(internalValue.value))
  })
  const isActive: Ref<boolean> = computed(() => {
    const value = props.value
    const input = internalValue.value

    if (isMultiple.value) {
      if (!Array.isArray(input)) return false

      return input.some(item => props.valueComparator(item, value))
    }

    if (props.trueValue === undefined || props.falseValue === undefined) {
      return value
        ? props.valueComparator(value, input)
        : Boolean(input)
    }

    return props.valueComparator(input, props.trueValue)
  })
  const isDirty: Ref<boolean> = computed(() => {
    return isActive.value
  })
  const rippleState: Ref<string | undefined> = computed(() => {
    return !isDisabled.value && !validationState.value
      ? undefined
      : validationState.value
  })

  watch(() => props.inputValue, (val) => {
    data.lazyValue = val
    data.hasColor = val
  })

  function genLabel() {
    const label = _genLabel()

    if (!label) return label

    return cloneVNode(label, {
      // Label shouldn't cause the input to focus
      onClick: prevent
    })
  }
  function genInput(type: string, attrs: VNodeProps | Record<string, unknown>) {
    return h('input', mergeProps({
      'aria-checked': isActive.value.toString(),
      disabled: isDisabled.value,
      id: computedId.value,
      role: type,
      type,
      value: props.value,
      checked: isActive.value,
      onBlur,
      onChange,
      onFocus,
      onKeydown,
      ref: 'input',
    }, attrs))
  }
  function onBlur() {
    isFocused.value = false
  }
  function onClick(e: Event) {
    onChange()
    context.emit('click', e)
  }
  function onChange() {
    if (!isInteractive.value) return

    const value = props.value
    let input = internalValue.value

    if (isMultiple.value) {
      if (!Array.isArray(input)) {
        input = []
      }

      const length = input.length

      input = input.filter((item: any) => !props.valueComparator(item, value))

      if (input.length === length) {
        input.push(value)
      }
    } else if (props.trueValue !== undefined && props.falseValue !== undefined) {
      input = props.valueComparator(input, props.trueValue) ? props.falseValue : props.trueValue
    } else if (value) {
      input = props.valueComparator(input, value) ? null : value
    } else {
      input = !input
    }

    validate(true, input)
    internalValue.value = input
    data.hasColor = input
  }
  function onFocus() {
    isFocused.value = true
  }
  /** @abstract */
  function onKeydown(e: Event) { }
  return {
    ...input,
    computedColor,
    isMultiple,
    isActive,
    isDirty,
    rippleState,
    genLabel,
    genInput,
    onBlur,
    onClick,
    onChange,
    onFocus,
    onKeydown,
  }
}
