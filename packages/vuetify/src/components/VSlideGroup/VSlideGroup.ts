import { useIsDestroyed } from '@composables/destroy'
import { useVuetify } from '@framework'
import useMobile, { mobileProps } from '@mixins/mobile/index.ts'
import { computed, defineComponent, ExtractPropTypes, h, onBeforeUpdate, onUpdated, provide, reactive, Ref, ref, SetupContext, toRefs, VNode, watch, withDirectives } from 'vue'
import { VFadeTransition } from '../transitions'
// Components
import VIcon from '../VIcon'
// Extensions
import { useVItemGroup, VItemGroupProps } from '../VItemGroup/VItemGroup'
// Styles
import './VSlideGroup.sass'

export const VSlideGroupProps = {
  ...VItemGroupProps,
  ...mobileProps,
  activeClass: {
    type: String,
    default: 'v-slide-item--active',
  },
  centerActive: Boolean,
  nextIcon: {
    type: String,
    default: '$next',
  },
  prevIcon: {
    type: String,
    default: '$prev',
  },
  showArrows: {
    type: [Boolean, String],
    validator: (v: any) => (
      typeof v === 'boolean' || [
        'always',
        'desktop',
        'mobile',
      ].includes(v)
    ),
  },
}

interface TouchEvent {
  touchstartX: number
  touchmoveX: number
  stopPropagation: Function
}

interface Widths {
  content: number
  wrapper: number
}

// export const BaseSlideGroup = mixins<options &
//   /* eslint-disable indent */
//   ExtractVue<[
//     typeof BaseItemGroup,
//     typeof Mobile,
//   ]>
// /* eslint-enable indent */
// >(
//   BaseItemGroup,
//   Mobile,
/* @vue/component */
export function useVSlideGroup(props: ExtractPropTypes<typeof VSlideGroupProps>, context: SetupContext) {
  const { classes: itemGroupClasses, selectedIndex, selectedItem } = useVItemGroup(props, context)
  const { isMobile } = useMobile(props, context)
  const content: Ref<null | HTMLElement> = ref(null)
  const wrapper: Ref<null | HTMLElement> = ref(null)
  const vuetify = useVuetify()
  const data = reactive({
    internalItemsLength: 0,
    isOverflowing: false,
    resizeTimeout: 0,
    startX: 0,
    scrollOffset: 0,
    widths: {
      content: 0,
      wrapper: 0,
    },
  })
  const _isDestroyed = useIsDestroyed()

  const __cachedNext: Ref<VNode> = computed(() => {
    return genTransition('next')
  })
  const __cachedPrev: Ref<VNode> = computed(() => {
    return genTransition('prev')
  })
  const classes: Ref<object> = computed(() => {
    return {
      ...itemGroupClasses.value,
      'v-slide-group': true,
      'v-slide-group--has-affixes': hasAffixes.value,
      'v-slide-group--is-overflowing': data.isOverflowing,
    }
  })
  const hasAffixes: Ref<boolean> = computed(() => {
    switch (props.showArrows) {
      // Always show arrows on desktop & mobile
      case 'always': return true

      // Always show arrows on desktop
      case 'desktop': return !isMobile.value

      // Show arrows on mobile when overflowing.
      // This matches the default 2.2 behavior
      case true: return data.isOverflowing

      // Always show on mobile
      case 'mobile': return (
        isMobile.value ||
        data.isOverflowing
      )

      // https://material.io/components/tabs#scrollable-tabs
      // Always show arrows when
      // overflowed on desktop
      default: return (
        !isMobile.value &&
        data.isOverflowing
      )
    }
  })
  const hasNext: Ref<boolean> = computed(() => {
    if (!hasAffixes.value) return false

    const { content, wrapper } = data.widths

    // Check one scroll ahead to know the width of right-most item
    return content > Math.abs(data.scrollOffset) + wrapper
  })
  const hasPrev: Ref<boolean> = computed(() => {
    return hasAffixes.value && data.scrollOffset !== 0
  })

  watch([internalValue, () => data.isOverflowing], setWidths)
  // When overflow changes, the arrows alter
  // the widths of the content and wrapper
  // and need to be recalculated
  watch(() => data.scrollOffset, () => {
    if (content.value) {
      content.value.style.transform = `translateX(${-val}px)`
    }
  })

  onBeforeUpdate(() => {
    data.internalItemsLength = (context.children || []).length
  })

  onUpdated(() => {
    if (data.internalItemsLength === (context.children || []).length) return
    setWidths()
  })

  // Always generate next for scrollable hint
  function genNext(): VNode | null {
    const slot = context.slots.next
      ? context.slots.next({})
      : context.slots.next || __cachedNext.value


    return h('div', {
      staticClass: 'v-slide-group__next',
      class: {
        'v-slide-group__next--disabled': !hasNext.value,
      },
      on: {
        click: () => onAffixClick('next'),
      },
      key: 'next',
    }, [slot])
  }
  function genContent(): VNode {
    return h('div', {
      staticClass: 'v-slide-group__content',
      ref: content,
    }, context.slots.default?.())
  }
  function genData(): object {
    return {
      class: classes.value,
      directives: [{
        name: 'resize',
        value: onResize,
      }],
    }
  }
  function genIcon(location: 'prev' | 'next'): VNode | null {
    let icon = location

    if (vuetify.rtl && location === 'prev') {
      icon = 'next'
    } else if (vuetify.rtl && location === 'next') {
      icon = 'prev'
    }

    const upperLocation = `${location[0].toUpperCase()}${location.slice(1)}`
    let hasAffix: Ref<boolean> | undefined
    switch (upperLocation) {
      case 'Next':
        hasAffix = hasNext
        break
      case 'Prev':
        hasAffix = hasPrev
        break
      case 'Affixes':
        hasAffix = hasAffixes
        break
    }

    if (
      !props.showArrows &&
      !hasAffix
    ) return null

    return h(VIcon, {
      props: {
        disabled: !hasAffix?.value,
      },
    }, (props as any)[`${icon}Icon`])
  }
  // Always generate prev for scrollable hint
  function genPrev(): VNode | null {
    const slot = context.slots.prev
      ? context.slots.prev({})
      : context.slots.prev || __cachedPrev.value

    return h('div', {
      staticClass: 'v-slide-group__prev',
      class: {
        'v-slide-group__prev--disabled': !hasPrev.value,
      },
      on: {
        click: () => onAffixClick('prev'),
      },
      key: 'prev',
    }, [slot])
  }
  function genTransition(location: 'prev' | 'next') {
    return h(VFadeTransition, [genIcon(location)])
  }
  function genWrapper(): VNode {
    return withDirectives(h('div', {
      staticClass: 'v-slide-group__wrapper',
      ref: content,
    }, [genContent()]), [{
      name: 'touch',
      value: {
        start: (e: TouchEvent) => overflowCheck(e, onTouchStart),
        move: (e: TouchEvent) => overflowCheck(e, onTouchMove),
        end: (e: TouchEvent) => overflowCheck(e, onTouchEnd),
      },
    }])
  }
  function calculateNewOffset(direction: 'prev' | 'next', widths: Widths, rtl: boolean, currentScrollOffset: number) {
    const sign = rtl ? -1 : 1
    const newAbosluteOffset = sign * currentScrollOffset +
      (direction === 'prev' ? -1 : 1) * widths.wrapper

    return sign * Math.max(Math.min(newAbosluteOffset, widths.content - widths.wrapper), 0)
  }
  function onAffixClick(location: 'prev' | 'next') {
    context.emit(`click:${location}`)
    scrollTo(location)
  }
  function onResize() {
    /* istanbul ignore next */
    if (_isDestroyed.value) return

    setWidths()
  }
  function onTouchStart(e: TouchEvent) {
    data.startX = data.scrollOffset + e.touchstartX as number

    content.value?.style.setProperty('transition', 'none')
    content.value?.style.setProperty('willChange', 'transform')
  }
  function onTouchMove(e: TouchEvent) {
    data.scrollOffset = data.startX - e.touchmoveX
  }
  function onTouchEnd() {
    if (content.value && wrapper.value) {
      const maxScrollOffset = content.value.clientWidth - wrapper.value.clientWidth
      content.value.style.setProperty('transition', null)
      content.value.style.setProperty('willChange', null)
      if (vuetify.rtl) {
        /* istanbul ignore else */
        if (data.scrollOffset > 0 || !data.isOverflowing) {
          data.scrollOffset = 0
        } else if (data.scrollOffset <= -maxScrollOffset) {
          data.scrollOffset = -maxScrollOffset
        }
      } else {
        /* istanbul ignore else */
        if (data.scrollOffset < 0 || !data.isOverflowing) {
          data.scrollOffset = 0
        } else if (data.scrollOffset >= maxScrollOffset) {
          data.scrollOffset = maxScrollOffset
        }
      }
    }
  }
  function overflowCheck(e: TouchEvent, fn: (e: TouchEvent) => void) {
    e.stopPropagation()
    data.isOverflowing && fn(e)
  }
  function scrollIntoView /* istanbul ignore next */() {
    if (!selectedItem.value) {
      return
    }

    if (
      selectedIndex.value === 0 ||
      (!props.centerActive && !data.isOverflowing)
    ) {
      data.scrollOffset = 0
    } else if (props.centerActive) {
      data.scrollOffset = calculateCenteredOffset(
        selectedItem.value.el as HTMLElement, // TODO: check this
        data.widths,
        vuetify.rtl
      )
    } else if (data.isOverflowing) {
      data.scrollOffset = calculateUpdatedOffset(
        selectedItem.value.el as HTMLElement, // TODO: check this
        data.widths,
        vuetify.rtl,
        data.scrollOffset
      )
    }
  }
  function calculateUpdatedOffset(selectedElement: HTMLElement, widths: Widths, rtl: boolean, currentScrollOffset: number): number {
    const clientWidth = selectedElement.clientWidth
    const offsetLeft = rtl
      ? (widths.content - selectedElement.offsetLeft - clientWidth)
      : selectedElement.offsetLeft

    if (rtl) {
      currentScrollOffset = -currentScrollOffset
    }

    const totalWidth = widths.wrapper + currentScrollOffset
    const itemOffset = clientWidth + offsetLeft
    const additionalOffset = clientWidth * 0.4

    if (offsetLeft <= currentScrollOffset) {
      currentScrollOffset = Math.max(offsetLeft - additionalOffset, 0)
    } else if (totalWidth <= itemOffset) {
      currentScrollOffset = Math.min(currentScrollOffset - (totalWidth - itemOffset - additionalOffset), widths.content - widths.wrapper)
    }

    return rtl ? -currentScrollOffset : currentScrollOffset
  }
  function calculateCenteredOffset(selectedElement: HTMLElement, widths: Widths, rtl: boolean): number {
    const { offsetLeft, clientWidth } = selectedElement

    if (rtl) {
      const offsetCentered = widths.content - offsetLeft - clientWidth / 2 - widths.wrapper / 2
      return -Math.min(widths.content - widths.wrapper, Math.max(0, offsetCentered))
    } else {
      const offsetCentered = offsetLeft + clientWidth / 2 - widths.wrapper / 2
      return Math.min(widths.content - widths.wrapper, Math.max(0, offsetCentered))
    }
  }
  function scrollTo /* istanbul ignore next */(location: 'prev' | 'next') {
    data.scrollOffset = calculateNewOffset(location, {
      // Force reflow
      content: content.value ? content.value.clientWidth : 0,
      wrapper: wrapper.value ? wrapper.value.clientWidth : 0,
    }, vuetify.rtl, data.scrollOffset)
  }
  function setWidths /* istanbul ignore next */() {
    window.requestAnimationFrame(() => {

      data.widths = {
        content: content.value ? content.value.clientWidth : 0,
        wrapper: wrapper.value ? wrapper.value.clientWidth : 0,
      }

      data.isOverflowing = data.widths.wrapper < data.widths.content

      scrollIntoView()
    })
  }

  const result = {
    ...toRefs(data),
    __cachedNext,
    __cachedPrev,
    classes,
    hasAffixes,
    hasNext,
    hasPrev,
    genNext,
    genContent,
    genData,
    genIcon,
    genPrev,
    genTransition,
    genWrapper,
    calculateNewOffset,
    onAffixClick,
    onResize,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    overflowCheck,
    scrollIntoView /* istanbul ignore next */,
    calculateUpdatedOffset,
    calculateCenteredOffset,
    scrollTo /* istanbul ignore next */,
    setWidths /* istanbul ignore next */,
  }

  provide('slideGroup', result)

  return result
}

const VSlideGroup = defineComponent({
  name: 'v-slide-group',
  props: VSlideGroupProps,
  setup(props, context) {
    const {
      genData,
      genPrev,
      genWrapper,
      genNext,
    } = useVSlideGroup(props, context)
    return () => h('div', genData(), [
      genPrev(),
      genWrapper(),
      genNext(),
    ])
  }
})

export default VSlideGroup

