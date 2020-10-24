import { computed, ExtractPropTypes, Ref } from 'vue'

export const roundableProps = {
  rounded: [Boolean, String],
  tile: Boolean,
}

function roundableClasses(props: ExtractPropTypes<typeof roundableProps>) {
  const composite = []
  const rounded = typeof props.rounded === 'string'
    ? String(props.rounded)
    : props.rounded === true

  if (props.tile) {
    composite.push('rounded-0')
  } else if (typeof rounded === 'string') {
    const values = rounded.split(' ')

    for (const value of values) {
      composite.push(`rounded-${value}`)
    }
  } else if (rounded) {
    composite.push('rounded')
  }
  return composite.length > 0 ? {
    [composite.join(' ')]: true,
  } : {}
}

export function roundable(props: ExtractPropTypes<typeof roundableProps>) {
  return {
    class: roundableClasses(props)
  }
}

/* @vue/component */
export default function useRoundable(props: ExtractPropTypes<typeof roundableProps>) {
  const roundedClasses: Ref<Record<string, boolean>> = computed(() => roundableClasses(props))
  return {
    roundedClasses,
  }
}
