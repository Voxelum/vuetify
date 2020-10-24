import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VColorPicker.sass'

// Components
import VSheet from '../VSheet/VSheet'
import VColorPickerPreview from './VColorPickerPreview'
import VColorPickerCanvas from './VColorPickerCanvas'
import VColorPickerEdit, { Mode, modes } from './VColorPickerEdit'
import VColorPickerSwatches from './VColorPickerSwatches'

// Helpers
import { VColorPickerColor, parseColor, fromRGBA, extractColor, hasAlpha } from './util'
import mixins from '../../util/mixins'
import { deepEqual } from '../../util/helpers'

// Mixins
import Elevatable from '../../mixins/elevatable'
import Themeable from '../../mixins/themeable'

// Types
import { VNode, PropType } from 'vue'
export const VColorPickerProps = {
    canvasHeight: {
      type: [String, Number],
      default: 150,
    },
    disabled: Boolean,
    dotSize: {
      type: [Number, String],
      default: 10,
    },
    flat: Boolean,
    hideCanvas: Boolean,
    hideInputs: Boolean,
    hideModeSwitch: Boolean,
    mode: {
      type: String,
      default: 'rgba',
      validator: (v: string) => Object.keys(modes).includes(v),
    },
    showSwatches: Boolean,
    swatches: Array as PropType<string[][]>,
    swatchesMaxHeight: {
      type: [Number, String],
      default: 150,
    },
    value: {
      type: [Object, String],
    },
    width: {
      type: [Number, String],
      default: 300,
    },
}

export function useVColorPicker(props: ExtractPropTypes<typeof VColorPickerProps>, context: SetupContext) {


  const data = reactive({
    internalValue: fromRGBA({ r: 255, g: 0, b: 0, a: 1 }),
  })

    const hideAlpha: Ref<boolean> = computed(() => {
      if (!props.value) return false

      return !hasAlpha(props.value)
    })

watch(props, (color: any) => {
        updateColor(parseColor(color, data.internalValue))
      },
      immediate: true,
{
      immediate: true,
})

  function updateColor (color: VColorPickerColor) {
      data.internalValue = color
      const value = extractColor(data.internalValue, props.value)

      if (!deepEqual(value, props.value)) {
        context.emit('input', value)
        context.emit('update:color', data.internalValue)
      }
    }
  function genCanvas (): VNode {
      return context.createElement(VColorPickerCanvas, {
        props: {
          color: data.internalValue,
          disabled: props.disabled,
          dotSize: props.dotSize,
          width: props.width,
          height: props.canvasHeight,
        },
        on: {
          'update:color': updateColor,
        },
      })
    }
  function genControls (): VNode {
      return context.createElement('div', {
        staticClass: 'v-color-picker__controls',
      }, [
        genPreview(),
        !props.hideInputs && genEdit(),
      ])
    }
  function genEdit (): VNode {
      return context.createElement(VColorPickerEdit, {
        props: {
          color: data.internalValue,
          disabled: props.disabled,
          hideAlpha: hideAlpha.value,
          hideModeSwitch: props.hideModeSwitch,
          mode: props.mode,
        },
        on: {
          'update:color': updateColor,
          'update:mode': (v: Mode) => context.emit('update:mode', v),
        },
      })
    }
  function genPreview (): VNode {
      return context.createElement(VColorPickerPreview, {
        props: {
          color: data.internalValue,
          disabled: props.disabled,
          hideAlpha: hideAlpha.value,
        },
        on: {
          'update:color': updateColor,
        },
      })
    }
  function genSwatches (): VNode {
      return context.createElement(VColorPickerSwatches, {
        props: {
          dark: props.dark,
          light: props.light,
          swatches: props.swatches,
          color: data.internalValue,
          maxHeight: props.swatchesMaxHeight,
        },
        on: {
          'update:color': updateColor,
        },
      })
    }

  return {
    hideAlpha,
    updateColor,
    genCanvas,
    genControls,
    genEdit,
    genPreview,
    genSwatches,
  }
}
const VColorPicker = defineComponent({
  name: 'v-color-picker',
  props: VColorPickerProps,
  setup(props, context) {
    const {} = useVColorPicker(props, context)
    return h(VSheet, {
      staticClass: 'v-color-picker',
      class: {
        'v-color-picker--flat': props.flat,
        ...props.themeClasses,
        ...props.elevationClasses,
      },
      props: {
        maxWidth: props.width,
      },
    }, [
      !props.hideCanvas && genCanvas(),
      genControls(),
      props.showSwatches && genSwatches(),
    ])
  },
})

export default VColorPicker

