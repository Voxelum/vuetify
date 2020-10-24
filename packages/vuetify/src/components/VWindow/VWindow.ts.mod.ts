import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VWindow.sass'

// Types
import { VNode, VNodeDirective } from 'vue/types/vnode'
import { PropType } from 'vue'
import { TouchHandlers } from 'vuetify/types'

// Directives
import Touch from '../../directives/touch'

// Components
import VBtn from '../VBtn'
import VIcon from '../VIcon'
import { BaseItemGroup } from '../VItemGroup/VItemGroup'
export const VWindowProps = {
}

/* @vue/component */
export function useVWindow(props: ExtractPropTypes<typeof VWindowProps>, context: SetupContext) {



  const data = reactive({
      changedByDelimiters: false,
      internalHeight: undefined as undefined | string, // This can be fixed by child class.
      transitionHeight: undefined as undefined | string, // Intermediate height during transition.
      transitionCount: 0, // Number of windows in transition state.
      isBooted: false,
      isReverse: false,
    }
)

    const isActive: Ref<boolean> = computed(() => {
      return data.transitionCount > 0
    })
    const classes: Ref<object> = computed(() => {
      return {
        ...BaseItemGroup.options.computed.classes.call(this),
        'v-window--show-arrows-on-hover': props.showArrowsOnHover,
      }
    })
    const computedTransition: Ref<string> = computed(() => {
      if (!data.isBooted) return ''

      const axis = props.vertical ? 'y' : 'x'
      const reverse = context.vuetify.rtl && axis === 'x' ? !internalReverse.value : internalReverse.value
      const direction = reverse ? '-reverse' : ''

      return `v-window-${axis}${direction}-transition`
    })
    const hasActiveItems: Ref<boolean> = computed(() => {
      return Boolean(
        props.items.find(item => !item.disabled)
      )
    })
    const hasNext: Ref<boolean> = computed(() => {
      return props.continuous || internalIndex.value < props.items.length - 1
    })
    const hasPrev: Ref<boolean> = computed(() => {
      return props.continuous || internalIndex.value > 0
    })
    const internalIndex: Ref<number> = computed(() => {
      return props.items.findIndex((item, i) => {
        return props.internalValue === props.getValue(item, i)
      })
    })
    const internalReverse: Ref<boolean> = computed(() => {
      return props.reverse ? !data.isReverse : data.isReverse
    })

watch(internalIndex, undefined => {
{

  onMounted(() => {
    window.requestAnimationFrame(() => (data.isBooted = true))
  })

  function genContainer (): VNode {
      const children = [context.slots.default]

      if (props.showArrows) {
        children.push(genControlIcons())
      }

      return context.createElement('div', {
        staticClass: 'v-window__container',
        class: {
          'v-window__container--is-active': isActive.value,
        },
        style: {
          height: data.internalHeight || data.transitionHeight,
        },
      }, children)
    }
  function genIcon (
      direction: 'prev' | 'next',
      icon: string,
      fn: () => void
    ) {
      return context.createElement('div', {
        staticClass: `v-window__${direction}`,
      }, [
        context.createElement(VBtn, {
          props: { icon: true },
          attrs: {
            'aria-label': context.vuetify.lang.t(`$vuetify.carousel.${direction}`),
          },
          on: {
            click: () => {
              data.changedByDelimiters = true
              fn()
            },
          },
        }, [
          context.createElement(VIcon, {
            props: { large: true },
          }, icon),
        ]),
      ])
    }
  function genControlIcons () {
      const icons = []

      const prevIcon = context.vuetify.rtl
        ? props.nextIcon
        : props.prevIcon

      /* istanbul ignore else */
      if (
        hasPrev.value &&
        prevIcon &&
        typeof prevIcon === 'string'
      ) {
        const icon = genIcon('prev', prevIcon, prev)
        icon && icons.push(icon)
      }

      const nextIcon = context.vuetify.rtl
        ? props.prevIcon
        : props.nextIcon

      /* istanbul ignore else */
      if (
        hasNext.value &&
        nextIcon &&
        typeof nextIcon === 'string'
      ) {
        const icon = genIcon('next', nextIcon, next)
        icon && icons.push(icon)
      }

      return icons
    }
  function getNextIndex (index: number): number {
      const nextIndex = (index + 1) % props.items.length
      const item = props.items[nextIndex]

      if (item.disabled) return getNextIndex(nextIndex)

      return nextIndex
    }
  function getPrevIndex (index: number): number {
      const prevIndex = (index + props.items.length - 1) % props.items.length
      const item = props.items[prevIndex]

      if (item.disabled) return getPrevIndex(prevIndex)

      return prevIndex
    }
  function next () {
      data.isReverse = context.vuetify.rtl

      /* istanbul ignore if */
      if (!hasActiveItems.value || !hasNext.value) return

      const nextIndex = getNextIndex(internalIndex.value)
      const item = props.items[nextIndex]

      props.internalValue = props.getValue(item, nextIndex)
    }
  function prev () {
      data.isReverse = !context.vuetify.rtl

      /* istanbul ignore if */
      if (!hasActiveItems.value || !hasPrev.value) return

      const lastIndex = getPrevIndex(internalIndex.value)
      const item = props.items[lastIndex]

      props.internalValue = props.getValue(item, lastIndex)
    }
  function updateReverse (val: number, oldVal: number) {
      if (data.changedByDelimiters) {
        data.changedByDelimiters = false
        return
      }

      data.isReverse = val < oldVal
    }

  return {
    isActive,
    classes,
    computedTransition,
    hasActiveItems,
    hasNext,
    hasPrev,
    internalIndex,
    internalReverse,
    genContainer,
    genIcon,
    ,
    genControlIcons,
    getNextIndex,
    getPrevIndex,
    next,
    prev,
    updateReverse,
  }
}
const VWindow = defineComponent({
  name: 'v-window',
  props: VWindowProps,
  setup(props, context) {
    const {} = useVWindow(props, context)
    const data = {
      staticClass: 'v-window',
      class: classes.value,
      directives: [] as VNodeDirective[],
    }

    if (!props.touchless) {
      const value = props.touch || {
        left: () => {
          context.vuetify.rtl ? prev() : next()
        },
        right: () => {
          context.vuetify.rtl ? next() : prev()
        },
        end: (e: TouchEvent) => {
          e.stopPropagation()
        },
        start: (e: TouchEvent) => {
          e.stopPropagation()
        },
      }

      data.directives.push({
        name: 'touch',
        value,
      })
    }

    return h('div', data, [genContainer()])
  },
})

export default VWindow

