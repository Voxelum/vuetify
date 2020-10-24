import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VColorPickerPreview.sass'

// Components
import VSlider from '../VSlider/VSlider'

// Utilities
import { RGBtoCSS, RGBAtoCSS } from '../../util/colorUtils'

// Types
import Vue, { VNode, VNodeData, PropType } from 'vue'
import { VColorPickerColor, fromHSVA } from './util'
export const VColorPickerPreviewProps = {
    color: Object as PropType<VColorPickerColor>,
    disabled: Boolean,
    hideAlpha: Boolean,
}

export default export function useVColorPickerPreview(props: ExtractPropTypes<typeof VColorPickerPreviewProps>, context: SetupContext) {


  function genAlpha (): VNode {
      return genTrack({
        staticClass: 'v-color-picker__alpha',
        props: {
          thumbColor: 'grey lighten-2',
          hideDetails: true,
          value: props.color.alpha,
          step: 0,
          min: 0,
          max: 1,
        },
        style: {
          backgroundImage: props.disabled
            ? undefined
            : `linear-gradient(to ${context.vuetify.rtl ? 'left' : 'right'}, transparent, ${RGBtoCSS(props.color.rgba)})`,
        },
        on: {
          input: (val: number) => props.color.alpha !== val && context.emit('update:color', fromHSVA({ ...props.color.hsva, a: val })),
        },
      })
    }
  function genSliders (): VNode {
      return context.createElement('div', {
        staticClass: 'v-color-picker__sliders',
      }, [
        genHue(),
        !props.hideAlpha && genAlpha(),
      ])
    }
  function genDot (): VNode {
      return context.createElement('div', {
        staticClass: 'v-color-picker__dot',
      }, [
        context.createElement('div', {
          style: {
            background: RGBAtoCSS(props.color.rgba),
          },
        }),
      ])
    }
  function genHue (): VNode {
      return genTrack({
        staticClass: 'v-color-picker__hue',
        props: {
          thumbColor: 'grey lighten-2',
          hideDetails: true,
          value: props.color.hue,
          step: 0,
          min: 0,
          max: 360,
        },
        on: {
          input: (val: number) => props.color.hue !== val && context.emit('update:color', fromHSVA({ ...props.color.hsva, h: val })),
        },
      })
    }
  function genTrack (options: VNodeData): VNode {
      return context.createElement(VSlider, {
        class: 'v-color-picker__track',
        ...options,
        props: {
          disabled: props.disabled,
          ...options.props,
        },
      })
    }

  return {
    genAlpha,
    genSliders,
    genDot,
    genHue,
    genTrack,
  }
}
const VColorPickerPreview = defineComponent({
  name: 'v-color-picker-preview',
  props: VColorPickerPreviewProps,
  setup(props, context) {
    const {} = useVColorPickerPreview(props, context)
    return h('div', {
      staticClass: 'v-color-picker__preview',
      class: {
        'v-color-picker__preview--hide-alpha': props.hideAlpha,
      },
    }, [
      genDot(),
      genSliders(),
    ])
  },
})

export default VColorPickerPreview

