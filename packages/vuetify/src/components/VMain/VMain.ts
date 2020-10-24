import { useVuetify } from '@framework'
import useSsrBootable from '@mixins/ssr-bootable'
import { computed, defineComponent, ExtractPropTypes, h, Ref, SetupContext } from 'vue'
// Styles
import './VMain.sass'

export const VMainProps = {
  tag: {
    type: String,
    default: 'main',
  },
}

/* @vue/component */
export function useVMain(props: ExtractPropTypes<typeof VMainProps>, context: SetupContext) {
  const vuetify = useVuetify()
  const styles: Ref<object> = computed(() => {
    const {
      bar, top, right, footer, insetFooter, bottom, left,
    } = vuetify.application
    return {
      paddingTop: `${top + bar}px`,
      paddingRight: `${right}px`,
      paddingBottom: `${footer + insetFooter + bottom}px`,
      paddingLeft: `${left}px`,
    }
  })

  return {
    ...useSsrBootable(),
    main,
    styles,
  }
}

const VMain = defineComponent({
  name: 'v-main',
  props: VMainProps,
  setup(props, context) {
    const { styles, root } = useVMain(props, context)

    return () => h(props.tag, {
      staticClass: 'v-main',
      style: styles.value,
      ref: root,
    }, [
      h('div', {
        class: 'v-main__wrap'
      }, context.slots.default?.()),
    ])
  },
})

export default VMain

