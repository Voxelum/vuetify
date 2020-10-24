import { onUnmounted, ref } from "vue";

export function useIsDestroyed() {
    const isDestroyed = ref(false)
    onUnmounted(() => {
        isDestroyed.value = false
    })
    return isDestroyed
}