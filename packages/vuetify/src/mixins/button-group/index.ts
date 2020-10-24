import { ExtractPropTypes, provide, SetupContext } from 'vue'
// Extensions
import { useVItemGroup, VItemGroupProps } from '../../components/VItemGroup/VItemGroup'

/* @vue/component */
export function useButtonGroup(props: ExtractPropTypes<typeof VItemGroupProps>, context: SetupContext) {
  const { genData, classes, ...itemGroup } = useVItemGroup(props, context)
  provide('btnToggle', {
    genData, classes
  })
  return {
    genData,
    classes,
    ...itemGroup,
  }
}
