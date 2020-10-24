import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Mixins
import Themeable from '../../mixins/themeable'

// Types
import { VNode } from 'vue'
export const VThemeProviderProps = {
}

/* @vue/component */
export function useVThemeProvider(props: ExtractPropTypes<typeof VThemeProviderProps>, context: SetupContext) {


  return {
  }
}
const VThemeProvider = defineComponent({
  name: 'v-theme-provider',
  props: VThemeProviderProps,
  setup(props, context) {
    const {} = useVThemeProvider(props, context)
  },
})

export default VThemeProvider

