import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VTabs.sass'

// Components
import VTabsBar from './VTabsBar'
import VTabsItems from './VTabsItems'
import VTabsSlider from './VTabsSlider'

// Mixins
import Colorable from '../../mixins/colorable'
import Proxyable from '../../mixins/proxyable'
import Themeable from '../../mixins/themeable'

// Directives
import Resize from '../../directives/resize'

// Utilities
import { convertToUnit } from '../../util/helpers'
import { ExtractVue } from './../../util/mixins'
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue/types'
export const VTabsProps = {
    activeClass: {
      type: String,
      default: '',
    },
    alignWithTitle: Boolean,
    backgroundColor: String,
    centerActive: Boolean,
    centered: Boolean,
    fixedTabs: Boolean,
    grow: Boolean,
    height: {
      type: [Number, String],
      default: undefined,
    },
    hideSlider: Boolean,
    iconsAndText: Boolean,
    mobileBreakpoint: [String, Number],
    nextIcon: {
      type: String,
      default: '$next',
    },
    optional: Boolean,
    prevIcon: {
      type: String,
      default: '$prev',
    },
    right: Boolean,
    showArrows: [Boolean, String],
    sliderColor: String,
    sliderSize: {
      type: [Number, String],
      default: 2,
    },
    vertical: Boolean,
}

const baseMixins = mixins(
  Colorable,
  Proxyable,
  Themeable
)

interface options extends ExtractVue<typeof baseMixins> {
  $refs: {
    items: InstanceType<typeof VTabsBar>
  }
}

export function useVTabs(props: ExtractPropTypes<typeof VTabsProps>, context: SetupContext) {



  const data = reactive({
      resizeTimeout: 0,
      slider: {
        height: null as null | number,
        left: null as null | number,
        right: null as null | number,
        top: null as null | number,
        width: null as null | number,
      },
      transitionTime: 300,
    }
)

    const classes: Ref<object> = computed(() => {
      return {
        'v-tabs--align-with-title': props.alignWithTitle,
        'v-tabs--centered': props.centered,
        'v-tabs--fixed-tabs': props.fixedTabs,
        'v-tabs--grow': props.grow,
        'v-tabs--icons-and-text': props.iconsAndText,
        'v-tabs--right': data.right,
        'v-tabs--vertical': props.vertical,
        ...props.themeClasses,
      }
    })
    const isReversed: Ref<boolean> = computed(() => {
      return context.vuetify.rtl && props.vertical
    })
    const sliderStyles: Ref<object> = computed(() => {
      return {
        height: convertToUnit(data.slider.height),
        left: isReversed.value ? undefined : convertToUnit(data.slider.left),
        right: isReversed.value ? convertToUnit(data.slider.right) : undefined,
        top: props.vertical ? convertToUnit(data.slider.top) : undefined,
        transition: data.slider.left != null ? null : 'none',
        width: convertToUnit(data.slider.width),
      }
    })
    const computedColor: Ref<string> = computed(() => {
      if (props.color) return props.color
      else if (props.isDark && !props.appIsDark) return 'white'
      else return 'primary'
    })

watch(() => props.alignWithTitle, undefined => {
{

  onMounted(() => {
    context.nextTick(() => {
      window.setTimeout(callSlider, 30)
    })
  })

  function callSlider () {
      if (
        props.hideSlider ||
        !context.refs.items ||
        !context.refs.items.selectedItems.length
      ) {
        data.slider.width = 0
        return false
      }

      context.nextTick(() => {
        // Give screen time to paint
        const activeTab = context.refs.items.selectedItems[0]
        /* istanbul ignore if */
        if (!activeTab || !activeTab.$el) {
          data.slider.width = 0
          data.slider.left = 0
          return
        }
        const el = activeTab.$el as HTMLElement

        data.slider = {
          height: !props.vertical ? Number(props.sliderSize) : el.scrollHeight,
          left: props.vertical ? 0 : el.offsetLeft,
          right: props.vertical ? 0 : el.offsetLeft + el.offsetWidth,
          top: el.offsetTop,
          width: props.vertical ? Number(props.sliderSize) : el.scrollWidth,
        }
      })

      return true
    }
  function genBar (items: VNode[], slider: VNode | null) {
      const data = {
        style: {
          height: convertToUnit(data.height),
        },
        props: {
          activeClass: props.activeClass,
          centerActive: props.centerActive,
          dark: props.dark,
          light: props.light,
          mandatory: !props.optional,
          mobileBreakpoint: props.mobileBreakpoint,
          nextIcon: props.nextIcon,
          prevIcon: props.prevIcon,
          showArrows: props.showArrows,
          value: props.internalValue,
        },
        on: {
          'call:slider': callSlider,
          change: (val: any) => {
            props.internalValue = val
          },
        },
        ref: 'items',
      }

      props.setTextColor(computedColor.value, data)
      props.setBackgroundColor(props.backgroundColor, data)

      return context.createElement(VTabsBar, data, [
        genSlider(slider),
        items,
      ])
    }
  function genItems (items: VNode | null, item: VNode[]) {
      // If user provides items
      // opt to use theirs
      if (items) return items

      // If no tabs are provided
      // render nothing
      if (!item.length) return null

      return context.createElement(VTabsItems, {
        props: {
          value: props.internalValue,
        },
        on: {
          change: (val: any) => {
            props.internalValue = val
          },
        },
      }, item)
    }
  function genSlider (slider: VNode | null) {
      if (props.hideSlider) return null

      if (!slider) {
        slider = context.createElement(VTabsSlider, {
          props: { color: props.sliderColor },
        })
      }

      return context.createElement('div', {
        staticClass: 'v-tabs-slider-wrapper',
        style: sliderStyles.value,
      }, [slider])
    }
  function onResize () {
      if (props._isDestroyed) return

      clearTimeout(data.resizeTimeout)
      data.resizeTimeout = window.setTimeout(callSlider, 0)
    }
  function parseNodes () {
      let items = null
      let slider = null
      const item = []
      const tab = []
      const slot = context.slots.default || []
      const length = slot.length

      for (let i = 0; i < length; i++) {
        const vnode = slot[i]

        if (vnode.componentOptions) {
          switch (vnode.componentOptions.Ctor.options.name) {
            case 'v-tabs-slider': slider = vnode
              break
            case 'v-tabs-items': items = vnode
              break
            case 'v-tab-item': item.push(vnode)
              break
            // case 'v-tab' - intentionally omitted
            default: tab.push(vnode)
          }
        } else {
          tab.push(vnode)
        }
      }

      /**
       * tab: array of `v-tab`
       * slider: single `v-tabs-slider`
       * items: single `v-tabs-items`
       * item: array of `v-tab-item`
       */
      return { tab, slider, items, item }
    }

  return {
    classes,
    isReversed,
    sliderStyles,
    computedColor,
    callSlider,
    genBar,
    genItems,
    genSlider,
    onResize,
    parseNodes,
  }
}
const VTabs = defineComponent({
  name: 'v-tabs',
  props: VTabsProps,
  setup(props, context) {
    const {} = useVTabs(props, context)
    const { tab, slider, items, item } = parseNodes()

    return h('div', {
      staticClass: 'v-tabs',
      class: classes.value,
      directives: [{
        name: 'resize',
        modifiers: { quiet: true },
        value: onResize,
      }],
    }, [
      genBar(tab, slider),
      genItems(items, item),
    ])
  },
})

export default VTabs

