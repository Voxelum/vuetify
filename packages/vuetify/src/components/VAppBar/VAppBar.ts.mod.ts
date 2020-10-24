import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VAppBar.sass'

// Extensions
import VToolbar, { VToolbarProps } from '../VToolbar/VToolbar'

// Directives
import Scroll from '../../directives/scroll'

// Mixins
import Applicationable from '../../mixins/applicationable'
import Scrollable, { scrollableProps } from '../../mixins/scrollable'
import SSRBootable from '../../mixins/ssr-bootable'
import Toggleable from '../../mixins/toggleable'

// Utilities
import { convertToUnit } from '../../util/helpers'
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue'
export const VAppBarProps = {
  ...VToolbarProps,
  ...scrollableProps,
  clippedLeft: Boolean,
  clippedRight: Boolean,
  collapseOnScroll: Boolean,
  elevateOnScroll: Boolean,
  fadeImgOnScroll: Boolean,
  hideOnScroll: Boolean,
  invertedScroll: Boolean,
  scrollOffScreen: Boolean,
  shrinkOnScroll: Boolean,
  value: {
    type: Boolean,
    default: true,
  },
}

// const baseMixins = mixins(
//   VToolbar,
//   Scrollable,
//   SSRBootable,
//   Toggleable,
//   Applicationable('top', [
//     'clippedLeft',
//     'clippedRight',
//     'computedHeight',
//     'invertedScroll',
//     'isExtended',
//     'isProminent',
//     'value',
//   ])
// )

/* @vue/component */
export function useVAppBar(props: ExtractPropTypes<typeof VAppBarProps>, context: SetupContext) {


  const data = reactive({
    isActive: props.value,
  }
  )

  const applicationProperty: Ref<string> = computed(() => {
    return !props.bottom ? 'top' : 'bottom'
  })
  const canScroll: Ref<boolean> = computed(() => {
    return (
      Scrollable.options.computed.canScroll.call(this) &&
      (
        props.invertedScroll ||
        props.elevateOnScroll ||
        props.hideOnScroll ||
        props.collapseOnScroll ||
        props.isBooted ||
        // If falsey, user has provided an
        // explicit value which should
        // overwrite anything we do
        !props.value
      )
    )
  })
  const classes: Ref<object> = computed(() => {
    return {
      ...VToolbar.options.computed.classes.call(this),
      'v-toolbar--collapse': props.collapse || props.collapseOnScroll,
      'v-app-bar': true,
      'v-app-bar--clipped': props.clippedLeft || props.clippedRight,
      'v-app-bar--fade-img-on-scroll': props.fadeImgOnScroll,
      'v-app-bar--elevate-on-scroll': props.elevateOnScroll,
      'v-app-bar--fixed': !props.absolute && (props.app || props.fixed),
      'v-app-bar--hide-shadow': hideShadow.value,
      'v-app-bar--is-scrolled': props.currentScroll > 0,
      'v-app-bar--shrink-on-scroll': props.shrinkOnScroll,
    }
  })
  const computedContentHeight: Ref<number> = computed(() => {
    if (!props.shrinkOnScroll) return VToolbar.options.computed.computedContentHeight.call(this)

    const height = computedOriginalHeight.value

    const min = props.dense ? 48 : 56
    const max = height
    const difference = max - min
    const iteration = difference / computedScrollThreshold.value
    const offset = props.currentScroll * iteration

    return Math.max(min, max - offset)
  })
  const computedFontSize: Ref<number | undefined> = computed(() => {
    if (!isProminent.value) return undefined

    const max = props.dense ? 96 : 128
    const difference = max - computedContentHeight.value
    const increment = 0.00347

    // 1.5rem to a minimum of 1.25rem
    return Number((1.50 - difference * increment).toFixed(2))
  })
  const computedLeft: Ref<number> = computed(() => {
    if (!props.app || props.clippedLeft) return 0

    return context.vuetify.application.left
  })
  const computedMarginTop: Ref<number> = computed(() => {
    if (!props.app) return 0

    return context.vuetify.application.bar
  })
  const computedOpacity: Ref<number | undefined> = computed(() => {
    if (!props.fadeImgOnScroll) return undefined

    const opacity = Math.max(
      (computedScrollThreshold.value - props.currentScroll) / computedScrollThreshold.value,
      0
    )

    return Number(parseFloat(opacity).toFixed(2))
  })
  const computedOriginalHeight: Ref<number> = computed(() => {
    let height = VToolbar.options.computed.computedContentHeight.call(this)
    if (props.isExtended) height += parseInt(props.extensionHeight)
    return height
  })
  const computedRight: Ref<number> = computed(() => {
    if (!props.app || props.clippedRight) return 0

    return context.vuetify.application.right
  })
  const computedScrollThreshold: Ref<number> = computed(() => {
    if (props.scrollThreshold) return Number(props.scrollThreshold)

    return computedOriginalHeight.value - (props.dense ? 48 : 56)
  })
  const computedTransform: Ref<number> = computed(() => {
    if (
      !canScroll.value ||
      (props.elevateOnScroll && props.currentScroll === 0 && data.isActive)
    ) return 0

    if (data.isActive) return 0

    const scrollOffScreen = props.scrollOffScreen
      ? props.computedHeight
      : computedContentHeight.value

    return props.bottom ? scrollOffScreen : -scrollOffScreen
  })
  const hideShadow: Ref<boolean> = computed(() => {
    if (props.elevateOnScroll && props.isExtended) {
      return props.currentScroll < computedScrollThreshold.value
    }

    if (props.elevateOnScroll) {
      return props.currentScroll === 0 ||
        computedTransform.value < 0
    }

    return (
      !props.isExtended ||
      props.scrollOffScreen
    ) && computedTransform.value !== 0
  })
  const isCollapsed: Ref<boolean> = computed(() => {
    if (!props.collapseOnScroll) {
      return VToolbar.options.computed.isCollapsed.call(this)
    }

    return props.currentScroll > 0
  })
  const isProminent: Ref<boolean> = computed(() => {
    return (
      VToolbar.options.computed.isProminent.call(this) ||
      props.shrinkOnScroll
    )
  })
  const styles: Ref<object> = computed(() => {
    return {
      ...VToolbar.options.computed.styles.call(this),
      fontSize: convertToUnit(computedFontSize.value, 'rem'),
      marginTop: convertToUnit(computedMarginTop.value),
      transform: `translateY(${convertToUnit(computedTransform.value)})`,
      left: convertToUnit(computedLeft.value),
      right: convertToUnit(computedRight.value),
    }
  })

  watch(canScroll, undefined => {
    computedTransform() {
      // Normally we do not want the v-app-bar
      // to update the application top value
      // to avoid screen jump. However, in
      // this situation, we must so that
      // the clipped drawer can update
      // its top value when scrolled
      if (
        {
          invertedScroll(val: boolean) {
            data.isActive = !val || props.currentScroll !== 0
          })

        if (props.invertedScroll) data.isActive = false

      function genBackground() {
        const render = VToolbar.options.methods.genBackground.call(this)

        render.data = props._b(render.data || {}, render.tag!, {
          style: { opacity: computedOpacity.value },
        })

        return render
      }
      function updateApplication(): number {
        return props.invertedScroll
          ? 0
          : props.computedHeight + computedTransform.value
      }
      function thresholdMet() {
        if (props.invertedScroll) {
          data.isActive = props.currentScroll > computedScrollThreshold.value
          return
        }

        if (props.hideOnScroll) {
          data.isActive = props.isScrollingUp ||
            props.currentScroll < computedScrollThreshold.value
        }

        if (props.currentThreshold < computedScrollThreshold.value) return

        props.savedScroll = props.currentScroll
      }

      return {
        applicationProperty,
        canScroll,
        classes,
        computedContentHeight,
        computedFontSize,
        computedLeft,
        computedMarginTop,
        computedOpacity,
        computedOriginalHeight,
        computedRight,
        computedScrollThreshold,
        computedTransform,
        hideShadow,
        isCollapsed,
        isProminent,
        styles,
        genBackground,
        updateApplication,
        thresholdMet,
      }
    }
    const VAppBar = defineComponent({
      name: 'v-app-bar',
      props: VAppBarProps,
      setup(props, context) {
        const { } = useVAppBar(props, context)
        const render = VToolbar.options.render.call(this, h)

        render.data = render.data || {}

        if (canScroll.value) {
          render.data.directives = render.data.directives || []
          render.data.directives.push({
            arg: props.scrollTarget,
            name: 'scroll',
            value: props.onScroll,
          })
        }

        return render
      },
    })

    export default VAppBar

