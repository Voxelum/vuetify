import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VListGroup.sass'

// Components
import VIcon from '../VIcon'
import VList from './VList'
import VListItem from './VListItem'
import VListItemIcon from './VListItemIcon'

// Mixins
import BindsAttrs from '../../mixins/binds-attrs'
import Bootable from '../../mixins/bootable'
import Colorable from '../../mixins/colorable'
import Toggleable from '../../mixins/toggleable'
import { inject as RegistrableInject } from '../../mixins/registrable'

// Directives
import ripple from '../../directives/ripple'

// Transitions
import { VExpandTransition } from '../transitions'

// Utils
import mixins, { ExtractVue } from '../../util/mixins'
import { getSlot } from '../../util/helpers'

// Types
import { VNode } from 'vue'
import { Route } from 'vue-router'
export const VListGroupProps = {
}

const baseMixins = mixins(
  BindsAttrs,
  Bootable,
  Colorable,
  RegistrableInject('list'),
  Toggleable
)

type VListInstance = InstanceType<typeof VList>

interface options extends ExtractVue<typeof baseMixins> {
  list: VListInstance
  $refs: {
    group: HTMLElement
  }
  $route: Route
}

export function useVListGroup(props: ExtractPropTypes<typeof VListGroupProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        'v-list-group--active': props.isActive,
        'v-list-group--disabled': props.disabled,
        'v-list-group--no-action': props.noAction,
        'v-list-group--sub-group': props.subGroup,
      }
    })

      /* istanbul ignore else */
      if (!props.subGroup && val) {
        props.list && props.list.listClick(props._uid)
      }
})
{

    props.list && props.list.register(this)

    if (props.group &&
      context.route &&
      props.value == null
    ) {
      props.isActive = matchRoute(context.route.path)
    }

  onBeforeUnmount(() => {
    props.list && props.list.unregister(this)
  })

  function click (e: Event) {
      if (props.disabled) return

      props.isBooted = true

      context.emit('click', e)
      context.nextTick(() => (props.isActive = !props.isActive))
    }
  function genIcon (icon: string | false): VNode {
      return context.createElement(VIcon, icon)
    }
  function genAppendIcon (): VNode | null {
      const icon = !props.subGroup ? props.appendIcon : false

      if (!icon && !context.slots.appendIcon) return null

      return context.createElement(VListItemIcon, {
        staticClass: 'v-list-group__header__append-icon',
      }, [
        context.slots.appendIcon || genIcon(icon),
      ])
    }
  function genHeader (): VNode {
      return context.createElement(VListItem, {
        staticClass: 'v-list-group__header',
        attrs: {
          'aria-expanded': String(props.isActive),
          role: 'button',
        },
        class: {
          [props.activeClass]: props.isActive,
        },
        props: {
          inputValue: props.isActive,
        },
        directives: [{
          name: 'ripple',
          value: props.ripple,
        }],
        on: {
          ...props.listeners$,
          click: click,
        },
      }, [
        genPrependIcon(),
        context.slots.activator,
        genAppendIcon(),
      ])
    }
  function genItems (): VNode[] {
      return props.showLazyContent(() => [
        context.createElement('div', {
          staticClass: 'v-list-group__items',
          directives: [{
            name: 'show',
            value: props.isActive,
          }],
        }, getSlot(this)),
      ])
    }
  function genPrependIcon (): VNode | null {
      const icon = props.subGroup && props.prependIcon == null
        ? '$subgroup'
        : props.prependIcon

      if (!icon && !context.slots.prependIcon) return null

      return context.createElement(VListItemIcon, {
        staticClass: 'v-list-group__header__prepend-icon',
      }, [
        context.slots.prependIcon || genIcon(icon),
      ])
    }
  function onRouteChange (to: Route) {
      /* istanbul ignore if */
      if (!props.group) return

      const isActive = matchRoute(to.path)

      /* istanbul ignore else */
      if (isActive && props.isActive !== isActive) {
        props.list && props.list.listClick(props._uid)
      }

      props.isActive = isActive
    }
  function toggle (uid: number) {
      const isActive = props._uid === uid

      if (isActive) props.isBooted = true
      context.nextTick(() => (props.isActive = isActive))
    }
  function matchRoute (to: string) {
      return to.match(props.group) !== null
    }

  return {
    classes,
    click,
    genIcon,
    genAppendIcon,
    genHeader,
    genItems,
    genPrependIcon,
    onRouteChange,
    toggle,
    matchRoute,
  }
}
const VListGroup = defineComponent({
  name: 'v-list-group',
  props: VListGroupProps,
  setup(props, context) {
    const {} = useVListGroup(props, context)
    return h('div', props.setTextColor(props.isActive && props.color, {
      staticClass: 'v-list-group',
      class: classes.value,
    }), [
      genHeader(),
      h(VExpandTransition, genItems()),
    ])
  },
})

export default VListGroup

