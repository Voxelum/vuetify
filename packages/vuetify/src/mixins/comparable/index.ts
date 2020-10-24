import { PropType } from 'vue'
import { deepEqual } from '../../util/helpers'
export const comparableProps = {
  valueComparator: {
    type: Function as PropType<typeof deepEqual>,
    default: deepEqual,
  },
}
