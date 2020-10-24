import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
import './VSimpleTable.sass'

import { convertToUnit } from '../../util/helpers'
import Themeable from '../../mixins/themeable'
import mixins from '../../util/mixins'
import { VNode } from 'vue'
export const VSimpleTableProps = {
    dense: Boolean,
    fixedHeader: Boolean,
    height: [Number, String],
}

export function useVSimpleTable(props: ExtractPropTypes<typeof VSimpleTableProps>, context: SetupContext) {


    const classes: Ref<Record<string, boolean>> = computed(() => {
      return {
        'v-data-table--dense': props.dense,
        'v-data-table--fixed-height': !!props.height && !props.fixedHeader,
        'v-data-table--fixed-header': props.fixedHeader,
        ...props.themeClasses,
      }
    })

  function genWrapper () {
      return context.slots.wrapper || context.createElement('div', {
        staticClass: 'v-data-table__wrapper',
        style: {
          height: convertToUnit(props.height),
        },
      }, [
        context.createElement('table', context.slots.default),
      ])
    }

  return {
    classes,
    genWrapper,
  }
}
const VSimpleTable = defineComponent({
  name: 'v-simple-table',
  props: VSimpleTableProps,
  setup(props, context) {
    const {} = useVSimpleTable(props, context)
    return h('div', {
      staticClass: 'v-data-table',
      class: classes.value,
    }, [
      context.slots.top,
      genWrapper(),
      context.slots.bottom,
    ])
  },
})

export default VSimpleTable

