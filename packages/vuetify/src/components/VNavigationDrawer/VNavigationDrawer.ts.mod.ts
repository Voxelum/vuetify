import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VNavigationDrawer.sass'

// Components
import VImg, { srcObject } from '../VImg/VImg'

// Mixins
import Applicationable from '../../mixins/applicationable'
import Colorable from '../../mixins/colorable'
import Dependent from '../../mixins/dependent'
import Mobile from '../../mixins/mobile'
import Overlayable from '../../mixins/overlayable'
import SSRBootable from '../../mixins/ssr-bootable'
import Themeable from '../../mixins/themeable'

// Directives
import ClickOutside from '../../directives/click-outside'
import Resize from '../../directives/resize'
import Touch from '../../directives/touch'

// Utilities
import { convertToUnit, getSlot } from '../../util/helpers'
import mixins from '../../util/mixins'

// Types
import { VNode, VNodeDirective, PropType } from 'vue'
import { TouchWrapper } from 'vuetify/types'
export const VNavigationDrawerProps = {
    bottom: Boolean,
    clipped: Boolean,
    disableResizeWatcher: Boolean,
    disableRouteWatcher: Boolean,
    expandOnHover: Boolean,
    floating: Boolean,
    height: {
      type: [Number, String],
      default (): string {
        return this.app ? '100vh' : '100%'
      },
    },
    miniVariant: Boolean,
    miniVariantWidth: {
      type: [Number, String],
      default: 56,
    },
    permanent: Boolean,
    right: Boolean,
    src: {
      type: [String, Object] as PropType<string | srcObject>,
      default: '',
    },
    stateless: Boolean,
    tag: {
      type: String,
      default (): string {
        return this.app ? 'nav' : 'aside'
      },
    },
    temporary: Boolean,
    touchless: Boolean,
    width: {
      type: [Number, String],
      default: 256,
    },
    value: null as unknown as PropType<any>,
}

const baseMixins = mixins(
  Applicationable('left', [
    'isActive',
    'isMobile',
    'miniVariant',
    'expandOnHover',
    'permanent',
    'right',
    'temporary',
    'width',
  ]),
  Colorable,
  Dependent,
  Mobile,
  Overlayable,
  SSRBootable,
  Themeable
)

/* @vue/component */
export function useVNavigationDrawer(props: ExtractPropTypes<typeof VNavigationDrawerProps>, context: SetupContext) {




  const data = reactive({
    isMouseover: false,
    touchArea: {
      left: 0,
      right: 0,
    },
    stackMinZIndex: 6,
  })

     * Used for setting an app value from a dynamic
     * property. Called from applicationable.js
     */
    const applicationProperty: Ref<string> = computed(() => {
      return data.right ? 'right' : 'left'
    })
    const classes: Ref<object> = computed(() => {
      return {
        'v-navigation-drawer': true,
        'v-navigation-drawer--absolute': props.absolute,
        'v-navigation-drawer--bottom': props.bottom,
        'v-navigation-drawer--clipped': props.clipped,
        'v-navigation-drawer--close': !props.isActive,
        'v-navigation-drawer--fixed': !props.absolute && (props.app || props.fixed),
        'v-navigation-drawer--floating': props.floating,
        'v-navigation-drawer--is-mobile': isMobile.value,
        'v-navigation-drawer--is-mouseover': data.isMouseover,
        'v-navigation-drawer--mini-variant': isMiniVariant.value,
        'v-navigation-drawer--custom-mini-variant': Number(props.miniVariantWidth) !== 56,
        'v-navigation-drawer--open': props.isActive,
        'v-navigation-drawer--open-on-hover': props.expandOnHover,
        'v-navigation-drawer--right': data.right,
        'v-navigation-drawer--temporary': props.temporary,
        ...props.themeClasses,
      }
    })
    const computedMaxHeight: Ref<number | null> = computed(() => {
      if (!hasApp.value) return null

      const computedMaxHeight = (
        context.vuetify.application.bottom +
        context.vuetify.application.footer +
        context.vuetify.application.bar
      )

      if (!props.clipped) return computedMaxHeight

      return computedMaxHeight + context.vuetify.application.top
    })
    const computedTop: Ref<number> = computed(() => {
      if (!hasApp.value) return 0

      let computedTop = context.vuetify.application.bar

      computedTop += props.clipped
        ? context.vuetify.application.top
        : 0

      return computedTop
    })
    const computedTransform: Ref<number> = computed(() => {
      if (props.isActive) return 0
      if (isBottom.value) return 100
      return data.right ? 100 : -100
    })
    const computedWidth: Ref<string | number> = computed(() => {
      return isMiniVariant.value ? props.miniVariantWidth : props.width
    })
    const hasApp: Ref<boolean> = computed(() => {
      return (
        props.app &&
        (!isMobile.value && !props.temporary)
      )
    })
    const isBottom: Ref<boolean> = computed(() => {
      return props.bottom && isMobile.value
    })
    const isMiniVariant: Ref<boolean> = computed(() => {
      return (
        !props.expandOnHover &&
        props.miniVariant
      ) || (
        props.expandOnHover &&
        !data.isMouseover
      )
    })
    const isMobile: Ref<boolean> = computed(() => {
      return (
        !props.stateless &&
        !props.permanent &&
        Mobile.options.computed.isMobile.call(this)
      )
    })
    const reactsToClick: Ref<boolean> = computed(() => {
      return (
        !props.stateless &&
        !props.permanent &&
        (isMobile.value || props.temporary)
      )
    })
    const reactsToMobile: Ref<boolean> = computed(() => {
      return (
        props.app &&
        !props.disableResizeWatcher &&
        !props.permanent &&
        !props.stateless &&
        !props.temporary
      )
    })
    const reactsToResize: Ref<boolean> = computed(() => {
      return !props.disableResizeWatcher && !props.stateless
    })
    const reactsToRoute: Ref<boolean> = computed(() => {
      return (
        !props.disableRouteWatcher &&
        !props.stateless &&
        (props.temporary || isMobile.value)
      )
    })
    const showOverlay: Ref<boolean> = computed(() => {
      return (
        !props.hideOverlay &&
        props.isActive &&
        (isMobile.value || props.temporary)
      )
    })
    const styles: Ref<object> = computed(() => {
      const translate = isBottom.value ? 'translateY' : 'translateX'
      const styles = {
        height: convertToUnit(props.height),
        top: !isBottom.value ? convertToUnit(computedTop.value) : 'auto',
        maxHeight: computedMaxHeight.value != null
          ? `calc(100% - ${convertToUnit(computedMaxHeight.value)})`
          : undefined,
        transform: `${translate}(${convertToUnit(computedTransform.value, '%')})`,
        width: convertToUnit(computedWidth.value),
      }

      return styles
    })

    isActive (val) {
      context.emit('input', val)
    },
    /**
     * When mobile changes, adjust the active state
{
    /**
     * When mobile changes, adjust the active state
     * only when there has been a previous value
     */
    isMobile (val, prev) {
      !val &&
        props.isActive &&
        !props.temporary &&
        props.removeOverlay()

      if (prev == null ||
        !reactsToResize.value ||
        !reactsToMobile.value
      ) return

      props.isActive = !val
})
watch(() => props.permanent, (val) => {
      // If enabling prop enable the drawer
      if (val) props.isActive = true
})
watch(showOverlay, (val) => {
      if (val) props.genOverlay()
      else props.removeOverlay()
})
watch(props, (val) => {
      if (props.permanent) return

      if (val == null) {
        init()
        return
      }

      if (val !== props.isActive) props.isActive = val
})
watch(() => props.expandOnHover, undefined => {
{


  function calculateTouchArea () {
      const parent = context.el.parentNode as Element

      if (!parent) return

      const parentRect = parent.getBoundingClientRect()

      data.touchArea = {
        left: parentRect.left + 50,
        right: parentRect.right - 50,
      }
    }
  function closeConditional () {
      return props.isActive && !props._isDestroyed && reactsToClick.value
    }
  function genAppend () {
      return genPosition('append')
    }
  function genBackground () {
      const props = {
        height: '100%',
        width: '100%',
        src: props.src,
      }

      const image = context.scopedSlots.img
        ? context.scopedSlots.img(props)
        : context.createElement(VImg, { props })

      return context.createElement('div', {
        staticClass: 'v-navigation-drawer__image',
      }, [image])
    }
  function genDirectives (): VNodeDirective[] {
      const directives = [{
        name: 'click-outside',
        value: {
          handler: () => { props.isActive = false },
          closeConditional: closeConditional,
          include: props.getOpenDependentElements,
        },
      }]

      if (!props.touchless && !props.stateless) {
        directives.push({
          name: 'touch',
          value: {
            parent: true,
            left: swipeLeft,
            right: swipeRight,
          },
        } as any)
      }

      return directives
    }
  function genListeners () {
      const on: Record<string, (e: Event) => void> = {
        transitionend: (e: Event) => {
          if (e.target !== e.currentTarget) return
          context.emit('transitionend', e)

          // IE11 does not support new Event('resize')
          const resizeEvent = document.createEvent('UIEvents')
          resizeEvent.initUIEvent('resize', true, false, window, 0)
          window.dispatchEvent(resizeEvent)
        },
      }

      if (props.miniVariant) {
        on.click = () => context.emit('update:mini-variant', false)
      }

      if (props.expandOnHover) {
        on.mouseenter = () => (data.isMouseover = true)
        on.mouseleave = () => (data.isMouseover = false)
      }

      return on
    }
  function genPosition (name: 'prepend' | 'append') {
      const slot = getSlot(this, name)

      if (!slot) return slot

      return context.createElement('div', {
        staticClass: `v-navigation-drawer__${name}`,
      }, slot)
    }
  function genPrepend () {
      return genPosition('prepend')
    }
  function genContent () {
      return context.createElement('div', {
        staticClass: 'v-navigation-drawer__content',
      }, context.slots.default)
    }
  function genBorder () {
      return context.createElement('div', {
        staticClass: 'v-navigation-drawer__border',
      })
    }
  function init () {
      if (props.permanent) {
        props.isActive = true
      } else if (props.stateless ||
        props.value != null
      ) {
        props.isActive = props.value
      } else if (!props.temporary) {
        props.isActive = !isMobile.value
      }
    }
  function onRouteChange () {
      if (reactsToRoute.value && closeConditional()) {
        props.isActive = false
      }
    }
  function swipeLeft (e: TouchWrapper) {
      if (props.isActive && data.right) return
      calculateTouchArea()

      if (Math.abs(e.touchendX - e.touchstartX) < 100) return
      if (data.right &&
        e.touchstartX >= data.touchArea.right
      ) props.isActive = true
      else if (!data.right && props.isActive) props.isActive = false
    }
  function swipeRight (e: TouchWrapper) {
      if (props.isActive && !data.right) return
      calculateTouchArea()

      if (Math.abs(e.touchendX - e.touchstartX) < 100) return
      if (!data.right &&
        e.touchstartX <= data.touchArea.left
      ) props.isActive = true
      else if (data.right && props.isActive) props.isActive = false
    }
    /**
     * Update the application layout
     */
  function updateApplication () {
      if (
        !props.isActive ||
        isMobile.value ||
        props.temporary ||
        !context.el
      ) return 0

      const width = Number(computedWidth.value)

      return isNaN(width) ? context.el.clientWidth : width
    }
  function updateMiniVariant (val: boolean) {
      if (props.miniVariant !== val) context.emit('update:mini-variant', val)
    }

  return {
    applicationProperty,
    classes,
    computedMaxHeight,
    computedTop,
    computedTransform,
    computedWidth,
    hasApp,
    isBottom,
    isMiniVariant,
    isMobile,
    reactsToClick,
    reactsToMobile,
    reactsToResize,
    reactsToRoute,
    showOverlay,
    styles,
    calculateTouchArea,
    closeConditional,
    genAppend,
    genBackground,
    genDirectives,
    genListeners,
    genPosition,
    genPrepend,
    genContent,
    genBorder,
    init,
    onRouteChange,
    swipeLeft,
    swipeRight,
    updateApplication,
    updateMiniVariant,
  }
}
const VNavigationDrawer = defineComponent({
  name: 'v-navigation-drawer',
  props: VNavigationDrawerProps,
  setup(props, context) {
    const {} = useVNavigationDrawer(props, context)
    const children = [
      genPrepend(),
      genContent(),
      genAppend(),
      genBorder(),
    ]

    if (props.src || getSlot(this, 'img')) children.unshift(genBackground())

    return h(props.tag, props.setBackgroundColor(props.color, {
      class: classes.value,
      style: styles.value,
      directives: genDirectives(),
      on: genListeners(),
    }), children)
  },
})

export default VNavigationDrawer

