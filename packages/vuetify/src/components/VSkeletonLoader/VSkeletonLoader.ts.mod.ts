import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VSkeletonLoader.sass'

// Mixins
import Elevatable from '../../mixins/elevatable'
import Measurable from '../../mixins/measurable'
import Themeable from '../../mixins/themeable'

// Utilities
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue'
import { getSlot } from '../../util/helpers'
import { PropValidator } from 'vue/types/options'
export const VSkeletonLoaderProps = {
    boilerplate: Boolean,
    loading: Boolean,
    tile: Boolean,
    transition: String,
    type: String,
    types: {
      type: Object,
      default: () => ({}),
    } as PropValidator<Record<string, string>>,
}

export interface HTMLSkeletonLoaderElement extends HTMLElement {
  _initialStyle?: {
    display: string | null
    transition: string
  }
}

/* @vue/component */
  Elevatable,
  Measurable,
  Themeable,
export function useVSkeletonLoader(props: ExtractPropTypes<typeof VSkeletonLoaderProps>, context: SetupContext) {


    const attrs: Ref<object> = computed(() => {
      if (!isLoading.value) return context.attrs

      return !props.boilerplate ? {
        'aria-busy': true,
        'aria-live': 'polite',
        role: 'alert',
        ...context.attrs,
      } : {}
    })
    const classes: Ref<object> = computed(() => {
      return {
        'v-skeleton-loader--boilerplate': props.boilerplate,
        'v-skeleton-loader--is-loading': isLoading.value,
        'v-skeleton-loader--tile': props.tile,
        ...props.themeClasses,
        ...props.elevationClasses,
      }
    })
    const isLoading: Ref<boolean> = computed(() => {
      return !('default' in context.scopedSlots) || props.loading
    })
    const rootTypes: Ref<Record<string, string>> = computed(() => {
      return {
        actions: 'button@2',
        article: 'heading, paragraph',
        avatar: 'avatar',
        button: 'button',
        card: 'image, card-heading',
        'card-avatar': 'image, list-item-avatar',
        'card-heading': 'heading',
        chip: 'chip',
        'date-picker': 'list-item, card-heading, divider, date-picker-options, date-picker-days, actions',
        'date-picker-options': 'text, avatar@2',
        'date-picker-days': 'avatar@28',
        heading: 'heading',
        image: 'image',
        'list-item': 'text',
        'list-item-avatar': 'avatar, text',
        'list-item-two-line': 'sentences',
        'list-item-avatar-two-line': 'avatar, sentences',
        'list-item-three-line': 'paragraph',
        'list-item-avatar-three-line': 'avatar, paragraph',
        paragraph: 'text@3',
        sentences: 'text@2',
        table: 'table-heading, table-thead, table-tbody, table-tfoot',
        'table-heading': 'heading, text',
        'table-thead': 'heading@6',
        'table-tbody': 'table-row-divider@6',
        'table-row-divider': 'table-row, divider',
        'table-row': 'table-cell@6',
        'table-cell': 'text',
        'table-tfoot': 'text@2, avatar@2',
        text: 'text',
        ...props.types,
      }
    })

  function genBone (text: string, children: VNode[]) {
      return context.createElement('div', {
        staticClass: `v-skeleton-loader__${text} v-skeleton-loader__bone`,
      }, children)
    }
  function genBones (bone: string): VNode[] {
      // e.g. 'text@3'
      const [type, length] = bone.split('@') as [string, number]
      const generator = () => genStructure(type)

      // Generate a length array based upon
      // value after @ in the bone string
      return Array.from({ length }).map(generator)
    }
    // Fix type when this is merged
    // https://github.com/microsoft/TypeScript/pull/33050
  function genStructure (type?: string): any {
      let children = []
      type = type || props.type || ''
      const bone = rootTypes.value[type] || ''

      // End of recursion, do nothing
      /* eslint-disable-next-line no-empty, brace-style */
      if (type === bone) {}
      // Array of values - e.g. 'heading, paragraph, text@2'
      else if (type.indexOf(',') > -1) return mapBones(type)
      // Array of values - e.g. 'paragraph@4'
      else if (type.indexOf('@') > -1) return genBones(type)
      // Array of values - e.g. 'card@2'
      else if (bone.indexOf(',') > -1) children = mapBones(bone)
      // Array of values - e.g. 'list-item@2'
      else if (bone.indexOf('@') > -1) children = genBones(bone)
      // Single value - e.g. 'card-heading'
      else if (bone) children.push(genStructure(bone))

      return [genBone(type, children)]
    }
  function genSkeleton () {
      const children = []

      if (!isLoading.value) children.push(getSlot(this))
      else children.push(genStructure())

      /* istanbul ignore else */
      if (!props.transition) return children

      /* istanbul ignore next */
      return context.createElement('transition', {
        props: {
          name: props.transition,
        },
        // Only show transition when
        // content has been loaded
        on: {
          afterEnter: resetStyles,
          beforeEnter: onBeforeEnter,
          beforeLeave: onBeforeLeave,
          leaveCancelled: resetStyles,
        },
      }, children)
    }
  function mapBones (bones: string) {
      // Remove spaces and return array of structures
      return bones.replace(/\s/g, '').split(',').map(genStructure)
    }
  function onBeforeEnter (el: HTMLSkeletonLoaderElement) {
      resetStyles(el)

      if (!isLoading.value) return

      el._initialStyle = {
        display: el.style.display,
        transition: el.style.transition,
      }

      el.style.setProperty('transition', 'none', 'important')
    }
  function onBeforeLeave (el: HTMLSkeletonLoaderElement) {
      el.style.setProperty('display', 'none', 'important')
    }
  function resetStyles (el: HTMLSkeletonLoaderElement) {
      if (!el._initialStyle) return

      el.style.display = el._initialStyle.display || ''
      el.style.transition = el._initialStyle.transition

      delete el._initialStyle
    }

  return {
    attrs,
    classes,
    isLoading,
    rootTypes,
    genBone,
    genBones,
    ,
    ,
    genStructure,
    genSkeleton,
    mapBones,
    onBeforeEnter,
    onBeforeLeave,
    resetStyles,
  }
}
const VSkeletonLoader = defineComponent({
  name: 'VSkeletonLoader',
  props: VSkeletonLoaderProps,
  setup(props, context) {
    const {} = useVSkeletonLoader(props, context)
    return h('div', {
      staticClass: 'v-skeleton-loader',
      attrs: attrs.value,
      on: context.listeners,
      class: classes.value,
      style: isLoading.value ? props.measurableStyles : undefined,
    }, [genSkeleton()])
  },
})

export default VSkeletonLoader

