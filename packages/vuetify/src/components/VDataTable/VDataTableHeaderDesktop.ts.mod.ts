import { Ref, reactive, onMounted, computed, onBeforeUnmount, ExtractPropTypes, defineComponent, h, SetupContext } from 'vue'
// Helpers
import { VNode, VNodeData } from 'vue'
import mixins from '../../util/mixins'
import header from './mixins/header'
import { wrapInArray, convertToUnit } from '../../util/helpers'
import { DataTableHeader } from 'vuetify/types'
export const VDataTableHeaderDesktopProps = {
}

export function useVDataTableHeaderDesktop(props: ExtractPropTypes<typeof VDataTableHeaderDesktopProps>, context: SetupContext) {

  function genGroupByToggle (header: DataTableHeader) {
      return context.createElement('span', {
        on: {
          click: (e: MouseEvent) => {
            e.stopPropagation()
            context.emit('group', header.value)
          },
        },
      }, ['group'])
    }
  function getAria (beingSorted: boolean, isDesc: boolean) {
      const $t = (key: string) => context.vuetify.lang.t(`$vuetify.dataTable.ariaLabel.${key}`)

      let ariaSort = 'none'
      let ariaLabel = [
        $t('sortNone'),
        $t('activateAscending'),
      ]

      if (!beingSorted) {
        return { ariaSort, ariaLabel: ariaLabel.join(' ') }
      }

      if (isDesc) {
        ariaSort = 'descending'
        ariaLabel = [
          $t('sortDescending'),
          $t(props.options.mustSort ? 'activateAscending' : 'activateNone'),
        ]
      } else {
        ariaSort = 'ascending'
        ariaLabel = [
          $t('sortAscending'),
          $t('activateDescending'),
        ]
      }

      return { ariaSort, ariaLabel: ariaLabel.join(' ') }
    }
  function genHeader (header: DataTableHeader) {
      const data: Required<Pick<VNodeData, 'attrs' | 'on' | 'class' | 'style'>> = {
        attrs: {
          role: 'columnheader',
          scope: 'col',
          'aria-label': header.text || '',
        },
        style: {
          width: convertToUnit(header.width),
          minWidth: convertToUnit(header.width),
        },
        class: [
          `text-${header.align || 'start'}`,
          ...wrapInArray(header.class),
          header.divider && 'v-data-table__divider',
        ],
        on: {},
      }
      const children = []

      if (header.value === 'data-table-select' && !props.singleSelect) {
        return context.createElement('th', data, [props.genSelectAll()])
      }

      children.push(
        context.scopedSlots[header.value]
          ? context.scopedSlots[header.value]!({ header })
          : context.createElement('span', [header.text])
      )

      if (!props.disableSort && (header.sortable || !header.hasOwnProperty('sortable'))) {
        data.on['click'] = () => context.emit('sort', header.value)

        const sortIndex = props.options.sortBy.findIndex(k => k === header.value)
        const beingSorted = sortIndex >= 0
        const isDesc = props.options.sortDesc[sortIndex]

        data.class.push('sortable')

        const { ariaLabel, ariaSort } = getAria(beingSorted, isDesc)

        data.attrs['aria-label'] += `${header.text ? ': ' : ''}${ariaLabel}`
        data.attrs['aria-sort'] = ariaSort

        if (beingSorted) {
          data.class.push('active')
          data.class.push(isDesc ? 'desc' : 'asc')
        }

        if (header.align === 'end') children.unshift(props.genSortIcon())
        else children.push(props.genSortIcon())

        if (props.options.multiSort && beingSorted) {
          children.push(context.createElement('span', { class: 'v-data-table-header__sort-badge' }, [String(sortIndex + 1)]))
        }
      }

      if (props.showGroupBy && header.groupable !== false) children.push(genGroupByToggle(header))

      return context.createElement('th', data, children)
    }

  return {
    genGroupByToggle,
    getAria,
    genHeader,
  }
}
const VDataTableHeaderDesktop = defineComponent({
  name: 'v-data-table-header-desktop',
  props: VDataTableHeaderDesktopProps,
  setup(props, context) {
    const {} = useVDataTableHeaderDesktop(props, context)
  },
})

export default VDataTableHeaderDesktop

