import { computed, reactive, ref, Ref } from 'vue'
import { getZIndex } from '../../util/helpers'


/* @vue/component */
export default function useStackable() {
  const data = reactive({
    stackElement: null as Element | null,
    stackExclude: null as Element[] | null,
    stackMinZIndex: 0,
    isActive: false,
  })
  const content: Ref<HTMLElement | null> = ref(null)
  const root: Ref<HTMLElement | null> = ref(null)
  const _content = content
  const activeZIndex: Ref<number> = computed(() => {
    if (typeof window === 'undefined') return 0

    const content = data.stackElement || _content.value
    // Return current zindex if not active

    const index = !data.isActive
      ? getZIndex(content)
      : getMaxZIndex(data.stackExclude || [content]) + 2

    if (index == null) return index

    // Return max current z-index (excluding self) + 2
    // (2 to leave room for an overlay below, if needed)
    return parseInt(index)
  })
  function getMaxZIndex(exclude: Element[] = []) {
    const base = root.value
    // Start with lowest allowed z-index or z-index of
    // base component's element, whichever is greater
    const zis = [data.stackMinZIndex, getZIndex(base)]
    // Convert the NodeList to an array to
    // prevent an Edge bug with Symbol.iterator
    // https://github.com/vuetifyjs/vuetify/issues/2146
    const activeElements = [
      ...document.getElementsByClassName('v-menu__content--active'),
      ...document.getElementsByClassName('v-dialog__content--active'),
    ]

    // Get z-index for all active dialogs
    for (let index = 0; index < activeElements.length; index++) {
      if (!exclude.includes(activeElements[index])) {
        zis.push(getZIndex(activeElements[index]))
      }
    }

    return Math.max(...zis)
  }
  return {
    root,
    content,
    activeZIndex,
    getMaxZIndex,
  }
}
