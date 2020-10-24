import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VTextarea.sass'

// Extensions
import VTextField from '../VTextField/VTextField'

// Utilities
import mixins from '../../util/mixins'

// Types
import Vue from 'vue'
export const VTextareaProps = {
    autoGrow: Boolean,
    noResize: Boolean,
    rowHeight: {
      type: [Number, String],
      default: 24,
      validator: (v: any) => !isNaN(parseFloat(v)),
    },
    rows: {
      type: [Number, String],
      default: 5,
      validator: (v: any) => !isNaN(parseInt(v, 10)),
    },
}

interface options extends Vue {
  $refs: {
    input: HTMLTextAreaElement
  }
}

const baseMixins = mixins<options &
  InstanceType<typeof VTextField>
>(
  VTextField
)

/* @vue/component */
export function useVTextarea(props: ExtractPropTypes<typeof VTextareaProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        'v-textarea': true,
        'v-textarea--auto-grow': props.autoGrow,
        'v-textarea--no-resize': noResizeHandle.value,
        ...VTextField.options.computed.classes.call(this),
      }
    })
    const noResizeHandle: Ref<boolean> = computed(() => {
      return props.noResize || props.autoGrow
    })

      props.autoGrow && context.nextTick(calculateInputHeight)
})
watch(() => props.rowHeight, () => {
      props.autoGrow && context.nextTick(calculateInputHeight)
})

  onMounted(() => {
    setTimeout(() => {
      props.autoGrow && calculateInputHeight()
    }, 0)
  })

  function calculateInputHeight () {
      const input = context.refs.input
      if (!input) return

      input.style.height = '0'
      const height = input.scrollHeight
      const minHeight = parseInt(props.rows, 10) * parseFloat(props.rowHeight)
      // This has to be done ASAP, waiting for Vue
      // to update the DOM causes ugly layout jumping
      input.style.height = Math.max(minHeight, height) + 'px'
    }
  function genInput () {
      const input = VTextField.options.methods.genInput.call(this)

      input.tag = 'textarea'
      delete input.data!.attrs!.type
      input.data!.attrs!.rows = props.rows

      return input
    }
  function onInput (e: Event) {
      VTextField.options.methods.onInput.call(this, e)
      props.autoGrow && calculateInputHeight()
    }
  function onKeyDown (e: KeyboardEvent) {
      // Prevents closing of a
      // dialog when pressing
      // enter
      if (props.isFocused && e.keyCode === 13) {
        e.stopPropagation()
      }

      context.emit('keydown', e)
    }
  return {
    classes,
    noResizeHandle,
    calculateInputHeight,
    genInput,
    onInput,
    onKeyDown,
  }
}
const VTextarea = defineComponent({
  name: 'v-textarea',
  props: VTextareaProps,
  setup(props, context) {
    const {} = useVTextarea(props, context)
  },
})

export default VTextarea

