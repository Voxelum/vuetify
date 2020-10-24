import { useVSheet, VSheetProps } from '@components/VSheet/VSheet'
import { positionableProps } from '@mixins/positionable/index.ts'
import { Registrable, RegistrableKey } from '@mixins/registrable'
import useRoutable from '@mixins/routable/index.ts'
import { computed, defineComponent, ExtractPropTypes, h, PropType, reactive, Ref, SetupContext, VNode } from 'vue'
import { RippleOptions } from '../../directives/ripple'
// Mixins
import { groupableProps, useGroupableFactory } from '../../mixins/groupable'
import { routableDirectives, routableProps } from '../../mixins/routable'
import useSizeable, { sizeableProps } from '../../mixins/sizeable'
import { toggableProps, useToggleableFactory } from '../../mixins/toggleable'
import { breaking } from '../../util/console'
// Components
import VProgressCircular from '../VProgressCircular'
// Styles
import './VBtn.sass'

export const BtnToggleKey: RegistrableKey = 'btnToggle'

export const VBtnProps = {
  ...VSheetProps,
  ...routableProps,
  ...positionableProps(),
  ...sizeableProps,
  ...groupableProps(BtnToggleKey),
  ...toggableProps('inputValue'),
  activeClass: {
    type: String,
    default(): string | undefined {
      return ''
      // TODO: fix this
      // if (!this.btnToggle) return ''
      // return this.btnToggle.activeClass
    },
  } /* as any as PropValidator<string> */,
  block: Boolean,
  depressed: Boolean,
  fab: Boolean,
  icon: Boolean,
  loading: Boolean,
  outlined: Boolean,
  retainFocusOnClick: Boolean,
  rounded: Boolean,
  tag: {
    type: String,
    default: 'button',
  },
  text: Boolean,
  tile: Boolean,
  type: {
    type: String,
    default: 'button',
  },
  value: null as any as PropType<any>,
}

// interface options extends ExtractVue<typeof baseMixins> {
//   $el: HTMLElement
// }

const useGroupable = useGroupableFactory(BtnToggleKey)
const useToggleable = useToggleableFactory('inputValue')

export function useVBtn(props: ExtractPropTypes<typeof VBtnProps>, context: SetupContext) {
  const { measurableStyles, themeClasses, elevationClasses, setTextColor, setBackgroundColor } = useVSheet(props, context)
  const { classes: routableClasses, generateRouteLink } = useRoutable(props, context)
  const { sizeableClasses } = useSizeable(props)
  const { toggle, groupClasses, ...groupables } = useGroupable(props, context)
  const btnToggle = (groupables as any)[BtnToggleKey] as Registrable
  const { } = useToggleable(props, context)

  const data = reactive({
    proxyClass: 'v-btn--active',
  })

  const classes: Ref<any> = computed(() => {
    return {
      'v-btn': true,
      ...routableClasses.value,
      'v-btn--absolute': props.absolute ?? false,
      'v-btn--block': props.block,
      'v-btn--bottom': props.bottom ?? false,
      'v-btn--contained': contained.value,
      'v-btn--depressed': (props.depressed) || props.outlined,
      'v-btn--disabled': props.disabled,
      'v-btn--fab': props.fab,
      'v-btn--fixed': props.fixed ?? false,
      'v-btn--flat': isFlat.value,
      'v-btn--icon': props.icon,
      'v-btn--left': props.left ?? false,
      'v-btn--loading': props.loading,
      'v-btn--outlined': props.outlined,
      'v-btn--right': props.right ?? false,
      'v-btn--round': isRound.value,
      'v-btn--rounded': props.rounded,
      'v-btn--router': props.to ?? false,
      'v-btn--text': props.text,
      'v-btn--tile': props.tile,
      'v-btn--top': props.top ?? false,
      ...themeClasses.value,
      ...groupClasses.value,
      ...elevationClasses.value,
      ...sizeableClasses.value,
    }
  })
  const contained: Ref<boolean> = computed(() => {
    return Boolean(
      !isFlat.value &&
      !props.depressed &&
      // Contained class only adds elevation
      // is not needed if user provides value
      !props.elevation
    )
  })
  const computedRipple: Ref<RippleOptions | boolean> = computed(() => {
    const defaultRipple = props.icon || props.fab ? { circle: true } : true
    if (props.disabled) return false
    else return props.ripple ?? defaultRipple
  })
  const isFlat: Ref<boolean> = computed(() => {
    return Boolean(
      props.icon ||
      props.text ||
      props.outlined
    )
  })
  const isRound: Ref<boolean> = computed(() => {
    return Boolean(
      props.icon ||
      props.fab
    )
  })
  const styles: Ref<object> = measurableStyles

  const breakingProps = [
    ['flat', 'text'],
    ['outline', 'outlined'],
    ['round', 'rounded'],
  ]

  /* istanbul ignore next */
  breakingProps.forEach(([original, replacement]) => {
    if (context.attrs.hasOwnProperty(original)) breaking(original, replacement, /* this */) // TODO: fix this
  })

  function click(e: MouseEvent): void {
    // TODO: Remove this in v3
    // !props.retainFocusOnClick && !props.fab && e.detail && context.el.blur()
    context.emit('click', e)

    btnToggle && toggle()
  }
  function genContent(): VNode {
    return h('span', {
      staticClass: 'v-btn__content',
    }, context.slots.default)
  }
  function genLoader(): VNode {
    return h('span', {
      class: 'v-btn__loader',
    }, context.slots.loader || [h(VProgressCircular, {
      props: {
        indeterminate: true,
        size: 23,
        width: 2,
      },
    })])
  }

  return {
    classes,
    contained,
    computedRipple,
    isFlat,
    isRound,
    styles,
    click,
    genContent,
    genLoader,
    setBackgroundColor,
    setTextColor,
    generateRouteLink,
  }
}

export default defineComponent({
  name: 'v-btn',
  props: VBtnProps,
  directives: {
    ...routableDirectives,
  },
  setup(props, context) {
    const { genContent, genLoader, isFlat, setTextColor, setBackgroundColor, generateRouteLink } = useVBtn(props, context)
    return () => {
      const children = [
        genContent(),
        props.loading && genLoader(),
      ]
      const setColor = !isFlat.value ? setBackgroundColor : setTextColor
      const { tag, data } = generateRouteLink()

      if (tag === 'button') {
        data.attrs!.type = props.type
        data.attrs!.disabled = props.disabled
      }
      data.attrs!.value = ['string', 'number'].includes(typeof props.value)
        ? props.value
        : JSON.stringify(props.value)

      return () => h(tag, props.disabled ? data : setColor(props.color, data), children)
    }
  },
})
