import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VCarousel.sass'

// Extensions
import VWindow from '../VWindow/VWindow'

// Components
import VBtn from '../VBtn'
import VIcon from '../VIcon'
import VProgressLinear from '../VProgressLinear'

// Mixins
// TODO: Move this into core components v2.0
import ButtonGroup from '../../mixins/button-group'

// Utilities
import { convertToUnit } from '../../util/helpers'
import { breaking } from '../../util/console'

// Types
import { VNode, PropType } from 'vue'
export const VCarouselProps = {
    continuous: {
      type: Boolean,
      default: true,
    },
    cycle: Boolean,
    delimiterIcon: {
      type: String,
      default: '$delimiter',
    },
    height: {
      type: [Number, String],
      default: 500,
    },
    hideDelimiters: Boolean,
    hideDelimiterBackground: Boolean,
    interval: {
      type: [Number, String],
      default: 6000,
      validator: (value: string | number) => value > 0,
    },
    mandatory: {
      type: Boolean,
      default: true,
    },
    progress: Boolean,
    progressColor: String,
    showArrows: {
      type: Boolean,
      default: true,
    },
    verticalDelimiters: {
      type: String as PropType<'' | 'left' | 'right'>,
      default: undefined,
    },
}

export function useVCarousel(props: ExtractPropTypes<typeof VCarouselProps>, context: SetupContext) {


  const data = reactive({
      internalHeight: props.height,
      slideTimeout: undefined as number | undefined,
    }
)

    const classes: Ref<object> = computed(() => {
      return {
        ...VWindow.options.computed.classes.call(this),
        'v-carousel': true,
        'v-carousel--hide-delimiter-background': props.hideDelimiterBackground,
        'v-carousel--vertical-delimiters': isVertical.value,
      }
    })
    const isDark: Ref<boolean> = computed(() => {
      return props.dark || !props.light
    })
    const isVertical: Ref<boolean> = computed(() => {
      return props.verticalDelimiters != null
    })

    interval: 'restartTimeout',
    height (val, oldVal) {
      if (val === oldVal || !val) return
      data.internalHeight = val
    },
    cycle (val) {
      if (val) {
        restartTimeout()
      } else {
        clearTimeout(data.slideTimeout)
        data.slideTimeout = undefined
      }
{
    cycle (val) {
      if (val) {
        restartTimeout()
      } else {
        clearTimeout(data.slideTimeout)
        data.slideTimeout = undefined
      }
})

    /* istanbul ignore next */
    if (context.attrs.hasOwnProperty('hide-controls')) {
      breaking('hide-controls', ':show-arrows="false"', this)
    }

  onMounted(() => {
    startTimeout()
  })

  function genControlIcons () {
      if (isVertical.value) return null

      return VWindow.options.methods.genControlIcons.call(this)
    }
  function genDelimiters (): VNode {
      return context.createElement('div', {
        staticClass: 'v-carousel__controls',
        style: {
          left: props.verticalDelimiters === 'left' && isVertical.value ? 0 : 'auto',
          right: props.verticalDelimiters === 'right' ? 0 : 'auto',
        },
      }, [genItems()])
    }
  function genItems (): VNode {
      const length = props.items.length
      const children = []

      for (let i = 0; i < length; i++) {
        const child = context.createElement(VBtn, {
          staticClass: 'v-carousel__controls__item',
          attrs: {
            'aria-label': context.vuetify.lang.t('$vuetify.carousel.ariaLabel.delimiter', i + 1, length),
          },
          props: {
            icon: true,
            small: true,
            value: props.getValue(props.items[i], i),
          },
        }, [
          context.createElement(VIcon, {
            props: { size: 18 },
          }, props.delimiterIcon),
        ])

        children.push(child)
      }

      return context.createElement(ButtonGroup, {
        props: {
          value: props.internalValue,
          mandatory: props.mandatory,
        },
        on: {
          change: (val: any) => {
            props.internalValue = val
          },
        },
      }, children)
    }
  function genProgress () {
      return context.createElement(VProgressLinear, {
        staticClass: 'v-carousel__progress',
        props: {
          color: props.progressColor,
          value: (props.internalIndex + 1) / props.items.length * 100,
        },
      })
    }
  function restartTimeout () {
      data.slideTimeout && clearTimeout(data.slideTimeout)
      data.slideTimeout = undefined

      window.requestAnimationFrame(startTimeout)
    }
  function startTimeout () {
      if (!props.cycle) return

      data.slideTimeout = window.setTimeout(props.next, +props.interval > 0 ? +props.interval : 6000)
    }

  return {
    classes,
    isDark,
    isVertical,
    genControlIcons,
    genDelimiters,
    genItems,
    genProgress,
    restartTimeout,
    startTimeout,
  }
}
const VCarousel = defineComponent({
  name: 'v-carousel',
  props: VCarouselProps,
  setup(props, context) {
    const {} = useVCarousel(props, context)
    const render = VWindow.options.render.call(this, h)

    render.data!.style = `height: ${convertToUnit(props.height)};`

    /* istanbul ignore else */
    if (!props.hideDelimiters) {
      render.children!.push(genDelimiters())
    }

    /* istanbul ignore else */
    if (props.progress || props.progressColor) {
      render.children!.push(genProgress())
    }

    return render
  },
})

export default VCarousel

