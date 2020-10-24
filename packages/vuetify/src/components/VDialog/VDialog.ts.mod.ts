import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VDialog.sass'

// Components
import { VThemeProvider } from '../VThemeProvider'

// Mixins
import Activatable from '../../mixins/activatable'
import Dependent from '../../mixins/dependent'
import Detachable from '../../mixins/detachable'
import Overlayable from '../../mixins/overlayable'
import Returnable from '../../mixins/returnable'
import Stackable from '../../mixins/stackable'
import Toggleable from '../../mixins/toggleable'

// Directives
import ClickOutside from '../../directives/click-outside'

// Helpers
import mixins from '../../util/mixins'
import { removed } from '../../util/console'
import {
  convertToUnit,
  keyCodes,
} from '../../util/helpers'
import { activatableProps } from '@mixins/activatable/index.ts'
import { dependentProps } from '@mixins/dependent/index.ts'
import { detachableProps } from '@mixins/detachable/index.ts'

// Types
export const VDialogProps = {
  ...activatableProps,
  ...dependentProps,
  ...detachableProps,
  dark: Boolean,
  disabled: Boolean,
  fullscreen: Boolean,
  light: Boolean,
  maxWidth: {
    type: [String, Number],
    default: 'none',
  },
  noClickAnimation: Boolean,
  origin: {
    type: String,
    default: 'center center',
  },
  persistent: Boolean,
  retainFocus: {
    type: Boolean,
    default: true,
  },
  scrollable: Boolean,
  transition: {
    type: [String, Boolean],
    default: 'dialog-transition',
  },
  width: {
    type: [String, Number],
    default: 'auto',
  },
}

// const baseMixins = mixins(
//   Activatable,
//   Dependent,
//   Detachable,
//   Overlayable,
//   Returnable,
//   Stackable,
//   Toggleable
// )

/* @vue/component */
export function useVDialog(props: ExtractPropTypes<typeof VDialogProps>, context: SetupContext) {
  const data = reactive({
    activatedBy: null as EventTarget | null,
    animate: false,
    animateTimeout: -1,
    isActive: !!props.value,
    stackMinZIndex: 200,
  })

  const classes: Ref<object> = computed(() => {
    return {
      [(`v-dialog ${props.contentClass}`).trim()]: true,
      'v-dialog--active': data.isActive,
      'v-dialog--persistent': props.persistent,
      'v-dialog--fullscreen': props.fullscreen,
      'v-dialog--scrollable': props.scrollable,
      'v-dialog--animated': data.animate,
    }
  })
  const contentClasses: Ref<object> = computed(() => {
    return {
      'v-dialog__content': true,
      'v-dialog__content--active': data.isActive,
    }
  })
  const hasActivator: Ref<boolean> = computed(() => {
    return Boolean(
      !!context.slots.activator ||
      !!context.scopedSlots.activator
    )
  })

  watch(() => data.isActive, (val) => {
    if (val) {
      show()
      hideScroll()
    } else {
      props.removeOverlay()
      unbind()
    }
  })
  if (!data.isActive) return

  if (val) {
    hideScroll()
    props.removeOverlay(false)
  } else {
    props.showScroll()
    props.genOverlay()
  }
})

/* istanbul ignore next */
if (context.attrs.hasOwnProperty('full-width')) {
  removed('full-width', this)
}


onBeforeUnmount(() => {
  if (typeof window !== 'undefined') unbind()
})

function animateClick() {
  data.animate = false
  // Needed for when clicking very fast
  // outside of the dialog
  context.nextTick(() => {
    data.animate = true
    window.clearTimeout(data.animateTimeout)
    data.animateTimeout = window.setTimeout(() => (data.animate = false), 150)
  })
}
function closeConditional(e: Event) {
  const target = e.target as HTMLElement
  // Ignore the click if the dialog is closed or destroyed,
  // if it was on an element inside the content,
  // if it was dragged onto the overlay (#6969),
  // or if this isn't the topmost dialog (#9907)
  return !(
    props._isDestroyed ||
    !data.isActive ||
    context.refs.content.contains(target) ||
    (props.overlay && target && !props.overlay.$el.contains(target))
  ) && props.activeZIndex >= props.getMaxZIndex()
}
function hideScroll() {
  if (props.fullscreen) {
    document.documentElement.classList.add('overflow-y-hidden')
  } else {
    Overlayable.options.methods.hideScroll.call(this)
  }
}
function show() {
  !props.fullscreen && !props.hideOverlay && props.genOverlay()
  context.nextTick(() => {
    context.refs.content.focus()
    bind()
  })
}
function bind() {
  window.addEventListener('focusin', onFocusin)
}
function unbind() {
  window.removeEventListener('focusin', onFocusin)
}
function onClickOutside(e: Event) {
  context.emit('click:outside', e)

  if (props.persistent) {
    props.noClickAnimation || animateClick()
  } else {
    data.isActive = false
  }
}
function onKeydown(e: KeyboardEvent) {
  if (e.keyCode === keyCodes.esc && !props.getOpenDependents().length) {
    if (!props.persistent) {
      data.isActive = false
      const activator = props.getActivator()
      context.nextTick(() => activator && (activator as HTMLElement).focus())
    } else if (!props.noClickAnimation) {
      animateClick()
    }
  }
  context.emit('keydown', e)
}
// On focus change, wrap focus to stay inside the dialog
// https://github.com/vuetifyjs/vuetify/issues/6892
function onFocusin(e: Event) {
  if (!e || !props.retainFocus) return

  const target = e.target as HTMLElement

  if (
    !!target &&
    // It isn't the document or the dialog body
    ![document, context.refs.content].includes(target) &&
    // It isn't inside the dialog body
    !context.refs.content.contains(target) &&
    // We're the topmost dialog
    props.activeZIndex >= props.getMaxZIndex() &&
    // It isn't inside a dependent element (like a menu)
    !props.getOpenDependentElements().some(el => el.contains(target))
    // So we must have focused something outside the dialog and its children
  ) {
    // Find and focus the first available element inside the dialog
    const focusable = context.refs.content.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const el = [...focusable].find(el => !el.hasAttribute('disabled')) as HTMLElement | undefined
    el && el.focus()
  }
}
function genContent() {
  return props.showLazyContent(() => [
    context.createElement(VThemeProvider, {
      props: {
        root: true,
        light: props.light,
        dark: props.dark,
      },
    }, [
      context.createElement('div', {
        class: contentClasses.value,
        attrs: {
          role: 'document',
          tabindex: data.isActive ? 0 : undefined,
          ...props.getScopeIdAttrs(),
        },
        on: { keydown: onKeydown },
        style: { zIndex: props.activeZIndex },
        ref: 'content',
      }, [genTransition()]),
    ]),
  ])
}
function genTransition() {
  const content = genInnerContent()

  if (!props.transition) return content

  return context.createElement('transition', {
    props: {
      name: props.transition,
      origin: props.origin,
      appear: true,
    },
  }, [content])
}
function genInnerContent() {
  const data: VNodeData = {
    class: classes.value,
    ref: 'dialog',
    directives: [
      {
        name: 'click-outside',
        value: {
          handler: onClickOutside,
          closeConditional: closeConditional,
          include: props.getOpenDependentElements,
        },
      },
      { name: 'show', value: data.isActive },
    ],
    style: {
      transformOrigin: props.origin,
    },
  }

  if (!props.fullscreen) {
    data.style = {
      ...data.style as object,
      maxWidth: props.maxWidth === 'none' ? undefined : convertToUnit(props.maxWidth),
      width: props.width === 'auto' ? undefined : convertToUnit(props.width),
    }
  }

  return context.createElement('div', data, props.getContentSlot())
}

return {
  classes,
  contentClasses,
  hasActivator,
  animateClick,
  closeConditional,
  hideScroll,
  show,
  bind,
  unbind,
  onClickOutside,
  onKeydown,
    ,
    ,
  onFocusin,
  genContent,
  genTransition,
  genInnerContent,
}
}
const VDialog = defineComponent({
  name: 'v-dialog',
  props: VDialogProps,
  setup(props, context) {
    const { } = useVDialog(props, context)
    return h('div', {
      staticClass: 'v-dialog__container',
      class: {
        'v-dialog__container--attached':
          props.attach === '' ||
          props.attach === true ||
          props.attach === 'attach',
      },
      attrs: { role: 'dialog' },
    }, [
      props.genActivator(),
      genContent(),
    ])
  },
})

export default VDialog

