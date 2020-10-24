import { ExtractPropTypes, reactive } from 'vue'

export const delayableProps = {
  openDelay: {
    type: [Number, String],
    default: 0,
  },
  closeDelay: {
    type: [Number, String],
    default: 0,
  },
  isActive: Boolean,
}

/**
 * Delayable
 *
 * @mixin
 *
 * Changes the open or close delay time for elements
 */
export default function useDelayable(props: ExtractPropTypes<typeof delayableProps>) {
  const data = reactive({
    openTimeout: undefined as number | undefined,
    closeTimeout: undefined as number | undefined,
  })

  /**
   * Clear any pending delay timers from executing
   */
  function clearDelay(): void {
    clearTimeout(data.openTimeout)
    clearTimeout(data.closeTimeout)
  }
  /**
   * Runs callback after a specified delay
   */
  function runDelay(type: 'open' | 'close', cb?: () => void): void {
    clearDelay()

    if (type === 'open') {
      const delay = parseInt(props.openDelay, 10)
      data.openTimeout = setTimeout(cb || (() => {
        props.isActive = { open: true, close: false }[type]
      }), delay)
    } else {
      const delay = parseInt(props.closeDelay, 10)
      data.closeTimeout = setTimeout(cb || (() => {
        props.isActive = { open: true, close: false }[type]
      }), delay)
    }
  }
  return {
    clearDelay,
    runDelay,
  }
}
