import { VFormContent } from '@components/VForm/VForm'
import { InjectionKey } from '@util/injection'
import { InputMessage, InputValidationRules } from 'types'
import { computed, ExtractPropTypes, inject, nextTick, onBeforeUnmount, PropType, reactive, Ref, SetupContext, toRefs, watch } from 'vue'
import { consoleError } from '../../util/console'
// Utilities
import { deepEqual } from '../../util/helpers'
import { colorableProps } from '../colorable'
import { Registrable } from '../registrable'
import useThemeable, { themeableProps } from '../themeable'

// Colorable,
// RegistrableInject<'form', any>('form'),
// Themeable,
export const validatableProps = {
  ...themeableProps,
  ...colorableProps,
  disabled: Boolean,
  error: Boolean,
  errorCount: {
    type: [Number, String],
    default: 1,
  },
  errorMessages: {
    type: [String, Array],
    default: () => [],
  } as any as PropType<InputMessage> /* as PropValidator<InputMessage | null> */,
  messages: {
    type: [String, Array],
    default: () => [],
  } as any as PropType<InputMessage> /* as PropValidator<InputMessage | null> */,
  readonly: Boolean,
  rules: {
    type: Array,
    default: () => [],
  } as any as PropType<InputValidationRules> /* as PropValidator<InputValidationRules> */,
  success: Boolean,
  successMessages: {
    type: [String, Array],
    default: () => [],
  } as any as PropType<InputMessage>/* as PropValidator<InputMessage | null> */,
  validateOnBlur: Boolean,
  value: { required: false },
}

const FormRegistrableKey: InjectionKey<Registrable> = 'form'

export type Validatable = ReturnType<typeof useValidatable>

// TODO: check this
// this is a uid workaround
let uids = 0

/* @vue/component */
export default function useValidatable(props: ExtractPropTypes<typeof validatableProps>, context: SetupContext) {
  const { appIsDark, isDark, ...themeable } = useThemeable(props)

  const data = reactive({
    errorBucket: [] as string[],
    hasColor: false,
    hasFocused: false,
    hasInput: false,
    isFocused: false,
    isResetting: false,
    lazyValue: props.value,
    valid: false,
  })

  const form = inject<VFormContent>(FormRegistrableKey)

  const computedColor: Ref<string | undefined> = computed(() => {
    if (isDisabled.value) return undefined
    if (props.color) return props.color
    // It's assumed that if the input is on a
    // dark background, the user will want to
    // have a white color. If the entire app
    // is setup to be dark, then they will
    // like want to use their primary color
    if (isDark.value && !appIsDark.value) return 'white'
    else return 'primary'
  })
  const hasError: Ref<boolean> = computed(() => {
    return (
      internalErrorMessages.value.length > 0 ||
      data.errorBucket.length > 0 ||
      props.error
    ) ?? false // TODO: check this
  })
  const hasSuccess: Ref<boolean> = computed(() => {
    return (
      internalSuccessMessages.value.length > 0 ||
      props.success
    ) ?? false // TODO: check this
  })
  const externalError: Ref<boolean> = computed(() => {
    return (internalErrorMessages.value.length > 0 || props.error) ?? false // TODO: check this
  })
  const hasMessages: Ref<boolean> = computed(() => {
    return validationTarget.value.length > 0
  })
  const hasState: Ref<boolean> = computed(() => {
    if (isDisabled.value) return false

    return (
      hasSuccess.value ||
      (shouldValidate.value && hasError.value)
    )
  })
  const internalErrorMessages: Ref<InputValidationRules> = computed(() => {
    return genInternalMessages(props.errorMessages)
  })
  const internalMessages: Ref<InputValidationRules> = computed(() => {
    return genInternalMessages(props.messages)
  })
  const internalSuccessMessages: Ref<InputValidationRules> = computed(() => {
    return genInternalMessages(props.successMessages)
  })
  const internalValue = computed({
    get(): unknown {
      return data.lazyValue
    },
    set(val: any) {
      data.lazyValue = val

      context.emit('input', val)
    },
  })
  const isDisabled: Ref<boolean> = computed(() => {
    return props.disabled || (
      !!form &&
      form.props.disabled
    ) || false
  })
  const isInteractive: Ref<boolean> = computed(() => {
    return !isDisabled.value && !isReadonly.value
  })
  const isReadonly: Ref<boolean> = computed(() => {
    return props.readonly || (
      !!form &&
      form.props.readonly
    ) || false
  })
  const shouldValidate: Ref<boolean> = computed(() => {
    if (externalError.value) return true
    if (data.isResetting) return false

    return props.validateOnBlur
      ? data.hasFocused && !data.isFocused
      : (data.hasInput || data.hasFocused)
  })
  const validations: Ref<InputValidationRules> = computed(() => {
    return validationTarget.value.slice(0, Number(props.errorCount))
  })
  const validationState: Ref<string | undefined> = computed(() => {
    if (isDisabled.value) return undefined
    if (hasError.value && shouldValidate.value) return 'error'
    if (hasSuccess.value) return 'success'
    if (data.hasColor) return computedColor.value
    return undefined
  })
  const validationTarget: Ref<InputValidationRules> = computed(() => {
    if (internalErrorMessages.value.length > 0) {
      return internalErrorMessages.value
    } else if (props.successMessages && props.successMessages.length > 0) {
      return internalSuccessMessages.value
    } else if (props.messages && props.messages.length > 0) {
      return internalMessages.value
    } else if (shouldValidate.value) {
      return data.errorBucket
    } else return []
  })

  watch(() => props.rules, (newVal, oldVal) => {
    if (deepEqual(newVal, oldVal)) return
    validate()
  }, {
    deep: true,
  })
  watch(internalValue, () => {
    // If it's the first time we're setting input,
    // mark it with hasInput
    data.hasInput = true
    props.validateOnBlur || nextTick(validate)
  })
  watch(() => data.isFocused, (val) => {
    // Should not check validation
    // if disabled
    if (
      !val &&
      !isDisabled.value
    ) {
      data.hasFocused = true
      props.validateOnBlur && nextTick(validate)
    }
  })
  watch(() => data.isResetting, () => {
    setTimeout(() => {
      data.hasInput = false
      data.hasFocused = false
      data.isResetting = false
      validate()
    }, 0)
  })
  watch(hasError, (val) => {
    if (shouldValidate.value) {
      context.emit('update:error', val)
    }
  })
  watch(props, (val) => {
    data.lazyValue = val
  })

  function genInternalMessages(messages: InputMessage | undefined): InputValidationRules {
    if (!messages) return []
    else if (Array.isArray(messages)) return messages
    else return [messages]
  }
  /** @public */
  function reset() {
    data.isResetting = true
    internalValue.value = Array.isArray(internalValue.value)
      ? []
      : undefined
  }
  /** @public */
  function resetValidation() {
    data.isResetting = true
  }
  /** @public */
  function validate(force = false, value?: any): boolean {
    const errorBucket = []
    value = value || internalValue.value

    if (force) data.hasInput = data.hasFocused = true

    const rules = props.rules || []
    for (let index = 0; index < rules.length; index++) {
      const rule = rules[index]
      const valid = typeof rule === 'function' ? rule(value) : rule

      if (valid === false || typeof valid === 'string') {
        errorBucket.push(valid || '')
      } else if (typeof valid !== 'boolean') {
        consoleError(`Rules should return a string or boolean, received '${typeof valid}' instead`, context)
      }
    }

    data.errorBucket = errorBucket
    data.valid = errorBucket.length === 0

    return data.valid
  }

  const result = {
    _uid: uids++,
    ...toRefs(data),
    isDark,
    appIsDark,
    ...themeable,
    computedColor,
    hasError,
    hasSuccess,
    externalError,
    hasMessages,
    hasState,
    internalErrorMessages,
    internalMessages,
    internalSuccessMessages,
    internalValue,
    isDisabled,
    isInteractive,
    isReadonly,
    shouldValidate,
    validations,
    validationState,
    validationTarget,
    genInternalMessages,
    reset,
    resetValidation,
    validate,
  }

  form && form.register(result)

  onBeforeUnmount(() => {
    form && form.unregister(result)
  })

  return result
}
