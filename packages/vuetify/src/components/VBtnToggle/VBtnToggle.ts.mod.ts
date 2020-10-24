import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Styles
import './VBtnToggle.sass'

// Mixins
import ButtonGroup from '../../mixins/button-group'
import Colorable from '../../mixins/colorable'

// Utilities
import mixins from '../../util/mixins'
export const VBtnToggleProps = {
    backgroundColor: String,
    borderless: Boolean,
    dense: Boolean,
    group: Boolean,
    rounded: Boolean,
    shaped: Boolean,
    tile: Boolean,
}

/* @vue/component */
  ButtonGroup,
  Colorable
export function useVBtnToggle(props: ExtractPropTypes<typeof VBtnToggleProps>, context: SetupContext) {


    const classes: Ref<object> = computed(() => {
      return {
        ...ButtonGroup.options.computed.classes.call(this),
        'v-btn-toggle': true,
        'v-btn-toggle--borderless': props.borderless,
        'v-btn-toggle--dense': props.dense,
        'v-btn-toggle--group': props.group,
        'v-btn-toggle--rounded': props.rounded,
        'v-btn-toggle--shaped': props.shaped,
        'v-btn-toggle--tile': props.tile,
        ...props.themeClasses,
      }
    })

  function genData () {
      const data = props.setTextColor(props.color, {
        ...ButtonGroup.options.methods.genData.call(this),
      })

      if (props.group) return data

      return props.setBackgroundColor(props.backgroundColor, data)
    }
  return {
    classes,
    genData,
  }
}
const VBtnToggle = defineComponent({
  name: 'v-btn-toggle',
  props: VBtnToggleProps,
  setup(props, context) {
    const {} = useVBtnToggle(props, context)
  },
})

export default VBtnToggle

