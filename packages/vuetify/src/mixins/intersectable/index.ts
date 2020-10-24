import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, onUnmounted } from 'vue'
// Directives
import Intersect from '../../directives/intersect'

// Utilities
import { consoleWarn } from '../../util/console'

// Types
import Vue from 'vue'

export function useIntersectable(options: { onVisible: string[] }) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // do nothing because intersection observer is not available
    return Vue.extend({ name: 'intersectable' })
  }

  onMounted(() => {
    Intersect.mounted!(this.$el as HTMLElement, {
      name: 'intersect',
      value: onObserve,
    })
  })
  onUnmounted(() => {
    Intersect.unbind(this.$el as HTMLElement)
  })
  function onObserve(entries: IntersectionObserverEntry[], observer: IntersectionObserver, isIntersecting: boolean) {
    if (!isIntersecting) return

    for (let i = 0, length = options.onVisible.length; i < length; i++) {
      const callback = (this as any)[options.onVisible[i]]

      if (typeof callback === 'function') {
        callback()
        continue
      }

      consoleWarn(options.onVisible[i] + ' method is not available on the instance but referenced in intersectable mixin options')
    }
  }
}
