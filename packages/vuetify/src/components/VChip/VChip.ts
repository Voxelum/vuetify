import { computed, defineComponent, ExtractPropTypes, h, reactive, Ref, SetupContext, VNode } from 'vue'
// Mixins
import useColorable, { colorableProps } from '../../mixins/colorable'
import { groupableProps, useGroupableFactory } from '../../mixins/groupable'
import useRoutable, { routableProps } from '../../mixins/routable'
import useSizeable, { sizeableProps } from '../../mixins/sizeable'
import useThemeable, { themeableProps } from '../../mixins/themeable'
import { toggableProps, useToggleableFactory } from '../../mixins/toggleable'
// Utilities
import { breaking } from '../../util/console'
// Components
import { VExpandXTransition } from '../transitions'
import VIcon from '../VIcon'
// Styles
import './VChip.sass'

export const VChipProps = {
  ...colorableProps,
  ...sizeableProps,
  ...routableProps,
  ...themeableProps,
  ...groupableProps('chipGroup'),
  ...toggableProps('chipGroup'),
  active: {
    type: Boolean,
    default: true,
  },
  activeClass: {
    type: String,
    default(): string | undefined {
      if (!this.chipGroup) return ''
      return this.chipGroup.activeClass
    },
  } /* as any as PropValidator<string> */,
  close: Boolean,
  closeIcon: {
    type: String,
    default: '$delete',
  },
  disabled: Boolean,
  draggable: Boolean,
  filter: Boolean,
  filterIcon: {
    type: String,
    default: '$complete',
  },
  label: Boolean,
  link: Boolean,
  outlined: Boolean,
  pill: Boolean,
  tag: {
    type: String,
    default: 'span',
  },
  textColor: String,
  value: null as any /* as PropType<any> */,
}

//   Colorable,
//   Sizeable,
//   Routable,
//   Themeable,
//   GroupableFactory('chipGroup'),
//   ToggleableFactory('inputValue')

const useToggable = useToggleableFactory('inputValue')
const useGroupable = useGroupableFactory('chipGroup')

export function useVChip(props: ExtractPropTypes<typeof VChipProps>, context: SetupContext) {
  const { themeClasses } = useThemeable(props)
  const { sizeableClasses } = useSizeable(props)
  const coloable = useColorable(context)
  const { groupClasses, chipGroup, toggle } = useGroupable(props, context)
  const { classes: routableClasses, isLink, isClickable: routableIsClickable, generateRouteLink } = useRoutable(props, context)
  const { isActive } = useToggable(props, context)
  const data = reactive({
    proxyClass: 'v-chip--active',
  })
  const classes: Ref<object> = computed(() => {
    return {
      'v-chip': true,
      ...routableClasses.value,
      'v-chip--clickable': isClickable.value,
      'v-chip--disabled': props.disabled,
      'v-chip--draggable': props.draggable,
      'v-chip--label': props.label,
      'v-chip--link': isLink.value,
      'v-chip--no-color': !props.color,
      'v-chip--outlined': props.outlined,
      'v-chip--pill': props.pill,
      'v-chip--removable': hasClose.value,
      ...themeClasses.value,
      ...sizeableClasses.value,
      ...groupClasses.value,
    }
  })
  const hasClose: Ref<boolean> = computed(() => {
    return Boolean(props.close)
  })
  const isClickable: Ref<boolean> = computed(() => {
    return Boolean(
      routableIsClickable.value ||
      chipGroup
    )
  })

  const breakingProps = [
    ['outline', 'outlined'],
    ['selected', 'input-value'],
    ['value', 'active'],
    ['@input', '@active.sync'],
  ]

  /* istanbul ignore next */
  breakingProps.forEach(([original, replacement]) => {
    if (context.attrs.hasOwnProperty(original)) breaking(original, replacement, context)
  })

  function click(e: MouseEvent): void {
    context.emit('click', e)

    chipGroup && toggle()
  }
  function genFilter(): VNode {
    const children = []

    if (isActive.value) {
      children.push(
        h(VIcon, {
          staticClass: 'v-chip__filter',
          props: { left: true },
        }, props.filterIcon)
      )
    }

    return h(VExpandXTransition, children)
  }
  function genClose(): VNode {
    return h(VIcon, {
      staticClass: 'v-chip__close',
      props: {
        right: true,
        size: 18,
      },
      onClick: (e: Event) => {
        e.stopPropagation()
        e.preventDefault()

        context.emit('click:close')
        context.emit('update:active', false)
      },
    }, props.closeIcon)
  }
  function genContent(): VNode {
    return h('span', {
      staticClass: 'v-chip__content',
    }, [
      props.filter && genFilter(),
      context.slots.default?.(),
      hasClose.value && genClose(),
    ])
  }

  return {
    classes,
    hasClose,
    isClickable,
    chipGroup,
    click,
    genFilter,
    genClose,
    genContent,
    generateRouteLink,
    ...coloable,
  }
}

const VChip = defineComponent({
  name: 'v-chip',
  props: VChipProps,
  setup(props, context) {
    const { chipGroup, genContent, generateRouteLink, setBackgroundColor, setTextColor } = useVChip(props, context)
    return () => {
      const children = [genContent()]
      let { tag, data } = generateRouteLink()

      data.attrs = {
        ...data.attrs,
        draggable: props.draggable ? 'true' : undefined,
        tabindex: chipGroup && !props.disabled ? 0 : data.attrs!.tabindex,
      }
      data.directives!.push({
        name: 'show',
        value: props.active,
      })
      data = setBackgroundColor(props.color, data)

      const color = props.textColor || (props.outlined && props.color)

      return () => h(tag, setTextColor(color, data), children)
    }
  },
})

export default VChip
