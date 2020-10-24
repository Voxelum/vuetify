import { elevatableProps } from '@mixins/elevatable/index.ts.mod'
import { ExtractPropTypes, h, SetupContext, VNode } from 'vue'
// Components
import VPicker from '../../components/VPicker'
// Mixins
import { colorableProps } from '../colorable'
import { themeableProps } from '../themeable'

export const pickerProps = {
  flat: Boolean,
  fullWidth: Boolean,
  headerColor: String,
  landscape: Boolean,
  noTitle: Boolean,
  width: {
    type: [Number, String],
    default: 290,
  },
  ...colorableProps,
  ...elevatableProps,
  ...themeableProps,
}

// export default mixins(
//   Colorable,
//   Elevatable,
//   Themeable
/* @vue/component */
export default function usePicker(props: ExtractPropTypes<typeof pickerProps>, context: SetupContext) {
  function genPickerTitle(): VNode | null {
    return null
  }
  function genPickerBody(): VNode | null {
    return null
  }
  function genPickerActionsSlot() {
    // TODO: check this
    return context.scopedSlots.default ? context.scopedSlots.default({
      save: (this as any).save,
      cancel: (this as any).cancel,
    }) : context.slots.default
  }
  function genPicker(staticClass: string) {
    const children: VNode[] = []

    if (!props.noTitle) {
      const title = genPickerTitle()
      title && children.push(title)
    }

    const body = genPickerBody()
    body && children.push(body)

    children.push(h('template', { slot: 'actions' }, [genPickerActionsSlot()]))

    return h(VPicker, {
      staticClass,
      props: {
        color: props.headerColor || props.color,
        dark: props.dark,
        elevation: props.elevation,
        flat: props.flat,
        fullWidth: props.fullWidth,
        landscape: props.landscape,
        light: props.light,
        width: props.width,
        noTitle: props.noTitle,
      },
    }, children)
  }
  return {
    genPickerTitle,
    genPickerBody,
    genPickerActionsSlot,
    genPicker,
  }
}
