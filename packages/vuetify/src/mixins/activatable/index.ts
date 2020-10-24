import { ExtractPropTypes, onBeforeUnmount, onMounted, PropType, reactive, SetupContext, VNode, watch } from 'vue'
import { getSlot } from '../../util/helpers'
import useDelayable, { delayableProps } from '../delayable'
import { toggableProps, useToggleableFactory } from '../toggleable'


export const activatableProps = {
  ...delayableProps,
  ...toggableProps,
  activator: {
    default: null as unknown as PropType<string | HTMLElement | VNode | Element | null>,
    validator: (val: string | object) => {
      return ['string', 'object'].includes(typeof val)
    },
  },
  disabled: Boolean,
  internalActivator: Boolean,
  openOnHover: Boolean,
  openOnFocus: Boolean,
}

type Listeners = Dictionary<(e: MouseEvent & KeyboardEvent & FocusEvent) => void>

const useToggleable = useToggleableFactory()

/* @vue/component */
export default function useActivatable(props: ExtractPropTypes<typeof activatableProps>, context: SetupContext) {
  const { runDelay, clearDelay } = useDelayable(props)
  const { isActive } = useToggleable(props, context)

  const data = reactive({
    // Do not use this directly, call getActivator() instead
    activatorElement: null as HTMLElement | null,
    activatorNode: [] as VNode[],
    events: ['click', 'mouseenter', 'mouseleave', 'focus'],
    listeners: {} as Listeners,
  })

  watch([() => props.activator, () => props.openOnFocus, () => props.openOnHover], resetActivator)

  onMounted(() => {
    // TODO: check this, currently we don't have scoped slot anymore!

    // const slotType = getSlotType(this, 'activator', true)

    // if (slotType && ['v-slot', 'normal'].includes(slotType)) {
    //   consoleError(`The activator slot must be bound, try '<template v-slot:activator="{ on }"><v-btn v-on="on">'`, this)
    // }

    addActivatorEvents()
  })

  onBeforeUnmount(() => {
    removeActivatorEvents()
  })

  function addActivatorEvents() {
    if (
      !props.activator ||
      props.disabled ||
      !getActivator()
    ) return

    data.listeners = genActivatorListeners()
    const keys = Object.keys(data.listeners)

    for (const key of keys) {
      getActivator()!.addEventListener(key, data.listeners[key] as any)
    }
  }
  function genActivator() {
    const node = getSlot(context, 'activator', Object.assign(getValueProxy(), {
      ...genActivatorListeners(),
      ...genActivatorAttributes(),
    })) || []

    data.activatorNode = node

    return node
  }
  function genActivatorAttributes() {
    return {
      role: 'button',
      'aria-haspopup': true,
      'aria-expanded': String(props.isActive),
    }
  }
  function genActivatorListeners() {
    if (props.disabled) return {}

    const listeners: Listeners = {}

    if (props.openOnHover) {
      listeners.onMouseenter = (e: MouseEvent) => {
        getActivator(e)
        runDelay('open')
      }
      listeners.onMouseleave = (e: MouseEvent) => {
        getActivator(e)
        runDelay('close')
      }
    } else {
      listeners.onClick = (e: MouseEvent) => {
        const activator = getActivator(e)
        if (activator) activator.focus()

        e.stopPropagation()

        isActive.value = !isActive.value
      }
    }

    if (props.openOnFocus) {
      listeners.onFocus = (e: FocusEvent) => {
        getActivator(e)

        e.stopPropagation()

        isActive.value = !isActive.value
      }
    }

    return listeners
  }
  function getActivator(e?: Event): HTMLElement | null {
    // If we've already fetched the activator, re-use
    if (data.activatorElement) return data.activatorElement

    let activator = null

    if (props.activator) {
      const target = props.internalActivator ? context.el : document

      if (typeof props.activator === 'string') {
        // Selector
        activator = target.querySelector(props.activator)
      } else if ((props.activator as any).el) {
        // Component (ref)
        activator = (props.activator as any).el
      } else {
        // HTMLElement | Element
        activator = props.activator
      }
    } else if (data.activatorNode.length === 1 || (data.activatorNode.length && !e)) {
      // Use the contents of the activator slot
      // There's either only one element in it or we
      // don't have a click event to use as a last resort
      const vm = data.activatorNode[0].component

      //TODO: we don't use mixin for vue 3
      if (
        vm &&
        vm.$options.mixins && // Activatable is indirectly used via Menuable
        vm.$options.mixins.some((m: any) => m.options && ['activatable', 'menuable'].includes(m.options.name))
      ) {
        // Activator is actually another activatible component, use its activator (#8846)
        activator = (vm as any).getActivator()
      } else {
        activator = data.activatorNode[0].el as HTMLElement
      }
    } else if (e) {
      // Activated by a click or focus event
      activator = (e.currentTarget || e.target) as HTMLElement
    }

    data.activatorElement = activator

    return data.activatorElement
  }
  function getContentSlot() {
    return getSlot(context, 'default', getValueProxy(), true)
  }
  function getValueProxy(): object {
    const ref = isActive
    return {
      get value() {
        return ref.value
      },
      set value(isActive: boolean) {
        ref.value = isActive
      },
    }
  }
  function removeActivatorEvents() {
    if (
      !props.activator ||
      !data.activatorElement
    ) return

    // TODO: now the listeners is flatted

    const keys = Object.keys(data.listeners)

    for (const key of keys) {
      (data.activatorElement as any).removeEventListener(key, data.listeners[key])
    }

    data.listeners = {}
  }
  function resetActivator() {
    removeActivatorEvents()
    data.activatorElement = null
    getActivator()
    addActivatorEvents()
  }
  return {
    addActivatorEvents,
    genActivator,
    genActivatorAttributes,
    genActivatorListeners,
    getActivator,
    getContentSlot,
    getValueProxy,
    removeActivatorEvents,
    resetActivator,
    runDelay,
    clearDelay,
    isActive,
  }
}
