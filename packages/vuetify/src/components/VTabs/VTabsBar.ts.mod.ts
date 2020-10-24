import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Extensions
import { BaseSlideGroup } from '../VSlideGroup/VSlideGroup'

// Components
import VTab from './VTab'

// Mixins
import Themeable from '../../mixins/themeable'
import SSRBootable from '../../mixins/ssr-bootable'

// Utilities
import mixins from '../../util/mixins'

// Types
import { Route } from 'vue-router'
import { VNode } from 'vue'
export const VTabsBarProps = {
}

type VTabInstance = InstanceType<typeof VTab>

  BaseSlideGroup,
  SSRBootable,
  Themeable
  /* @vue/component */
export function useVTabsBar(props: ExtractPropTypes<typeof VTabsBarProps>, context: SetupContext) {


    const classes: Ref<classes ()> = computed(() => {
      return {
        ...BaseSlideGroup.options.computed.classes.call(this),
        'v-tabs-bar': true,
        'v-tabs-bar--is-mobile': props.isMobile,
        // TODO: Remove this and move to v-slide-group
        'v-tabs-bar--show-arrows': props.showArrows,
        ...props.themeClasses,
      }
    })

{

  function callSlider () {
      if (!props.isBooted) return

      context.emit('call:slider')
    }
  function genContent () {
      const render = BaseSlideGroup.options.methods.genContent.call(this)

      render.data = render.data || {}
      render.data.staticClass += ' v-tabs-bar__content'

      return render
    }
  function onRouteChange (val: Route, oldVal: Route) {
      /* istanbul ignore next */
      if (props.mandatory) return

      const items = props.items as unknown as VTabInstance[]
      const newPath = val.path
      const oldPath = oldVal.path

      let hasNew = false
      let hasOld = false

      for (const item of items) {
        if (item.to === newPath) hasNew = true
        else if (item.to === oldPath) hasOld = true

        if (hasNew && hasOld) break
      }

      // If we have an old item and not a new one
      // it's assumed that the user navigated to
      // a path that is not present in the items
      if (!hasNew && hasOld) props.internalValue = undefined
    }

  return {
    classes,
    callSlider,
    genContent,
    onRouteChange,
  }
}
const VTabsBar = defineComponent({
  name: 'v-tabs-bar',
  props: VTabsBarProps,
  setup(props, context) {
    const {} = useVTabsBar(props, context)
    const render = BaseSlideGroup.options.render.call(this, h)

    render.data!.attrs = {
      role: 'tablist',
    }

    return render
  },
})

export default VTabsBar

