import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VColorPickerSwatches.sass'

// Components
import VIcon from '../VIcon'

// Helpers
import colors from '../../util/colors'
import { VColorPickerColor, fromHex, parseColor } from './util'
import { convertToUnit, deepEqual } from '../../util/helpers'
import mixins from '../../util/mixins'
import Themeable from '../../mixins/themeable'

// Types
import { VNode, PropType } from 'vue'
import { contrastRatio } from '../../util/colorUtils'
export const VColorPickerSwatchesProps = {
    swatches: {
      type: Array as PropType<string[][]>,
      default: () => parseDefaultColors(colors),
    },
    color: Object as PropType<VColorPickerColor>,
    maxWidth: [Number, String],
    maxHeight: [Number, String],
}

function parseDefaultColors (colors: Record<string, Record<string, string>>) {
  return Object.keys(colors).map(key => {
    const color = colors[key]
    return color.base ? [
      color.base,
      color.darken4,
      color.darken3,
      color.darken2,
      color.darken1,
      color.lighten1,
      color.lighten2,
      color.lighten3,
      color.lighten4,
      color.lighten5,
    ] : [
      color.black,
      color.white,
      color.transparent,
    ]
  })
}

const white = fromHex('#FFFFFF').rgba
const black = fromHex('#000000').rgba

export function useVColorPickerSwatches(props: ExtractPropTypes<typeof VColorPickerSwatchesProps>, context: SetupContext) {


  function genColor (color: string) {
      const content = context.createElement('div', {
        style: {
          background: color,
        },
      }, [
        deepEqual(props.color, parseColor(color, null)) && context.createElement(VIcon, {
          props: {
            small: true,
            dark: contrastRatio(props.color.rgba, white) > 2 && props.color.alpha > 0.5,
            light: contrastRatio(props.color.rgba, black) > 2 && props.color.alpha > 0.5,
          },
        }, '$success'),
      ])

      return context.createElement('div', {
        staticClass: 'v-color-picker__color',
        on: {
          // TODO: Less hacky way of catching transparent
          click: () => context.emit('update:color', fromHex(color === 'transparent' ? '#00000000' : color)),
        },
      }, [content])
    }
  function genSwatches () {
      return props.swatches.map(swatch => {
        const colors = swatch.map(genColor)

        return context.createElement('div', {
          staticClass: 'v-color-picker__swatch',
        }, colors)
      })
    }

  return {
    genColor,
    genSwatches,
  }
}
const VColorPickerSwatches = defineComponent({
  name: 'v-color-picker-swatches',
  props: VColorPickerSwatchesProps,
  setup(props, context) {
    const {} = useVColorPickerSwatches(props, context)
    return h('div', {
      staticClass: 'v-color-picker__swatches',
      style: {
        maxWidth: convertToUnit(props.maxWidth),
        maxHeight: convertToUnit(props.maxHeight),
      },
    }, [
      context.createElement('div', genSwatches()),
    ])
  },
})

export default VColorPickerSwatches

