import { computed, ExtractPropTypes, nextTick, onMounted, reactive, Ref, watch } from 'vue'
// Directives
import { Scroll } from '../../directives'
// Utilities
import { consoleWarn } from '../../util/console'


export const scrollableProps = {
  scrollTarget: String,
  scrollThreshold: [String, Number],
}

export const scrollableDirective = { Scroll }

/**
 * Scrollable
 *
 * Used for monitoring scrolling and
 * invoking functions based upon
 * scrolling thresholds being
 * met.
 */
/* @vue/component */
export default function useScrollable(props: ExtractPropTypes<typeof scrollableProps>) {
  const data = reactive({
    currentScroll: 0,
    currentThreshold: 0,
    isActive: false,
    isScrollingUp: false,
    previousScroll: 0,
    savedScroll: 0,
    target: null as Element | null,
  })

  /*
   * A computed property that returns
   * whether scrolling features are
   * enabled or disabled
   */
  const canScroll: Ref<boolean> = computed(() => {
    return typeof window !== 'undefined'
  })
  /*
   * The threshold that must be met before
   * thresholdMet function is invoked
   */
  const computedScrollThreshold: Ref<number> = computed(() => {
    return props.scrollThreshold
      ? Number(props.scrollThreshold)
      : 300
  })

  watch(() => data.isScrollingUp, () => {
    data.savedScroll = data.savedScroll || data.currentScroll
  })
  watch(() => data.isActive, () => {
    data.savedScroll = 0
  })

  onMounted(() => {
    if (props.scrollTarget) {
      data.target = document.querySelector(props.scrollTarget)

      if (!data.target) {
        consoleWarn(`Unable to locate element with identifier ${props.scrollTarget}`, this)
      }
    }
  })

  function onScroll() {
    if (!canScroll.value) return

    data.previousScroll = data.currentScroll
    data.currentScroll = data.target
      ? data.target.scrollTop
      : window.pageYOffset

    data.isScrollingUp = data.currentScroll < data.previousScroll
    data.currentThreshold = Math.abs(data.currentScroll - computedScrollThreshold.value)

    nextTick(() => {
      if (
        Math.abs(data.currentScroll - data.savedScroll) >
        computedScrollThreshold.value
      ) thresholdMet()
    })
  }
  /**
   * The method invoked when
   * scrolling in any direction
   * has exceeded the threshold
   */
  function thresholdMet() { /* noop */ }

  return {
    canScroll,
    computedScrollThreshold,
    onScroll,
    thresholdMet,
  }
}
