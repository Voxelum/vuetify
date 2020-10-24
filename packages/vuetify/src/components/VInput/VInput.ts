import { backgroundColor, textColor } from '@mixins/colorable'
import useValidatable, { validatableProps } from '@mixins/validatable/index.ts'
import { VNodeData } from '@util/vnodeData'
import { InputValidationRule } from 'types'
import { computed, defineComponent, ExtractPropTypes, h, mergeProps, PropType, reactive, ref, Ref, SetupContext, toRefs, VNode, VNodeArrayChildren, VNodeChild, watch } from 'vue'
// Utilities
import {
  convertToUnit,
  getSlot,
  kebabCase
} from '../../util/helpers'
import mergeData from '../../util/mergeData'
// Components
import VIcon from '../VIcon'
import VLabel from '../VLabel'
import VMessages from '../VMessages'
// Styles
import './VInput.sass'

export const VInputProps = {
  ...validatableProps,
  appendIcon: String,
  backgroundColor: {
    type: String,
    default: '',
  },
  dense: Boolean,
  height: [Number, String],
  hideDetails: [Boolean, String] as PropType<boolean | 'auto'>,
  hint: String,
  id: String,
  label: String,
  loading: Boolean,
  persistentHint: Boolean,
  prependIcon: String,
  value: null as any as PropType<any>,
}

// const baseMixins = mixins(
//   BindsAttrs,
//   Validatable,
// )

// interface options extends InstanceType<typeof baseMixins> {
//   /* eslint-disable-next-line camelcase */
//   $_modelEvent: string
// }
export function renderInputSlot(
  type: string,
  location: string,
  slot: (VNode | VNode[])[],
  ref: Ref<HTMLElement | null>,
) {
  if (!slot.length) return null

  const refName = `${type}-${location}`
  return h('div', {
    class: `v-input__${refName}`,
    ref: ref,
  }, slot)
}

/* @vue/component */
export function useVInput(props: ExtractPropTypes<typeof VInputProps>, context: SetupContext, _modelEvent: string = 'value') {
  const { themeClasses, isFocused, hasState, isDisabled, isReadonly, hasMessages, validations, validationState, ...useValidations } = useValidatable(props, context)
  const data = reactive({
    lazyValue: props.value,
    hasMouseDown: false,
  })

  const prependInner: Ref<HTMLElement | null> = ref(null)
  const prependOuter: Ref<HTMLElement | null> = ref(null)
  const appendInner: Ref<HTMLElement | null> = ref(null)
  const appendOuter: Ref<HTMLElement | null> = ref(null)

  const classes: Ref<object> = computed(() => {
    return {
      'v-input': true,
      'v-input--has-state': hasState.value,
      'v-input--hide-details': !showDetails.value,
      'v-input--is-label-active': isLabelActive.value,
      'v-input--is-dirty': isDirty.value,
      'v-input--is-disabled': isDisabled.value,
      'v-input--is-focused': isFocused.value,
      // <v-switch loading>.loading === '' so we can't just cast to boolean
      'v-input--is-loading': props.loading !== false && props.loading != null,
      'v-input--is-readonly': isReadonly.value,
      'v-input--dense': props.dense,
      ...themeClasses.value,
    }
  })
  const computedId: Ref<string> = computed(() => {
    return props.id || `input-${props._uid}`
  })
  const hasDetails: Ref<boolean> = computed(() => {
    return messagesToDisplay.value.length > 0
  })
  const hasHint: Ref<boolean> = computed(() => {
    return !hasMessages &&
      !!props.hint &&
      (props.persistentHint || isFocused.value)
  })
  const hasLabel: Ref<boolean> = computed(() => {
    return !!(context.slots.label || props.label)
  })
  const internalValue = computed({
    get(): any {
      return data.lazyValue
    },
    set(val: any) {
      data.lazyValue = val
      context.emit(_modelEvent, val)
    },
  })
  const isDirty: Ref<boolean> = computed(() => {
    return !!data.lazyValue
  })
  const isLabelActive: Ref<boolean> = computed(() => {
    return isDirty.value
  })
  const messagesToDisplay: Ref<string[]> = computed(() => {
    if (hasHint.value) return [props.hint ?? '']

    if (!hasMessages) return []

    return validations.value.map((validation: string | InputValidationRule) => {
      if (typeof validation === 'string') return validation

      const validationResult = validation(internalValue.value)

      return typeof validationResult === 'string' ? validationResult : ''
    }).filter(message => message !== '')
  })
  const showDetails: Ref<boolean> = computed(() => {
    return props.hideDetails === false || (props.hideDetails === 'auto' && hasDetails.value)
  })

  watch(() => props.value, (val) => {
    data.lazyValue = val
  })

  function genControl(children: string | number | boolean | VNode | VNodeArrayChildren = [
    genInputSlot(),
    genMessages(),
  ]) {
    return h('div', {
      class: 'v-input__control',
    }, children)
  }
  function genIcon(
    type: string,
    cb?: (e: Event) => void,
    extraData: VNodeData = {}
  ) {
    const icon = (props as any)[`${type}Icon`]
    const eventName = `click:${kebabCase(type)}`
    const hasListener = !!(props.listeners$[eventName] || cb)

    // TODO: fix listeners

    const data = mergeProps({
      'aria-label': hasListener ? kebabCase(type).split('-')[0] + ' icon' : undefined,
      color: validationState.value,
      dark: props.dark,
      disabled: isDisabled.value,
      light: props.light,
      on: !hasListener
        ? undefined
        : {
          click: (e: Event) => {
            e.preventDefault()
            e.stopPropagation()

            context.emit(eventName, e)
            cb && cb(e)
          },
          // Container has g event that will
          // trigger menu open if enclosed
          mouseup: (e: Event) => {
            e.preventDefault()
            e.stopPropagation()
          },
        },
    }, extraData)

    return h('div', {
      staticClass: `v-input__icon`,
      class: type ? `v-input__icon--${kebabCase(type)}` : undefined,
    }, [
      h(
        VIcon,
        data,
        icon
      ),
    ])
  }
  function genInputSlot(defaultSlot: string | number | boolean | VNode | VNodeArrayChildren = [
    genLabel(),
    context.slots.default?.(),
  ]) {
    return h('div', mergeProps(backgroundColor(props.backgroundColor), {
      class: 'v-input__slot',
      style: { height: convertToUnit(props.height) },
      onClick,
      onMouseDown,
      onMouseUp,
      ref: 'input-slot',
    }), defaultSlot)
  }
  function genLabel() {
    if (!hasLabel.value) return null

    return h(VLabel, {
      color: validationState.value,
      dark: props.dark,
      disabled: isDisabled.value,
      focused: hasState.value,
      for: computedId.value,
      light: props.light,
    }, context.slots.label || props.label)
  }
  function genMessages() {
    if (!showDetails.value) return null

    return h(VMessages, {
      color: hasHint.value ? '' : validationState.value,
      dark: props.dark,
      light: props.light,
      value: messagesToDisplay.value,
      role: hasMessages.value ? 'alert' : null,
    }, {
      default: (props: any) => getSlot(context, 'message', props),
    })
  }
  function genSlot(
    type: string,
    location: string,
    slot: (VNode | VNode[])[]
  ) {
    if (!slot.length) return null

    const refName = `${type}-${location}`
    let ref = undefined
    switch (refName) {
      case 'prepend-inner':
        ref = prependInner
        break
      case 'prepend-outer':
        ref = prependOuter
        break
      case 'append-inner':
        ref = appendInner
        break
      case 'append-outer':
        ref = appendOuter
        break
    }

    return h('div', {
      class: `v-input__${refName}`,
      ref: ref,
    }, slot)
  }
  function genPrependSlot() {
    const slot = []

    if (context.slots.prepend) {
      slot.push(context.slots.prepend())
    } else if (props.prependIcon) {
      slot.push(genIcon('prepend'))
    }

    return genSlot('prepend', 'outer', slot)
  }
  function genAppendSlot() {
    const slot = []

    // Append icon for text field was really
    // an appended inner icon, v-text-field
    // will overwrite this method in order to obtain
    // backwards compat
    if (context.slots.append) {
      slot.push(context.slots.append())
    } else if (props.appendIcon) {
      slot.push(genIcon('append'))
    }

    return genSlot('append', 'outer', slot)
  }
  function onClick(e: Event) {
    context.emit('click', e)
  }
  function onMouseDown(e: Event) {
    data.hasMouseDown = true
    context.emit('mousedown', e)
  }
  function onMouseUp(e: Event) {
    data.hasMouseDown = false
    context.emit('mouseup', e)
  }

  return {
    ...toRefs(data),
    prependInner,
    prependOuter,
    appendInner,
    appendOuter,
    isFocused,
    themeClasses, hasState, isDisabled, isReadonly, hasMessages, validations, validationState, ...useValidations,
    classes,
    computedId,
    hasDetails,
    hasHint,
    hasLabel,
    internalValue,
    isDirty,
    isLabelActive,
    messagesToDisplay,
    showDetails,
    genControl,
    genIcon,
    genInputSlot,
    genLabel,
    genMessages,
    genSlot,
    genPrependSlot,
    genAppendSlot,
    onClick,
    onMouseDown,
    onMouseUp,
  }
}

const VInput = defineComponent({
  name: 'v-input',
  props: VInputProps,
  setup(props, context) {
    const {
      genPrependSlot,
      genAppendSlot,
      genInputSlot,
      genControl,
      genMessages,
      genLabel,
      classes,
      validationState,
    } = useVInput(props, context)
    return () => h('div', mergeProps(textColor(validationState.value), {
      class: classes.value,
    }), [
      genPrependSlot(),
      genControl([
        genInputSlot([
          genLabel(),
          context.slots.default?.(),
        ]),
        genMessages(),
      ]),
      genAppendSlot(),
    ])
  },
})

export default VInput

