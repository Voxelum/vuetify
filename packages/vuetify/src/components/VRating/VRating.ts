import { Ripple } from '@directives/ripple'
import { useVuetify } from '@framework'
import { computed, defineComponent, DirectiveArguments, ExtractPropTypes, h, reactive, Ref, SetupContext, VNode, VNodeArrayChildren, watch, withDirectives } from 'vue'
import useColorable, { colorableProps } from '../../mixins/colorable'
import useDelayable, { delayableProps } from '../../mixins/delayable'
import { rippleableProps } from '../../mixins/rippleable'
import { sizeableProps } from '../../mixins/sizeable'
import { themeableProps } from '../../mixins/themeable'
// Utilities
import { createRange } from '../../util/helpers'
// Components
import VIcon from '../VIcon'
// Styles
import './VRating.sass'

export const VRatingProps = {
  ...colorableProps,
  ...delayableProps,
  ...rippleableProps,
  ...sizeableProps,
  ...themeableProps,
  backgroundColor: {
    type: String,
    default: 'accent',
  },
  color: {
    type: String,
    default: 'primary',
  },
  clearable: Boolean,
  dense: Boolean,
  emptyIcon: {
    type: String,
    default: '$ratingEmpty',
  },
  fullIcon: {
    type: String,
    default: '$ratingFull',
  },
  halfIcon: {
    type: String,
    default: '$ratingHalf',
  },
  halfIncrements: Boolean,
  hover: Boolean,
  length: {
    type: [Number, String],
    default: 5,
  },
  readonly: Boolean,
  size: [Number, String],
  value: {
    type: Number,
    default: 0,
  },
}

type ItemSlotProps = {
  index: number
  value: number
  isFilled: boolean
  isHalfFilled?: boolean | undefined
  isHovered: boolean
  isHalfHovered?: boolean | undefined
  onClick: Function
}

/* @vue/component */
// Colorable,
// Delayable,
// Rippleable,
// Sizeable,
// Themeable
export function useVRating(props: ExtractPropTypes<typeof VRatingProps>, context: SetupContext) {
  const { runDelay } = useDelayable(props)
  const { setTextColor } = useColorable(context)
  const vuetify = useVuetify()
  const data = reactive({
    hoverIndex: -1,
    internalValue: props.value,
  })

  const directives: Ref<DirectiveArguments> = computed(() => {
    if (props.readonly || !props.ripple) return []

    return [[Ripple, { circle: true }]]
    // return [{
    //   name: 'ripple',
    //   value: { circle: true },
    // } as VNodeDirective]
  })
  const iconProps: Ref<object> = computed(() => {
    const {
      dark,
      large,
      light,
      medium,
      small,
      size,
      xLarge,
      xSmall,
    } = context.attrs

    return {
      dark,
      large,
      light,
      medium,
      size,
      small,
      xLarge,
      xSmall,
    }
  })
  const isHovering: Ref<boolean> = computed(() => {
    return (props.hover ?? false) && data.hoverIndex >= 0
  })

  watch(() => data.internalValue, (val) => {
    val !== props.value && context.emit('input', val)
  })
  watch(() => props.value, (val) => {
    data.internalValue = val
  })

  function createClickFn(i: number): Function {
    return (e: MouseEvent) => {
      if (props.readonly) return

      const newValue = genHoverIndex(e, i)
      if (props.clearable && data.internalValue === newValue) {
        data.internalValue = 0
      } else {
        data.internalValue = newValue
      }
    }
  }
  function createProps(i: number): ItemSlotProps {
    const _props: ItemSlotProps = {
      index: i,
      value: data.internalValue,
      onClick: createClickFn(i),
      isFilled: Math.floor(data.internalValue) > i,
      isHovered: Math.floor(data.hoverIndex) > i,
    }

    if (props.halfIncrements) {
      _props.isHalfHovered = !_props.isHovered && (data.hoverIndex - i) % 1 > 0
      _props.isHalfFilled = !_props.isFilled && (data.internalValue - i) % 1 > 0
    }

    return _props
  }
  function genHoverIndex(e: MouseEvent, i: number) {
    let isHalf = isHalfEvent(e)

    if (
      props.halfIncrements &&
      vuetify.rtl
    ) {
      isHalf = !isHalf
    }

    return i + (isHalf ? 0.5 : 1)
  }
  function getIconName(_props: ItemSlotProps): string {
    const isFull = isHovering.value ? _props.isHovered : _props.isFilled
    const isHalf = isHovering.value ? _props.isHalfHovered : _props.isHalfFilled

    return isFull ? props.fullIcon : isHalf ? props.halfIcon : props.emptyIcon
  }
  function getColor(_props: ItemSlotProps): string {
    if (isHovering.value) {
      if (_props.isHovered || _props.isHalfHovered) return props.color
    } else {
      if (_props.isFilled || _props.isHalfFilled) return props.color
    }

    return props.backgroundColor
  }
  function isHalfEvent(e: MouseEvent): boolean {
    if (props.halfIncrements) {
      const rect = e.target && (e.target as HTMLElement).getBoundingClientRect()
      if (rect && (e.pageX - rect.left) < rect.width / 2) return true
    }

    return false
  }
  function onMouseEnter(e: MouseEvent, i: number): void {
    runDelay('open', () => {
      data.hoverIndex = genHoverIndex(e, i)
    })
  }
  function onMouseLeave(): void {
    runDelay('close', () => (data.hoverIndex = -1))
  }
  function genItem(i: number): VNode | VNodeArrayChildren | string {
    const _props = createProps(i)

    if (context.slots.item) return context.slots.item(props)

    const listeners: Record<string, Function> = {
      onClick: _props.onClick,
    }

    if (props.hover) {
      listeners.onMouseenter = (e: MouseEvent) => onMouseEnter(e, i)
      listeners.onMouseleave = onMouseLeave

      if (props.halfIncrements) {
        listeners.onMousemove = (e: MouseEvent) => onMouseEnter(e, i)
      }
    }

    return withDirectives(h(VIcon, setTextColor(getColor(_props), {
      tabindex: -1, // TODO: Add a11y support
      ...iconProps.value,
      ...listeners,
    }), [getIconName(_props)]), directives.value)
  }

  return {
    directives,
    iconProps,
    isHovering,
    createClickFn,
    createProps,
    genHoverIndex,
    getIconName,
    getColor,
    isHalfEvent,
    onMouseEnter,
    onMouseLeave,
    genItem,
  }
}

const VRating = defineComponent({
  name: 'v-rating',
  props: VRatingProps,
  setup(props, context) {
    const { genItem } = useVRating(props, context)
    return () => {
      const children = createRange(Number(props.length)).map(i => genItem(i))

      return h('div', {
        staticClass: 'v-rating',
        class: {
          'v-rating--readonly': props.readonly,
          'v-rating--dense': props.dense,
        },
      }, children)
    }
  },
})

export default VRating

