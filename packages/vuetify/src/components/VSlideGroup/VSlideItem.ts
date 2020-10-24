// Extensions
import { ExtractPropTypes, SetupContext } from 'vue'
// Mixins
import { groupableFactory } from '../../mixins/groupable'
import { VItemProps } from '../VItemGroup/VItem'


const { groupableProps, useGroupable } = groupableFactory('slideGroup')

export const VSlideItemProps = {
  ...VItemProps,
  ...groupableProps,
}

export function useVSlideItem(props: ExtractPropTypes<typeof VSlideItemProps>, context: SetupContext) {
  return useGroupable(props, context)
}

