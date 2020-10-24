import { defineComponent, ExtractPropTypes, h, mergeProps, PropType, SetupContext } from 'vue'
import { colorableProps, textColor } from '../../mixins/colorable'
import useThemeable, { themeableProps } from '../../mixins/themeable'
// Utilities
import { getSlot } from '../../util/helpers'
// Styles
import './VMessages.sass'

export const messagesProps = {
  value: {
    type: Array as PropType<string[]>,
    default: () => ([]),
  },
}
export const VMessagesProps = {
  ...colorableProps,
  ...themeableProps,
  ...messagesProps,
}

/* @vue/component */
export function useMessages(props: ExtractPropTypes<typeof messagesProps>, context: SetupContext) {
  function genChildren() {
    return h('transition-group', {
      class: 'v-messages__wrapper',
      name: 'message-transition',
      tag: 'div',
    }, props.value.map(genMessage))
  }
  function genMessage(message: string, key: number) {
    return h('div', {
      class: 'v-messages__message',
      key,
    }, getSlot(context, 'default', { message, key }) || [message])
  }
  return {
    genChildren,
    genMessage,
  }
}

const VMessages = defineComponent({
  name: 'v-messages',
  props: VMessagesProps,
  setup(props, context) {
    const { themeClasses } = useThemeable(props)
    const { genChildren } = useMessages(props, context)

    return () => h('div', mergeProps(
      textColor(props.color),
      {
        class: { ...themeClasses.value, 'v-messages': true },
      },
      context.attrs,
    ), [genChildren()])
  },
})

export default VMessages
