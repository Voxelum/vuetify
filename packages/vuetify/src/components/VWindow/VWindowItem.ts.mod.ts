import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Components
import VWindow from './VWindow'

// Mixins
import Bootable from '../../mixins/bootable'
import { factory as GroupableFactory } from '../../mixins/groupable'

// Directives
import Touch from '../../directives/touch'

// Utilities
import { convertToUnit } from '../../util/helpers'
import mixins, { ExtractVue } from '../../util/mixins'

// Types
import { VNode } from 'vue'
export const VWindowItemProps = {
    disabled: Boolean,
    reverseTransition: {
      type: [Boolean, String],
      default: undefined,
    },
    transition: {
      type: [Boolean, String],
      default: undefined,
    },
    value: {
      required: false,
    },
}

const baseMixins = mixins(
  Bootable,
  GroupableFactory('windowGroup', 'v-window-item', 'v-window')
)

interface options extends ExtractVue<typeof baseMixins> {
  $el: HTMLElement
  windowGroup: InstanceType<typeof VWindow>
}

  /* @vue/component */
export function useVWindowItem(props: ExtractPropTypes<typeof VWindowItemProps>, context: SetupContext) {



  const data = reactive({
      isActive: false,
      inTransition: false,
    }
)

    const classes: Ref<object> = computed(() => {
      return props.groupClasses
    })
    const computedTransition: Ref<string | boolean> = computed(() => {
      if (!props.windowGroup.internalReverse) {
        return typeof props.transition !== 'undefined'
          ? props.transition || ''
          : props.windowGroup.computedTransition
      }

      return typeof props.reverseTransition !== 'undefined'
        ? props.reverseTransition || ''
        : props.windowGroup.computedTransition
    })

  function genDefaultSlot () {
      return context.slots.default
    }
  function genWindowItem () {
      return context.createElement('div', {
        staticClass: 'v-window-item',
        class: classes.value,
        directives: [{
          name: 'show',
          value: data.isActive,
        }],
        on: context.listeners,
      }, genDefaultSlot())
    }
  function onAfterTransition () {
      if (!data.inTransition) {
        return
      }

      // Finalize transition state.
      data.inTransition = false
      if (props.windowGroup.transitionCount > 0) {
        props.windowGroup.transitionCount--

        // Remove container height if we are out of transition.
        if (props.windowGroup.transitionCount === 0) {
          props.windowGroup.transitionHeight = undefined
        }
      }
    }
  function onBeforeTransition () {
      if (data.inTransition) {
        return
      }

      // Initialize transition state here.
      data.inTransition = true
      if (props.windowGroup.transitionCount === 0) {
        // Set initial height for height transition.
        props.windowGroup.transitionHeight = convertToUnit(props.windowGroup.$el.clientHeight)
      }
      props.windowGroup.transitionCount++
    }
  function onTransitionCancelled () {
      onAfterTransition() // This should have the same path as normal transition end.
    }
  function onEnter (el: HTMLElement) {
      if (!data.inTransition) {
        return
      }

      context.nextTick(() => {
        // Do not set height if no transition or cancelled.
        if (!computedTransition.value || !data.inTransition) {
          return
        }

        // Set transition target height.
        props.windowGroup.transitionHeight = convertToUnit(el.clientHeight)
      })
    }

  return {
    classes,
    computedTransition,
    genDefaultSlot,
    genWindowItem,
    onAfterTransition,
    onBeforeTransition,
    onTransitionCancelled,
    onEnter,
  }
}
const VWindowItem = defineComponent({
  name: 'v-window-item',
  props: VWindowItemProps,
  setup(props, context) {
    const {} = useVWindowItem(props, context)
    return h('transition', {
      props: {
        name: computedTransition.value,
      },
      on: {
        // Handlers for enter windows.
        beforeEnter: onBeforeTransition,
        afterEnter: onAfterTransition,
        enterCancelled: onTransitionCancelled,

        // Handlers for leave windows.
        beforeLeave: onBeforeTransition,
        afterLeave: onAfterTransition,
        leaveCancelled: onTransitionCancelled,

        // Enter handler for height transition.
        enter: onEnter,
      },
    }, props.showLazyContent(() => [genWindowItem()]))
  },
})

export default VWindowItem

