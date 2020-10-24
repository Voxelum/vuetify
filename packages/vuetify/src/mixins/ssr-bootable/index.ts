import { onMounted, reactive, ref, Ref, toRefs } from 'vue'

/**
 * SSRBootable
 *
 * @mixin
 *
 * Used in layout components (drawer, toolbar, content)
 * to avoid an entry animation when using SSR
 */
export default function useSsrBootable() {
  const data = reactive({
    isBooted: false,
  })
  const root: Ref<HTMLElement | null> = ref(null)

  onMounted(() => {
    // Use setAttribute instead of dataset
    // because dataset does not work well
    // with unit tests
    window.requestAnimationFrame(() => {
      root!.value!.setAttribute('data-booted', 'true')
      data.isBooted = true
    })
  })
  return {
    root,
    ...toRefs(data)
  }
}
