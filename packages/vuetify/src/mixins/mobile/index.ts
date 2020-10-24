import { useVuetify } from 'types'
import { computed, ExtractPropTypes, PropType, Ref, SetupContext } from 'vue'
// Types
import { BreakpointName } from 'types/services/breakpoint'
import { deprecate } from '../../util/console'

export const mobileProps = {
  mobileBreakpoint: {
    type: [Number, String] as PropType<BreakpointName>,
    default(): BreakpointName | undefined {
      // Avoid destroying unit
      // tests for users
      const vuetify = useVuetify()
      return vuetify
        ? vuetify.breakpoint.mobileBreakpoint
        : undefined
    },
    validator: (v: any) => (
      !isNaN(Number(v)) ||
      ['xs', 'sm', 'md', 'lg', 'xl'].includes(String(v))
    ),
  },
}

/* @vue/component */
export default function useMobile(props: ExtractPropTypes<typeof mobileProps>, context: SetupContext) {
  const isMobile: Ref<boolean> = computed(() => {
    const {
      mobile,
      width,
      name,
      mobileBreakpoint,
    } = useVuetify().breakpoint

    // TODO: fix this

    // Check if local mobileBreakpoint matches
    // the application's mobileBreakpoint
    if (mobileBreakpoint === props.mobileBreakpoint) return mobile

    const mobileWidth = parseInt(props.mobileBreakpoint, 10)
    const isNumber = !isNaN(mobileWidth)

    return isNumber
      ? width < mobileWidth
      : name === props.mobileBreakpoint
  })

  /* istanbul ignore next */
  if (context.attrs.hasOwnProperty('mobile-break-point')) {
    deprecate('mobile-break-point', 'mobile-breakpoint', context)
  }
  return {
    isMobile,
  }
}
