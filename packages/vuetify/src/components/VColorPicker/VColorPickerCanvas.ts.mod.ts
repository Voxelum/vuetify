import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VColorPickerCanvas.sass'

// Helpers
import { clamp, convertToUnit } from '../../util/helpers'
import { fromHSVA, VColorPickerColor, fromRGBA } from './util'

// Types
import Vue, { VNode, PropType } from 'vue'
export const VColorPickerCanvasProps = {
    color: {
      type: Object as PropType<VColorPickerColor>,
      default: () => fromRGBA({ r: 255, g: 0, b: 0, a: 1 }),
    },
    disabled: Boolean,
    dotSize: {
      type: [Number, String],
      default: 10,
    },
    height: {
      type: [Number, String],
      default: 150,
    },
    width: {
      type: [Number, String],
      default: 300,
    },
}

export default export function useVColorPickerCanvas(props: ExtractPropTypes<typeof VColorPickerCanvasProps>, context: SetupContext) {


  const data = reactive({
      boundingRect: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      } as ClientRect,
    }
)

    const dot: Ref<{ x: number, y: number}> = computed(() => {
      if (!props.color) return { x: 0, y: 0 }

      return {
        x: props.color.hsva.s * parseInt(data.width, 10),
        y: (1 - props.color.hsva.v) * parseInt(data.height, 10),
      }
    })

{

  onMounted(() => {
    updateCanvas()
  })

  function emitColor (x: number, y: number) {
      const { left, top, width, height } = data.boundingRect

      context.emit('update:color', fromHSVA({
        h: props.color.hue,
        s: clamp(x - left, 0, width) / width,
        v: 1 - clamp(y - top, 0, height) / height,
        a: props.color.alpha,
      }))
    }
  function updateCanvas () {
      if (!props.color) return

      const canvas = context.refs.canvas as HTMLCanvasElement
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      const saturationGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      saturationGradient.addColorStop(0, 'hsla(0, 0%, 100%, 1)') // white
      saturationGradient.addColorStop(1, `hsla(${props.color.hue}, 100%, 50%, 1)`)
      ctx.fillStyle = saturationGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const valueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      valueGradient.addColorStop(0, 'hsla(0, 0%, 100%, 0)') // transparent
      valueGradient.addColorStop(1, 'hsla(0, 0%, 0%, 1)') // black
      ctx.fillStyle = valueGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  function handleClick (e: MouseEvent) {
      if (props.disabled) return

      data.boundingRect = context.el.getBoundingClientRect()
      emitColor(e.clientX, e.clientY)
    }
  function handleMouseDown (e: MouseEvent) {
      // To prevent selection while moving cursor
      e.preventDefault()

      if (props.disabled) return

      data.boundingRect = context.el.getBoundingClientRect()

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
  function handleMouseMove (e: MouseEvent) {
      if (props.disabled) return

      emitColor(e.clientX, e.clientY)
    }
  function handleMouseUp () {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  function genCanvas (): VNode {
      return context.createElement('canvas', {
        ref: 'canvas',
        attrs: {
          width: data.width,
          height: data.height,
        },
      })
    }
  function genDot (): VNode {
      const radius = parseInt(props.dotSize, 10) / 2
      const x = convertToUnit(dot.value.x - radius)
      const y = convertToUnit(dot.value.y - radius)

      return context.createElement('div', {
        staticClass: 'v-color-picker__canvas-dot',
        class: {
          'v-color-picker__canvas-dot--disabled': props.disabled,
        },
        style: {
          width: convertToUnit(props.dotSize),
          height: convertToUnit(props.dotSize),
          transform: `translate(${x}, ${y})`,
        },
      })
    }

  return {
    dot,
    emitColor,
    updateCanvas,
    handleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    genCanvas,
    genDot,
  }
}
const VColorPickerCanvas = defineComponent({
  name: 'v-color-picker-canvas',
  props: VColorPickerCanvasProps,
  setup(props, context) {
    const {} = useVColorPickerCanvas(props, context)
    return h('div', {
      staticClass: 'v-color-picker__canvas',
      style: {
        width: convertToUnit(data.width),
        height: convertToUnit(data.height),
      },
      on: {
        click: handleClick,
        mousedown: handleMouseDown,
      },
    }, [
      genCanvas(),
      genDot(),
    ])
  },
})

export default VColorPickerCanvas

