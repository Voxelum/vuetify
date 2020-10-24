import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext, watch, nextTick, ref } from 'vue'
// Styles
import './VTextField.sass'

// Extensions
import VInput from '../VInput'

// Components
import VCounter from '../VCounter'
import VLabel from '../VLabel'

// Mixins
import Intersectable from '../../mixins/intersectable'
import Loadable, { loadableProps } from '../../mixins/loadable'
import Validatable from '../../mixins/validatable'

// Directives
import ripple from '../../directives/ripple'

// Utilities
import { convertToUnit, keyCodes } from '../../util/helpers'
import { breaking, consoleWarn } from '../../util/console'

// Types
import mixins from '../../util/mixins'
import { VNode, PropType } from 'vue'
import { useVInput, VInputProps } from '@components/VInput/VInput'
import useLoadable from '../../mixins/loadable'
import { useVuetify } from '@framework'

export const VTextFieldProps = {
  ...VInputProps,
  ...loadableProps,
  appendOuterIcon: String,
  autofocus: Boolean,
  clearable: Boolean,
  clearIcon: {
    type: String,
    default: '$clear',
  },
  counter: [Boolean, Number, String],
  counterValue: Function as PropType<(value: any) => number>,
  filled: Boolean,
  flat: Boolean,
  fullWidth: Boolean,
  label: String,
  outlined: Boolean,
  placeholder: String,
  prefix: String,
  prependInnerIcon: String,
  reverse: Boolean,
  rounded: Boolean,
  shaped: Boolean,
  singleLine: Boolean,
  solo: Boolean,
  soloInverted: Boolean,
  suffix: String,
  type: {
    type: String,
    default: 'text',
  },
}

// const baseMixins = mixins(
//   VInput,
//   Intersectable({
//     onVisible: [
//       'setLabelWidth',
//       'setPrefixWidth',
//       'setPrependWidth',
//       'tryAutofocus',
//     ],
//   }),
//   Loadable,
// )
// interface options extends InstanceType<typeof baseMixins> {
//   $refs: {
//     label: HTMLElement
//     input: HTMLInputElement
//     'prepend-inner': HTMLElement
//     prefix: HTMLElement
//     suffix: HTMLElement
//   }
// }

const dirtyTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month']

/* @vue/component */
export function useVTextField(props: ExtractPropTypes<typeof VTextFieldProps>, context: SetupContext) {
  const {
    lazyValue, classes: inputClasses,
    computedColor: _computedColor,
    isFocused,
    hasColor,
    hasLabel,
    genIcon,
    genSlot,
    genPrependSlot,
    prependInner,
    prependOuter,
    appendInner,
    appendOuter,
    showDetails,
    genMessages: _genMessages,
    hasDetails: _hasDetails,
    genControl,
    setTextColor,
    validationState,
    isDisabled,
    computedId,
    isReadonly,
    onMouseDown: _onMouseDown,
    onMouseUp: _onMouseUp,
    hasMouseDown,
    setBackgroundColor,
  } = useVInput(props as any, context)
  const { genProgress } = useLoadable(props, context)
  const data = reactive({
    badInput: false,
    labelWidth: 0,
    prefixWidth: 0,
    prependWidth: 0,
    initialValue: null as string | null,
    isBooted: false,
    isClearing: false,
  })

  const vuetify = useVuetify()

  const el: Ref<HTMLElement | null> = ref(null)
  const label: Ref<HTMLElement | null> = ref(null)
  const input: Ref<HTMLInputElement | null> = ref(null)
  const prefix: Ref<HTMLElement | null> = ref(null)
  const suffix: Ref<HTMLElement | null> = ref(null)

  const classes: Ref<object> = computed(() => {
    return {
      ...inputClasses.value,
      'v-text-field': true,
      'v-text-field--full-width': props.fullWidth,
      'v-text-field--prefix': props.prefix,
      'v-text-field--single-line': isSingle.value,
      'v-text-field--solo': isSolo.value,
      'v-text-field--solo-inverted': props.soloInverted,
      'v-text-field--solo-flat': props.flat,
      'v-text-field--filled': props.filled,
      'v-text-field--is-booted': data.isBooted,
      'v-text-field--enclosed': isEnclosed.value,
      'v-text-field--reverse': props.reverse,
      'v-text-field--outlined': props.outlined,
      'v-text-field--placeholder': props.placeholder,
      'v-text-field--rounded': props.rounded,
      'v-text-field--shaped': props.shaped,
    }
  })
  const computedColor: Ref<string | undefined> = computed(() => {
    const computedColor = _computedColor.value

    if (!props.soloInverted || !isFocused.value) return computedColor

    return props.color || 'primary'
  })
  const computedCounterValue: Ref<number> = computed(() => {
    if (typeof props.counterValue === 'function') {
      return props.counterValue(internalValue.value)
    }
    return (internalValue.value || '').toString().length
  })
  const hasCounter: Ref<boolean> = computed(() => {
    return props.counter !== false && props.counter != null
  })
  const hasDetails: Ref<boolean> = computed(() => {
    return _hasDetails.value || hasCounter.value
  })
  const internalValue = computed({
    get(): any {
      return lazyValue.value
    },
    set(val: any) {
      lazyValue.value = val
      context.emit('input', lazyValue.value)
    },
  })
  const isDirty: Ref<boolean> = computed(() => {
    return (lazyValue.value as string)?.toString().length > 0 || data.badInput
  })
  const isEnclosed: Ref<boolean> = computed(() => {
    return (
      props.filled ||
      isSolo.value ||
      props.outlined || false
    )
  })
  const isLabelActive: Ref<boolean> = computed(() => {
    return isDirty.value || dirtyTypes.includes(props.type)
  })
  const isSingle: Ref<boolean> = computed(() => {
    return (
      isSolo.value ||
      props.singleLine ||
      props.fullWidth ||
      // https://material.io/components/text-fields/#filled-text-field
      (props.filled && !hasLabel.value)
    ) ?? false
  })
  const isSolo: Ref<boolean> = computed(() => {
    return props.solo || props.soloInverted || false
  })
  const labelPosition: Ref<Record<'left' | 'right', string | number | undefined>> = computed(() => {
    let offset = (props.prefix && !labelValue.value) ? data.prefixWidth : 0

    if (labelValue.value && data.prependWidth) offset -= data.prependWidth

    return (vuetify.rtl === props.reverse) ? {
      left: offset,
      right: 'auto',
    } : {
        left: 'auto',
        right: offset,
      }
  })
  const showLabel: Ref<boolean> = computed(() => {
    return hasLabel.value && (!isSingle.value || (!isLabelActive.value && !props.placeholder))
  })
  const labelValue: Ref<boolean> = computed(() => {
    return !isSingle.value &&
      Boolean(isFocused.value || isLabelActive.value || props.placeholder)
  })
  watch([labelValue, props.outlined], setLabelWidth)
  watch(() => props.label, () => nextTick(setLabelWidth))
  watch(() => props.prefix, () => nextTick(setPrefixWidth))
  watch(isFocused, updateValue)
  watch(() => props.value, () => {

  })

  /* istanbul ignore next */
  if (context.attrs.hasOwnProperty('box')) {
    breaking('box', 'filled', context)
  }

  /* istanbul ignore next */
  if (context.attrs.hasOwnProperty('browser-autocomplete')) {
    breaking('browser-autocomplete', 'autocomplete', context)
  }

  /* istanbul ignore if */
  if (props.shaped && !(props.filled || props.outlined || isSolo.value)) {
    consoleWarn('shaped should be used with either filled or outlined', context)
  }

  onMounted(() => {
    props.autofocus && tryAutofocus()
    setLabelWidth()
    setPrefixWidth()
    setPrependWidth()
    requestAnimationFrame(() => (data.isBooted = true))
  })

  /** @public */
  function focus() {
    onFocus()
  }
  /** @public */
  function blur(e?: Event) {
    // https://github.com/vuetifyjs/vuetify/issues/5913
    // Safari tab order gets broken if called synchronous
    window.requestAnimationFrame(() => {
      input.value && input.value.blur()
    })
  }
  function clearableCallback() {
    input.value && input.value.focus()
    nextTick(() => internalValue.value = null)
  }
  function genAppendSlot() {
    const slot = []

    if (context.slots['append-outer']) {
      slot.push(context.slots['append-outer']?.())
    } else if (props.appendOuterIcon) {
      slot.push(genIcon('appendOuter'))
    }

    return genSlot('append', 'outer', slot)
  }
  function genPrependInnerSlot() {
    const slot = []

    if (context.slots['prepend-inner']) {
      slot.push(context.slots['prepend-inner']?.())
    } else if (props.prependInnerIcon) {
      slot.push(genIcon('prependInner'))
    }

    return genSlot('prepend', 'inner', slot)
  }
  function genIconSlot() {
    const slot = []

    if (context.slots['append']) {
      slot.push(context.slots['append']?.())
    } else if (props.appendIcon) {
      slot.push(genIcon('append'))
    }

    return genSlot('append', 'inner', slot)
  }
  function genInputSlot() {
    const children = [
      genFieldset(),
      genTextFieldSlot(),
      genClearIcon(),
      genIconSlot(),
      genProgress(),
    ]

    const prepend = genPrependInnerSlot()

    if (prepend) {
      children.unshift(prepend)
    }

    const input = h('div', setBackgroundColor(props.backgroundColor, {
      staticClass: 'v-input__slot',
      style: { height: convertToUnit(props.height) },
      onClick,
      onMouseDown,
      onMouseUp,
      ref: 'input-slot',
    }), children)

    return input
  }
  function genClearIcon() {
    if (!props.clearable) return null

    const data = isDirty.value ? undefined : { disabled: true }

    return genSlot('append', 'inner', [
      genIcon('clear', clearableCallback, data),
    ])
  }
  function genCounter() {
    if (!hasCounter.value) return null

    const max = props.counter === true ? context.attrs.maxlength : props.counter

    return h(VCounter, {
      props: {
        dark: props.dark,
        light: props.light,
        max,
        value: computedCounterValue.value,
      },
    })
  }
  function genDefaultSlot() {
    return [
      genFieldset(),
      genTextFieldSlot(),
      genClearIcon(),
      genIconSlot(),
      genProgress(),
    ]
  }
  function genFieldset() {
    if (!props.outlined) return null

    return h('fieldset', {
      attrs: {
        'aria-hidden': true,
      },
    }, [genLegend()])
  }
  function genLabel() {
    if (!showLabel.value) return null
    return h(VLabel, {
      absolute: true,
      color: validationState.value,
      dark: props.dark,
      disabled: isDisabled.value,
      focused: !isSingle.value && (isFocused.value || !!validationState.value),
      for: computedId.value,
      left: labelPosition.value.left,
      light: props.light,
      right: labelPosition.value.right,
      value: labelValue.value,
      ref: label,
    }, context.slots.label?.() || props.label)
  }
  function genLegend() {
    const width = !props.singleLine && (labelValue.value || isDirty.value) ? data.labelWidth : 0
    const span = h('span', {
      domProps: { innerHTML: '&#8203;' },
    })

    return h('legend', {
      style: {
        width: !isSingle.value ? convertToUnit(width) : undefined,
      },
    }, [span])
  }
  function genInput() {
    // const listeners = Object.assign({}, props.listeners$)
    // delete listeners['change'] // Change should not be bound externally

    return h('input', {
      style: {},
      value: (props.type === 'number' && Object.is(lazyValue.value, -0)) ? '-0' : lazyValue.value,
      autofocus: props.autofocus,
      disabled: isDisabled.value,
      id: computedId.value,
      placeholder: props.placeholder,
      readonly: isReadonly.value,
      ...context.attrs,
      type: props.type,
      onBlur: onBlur,
      onInput: onInput,
      onFocus: onFocus,
      onKeydown: onKeyDown,
      ref: input,
    })
  }
  function genMessages() {
    if (!showDetails.value) return null

    const messagesNode = _genMessages()
    const counterNode = genCounter()

    return h('div', {
      staticClass: 'v-text-field__details',
    }, [
      messagesNode,
      counterNode,
    ])
  }
  function genTextFieldSlot() {
    return h('div', {
      staticClass: 'v-text-field__slot',
    }, [
      genLabel(),
      props.prefix ? genAffix('prefix') : null,
      genInput(),
      props.suffix ? genAffix('suffix') : null,
    ])
  }
  function genAffix(type: 'prefix' | 'suffix') {
    return h('div', {
      class: `v-text-field__${type}`,
      ref: type === 'prefix' ? prefix : suffix,
    }, type === 'prefix' ? props.prefix : props.suffix)
  }
  function onBlur(e?: Event) {
    isFocused.value = false
    e && nextTick(() => context.emit('blur', e))
  }
  function onClick() {
    if (isFocused.value || isDisabled.value || !input.value) return

    input.value!.focus()
  }
  function onFocus(e?: Event) {
    if (!input.value) return

    if (document.activeElement !== input.value) {
      return input.value.focus()
    }

    if (!isFocused.value) {
      isFocused.value = true
      e && context.emit('focus', e)
    }
  }
  function onInput(e: Event) {
    const target = e.target as HTMLInputElement
    internalValue.value = target.value
    data.badInput = target.validity && target.validity.badInput
  }
  function onKeyDown(e: KeyboardEvent) {
    if (e.keyCode === keyCodes.enter) context.emit('change', internalValue.value)

    context.emit('keydown', e)
  }
  function onMouseDown(e: Event) {
    // Prevent input from being blurred
    if (e.target !== input.value) {
      e.preventDefault()
      e.stopPropagation()
    }

    _onMouseDown(e)
  }
  function onMouseUp(e: Event) {
    if (hasMouseDown) focus()

    _onMouseUp(e)
  }
  function setLabelWidth() {
    if (!props.outlined) return

    data.labelWidth = label.value
      ? Math.min(label.value.scrollWidth * 0.75 + 6, (el.value as HTMLElement).offsetWidth - 24)
      : 0
  }
  function setPrefixWidth() {
    if (!prefix.value) return

    data.prefixWidth = prefix.value.offsetWidth
  }
  function setPrependWidth() {
    if (!props.outlined || !prependInner.value) return

    data.prependWidth = prependInner.value.offsetWidth
  }
  function tryAutofocus() {
    if (
      !props.autofocus ||
      typeof document === 'undefined' ||
      !input.value ||
      document.activeElement === input.value
    ) return false

    input.value.focus()

    return true
  }
  function updateValue(val: boolean) {
    // Sets validationState from validatable
    hasColor.value = val

    if (val) {
      data.initialValue = lazyValue.value as string
    } else if (data.initialValue !== lazyValue.value) {
      context.emit('change', lazyValue.value)
    }
  }
  return {
    el,
    classes,
    computedColor,
    computedCounterValue,
    hasCounter,
    hasDetails,
    internalValue,
    isDirty,
    isEnclosed,
    isLabelActive,
    isSingle,
    isSolo,
    labelPosition,
    showLabel,
    labelValue,
    focus,
    blur,
    clearableCallback,
    genAppendSlot,
    genPrependInnerSlot,
    genIconSlot,
    genInputSlot,
    genClearIcon,
    genCounter,
    genControl,
    genDefaultSlot,
    genFieldset,
    genLabel,
    genLegend,
    genInput,
    genMessages,
    genTextFieldSlot,
    genAffix,
    onBlur,
    onClick,
    onFocus,
    onInput,
    onKeyDown,
    onMouseDown,
    onMouseUp,
    setLabelWidth,
    setPrefixWidth,
    setPrependWidth,
    tryAutofocus,
    updateValue,
    setTextColor,
    validationState,
    genPrependSlot,
  }
}
const VTextField = defineComponent({
  name: 'v-text-field',
  props: VTextFieldProps,
  setup(props, context) {
    const {
      classes,
      setTextColor,
      validationState,
      genPrependSlot,
      genControl,
      genAppendSlot,
      genInputSlot,
      genMessages,
      el,
    } = useVTextField(props, context)
    return () => h('div', setTextColor(validationState.value, {
      staticClass: 'v-input',
      class: classes.value,
      ref: el,
    }), [
      genPrependSlot(),
      genControl([
        genInputSlot(),
        genMessages(),
      ]),
      genAppendSlot(),
    ])
  },
})

export default VTextField

