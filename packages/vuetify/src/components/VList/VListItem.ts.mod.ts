import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VListItem.sass'

// Mixins
import Colorable from '../../mixins/colorable'
import Routable from '../../mixins/routable'
import { factory as GroupableFactory } from '../../mixins/groupable'
import Themeable from '../../mixins/themeable'
import { factory as ToggleableFactory } from '../../mixins/toggleable'

// Directives
import Ripple from '../../directives/ripple'

// Utilities
import { keyCodes } from './../../util/helpers'
import { ExtractVue } from './../../util/mixins'
import { removed } from '../../util/console'

// Types
import mixins from '../../util/mixins'
import { VNode } from 'vue'
import { PropType, PropValidator } from 'vue/types/options'
export const VListItemProps = {
  activeClass: {
    type: String,
    default(): string | undefined {
      if (!this.listItemGroup) return ''

      return this.listItemGroup.activeClass
    },
  } as any as PropValidator<string>,
  dense: Boolean,
  inactive: Boolean,
  link: Boolean,
  selectable: {
    type: Boolean,
  },
  tag: {
    type: String,
    default: 'div',
  },
  threeLine: Boolean,
  twoLine: Boolean,
  value: null as any as PropType<any>,
}

// const baseMixins = mixins(
//   Colorable,
//   Routable,
//   Themeable,
//   GroupableFactory('listItemGroup'),
//   ToggleableFactory('inputValue')
// )

interface options extends ExtractVue<typeof baseMixins> {
  $el: HTMLElement
  isInGroup: boolean
  isInList: boolean
  isInMenu: boolean
  isInNav: boolean
}

/* @vue/component */
export function useVListItem(props: ExtractPropTypes<typeof VListItemProps>, context: SetupContext) {
  const data = reactive({
    proxyClass: 'v-list-item--active',
  })

  const classes: Ref<object> = computed(() => {
    return {
      'v-list-item': true,
      ...Routable.options.computed.classes.call(this),
      'v-list-item--dense': props.dense,
      'v-list-item--disabled': props.disabled,
      'v-list-item--link': isClickable.value && !props.inactive,
      'v-list-item--selectable': props.selectable,
      'v-list-item--three-line': props.threeLine,
      'v-list-item--two-line': props.twoLine,
      ...props.themeClasses,
    }
  })
  const isClickable: Ref<boolean> = computed(() => {
    return Boolean(
      Routable.options.computed.isClickable.call(this) ||
      props.listItemGroup
    )
  })

  /* istanbul ignore next */
  if (context.attrs.hasOwnProperty('avatar')) {
    removed('avatar', this)
  }

  function click(e: MouseEvent | KeyboardEvent) {
    if (e.detail) context.el.blur()

    context.emit('click', e)

    props.to || props.toggle()
  }
  function genAttrs() {
    const attrs: Record<string, any> = {
      'aria-disabled': props.disabled ? true : undefined,
      tabindex: isClickable.value && !props.disabled ? 0 : -1,
      ...context.attrs,
    }

    if (context.attrs.hasOwnProperty('role')) {
      // do nothing, role already provided
    } else if (props.isInNav) {
      // do nothing, role is inherit
    } else if (props.isInGroup) {
      attrs.role = 'listitem'
      attrs['aria-selected'] = String(props.isActive)
    } else if (props.isInMenu) {
      attrs.role = isClickable.value ? 'menuitem' : undefined
      attrs.id = attrs.id || `list-item-${props._uid}`
    } else if (props.isInList) {
      attrs.role = 'listitem'
    }

    return attrs
  }

  return {
    classes,
    isClickable,
    click,
    genAttrs,
  }
}
const VListItem = defineComponent({
  name: 'v-list-item',
  props: VListItemProps,
  setup(props, context) {
    const { } = useVListItem(props, context)
    let { tag, data } = props.generateRouteLink()

    data.attrs = {
      ...data.attrs,
      ...genAttrs(),
    }
    data[props.to ? 'nativeOn' : 'on'] = {
      ...data[props.to ? 'nativeOn' : 'on'],
      keydown: (e: KeyboardEvent) => {
        /* istanbul ignore else */
        if (e.keyCode === keyCodes.enter) click(e)

        context.emit('keydown', e)
      },
    }

    if (props.inactive) tag = 'div'
    if (props.inactive && props.to) {
      data.on = data.nativeOn
      delete data.nativeOn
    }

    const children = context.scopedSlots.default
      ? context.scopedSlots.default({
        active: props.isActive,
        toggle: props.toggle,
      })
      : context.slots.default

    return h(tag, props.setTextColor(props.color, data), children)
  },
})

export default VListItem

