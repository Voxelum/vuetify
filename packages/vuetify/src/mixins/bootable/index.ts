import { computed, ExtractPropTypes, h, reactive, Ref, SetupContext, VNode, watch } from 'vue'
// Utilities
import { removed } from '../../util/console'

export const bootableProps = {
  eager: Boolean,
  isActive: Boolean,
}

/**
 * Bootable
 * @mixin
 *
 * Used to add lazy content functionality to components
 * Looks for change in "isActive" to automatically boot
 * Otherwise can be set manually
 */
/* @vue/component */
export default function useBootable(props: ExtractPropTypes<typeof bootableProps>, context: SetupContext) {
  const data = reactive({
    isBooted: false,
  })
  const hasContent: Ref<boolean | undefined> = computed(() => {
    return data.isBooted || props.eager || props.isActive
  })

  watch(() => props.isActive, () => {
    data.isBooted = true
  })

  /* istanbul ignore next */
  if ('lazy' in context.attrs) {
    removed('lazy', context)
  }

  function showLazyContent(content?: () => VNode[]): VNode[] {
    return (hasContent.value && content) ? content() : [h('')]
  }
  return {
    hasContent,
    showLazyContent,
  }
}
