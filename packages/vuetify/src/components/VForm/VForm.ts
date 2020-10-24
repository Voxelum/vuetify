import { Validatable } from '@mixins/validatable'
import { defineComponent, ExtractPropTypes, h, provide, reactive, SetupContext, watch } from 'vue'

export const VFormProps = {
  disabled: Boolean,
  lazyValidation: Boolean,
  readonly: Boolean,
  value: Boolean,
}

type ErrorBag = Record<number, boolean>
type Watchers = {
  _uid: number
  valid: () => void
  shouldValidate: () => void
}

export type VFormContent = ReturnType<typeof useVForm>

/* @vue/component */
// BindsAttrs,
// RegistrableProvide('form')
/* @vue/component */
export function useVForm(props: ExtractPropTypes<typeof VFormProps>, context: SetupContext) {
  const data = reactive({
    inputs: [] as Validatable[],
    watchers: [] as Watchers[],
    errorBag: {} as ErrorBag,
  })

  watch(() => data.errorBag, (val) => {
    const errors = Object.values(val).includes(true)
    context.emit('input', !errors)
  }, {
    deep: true,
    immediate: true,
  })

  function watchInput(input: Validatable): Watchers {
    const watcher = (input: any): (() => void) => {
      return input.$watch('hasError', (val: boolean) => {
        data.errorBag[input._uid] = val
      }, { immediate: true })
    }

    const watchers: Watchers = {
      _uid: input._uid,
      valid: () => { },
      shouldValidate: () => { },
    }

    if (props.lazyValidation) {
      // Only start watching inputs if we need to
      watchers.shouldValidate = watch(input.shouldValidate, (val: boolean) => {
        if (!val) return

        // Only watch if we're not already doing it
        if (data.errorBag.hasOwnProperty(input._uid)) return

        watchers.valid = watcher(input)
      })
    } else {
      watchers.valid = watcher(input)
    }

    return watchers
  }
  /** @public */
  function validate(): boolean {
    return data.inputs.filter(input => !input.validate(true)).length === 0
  }
  /** @public */
  function reset(): void {
    data.inputs.forEach(input => input.reset())
    resetErrorBag()
  }
  function resetErrorBag() {
    if (props.lazyValidation) {
      // Account for timeout in validatable
      setTimeout(() => {
        data.errorBag = {}
      }, 0)
    }
  }
  /** @public */
  function resetValidation() {
    data.inputs.forEach(input => input.resetValidation())
    resetErrorBag()
  }
  function register(input: Validatable) {
    data.inputs.push(input as any)
    data.watchers.push(watchInput(input))
  }
  function unregister(input: Validatable) {
    const found = data.inputs.find(i => i._uid === input._uid)

    if (!found) return

    const unwatch = data.watchers.find(i => i._uid === found._uid)
    if (unwatch) {
      unwatch.valid()
      unwatch.shouldValidate()
    }

    data.watchers = data.watchers.filter(i => i._uid !== found._uid)
    data.inputs = data.inputs.filter(i => i._uid !== found._uid)
    delete data.errorBag[found._uid]
  }

  const result = {
    props,
    watchInput,
    validate,
    reset,
    resetErrorBag,
    resetValidation,
    register,
    unregister,
  }

  provide('form', result)

  return result
}
const VForm = defineComponent({
  name: 'v-form',
  props: VFormProps,
  setup(props, context) {
    const { } = useVForm(props, context)
    return () => h('form', {
      staticClass: 'v-form',
      novalidate: true,
      ...context.attrs,
      onSubmit: (e: Event) => context.emit('submit', e),
    }, context.slots.default)
  },
})

export default VForm

