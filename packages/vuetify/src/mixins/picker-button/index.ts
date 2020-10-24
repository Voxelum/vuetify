import { ExtractPropTypes, h, SetupContext, VNodeArrayChildren } from 'vue'
import { kebabCase } from '../../util/helpers'
// Mixins
import { colorableProps } from '../colorable'

// Types
export const pickerButtonProps = {
  ...colorableProps
}

/* @vue/component */
export default function usePickerButton(props: ExtractPropTypes<typeof pickerButtonProps>, context: SetupContext) {
  function genPickerButton(
    prop: keyof typeof pickerButtonProps,
    value: any,
    content: VNodeArrayChildren,
    readonly = false,
    staticClass = ''
  ) {
    const active = props[prop] === value
    const click = (event: Event) => {
      event.stopPropagation()
      context.emit(`update:${kebabCase(prop)}`, value)
    }

    return h('div', {
      staticClass: `v-picker__title__btn ${staticClass}`.trim(),
      class: {
        'v-picker__title__btn--active': active,
        'v-picker__title__btn--readonly': readonly,
      },
      on: (active || readonly) ? undefined : { click }, // TODO: check this
    }, Array.isArray(content) ? content : [content])
  }
  return {
    genPickerButton,
  }
}
