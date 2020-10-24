import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VBanner.sass'

// Extensions
import VSheet from '../VSheet'

// Components
import VAvatar from '../VAvatar'
import VIcon from '../VIcon'
import { VExpandTransition } from '../transitions'

// Mixins
import Mobile from '../../mixins/mobile'
import Toggleable from '../../mixins/toggleable'

// Utilities
import mixins from '../../util/mixins'
import {
  convertToUnit,
  getSlot,
} from '../../util/helpers'

// Typeslint
import { VNode } from 'vue'
export const VBannerProps = {
}

/* @vue/component */
  VSheet,
  Mobile,
  Toggleable
export function useVBanner(props: ExtractPropTypes<typeof VBannerProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        ...VSheet.options.computed.classes.call(this),
        'v-banner--has-icon': hasIcon.value,
        'v-banner--is-mobile': props.isMobile,
        'v-banner--single-line': props.singleLine,
        'v-banner--sticky': isSticky.value,
      }
    })
    const hasIcon: Ref<boolean> = computed(() => {
      return Boolean(props.icon || context.slots.icon)
    })
    const isSticky: Ref<boolean> = computed(() => {
      return props.sticky || props.app
    })
    const styles: Ref<object> = computed(() => {
      const styles: Record<string, any> = { ...VSheet.options.computed.styles.call(this) }

      if (isSticky.value) {
        const top = !props.app
          ? 0
          : (context.vuetify.application.bar + context.vuetify.application.top)

        styles.top = convertToUnit(top)
        styles.position = 'sticky'
        styles.zIndex = 1
      }

      return styles
    })

    /** @public */
  function toggle () {
      props.isActive = !props.isActive
    }
  function iconClick (e: MouseEvent) {
      context.emit('click:icon', e)
    }
  function genIcon () {
      if (!hasIcon.value) return undefined

      let content

      if (props.icon) {
        content = context.createElement(VIcon, {
          props: {
            color: props.iconColor,
            size: 28,
          },
        }, [props.icon])
      } else {
        content = context.slots.icon
      }

      return context.createElement(VAvatar, {
        staticClass: 'v-banner__icon',
        props: {
          color: props.color,
          size: 40,
        },
        on: {
          click: iconClick,
        },
      }, [content])
    }
  function genText () {
      return context.createElement('div', {
        staticClass: 'v-banner__text',
      }, context.slots.default)
    }
  function genActions () {
      const children = getSlot(this, 'actions', {
        dismiss: () => props.isActive = false,
      })

      if (!children) return undefined

      return context.createElement('div', {
        staticClass: 'v-banner__actions',
      }, children)
    }
  function genContent () {
      return context.createElement('div', {
        staticClass: 'v-banner__content',
      }, [
        genIcon(),
        genText(),
      ])
    }
  function genWrapper () {
      return context.createElement('div', {
        staticClass: 'v-banner__wrapper',
      }, [
        genContent(),
        genActions(),
      ])
    }

  return {
    classes,
    hasIcon,
    isSticky,
    styles,
    toggle,
    iconClick,
    genIcon,
    genText,
    genActions,
    genContent,
    genWrapper,
  }
}
const VBanner = defineComponent({
  name: 'v-banner',
  props: VBannerProps,
  setup(props, context) {
    const {} = useVBanner(props, context)
    return h(VExpandTransition, [
      h('div', props.setBackgroundColor(props.color, {
        staticClass: 'v-banner',
        attrs: props.attrs$,
        class: classes.value,
        style: styles.value,
        directives: [{
          name: 'show',
          value: props.isActive,
        }],
      }), [genWrapper()]),
    ])
  },
})

export default VBanner

