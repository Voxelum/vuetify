import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VFileInput.sass'

// Extensions
import VTextField from '../VTextField'

// Components
import { VChip } from '../VChip'

// Types
import { PropValidator } from 'vue/types/options'

// Utilities
import { deepEqual, humanReadableFileSize, wrapInArray } from '../../util/helpers'
import { consoleError } from '../../util/console'
import { mergeStyles } from '../../util/mergeData'
export const VFileInputProps = {
    chips: Boolean,
    clearable: {
      type: Boolean,
      default: true,
    },
    counterSizeString: {
      type: String,
      default: '$vuetify.fileInput.counterSize',
    },
    counterString: {
      type: String,
      default: '$vuetify.fileInput.counter',
    },
    hideInput: Boolean,
    placeholder: String,
    prependIcon: {
      type: String,
      default: '$file',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    showSize: {
      type: [Boolean, Number],
      default: false,
      validator: (v: boolean | number) => {
        return (
          typeof v === 'boolean' ||
          [1000, 1024].includes(v)
        )
      },
    } as PropValidator<boolean | 1000 | 1024>,
    smallChips: Boolean,
    truncateLength: {
      type: [Number, String],
      default: 22,
    },
    type: {
      type: String,
      default: 'file',
    },
    value: {
      default: undefined,
      validator: val => {
        return wrapInArray(val).every(v => v != null && typeof v === 'object')
      },
    } as PropValidator<File | File[]>,
}

export function useVFileInput(props: ExtractPropTypes<typeof VFileInputProps>, context: SetupContext) {



    const classes: Ref<object> = computed(() => {
      return {
        ...VTextField.options.computed.classes.call(this),
        'v-file-input': true,
      }
    })
    const computedCounterValue: Ref<string> = computed(() => {
      const fileCount = (isMultiple.value && props.lazyValue)
        ? props.lazyValue.length
        : (props.lazyValue instanceof File) ? 1 : 0

      if (!props.showSize) return context.vuetify.lang.t(props.counterString, fileCount)

      const bytes = internalArrayValue.value.reduce((bytes: number, { size = 0 }: File) => {
        return bytes + size
      }, 0)

      return context.vuetify.lang.t(
        props.counterSizeString,
        fileCount,
        humanReadableFileSize(bytes, base.value === 1024)
      )
    })
    const internalArrayValue: Ref<File[]> = computed(() => {
      return wrapInArray(internalValue.value)
    })
    const internalValue = computed({
      get (): File[] {
        return props.lazyValue
      },
      set (val: File | File[]) {
        props.lazyValue = val
        context.emit('change', props.lazyValue)
      },
    })
    const isDirty: Ref<boolean> = computed(() => {
      return internalArrayValue.value.length > 0
    })
    const isLabelActive: Ref<boolean> = computed(() => {
      return isDirty.value
    })
    const isMultiple: Ref<boolean> = computed(() => {
      return context.attrs.hasOwnProperty('multiple')
    })
    const text: Ref<string[]> = computed(() => {
      if (!isDirty.value) return [props.placeholder]

      return internalArrayValue.value.map((file: File) => {
        const {
          name = '',
          size = 0,
        } = file

        const truncatedText = truncateText(name)

        return !props.showSize
          ? truncatedText
          : `${truncatedText} (${humanReadableFileSize(size, base.value === 1024)})`
      })
    })
    const base: Ref<1000 | 1024 | undefined> = computed(() => {
      return typeof props.showSize !== 'boolean' ? props.showSize : undefined
    })
    const hasChips: Ref<boolean> = computed(() => {
      return props.chips || props.smallChips
    })

watch(() => props.readonly, (v) => {
        if (v === true) consoleError('readonly is not supported on <v-file-input>', this)
      },
      immediate: true,
    },
    value (v) {
      const value = isMultiple.value ? v : v ? [v] : []
{
      immediate: true,
})
watch(props, (v) => {
      const value = isMultiple.value ? v : v ? [v] : []
      if (!deepEqual(value, context.refs.input.files)) {
        // When the input value is changed programatically, clear the
        // internal input's value so that the `onInput` handler
        // can be triggered again if the user re-selects the exact
        // same file(s). Ideally, `input.files` should be
        // manipulated directly but that property is readonly.
        context.refs.input.value = ''
      }
})

  function clearableCallback () {
      internalValue.value = isMultiple.value ? [] : undefined
      context.refs.input.value = ''
    }
  function genChips () {
      if (!isDirty.value) return []

      return text.value.map((text, index) => context.createElement(VChip, {
        props: { small: props.smallChips },
        on: {
          'click:close': () => {
            const internalValue = internalValue.value
            internalValue.splice(index, 1)
            internalValue.value = internalValue // Trigger the watcher
          },
        },
      }, [text]))
    }
  function genControl () {
      const render = VTextField.options.methods.genControl.call(this)

      if (props.hideInput) {
        render.data!.style = mergeStyles(
          render.data!.style,
          { display: 'none' }
        )
      }

      return render
    }
  function genInput () {
      const input = VTextField.options.methods.genInput.call(this)

      // We should not be setting value
      // programmatically on the input
      // when it is using type="file"
      delete input.data!.domProps!.value

      // This solves an issue in Safari where
      // nothing happens when adding a file
      // do to the input event not firing
      // https://github.com/vuetifyjs/vuetify/issues/7941
      delete input.data!.on!.input
      input.data!.on!.change = onInput

      return [genSelections(), input]
    }
  function genPrependSlot () {
      if (!props.prependIcon) return null

      const icon = props.genIcon('prepend', () => {
        context.refs.input.click()
      })

      return props.genSlot('prepend', 'outer', [icon])
    }
  function genSelectionText (): string[] {
      const length = text.value.length

      if (length < 2) return text.value
      if (props.showSize && !props.counter) return [computedCounterValue.value]
      return [context.vuetify.lang.t(props.counterString, length)]
    }
  function genSelections () {
      const children = []

      if (isDirty.value && context.scopedSlots.selection) {
        internalArrayValue.value.forEach((file: File, index: number) => {
          if (!context.scopedSlots.selection) return

          children.push(
            context.scopedSlots.selection({
              text: text.value[index],
              file,
              index,
            })
          )
        })
      } else {
        children.push(hasChips.value && isDirty.value ? genChips() : genSelectionText())
      }

      return context.createElement('div', {
        staticClass: 'v-file-input__text',
        class: {
          'v-file-input__text--placeholder': props.placeholder && !isDirty.value,
          'v-file-input__text--chips': hasChips.value && !context.scopedSlots.selection,
        },
      }, children)
    }
  function genTextFieldSlot () {
      const node = VTextField.options.methods.genTextFieldSlot.call(this)

      node.data!.on = {
        ...(node.data!.on || {}),
        click: () => context.refs.input.click(),
      }

      return node
    }
  function onInput (e: Event) {
      const files = [...(e.target as HTMLInputElement).files || []]

      internalValue.value = isMultiple.value ? files : files[0]

      // Set initialValue here otherwise isFocused
      // watcher in VTextField will emit a change
      // event whenever the component is blurred
      props.initialValue = internalValue.value
    }
  function onKeyDown (e: KeyboardEvent) {
      context.emit('keydown', e)
    }
  function truncateText (str: string) {
      if (str.length < Number(props.truncateLength)) return str
      const charsKeepOneSide = Math.floor((Number(props.truncateLength) - 1) / 2)
      return `${str.slice(0, charsKeepOneSide)}…${str.slice(str.length - charsKeepOneSide)}`
    }
  return {
    classes,
    computedCounterValue,
    internalArrayValue,
    internalValue,
    isDirty,
    isLabelActive,
    isMultiple,
    text,
    base,
    hasChips,
    clearableCallback,
    genChips,
    genControl,
    genInput,
    genPrependSlot,
    genSelectionText,
    genSelections,
    genTextFieldSlot,
    onInput,
    onKeyDown,
    truncateText,
  }
}
const VFileInput = defineComponent({
  name: 'v-file-input',
  props: VFileInputProps,
  setup(props, context) {
    const {} = useVFileInput(props, context)
  },
})

export default VFileInput

