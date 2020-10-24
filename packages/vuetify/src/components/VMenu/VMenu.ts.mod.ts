import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VMenu.sass'

// Components
import { VThemeProvider } from '../VThemeProvider'

// Mixins
import Activatable from '../../mixins/activatable'
import Delayable from '../../mixins/delayable'
import Dependent from '../../mixins/dependent'
import Detachable from '../../mixins/detachable'
import Menuable from '../../mixins/menuable'
import Returnable from '../../mixins/returnable'
import Roundable from '../../mixins/roundable'
import Toggleable from '../../mixins/toggleable'
import Themeable from '../../mixins/themeable'

// Directives
import ClickOutside from '../../directives/click-outside'
import Resize from '../../directives/resize'

// Utilities
import mixins from '../../util/mixins'
import { removed } from '../../util/console'
import {
  convertToUnit,
  keyCodes,
} from '../../util/helpers'

// Types
import { VNode, VNodeDirective, VNodeData } from 'vue'
export const VMenuProps = {
    auto: Boolean,
    closeOnClick: {
      type: Boolean,
      default: true,
    },
    closeOnContentClick: {
      type: Boolean,
      default: true,
    },
    disabled: Boolean,
    disableKeys: Boolean,
    maxHeight: {
      type: [Number, String],
      default: 'auto',
    },
    offsetX: Boolean,
    offsetY: Boolean,
    openOnClick: {
      type: Boolean,
      default: true,
    },
    openOnHover: Boolean,
    origin: {
      type: String,
      default: 'top left',
    },
    transition: {
      type: [Boolean, String],
      default: 'v-menu-transition',
    },
}

const baseMixins = mixins(
  Dependent,
  Delayable,
  Detachable,
  Menuable,
  Returnable,
  Roundable,
  Toggleable,
  Themeable
)

/* @vue/component */
export function useVMenu(props: ExtractPropTypes<typeof VMenuProps>, context: SetupContext) {




  const data = reactive({
      calculatedTopAuto: 0,
      defaultOffset: 8,
      hasJustFocused: false,
      listIndex: -1,
      resizeTimeout: 0,
      selectedIndex: null as null | number,
      tiles: [] as HTMLElement[],
    }
)

    const activeTile: Ref<HTMLElement | undefined> = computed(() => {
      return data.tiles[data.listIndex]
    })
    const calculatedLeft: Ref<string> = computed(() => {
      const menuWidth = Math.max(props.dimensions.content.width, parseFloat(calculatedMinWidth.value))

      if (!props.auto) return props.calcLeft(menuWidth) || '0'

      return convertToUnit(props.calcXOverflow(calcLeftAuto(), menuWidth)) || '0'
    })
    const calculatedMaxHeight: Ref<string> = computed(() => {
      const height = props.auto
        ? '200px'
        : convertToUnit(props.maxHeight)

      return height || '0'
    })
    const calculatedMaxWidth: Ref<string> = computed(() => {
      return convertToUnit(props.maxWidth) || '0'
    })
    const calculatedMinWidth: Ref<string> = computed(() => {
      if (props.minWidth) {
        return convertToUnit(props.minWidth) || '0'
      }

      const minWidth = Math.min(
        props.dimensions.activator.width +
        Number(props.nudgeWidth) +
        (props.auto ? 16 : 0),
        Math.max(props.pageWidth - 24, 0)
      )

      const calculatedMaxWidth = isNaN(parseInt(calculatedMaxWidth.value))
        ? minWidth
        : parseInt(calculatedMaxWidth.value)

      return convertToUnit(Math.min(
        calculatedMaxWidth,
        minWidth
      )) || '0'
    })
    const calculatedTop: Ref<string> = computed(() => {
      const top = !props.auto
        ? props.calcTop()
        : convertToUnit(props.calcYOverflow(data.calculatedTopAuto))

      return top || '0'
    })
    const hasClickableTiles: Ref<boolean> = computed(() => {
      return Boolean(data.tiles.find(tile => tile.tabIndex > -1))
    })
    const styles: Ref<object> = computed(() => {
      return {
        maxHeight: calculatedMaxHeight.value,
        minWidth: calculatedMinWidth.value,
        maxWidth: calculatedMaxWidth.value,
        top: calculatedTop.value,
        left: calculatedLeft.value,
        transformOrigin: props.origin,
        zIndex: props.zIndex || props.activeZIndex,
      }
    })

      if (!val) data.listIndex = -1
})
      data.hasJustFocused = val
})
watch(() => data.listIndex, (next, prev) => {
      if (next in data.tiles) {
        const tile = data.tiles[next]
        tile.classList.add('v-list-item--highlighted')
        context.refs.content.scrollTop = tile.offsetTop - tile.clientHeight
      }

      prev in data.tiles &&
        data.tiles[prev].classList.remove('v-list-item--highlighted')
})

    /* istanbul ignore next */
    if (context.attrs.hasOwnProperty('full-width')) {
      removed('full-width', this)
    }

  onMounted(() => {
    props.isActive && props.callActivate()
  })

  function activate () {
      // Update coordinates and dimensions of menu
      // and its activator
      props.updateDimensions()
      // Start the transition
      requestAnimationFrame(() => {
        // Once transitioning, calculate scroll and top position
        props.startTransition().then(() => {
          if (context.refs.content) {
            data.calculatedTopAuto = calcTopAuto()
            props.auto && (context.refs.content.scrollTop = calcScrollPosition())
          }
        })
      })
    }
  function calcScrollPosition () {
      const $el = context.refs.content
      const activeTile = $el.querySelector('.v-list-item--active') as HTMLElement
      const maxScrollTop = $el.scrollHeight - $el.offsetHeight

      return activeTile
        ? Math.min(maxScrollTop, Math.max(0, activeTile.offsetTop - $el.offsetHeight / 2 + activeTile.offsetHeight / 2))
        : $el.scrollTop
    }
  function calcLeftAuto () {
      return parseInt(props.dimensions.activator.left - data.defaultOffset * 2)
    }
  function calcTopAuto () {
      const $el = context.refs.content
      const activeTile = $el.querySelector('.v-list-item--active') as HTMLElement | null

      if (!activeTile) {
        data.selectedIndex = null
      }

      if (props.offsetY || !activeTile) {
        return props.computedTop
      }

      data.selectedIndex = Array.from(data.tiles).indexOf(activeTile)

      const tileDistanceFromMenuTop = activeTile.offsetTop - calcScrollPosition()
      const firstTileOffsetTop = ($el.querySelector('.v-list-item') as HTMLElement).offsetTop

      return props.computedTop - tileDistanceFromMenuTop - firstTileOffsetTop - 1
    }
  function changeListIndex (e: KeyboardEvent) {
      // For infinite scroll and autocomplete, re-evaluate children
      getTiles()

      if (!props.isActive || !hasClickableTiles.value) {
        return
      } else if (e.keyCode === keyCodes.tab) {
        props.isActive = false
        return
      } else if (e.keyCode === keyCodes.down) {
        nextTile()
      } else if (e.keyCode === keyCodes.up) {
        prevTile()
      } else if (e.keyCode === keyCodes.enter && data.listIndex !== -1) {
        data.tiles[data.listIndex].click()
      } else { return }
      // One of the conditions was met, prevent default action (#2988)
      e.preventDefault()
    }
  function closeConditional (e: Event) {
      const target = e.target as HTMLElement

      return props.isActive &&
        !props._isDestroyed &&
        props.closeOnClick &&
        !context.refs.content.contains(target)
    }
  function genActivatorAttributes () {
      const attributes = Activatable.options.methods.genActivatorAttributes.call(this)

      if (activeTile.value && activeTile.value.id) {
        return {
          ...attributes,
          'aria-activedescendant': activeTile.value.id,
        }
      }

      return attributes
    }
  function genActivatorListeners () {
      const listeners = Menuable.options.methods.genActivatorListeners.call(this)

      if (!props.disableKeys) {
        listeners.keydown = onKeyDown
      }

      return listeners
    }
  function genTransition (): VNode {
      const content = genContent()

      if (!props.transition) return content

      return context.createElement('transition', {
        props: {
          name: props.transition,
        },
      }, [content])
    }
  function genDirectives (): VNodeDirective[] {
      const directives: VNodeDirective[] = [{
        name: 'show',
        value: props.isContentActive,
      }]

      // Do not add click outside for hover menu
      if (!props.openOnHover && props.closeOnClick) {
        directives.push({
          name: 'click-outside',
          value: {
            handler: () => { props.isActive = false },
            closeConditional: closeConditional,
            include: () => [context.el, ...props.getOpenDependentElements()],
          },
        })
      }

      return directives
    }
  function genContent (): VNode {
      const options = {
        attrs: {
          ...props.getScopeIdAttrs(),
          role: 'role' in context.attrs ? context.attrs.role : 'menu',
        },
        staticClass: 'v-menu__content',
        class: {
          ...props.rootThemeClasses,
          ...props.roundedClasses,
          'v-menu__content--auto': props.auto,
          'v-menu__content--fixed': props.activatorFixed,
          menuable__content__active: props.isActive,
          [props.contentClass.trim()]: true,
        },
        style: styles.value,
        directives: genDirectives(),
        ref: 'content',
        on: {
          click: (e: Event) => {
            const target = e.target as HTMLElement

            if (target.getAttribute('disabled')) return
            if (props.closeOnContentClick) props.isActive = false
          },
          keydown: onKeyDown,
        },
      } as VNodeData

      if (context.listeners.scroll) {
        options.on = options.on || {}
        options.on.scroll = context.listeners.scroll
      }

      if (!props.disabled && props.openOnHover) {
        options.on = options.on || {}
        options.on.mouseenter = mouseEnterHandler
      }

      if (props.openOnHover) {
        options.on = options.on || {}
        options.on.mouseleave = mouseLeaveHandler
      }

      return context.createElement('div', options, props.getContentSlot())
    }
  function getTiles () {
      if (!context.refs.content) return

      data.tiles = Array.from(context.refs.content.querySelectorAll('.v-list-item'))
    }
  function mouseEnterHandler () {
      props.runDelay('open', () => {
        if (data.hasJustFocused) return

        data.hasJustFocused = true
        props.isActive = true
      })
    }
  function mouseLeaveHandler (e: MouseEvent) {
      // Prevent accidental re-activation
      props.runDelay('close', () => {
        if (context.refs.content.contains(e.relatedTarget as HTMLElement)) return

        requestAnimationFrame(() => {
          props.isActive = false
          props.callDeactivate()
        })
      })
    }
  function nextTile () {
      const tile = data.tiles[data.listIndex + 1]

      if (!tile) {
        if (!data.tiles.length) return

        data.listIndex = -1
        nextTile()

        return
      }

      data.listIndex++
      if (tile.tabIndex === -1) nextTile()
    }
  function prevTile () {
      const tile = data.tiles[data.listIndex - 1]

      if (!tile) {
        if (!data.tiles.length) return

        data.listIndex = data.tiles.length
        prevTile()

        return
      }

      data.listIndex--
      if (tile.tabIndex === -1) prevTile()
    }
  function onKeyDown (e: KeyboardEvent) {
      if (e.keyCode === keyCodes.esc) {
        // Wait for dependent elements to close first
        setTimeout(() => { props.isActive = false })
        const activator = props.getActivator()
        context.nextTick(() => activator && activator.focus())
      } else if (
        !props.isActive &&
        [keyCodes.up, keyCodes.down].includes(e.keyCode)
      ) {
        props.isActive = true
      }

      // Allow for isActive watcher to generate tile list
      context.nextTick(() => changeListIndex(e))
    }
  function onResize () {
      if (!props.isActive) return

      // Account for screen resize
      // and orientation change
      // eslint-disable-next-line no-unused-expressions
      context.refs.content.offsetWidth
      props.updateDimensions()

      // When resizing to a smaller width
      // content width is evaluated before
      // the new activator width has been
      // set, causing it to not size properly
      // hacky but will revisit in the future
      clearTimeout(data.resizeTimeout)
      data.resizeTimeout = window.setTimeout(props.updateDimensions, 100)
    }

  return {
    activeTile,
    calculatedLeft,
    calculatedMaxHeight,
    calculatedMaxWidth,
    calculatedMinWidth,
    calculatedTop,
    hasClickableTiles,
    styles,
    activate,
    calcScrollPosition,
    calcLeftAuto,
    calcTopAuto,
    changeListIndex,
    closeConditional,
    genActivatorAttributes,
    genActivatorListeners,
    genTransition,
    genDirectives,
    genContent,
    getTiles,
    mouseEnterHandler,
    mouseLeaveHandler,
    nextTile,
    prevTile,
    onKeyDown,
    onResize,
  }
}
const VMenu = defineComponent({
  name: 'v-menu',
  props: VMenuProps,
  setup(props, context) {
    const {} = useVMenu(props, context)
    const data = {
      staticClass: 'v-menu',
      class: {
        'v-menu--attached':
          props.attach === '' ||
          props.attach === true ||
          props.attach === 'attach',
      },
      directives: [{
        arg: '500',
        name: 'resize',
        value: onResize,
      }],
    }

    return h('div', data, [
      !props.activator && props.genActivator(),
      props.showLazyContent(() => [
        context.createElement(VThemeProvider, {
          props: {
            root: true,
            light: props.light,
            dark: props.dark,
          },
        }, [genTransition()]),
      ]),
    ])
  },
})

export default VMenu

