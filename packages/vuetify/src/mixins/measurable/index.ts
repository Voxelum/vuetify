import { computed, ExtractPropTypes, PropType, Ref } from 'vue'
// Helpers
import { convertToUnit } from '../../util/helpers'

export const measurableProps = {
    height: [Number, String] as NumberOrNumberString,
    maxHeight: [Number, String] as NumberOrNumberString,
    maxWidth: [Number, String] as NumberOrNumberString,
    minHeight: [Number, String] as NumberOrNumberString,
    minWidth: [Number, String] as NumberOrNumberString,
    width: [Number, String] as NumberOrNumberString,
}

export type NumberOrNumberString = PropType<string | number | undefined>

export default function useMeasurable(props: ExtractPropTypes<typeof measurableProps>) {
    const measurableStyles: Ref<object> = computed(() => {
      const styles: Record<string, string> = {}

      const height = convertToUnit(props.height)
      const minHeight = convertToUnit(props.minHeight)
      const minWidth = convertToUnit(props.minWidth)
      const maxHeight = convertToUnit(props.maxHeight)
      const maxWidth = convertToUnit(props.maxWidth)
      const width = convertToUnit(props.width)

      if (height) styles.height = height
      if (minHeight) styles.minHeight = minHeight
      if (minWidth) styles.minWidth = minWidth
      if (maxHeight) styles.maxHeight = maxHeight
      if (maxWidth) styles.maxWidth = maxWidth
      if (width) styles.width = width

      return styles
    })
  return {
    measurableStyles,
  }
}
