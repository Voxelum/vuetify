import { computed, ExtractPropTypes, nextTick, SetupContext, watch } from 'vue'
import useColorable, { colorableProps } from '../../mixins/colorable'
// Extensions
import { useVSlideGroup, VSlideGroupProps } from '../VSlideGroup/VSlideGroup'
// Styles
import './VChipGroup.sass'

// Utilities

export const VChipGroupProps = {
  ...VSlideGroupProps,
  ...colorableProps,
  column: Boolean,
}

/* @vue/component */
export function useVChipGroup(props: ExtractPropTypes<typeof VChipGroupProps>, context: SetupContext) {
  const { setTextColor } = useColorable(context)
  const { onResize, genData: sliderGroupGenData, classes: slideGroupClasses, scrollOffset } = useVSlideGroup(props, context)
  const classes = computed(() => {
    return {
      ...slideGroupClasses.value,
      'v-chip-group': true,
      'v-chip-group--column': props.column,
    }
  })

  watch(() => props.column, (val) => {
    if (val) scrollOffset.value = 0
    nextTick(onResize)
  })

  function genData() {
    return setTextColor(props.color, {
      ...sliderGroupGenData(),
    })
  }
  return {
    classes,
    genData,
  }
}
