import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VBottomSheet.sass'

// Extensions
import VDialog from '../VDialog/VDialog'
export const VBottomSheetProps = {
    inset: Boolean,
    maxWidth: {
      type: [String, Number],
      default: 'auto',
    },
    transition: {
      type: String,
      default: 'bottom-sheet-transition',
    },
}

/* @vue/component */
export function useVBottomSheet(props: ExtractPropTypes<typeof VBottomSheetProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        ...VDialog.options.computed.classes.call(this),
        'v-bottom-sheet': true,
        'v-bottom-sheet--inset': props.inset,
      }
    })
  return {
    classes,
  }
}
const VBottomSheet = defineComponent({
  name: 'v-bottom-sheet',
  props: VBottomSheetProps,
  setup(props, context) {
    const {} = useVBottomSheet(props, context)
  },
})

export default VBottomSheet

