import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VEditDialog.sass'

// Mixins
import Returnable from '../../mixins/returnable'
import Themeable from '../../mixins/themeable'

// Utils
import { keyCodes } from '../../util/helpers'

// Component
import VBtn from '../VBtn'
import VMenu from '../VMenu'

// Types
import { VNode, VNodeChildren } from 'vue'
import mixins from '../../util/mixins'
export const VEditDialogProps = {
    cancelText: {
      default: 'Cancel',
    },
    large: Boolean,
    eager: Boolean,
    persistent: Boolean,
    saveText: {
      default: 'Save',
    },
    transition: {
      type: String,
      default: 'slide-x-reverse-transition',
    },
}

/* @vue/component */
export function useVEditDialog(props: ExtractPropTypes<typeof VEditDialogProps>, context: SetupContext) {


  const data = reactive({
      isActive: false,
    }
)

watch(() => data.isActive, (val) => {
      if (val) {
        context.emit('open')
        setTimeout(focus, 50) // Give DOM time to paint
      } else {
        context.emit('close')
      }
})

  function cancel () {
      data.isActive = false
      context.emit('cancel')
    }
  function focus () {
      const input = (context.refs.content as Element).querySelector('input')
      input && input.focus()
    }
  function genButton (fn: Function, text: VNodeChildren): VNode {
      return context.createElement(VBtn, {
        props: {
          text: true,
          color: 'primary',
          light: true,
        },
        on: { click: fn },
      }, text)
    }
  function genActions (): VNode {
      return context.createElement('div', {
        class: 'v-small-dialog__actions',
      }, [
        genButton(cancel, props.cancelText),
        genButton(() => {
          props.save(props.returnValue)
          context.emit('save')
        }, props.saveText),
      ])
    }
  function genContent (): VNode {
      return context.createElement('div', {
        staticClass: 'v-small-dialog__content',
        on: {
          keydown: (e: KeyboardEvent) => {
            e.keyCode === keyCodes.esc && cancel()
            if (e.keyCode === keyCodes.enter) {
              props.save(props.returnValue)
              context.emit('save')
            }
          },
        },
        ref: 'content',
      }, [context.slots.input])
    }

  return {
    cancel,
    focus,
    genButton,
    genActions,
    genContent,
  }
}
const VEditDialog = defineComponent({
  name: 'v-edit-dialog',
  props: VEditDialogProps,
  setup(props, context) {
    const {} = useVEditDialog(props, context)
    return h(VMenu, {
      staticClass: 'v-small-dialog',
      class: props.themeClasses,
      props: {
        contentClass: 'v-small-dialog__menu-content',
        transition: props.transition,
        origin: 'top right',
        right: true,
        value: data.isActive,
        closeOnClick: !props.persistent,
        closeOnContentClick: false,
        eager: props.eager,
        light: props.light,
        dark: props.dark,
      },
      on: {
        input: (val: boolean) => (data.isActive = val),
      },
      scopedSlots: {
        activator: ({ on }) => {
          return h('div', {
            staticClass: 'v-small-dialog__activator',
            on,
          }, [
            h('span', {
              staticClass: 'v-small-dialog__activator__content',
            }, context.slots.default),
          ])
        },
      },
    }, [
      genContent(),
      props.large ? genActions() : null,
    ])
  },
})

export default VEditDialog

