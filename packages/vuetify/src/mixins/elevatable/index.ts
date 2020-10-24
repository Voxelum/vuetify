import { computed, ExtractPropTypes, Ref } from 'vue'
export const elevatableProps = {
    elevation: [Number, String],
}

export default function useElevatable(props: ExtractPropTypes<typeof elevatableProps>) {
    const computedElevation: Ref<string | number | undefined> = computed(() => {
      return props.elevation
    })
    const elevationClasses: Ref<Record<string, boolean>> = computed(() => {
      const elevation = computedElevation.value

      if (elevation == null) return {}
      if (isNaN(parseInt(elevation))) return {}
      return { [`elevation-${props.elevation}`]: true }
    })
  return {
    computedElevation,
    elevationClasses,
  }
}
