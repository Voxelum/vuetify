import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Mixins
import Colorable from '../../mixins/colorable'

// Utilities
import mixins, { ExtractVue } from '../../util/mixins'
import { genPoints, genBars } from './helpers/core'
import { genPath } from './helpers/path'

// Types
import Vue, { VNode } from 'vue'
import { Prop, PropValidator } from 'vue/types/options'
export const VSparklineProps = {
}

export type SparklineItem = number | { value: number }

export type SparklineText = {
  x: number
  value: string
}

export interface Boundary {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface Point {
  x: number
  y: number
  value: number
}

export interface Bar {
  x: number
  y: number
  height: number
  value: number
}

interface options extends Vue {
  $refs: {
    path: SVGPathElement
  }
}

/* eslint-disable indent */
  ExtractVue<[
    typeof Colorable
  ]>
/* eslint-enable indent */
>(
  Colorable
export function useVSparkline(props: ExtractPropTypes<typeof VSparklineProps>, context: SetupContext) {


  const data = reactive({
    lastLength: 0,
  })

    const parsedPadding: Ref<number> = computed(() => {
      return Number(props.padding)
    })
    const parsedWidth: Ref<number> = computed(() => {
      return Number(props.width)
    })
    const parsedHeight: Ref<number> = computed(() => {
      return parseInt(props.height, 10)
    })
    const parsedLabelSize: Ref<number> = computed(() => {
      return parseInt(props.labelSize, 10) || 7
    })
    const totalHeight: Ref<number> = computed(() => {
      let height = parsedHeight.value

      if (hasLabels.value) height += parseInt(props.labelSize, 10) * 1.5

      return height
    })
    const totalWidth: Ref<number> = computed(() => {
      let width = parsedWidth.value
      if (props.type === 'bar') width = Math.max(props.value.length * _lineWidth.value, width)

      return width
    })
    const totalValues: Ref<number> = computed(() => {
      return props.value.length
    })
    const _lineWidth: Ref<number> = computed(() => {
      if (props.autoLineWidth && props.type !== 'trend') {
        const totalPadding = parsedPadding.value * (totalValues.value + 1)
        return (parsedWidth.value - totalPadding) / totalValues.value
      } else {
        return parseFloat(props.lineWidth) || 4
      }
    })
    const boundary: Ref<Boundary> = computed(() => {
      if (props.type === 'bar') return { minX: 0, maxX: totalWidth.value, minY: 0, maxY: parsedHeight.value }

      const padding = parsedPadding.value

      return {
        minX: padding,
        maxX: totalWidth.value - padding,
        minY: padding,
        maxY: parsedHeight.value - padding,
      }
    })
    const hasLabels: Ref<boolean> = computed(() => {
      return Boolean(
        props.showLabels ||
        props.labels.length > 0 ||
        context.scopedSlots.label
      )
    })
    const parsedLabels: Ref<SparklineText[]> = computed(() => {
      const labels = []
      const points = _values.value
      const len = points.length

      for (let i = 0; labels.length < len; i++) {
        const item = points[i]
        let value = props.labels[i]

        if (!value) {
          value = typeof item === 'object'
            ? item.value
            : item
        }

        labels.push({
          x: item.x,
          value: String(value),
        })
      }

      return labels
    })
    const normalizedValues: Ref<number[]> = computed(() => {
      return props.value.map(item => (typeof item === 'number' ? item : item.value))
    })
    const _values: Ref<Point[] | Bar[]> = computed(() => {
      return props.type === 'trend' ? genPoints(normalizedValues.value, boundary.value) : genBars(normalizedValues.value, boundary.value)
    })
    const textY: Ref<number> = computed(() => {
      let y = parsedHeight.value
      if (props.type === 'trend') y -= 4
      return y
    })
    const _radius: Ref<number> = computed(() => {
      return props.smooth === true ? 8 : Number(props.smooth)
    })

        context.nextTick(() => {
          if (
{
})

  function genGradient () {
      const gradientDirection = props.gradientDirection
      const gradient = props.gradient.slice()

      // Pushes empty string to force
      // a fallback to currentColor
      if (!gradient.length) gradient.push('')

      const len = Math.max(gradient.length - 1, 1)
      const stops = gradient.reverse().map((color, index) =>
        context.createElement('stop', {
          attrs: {
            offset: index / len,
            'stop-color': color || 'currentColor',
          },
        })
      )

      return context.createElement('defs', [
        context.createElement('linearGradient', {
          attrs: {
            id: props._uid,
            x1: +(gradientDirection === 'left'),
            y1: +(gradientDirection === 'top'),
            x2: +(gradientDirection === 'right'),
            y2: +(gradientDirection === 'bottom'),
          },
        }, stops),
      ])
    }
  function genG (children: VNode[]) {
      return context.createElement('g', {
        style: {
          fontSize: '8',
          textAnchor: 'middle',
          dominantBaseline: 'mathematical',
          fill: 'currentColor',
        } as object, // TODO: TS 3.5 is too eager with the array type here
      }, children)
    }
  function genPath () {
      const points = genPoints(normalizedValues.value, boundary.value)

      return context.createElement('path', {
        attrs: {
          d: genPath(points, _radius.value, props.fill, parsedHeight.value),
          fill: props.fill ? `url(#${props._uid})` : 'none',
          stroke: props.fill ? 'none' : `url(#${props._uid})`,
        },
        ref: 'path',
      })
    }
  function genLabels (offsetX: number) {
      const children = parsedLabels.value.map((item, i) => (
        context.createElement('text', {
          attrs: {
            x: item.x + offsetX + _lineWidth.value / 2,
            y: textY.value + (parsedLabelSize.value * 0.75),
            'font-size': Number(props.labelSize) || 7,
          },
        }, [genLabel(item, i)])
      ))

      return genG(children)
    }
  function genLabel (item: SparklineText, index: number) {
      return context.scopedSlots.label
        ? context.scopedSlots.label({ index, value: item.value })
        : item.value
    }
  function genBars () {
      if (!props.value || totalValues.value < 2) return undefined as never

      const bars = genBars(normalizedValues.value, boundary.value)
      const offsetX = (Math.abs(bars[0].x - bars[1].x) - _lineWidth.value) / 2

      return context.createElement('svg', {
        attrs: {
          display: 'block',
          viewBox: `0 0 ${totalWidth.value} ${totalHeight.value}`,
        },
      }, [
        genGradient(),
        genClipPath(bars, offsetX, _lineWidth.value, 'sparkline-bar-' + props._uid),
        hasLabels.value ? genLabels(offsetX) : undefined as never,
        context.createElement('g', {
          attrs: {
            'clip-path': `url(#sparkline-bar-${props._uid}-clip)`,
            fill: `url(#${props._uid})`,
          },
        }, [
          context.createElement('rect', {
            attrs: {
              x: 0,
              y: 0,
              width: totalWidth.value,
              height: props.height,
            },
          }),
        ]),
      ])
    }
  function genClipPath (bars: Bar[], offsetX: number, lineWidth: number, id: string) {
      const rounding = typeof props.smooth === 'number'
        ? props.smooth
        : props.smooth ? 2 : 0

      return context.createElement('clipPath', {
        attrs: {
          id: `${id}-clip`,
        },
      }, bars.map(item => {
        return context.createElement('rect', {
          attrs: {
            x: item.x + offsetX,
            y: item.y,
            width: lineWidth,
            height: item.height,
            rx: rounding,
            ry: rounding,
          },
        }, [
          props.autoDraw ? context.createElement('animate', {
            attrs: {
              attributeName: 'height',
              from: 0,
              to: item.height,
              dur: `${props.autoDrawDuration}ms`,
              fill: 'freeze',
            },
          }) : undefined as never,
        ])
      }))
    }
  function genTrend () {
      return context.createElement('svg', props.setTextColor(props.color, {
        attrs: {
          ...context.attrs,
          display: 'block',
          'stroke-width': _lineWidth.value || 1,
          viewBox: `0 0 ${props.width} ${totalHeight.value}`,
        },
      }), [
        genGradient(),
        hasLabels.value && genLabels(-(_lineWidth.value / 2)),
        genPath(),
      ])
    }

  return {
    parsedPadding,
    parsedWidth,
    parsedHeight,
    parsedLabelSize,
    totalHeight,
    totalWidth,
    totalValues,
    _lineWidth,
    boundary,
    hasLabels,
    parsedLabels,
    normalizedValues,
    _values,
    textY,
    _radius,
    genGradient,
    genG,
    genPath,
    genLabels,
    genLabel,
    genBars,
    genClipPath,
    genTrend,
  }
}
const VSparkline = defineComponent({
  name: 'VSparkline',
  props: VSparklineProps,
  setup(props, context) {
    const {} = useVSparkline(props, context)
    if (totalValues.value < 2) return undefined as never

    return props.type === 'trend' ? genTrend() : genBars()
  },
})

export default VSparkline

